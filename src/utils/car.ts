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

import { countryCodeMap } from './geo';
import { toTitleCase } from './global';

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
