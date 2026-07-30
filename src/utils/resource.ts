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

import type { TResourceKind } from '../types/Resource';

/** External destination kinds (http href CTA). */
export const isExternalResourceKind = (kind: TResourceKind): boolean =>
	kind === 'link' || kind === 'registry';

/** rel for outbound resource CTAs (external sites + R2 downloads). */
export const RESOURCE_OUTBOUND_REL = 'nofollow noopener noreferrer';

export const resourceCdnUrl = (fileKey: string): string => {
	const base = (
		import.meta.env.VITE_CLOUDFLARE_RESOURCES_CDN_URL ??
		'https://resources.miataregistry.com'
	).replace(/\/$/, '');

	return `${base}/${fileKey.replace(/^\//, '')}`;
};

export const resourceKindLabel = (kind: TResourceKind): string => {
	switch (kind) {
		case 'link':
			return 'Link';
		case 'registry':
			return 'Registry';
		case 'file':
			return 'File';
		case 'page':
			return 'Page';
		default:
			return kind.charAt(0).toUpperCase() + kind.slice(1);
	}
};

export const resourceKindIcon = (kind: TResourceKind): string => {
	switch (kind) {
		case 'link':
			return 'fa-solid fa-globe';
		case 'registry':
			return 'fa-solid fa-list';
		case 'file':
			return 'fa-solid fa-file';
		case 'page':
			return 'fa-solid fa-file-lines';
		default:
			return 'fa-solid fa-bookmark';
	}
};
export const formatFileBytes = (bytes?: number | null): string | null => {
	if (bytes == null || bytes < 0) {
		return null;
	}

	if (bytes < 1024) {
		return `${bytes} B`;
	}

	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	}

	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** UI label when a hosted file exists — uses resources.updated_at as acquisition time. */
export const formatLastAcquired = (
	updatedAt?: string | null
): string | null => {
	if (!updatedAt) return null;

	const date = new Date(updatedAt);

	if (Number.isNaN(date.getTime())) return null;

	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};
