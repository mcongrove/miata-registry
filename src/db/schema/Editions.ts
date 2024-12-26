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

import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const Editions = sqliteTable('editions', {
	color: text('color').notNull(),
	description: text('description'),
	generation: text('generation').notNull(),
	id: text('id').primaryKey(),
	image_car_id: text('image_car_id'),
	name: text('name').notNull(),
	total_produced: integer('total_produced'),
	year: integer('year').notNull(),
});
