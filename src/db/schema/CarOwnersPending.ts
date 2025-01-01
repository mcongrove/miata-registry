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

export const CarOwnersPending = sqliteTable('car_owners_pending', {
	car_id: text('car_id').notNull(),
	created_at: integer('created_at').notNull(),
	date_end: text('date_end'),
	date_start: text('date_start'),
	id: text('id').primaryKey(),
	owner_id: text('owner_id').notNull(),
	status: text('status', { enum: ['pending', 'approved', 'rejected'] })
		.notNull()
		.default('pending'),
});
