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

import { and, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { createDb } from '../../db';
import { News } from '../../db/schema/News';
import type { Bindings } from '../types';

const CACHE_TTL = {
	FEATURED_NEWS: 60 * 60 * 24, // 1 day
};

const newsRouter = new Hono<{ Bindings: Bindings }>();

newsRouter.get('/featured', async (c) => {
	try {
		const cacheKey = 'news:featured';
		const cached = await c.env.CACHE.get(cacheKey);

		if (cached) {
			return c.json(JSON.parse(cached));
		}

		const db = createDb(c.env.DB);

		const news = await db
			.select({
				body: News.body,
				created_at: News.created_at,
				title_short: News.title_short,
				title: News.title,
			})
			.from(News)
			.where(and(eq(News.published, 1), eq(News.featured, 1)))
			.orderBy(desc(News.created_at))
			.limit(1);

		const result = news[0] || null;

		await c.env.CACHE.put(cacheKey, JSON.stringify(result), {
			expirationTtl: CACHE_TTL.FEATURED_NEWS,
		});

		return c.json(result);
	} catch (error) {
		console.error('Error fetching featured news:', error);

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

export default newsRouter;
