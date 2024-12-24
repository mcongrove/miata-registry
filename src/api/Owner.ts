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

import { db } from '../config/firebase';
import { Owner } from '../types/Owner';
import { collection, getDocs } from 'firebase/firestore';

export const getCountries = async (): Promise<string[]> => {
	try {
		const ownersRef = collection(db, 'owners');
		const snapshot = await getDocs(ownersRef);

		const uniqueCountries = new Set<string>();

		snapshot.forEach((doc) => {
			const ownerData = doc.data() as Owner;

			if (ownerData.location?.country) {
				uniqueCountries.add(ownerData.location.country);
			}
		});

		return Array.from(uniqueCountries).sort();
	} catch (error) {
		console.error('Error getting unique countries:', error);
		throw error;
	}
};

export const getCountCountries = async (): Promise<number> => {
	try {
		const ownersRef = collection(db, 'owners');
		const snapshot = await getDocs(ownersRef);
		const uniqueCountries = new Set<string>();

		snapshot.forEach((doc) => {
			const ownerData = doc.data() as Owner;

			if (ownerData.location?.country) {
				uniqueCountries.add(ownerData.location.country);
			}
		});

		return uniqueCountries.size;
	} catch (error) {
		console.error('Error getting unique country count:', error);

		throw error;
	}
};
