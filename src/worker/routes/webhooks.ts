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
import { eq } from 'drizzle-orm';
import type { Context } from 'hono';
import { Hono } from 'hono';
import { Resend } from 'resend';
import { createDb } from '../../db';
import { Cars, Owners } from '../../db/schema';
import type { Bindings } from '../types';

const webhooksRouter = new Hono<{ Bindings: Bindings }>();

type WebhookContext = Context<{ Bindings: Bindings }>;

interface BaseClerkWebhookPayload {
	type: string;
	data: {
		id: string;
	};
}

interface UserCreatedPayload extends BaseClerkWebhookPayload {
	type: 'user.created';
	data: {
		id: string;
		email_addresses: {
			email_address: string;
			id: string;
		}[];
		primary_email_address_id: string;
	};
}

interface UserUpdatedPayload extends BaseClerkWebhookPayload {
	type: 'user.updated';
	data: {
		id: string;
		first_name: string | null;
		last_name: string | null;
	};
}

type ClerkWebhookPayload = UserCreatedPayload | UserUpdatedPayload;

webhooksRouter.post('/clerk', async (c) => {
	try {
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
			throw new Error(
				'Missing CLERK_WEBHOOK_SECRET environment variable'
			);
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
			String.fromCharCode.apply(
				null,
				Array.from(new Uint8Array(signature))
			)
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
		const db = createDb(c.env.DB);

		switch (payload.type) {
			case 'user.created':
				return handleUserCreated(c, payload as UserCreatedPayload);
			case 'user.updated':
				return handleUserUpdated(c, db, payload as UserUpdatedPayload);
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

async function handleUserCreated(
	c: WebhookContext,
	payload: UserCreatedPayload
) {
	try {
		const clerk = createClerkClient({
			secretKey: c.env.CLERK_SECRET_KEY,
			publishableKey: c.env.CLERK_PUBLISHABLE_KEY,
		});

		const primaryEmail = payload.data.email_addresses.find(
			(email) => email.id === payload.data.primary_email_address_id
		);

		if (!primaryEmail) {
			return c.json(
				{
					error: 'Bad request',
					details: 'No primary email address found',
				},
				400
			);
		}

		const resend = new Resend(c.env.RESEND_API_KEY);

		const resendResponse = await resend.contacts.create({
			email: primaryEmail.email_address,
			audienceId: '6a3d221c-aac6-4c36-975c-d347532c5367',
			unsubscribed: false,
		});

		if (!resendResponse.data) {
			return c.json(
				{
					error: 'Internal server error',
					details: 'Failed to create contact in Resend',
				},
				500
			);
		}

		await clerk.users.updateUser(payload.data.id, {
			privateMetadata: {
				resend_id: resendResponse.data.id,
			},
		});

		return c.json({ success: true });
	} catch (error) {
		console.error('Error in handleUserCreated:', error);

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
}

async function handleUserUpdated(
	c: WebhookContext,
	db: ReturnType<typeof createDb>,
	payload: UserUpdatedPayload
) {
	const existingOwner = await db
		.select({ id: Owners.id })
		.from(Owners)
		.where(eq(Owners.user_id, payload.data.id))
		.get();

	if (!existingOwner) {
		return c.json(
			{
				error: 'Not Found',
				details: `No owner found for user_id: ${payload.data.id}`,
			},
			404
		);
	}

	const [updatedOwner] = await db
		.update(Owners)
		.set({
			name:
				[payload.data.first_name, payload.data.last_name]
					.filter(Boolean)
					.join(' ')
					.trim() || null,
		})
		.where(eq(Owners.user_id, payload.data.id))
		.returning({ id: Owners.id });

	if (!updatedOwner) {
		return c.json(
			{
				error: 'Update Failed',
				details: 'Owner update operation failed',
			},
			500
		);
	}

	const ownedCars = await db
		.select({ id: Cars.id })
		.from(Cars)
		.where(eq(Cars.current_owner_id, updatedOwner.id));

	await Promise.all([
		...ownedCars
			.map((car) => [
				c.env.CACHE.delete(`cars:details:${car.id}`),
				c.env.CACHE.delete(`cars:summary:${car.id}`),
			])
			.flat(),
	]);

	return c.json({
		success: true,
		data: {
			ownerId: updatedOwner.id,
			carIds: ownedCars.map((car) => car.id),
		},
	});
}

export default webhooksRouter;
