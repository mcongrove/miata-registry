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

import type { D1Database, KVNamespace } from '@cloudflare/workers-types';
import {
	SEO_EDITIONS_KEY,
	SEO_EDITIONS_TTL,
	SEO_SITEMAP_KEY,
	SEO_SITEMAP_TTL,
} from './constants';
import { fetchEditionsData } from './editions';
import {
	generateCarChunkSitemapXml,
	generateSitemap,
	generateStaticSitemapXml,
} from './sitemap';

export type SeoBindings = {
	DB: D1Database;
	CACHE: KVNamespace;
};

const xmlHeaders = {
	'Cache-Control': 'public, max-age=3600',
	'Content-Type': 'application/xml; charset=utf-8',
};

const jsonHeaders = {
	'Cache-Control': 'public, max-age=3600',
	'Content-Type': 'application/json; charset=utf-8',
};

export const handleSitemapRequest = async (
	env: SeoBindings
): Promise<Response> => {
	const cached = await env.CACHE.get(SEO_SITEMAP_KEY);

	if (cached) {
		return new Response(cached, { headers: xmlHeaders });
	}

	const result = await generateSitemap(env.DB);

	await env.CACHE.put(SEO_SITEMAP_KEY, result.xml, {
		expirationTtl: SEO_SITEMAP_TTL,
	});

	return new Response(result.xml, { headers: xmlHeaders });
};

export const handleStaticSitemapRequest = async (
	env: SeoBindings
): Promise<Response> => {
	const xml = await generateStaticSitemapXml(env.DB);

	return new Response(xml, { headers: xmlHeaders });
};

export const handleCarChunkSitemapRequest = async (
	env: SeoBindings,
	chunk: number
): Promise<Response> => {
	const xml = await generateCarChunkSitemapXml(env.DB, chunk);

	if (!xml) {
		return new Response('Not found', { status: 404 });
	}

	return new Response(xml, { headers: xmlHeaders });
};

export const handleEditionsJsonRequest = async (
	env: SeoBindings
): Promise<Response> => {
	const cached = await env.CACHE.get(SEO_EDITIONS_KEY);

	if (cached) {
		return new Response(cached, { headers: jsonHeaders });
	}

	const editions = await fetchEditionsData(env.DB);
	const body = JSON.stringify(editions);

	await env.CACHE.put(SEO_EDITIONS_KEY, body, {
		expirationTtl: SEO_EDITIONS_TTL,
	});

	return new Response(body, { headers: jsonHeaders });
};
