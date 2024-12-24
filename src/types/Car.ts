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

import { DocumentReference } from 'firebase/firestore';
import { Edition } from './Edition';
import { Owner } from './Owner';
import { Location } from './Location';

export type Car = {
	color: string;
	editionId: DocumentReference<Edition>;
	edition: Edition;
	id: string;
	image?: string;
	location?: Location;
	manufacture?: {
		date?: string;
		location?: Location;
	};
	ownerId?: DocumentReference<Owner>;
	owner: Owner;
	sale?: {
		date?: string;
		dealer?: {
			location?: Location;
			name: string;
		};
		msrp?: number;
	};
	sequence?: number;
	shipping?: {
		date?: string;
		location?: Location;
		vessel?: string;
	};
	vin?: string;
};
