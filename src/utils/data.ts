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

export const objectsToCSV = (data: any[]) => {
	if (data.length === 0) return '';

	const headers = Object.keys(data[0]);

	const csvRows = [
		headers.join(','),
		...data.map((row) =>
			headers
				.map((header) => {
					const value = row[header]?.toString() ?? '';

					return value.includes(',') || value.includes('"')
						? `"${value.replace(/"/g, '""')}"`
						: value;
				})
				.join(',')
		),
	];

	return csvRows.join('\n');
};
