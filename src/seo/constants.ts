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

export const BASE_URL = 'https://miataregistry.com';

export const DEFAULT_DESCRIPTION =
	'A community-driven project documenting the history of limited edition Mazda Miatas.';

export const SEO_SITEMAP_KEY = 'seo:sitemap:v3';
export const SEO_EDITIONS_KEY = 'seo:editions.json';

export const SEO_SITEMAP_TTL = 60 * 60 * 24;
export const SEO_EDITIONS_TTL = 60 * 60 * 24 * 7;

export const SITEMAP_MAX_URLS = 5000;
export const STATIC_SITEMAP_LASTMOD = '2026-07-12';

export const STATIC_SITEMAP_PAGES = [
	{ path: '/', changefreq: 'weekly', priority: '1.0' },
	{ path: '/registry', changefreq: 'daily', priority: '0.9' },
	{
		path: '/registry/editions',
		changefreq: 'weekly',
		priority: '0.8',
	},
	{ path: '/news', changefreq: 'weekly', priority: '0.7' },
	{ path: '/rarity', changefreq: 'monthly', priority: '0.7' },
	{ path: '/about', changefreq: 'monthly', priority: '0.6' },
	{ path: '/legal', changefreq: 'monthly', priority: '0.3' },
] as const;

export const SPA_ROUTES = new Set([
	'/',
	'/about',
	'/legal',
	'/moderation',
	'/news',
	'/rarity',
	'/registry',
	'/registry/editions',
]);

export const ASSET_PATH_PATTERN =
	/\.(?:avif|css|gif|ico|jpeg|jpg|js|json|map|mp4|pdf|png|svg|txt|webmanifest|webp|woff2?|xml)$/i;
