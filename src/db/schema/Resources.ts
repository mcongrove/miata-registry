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

import {
	integer,
	primaryKey,
	sqliteTable,
	text,
} from 'drizzle-orm/sqlite-core';

export const Resources = sqliteTable('resources', {
	id: text('id').primaryKey(),
	kind: text('kind').notNull(),
	title: text('title').notNull(),
	summary: text('summary').notNull(),
	body: text('body'),
	href: text('href'),
	file_key: text('file_key'),
	file_name: text('file_name'),
	file_mime: text('file_mime'),
	file_bytes: integer('file_bytes'),
	publish_date: text('publish_date').notNull(),
	sort_order: integer('sort_order').notNull().default(0),
	featured: integer('featured').notNull().default(0),
	created_at: text('created_at').notNull(),
	updated_at: text('updated_at').notNull(),
});

export const ResourceAssociations = sqliteTable(
	'resource_associations',
	{
		resource_id: text('resource_id')
			.notNull()
			.references(() => Resources.id),
		type: text('type').notNull(),
		value: text('value').notNull(),
	},
	(table) => ({
		pk: primaryKey({
			columns: [table.resource_id, table.type, table.value],
		}),
	})
);
