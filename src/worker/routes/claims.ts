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

import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { createDb } from '../../db';
import {
	CarOwnersPending,
	Cars,
	CarsPending,
	Editions,
	Owners,
	OwnersPending,
} from '../../db/schema';
import {
	buildVinDecodeFields,
	normalizeVinInput,
	parseEditionYear,
	parseSequence,
} from '../../utils/car';
import { ownerLocationFromClaimBody } from '../../utils/location';
import { withAuth } from '../middleware/auth';
import type { Bindings } from '../types';
import { formatEditionLabel, notifyModerator } from '../utils/notifyModerator';

function parseClaimMileage(body: {
	mileage?: unknown;
}): { mileage: number; mileage_date: string } | null {
	if (
		body.mileage === undefined ||
		body.mileage === null ||
		body.mileage === ''
	) {
		return null;
	}

	const mileage = Number(body.mileage);

	if (!Number.isFinite(mileage) || mileage < 0) {
		return null;
	}

	return {
		mileage: Math.round(mileage),
		mileage_date: `${new Date().toISOString().split('T')[0]}T00:00:00.000Z`,
	};
}

const claimsRouter = new Hono<{ Bindings: Bindings }>();

async function updateOwnerProfileAndInvalidateCars(
	db: ReturnType<typeof createDb>,
	cache: Bindings['CACHE'],
	ownerId: string,
	userId: string,
	body: {
		owner_name: string;
		owner_city?: string;
		owner_state?: string;
		owner_country?: string;
	}
) {
	const ownerLocation = ownerLocationFromClaimBody(body);

	await db
		.update(Owners)
		.set({
			city: ownerLocation.city || null,
			country: ownerLocation.country || null,
			name: body.owner_name,
			state: ownerLocation.state || null,
		})
		.where(and(eq(Owners.id, ownerId), eq(Owners.user_id, userId)));

	const ownedCars = await db
		.select({ id: Cars.id })
		.from(Cars)
		.where(eq(Cars.current_owner_id, ownerId));

	await Promise.all(
		ownedCars.flatMap((car) => [
			cache.delete(`cars:details:${car.id}`),
			cache.delete(`cars:summary:${car.id}`),
		])
	);
}

claimsRouter.post('/existing', withAuth(), async (c) => {
	try {
		const userId = c.get('userId');
		const user = await c.get('clerk').users.getUser(userId);
		const body = await c.req.json();
		const db = createDb(c.env.DB);
		let ownerId = body.owner_id;

		const existingCar = await db
			.select()
			.from(Cars)
			.where(eq(Cars.id, body.car_id))
			.get();

		if (!existingCar) {
			return c.json(
				{
					error: 'Not Found',
					details: 'Car not found',
				},
				404
			);
		}

		const existingOwner = await db
			.select({ id: Owners.id })
			.from(Owners)
			.where(eq(Owners.user_id, userId));

		if (!ownerId) {
			if (existingOwner.length > 0) {
				return c.json(
					{
						error: 'Conflict',
						details: 'An owner already exists for this user',
					},
					409
				);
			}

			ownerId = crypto.randomUUID();

			const ownerLocation = ownerLocationFromClaimBody(body);

			await db.insert(OwnersPending).values({
				city: ownerLocation.city || null,
				country: ownerLocation.country || null,
				created_at: Math.floor(Date.now() / 1000),
				id: ownerId,
				name: body.owner_name,
				state: ownerLocation.state || null,
				status: 'pending',
				user_id: userId,
			});
		} else {
			await updateOwnerProfileAndInvalidateCars(
				db,
				c.env.CACHE,
				ownerId,
				userId,
				body
			);
		}

		await db.insert(CarOwnersPending).values({
			car_id: body.car_id,
			created_at: Math.floor(Date.now() / 1000),
			date_start: `${body.owner_date_start}T00:00:00.000Z`,
			id: crypto.randomUUID(),
			information: body.information || null,
			owner_id: ownerId,
			status: 'pending',
		});

		const claimMileage = parseClaimMileage(body);

		if (claimMileage) {
			await db.insert(CarsPending).values({
				car_id: existingCar.id,
				created_at: Math.floor(Date.now() / 1000),
				current_owner_id: existingCar.current_owner_id,
				destroyed: existingCar.destroyed,
				edition_id: existingCar.edition_id,
				id: crypto.randomUUID(),
				manufacture_city: existingCar.manufacture_city,
				manufacture_date: existingCar.manufacture_date,
				manufacture_prefecture: existingCar.manufacture_prefecture,
				mileage: claimMileage.mileage,
				mileage_date: claimMileage.mileage_date,
				sale_date: existingCar.sale_date,
				sale_dealer_city: existingCar.sale_dealer_city,
				sale_dealer_country: existingCar.sale_dealer_country,
				sale_dealer_name: existingCar.sale_dealer_name,
				sale_dealer_state: existingCar.sale_dealer_state,
				sale_msrp: existingCar.sale_msrp,
				sequence: existingCar.sequence,
				shipping_city: existingCar.shipping_city,
				shipping_country: existingCar.shipping_country,
				shipping_date: existingCar.shipping_date,
				shipping_state: existingCar.shipping_state,
				shipping_vessel: existingCar.shipping_vessel,
				story: existingCar.story,
				status: 'pending',
				vin: existingCar.vin,
				vin_decode_status: existingCar.vin_decode_status,
				vin_details: existingCar.vin_details,
			});
		}

		if (`${user.firstName} ${user.lastName}` !== body.owner_name) {
			await c.get('clerk').users.updateUser(userId, {
				firstName: body.owner_name.split(' ')[0],
				lastName: body.owner_name.split(' ')[1],
			});
		}

		const edition = await db
			.select({ year: Editions.year, name: Editions.name })
			.from(Editions)
			.where(eq(Editions.id, existingCar.edition_id))
			.get();

		await notifyModerator(c.env.RESEND_API_KEY, {
			kind: 'ownership_claim',
			edition: formatEditionLabel(edition?.year, edition?.name),
		});

		return c.json({ success: true, id: ownerId });
	} catch (error) {
		console.error('Error creating owner:', error);

		return c.json(
			{
				error: 'Internal server error',
				details:
					error instanceof Error
						? error.message
						: 'An unknown error occurred',
			},
			501
		);
	}
});

claimsRouter.post('/new', withAuth(), async (c) => {
	try {
		const userId = c.get('userId');
		const user = await c.get('clerk').users.getUser(userId);
		const body = await c.req.json();
		const db = createDb(c.env.DB);
		const carId = crypto.randomUUID();
		let ownerId = body.owner_id;
		const vin =
			typeof body.vin === 'string' && body.vin
				? normalizeVinInput(body.vin)
				: body.vin;

		const existingCar = await db
			.select()
			.from(Cars)
			.where(eq(Cars.vin, vin))
			.get();

		if (existingCar) {
			return c.json(
				{
					error: 'Conflict',
					details: {
						id: existingCar.id,
					},
				},
				409
			);
		}

		const existingOwner = await db
			.select({ id: Owners.id })
			.from(Owners)
			.where(eq(Owners.user_id, userId));

		if (!ownerId) {
			if (existingOwner.length > 0) {
				return c.json(
					{
						error: 'Conflict',
						details: 'An owner already exists for this user',
					},
					409
				);
			}

			ownerId = crypto.randomUUID();

			const ownerLocation = ownerLocationFromClaimBody(body);

			await db.insert(OwnersPending).values({
				city: ownerLocation.city || null,
				country: ownerLocation.country || null,
				created_at: Math.floor(Date.now() / 1000),
				id: ownerId,
				name: body.owner_name,
				state: ownerLocation.state || null,
				status: 'pending',
				user_id: userId,
			});
		} else {
			await updateOwnerProfileAndInvalidateCars(
				db,
				c.env.CACHE,
				ownerId,
				userId,
				body
			);
		}

		await db.insert(CarOwnersPending).values({
			car_id: carId,
			created_at: Math.floor(Date.now() / 1000),
			date_start: `${body.owner_date_start}T00:00:00.000Z`,
			id: crypto.randomUUID(),
			information: body.information || null,
			owner_id: ownerId,
			status: 'pending',
		});

		const edition = await db
			.select({
				colors: Editions.colors,
				id: Editions.id,
			})
			.from(Editions)
			.where(
				and(
					eq(Editions.name, body.edition_name.substring(5)),
					eq(
						Editions.year,
						parseInt(body.edition_name.substring(0, 4))
					)
				)
			)
			.get();

		const editionId = edition?.id;

		if (!editionId) {
			return c.json(
				{
					error: 'Not Found',
					details: 'Edition not found',
				},
				404
			);
		}

		const editionColors = Array.isArray(edition.colors)
			? edition.colors
			: [];
		const requestedColor =
			typeof body.color === 'string' ? body.color.trim() : '';
		const parsedColor =
			!requestedColor || requestedColor.toLowerCase() === 'various'
				? null
				: requestedColor;

		if (parsedColor !== null) {
			if (
				editionColors.length === 0 ||
				!editionColors.includes(parsedColor)
			) {
				return c.json(
					{
						error: 'Bad Request',
						details: 'Invalid color for this edition',
					},
					400
				);
			}
		}

		const vinDecode = await buildVinDecodeFields(
			vin,
			parseEditionYear(body.edition_name)
		);

		const claimMileage = parseClaimMileage(body);

		await db.insert(CarsPending).values({
			car_id: carId,
			color: parsedColor,
			created_at: Math.floor(Date.now() / 1000),
			current_owner_id: ownerId,
			edition_id: editionId,
			id: crypto.randomUUID(),
			sequence: parseSequence(body.sequence),
			status: 'pending',
			vin,
			...(claimMileage ?? {}),
			...(vinDecode ?? {}),
		});

		if (`${user.firstName} ${user.lastName}` !== body.owner_name) {
			await c.get('clerk').users.updateUser(userId, {
				firstName: body.owner_name.split(' ')[0],
				lastName: body.owner_name.split(' ')[1],
			});
		}

		await notifyModerator(c.env.RESEND_API_KEY, {
			kind: 'new_registration',
			edition: body.edition_name || null,
		});

		return c.json({ success: true, id: ownerId });
	} catch (error) {
		console.error('Error creating owner:', error);

		return c.json(
			{
				error: 'Internal server error',
				details:
					error instanceof Error
						? error.message
						: 'An unknown error occurred',
			},
			501
		);
	}
});

export default claimsRouter;
