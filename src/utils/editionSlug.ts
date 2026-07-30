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

export const editionSlug = (year: number, name: string): string =>
	`${year}-${name}`
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

export const editionPath = (year: number, name: string): string =>
	`/registry/editions/${editionSlug(year, name)}`;

export const editionRegistryFilterPath = (year: number, name: string): string =>
	`/registry?filter=${encodeURIComponent(`edition:${year} ${name}`).replace(
		/%20/g,
		'+'
	)}`;

export const findEditionBySlug = <T extends { year: number; name: string }>(
	editions: T[],
	slug: string
): T | undefined => {
	const normalized = slug.toLowerCase();

	return editions.find(
		(edition) => editionSlug(edition.year, edition.name) === normalized
	);
};
