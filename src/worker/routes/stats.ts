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

import { sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { createDb } from '../../db';
import { Cars, Editions, Owners } from '../../db/schema';
import type { Bindings } from '../types';

const CACHE_TTL = {
	STATS: 60 * 60 * 24 * 7, // 7 days
};

const statsRouter = new Hono<{ Bindings: Bindings }>();

statsRouter.get('/', async (c) => {
	try {
		const cached = await c.env.CACHE.get('stats:all');

		if (cached) {
			return c.json(JSON.parse(cached));
		}

		const db = createDb(c.env.DB);

		const [carsWithOwners] = await db
			.select({ count: sql<number>`count(*)` })
			.from(Cars)
			.where(sql`current_owner_id is not null`);
		const [totalCars] = await db
			.select({ count: sql<number>`count(*)` })
			.from(Cars);
		const [uniqueCountries] = await db
			.select({ count: sql<number>`count(distinct country)` })
			.from(Owners);
		const [uniqueEditions] = await db
			.select({ count: sql<number>`count(distinct id)` })
			.from(Editions);

		const stats = {
			cars: totalCars.count,
			claimedCars: carsWithOwners.count,
			countries: uniqueCountries.count,
			editions: uniqueEditions.count,
		};

		await c.env.CACHE.put('stats:all', JSON.stringify(stats), {
			expirationTtl: CACHE_TTL.STATS,
		});

		return c.json(stats);
	} catch (error: unknown) {
		console.error('Error fetching registry statistics:', error);

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

export default statsRouter;
