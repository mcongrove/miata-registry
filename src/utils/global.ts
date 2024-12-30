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

export const toTitleCase = (str: string): string => {
	if (!str) return '';

	return str
		.toLowerCase()
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};

export const toPrettyDate = (
	timestamp: Date | string | null | undefined
): string => {
	if (!timestamp) return '';

	let date: Date;

	try {
		if (timestamp instanceof Date) {
			date = timestamp;
		} else {
			date = new Date(timestamp);
		}

		const isMidnight =
			date.getUTCHours() === 0 &&
			date.getUTCMinutes() === 0 &&
			date.getUTCSeconds() === 0;

		return date.toLocaleString('en-US', {
			timeZone: 'UTC',
			month: 'long',
			day: 'numeric',
			year: 'numeric',
			...(isMidnight
				? {}
				: {
						hour: 'numeric',
						minute: '2-digit',
						hour12: true,
					}),
		});
	} catch (error) {
		console.error('Error formatting date:', error);

		return '';
	}
};
