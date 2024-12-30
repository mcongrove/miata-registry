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
