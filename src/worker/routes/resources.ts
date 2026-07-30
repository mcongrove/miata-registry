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

import { and, asc, eq, inArray, lte } from 'drizzle-orm';
import { Hono } from 'hono';
import { createDb } from '../../db';
import { Editions } from '../../db/schema/Editions';
import { ResourceAssociations, Resources } from '../../db/schema/Resources';
import { editionSlug } from '../../utils/editionSlug';
import type { Bindings } from '../types';

const CACHE_TTL = {
	LIST: 60 * 60 * 24,
	DETAIL: 60 * 60 * 24,
};

const resourcesRouter = new Hono<{ Bindings: Bindings }>();

type AssociationRow = {
	resource_id: string;
	type: string;
	value: string;
};

const enrichAssociations = async (
	db: ReturnType<typeof createDb>,
	rows: AssociationRow[]
) => {
	const editionIds = [
		...new Set(
			rows.filter((row) => row.type === 'edition').map((row) => row.value)
		),
	];

	const editions =
		editionIds.length === 0
			? []
			: await db
					.select({
						id: Editions.id,
						name: Editions.name,
						year: Editions.year,
					})
					.from(Editions)
					.where(inArray(Editions.id, editionIds));

	const editionById = new Map(
		editions.map((edition) => [edition.id, edition])
	);

	return rows.map((row) => {
		if (row.type === 'edition') {
			const edition = editionById.get(row.value);

			return {
				type: row.type,
				value: row.value,
				label: edition ? `${edition.year} ${edition.name}` : row.value,
				slug: edition ? editionSlug(edition.year, edition.name) : null,
			};
		}

		return {
			type: row.type,
			value: row.value,
			label: row.value,
			slug: null as string | null,
		};
	});
};

const loadAssociationsByResourceIds = async (
	db: ReturnType<typeof createDb>,
	resourceIds: string[]
) => {
	const byResource = new Map<
		string,
		Awaited<ReturnType<typeof enrichAssociations>>
	>();

	if (resourceIds.length === 0) {
		return byResource;
	}

	const rows = await db
		.select({
			resource_id: ResourceAssociations.resource_id,
			type: ResourceAssociations.type,
			value: ResourceAssociations.value,
		})
		.from(ResourceAssociations)
		.where(inArray(ResourceAssociations.resource_id, resourceIds));

	const enriched = await enrichAssociations(db, rows);

	rows.forEach((row, index) => {
		const list = byResource.get(row.resource_id) ?? [];
		list.push(enriched[index]);
		byResource.set(row.resource_id, list);
	});

	return byResource;
};

const resourceIdsForAssociation = async (
	db: ReturnType<typeof createDb>,
	type: string,
	value: string
) => {
	const matches = await db
		.select({
			resource_id: ResourceAssociations.resource_id,
		})
		.from(ResourceAssociations)
		.where(
			and(
				eq(ResourceAssociations.type, type),
				eq(ResourceAssociations.value, value)
			)
		);

	return matches.map((row) => row.resource_id);
};

resourcesRouter.get('/', async (c) => {
	try {
		const isDev = c.env.NODE_ENV === 'development';
		const edition = c.req.query('edition')?.trim() || '';
		const generation = c.req.query('generation')?.trim() || '';
		const tag = c.req.query('tag')?.trim() || '';
		const kind = c.req.query('kind')?.trim() || '';
		const featured = c.req.query('featured')?.trim() || '';

		const cacheKey = `resources:list:v4:${edition}:${generation}:${tag}:${kind}:${featured}`;

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
		const conditions = [];

		if (!isDev) {
			conditions.push(lte(Resources.publish_date, now));
		}

		if (kind) {
			conditions.push(eq(Resources.kind, kind));
		}

		if (featured === '1' || featured === 'true') {
			conditions.push(eq(Resources.featured, 1));
		}

		if (edition || generation || tag) {
			let resourceIds: string[] | null = null;

			if (edition) {
				resourceIds = await resourceIdsForAssociation(
					db,
					'edition',
					edition
				);
			}

			if (generation) {
				const generationIds = await resourceIdsForAssociation(
					db,
					'generation',
					generation
				);

				resourceIds = resourceIds
					? resourceIds.filter((id) => generationIds.includes(id))
					: generationIds;
			}

			if (tag) {
				const tagIds = await resourceIdsForAssociation(db, 'tag', tag);

				resourceIds = resourceIds
					? resourceIds.filter((id) => tagIds.includes(id))
					: tagIds;
			}

			if (!resourceIds || resourceIds.length === 0) {
				return c.json([]);
			}

			conditions.push(inArray(Resources.id, resourceIds));
		}

		const resources = await db
			.select({
				id: Resources.id,
				title: Resources.title,
				summary: Resources.summary,
				kind: Resources.kind,
				href: Resources.href,
				file_key: Resources.file_key,
				file_mime: Resources.file_mime,
				file_bytes: Resources.file_bytes,
				file_name: Resources.file_name,
				publish_date: Resources.publish_date,
				sort_order: Resources.sort_order,
				featured: Resources.featured,
			})
			.from(Resources)
			.where(conditions.length ? and(...conditions) : undefined)
			.orderBy(
				asc(Resources.sort_order),
				asc(Resources.kind),
				asc(Resources.title)
			);

		const associationsById = await loadAssociationsByResourceIds(
			db,
			resources.map((resource) => resource.id)
		);

		const payload = resources.map((resource) => ({
			...resource,
			associations: associationsById.get(resource.id) ?? [],
		}));

		if (!isDev) {
			await c.env.CACHE.put(cacheKey, JSON.stringify(payload), {
				expirationTtl: CACHE_TTL.LIST,
			});
		}

		return c.json(payload);
	} catch (error) {
		console.error('Error fetching resources:', error);

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

resourcesRouter.get('/:id', async (c) => {
	try {
		const id = c.req.param('id');
		const isDev = c.env.NODE_ENV === 'development';
		const cacheKey = `resources:detail:v2:${id}`;

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

		const [resource] = await db
			.select()
			.from(Resources)
			.where(
				isDev
					? eq(Resources.id, id)
					: and(
							eq(Resources.id, id),
							lte(Resources.publish_date, now)
						)
			)
			.limit(1);

		if (!resource) {
			return c.json({ error: 'Resource not found' }, 404);
		}

		const associationsById = await loadAssociationsByResourceIds(db, [
			resource.id,
		]);

		const payload = {
			...resource,
			associations: associationsById.get(resource.id) ?? [],
		};

		if (!isDev) {
			await c.env.CACHE.put(cacheKey, JSON.stringify(payload), {
				expirationTtl: CACHE_TTL.DETAIL,
			});
		}

		return c.json(payload);
	} catch (error) {
		console.error('Error fetching resource:', error);

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

export default resourcesRouter;
