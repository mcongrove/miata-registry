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

import { TLocation } from '../types/Location';

export const countryCodeMap: { [key: string]: string } = {
	'CZECH REPUBLIC': 'CZ',
	'UNITED KINGDOM': 'UK',
	'UNITED STATES': 'US',
	AUSTRALIA: 'AU',
	BELGIUM: 'BE',
	CANADA: 'CA',
	DENMARK: 'DK',
	FRANCE: 'FR',
	GERMANY: 'DE',
	ITALY: 'IT',
	JAPAN: 'JP',
	MEXICO: 'MX',
	NETHERLANDS: 'NL',
	NORWAY: 'NO',
	POLAND: 'PL',
	SENEGAL: 'SN',
	SWEDEN: 'SE',
	VENEZUELA: 'VE',
};

export const countryNameMap: { [key: string]: string } = {
	AU: 'Australia',
	BE: 'Belgium',
	CA: 'Canada',
	CZ: 'Czech Republic',
	DE: 'Germany',
	DK: 'Denmark',
	FR: 'France',
	IT: 'Italy',
	JP: 'Japan',
	MX: 'Mexico',
	NL: 'Netherlands',
	NO: 'Norway',
	PL: 'Poland',
	SE: 'Sweden',
	SN: 'Senegal',
	UK: 'United Kingdom',
	US: 'United States',
	VE: 'Venezuela',
};

export const formatLocation = (
	location?: TLocation,
	short: boolean = false
): string => {
	if (!location) {
		return '';
	}

	const parts: string[] = [];

	if (!short && location.city) {
		parts.push(location.city);
	}

	if (location.state) {
		parts.push(location.state);
	}

	if (location.country) {
		parts.push(location.country);
	}

	return parts.join(', ');
};
