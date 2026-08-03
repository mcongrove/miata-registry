/**
 * Miata Registry
 * Copyright (C) 2024-2026 Matthew Congrove
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { ClerkClient } from '@clerk/backend';
import { KVNamespace } from '@cloudflare/workers-types';
import { and, eq, sql } from 'drizzle-orm';
import { Resend } from 'resend';
import { DrizzleDb } from '../../db';
import { CarOwners } from '../../db/schema/CarOwners';
import { CarOwnersPending } from '../../db/schema/CarOwnersPending';
import { Cars } from '../../db/schema/Cars';
import { CarsPending } from '../../db/schema/CarsPending';
import { Editions } from '../../db/schema/Editions';
import { Owners } from '../../db/schema/Owners';
import { OwnersPending } from '../../db/schema/OwnersPending';
import ApprovedCar from '../../emails/templates/ApprovedCar';
import { invalidateSeoCaches } from '../../seo/cache';
import { buildVinDecodeFields } from '../../utils/car';
import {
	applyPriorOwnerPendingApproval,
	parsePriorOwnerIntent,
} from './priorOwnerPending';
import { recalculateAndStoreCarRarity } from './recalculateCarRarity';
import { renderEmail } from './renderEmail';

export async function invalidateCarCaches(
	cache: KVNamespace,
	carId: string,
	options: { editionsAndStats?: boolean } = {}
) {
	await cache.delete(`cars:details:${carId}`);
	await cache.delete(`cars:summary:${carId}`);

	if (options.editionsAndStats !== false) {
		await cache.delete('editions:all:v3');
		await cache.delete('stats:all');
		await invalidateSeoCaches(cache);
	}
}

export async function sendApprovedCarEmail({
	carId,
	clerk,
	resendApiKey,
	userId,
}: {
	carId: string;
	clerk: ClerkClient;
	resendApiKey: string;
	userId: string;
}) {
	const requestingUser = await clerk.users.getUser(userId);
	const primaryEmail = requestingUser.emailAddresses.find(
		(email) => email.id === requestingUser.primaryEmailAddressId
	);

	if (!primaryEmail) return;

	const resend = new Resend(resendApiKey);

	await resend.emails.send({
		from: 'Miata Registry <no-reply@miataregistry.com>',
		to: primaryEmail.emailAddress,
		subject: 'Miata Registry: Submission approved',
		html: await renderEmail(ApprovedCar({ car_id: carId })),
	});
}

const normalizeInstagramHandle = (
	value: string | null | undefined
): string | null => {
	if (value == null) return null;

	const handle = value.trim().replace(/^@+/, '');

	return handle || null;
};

/** owners_pending.links is text; owners.links is JSON blob — normalize either shape. */
export const parseOwnerLinks = (
	raw: unknown
): { instagram: string | null } | null => {
	if (raw == null || raw === '') return null;

	let parsed: unknown = raw;

	if (typeof raw === 'string') {
		try {
			parsed = JSON.parse(raw);
		} catch {
			return null;
		}
	}

	if (!parsed || typeof parsed !== 'object') return null;

	const instagram = normalizeInstagramHandle(
		(parsed as { instagram?: string | null }).instagram
	);

	return { instagram };
};

const ownerLinksPendingValue = (instagram: string | null): string | null =>
	instagram ? JSON.stringify({ instagram }) : null;

export async function approvePendingOwner(db: DrizzleDb, pendingId: string) {
	const pendingOwner = await db
		.select()
		.from(OwnersPending)
		.where(eq(OwnersPending.id, pendingId))
		.get();

	if (!pendingOwner) {
		return null;
	}

	const {
		created_at: _created_at,
		status: _status,
		links: rawLinks,
		...ownerData
	} = pendingOwner;

	await db.insert(Owners).values({
		...ownerData,
		links: parseOwnerLinks(rawLinks),
	});

	await db
		.update(OwnersPending)
		.set({ status: 'approved' })
		.where(eq(OwnersPending.id, pendingId));

	return {
		ownerId: pendingOwner.id,
		userId: pendingOwner.user_id,
	};
}

export async function approvePendingCar(
	db: DrizzleDb,
	pendingId: string,
	cache: KVNamespace
) {
	const pendingCar = await db
		.select({
			car_id: CarsPending.car_id,
			color: CarsPending.color,
			created_at: CarsPending.created_at,
			current_owner_id: CarsPending.current_owner_id,
			destroyed: CarsPending.destroyed,
			edition_id: CarsPending.edition_id,
			id: CarsPending.id,
			manufacture_city: CarsPending.manufacture_city,
			manufacture_date: CarsPending.manufacture_date,
			manufacture_prefecture: CarsPending.manufacture_prefecture,
			mileage: CarsPending.mileage,
			mileage_date: CarsPending.mileage_date,
			sale_date: CarsPending.sale_date,
			sale_dealer_city: CarsPending.sale_dealer_city,
			sale_dealer_country: CarsPending.sale_dealer_country,
			sale_dealer_name: CarsPending.sale_dealer_name,
			sale_dealer_state: CarsPending.sale_dealer_state,
			sale_msrp: CarsPending.sale_msrp,
			sequence: CarsPending.sequence,
			shipping_city: CarsPending.shipping_city,
			shipping_country: CarsPending.shipping_country,
			shipping_date: CarsPending.shipping_date,
			shipping_state: CarsPending.shipping_state,
			shipping_vessel: CarsPending.shipping_vessel,
			story: CarsPending.story,
			status: CarsPending.status,
			vin: CarsPending.vin,
			vin_decode_status: CarsPending.vin_decode_status,
			vin_details: CarsPending.vin_details,
			user_id: Owners.user_id,
		})
		.from(CarsPending)
		.leftJoin(Owners, eq(CarsPending.current_owner_id, Owners.id))
		.where(eq(CarsPending.id, pendingId))
		.get();

	if (!pendingCar) {
		return null;
	}

	const {
		created_at: _created_at,
		id: _pendingId,
		status: _status,
		car_id,
		user_id,
		...carData
	} = pendingCar;

	if (typeof carData.vin === 'string' && carData.vin) {
		carData.vin = carData.vin.toUpperCase();
	}

	if (carData.vin && carData.vin_decode_status == null) {
		const edition = await db
			.select({ year: Editions.year })
			.from(Editions)
			.where(eq(Editions.id, carData.edition_id))
			.get();

		const decoded = await buildVinDecodeFields(carData.vin, edition?.year);

		if (decoded) {
			Object.assign(carData, decoded);
		}
	}

	// color is owners-log (not moderated); omit from conflict updates so
	// pending car edits don't wipe a live cars.color value
	const { color: _pendingColor, ...carDataWithoutColor } = carData;

	await db
		.insert(Cars)
		.values({ id: car_id, ...carData })
		.onConflictDoUpdate({
			target: Cars.id,
			set: carDataWithoutColor,
		});

	await db
		.update(CarsPending)
		.set({ status: 'approved' })
		.where(eq(CarsPending.id, pendingId));

	await recalculateAndStoreCarRarity(db, car_id);
	await invalidateCarCaches(cache, car_id);

	return { carId: car_id, userId: user_id };
}

export async function approvePendingCarOwner(
	db: DrizzleDb,
	pendingId: string,
	cache: KVNamespace
) {
	const pendingCarOwner = await db
		.select({
			car_id: CarOwnersPending.car_id,
			created_at: CarOwnersPending.created_at,
			date_end: CarOwnersPending.date_end,
			date_start: CarOwnersPending.date_start,
			id: CarOwnersPending.id,
			information: CarOwnersPending.information,
			owner_id: CarOwnersPending.owner_id,
			status: CarOwnersPending.status,
			user_id: Owners.user_id,
		})
		.from(CarOwnersPending)
		.leftJoin(Owners, eq(CarOwnersPending.owner_id, Owners.id))
		.where(eq(CarOwnersPending.id, pendingId))
		.get();

	if (!pendingCarOwner) {
		return null;
	}

	const priorOwnerIntent = parsePriorOwnerIntent(pendingCarOwner.information);

	if (priorOwnerIntent) {
		const {
			created_at: _created_at,
			id: _pendingId,
			information,
			status: _status,
			user_id: _user_id,
			...pendingRow
		} = pendingCarOwner;

		await applyPriorOwnerPendingApproval(
			db,
			{ ...pendingRow, information },
			priorOwnerIntent
		);

		await db
			.update(CarOwnersPending)
			.set({ status: 'approved' })
			.where(eq(CarOwnersPending.id, pendingId));

		await recalculateAndStoreCarRarity(db, pendingCarOwner.car_id);
		await invalidateCarCaches(cache, pendingCarOwner.car_id);

		return {
			carId: pendingCarOwner.car_id,
			userId: pendingCarOwner.user_id,
		};
	}

	const {
		created_at: _created_at,
		id: _pendingId,
		information: _information,
		status: _status,
		user_id,
		...carOwnerData
	} = pendingCarOwner;

	const existingCarOwner = await db
		.select()
		.from(CarOwners)
		.where(
			and(
				eq(CarOwners.car_id, pendingCarOwner.car_id),
				eq(CarOwners.owner_id, pendingCarOwner.owner_id)
			)
		)
		.get();

	if (existingCarOwner) {
		await db
			.update(CarOwners)
			.set(carOwnerData)
			.where(
				and(
					eq(CarOwners.car_id, pendingCarOwner.car_id),
					eq(CarOwners.owner_id, pendingCarOwner.owner_id)
				)
			);
	} else {
		await db
			.update(CarOwners)
			.set({ date_end: pendingCarOwner.date_start })
			.where(
				and(
					eq(CarOwners.car_id, pendingCarOwner.car_id),
					sql`${CarOwners.date_end} IS NULL`
				)
			);

		await db.insert(CarOwners).values(carOwnerData);

		await db
			.update(Cars)
			.set({
				current_owner_id: pendingCarOwner.owner_id,
				updated_date: new Date(
					pendingCarOwner.created_at * 1000
				).toISOString(),
			})
			.where(eq(Cars.id, pendingCarOwner.car_id));
	}

	await db
		.update(CarOwnersPending)
		.set({ status: 'approved' })
		.where(eq(CarOwnersPending.id, pendingId));

	await invalidateCarCaches(cache, pendingCarOwner.car_id);

	return {
		carId: pendingCarOwner.car_id,
		userId: user_id,
	};
}

export type PackageApproveOverrides = {
	owner?: {
		city?: string | null;
		country?: string | null;
		instagram?: string | null;
		name?: string | null;
		state?: string | null;
	};
	car?: {
		mileage?: number | null;
		story?: string | null;
	};
};

export async function approvePendingPackage(
	db: DrizzleDb,
	carOwnerPendingId: string,
	cache: KVNamespace,
	overrides?: PackageApproveOverrides
) {
	const pendingCarOwner = await db
		.select()
		.from(CarOwnersPending)
		.where(
			and(
				eq(CarOwnersPending.id, carOwnerPendingId),
				eq(CarOwnersPending.status, 'pending')
			)
		)
		.get();

	if (!pendingCarOwner) {
		return null;
	}

	const pendingOwner = await db
		.select({ id: OwnersPending.id, user_id: OwnersPending.user_id })
		.from(OwnersPending)
		.where(
			and(
				eq(OwnersPending.id, pendingCarOwner.owner_id),
				eq(OwnersPending.status, 'pending')
			)
		)
		.get();

	if (overrides?.owner && pendingOwner) {
		const instagram =
			overrides.owner.instagram !== undefined
				? normalizeInstagramHandle(overrides.owner.instagram)
				: undefined;

		const ownerPatch: {
			city?: string | null;
			country?: string | null;
			links?: { instagram: string | null } | null;
			name?: string | null;
			state?: string | null;
		} = {
			...(overrides.owner.name !== undefined
				? { name: overrides.owner.name }
				: {}),
			...(overrides.owner.city !== undefined
				? { city: overrides.owner.city }
				: {}),
			...(overrides.owner.state !== undefined
				? { state: overrides.owner.state }
				: {}),
			...(overrides.owner.country !== undefined
				? { country: overrides.owner.country }
				: {}),
		};

		if (instagram !== undefined) {
			// Column is text; store JSON string (typed as object for Drizzle $type)
			ownerPatch.links = ownerLinksPendingValue(instagram) as unknown as {
				instagram: string | null;
			} | null;
		}

		if (Object.keys(ownerPatch).length > 0) {
			await db
				.update(OwnersPending)
				.set(ownerPatch)
				.where(eq(OwnersPending.id, pendingOwner.id));
		}
	}

	const pendingCar = await db
		.select({ id: CarsPending.id })
		.from(CarsPending)
		.where(
			and(
				eq(CarsPending.car_id, pendingCarOwner.car_id),
				eq(CarsPending.status, 'pending')
			)
		)
		.get();

	let userId: string | null = pendingOwner?.user_id ?? null;

	if (pendingOwner) {
		const approvedOwner = await approvePendingOwner(db, pendingOwner.id);

		userId = approvedOwner?.userId ?? userId;
	} else if (overrides?.owner?.instagram !== undefined) {
		const instagram = normalizeInstagramHandle(overrides.owner.instagram);
		const linksJson = JSON.stringify({ instagram });

		await db
			.update(Owners)
			.set({
				links: instagram ? sql`json(${linksJson})` : null,
			})
			.where(eq(Owners.id, pendingCarOwner.owner_id));

		const ownedCars = await db
			.select({ id: Cars.id })
			.from(Cars)
			.where(eq(Cars.current_owner_id, pendingCarOwner.owner_id));

		await Promise.all(
			ownedCars.flatMap((car) => [
				cache.delete(`cars:details:${car.id}`),
				cache.delete(`cars:summary:${car.id}`),
			])
		);
	}

	if (overrides?.car) {
		const carPatch: {
			mileage?: number | null;
			mileage_date?: string | null;
			story?: string | null;
		} = {};

		if (overrides.car.mileage !== undefined) {
			carPatch.mileage = overrides.car.mileage;

			if (overrides.car.mileage != null) {
				carPatch.mileage_date = `${new Date().toISOString().split('T')[0]}T00:00:00.000Z`;
			}
		}

		if (overrides.car.story !== undefined) {
			carPatch.story = overrides.car.story;
		}

		if (Object.keys(carPatch).length > 0) {
			if (pendingCar) {
				await db
					.update(CarsPending)
					.set(carPatch)
					.where(eq(CarsPending.id, pendingCar.id));
			} else {
				await db
					.update(Cars)
					.set(carPatch)
					.where(eq(Cars.id, pendingCarOwner.car_id));

				await invalidateCarCaches(cache, pendingCarOwner.car_id);
			}
		}
	}

	if (pendingCar) {
		const approvedCar = await approvePendingCar(db, pendingCar.id, cache);

		userId = approvedCar?.userId ?? userId;
	}

	const approvedCarOwner = await approvePendingCarOwner(
		db,
		pendingCarOwner.id,
		cache
	);

	if (!approvedCarOwner) {
		return null;
	}

	userId = approvedCarOwner.userId ?? userId;

	if (!userId) {
		const owner = await db
			.select({ user_id: Owners.user_id })
			.from(Owners)
			.where(eq(Owners.id, pendingCarOwner.owner_id))
			.get();

		userId = owner?.user_id ?? null;
	}

	return {
		carId: approvedCarOwner.carId,
		userId,
	};
}

export async function rejectPendingPackage(
	db: DrizzleDb,
	carOwnerPendingId: string,
	cache: KVNamespace
) {
	const pendingCarOwner = await db
		.select()
		.from(CarOwnersPending)
		.where(
			and(
				eq(CarOwnersPending.id, carOwnerPendingId),
				eq(CarOwnersPending.status, 'pending')
			)
		)
		.get();

	if (!pendingCarOwner) {
		return null;
	}

	const pendingOwner = await db
		.select({ id: OwnersPending.id })
		.from(OwnersPending)
		.where(
			and(
				eq(OwnersPending.id, pendingCarOwner.owner_id),
				eq(OwnersPending.status, 'pending')
			)
		)
		.get();

	const pendingCar = await db
		.select({ id: CarsPending.id })
		.from(CarsPending)
		.where(
			and(
				eq(CarsPending.car_id, pendingCarOwner.car_id),
				eq(CarsPending.status, 'pending')
			)
		)
		.get();

	if (pendingOwner) {
		await db
			.update(OwnersPending)
			.set({ status: 'rejected' })
			.where(eq(OwnersPending.id, pendingOwner.id));
	}

	if (pendingCar) {
		await db
			.update(CarsPending)
			.set({ status: 'rejected' })
			.where(eq(CarsPending.id, pendingCar.id));
	}

	await db
		.update(CarOwnersPending)
		.set({ status: 'rejected' })
		.where(eq(CarOwnersPending.id, pendingCarOwner.id));

	await invalidateCarCaches(cache, pendingCarOwner.car_id, {
		editionsAndStats: false,
	});

	return { carId: pendingCarOwner.car_id };
}
