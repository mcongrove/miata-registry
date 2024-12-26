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

import { Hono } from 'hono';
import { eq, sql } from 'drizzle-orm';
import { Cars, CarOwners, Owners } from '../../db/schema';
import { createDb } from '../../db';
import type { Bindings } from '../types';

const statsRouter = new Hono<{ Bindings: Bindings }>();

statsRouter.get('/', async (c) => {
	try {
		const db = createDb(c.env.DB);

		const [totalCars] = await db
			.select({ count: sql<number>`count(*)` })
			.from(Cars);

		const [carsWithOwners] = await db
			.select({ count: sql<number>`count(*)` })
			.from(Cars)
			.where(sql`current_owner_id is not null`);

		const [uniqueEditions] = await db
			.select({ count: sql<number>`count(distinct edition_id)` })
			.from(Cars);

		const [uniqueCountries] = await db
			.select({ count: sql<number>`count(distinct country)` })
			.from(Owners)
			.innerJoin(CarOwners, eq(Owners.id, CarOwners.owner_id));

		return c.json({
			cars: totalCars.count,
			claimedCars: carsWithOwners.count,
			editions: uniqueEditions.count,
			countries: uniqueCountries.count,
		});
	} catch (error: unknown) {
		console.error('Error fetching registry statistics:', error);

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

export default statsRouter;
