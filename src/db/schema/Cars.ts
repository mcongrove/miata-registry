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

import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { TStoredVinDetails } from '../../types/Car';
import { Editions } from './Editions';
import { Owners } from './Owners';

export const Cars = sqliteTable('cars', {
	current_owner_id: text('current_owner_id').references(() => Owners.id),
	destroyed: integer('destroyed', { mode: 'boolean' }).default(false),
	edition_id: text('edition_id')
		.notNull()
		.references(() => Editions.id),
	id: text('id').primaryKey(),
	manufacture_city: text('manufacture_city'),
	manufacture_date: text('manufacture_date'),
	manufacture_prefecture: text('manufacture_prefecture'),
	color: text('color'),
	mileage: integer('mileage'),
	mileage_date: text('mileage_date'),
	rarity_original_hardtop: integer('rarity_original_hardtop', {
		mode: 'boolean',
	}).default(false),
	rarity_original_paint: integer('rarity_original_paint', {
		mode: 'boolean',
	}).default(false),
	rarity_original_softtop: integer('rarity_original_softtop', {
		mode: 'boolean',
	}).default(false),
	rarity_original_wheels: integer('rarity_original_wheels', {
		mode: 'boolean',
	}).default(false),
	rarity_sale_documents: integer('rarity_sale_documents', {
		mode: 'boolean',
	}).default(false),
	rarity_score: integer('rarity_score'),
	rarity_service_records: integer('rarity_service_records', {
		mode: 'boolean',
	}).default(false),
	rarity_window_sticker: integer('rarity_window_sticker', {
		mode: 'boolean',
	}).default(false),
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
	story: text('story'),
	updated_date: text('updated_date'),
	vin: text('vin'),
	vin_decode_status: text('vin_decode_status', {
		enum: ['ok', 'invalid', 'error', 'skipped'],
	}),
	vin_details: text('vin_details', {
		mode: 'json',
	}).$type<TStoredVinDetails>(),
});
