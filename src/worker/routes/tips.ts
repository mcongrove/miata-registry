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
import { Resend } from 'resend';
import { v4 as uuid } from 'uuid';
import { createDb } from '../../db';
import { Tips } from '../../db/schema';
import type { Bindings } from '../types';

const tipsRouter = new Hono<{ Bindings: Bindings }>();

tipsRouter.post('/', async (c) => {
	try {
		const formData = await c.req.formData();
		const tipId = uuid();
		const db = createDb(c.env.DB);

		await db.insert(Tips).values({
			created_at: Date.now(),
			edition: formData.get('edition') as string,
			id: tipId,
			information: (formData.get('information') as string) || null,
			location: (formData.get('location') as string) || null,
			owner_name: (formData.get('ownerName') as string) || null,
			sequence_number: (formData.get('sequenceNumber') as string) || null,
			user_id: (formData.get('userId') as string) || null,
			vin: (formData.get('vin') as string) || null,
		});

		const resend = new Resend(c.env.RESEND_API_KEY);

		await resend.emails.send({
			from: 'Miata Registry <support@miataregistry.com>',
			to: 'mattcongrove@gmail.com',
			subject: 'Miata Registry: Tip Form',
			html: `
                <h2>Registry Tip</h2>
                <p><strong>Tip ID:</strong> ${tipId}</p>
                <p><strong>Edition:</strong> ${formData.get('edition')}</p>
                <p><strong>VIN:</strong> ${formData.get('vin') || 'Not provided'}</p>
                <p><strong>Sequence Number:</strong> ${formData.get('sequenceNumber') || 'Not provided'}</p>
                <p><strong>Owner Name:</strong> ${formData.get('ownerName') || 'Not provided'}</p>
                <p><strong>Location:</strong> ${formData.get('location') || 'Not provided'}</p>
                <p><strong>Information:</strong> ${formData.get('information') || 'Not provided'}</p>
            `,
		});

		return c.json({ success: true, tipId });
	} catch (error) {
		console.error('Error submitting tip:', error);

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

export default tipsRouter;
