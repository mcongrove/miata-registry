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
import { eq, sql } from 'drizzle-orm';
import { createDb } from '../db';
import { CarOwners, Cars, Editions, News, Owners } from '../db/schema';
import {
	buildAboutBotContent,
	buildCarPageMeta,
	buildEditionsBotContent,
	buildNewsPageMeta,
	buildNotFoundHtml,
	buildRarityBotContent,
	injectPageMeta,
	STATIC_PAGE_META,
	type PageMeta,
} from './botContent';
import { DEFAULT_DESCRIPTION } from './constants';
import { editionsToBotRows, fetchEditionsData } from './editions';
import { isCarIndexable, isValidUuid } from './indexing';

const fetchSiteStats = async (db: D1Database) => {
	const drizzle = createDb(db);

	const [carsWithOwners] = await drizzle
		.select({ count: sql<number>`count(*)` })
		.from(Cars)
		.where(sql`current_owner_id is not null`);
	const [totalCars] = await drizzle
		.select({ count: sql<number>`count(*)` })
		.from(Cars);
	const [uniqueCountries] = await drizzle
		.select({ count: sql<number>`count(distinct country)` })
		.from(Owners);
	const [uniqueEditions] = await drizzle
		.select({ count: sql<number>`count(distinct id)` })
		.from(Editions);

	return {
		cars: totalCars.count,
		claimedCars: carsWithOwners.count,
		countries: uniqueCountries.count,
		editions: uniqueEditions.count,
	};
};

const fetchCarForBot = async (db: D1Database, carId: string) => {
	const drizzle = createDb(db);

	const [car] = await drizzle
		.select({
			current_owner_id: Cars.current_owner_id,
			id: Cars.id,
			rarity_score: Cars.rarity_score,
			sequence: Cars.sequence,
			story: Cars.story,
			vin: Cars.vin,
			mileage: Cars.mileage,
			edition: {
				color: Editions.color,
				description: Editions.description,
				name: Editions.name,
				total_produced: Editions.total_produced,
				year: Editions.year,
			},
		})
		.from(Cars)
		.innerJoin(Editions, eq(Cars.edition_id, Editions.id))
		.where(eq(Cars.id, carId))
		.limit(1);

	if (!car) {
		return null;
	}

	const [ownerHistory] = await drizzle
		.select({ count: sql<number>`count(*)` })
		.from(CarOwners)
		.where(eq(CarOwners.car_id, carId));

	return {
		...car,
		owner_history_count: ownerHistory?.count ?? 0,
	};
};

const fetchNewsForBot = async (db: D1Database, articleId: string) => {
	const drizzle = createDb(db);
	const now = new Date().toISOString();

	const [article] = await drizzle
		.select({
			body: News.body,
			id: News.id,
			publish_date: News.publish_date,
			title: News.title,
		})
		.from(News)
		.where(eq(News.id, articleId))
		.limit(1);

	if (!article || article.publish_date > now) {
		return null;
	}

	return article;
};

const registryHasNonDefaultView = (searchParams: URLSearchParams): boolean => {
	if (searchParams.has('filter')) {
		return true;
	}

	const page = searchParams.get('page');

	return Boolean(page && page !== '1');
};

export const resolveBotPageMeta = async (
	db: D1Database,
	pathname: string,
	searchParams: URLSearchParams
): Promise<PageMeta | 'not_found' | null> => {
	if (pathname === '/registry/editions') {
		const editions = await fetchEditionsData(db);

		return {
			...STATIC_PAGE_META['/registry/editions'],
			botContent: buildEditionsBotContent(editionsToBotRows(editions)),
		};
	}

	const carMatch = pathname.match(/^\/registry\/([^/]+)$/);

	if (carMatch) {
		const carId = carMatch[1];

		if (carId === 'editions' || !isValidUuid(carId)) {
			return 'not_found';
		}

		const car = await fetchCarForBot(db, carId);

		if (!car) {
			return 'not_found';
		}

		return buildCarPageMeta(
			car,
			isCarIndexable({
				current_owner_id: car.current_owner_id,
				mileage: car.mileage,
				owner_history_count: car.owner_history_count,
				story: car.story,
				vin: car.vin,
			})
		);
	}

	const newsMatch = pathname.match(/^\/news\/([^/]+)$/);

	if (newsMatch) {
		const article = await fetchNewsForBot(db, newsMatch[1]);

		if (!article) {
			return 'not_found';
		}

		return buildNewsPageMeta(article);
	}

	if (pathname === '/rarity') {
		return {
			...STATIC_PAGE_META['/rarity'],
			botContent: buildRarityBotContent(),
		};
	}

	if (pathname === '/about') {
		const stats = await fetchSiteStats(db);

		return {
			...STATIC_PAGE_META['/about'],
			botContent: buildAboutBotContent(stats),
		};
	}

	if (STATIC_PAGE_META[pathname]) {
		const meta = { ...STATIC_PAGE_META[pathname] };

		if (pathname === '/registry' && registryHasNonDefaultView(searchParams)) {
			return {
				...meta,
				noindex: true,
				path: '/registry',
			};
		}

		return meta;
	}

	return null;
};

export const isKnownSpaRoute = (pathname: string): boolean => {
	if (STATIC_PAGE_META[pathname]) {
		return true;
	}

	if (pathname.match(/^\/registry\/[^/]+$/)) {
		return true;
	}

	if (pathname.match(/^\/news\/[^/]+$/)) {
		return true;
	}

	return false;
};

export const buildBotHtmlResponse = (
	html: string,
	meta: PageMeta
): Response => {
	const body = injectPageMeta(html, meta);

	return new Response(body, {
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
		},
	});
};

export const buildBotNotFoundResponse = (message?: string): Response =>
	new Response(buildNotFoundHtml(message), {
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
		},
		status: 404,
	});

export const buildDefaultBotHtml = (html: string, pathname: string): Response =>
	buildBotHtmlResponse(html, {
		title: 'Miata Registry',
		description: DEFAULT_DESCRIPTION,
		path: pathname,
	});
