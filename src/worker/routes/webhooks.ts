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

import { Hono } from 'hono';
import { verifyClerkWebhook } from '../middleware/clerk';
import type { Bindings } from '../types';
import type { ClerkWebhookPayload } from '../types/clerk';
import { handleUserCreated, handleUserUpdated } from '../webhooks/clerk';

const webhooksRouter = new Hono<{ Bindings: Bindings }>();

webhooksRouter.post('/clerk', verifyClerkWebhook, async (c) => {
	try {
		const body = c.get('clerkWebhookBody');
		const rawPayload = JSON.parse(body);

		if (
			!rawPayload ||
			typeof rawPayload !== 'object' ||
			!('type' in rawPayload)
		) {
			return c.json(
				{
					error: 'Invalid payload',
					details: 'Payload must include a type field',
				},
				400
			);
		}

		const payload = rawPayload as ClerkWebhookPayload;

		switch (payload.type) {
			case 'user.created':
				return handleUserCreated(c, payload);
			case 'user.updated':
				return handleUserUpdated(c, payload);
		}
	} catch (error) {
		console.error('Error processing Clerk webhook:', error);

		return c.json(
			{
				error: 'Internal server error',
				details:
					error instanceof Error
						? error.message
						: 'An unknown error occurred',
			},
			500
		);
	}
});

export default webhooksRouter;
