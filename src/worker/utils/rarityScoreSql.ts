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

import { sql } from 'drizzle-orm';
import { Cars, Editions } from '../../db/schema';

/** +1 per calendar year since edition model year (edition-level, not per car). */
export const editionAgeExpr = sql`MAX(0, CAST(strftime('%Y', 'now') AS INTEGER) - ${Editions.year})`;

/** Edition base (DB) + age — used for edition cards and as the car total before owner modifiers. */
export const editionRarityWithAgeExpr = sql`COALESCE(${Editions.rarity_score}, 0) + ${editionAgeExpr}`;

/** Full displayed car score: edition base + age + cars.rarity_score (owner/mileage modifiers only in DB). */
export const carDisplayRarityScoreExpr = sql`CASE WHEN ${Cars.destroyed} THEN 0 ELSE ${editionRarityWithAgeExpr} + COALESCE(${Cars.rarity_score}, 0) END`;
