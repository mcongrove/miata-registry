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
import { Cars, Owners } from '../../db/schema';
import { withAuth } from '../middleware/auth';
import type { Bindings } from '../types';

const photosRouter = new Hono<{ Bindings: Bindings }>();

photosRouter.post('/:id', withAuth(), async (c) => {
	try {
		const id = c.req.param('id');
		const userId = c.get('userId');
		const formData = await c.req.formData();
		const file = formData.get('photo') as File;

		if (!file) {
			return c.json({ error: 'Bad request' }, 400);
		}

		const db = createDb(c.env.DB);

		const [car] = await db
			.select({
				id: Cars.id,
			})
			.from(Cars)
			.innerJoin(Owners, eq(Cars.current_owner_id, Owners.id))
			.where(and(eq(Owners.user_id, userId), eq(Cars.id, id)));

		if (!car) {
			return c.json(
				{
					error: 'Unauthorized',
					details: "You don't have permission to do that",
				},
				403
			);
		}

		await c.env.IMAGES.put(
			`car-pending/${id}.jpg`,
			await file.arrayBuffer(),
			{
				httpMetadata: {
					contentType: 'image/jpeg',
					cacheControl: 'public, max-age=31536000',
				},
			}
		);

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
