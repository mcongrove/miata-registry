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

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Car } from '../types/Car';
import { Edition } from '../types/Edition';
import { Owner } from '../types/Owner';
import {
	collection,
	getCountFromServer,
	query,
	where,
	getDocs,
} from 'firebase/firestore';
import { FilterType } from '../types/Filters';

export interface FilterOption {
	type: FilterType;
	value: string;
}

export interface CarQueryParams {
	search?: string;
	filters?: FilterOption[];
	sortColumn?: string;
	sortDirection?: 'asc' | 'desc';
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
	search,
	filters,
	sortColumn = 'edition.year',
	sortDirection = 'asc',
}: CarQueryParams = {}): Promise<Car[]> => {
	try {
		const carsRef = collection(db, 'cars');
		let q = query(carsRef);

		// Get all cars first
		const snapshot = await getDocs(q);
		let cars: Car[] = [];

		// Fetch all cars with their related data
		for (const doc of snapshot.docs) {
			const carData = doc.data() as Car;

			// Get edition data
			const editionDoc = await getDoc(carData.editionId);
			if (!editionDoc.exists()) {
				continue;
			}
			const editionData = editionDoc.data() as Edition;

			// Get owner data if it exists
			let ownerData: Owner | null = null;
			if (carData.ownerId) {
				const ownerDoc = await getDoc(carData.ownerId);
				if (!ownerDoc.exists()) {
					continue;
				}
				ownerData = ownerDoc.data() as Owner;
			}

			if (ownerData === null) {
				continue;
			}

			cars.push({
				...carData,
				id: doc.id,
				edition: editionData,
				owner: ownerData,
			});
		}

		// Apply filters in memory
		if (filters?.length) {
			cars = cars.filter((car) => {
				return filters.every((filter) => {
					switch (filter.type) {
						case 'generation':
							return car.edition.generation === filter.value;
						case 'year':
							return car.edition.year === parseInt(filter.value);
						case 'country':
							return car.owner.location?.country === filter.value;
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

		// Apply search if present
		if (search) {
			const searchLower = search.toLowerCase();

			// Create queries for each searchable field
			const editionQuery = query(
				carsRef,
				where('edition.name', '>=', searchLower),
				where('edition.name', '<=', searchLower + '\uf8ff')
			);
			const vinQuery = query(
				carsRef,
				where('vin', '>=', searchLower),
				where('vin', '<=', searchLower + '\uf8ff')
			);
			const ownerQuery = query(
				carsRef,
				where('owner.name', '>=', searchLower),
				where('owner.name', '<=', searchLower + '\uf8ff')
			);

			// Execute all queries in parallel
			const [editionDocs, vinDocs, ownerDocs] = await Promise.all([
				getDocs(editionQuery),
				getDocs(vinQuery),
				getDocs(ownerQuery),
			]);

			// Merge results and remove duplicates
			const results = new Map();
			[...editionDocs.docs, ...vinDocs.docs, ...ownerDocs.docs].forEach(
				(doc) => {
					if (!results.has(doc.id)) {
						results.set(doc.id, doc);
					}
				}
			);

			q = query(q, where('__name__', 'in', Array.from(results.keys())));
		}

		// Sort the results in memory since we need to sort by joined data
		return cars.sort((a, b) => {
			let aVal, bVal;

			switch (sortColumn) {
				case 'edition.year':
					aVal = a.edition.year;
					bVal = b.edition.year;
					break;
				case 'edition.generation':
					aVal = a.edition.generation;
					bVal = b.edition.generation;
					break;
				case 'edition.name':
					aVal = a.edition.name;
					bVal = b.edition.name;
					break;
				case 'color':
					aVal = a.color;
					bVal = b.color;
					break;
				case 'sequence':
					aVal = a.sequence || 0;
					bVal = b.sequence || 0;
					break;
				case 'owner.name':
					aVal = a.owner.name;
					bVal = b.owner.name;
					break;
				case 'owner.location.country':
					aVal = a.owner.location?.country;
					bVal = b.owner.location?.country;
					break;
				default:
					aVal = a[sortColumn as keyof Car];
					bVal = b[sortColumn as keyof Car];
			}

			if (aVal === bVal) return 0;
			if (aVal === undefined) return 1;
			if (bVal === undefined) return -1;

			const comparison = aVal < bVal ? -1 : 1;
			return sortDirection === 'asc' ? comparison : -comparison;
		});
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
