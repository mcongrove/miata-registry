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
import { Editions } from './Editions';
import { Owners } from './Owners';

export const Cars = sqliteTable('cars', {
	color: text('color').notNull(),
	current_owner_id: text('current_owner_id').references(() => Owners.id),
	destroyed: integer('destroyed', { mode: 'boolean' }).default(false),
	edition_id: text('edition_id')
		.notNull()
		.references(() => Editions.id),
	id: text('id').primaryKey(),
	manufacture_date: text('manufacture_date'),
	sale_date: text('sale_date'),
	sale_dealer_city: text('sale_dealer_city'),
	sale_dealer_country: text('sale_dealer_country'),
	sale_dealer_name: text('sale_dealer_name'),
	sale_dealer_state: text('sale_dealer_state'),
	sale_msrp: integer('sale_msrp'),
	sequence: integer('sequence'),
	shipping_city: text('shipping_city'),
	shipping_country: text('shipping_country'),
	shipping_date: text('shipping_date'),
	shipping_state: text('shipping_state'),
	shipping_vessel: text('shipping_vessel'),
	vin: text('vin'),
});
