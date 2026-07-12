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

import type { D1Database, KVNamespace } from '@cloudflare/workers-types';
import { handleEditionsJsonRequest } from '../../src/seo/handlers';

interface Env {
	CACHE: KVNamespace;
	DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
	try {
		return await handleEditionsJsonRequest(context.env);
	} catch (error) {
		console.error('Error generating editions.json:', error);

		return new Response('Internal server error', { status: 500 });
	}
};
