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

import { eq } from 'drizzle-orm';
import type { createDb } from '../../db';
import { CarOwners, Cars, Editions } from '../../db/schema';
import {
	computeCarRarityModifiers,
	type RarityAttestations,
} from '../../utils/rarityScore';

type Db = ReturnType<typeof createDb>;

export async function recalculateAndStoreCarRarity(db: Db, carId: string) {
	const [row] = await db
		.select({
			destroyed: Cars.destroyed,
			editionYear: Editions.year,
			mileage: Cars.mileage,
			rarity_original_hardtop: Cars.rarity_original_hardtop,
			rarity_original_paint: Cars.rarity_original_paint,
			rarity_original_softtop: Cars.rarity_original_softtop,
			rarity_original_wheels: Cars.rarity_original_wheels,
			rarity_sale_documents: Cars.rarity_sale_documents,
			rarity_service_records: Cars.rarity_service_records,
			rarity_window_sticker: Cars.rarity_window_sticker,
		})
		.from(Cars)
		.innerJoin(Editions, eq(Cars.edition_id, Editions.id))
		.where(eq(Cars.id, carId));

	if (!row) return;

	const ownerHistory = await db
		.select({
			date_end: CarOwners.date_end,
			date_start: CarOwners.date_start,
		})
		.from(CarOwners)
		.where(eq(CarOwners.car_id, carId));

	const attestations: RarityAttestations = {
		rarity_original_paint: Boolean(row.rarity_original_paint),
		rarity_original_hardtop: Boolean(row.rarity_original_hardtop),
		rarity_original_softtop: Boolean(row.rarity_original_softtop),
		rarity_original_wheels: Boolean(row.rarity_original_wheels),
		rarity_window_sticker: Boolean(row.rarity_window_sticker),
		rarity_sale_documents: Boolean(row.rarity_sale_documents),
		rarity_service_records: Boolean(row.rarity_service_records),
	};

	const rarity_score = computeCarRarityModifiers({
		attestations,
		destroyed: Boolean(row.destroyed),
		editionYear: row.editionYear,
		mileage: row.mileage ?? null,
		ownerHistory,
	});

	await db.update(Cars).set({ rarity_score }).where(eq(Cars.id, carId));
}
