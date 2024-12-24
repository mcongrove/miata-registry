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
	DocumentReference,
	doc,
	getCountFromServer,
	where,
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
		if (!carData.ownerId) throw new Error('Owner reference is missing');

		const ownerDoc = await getDoc(carData.ownerId);

		if (!ownerDoc.exists())
			throw new Error('Referenced owner does not exist');

		const ownerData = ownerDoc.data() as Owner;

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
		const constraints: QueryConstraint[] = [limit(pageSize)];

		// Create query with basic constraints
		const q = query(carsRef, ...constraints);
		const snapshot = await getDocs(q);

		// Fetch edition and owner data for each car
		const cars = await Promise.all(
			snapshot.docs.map(async (doc) => {
				const carData = doc.data();

				if (!carData.editionId) {
					console.warn(`Car ${doc.id} has no editionId`);
					return null;
				}

				try {
					const editionDoc = await getDoc(
						carData.editionId as DocumentReference
					);
					if (!editionDoc.exists()) {
						console.warn(`Edition not found for car ${doc.id}`);
						return null;
					}

					let ownerData = null;
					if (carData.ownerId) {
						const ownerDoc = await getDoc(
							carData.ownerId as DocumentReference
						);
						if (ownerDoc.exists()) {
							ownerData = ownerDoc.data() as Owner;
						}
					}

					return {
						...carData,
						id: doc.id,
						edition: editionDoc.data() as Edition,
						owner: ownerData,
					} as Car;
				} catch (error) {
					console.error(
						`Error fetching related data for car ${doc.id}:`,
						error
					);
					return null;
				}
			})
		);

		// Filter out any null results
		let validCars = cars.filter((car): car is Car => car !== null);

		// Apply filters in memory
		if (filters.length > 0) {
			validCars = validCars.filter((car) => {
				return filters.every((filter) => {
					switch (filter.type) {
						case 'generation':
							return car.edition.generation === filter.value;
						case 'year':
							return car.edition.year === parseInt(filter.value);
						case 'country':
							return (
								car.owner?.location?.country === filter.value
							);
						case 'edition': {
							const [year, ...nameParts] =
								filter.value.split(' ');
							const name = nameParts.join(' ');
							return (
								car.edition.year === parseInt(year) &&
								car.edition.name === name
							);
						}
						default:
							return true;
					}
				});
			});
		}

		// Sort the results in memory
		validCars.sort((a, b) => {
			switch (sortColumn) {
				case 'edition.year':
					return sortDirection === 'asc'
						? a.edition.year - b.edition.year
						: b.edition.year - a.edition.year;
				case 'edition.name':
					return sortDirection === 'asc'
						? a.edition.name.localeCompare(b.edition.name)
						: b.edition.name.localeCompare(a.edition.name);
				default:
					return 0;
			}
		});

		// Apply pagination in memory
		const startIndex = (page - 1) * pageSize;
		const paginatedCars = validCars.slice(
			startIndex,
			startIndex + pageSize
		);

		// Log for debugging
		console.log('Query results:', {
			filters,
			totalFetched: snapshot.size,
			afterFilters: validCars.length,
			afterPagination: paginatedCars.length,
			firstCar: paginatedCars[0],
		});

		return {
			cars: paginatedCars,
			total: validCars.length,
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
