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

import type { D1Database } from '@cloudflare/workers-types';
import { desc, lte, sql } from 'drizzle-orm';
import { createDb } from '../db';
import { Cars, News } from '../db/schema';
import {
	BASE_URL,
	SITEMAP_MAX_URLS,
	STATIC_SITEMAP_LASTMOD,
	STATIC_SITEMAP_PAGES,
} from './constants';

export type SitemapUrl = {
	loc: string;
	lastmod: string;
	changefreq?: string;
	priority?: string;
};

const escapeXml = (value: string): string =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');

const renderUrl = (url: SitemapUrl): string => {
	const parts = [
		`    <loc>${escapeXml(url.loc)}</loc>`,
		`    <lastmod>${escapeXml(url.lastmod)}</lastmod>`,
	];

	if (url.changefreq) {
		parts.push(
			`    <changefreq>${escapeXml(url.changefreq)}</changefreq>`
		);
	}

	if (url.priority) {
		parts.push(`    <priority>${escapeXml(url.priority)}</priority>`);
	}

	return `  <url>\n${parts.join('\n')}\n  </url>`;
};

export const renderUrlSet = (urls: SitemapUrl[]): string =>
	`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(renderUrl).join('\n')}\n</urlset>`;

export const renderSitemapIndex = (sitemaps: SitemapUrl[]): string =>
	`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps.map(renderUrl).join('\n')}\n</sitemapindex>`;

const toLastmod = (value?: string | null): string => {
	if (!value) {
		return STATIC_SITEMAP_LASTMOD;
	}

	return value.slice(0, 10);
};

export const INDEXABLE_CARS_SQL = sql`
	${Cars.current_owner_id} IS NOT NULL
	AND (
		(${Cars.story} IS NOT NULL AND TRIM(${Cars.story}) != '')
		OR EXISTS (SELECT 1 FROM car_owners co WHERE co.car_id = ${Cars.id})
		OR (${Cars.vin} IS NOT NULL AND TRIM(${Cars.vin}) != '')
		OR ${Cars.mileage} IS NOT NULL
	)
`;

export const fetchStaticSitemapUrls = (): SitemapUrl[] =>
	STATIC_SITEMAP_PAGES.map((page) => ({
		loc: `${BASE_URL}${page.path === '/' ? '' : page.path}`,
		lastmod: STATIC_SITEMAP_LASTMOD,
		changefreq: page.changefreq,
		priority: page.priority,
	}));

export const fetchNewsSitemapUrls = async (
	db: D1Database
): Promise<SitemapUrl[]> => {
	const drizzle = createDb(db);
	const now = new Date().toISOString();

	const articles = await drizzle
		.select({
			id: News.id,
			publish_date: News.publish_date,
		})
		.from(News)
		.where(lte(News.publish_date, now))
		.orderBy(desc(News.publish_date));

	return articles.map((article) => ({
		loc: `${BASE_URL}/news/${article.id}`,
		lastmod: toLastmod(article.publish_date),
		changefreq: 'monthly',
		priority: '0.6',
	}));
};

export const fetchIndexableCarUrls = async (
	db: D1Database
): Promise<SitemapUrl[]> => {
	const drizzle = createDb(db);

	const cars = await drizzle
		.select({
			id: Cars.id,
			updated_date: Cars.updated_date,
		})
		.from(Cars)
		.where(INDEXABLE_CARS_SQL)
		.orderBy(desc(Cars.updated_date));

	return cars.map((car) => ({
		loc: `${BASE_URL}/registry/${car.id}`,
		lastmod: toLastmod(car.updated_date),
		changefreq: 'weekly',
		priority: '0.5',
	}));
};

export type SitemapGeneration = {
	xml: string;
	chunkCount: number;
};

export const carSitemapPath = (chunk: number): string =>
	chunk === 0 ? '/sitemap/cars.xml' : `/sitemap/cars/${chunk}.xml`;

export const generateSitemap = async (
	db: D1Database
): Promise<SitemapGeneration> => {
	const carUrls = await fetchIndexableCarUrls(db);
	const chunkCount =
		carUrls.length === 0
			? 0
			: Math.ceil(carUrls.length / SITEMAP_MAX_URLS);
	const indexEntries: SitemapUrl[] = [
		{
			loc: `${BASE_URL}/sitemap/static.xml`,
			lastmod: STATIC_SITEMAP_LASTMOD,
		},
	];

	for (let index = 0; index < chunkCount; index += 1) {
		indexEntries.push({
			loc: `${BASE_URL}${carSitemapPath(index)}`,
			lastmod: STATIC_SITEMAP_LASTMOD,
		});
	}

	return {
		xml: renderSitemapIndex(indexEntries),
		chunkCount,
	};
};

export const generateStaticSitemapXml = async (
	db: D1Database
): Promise<string> => {
	const [staticUrls, newsUrls] = await Promise.all([
		Promise.resolve(fetchStaticSitemapUrls()),
		fetchNewsSitemapUrls(db),
	]);

	return renderUrlSet([...staticUrls, ...newsUrls]);
};

export const generateCarChunkSitemapXml = async (
	db: D1Database,
	chunk: number
): Promise<string | null> => {
	const carUrls = await fetchIndexableCarUrls(db);
	const start = chunk * SITEMAP_MAX_URLS;
	const slice = carUrls.slice(start, start + SITEMAP_MAX_URLS);

	if (slice.length === 0) {
		return null;
	}

	return renderUrlSet(slice);
};

export const countSitemapUrls = async (db: D1Database): Promise<number> => {
	const [staticCount, news, cars] = await Promise.all([
		Promise.resolve(STATIC_SITEMAP_PAGES.length),
		fetchNewsSitemapUrls(db),
		fetchIndexableCarUrls(db),
	]);

	return staticCount + news.length + cars.length;
};
