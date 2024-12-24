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
} from 'firebase/firestore';
import { countryCodeMap } from '../utils/geo';
import { toTitleCase } from '../utils/global';

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

export const getCarCount = async (): Promise<number> => {
	try {
		const snapshot = await getCountFromServer(collection(db, 'cars'));

		return snapshot.data().count;
	} catch (error) {
		console.error('Error getting car count:', error);

		throw error;
	}
};

export const getClaimedCarCount = async (): Promise<number> => {
	try {
		const q = query(collection(db, 'cars'), where('ownerId', '!=', null));

		const snapshot = await getCountFromServer(q);

		return snapshot.data().count;
	} catch (error) {
		console.error('Error getting owned car count:', error);

		throw error;
	}
};

export const getEditionCount = async (): Promise<number> => {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatEngineDetails = (details: any) => {
	const displacement = details.DisplacementL
		? `${Number(details.DisplacementL).toFixed(1)}L`
		: '';

	const cylinders = details.EngineCylinders
		? `${details.EngineCylinders}-cylinder`
		: '';

	const configuration =
		details.EngineConfiguration?.toLowerCase() === 'inline'
			? 'Inline'
			: details.EngineConfiguration;

	const horsepower = details.EngineHP ? `${details.EngineHP}hp` : '';

	return (
		[displacement, configuration, cylinders, horsepower]
			.filter(Boolean)
			.join(' ')
			.trim() || 'Not specified'
	);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatTransmission = (details: any) => {
	const speed = details.TransmissionSpeeds || details.TransmissionSpeed;
	const style = details.TransmissionStyle || details.DriveType;

	if (!speed && !style) return 'Not specified';

	return [
		speed ? `${speed}-speed` : '',
		style?.toLowerCase().includes('manual') ? 'Manual' : 'Automatic',
	]
		.filter(Boolean)
		.join(' ');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatPlantLocation = (details: any) => {
	const city = details?.PlantCity
		? toTitleCase(details?.PlantCity?.toLowerCase())
		: '';

	const country =
		countryCodeMap[details?.PlantCountry] || details?.PlantCountry;

	return city && country ? `${city}, ${country}` : '';
};
