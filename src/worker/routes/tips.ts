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
import { createDb } from '../../db';
import { Tips } from '../../db/schema';
import type { Bindings } from '../types';

const tipsRouter = new Hono<{ Bindings: Bindings }>();

tipsRouter.post('/', async (c) => {
	try {
		const formData = await c.req.formData();
		const tipId = crypto.randomUUID();
		const values = {
			created_at: Date.now(),
			edition_name: formData.get('edition_name') as string,
			id: tipId,
			information: (formData.get('information') as string) || null,
			owner_location: (formData.get('owner_location') as string) || null,
			owner_name: (formData.get('owner_name') as string) || null,
			sequence: (formData.get('sequence') as string) || null,
			user_id: (formData.get('user_id') as string) || null,
			vin: (formData.get('vin') as string) || null,
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

export default tipsRouter;
