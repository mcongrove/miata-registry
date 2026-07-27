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

import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { Resend } from 'resend';
import { createDb } from '../../db';
import { Cars, Owners } from '../../db/schema';
import { withAuth } from '../middleware/auth';
import { allowLocalDevCarEditBypass } from '../utils/carEditAccess';
import { stripJpegMetadata } from '../utils/stripJpegMetadata';
import type { Bindings } from '../types';

const photosRouter = new Hono<{ Bindings: Bindings }>();

photosRouter.get('/index', async (c) => {
	try {
		const carIds: string[] = [];
		let cursor: string | undefined;

		do {
			const listed = await c.env.IMAGES.list({
				prefix: 'car/',
				cursor,
				limit: 1000,
			});

			for (const object of listed.objects) {
				if (!object.key.endsWith('.jpg')) continue;

				carIds.push(object.key.slice('car/'.length, -'.jpg'.length));
			}

			cursor = listed.truncated ? listed.cursor : undefined;
		} while (cursor);

		return c.json({ carIds });
	} catch (error) {
		console.error('Error listing car photos:', error);

		return c.json(
			{
				error: 'Internal server error',
				details:
					error instanceof Error ? error.message : 'Unknown error',
			},
			500
		);
	}
});

photosRouter.post('/:id', withAuth(), async (c) => {
	try {
		const id = c.req.param('id');
		const userId = c.get('userId');

		if (!id || !userId) {
			return c.json(
				{
					error: 'Unauthorized',
					details: "You don't have permission to do that",
				},
				401
			);
		}

		const formData = await c.req.formData();
		const file = formData.get('photo') as File;

		if (!file) {
			return c.json({ error: 'Bad request' }, 400);
		}

		const db = createDb(c.env.DB);
		const devBypass = allowLocalDevCarEditBypass(c.env.NODE_ENV, id);

		const accessConditions = devBypass
			? [eq(Cars.id, id)]
			: [eq(Owners.user_id, userId), eq(Cars.id, id)];

		const [car] = await db
			.select({
				id: Cars.id,
			})
			.from(Cars)
			.innerJoin(Owners, eq(Cars.current_owner_id, Owners.id))
			.where(and(...accessConditions));

		if (!car) {
			return c.json(
				{
					error: 'Unauthorized',
					details: "You don't have permission to do that",
				},
				403
			);
		}

		const stripped = stripJpegMetadata(await file.arrayBuffer());

		await c.env.IMAGES.put(`car-pending/${id}.jpg`, stripped, {
			httpMetadata: {
				contentType: 'image/jpeg',
				cacheControl: 'public, max-age=31536000',
			},
		});

		const resend = new Resend(c.env.RESEND_API_KEY);

		await resend.emails.send({
			from: 'Miata Registry <support@miataregistry.com>',
			to: 'mattcongrove@gmail.com',
			subject: 'Miata Registry: Photo Submission',
			html: `
				<h2>Photo Submission</h2>
				<p><strong>Car ID:</strong> ${id}</p>
			`,
		});

		return c.json({ success: true });
	} catch (error) {
		console.error('Error uploading photo:', error);

		return c.json(
			{
				error: 'Internal server error',
				details:
					error instanceof Error ? error.message : 'Unknown error',
			},
			500
		);
	}
});

export default photosRouter;
