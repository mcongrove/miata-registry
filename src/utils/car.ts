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

import { toTitleCase } from './common';
import { countryNameToCode } from './location';

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
