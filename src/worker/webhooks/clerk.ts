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
import { Context } from 'hono';
import { Resend } from 'resend';
import { createDb } from '../../db';
import { Cars, Owners } from '../../db/schema';
import Welcome from '../../emails/templates/Welcome';
import type { Bindings } from '../types';
import type { UserCreatedPayload, UserUpdatedPayload } from '../types/clerk';

type WebhookContext = Context<{ Bindings: Bindings }>;

export async function handleUserCreated(
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
			audienceId: c.env.RESEND_AUDIENCE_ID,
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

		await resend.emails.send({
			from: 'Miata Registry <no-reply@miataregistry.com>',
			to: primaryEmail.email_address,
			subject: 'Welcome to Miata Registry!',
			react: Welcome(),
		});

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

export async function handleUserUpdated(
	c: WebhookContext,
	payload: UserUpdatedPayload
) {
	const db = createDb(c.env.DB);

	try {
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
	} catch (error) {
		console.error('Error in handleUserUpdated:', error);

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
