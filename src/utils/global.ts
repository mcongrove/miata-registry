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

import toast from 'react-hot-toast';

export const handleApiError = (error: unknown) => {
	const message =
		error instanceof Error ? error.message : 'An unexpected error occurred';

	toast.error(message, {
		duration: 4000,
		position: 'top-center',
	});
};

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
			timestamp.toString().split('T')[1] === '00:00:00.000Z';

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
