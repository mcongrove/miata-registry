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

import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const OwnersPending = sqliteTable('owners_pending', {
	city: text('city'),
	country: text('country'),
	created_at: integer('created_at').notNull(),
	id: text('id').primaryKey(),
	links: text('links').$type<{
		instagram: string | null;
	}>(),
	name: text('name'),
	state: text('state'),
	status: text('status', { enum: ['pending', 'approved', 'rejected'] })
		.notNull()
		.default('pending'),
	user_id: text('user_id').notNull(),
});
