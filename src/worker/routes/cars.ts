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

import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { Resend } from 'resend';
import { createDb } from '../../db';
import {
	CarOwners,
	CarOwnersPending,
	Cars,
	CarsPending,
	Editions,
	Owners,
} from '../../db/schema';
import { withAuth } from '../middleware/auth';
import type { Bindings } from '../types';

const CACHE_TTL = {
	CARS_LIST: 60 * 60, // 1 hour
	CAR_DETAILS: 60 * 60 * 24 * 7, // 7 days
	CAR_SUMMARY: 60 * 60 * 24 * 7, // 7 days
};

const carsRouter = new Hono<{ Bindings: Bindings }>();

carsRouter.get('/', async (c) => {
	try {
		const params = c.req.query();
		const filters = params.filters ? JSON.parse(params.filters) : [];
		const page = parseInt(params.page || '1');
		const shouldCache = filters.length === 0 && page === 1;

		if (shouldCache) {
			const cacheKey = `cars:list:${JSON.stringify(params)}`;
			const cached = await c.env.CACHE.get(cacheKey);

			if (cached) {
				return c.json(JSON.parse(cached));
			}
		}

		const db = createDb(c.env.DB);

		const sortColumn = params.sortColumn || 'edition.year';
		const sortDirection = (params.sortDirection || 'asc') as 'asc' | 'desc';
		const pageSize = Math.min(parseInt(params.pageSize || '50'), 50);
		const conditions = [];

		for (const filter of filters) {
			switch (filter.type) {
				case 'claimStatus':
					if (filter.value === 'Claimed') {
						conditions.push(
							sql`${Cars.current_owner_id} IS NOT NULL`
						);
					} else if (filter.value === 'Unclaimed') {
						conditions.push(sql`${Cars.current_owner_id} IS NULL`);
					}

					break;
				case 'country':
					conditions.push(eq(Owners.country, filter.value));

					break;
				case 'edition':
					const [year, ...nameParts] = filter.value.split(' ');
					const name = nameParts.join(' ');

					conditions.push(
						and(
							eq(Editions.year, parseInt(year)),
							eq(Editions.name, name)
						)
					);

					break;
				case 'generation':
					conditions.push(eq(Editions.generation, filter.value));

					break;
				case 'year':
					conditions.push(eq(Editions.year, parseInt(filter.value)));

					break;
				default:
					break;
			}
		}

		const baseQuery = db
			.select({
				current_owner: {
					country: Owners.country,
					id: Owners.id,
					name: Owners.name,
				},
				edition: {
					color: Editions.color,
					generation: Editions.generation,
					name: Editions.name,
					total_produced: Editions.total_produced,
					year: Editions.year,
				},
				id: Cars.id,
				sequence: Cars.sequence,
				vin: Cars.vin,
				total: sql<number>`count(*) OVER()`,
			})
			.from(Cars)
			.leftJoin(Editions, eq(Cars.edition_id, Editions.id))
			.leftJoin(Owners, eq(Cars.current_owner_id, Owners.id));

		const filteredQuery =
			conditions.length > 0
				? baseQuery.where(and(...conditions))
				: baseQuery;

		const sortConditions = [];
		const sortField = sortColumn.includes('.')
			? sortColumn.split('.')[1]
			: sortColumn;
		const sortFn = sortDirection === 'desc' ? desc : asc;

		switch (sortField) {
			case 'year':
				sortConditions.push(
					sql`CASE WHEN ${Editions.year} IS NULL THEN 1 ELSE 0 END`
				);
				sortConditions.push(sortFn(Editions.year));
				break;
			case 'name':
				if (sortColumn.startsWith('owner')) {
					sortConditions.push(
						sql`CASE WHEN ${Owners.name} IS NULL THEN 1 ELSE 0 END`
					);
					sortConditions.push(sortFn(Owners.name));
				} else {
					sortConditions.push(
						sql`CASE WHEN ${Editions.name} IS NULL THEN 1 ELSE 0 END`
					);
					sortConditions.push(sortFn(Editions.name));
				}
				break;
			case 'country':
				if (sortColumn.startsWith('owner')) {
					sortConditions.push(
						sql`CASE WHEN ${Owners.country} IS NULL THEN 1 ELSE 0 END`
					);
					sortConditions.push(sortFn(Owners.country));
				}
				break;
			case 'generation':
				sortConditions.push(
					sql`CASE WHEN ${Editions.generation} IS NULL THEN 1 ELSE 0 END`
				);
				sortConditions.push(sortFn(Editions.generation));
				break;
			case 'sequence':
				sortConditions.push(
					sql`CASE WHEN ${Cars.sequence} IS NULL THEN 1 ELSE 0 END`
				);
				sortConditions.push(sortFn(Cars.sequence));
				break;
		}

		if (sortField !== 'year') {
			sortConditions.push(
				sql`CASE WHEN ${Editions.year} IS NULL THEN 1 ELSE 0 END`
			);
			sortConditions.push(asc(Editions.year));
		}

		if (sortField !== 'name') {
			sortConditions.push(
				sql`CASE WHEN ${Editions.name} IS NULL THEN 1 ELSE 0 END`
			);
			sortConditions.push(asc(Editions.name));
		}

		if (sortField !== 'sequence') {
			sortConditions.push(
				sql`CASE WHEN ${Cars.sequence} IS NULL THEN 1 ELSE 0 END`
			);
			sortConditions.push(asc(Cars.sequence));
		}

		const offset = (page - 1) * pageSize;
		const cars = await filteredQuery
			.orderBy(...sortConditions)
			.limit(pageSize)
			.offset(offset);
		const total = cars[0]?.total ?? 0;

		const result = {
			cars: cars.map(({ total, ...car }) => car),
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};

		if (shouldCache) {
			const cacheKey = `cars:list:${JSON.stringify(params)}`;

			await c.env.CACHE.put(cacheKey, JSON.stringify(result), {
				expirationTtl: CACHE_TTL.CARS_LIST,
			});
		}

		return c.json(result);
	} catch (error) {
		console.error('Error fetching cars:', error);

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

carsRouter.get('/:id', async (c) => {
	try {
		const id = c.req.param('id');
		const cacheKey = `cars:details:${id}`;
		const cached = await c.env.CACHE.get(cacheKey);

		if (cached) {
			return c.json(JSON.parse(cached));
		}

		const db = createDb(c.env.DB);

		const [carData] = await db
			.select({
				current_owner_id: Cars.current_owner_id,
				destroyed: Cars.destroyed,
				edition_id: Cars.edition_id,
				id: Cars.id,
				manufacture_date: Cars.manufacture_date,
				sale_date: Cars.sale_date,
				sale_dealer_city: Cars.sale_dealer_city,
				sale_dealer_country: Cars.sale_dealer_country,
				sale_dealer_name: Cars.sale_dealer_name,
				sale_dealer_state: Cars.sale_dealer_state,
				sale_msrp: Cars.sale_msrp,
				sequence: Cars.sequence,
				shipping_city: Cars.shipping_city,
				shipping_country: Cars.shipping_country,
				shipping_date: Cars.shipping_date,
				shipping_state: Cars.shipping_state,
				shipping_vessel: Cars.shipping_vessel,
				vin: Cars.vin,
				current_owner: {
					city: Owners.city,
					country: Owners.country,
					id: Owners.id,
					name: Owners.name,
					state: Owners.state,
					user_id: Owners.user_id,
				},
				edition: {
					color: Editions.color,
					description: Editions.description,
					generation: Editions.generation,
					id: Editions.id,
					image_car_id: Editions.image_car_id,
					name: Editions.name,
					total_produced: Editions.total_produced,
					year: Editions.year,
				},
			})
			.from(Cars)
			.leftJoin(Editions, eq(Cars.edition_id, Editions.id))
			.leftJoin(Owners, eq(Cars.current_owner_id, Owners.id))
			.where(eq(Cars.id, id));

		if (!carData) {
			return c.json({ error: 'Not found' }, 404);
		}

		const ownerHistory = await db
			.select({
				city: Owners.city,
				country: Owners.country,
				date_end: CarOwners.date_end,
				date_start: CarOwners.date_start,
				id: Owners.id,
				name: Owners.name,
				state: Owners.state,
			})
			.from(CarOwners)
			.leftJoin(Owners, eq(CarOwners.owner_id, Owners.id))
			.where(eq(CarOwners.car_id, id))
			.orderBy(
				sql`CASE WHEN ${CarOwners.date_end} IS NULL THEN 0 ELSE 1 END`,
				desc(CarOwners.date_end)
			);

		const result = {
			...carData,
			owner_history: ownerHistory,
		};

		await c.env.CACHE.put(cacheKey, JSON.stringify(result), {
			expirationTtl: CACHE_TTL.CAR_DETAILS,
		});

		return c.json(result);
	} catch (error: unknown) {
		console.error('Error fetching car:', error);

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

carsRouter.get('/:id/summary', async (c) => {
	try {
		const id = c.req.param('id');
		const cacheKey = `cars:summary:${id}`;
		const cached = await c.env.CACHE.get(cacheKey);

		if (cached) {
			return c.json(JSON.parse(cached));
		}

		const db = createDb(c.env.DB);

		const [car] = await db
			.select({
				editionName: Editions.name,
				sequence: Cars.sequence,
				year: Editions.year,
				current_owner: {
					country: Owners.country,
					name: Owners.name,
					state: Owners.state,
				},
			})
			.from(Cars)
			.leftJoin(Editions, eq(Cars.edition_id, Editions.id))
			.leftJoin(Owners, eq(Cars.current_owner_id, Owners.id))
			.where(eq(Cars.id, id));

		if (!car) {
			return c.json({ error: 'Not found' }, 404);
		}

		await c.env.CACHE.put(cacheKey, JSON.stringify(car), {
			expirationTtl: CACHE_TTL.CAR_SUMMARY,
		});

		return c.json(car);
	} catch (error: unknown) {
		console.error('Error fetching car summary:', error);

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

carsRouter.post('/:id', withAuth(), async (c) => {
	try {
		const db = createDb(c.env.DB);
		const id = c.req.param('id');
		const userId = c.get('userId');
		const body = await c.req.json();

		const [existing] = await db
			.select({
				car: {
					current_owner_id: Cars.current_owner_id,
					destroyed: Cars.destroyed,
					edition_id: Cars.edition_id,
					id: Cars.id,
					manufacture_date: Cars.manufacture_date,
					sale_date: Cars.sale_date,
					sale_dealer_city: Cars.sale_dealer_city,
					sale_dealer_country: Cars.sale_dealer_country,
					sale_dealer_name: Cars.sale_dealer_name,
					sale_dealer_state: Cars.sale_dealer_state,
					sale_msrp: Cars.sale_msrp,
					sequence: Cars.sequence,
					shipping_city: Cars.shipping_city,
					shipping_country: Cars.shipping_country,
					shipping_date: Cars.shipping_date,
					shipping_state: Cars.shipping_state,
					shipping_vessel: Cars.shipping_vessel,
					vin: Cars.vin,
				},
				owner: {
					car_id: CarOwners.car_id,
					date_end: CarOwners.date_end,
					date_start: CarOwners.date_start,
					owner_id: CarOwners.owner_id,
				},
			})
			.from(Cars)
			.innerJoin(Owners, eq(Cars.current_owner_id, Owners.id))
			.innerJoin(
				CarOwners,
				and(
					eq(Cars.id, CarOwners.car_id),
					eq(Cars.current_owner_id, CarOwners.owner_id),
					sql`${CarOwners.date_end} IS NULL`
				)
			)
			.where(and(eq(Cars.id, id), eq(Owners.user_id, userId)));

		if (!existing || !existing.car || !existing.owner) {
			return c.json({ error: 'Unauthorized' }, 403);
		}

		await db.insert(CarsPending).values({
			...existing.car,
			id: crypto.randomUUID(),
			car_id: existing.car.id,
			created_at: Date.now(),
			current_owner_id: body.owner_date_end
				? null
				: existing.car.current_owner_id,
			destroyed: body.destroyed,
			manufacture_date: `${body.manufacture_date}T00:00:00.000Z`,
			sale_date: `${body.sale_date}T00:00:00.000Z`,
			sale_dealer_city: body.sale_dealer_location?.city,
			sale_dealer_country: body.sale_dealer_location?.country,
			sale_dealer_name: body.sale_dealer_name,
			sale_dealer_state: body.sale_dealer_location?.state,
			sale_msrp: body.sale_msrp,
			sequence: body.sequence,
			shipping_city: body.shipping_location?.city,
			shipping_country: body.shipping_location?.country,
			shipping_date: `${body.shipping_date}T00:00:00.000Z`,
			shipping_state: body.shipping_location?.state,
			shipping_vessel: body.shipping_vessel,
			status: 'pending',
		});

		const ownershipChanged =
			existing.owner.date_start?.split('T')[0] !==
				body.owner_date_start ||
			existing.owner.date_end?.split('T')[0] !== body.owner_date_end;

		if (ownershipChanged) {
			await db.insert(CarOwnersPending).values({
				car_id: id,
				created_at: Date.now(),
				date_end: body.owner_date_end
					? `${body.owner_date_end}T00:00:00.000Z`
					: null,
				date_start: `${body.owner_date_start}T00:00:00.000Z`,
				id: crypto.randomUUID(),
				owner_id: existing.owner.owner_id,
				status: 'pending',
			});
		}

		const resend = new Resend(c.env.RESEND_API_KEY);

		await resend.emails.send({
			from: 'Miata Registry <support@miataregistry.com>',
			to: 'mattcongrove@gmail.com',
			subject: 'Miata Registry: New Car Change Request',
			html: `
				<h2>New Change Request</h2>
				<p><strong>Car ID:</strong> ${existing.car.id}</p>
				${ownershipChanged ? `<p><strong>Owner ID:</strong> ${existing.owner.owner_id}</p>` : ''}
			`,
		});

		return c.json({ success: true });
	} catch (error: unknown) {
		console.error('Error updating car:', error);

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

export default carsRouter;
