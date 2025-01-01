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

const CACHE_TTL = {
	EDITIONS: 60 * 60 * 24 * 7, // 7 days
	EDITIONS_NAMES: 60 * 60 * 24 * 7, // 7 days
};

const editionsRouter = new Hono<{ Bindings: Bindings }>();

editionsRouter.get('/', async (c) => {
	try {
		const cached = await c.env.CACHE.get('editions:all');

		if (cached) {
			return c.json(JSON.parse(cached));
		}

		const db = createDb(c.env.DB);

		const editionsWithCounts = await db
			.select({
				claimed:
					sql<number>`COUNT(DISTINCT CASE WHEN ${Cars.current_owner_id} IS NOT NULL THEN ${Cars.id} END)`.as(
						'claimed'
					),
				color: Editions.color,
				display_name:
					sql<string>`CONCAT(${Editions.year}, ' ', ${Editions.name})`.as(
						'display_name'
					),
				generation: Editions.generation,
				id: Editions.id,
				image_car_id: Editions.image_car_id,
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
				sql`${Editions.id}, ${Editions.name}, ${Editions.color}, ${Editions.generation}, ${Editions.year}, ${Editions.total_produced}, ${Editions.image_car_id}`
			)
			.orderBy(asc(Editions.year), asc(Editions.name));

		await c.env.CACHE.put(
			'editions:all',
			JSON.stringify(editionsWithCounts),
			{
				expirationTtl: CACHE_TTL.EDITIONS,
			}
		);

		return c.json(editionsWithCounts);
	} catch (error) {
		console.error('Error fetching editions:', error);

		return c.json(
			{
				error: 'Internal server error',
				details:
					error instanceof Error
						? error.message
						: 'An unknown error occurred',
			},
			500
		);
	}
});

editionsRouter.get('/names', async (c) => {
	try {
		const cached = await c.env.CACHE.get('editions:names');

		if (cached) {
			return c.json(JSON.parse(cached));
		}

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

		const names = uniqueNames.map((edition) => edition.name);

		await c.env.CACHE.put('editions:names', JSON.stringify(names), {
			expirationTtl: CACHE_TTL.EDITIONS_NAMES,
		});

		return c.json(names);
	} catch (error) {
		console.error('Error fetching edition names:', error);

		return c.json(
			{
				error: 'Internal server error',
				details:
					error instanceof Error
						? error.message
						: 'An unknown error occurred',
			},
			500
		);
	}
});

export default editionsRouter;
