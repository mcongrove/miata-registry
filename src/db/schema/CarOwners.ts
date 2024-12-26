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

import { relations } from 'drizzle-orm';
import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { Cars } from './Cars';
import { Owners } from './Owners';

export const CarOwners = sqliteTable(
	'car_owners',
	{
		car_id: text('car_id')
			.references(() => Cars.id)
			.notNull(),
		owner_id: text('owner_id')
			.references(() => Owners.id)
			.notNull(),
		date_start: text('date_start'),
		date_end: text('date_end'),
	},
	(table) => ({
		pk: primaryKey({
			columns: [table.car_id, table.owner_id, table.date_start],
		}),
	})
);

export const carOwnersRelations = relations(CarOwners, ({ one }) => ({
	car: one(Cars, {
		fields: [CarOwners.car_id],
		references: [Cars.id],
	}),
	owner: one(Owners, {
		fields: [CarOwners.owner_id],
		references: [Owners.id],
	}),
}));
