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
	getDocs,
	getDoc,
	query,
	limit,
	QueryConstraint,
	doc,
	getCountFromServer,
	where,
	orderBy,
	startAfter,
	QueryLimitConstraint,
	QueryStartAtConstraint,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Car } from '../types/Car';
import { Edition } from '../types/Edition';
import { Owner } from '../types/Owner';
import { FilterOption } from '../types/Filters';

interface CarQueryParams {
	search?: string;
	filters?: FilterOption[];
	sortColumn?: string;
	sortDirection?: 'asc' | 'desc';
	page?: number;
	pageSize?: number;
}

export const getCar = async (id: string): Promise<Car | null> => {
	try {
		if (!id) throw new Error('Car ID is required');

		const carRef = doc(db, 'cars', id);
		const carDoc = await getDoc(carRef);

		if (!carDoc.exists()) return null;

		const carData = carDoc.data() as Car;

		// Verify editionId exists before querying
		if (!carData.editionId) throw new Error('Edition reference is missing');

		const editionDoc = await getDoc(carData.editionId);

		if (!editionDoc.exists())
			throw new Error('Referenced edition does not exist');

		const editionData = editionDoc.data() as Edition;

		// Verify ownerId exists before querying
		let ownerData;

		if (carData.ownerId) {
			const ownerDoc = await getDoc(carData.ownerId);

			if (!ownerDoc.exists())
				throw new Error('Referenced owner does not exist');

			ownerData = ownerDoc.data() as Owner;
		}

		return {
			...carData,
			id: carDoc.id,
			edition: editionData,
			owner: ownerData,
		};
	} catch (error) {
		console.error('Error fetching car:', error);

		throw error;
	}
};

export const getCars = async ({
	filters = [],
	sortColumn = 'edition.year',
	sortDirection = 'asc',
	page = 1,
	pageSize = 50,
}: CarQueryParams = {}): Promise<{ cars: Car[]; total: number }> => {
	try {
		const carsRef = collection(db, 'cars');
		const constraints: QueryConstraint[] = [];

		filters.forEach((filter) => {
			switch (filter.type) {
				case 'generation':
					constraints.push(
						where('edition.generation', '==', filter.value)
					);
					break;
				case 'year':
					constraints.push(
						where('edition.year', '==', parseInt(filter.value))
					);
					break;
				case 'country':
					constraints.push(
						where('owner.location.country', '==', filter.value)
					);
					break;
				case 'edition': {
					const [year, ...nameParts] = filter.value.split(' ');
					const name = nameParts.join(' ');

					constraints.push(
						where('edition.year', '==', parseInt(year))
					);
					constraints.push(where('edition.name', '==', name));
					break;
				}
			}
		});

		constraints.push(orderBy(sortColumn, sortDirection));

		// Pagination
		if (page > 1) {
			const startAt = (page - 1) * pageSize;

			const previousPageQuery = query(
				carsRef,
				...constraints,
				limit(startAt)
			);

			const previousPageSnapshot = await getDocs(previousPageQuery);

			const lastDoc =
				previousPageSnapshot.docs[previousPageSnapshot.docs.length - 1];

			if (lastDoc) {
				constraints.push(startAfter(lastDoc));
			}
		}

		constraints.push(limit(pageSize));

		console.log(constraints);

		const q = query(carsRef, ...constraints);

		const [snapshot, totalSnapshot] = await Promise.all([
			getDocs(q),
			getCountFromServer(
				query(
					carsRef,
					...constraints.filter(
						(c) =>
							!(c instanceof QueryStartAtConstraint) &&
							!(c instanceof QueryLimitConstraint)
					)
				)
			),
		]);

		const cars = snapshot.docs.map((doc) => ({
			...doc.data(),
			id: doc.id,
		})) as Car[];

		return {
			cars,
			total: totalSnapshot.data().count,
		};
	} catch (error) {
		console.error('Error fetching cars:', error);

		throw error;
	}
};

export const getCountCars = async (): Promise<number> => {
	try {
		const snapshot = await getCountFromServer(collection(db, 'cars'));

		return snapshot.data().count;
	} catch (error) {
		console.error('Error getting car count:', error);

		throw error;
	}
};

export const getCountClaimedCars = async (): Promise<number> => {
	try {
		const q = query(collection(db, 'cars'), where('ownerId', '!=', null));

		const snapshot = await getCountFromServer(q);

		return snapshot.data().count;
	} catch (error) {
		console.error('Error getting owned car count:', error);

		throw error;
	}
};

export const getCountEditions = async (): Promise<number> => {
	try {
		const snapshot = await getCountFromServer(collection(db, 'editions'));

		return snapshot.data().count;
	} catch (error) {
		console.error('Error getting edition count:', error);

		throw error;
	}
};

export const getVinDetails = async (vin: string, year: number) => {
	try {
		const response = await fetch(
			`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json&modelyear=${year}`
		);

		const data = await response.json();

		if (data.Results?.[0]) {
			return data.Results[0];
		}

		return null;
	} catch (error) {
		console.error('Error fetching VIN details:', error);

		return null;
	}
};
