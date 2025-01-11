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

import { and, desc, eq, lte } from 'drizzle-orm';
import { Hono } from 'hono';
import { createDb } from '../../db';
import { News } from '../../db/schema/News';
import type { Bindings } from '../types';

const CACHE_TTL = {
	NEWS_LIST: 60 * 60 * 24, // 1 day
	NEWS_DETAIL: 60 * 60 * 24, // 1 day
	FEATURED_NEWS: 60 * 60 * 24, // 1 day
};

const newsRouter = new Hono<{ Bindings: Bindings }>();

newsRouter.get('/', async (c) => {
	try {
		const isDev = c.env.NODE_ENV === 'development';
		const cacheKey = 'news:list';

		if (!isDev) {
			const cached = await c.env.CACHE.get(cacheKey);

			if (cached) {
				const response = c.json(JSON.parse(cached));

				response.headers.set('X-Cache', 'HIT');

				return response;
			}
		}

		const db = createDb(c.env.DB);
		const now = new Date().toISOString();

		const news = await db
			.select({
				id: News.id,
				title: News.title,
				slug: News.slug,
				body: News.body,
				publish_date: News.publish_date,
			})
			.from(News)
			.where(isDev ? undefined : lte(News.publish_date, now))
			.orderBy(desc(News.publish_date));

		const newsWithExcerpt = news.map((item) => ({
			...item,
			excerpt: item.body.split('\n')[0] + '...',
			body: undefined,
		}));

		if (!isDev) {
			await c.env.CACHE.put(cacheKey, JSON.stringify(newsWithExcerpt), {
				expirationTtl: CACHE_TTL.NEWS_LIST,
			});
		}

		return c.json(newsWithExcerpt);
	} catch (error) {
		console.error('Error fetching news:', error);

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

newsRouter.get('/featured', async (c) => {
	try {
		const cacheKey = 'news:featured';
		const cached = await c.env.CACHE.get(cacheKey);

		if (cached) {
			const response = c.json(JSON.parse(cached));

			response.headers.set('X-Cache', 'HIT');

			return response;
		}

		const db = createDb(c.env.DB);
		const now = new Date().toISOString();

		const [result] = await db
			.select({
				id: News.id,
				title_short: News.title_short,
			})
			.from(News)
			.where(and(lte(News.publish_date, now), eq(News.featured, 1)))
			.orderBy(desc(News.publish_date))
			.limit(1);

		if (result) {
			await c.env.CACHE.put(cacheKey, JSON.stringify(result), {
				expirationTtl: CACHE_TTL.FEATURED_NEWS,
			});
		}

		return c.json(result || null);
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

newsRouter.get('/:id', async (c) => {
	try {
		const id = c.req.param('id');
		const cacheKey = `news:detail:${id}`;
		const isDev = c.env.NODE_ENV === 'development';

		if (!isDev) {
			const cached = await c.env.CACHE.get(cacheKey);

			if (cached) {
				const response = c.json(JSON.parse(cached));

				response.headers.set('X-Cache', 'HIT');

				return response;
			}
		}

		const db = createDb(c.env.DB);
		const now = new Date().toISOString();

		const [news] = await db
			.select()
			.from(News)
			.where(
				isDev
					? eq(News.id, id)
					: and(eq(News.id, id), lte(News.publish_date, now))
			);

		if (!news) {
			return c.json({ error: 'News article not found' }, 404);
		}

		if (!isDev) {
			await c.env.CACHE.put(cacheKey, JSON.stringify(news), {
				expirationTtl: CACHE_TTL.NEWS_DETAIL,
			});
		}

		return c.json(news);
	} catch (error) {
		console.error('Error fetching news article:', error);

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
