/**
 * Miata Registry
 * Copyright (C) 2024-2026 Matthew Congrove
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

export const toIsoDateTime = (
	date: string | number | null | undefined
): string | undefined => {
	if (date == null || date === '') {
		return undefined;
	}

	const value = typeof date === 'number' ? `${date}-01-01` : date;
	const parsed = new Date(value);

	return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

export const toPrettyDate = (
	timestamp: Date | string | null | undefined,
	options?: { dateOnly?: boolean }
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
			...(options?.dateOnly || isMidnight
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

export const toRelativeTime = (date: Date) => {
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	const intervals = {
		year: 31536000,
		month: 2592000,
		week: 604800,
		day: 86400,
		hour: 3600,
		minute: 60,
	};

	const capitalize = (value: string) =>
		value.charAt(0).toUpperCase() + value.slice(1);

	for (const [unit, seconds] of Object.entries(intervals)) {
		const interval = Math.floor(diffInSeconds / seconds);

		if (interval >= 1) {
			const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

			return capitalize(
				rtf.format(-interval, unit as Intl.RelativeTimeFormatUnit)
			);
		}
	}

	return 'Just now';
};
