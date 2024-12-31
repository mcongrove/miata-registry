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

import { countryNameToCode } from './geo';
import { toTitleCase } from './global';

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
