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

import { and, eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { createDb } from '../../db';
import {
	CarOwnersPending,
	Cars,
	CarsPending,
	Editions,
	Owners,
} from '../../db/schema';
import { withAuth } from '../middleware/auth';
import type { Bindings } from '../types';

const CACHE_TTL = {
	OWNER_DETAILS: 0, // None
	OWNER_COUNTRIES: 60 * 60 * 24 * 7, // 7 days
};

const ownersRouter = new Hono<{ Bindings: Bindings }>();

ownersRouter.get('/countries', async (c) => {
	try {
		const cached = await c.env.CACHE.get('owners:countries');

		if (cached) {
			const response = c.json(JSON.parse(cached));

			response.headers.set('X-Cache', 'HIT');

			return response;
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
			expirationTtl: CACHE_TTL.OWNER_COUNTRIES,
		});

		return c.json(countryList);
	} catch (error: unknown) {
		console.error('Error fetching owner countries:', error);

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

ownersRouter.get('/:id', withAuth(), async (c) => {
	try {
		const userId = c.get('userId');
		const ownerUserId = c.req.param('id');

		if (userId !== ownerUserId) {
			return c.json(
				{
					error: 'Unauthorized',
					details: "You don't have permission to do that",
				},
				403
			);
		}

		const db = createDb(c.env.DB);

		const ownerData = await db
			.select({
				cars: {
					destroyed: Cars.destroyed,
					edition: Editions.name,
					id: Cars.id,
					sequence: Cars.sequence,
					vin: Cars.vin,
					year: Editions.year,
				},
				owner: {
					city: Owners.city,
					country: Owners.country,
					id: Owners.id,
					links: sql<string>`json(${Owners.links})`,
					name: Owners.name,
					state: Owners.state,
					user_id: Owners.user_id,
				},
			})
			.from(Cars)
			.innerJoin(Editions, eq(Cars.edition_id, Editions.id))
			.innerJoin(Owners, eq(Cars.current_owner_id, Owners.id))
			.where(eq(Owners.user_id, ownerUserId));

		if (!ownerData.length) {
			return c.json({ cars: [], owner: { id: '' } });
		}

		const cars = ownerData.map((row) => row.cars);
		const owner = {
			...ownerData[0].owner,
			links: ownerData[0].owner.links
				? JSON.parse(ownerData[0].owner.links)
				: null,
		};

		return c.json({ cars, owner });
	} catch (error) {
		console.error('Error fetching owner data:', error);

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

ownersRouter.get('/:id/pending', withAuth(), async (c) => {
	try {
		const userId = c.get('userId');
		const ownerUserId = c.req.param('id');

		if (userId !== ownerUserId) {
			return c.json(
				{
					error: 'Unauthorized',
					details: "You don't have permission to do that",
				},
				403
			);
		}

		const db = createDb(c.env.DB);

		const owner = await db
			.select({ id: Owners.id })
			.from(Owners)
			.where(eq(Owners.user_id, ownerUserId))
			.limit(1);

		if (!owner.length) {
			return c.json(null);
		}

		const ownerId = owner[0].id;

		const pendingCars = await db
			.select({
				id: CarsPending.car_id,
				created_at: CarsPending.created_at,
				vin: CarsPending.vin,
				edition_name: sql<
					string | null
				>`COALESCE(${Editions.year}, '') || ' ' || COALESCE(${Editions.name}, '')`,
			})
			.from(CarsPending)
			.leftJoin(Editions, eq(CarsPending.edition_id, Editions.id))
			.where(
				and(
					eq(CarsPending.status, 'pending'),
					eq(CarsPending.current_owner_id, ownerId)
				)
			);

		const pendingCarOwners = await db
			.select({
				id: CarOwnersPending.id,
				car_id: CarOwnersPending.car_id,
				created_at: CarOwnersPending.created_at,
				vin: Cars.vin,
				edition_name: sql<
					string | null
				>`COALESCE(${Editions.year}, '') || ' ' || COALESCE(${Editions.name}, '')`,
			})
			.from(CarOwnersPending)
			.innerJoin(Cars, eq(CarOwnersPending.car_id, Cars.id))
			.innerJoin(Editions, eq(Cars.edition_id, Editions.id))
			.where(
				and(
					eq(CarOwnersPending.status, 'pending'),
					eq(CarOwnersPending.owner_id, ownerId)
				)
			);

		if (!pendingCars.length && !pendingCarOwners.length) {
			return c.json(null);
		}

		return c.json({
			cars: pendingCars,
			carOwners: pendingCarOwners,
			owners: [],
		});
	} catch (error) {
		console.error('Error fetching pending changes:', error);

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

ownersRouter.patch('/:id', withAuth(), async (c) => {
	try {
		const userId = c.get('userId');
		const ownerUserId = c.req.param('id');
		const body = await c.req.json();

		if (userId !== ownerUserId) {
			return c.json(
				{
					error: 'Unauthorized',
					details: "You don't have permission to do that",
				},
				403
			);
		}

		const db = createDb(c.env.DB);

		const linksJson = JSON.stringify({
			instagram: body.links?.instagram || null,
		});

		const [updatedOwner] = await db
			.update(Owners)
			.set({
				city: body.location?.city || null,
				state: body.location?.state || null,
				country: body.location?.country || null,
				links: sql`json(${linksJson})`,
			})
			.where(eq(Owners.user_id, ownerUserId))
			.returning({ id: Owners.id });

		const ownedCars = await db
			.select({ id: Cars.id })
			.from(Cars)
			.where(eq(Cars.current_owner_id, updatedOwner.id));

		await Promise.all([
			...ownedCars
				.map((car) => [
					c.env.CACHE.delete(`cars:details:${car.id}`),
					c.env.CACHE.delete(`cars:summary:${car.id}`),
				])
				.flat(),
		]);

		return c.json({ success: true });
	} catch (error) {
		console.error('Error updating owner:', error);

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

export default ownersRouter;
