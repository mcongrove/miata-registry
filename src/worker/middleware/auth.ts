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

import { createClerkClient } from '@clerk/backend';
import { Context } from 'hono';
import type { Bindings } from '../types';

export async function verifyAuth(c: Context<{ Bindings: Bindings }>) {
	const secretKey = c.env.CLERK_SECRET_KEY;

	try {
		const clerk = createClerkClient({
			secretKey,
			publishableKey: c.env.CLERK_PUBLISHABLE_KEY,
		});

		const request = new Request(c.req.url, {
			method: c.req.method,
			headers: c.req.raw.headers,
		});

		const authResult = await clerk.authenticateRequest(request, {
			authorizedParties: [
				c.env.NODE_ENV !== 'development'
					? 'https://miataregistry.com'
					: 'http://localhost:5173',
			],
		});

		if (authResult.isSignedIn) {
			c.set('userId', authResult.toAuth().userId);
		}

		return authResult.isSignedIn;
	} catch (error) {
		return false;
	}
}

export function withAuth() {
	return async (
		c: Context<{ Bindings: Bindings }>,
		next: () => Promise<void>
	) => {
		const isAuthenticated = await verifyAuth(c);

		if (!isAuthenticated) {
			return c.json(
				{
					error: 'Unauthorized',
					details: "You don't have permission to do that",
				},
				401
			);
		}

		await next();
	};
}
