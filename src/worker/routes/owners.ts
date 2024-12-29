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

import { eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { createDb } from '../../db';
import { Cars, Editions, Owners } from '../../db/schema';
import { withAuth } from '../middleware/auth';
import type { Bindings } from '../types';

const CACHE_TTL = {
	CARS: 0, // None
	COUNTRIES: 60 * 60 * 24 * 7, // 7 days
};

const ownersRouter = new Hono<{ Bindings: Bindings }>();

ownersRouter.use('/cars', withAuth());

ownersRouter.get('/cars', async (c) => {
	const userId = c.get('userId');

	const db = createDb(c.env.DB);

	const cars = await db
		.select({
			id: Cars.id,
			year: Editions.year,
			edition: Editions.name,
			sequence: Cars.sequence,
			vin: Cars.vin,
			destroyed: Cars.destroyed,
		})
		.from(Cars)
		.innerJoin(Editions, eq(Cars.edition_id, Editions.id))
		.innerJoin(Owners, eq(Cars.current_owner_id, Owners.id))
		.where(eq(Owners.user_id, userId));

	return c.json(cars);
});

ownersRouter.get('/countries', async (c) => {
	try {
		const cached = await c.env.CACHE.get('owners:countries');

		if (cached) {
			return c.json(JSON.parse(cached));
		}

		const db = createDb(c.env.DB);

		const countries = await db
			.select({ country: Owners.country })
			.from(Owners)
			.innerJoin(Cars, eq(Cars.current_owner_id, Owners.id))
			.where(sql`${Owners.country} IS NOT NULL`)
			.groupBy(Owners.country)
			.orderBy(Owners.country);

		const countryList = countries.map((row) => row.country);

		await c.env.CACHE.put('owners:countries', JSON.stringify(countryList), {
			expirationTtl: CACHE_TTL.COUNTRIES,
		});

		return c.json(countryList);
	} catch (error: unknown) {
		console.error('Error fetching owner countries:', error);

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

export default ownersRouter;
