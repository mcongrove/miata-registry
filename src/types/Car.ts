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

/**
 CREATE TABLE cars (
   id TEXT PRIMARY KEY,
   vin TEXT,
   color TEXT NOT NULL,
   edition_id TEXT NOT NULL,
   sequence INTEGER,
   destroyed BOOLEAN DEFAULT FALSE,
   manufacture_date TIMESTAMP,
   manufacture_city TEXT,
   manufacture_country TEXT,
   shipping_date TIMESTAMP,
   shipping_city TEXT,
   shipping_state TEXT,
   shipping_country TEXT,
   shipping_vessel TEXT,
   sale_date TIMESTAMP,
   sale_dealer_name TEXT,
   sale_dealer_location_city TEXT,
   sale_dealer_location_state TEXT,
   sale_dealer_location_country TEXT,
   sale_msrp INTEGER,
   FOREIGN KEY(edition_id) REFERENCES editions(id)
 )
*/

import { DocumentReference, Timestamp } from 'firebase/firestore';
import { Edition } from './Edition';
import { Owner } from './Owner';
import { Location } from './Location';

export type Car = {
	color: string;
	destroyed?: boolean;
	editionId: DocumentReference<Edition>;
	edition: Edition;
	id: string;
	manufacture?: {
		date?: Timestamp;
		location?: Location;
	};
	ownerId?: DocumentReference<Owner>;
	owner?: Owner;
	owners?: (Owner & { ownerId: DocumentReference<Owner> })[];
	sale?: {
		date?: Timestamp;
		dealer?: {
			location?: Location;
			name: string;
		};
		msrp?: number;
	};
	sequence?: number;
	shipping?: {
		date?: Timestamp;
		location?: Location;
		vessel?: string;
	};
	vin?: string;
};
