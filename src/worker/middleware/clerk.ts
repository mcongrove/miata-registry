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

import type { Context, Next } from 'hono';
import type { Bindings } from '../types';

export const verifyClerkWebhook = async (
	c: Context<{ Bindings: Bindings }>,
	next: Next
) => {
	const svix_id = c.req.header('svix-id');
	const svix_timestamp = c.req.header('svix-timestamp');
	const svix_signature = c.req.header('svix-signature');

	if (!svix_id || !svix_timestamp || !svix_signature) {
		return c.json(
			{
				error: 'Unauthorized',
				details: 'Missing webhook signature headers',
			},
			401
		);
	}

	const body = await c.req.text();
	const signedContent = `${svix_id}.${svix_timestamp}.${body}`;
	const webhookSecret = c.env.CLERK_WEBHOOK_SECRET;

	if (!webhookSecret) {
		throw new Error('Missing CLERK_WEBHOOK_SECRET environment variable');
	}

	const secretBytes = new Uint8Array(
		atob(webhookSecret.split('_')[1])
			.split('')
			.map((char) => char.charCodeAt(0))
	);

	const key = await crypto.subtle.importKey(
		'raw',
		secretBytes,
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);

	const signature = await crypto.subtle.sign(
		'HMAC',
		key,
		new TextEncoder().encode(signedContent)
	);

	const expectedSignature = btoa(
		String.fromCharCode.apply(null, Array.from(new Uint8Array(signature)))
	);

	const signatures = svix_signature
		.split(' ')
		.map((sig) => sig.split(',')[1]);

	const isValidSignature = signatures.some(
		(sig) => sig === expectedSignature
	);

	if (!isValidSignature) {
		return c.json(
			{
				error: 'Unauthorized',
				details: 'Invalid webhook signature',
			},
			401
		);
	}

	c.set('clerkWebhookBody', body);

	await next();
};
