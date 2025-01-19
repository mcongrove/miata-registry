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

import { TPending } from './Common';
import { TEdition } from './Edition';
import { TCarOwner, TOwner } from './Owner';

export type TCar = {
	current_owner_id?: string;
	current_owner?: TOwner;
	destroyed?: boolean;
	edition_id: string;
	edition?: TEdition;
	has_pending_changes?: boolean;
	id: string;
	manufacture_date?: string;
	owner_history?: TCarOwner[];
	rarity_score?: number;
	sale_date?: string;
	sale_dealer_city?: string;
	sale_dealer_country?: string;
	sale_dealer_name?: string;
	sale_dealer_state?: string;
	sale_msrp?: number;
	sequence?: number;
	shipping_city?: string;
	shipping_country?: string;
	shipping_date?: string;
	shipping_state?: string;
	shipping_vessel?: string;
	vin?: string;
};

export type TCarPending = TCar &
	TPending & {
		car_id: string;
		edition?: string;
	};

export type TRarityLevel =
	| 'historically-significant'
	| 'exceptionally-rare'
	| 'very-rare'
	| 'rare'
	| 'limited-edition';
