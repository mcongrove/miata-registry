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

import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { Resend } from 'resend';
import { createDb } from '../../db';
import {
	CarOwnersPending,
	Cars,
	CarsPending,
	Editions,
	Owners,
	OwnersPending,
	Tips,
} from '../../db/schema';
import { withAuth } from '../middleware/auth';
import type { Bindings } from '../types';

const claimsRouter = new Hono<{ Bindings: Bindings }>();

claimsRouter.post('/existing', withAuth(), async (c) => {
	try {
		const userId = c.get('userId');
		const user = await c.get('clerk').users.getUser(userId);
		const body = await c.req.json();
		const db = createDb(c.env.DB);
		let ownerId = body.owner_id;

		const existingCar = await db
			.select()
			.from(Cars)
			.where(eq(Cars.id, body.car_id))
			.get();

		if (!existingCar) {
			return c.json(
				{
					error: 'Not Found',
					details: 'Car not found',
				},
				404
			);
		}

		const existingOwner = await db
			.select({ id: Owners.id })
			.from(Owners)
			.where(eq(Owners.user_id, userId));

		if (!ownerId) {
			if (existingOwner.length > 0) {
				return c.json(
					{
						error: 'Conflict',
						details: 'An owner already exists for this user',
					},
					409
				);
			}

			ownerId = crypto.randomUUID();

			await db.insert(OwnersPending).values({
				city: body.owner_city || null,
				country: body.owner_country || null,
				created_at: Math.floor(Date.now() / 1000),
				id: ownerId,
				name: body.owner_name,
				state: body.owner_state || null,
				status: 'pending',
				user_id: userId,
			});
		}

		await db.insert(CarOwnersPending).values({
			car_id: body.car_id,
			created_at: Math.floor(Date.now() / 1000),
			date_start: `${body.owner_date_start}T00:00:00.000Z`,
			id: crypto.randomUUID(),
			information: body.information || null,
			owner_id: ownerId,
			status: 'pending',
		});

		if (`${user.firstName} ${user.lastName}` !== body.owner_name) {
			await c.get('clerk').users.updateUser(userId, {
				firstName: body.owner_name.split(' ')[0],
				lastName: body.owner_name.split(' ')[1],
			});
		}

		const resend = new Resend(c.env.RESEND_API_KEY);

		await resend.emails.send({
			from: 'Miata Registry <support@miataregistry.com>',
			to: 'mattcongrove@gmail.com',
			subject: 'Miata Registry: Owner Change Request',
			html: `
				<h2>Owner Change Request</h2>
				<p><strong>Owner ID:</strong> ${ownerId}</p>
		 `,
		});

		return c.json({ success: true, id: ownerId });
	} catch (error) {
		console.error('Error creating owner:', error);

		return c.json(
			{
				error: 'Internal server error',
				details:
					error instanceof Error
						? error.message
						: 'An unknown error occurred',
			},
			501
		);
	}
});

claimsRouter.post('/new', withAuth(), async (c) => {
	try {
		const userId = c.get('userId');
		const user = await c.get('clerk').users.getUser(userId);
		const body = await c.req.json();
		const db = createDb(c.env.DB);
		const carId = crypto.randomUUID();
		let ownerId = body.owner_id;

		const existingCar = await db
			.select()
			.from(Cars)
			.where(eq(Cars.vin, body.vin))
			.get();

		if (existingCar) {
			return c.json(
				{
					error: 'Conflict',
					details: {
						id: existingCar.id,
					},
				},
				409
			);
		}

		const existingOwner = await db
			.select({ id: Owners.id })
			.from(Owners)
			.where(eq(Owners.user_id, userId));

		if (!ownerId) {
			if (existingOwner.length > 0) {
				return c.json(
					{
						error: 'Conflict',
						details: 'An owner already exists for this user',
					},
					409
				);
			}

			ownerId = crypto.randomUUID();

			await db.insert(OwnersPending).values({
				city: body.owner_city || null,
				country: body.owner_country || null,
				created_at: Math.floor(Date.now() / 1000),
				id: ownerId,
				name: body.owner_name,
				state: body.owner_state || null,
				status: 'pending',
				user_id: userId,
			});
		}

		await db.insert(CarOwnersPending).values({
			car_id: carId,
			created_at: Math.floor(Date.now() / 1000),
			date_start: `${body.owner_date_start}T00:00:00.000Z`,
			id: crypto.randomUUID(),
			information: body.information || null,
			owner_id: ownerId,
			status: 'pending',
		});

		const edition = await db
			.select({ id: Editions.id })
			.from(Editions)
			.where(
				and(
					eq(Editions.name, body.edition_name.substring(5)),
					eq(Editions.year, parseInt(body.edition_name.substring(0, 4)))
				)
			)
			.get();

		let editionId = edition?.id;

		if (!editionId) {
			return c.json(
				{
					error: 'Not Found',
					details: 'Edition not found',
				},
				404
			);
		}

		await db.insert(CarsPending).values({
			car_id: carId,
			created_at: Math.floor(Date.now() / 1000),
			current_owner_id: ownerId,
			edition_id: editionId,
			id: crypto.randomUUID(),
			sequence: body.sequence,
			status: 'pending',
			vin: body.vin,
		});

		if (`${user.firstName} ${user.lastName}` !== body.owner_name) {
			await c.get('clerk').users.updateUser(userId, {
				firstName: body.owner_name.split(' ')[0],
				lastName: body.owner_name.split(' ')[1],
			});
		}

		const resend = new Resend(c.env.RESEND_API_KEY);

		await resend.emails.send({
			from: 'Miata Registry <support@miataregistry.com>',
			to: 'mattcongrove@gmail.com',
			subject: 'Miata Registry: Owner Change Request',
			html: `
				<h2>Owner Change Request</h2>
				<p><strong>Owner ID:</strong> ${ownerId}</p>
		 `,
		});

		return c.json({ success: true, id: ownerId });
	} catch (error) {
		console.error('Error creating owner:', error);

		return c.json(
			{
				error: 'Internal server error',
				details:
					error instanceof Error
						? error.message
						: 'An unknown error occurred',
			},
			501
		);
	}
});

claimsRouter.post('/tip', async (c) => {
	try {
		const formData = await c.req.formData();
		const tipId = crypto.randomUUID();

		const values = {
			created_at: Math.floor(Date.now() / 1000),
			edition_name: formData.get('edition_name') as string,
			id: tipId,
			information: (formData.get('information') as string) || null,
			owner_date_start: formData.get('owner_date_start')
				? (formData.get('owner_date_start') as string) +
					'T00:00:00.000Z'
				: null,
			owner_location: (formData.get('owner_location') as string) || null,
			owner_name: (formData.get('owner_name') as string) || null,
			sequence: (formData.get('sequence') as string) || null,
			user_id: (formData.get('user_id') as string) || null,
			vin: (formData.get('vin') as string).toUpperCase() || null,
		};

		if (values.owner_name === 'Cypress Test') {
			return c.json({ success: true, tipId, data: values });
		}

		const db = createDb(c.env.DB);

		await db.insert(Tips).values(values);

		const resend = new Resend(c.env.RESEND_API_KEY);

		await resend.emails.send({
			from: 'Miata Registry <support@miataregistry.com>',
			to: 'mattcongrove@gmail.com',
			subject: 'Miata Registry: Tip Submission',
			html: `
                <h2>Tip Submission</h2>
                <p><strong>Tip ID:</strong> ${tipId}</p>
            `,
		});

		return c.json({ success: true, tipId });
	} catch (error) {
		console.error('Error submitting tip:', error);

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

export default claimsRouter;
