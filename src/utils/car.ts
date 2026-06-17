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

import { TRarityLevel } from '../types/Car';
import { toTitleCase } from './common';
import { countryNameToCode } from './location';

export const RARITY_LEVELS: TRarityLevel[] = [
	'historically-significant',
	'exceptionally-rare',
	'very-rare',
	'rare',
	'limited-edition',
];

export const formatRarityLevel = (level: string): string =>
	level
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

export const hasSequence = (
	sequence?: number | string | null
): sequence is number => {
	if (sequence == null || sequence === '') return false;

	const value = Number(sequence);

	return Number.isFinite(value) && value > 0;
};

export const parseSequence = (
	value: FormDataEntryValue | string | number | null | undefined
): number | null => {
	if (value == null || value === '') return null;

	const sequence = Number(value);

	return Number.isFinite(sequence) && sequence > 0 ? sequence : null;
};

export const VIN_INPUT_PATTERN =
	'(?:[A-Z0-9]{5}-[A-Z0-9]{6}|JM[A-Z0-9]{15})';

export const VIN_VALIDATION_MESSAGE =
	'Enter a 17-character VIN starting with JM, or a chassis number as XXXXX-XXXXXX.';

const VIN_PATTERN = new RegExp(`^${VIN_INPUT_PATTERN}$`, 'i');

export const isValidVin = (vin: string | null | undefined): boolean => {
	if (!vin?.trim()) return false;

	return VIN_PATTERN.test(vin.trim());
};

const CHASSIS_PATTERN = /^[A-Z0-9]{5}-[A-Z0-9]{6}$/i;
const FULL_VIN_PATTERN = /^JM[A-Z0-9]{15}$/i;

export const isChassisNumber = (vin: string | null | undefined): boolean => {
	if (!vin?.trim()) return false;

	return CHASSIS_PATTERN.test(vin.trim());
};

export const isFullVin = (vin: string | null | undefined): boolean => {
	if (!vin?.trim()) return false;

	return FULL_VIN_PATTERN.test(vin.trim());
};

export const parseEditionYear = (
	editionName: string | null | undefined
): number | null => {
	if (!editionName) return null;

	const match = editionName.trim().match(/^(\d{4})/);

	return match ? Number(match[1]) : null;
};

export type TVinDetails = {
	ErrorCode?: string;
	Manufacturer?: string;
};

export const getVinDetails = async (
	vin: string,
	year: number
): Promise<TVinDetails | null> => {
	try {
		if (!vin || !year) return null;

		const response = await fetch(
			`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(vin)}?format=json&modelyear=${year}`
		);

		if (!response.ok) return null;

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

export const isVinApiValid = (details: TVinDetails | null): boolean => {
	if (!details?.ErrorCode) return false;

	return details.ErrorCode.split(';').every((code) => code.trim() === '0');
};

export type TMileageUnit = 'mi' | 'km';

const KM_PER_MILE = 1.609344;

export const parseMileageInput = (
	value: FormDataEntryValue | string | number | null | undefined,
	unit: TMileageUnit = 'mi'
): number | null => {
	if (value == null || value === '') return null;

	const raw = Number(String(value).replace(/[^0-9]/g, ''));

	if (!Number.isFinite(raw) || raw < 0) return null;

	return unit === 'km' ? Math.round(raw / KM_PER_MILE) : raw;
};

export const convertMileageDisplay = (
	value: number,
	from: TMileageUnit,
	to: TMileageUnit
): number => {
	if (!Number.isFinite(value) || from === to) return value;

	return from === 'mi'
		? Math.round(value * KM_PER_MILE)
		: Math.round(value / KM_PER_MILE);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatEngineDetails = (details: any) => {
	const displacement = details.DisplacementL
		? `${Number(details.DisplacementL).toFixed(1)}L`
		: '';

	const cylinders = details.EngineCylinders
		? `${details.EngineCylinders}-cyl`
		: '';

	const configuration =
		details.EngineConfiguration?.toLowerCase() === 'inline'
			? 'Inline'
			: details.EngineConfiguration;

	const horsepower = details.EngineHP
		? details.EngineHP_to
			? `${details.EngineHP}–${details.EngineHP_to}hp`
			: `${details.EngineHP}hp`
		: '';

	return (
		[displacement, configuration, cylinders, horsepower]
			.filter(Boolean)
			.join(' ')
			.trim() || 'Not specified'
	);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatPlantLocation = (details: any) => {
	if (!details) return '';

	// Default to Japan for Mazda VINs starting with JM1
	const isJapaneseMazda = details?.VIN?.startsWith('JM1');

	const city = details?.PlantCity ? toTitleCase(details?.PlantCity) : '';
	const state = details?.PlantState ? toTitleCase(details?.PlantState) : '';
	const country = details?.PlantCountry
		? countryNameToCode(details?.PlantCountry)
		: isJapaneseMazda
			? 'JP'
			: '';

	return [city, state, country].filter(Boolean).join(', ');
};

export const colorMap: Record<string, string> = {
	'black mica': '#000000',
	'blazing yellow mica': '#FFD700',
	'bravo blue': '#1B4D8D',
	'brilliant black': '#000000',
	'british racing green': '#2C4C3B',
	'classic red': '#E2231A',
	'crystal blue': '#00B0CA',
	'dark blue': '#00008B',
	'emerald mica': '#024930',
	'evolution orange': '#F0A500',
	'icy blue': '#A5F2F3',
	'laguna blue': '#2A4BA0',
	'lava orange': '#FF6600',
	'mahogany mica': '#4B273D',
	'marina green mica': '#1B4D3E',
	'mariner blue': '#0055B8',
	'merlot mica': '#641F34',
	'midnight blue': '#2A1B57',
	'montego blue': '#1B4B6D',
	'racing orange': '#F5550B',
	'sapphire blue mica': '#002B7F',
	'silver stone metallic': '#C7C9C7',
	'snowflake white pearl mica': '#F0F0F0',
	'soul red metallic': '#A71D31',
	'starlight mica blue': '#2E2787',
	'strato blue mica': '#1B365D',
	'sunburst yellow': '#FFD700',
	'titanium gray metallic': '#6D6F64',
	'twilight blue mica': '#1B365D',
	'velocity red': '#FF0000',
	black: '#000000',
	silver: '#C6C9CA',
	various: '#CCCCCC',
	white: '#FFFFFF',
};

export const colorMapSocial: Record<string, string> = {
	...colorMap,
	'blazing yellow mica': '#D79732',
	'evolution orange': '#DC7200',
	'icy blue': '#009799',
	'silver stone metallic': '#6D6F64',
	'snowflake white pearl mica': '#6D6F64',
	'sunburst yellow': '#D79732',
	silver: '#6D6F64',
	various: '#6D6F64',
	white: '#6D6F64',
};
