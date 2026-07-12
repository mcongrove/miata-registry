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

import type { KVNamespace } from '@cloudflare/workers-types';
import { SEO_EDITIONS_KEY, SEO_SITEMAP_KEY } from './constants';

export const invalidateSeoCaches = async (
	cache: KVNamespace
): Promise<void> => {
	await Promise.all([
		cache.delete(SEO_SITEMAP_KEY),
		cache.delete(SEO_EDITIONS_KEY),
	]);
};
