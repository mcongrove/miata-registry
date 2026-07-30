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

export type TResourceKind =
	'link' | 'registry' | 'file' | 'page' | (string & {});

export type TResourceAssociation = {
	type: string;
	value: string;
	label?: string | null;
	/** Edition path slug when type is `edition`. */
	slug?: string | null;
};

export type TResource = {
	id: string;
	title: string;
	summary: string;
	body?: string | null;
	kind: TResourceKind;
	href?: string | null;
	file_key?: string | null;
	file_mime?: string | null;
	file_bytes?: number | null;
	file_name?: string | null;
	publish_date: string;
	sort_order: number;
	featured: number;
	updated_at?: string | null;
	associations: TResourceAssociation[];
};
