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
import { Resend } from 'resend';
import { createDb } from '../../db';
import {
	CarOwnersPending,
	Cars,
	Editions,
	Owners,
	OwnersPending,
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

ownersRouter.post('/', withAuth(), async (c) => {
	try {
		const userId = c.get('userId');
		const body = await c.req.json();
		const db = createDb(c.env.DB);
		let ownerId = body.owner_id;

		if (!ownerId) {
			const existingOwner = await db
				.select({ id: Owners.id })
				.from(Owners)
				.where(eq(Owners.user_id, userId));

			if (existingOwner.length > 0) {
				return c.json(
					{
						error: 'Conflict',
						details: 'An owner already exists for this user',
					},
					409
				);
			}

			const [{ id }] = await db
				.insert(OwnersPending)
				.values({
					city: body.owner_city || null,
					country: body.owner_country || null,
					created_at: Date.now(),
					id: crypto.randomUUID(),
					name: body.owner_name,
					state: body.owner_state || null,
					status: 'pending',
					user_id: userId,
				})
				.returning({ id: OwnersPending.id });

			ownerId = id;

			await db.insert(CarOwnersPending).values({
				car_id: body.car_id,
				created_at: Date.now(),
				date_start: `${body.owner_date_start}T00:00:00.000Z`,
				id: crypto.randomUUID(),
				information: body.information || null,
				owner_id: ownerId,
				status: 'pending',
			});

			if (body.owner_name) {
				const user = await c.get('clerk').users.getUser(userId);

				if (`${user.firstName} ${user.lastName}` !== body.owner_name) {
					await c.get('clerk').users.updateUser(userId, {
						firstName: body.owner_name.split(' ')[0],
						lastName: body.owner_name.split(' ')[1],
					});
				}
			}
		} else {
			await db.insert(CarOwnersPending).values({
				car_id: body.car_id,
				created_at: Date.now(),
				date_start: `${body.owner_date_start}T00:00:00.000Z`,
				id: crypto.randomUUID(),
				information: body.information || null,
				owner_id: ownerId,
				status: 'pending',
			});
		}

		const resend = new Resend(c.env.RESEND_API_KEY);

		await resend.emails.send({
			from: 'Miata Registry <support@miataregistry.com>',
			to: 'mattcongrove@gmail.com',
			subject: 'Miata Registry: Owner Change Request',
			html: `
				<h2>Owner Change Request</h2>
				<p><strong>Owner ID:</strong> ${ownerId}</p>
		 `,
		});

		return c.json({ success: true, id: ownerId });
	} catch (error) {
		console.error('Error creating owner:', error);

		return c.json(
			{
				error: 'Internal server error',
				details:
					error instanceof Error
						? error.message
						: 'An unknown error occurred',
			},
			501
		);
	}
});

export default ownersRouter;
