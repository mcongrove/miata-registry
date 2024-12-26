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
CREATE TABLE owners (
  id TEXT PRIMARY KEY,
  name TEXT,
  country TEXT,
  state TEXT,
  city TEXT
)

CREATE TABLE car_owners (
  car_id TEXT,
  owner_id TEXT,
  date_start TIMESTAMP NOT NULL,
  date_end TIMESTAMP,
  PRIMARY KEY (car_id, owner_id, date_start),
  FOREIGN KEY(car_id) REFERENCES cars(id),
  FOREIGN KEY(owner_id) REFERENCES owners(id)
)
*/

import { Location } from './Location';
import { Timestamp } from 'firebase/firestore';

export type Owner = {
	dateEnd?: Timestamp;
	dateStart?: Timestamp;
	id?: string;
	location?: Location;
	name?: string;
};
