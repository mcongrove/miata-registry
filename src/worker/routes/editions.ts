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

import { asc, desc, eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { createDb } from '../../db';
import { Cars, Editions, Owners } from '../../db/schema';
import { editionSlug, findEditionBySlug } from '../../utils/editionSlug';
import {
	carDisplayRarityScoreExpr,
	editionRarityWithAgeExpr,
} from '../utils/rarityScoreSql';
import type { Bindings } from '../types';

const CACHE_TTL = {
	EDITIONS: 60 * 60 * 24 * 7, // 7 days
	EDITIONS_NAMES: 60 * 60 * 24 * 7, // 7 days
	EDITION_SLUG: 60 * 60 * 24, // 1 day
};

const EDITIONS_ALL_CACHE_KEY = 'editions:all:v3';

const EDITIONS_NAMES_CACHE_KEY = 'editions:names:v2';

const editionSlugCacheKey = (slug: string) => `editions:slug:v3:${slug}`;

const editionsRouter = new Hono<{ Bindings: Bindings }>();

editionsRouter.get('/', async (c) => {
	try {
		const cached = await c.env.CACHE.get(EDITIONS_ALL_CACHE_KEY);

		if (cached && c.env.NODE_ENV !== 'development') {
			const response = c.json(JSON.parse(cached));

			response.headers.set('X-Cache', 'HIT');

			return response;
		}

		const db = createDb(c.env.DB);

		const editionsWithCounts = await db
			.select({
				claimed:
					sql<number>`COUNT(DISTINCT CASE WHEN ${Cars.current_owner_id} IS NOT NULL THEN ${Cars.id} END)`.as(
						'claimed'
					),
				color: Editions.color,
				colors: Editions.colors,
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
				rarity_score: editionRarityWithAgeExpr,
				total_produced: Editions.total_produced,
				year: Editions.year,
			})
			.from(Editions)
			.leftJoin(Cars, eq(Cars.edition_id, Editions.id))
			.groupBy(
				sql`${Editions.id}, ${Editions.name}, ${Editions.color}, ${Editions.colors}, ${Editions.generation}, ${Editions.year}, ${Editions.total_produced}, ${Editions.image_car_id}, ${Editions.rarity_score}`
			)
			.orderBy(asc(Editions.year), asc(Editions.name));

		await c.env.CACHE.put(
			EDITIONS_ALL_CACHE_KEY,
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

editionsRouter.get('/slug/:slug', async (c) => {
	try {
		const slug = c.req.param('slug').toLowerCase();
		const cacheKey = editionSlugCacheKey(slug);
		const cached = await c.env.CACHE.get(cacheKey);

		if (cached && c.env.NODE_ENV !== 'development') {
			const response = c.json(JSON.parse(cached));

			response.headers.set('X-Cache', 'HIT');

			return response;
		}

		const db = createDb(c.env.DB);

		const editionRows = await db
			.select({
				id: Editions.id,
				name: Editions.name,
				year: Editions.year,
			})
			.from(Editions);

		const matched = findEditionBySlug(editionRows, slug);

		if (!matched) {
			return c.json({ error: 'Edition not found' }, 404);
		}

		const [edition] = await db
			.select({
				claimed:
					sql<number>`COUNT(DISTINCT CASE WHEN ${Cars.current_owner_id} IS NOT NULL THEN ${Cars.id} END)`.as(
						'claimed'
					),
				color: Editions.color,
				colors: Editions.colors,
				description: Editions.description,
				generation: Editions.generation,
				id: Editions.id,
				image_car_id: Editions.image_car_id,
				in_registry: sql<number>`COUNT(DISTINCT ${Cars.id})`.as(
					'in_registry'
				),
				name: Editions.name,
				rarity_score: editionRarityWithAgeExpr,
				total_produced: Editions.total_produced,
				year: Editions.year,
			})
			.from(Editions)
			.leftJoin(Cars, eq(Cars.edition_id, Editions.id))
			.where(eq(Editions.id, matched.id))
			.groupBy(
				sql`${Editions.id}, ${Editions.name}, ${Editions.color}, ${Editions.colors}, ${Editions.description}, ${Editions.generation}, ${Editions.year}, ${Editions.total_produced}, ${Editions.image_car_id}, ${Editions.rarity_score}`
			)
			.limit(1);

		if (!edition) {
			return c.json({ error: 'Edition not found' }, 404);
		}

		const cars = await db
			.select({
				current_owner: {
					country: sql`COALESCE(${Owners.country}, '')`.as('country'),
					name: sql`COALESCE(${Owners.name}, '')`.as('name'),
				},
				destroyed: Cars.destroyed,
				id: Cars.id,
				rarity_score: carDisplayRarityScoreExpr,
				sequence: Cars.sequence,
				vin: Cars.vin,
			})
			.from(Cars)
			.leftJoin(Editions, eq(Cars.edition_id, Editions.id))
			.leftJoin(Owners, eq(Cars.current_owner_id, Owners.id))
			.where(eq(Cars.edition_id, matched.id))
			.orderBy(desc(Cars.updated_date))
			.limit(20);

		const payload = {
			edition: {
				...edition,
				slug: editionSlug(edition.year, edition.name),
			},
			cars,
		};

		await c.env.CACHE.put(cacheKey, JSON.stringify(payload), {
			expirationTtl: CACHE_TTL.EDITION_SLUG,
		});

		return c.json(payload);
	} catch (error) {
		console.error('Error fetching edition by slug:', error);

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
		const cached = await c.env.CACHE.get(EDITIONS_NAMES_CACHE_KEY);

		if (cached && c.env.NODE_ENV !== 'development') {
			const response = c.json(JSON.parse(cached));

			response.headers.set('X-Cache', 'HIT');

			return response;
		}

		const db = createDb(c.env.DB);

		const editionsWithCounts = await db
			.select({
				count: sql<number>`COUNT(${Cars.id})`.as('count'),
				generation: Editions.generation,
				id: Editions.id,
				name: sql<string>`CONCAT(${Editions.year}, ' ', ${Editions.name})`.as(
					'name'
				),
				year: Editions.year,
			})
			.from(Editions)
			.leftJoin(Cars, eq(Cars.edition_id, Editions.id))
			.orderBy(asc(Editions.year), asc(Editions.name))
			.groupBy(
				sql`${Editions.id}, ${Editions.year}, ${Editions.name}, ${Editions.generation}`
			);

		await c.env.CACHE.put(
			EDITIONS_NAMES_CACHE_KEY,
			JSON.stringify(editionsWithCounts),
			{
				expirationTtl: CACHE_TTL.EDITIONS_NAMES,
			}
		);

		return c.json(editionsWithCounts);
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
