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
import type { createDb } from '../../db';
import { CarOwners, CarOwnersPending, Owners } from '../../db/schema';
import {
	dateToFormValue,
	isoDateFromForm,
	type TPriorOwnerSubmitRow,
} from '../../utils/ownershipHistory';

type Db = ReturnType<typeof createDb>;

export type PriorOwnerIntent =
	| {
			kind: 'prior_owner';
			action: 'create';
			owner: {
				name: string;
				city?: string | null;
				state?: string | null;
				country?: string | null;
			};
	  }
	| {
			kind: 'prior_owner';
			action: 'update';
			previous_date_start: string;
			owner: {
				name: string;
				city?: string | null;
				state?: string | null;
				country?: string | null;
			};
	  }
	| {
			kind: 'prior_owner';
			action: 'delete';
			car_owner_date_start: string;
	  };

export function parsePriorOwnerIntent(
	information: string | null | undefined
): PriorOwnerIntent | null {
	if (!information) {
		return null;
	}

	try {
		const parsed = JSON.parse(information) as PriorOwnerIntent;

		if (parsed?.kind === 'prior_owner') {
			return parsed;
		}
	} catch {
		return null;
	}

	return null;
}

type ExistingPriorOwner = {
	car_id: string;
	date_end: string | null;
	date_start: string | null;
	owner_id: string;
	name: string | null;
	city: string | null;
	state: string | null;
	country: string | null;
};

function ownerProfileChanged(
	existing: ExistingPriorOwner,
	proposed: TPriorOwnerSubmitRow
) {
	return (
		(existing.name ?? '').trim() !== proposed.name.trim() ||
		(existing.city ?? null) !== (proposed.city ?? null) ||
		(existing.state ?? null) !== (proposed.state ?? null) ||
		(existing.country ?? null) !== (proposed.country ?? null)
	);
}

function ownershipDatesChanged(
	existing: ExistingPriorOwner,
	proposed: TPriorOwnerSubmitRow
) {
	return (
		dateToFormValue(existing.date_start) !== (proposed.date_start ?? '') ||
		dateToFormValue(existing.date_end) !== (proposed.date_end ?? '')
	);
}

export async function queuePriorOwnerHistoryChanges(
	db: Db,
	carId: string,
	existingPrior: ExistingPriorOwner[],
	proposed: TPriorOwnerSubmitRow[]
): Promise<boolean> {
	const proposedWithIds = proposed.map((row) => ({
		...row,
		owner_id: row.owner_id ?? crypto.randomUUID(),
	}));

	const existingByOwnerId = new Map(
		existingPrior.map((row) => [row.owner_id, row])
	);

	let queued = false;
	const now = Math.floor(Date.now() / 1000);

	for (const existing of existingPrior) {
		const stillPresent = proposedWithIds.some(
			(row) => row.owner_id === existing.owner_id
		);

		if (!stillPresent) {
			if (!existing.date_start) {
				continue;
			}

			await db.insert(CarOwnersPending).values({
				car_id: carId,
				created_at: now,
				date_end: existing.date_end,
				date_start: existing.date_start,
				id: crypto.randomUUID(),
				information: JSON.stringify({
					kind: 'prior_owner',
					action: 'delete',
					car_owner_date_start: existing.date_start,
				} satisfies PriorOwnerIntent),
				owner_id: existing.owner_id,
				status: 'pending',
			});
			queued = true;
		}
	}

	for (const row of proposedWithIds) {
		if (!row.name.trim() || !row.date_start || !row.date_end) {
			continue;
		}

		const existing = row.owner_id
			? existingByOwnerId.get(row.owner_id)
			: undefined;
		const dateStartIso = isoDateFromForm(row.date_start);
		const dateEndIso = isoDateFromForm(row.date_end);

		if (!dateStartIso || !dateEndIso) {
			continue;
		}

		if (!existing) {
			await db.insert(CarOwnersPending).values({
				car_id: carId,
				created_at: now,
				date_end: dateEndIso,
				date_start: dateStartIso,
				id: crypto.randomUUID(),
				information: JSON.stringify({
					kind: 'prior_owner',
					action: 'create',
					owner: {
						name: row.name.trim(),
						city: row.city ?? null,
						state: row.state ?? null,
						country: row.country ?? null,
					},
				} satisfies PriorOwnerIntent),
				owner_id: row.owner_id!,
				status: 'pending',
			});
			queued = true;
			continue;
		}

		const profileChanged = ownerProfileChanged(existing, row);
		const datesChanged = ownershipDatesChanged(existing, row);

		if (!profileChanged && !datesChanged) {
			continue;
		}

		const previousDateStart = existing.date_start;

		if (!previousDateStart) {
			continue;
		}

		await db.insert(CarOwnersPending).values({
			car_id: carId,
			created_at: now,
			date_end: dateEndIso,
			date_start: dateStartIso,
			id: crypto.randomUUID(),
			information: JSON.stringify({
				kind: 'prior_owner',
				action: 'update',
				previous_date_start: previousDateStart,
				owner: {
					name: row.name.trim(),
					city: row.city ?? null,
					state: row.state ?? null,
					country: row.country ?? null,
				},
			} satisfies PriorOwnerIntent),
			owner_id: existing.owner_id,
			status: 'pending',
		});
		queued = true;
	}

	return queued;
}

export async function applyPriorOwnerPendingApproval(
	db: Db,
	pending: {
		car_id: string;
		date_end: string | null;
		date_start: string | null;
		information: string | null;
		owner_id: string;
	},
	intent: PriorOwnerIntent
) {
	const ownerProfile = 'owner' in intent ? intent.owner : null;

	if (intent.action === 'create') {
		const existingOwner = await db
			.select({ id: Owners.id })
			.from(Owners)
			.where(eq(Owners.id, pending.owner_id))
			.get();

		if (!existingOwner) {
			await db.insert(Owners).values({
				city: ownerProfile?.city ?? null,
				country: ownerProfile?.country ?? null,
				id: pending.owner_id,
				name: ownerProfile?.name ?? null,
				state: ownerProfile?.state ?? null,
				user_id: null,
			});
		}

		await db.insert(CarOwners).values({
			car_id: pending.car_id,
			date_end: pending.date_end,
			date_start: pending.date_start!,
			owner_id: pending.owner_id,
		});

		return;
	}

	if (intent.action === 'delete') {
		await db
			.delete(CarOwners)
			.where(
				and(
					eq(CarOwners.car_id, pending.car_id),
					eq(CarOwners.owner_id, pending.owner_id),
					eq(CarOwners.date_start, intent.car_owner_date_start)
				)
			);

		return;
	}

	if (intent.action === 'update') {
		if (
			intent.previous_date_start &&
			intent.previous_date_start !== pending.date_start
		) {
			await db
				.delete(CarOwners)
				.where(
					and(
						eq(CarOwners.car_id, pending.car_id),
						eq(CarOwners.owner_id, pending.owner_id),
						eq(CarOwners.date_start, intent.previous_date_start)
					)
				);

			await db.insert(CarOwners).values({
				car_id: pending.car_id,
				date_end: pending.date_end,
				date_start: pending.date_start!,
				owner_id: pending.owner_id,
			});
		} else {
			await db
				.update(CarOwners)
				.set({
					date_end: pending.date_end,
					date_start: pending.date_start,
				})
				.where(
					and(
						eq(CarOwners.car_id, pending.car_id),
						eq(CarOwners.owner_id, pending.owner_id),
						eq(CarOwners.date_start, intent.previous_date_start)
					)
				);
		}

		if (ownerProfile) {
			await db
				.update(Owners)
				.set({
					city: ownerProfile.city ?? null,
					country: ownerProfile.country ?? null,
					name: ownerProfile.name ?? null,
					state: ownerProfile.state ?? null,
				})
				.where(eq(Owners.id, pending.owner_id));
		}
	}
}
