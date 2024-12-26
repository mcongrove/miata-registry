/**
 * Miata Registry
 * Copyright (C) 2024 Matthew Congrove
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

import { asc, eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { createDb } from '../../db';
import { Cars, Editions } from '../../db/schema';
import type { Bindings } from '../types';

const editionsRouter = new Hono<{ Bindings: Bindings }>();

editionsRouter.get('/', async (c) => {
	try {
		const db = createDb(c.env.DB);

		const editionsWithCounts = await db
			.select({
				id: Editions.id,
				name: Editions.name,
				color: Editions.color,
				generation: Editions.generation,
				year: Editions.year,
				total_produced: Editions.total_produced,
				image_car_id: Editions.image_car_id,
				display_name:
					sql<string>`CONCAT(${Editions.year}, ' ', ${Editions.name})`.as(
						'display_name'
					),
				in_registry: sql<number>`COUNT(DISTINCT ${Cars.id})`.as(
					'in_registry'
				),
				claimed:
					sql<number>`COUNT(DISTINCT CASE WHEN ${Cars.current_owner_id} IS NOT NULL THEN ${Cars.id} END)`.as(
						'claimed'
					),
			})
			.from(Editions)
			.leftJoin(Cars, eq(Cars.edition_id, Editions.id))
			.groupBy(
				sql`${Editions.id}, ${Editions.name}, ${Editions.color}, ${Editions.generation}, ${Editions.year}, ${Editions.total_produced}, ${Editions.image_car_id}`
			)
			.orderBy(asc(Editions.year), asc(Editions.name));

		return c.json(editionsWithCounts);
	} catch (error) {
		console.error('Error fetching editions:', error);

		return c.json(
			{
				error: 'Internal server error',
				details:
					error instanceof Error ? error.message : 'Unknown error',
			},
			500
		);
	}
});

editionsRouter.get('/names', async (c) => {
	try {
		const db = createDb(c.env.DB);

		const uniqueNames = await db
			.select({
				id: Editions.id,
				name: sql<string>`CONCAT(${Editions.year}, ' ', ${Editions.name})`.as(
					'name'
				),
			})
			.from(Editions)
			.orderBy(asc(Editions.year), asc(Editions.name))
			.groupBy(sql`${Editions.id}, ${Editions.year}, ${Editions.name}`);

		return c.json(uniqueNames.map((edition) => edition.name));
	} catch (error) {
		console.error('Error fetching edition names:', error);

		return c.json(
			{
				error: 'Internal server error',
				details:
					error instanceof Error ? error.message : 'Unknown error',
			},
			500
		);
	}
});

export default editionsRouter;
