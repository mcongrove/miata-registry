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

import type { D1Database } from '@cloudflare/workers-types';
import { asc, eq, sql } from 'drizzle-orm';
import { createDb } from '../db';
import { Cars, Editions } from '../db/schema';
import type { EditionRow } from './botContent';

export type EditionJson = {
	year: number;
	name: string;
	generation: string;
	color: string;
	total_produced: number | null;
	in_registry: number;
	claimed: number;
};

export const fetchEditionsData = async (
	db: D1Database
): Promise<EditionJson[]> => {
	const drizzle = createDb(db);

	const rows = await drizzle
		.select({
			claimed:
				sql<number>`COUNT(DISTINCT CASE WHEN ${Cars.current_owner_id} IS NOT NULL THEN ${Cars.id} END)`.as(
					'claimed'
				),
			color: Editions.color,
			generation: Editions.generation,
			in_registry: sql<number>`COUNT(DISTINCT ${Cars.id})`.as(
				'in_registry'
			),
			name: Editions.name,
			total_produced: Editions.total_produced,
			year: Editions.year,
		})
		.from(Editions)
		.leftJoin(Cars, eq(Cars.edition_id, Editions.id))
		.groupBy(
			sql`${Editions.id}, ${Editions.name}, ${Editions.color}, ${Editions.generation}, ${Editions.year}, ${Editions.total_produced}`
		)
		.orderBy(asc(Editions.year), asc(Editions.name));

	return rows.map((row) => ({
		year: row.year,
		name: row.name,
		generation: row.generation,
		color: row.color,
		total_produced: row.total_produced,
		in_registry: row.in_registry,
		claimed: row.claimed,
	}));
};

export const editionsToBotRows = (editions: EditionJson[]): EditionRow[] =>
	editions;
