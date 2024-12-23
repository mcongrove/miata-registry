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

import {
	collection,
	doc,
	getCountFromServer,
	getDocs,
	query,
	where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Edition } from '../types/Edition';

export const getEditions = async (): Promise<Edition[]> => {
	try {
		const editionsRef = collection(db, 'editions');
		const snapshot = await getDocs(editionsRef);

		return snapshot.docs.map(
			(doc) =>
				({
					id: doc.id,
					...doc.data(),
				}) as Edition
		);
	} catch (error) {
		console.error('Error fetching editions:', error);

		throw error;
	}
};

export const getEditionStats = async (id: string) => {
	try {
		const editionRef = doc(db, 'editions', id);

		const registeredQuery = query(
			collection(db, 'cars'),
			where('editionId', '==', editionRef)
		);

		const registeredSnapshot = await getCountFromServer(registeredQuery);

		const totalInRegistry = registeredSnapshot.data().count;

		const claimedQuery = query(
			collection(db, 'cars'),
			where('editionId', '==', editionRef),
			where('ownerId', '!=', '')
		);

		const claimedSnapshot = await getCountFromServer(claimedQuery);

		const totalClaimed = claimedSnapshot.data().count;

		return {
			inRegistry: totalInRegistry,
			claimed: totalClaimed,
		};
	} catch (error) {
		console.error('Error getting edition stats:', error);

		throw error;
	}
};
