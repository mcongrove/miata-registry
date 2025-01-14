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
import { TipStatus } from '../../types/Claim';

export const Tips = sqliteTable('tips', {
	created_at: integer('created_at').notNull(),
	edition_name: text('edition_name').notNull(),
	id: text('id').primaryKey(),
	information: text('information'),
	owner_date_start: text('owner_date_start'),
	owner_location: text('owner_location'),
	owner_name: text('owner_name'),
	sequence: text('sequence'),
	status: text('status', {
		enum: ['approved', 'pending', 'rejected'],
	})
		.notNull()
		.default(TipStatus.PENDING),
	user_id: text('user_id'),
	vin: text('vin'),
});
