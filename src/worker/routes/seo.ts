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

import { Hono } from 'hono';
import {
	handleCarChunkSitemapRequest,
	handleEditionsJsonRequest,
	handleSitemapRequest,
	handleStaticSitemapRequest,
} from '../../seo/handlers';
import type { Bindings } from '../types';

const seoRouter = new Hono<{ Bindings: Bindings }>();

seoRouter.get('/sitemap.xml', async (c) => {
	try {
		return await handleSitemapRequest(c.env);
	} catch (error) {
		console.error('Error generating sitemap:', error);

		return c.text('Internal server error', 500);
	}
});

seoRouter.get('/sitemap/static.xml', async (c) => {
	try {
		return await handleStaticSitemapRequest(c.env);
	} catch (error) {
		console.error('Error generating static sitemap:', error);

		return c.text('Internal server error', 500);
	}
});

seoRouter.get('/sitemap/cars.xml', async (c) => {
	try {
		return await handleCarChunkSitemapRequest(c.env, 0);
	} catch (error) {
		console.error('Error generating car sitemap:', error);

		return c.text('Internal server error', 500);
	}
});

seoRouter.get('/sitemap/cars/:chunk.xml', async (c) => {
	try {
		const chunkParam = c.req.param('chunk') ?? '';
		const chunk = Number.parseInt(chunkParam, 10);

		if (Number.isNaN(chunk) || chunk < 0) {
			return c.text('Not found', 404);
		}

		return await handleCarChunkSitemapRequest(c.env, chunk);
	} catch (error) {
		console.error('Error generating car sitemap chunk:', error);

		return c.text('Internal server error', 500);
	}
});

seoRouter.get('/data/editions.json', async (c) => {
	try {
		return await handleEditionsJsonRequest(c.env);
	} catch (error) {
		console.error('Error generating editions.json:', error);

		return c.text('Internal server error', 500);
	}
});

export default seoRouter;
