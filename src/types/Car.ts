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

import { TEdition } from './Edition';
import { TCarOwner, TOwner } from './Owner';

export type TCar = {
	id: string;
	vin?: string;
	color: string;
	edition_id: string;
	edition?: TEdition;
	sequence?: number;
	destroyed?: boolean;
	manufacture_date?: string;
	manufacture_city?: string;
	manufacture_country?: string;
	shipping_date?: string;
	shipping_city?: string;
	shipping_state?: string;
	shipping_country?: string;
	shipping_vessel?: string;
	sale_date?: string;
	sale_dealer_name?: string;
	sale_dealer_city?: string;
	sale_dealer_state?: string;
	sale_dealer_country?: string;
	sale_msrp?: number;
	current_owner_id?: string;
	current_owner?: TOwner;
	owner_history?: TCarOwner[];
};
