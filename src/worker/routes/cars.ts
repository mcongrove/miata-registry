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
import { eq, desc, and, sql, asc } from 'drizzle-orm';
import { Cars, Editions, CarOwners, Owners } from '../../db/schema';
import { createDb } from '../../db';
import type { Bindings } from '../types';

const carsRouter = new Hono<{ Bindings: Bindings }>();

// Get cars list with filtering, sorting, and pagination
carsRouter.get('/', async (c) => {
	try {
		const db = createDb(c.env.DB);
		const params = c.req.query();

		// Parse query parameters
		const filters = params.filters ? JSON.parse(params.filters) : [];
		const sortColumn = params.sortColumn || 'edition.year';
		const sortDirection = (params.sortDirection || 'asc') as 'asc' | 'desc';
		const page = parseInt(params.page || '1');
		const pageSize = Math.min(parseInt(params.pageSize || '50'), 50);

		// Build conditions first
		const conditions = [];

		for (const filter of filters) {
			switch (filter.type) {
				case 'generation':
					conditions.push(eq(Editions.generation, filter.value));
					break;
				case 'year':
					conditions.push(eq(Editions.year, parseInt(filter.value)));
					break;
				case 'country':
					conditions.push(eq(Owners.country, filter.value));
					break;
				case 'edition': {
					const [year, ...nameParts] = filter.value.split(' ');
					const name = nameParts.join(' ');
					conditions.push(
						and(
							eq(Editions.year, parseInt(year)),
							eq(Editions.name, name)
						)
					);
					break;
				}
			}
		}

		// Build the main query
		const baseQuery = db
			.select({
				id: Cars.id,
				sequence: Cars.sequence,
				edition: {
					year: Editions.year,
					generation: Editions.generation,
					name: Editions.name,
					color: Editions.color,
				},
				current_owner: {
					id: Owners.id,
					name: Owners.name,
					country: Owners.country,
				},
				total: sql<number>`count(*) OVER()`,
			})
			.from(Cars)
			.leftJoin(Editions, eq(Cars.edition_id, Editions.id))
			.leftJoin(Owners, eq(Cars.current_owner_id, Owners.id));

		// Apply filters if they exist
		const filteredQuery =
			conditions.length > 0
				? baseQuery.where(and(...conditions))
				: baseQuery;

		// Build sort conditions
		const sortConditions = [];
		const sortField = sortColumn.includes('.')
			? sortColumn.split('.')[1]
			: sortColumn;
		const sortFn = sortDirection === 'desc' ? desc : asc;

		// Primary sort (if specified)
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

		// Secondary sorts
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

		// Apply sorting and pagination
		const offset = (page - 1) * pageSize;
		const cars = await filteredQuery
			.orderBy(...sortConditions)
			.limit(pageSize)
			.offset(offset);

		const total = cars[0]?.total ?? 0;

		return c.json({
			cars: cars.map(({ total, ...car }) => car), // Remove total from each row
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		});
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

// Get single car
carsRouter.get('/:id', async (c) => {
	try {
		const db = createDb(c.env.DB);
		const id = c.req.param('id');

		const [carData] = await db
			.select({
				id: Cars.id,
				vin: Cars.vin,
				sequence: Cars.sequence,
				destroyed: Cars.destroyed,
				manufacture_date: Cars.manufacture_date,
				manufacture_city: Cars.manufacture_city,
				manufacture_country: Cars.manufacture_country,

				shipping_date: Cars.shipping_date,
				shipping_city: Cars.shipping_city,
				shipping_state: Cars.shipping_state,
				shipping_country: Cars.shipping_country,
				shipping_vessel: Cars.shipping_vessel,
				sale_date: Cars.sale_date,
				sale_msrp: Cars.sale_msrp,
				sale_dealer_name: Cars.sale_dealer_name,
				sale_dealer_city: Cars.sale_dealer_city,
				sale_dealer_state: Cars.sale_dealer_state,
				sale_dealer_country: Cars.sale_dealer_country,
				edition_id: Cars.edition_id,
				edition: {
					id: Editions.id,
					name: Editions.name,
					color: Editions.color,
					generation: Editions.generation,
					year: Editions.year,
					totalProduced: Editions.total_produced,
					description: Editions.description,
					imageCarId: Editions.image_car_id,
				},
				current_owner_id: Cars.current_owner_id,
				current_owner: {
					id: Owners.id,
					name: Owners.name,
					country: Owners.country,
					state: Owners.state,
					city: Owners.city,
				},
			})
			.from(Cars)
			.leftJoin(Editions, eq(Cars.edition_id, Editions.id))
			.leftJoin(Owners, eq(Cars.current_owner_id, Owners.id))
			.where(eq(Cars.id, id));

		if (!carData) {
			return c.json({ error: 'Car not found' }, 404);
		}

		// Get owner history in a separate query
		const ownerHistory = await db
			.select({
				id: Owners.id,
				name: Owners.name,
				country: Owners.country,
				state: Owners.state,
				city: Owners.city,
				date_start: CarOwners.date_start,
				date_end: CarOwners.date_end,
			})
			.from(CarOwners)
			.leftJoin(Owners, eq(CarOwners.owner_id, Owners.id))
			.where(eq(CarOwners.car_id, id))
			.orderBy(
				sql`CASE WHEN ${CarOwners.date_end} IS NULL THEN 0 ELSE 1 END`,
				desc(CarOwners.date_end)
			);

		return c.json({
			...carData,
			owner_history: ownerHistory,
		});
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

// Get single car summary
carsRouter.get('/:id/summary', async (c) => {
	try {
		const db = createDb(c.env.DB);
		const id = c.req.param('id');

		const [car] = await db
			.select({
				year: Editions.year,
				editionName: Editions.name,
				sequence: Cars.sequence,
				current_owner: {
					name: Owners.name,
					state: Owners.state,
					country: Owners.country,
				},
			})
			.from(Cars)
			.leftJoin(Editions, eq(Cars.edition_id, Editions.id))
			.leftJoin(Owners, eq(Cars.current_owner_id, Owners.id))
			.where(eq(Cars.id, id));

		if (!car) {
			return c.json({ error: 'Car not found' }, 404);
		}

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

export default carsRouter;