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
import { sql } from 'drizzle-orm';
import { Hono } from 'hono';
import JSZip from 'jszip';
import { createDb } from '../../db';
import {
	CarOwners,
	CarOwnersPending,
	Cars,
	CarsPending,
	Editions,
	Owners,
	OwnersPending,
	Tips,
} from '../../db/schema';
import { objectsToCSV } from '../../utils/data';
import type { Bindings } from '../types';

const CACHE_TTL = {
	ARCHIVE: 60 * 60 * 24 * 7, // 7 days
	PULSE: 60 * 60 * 24, // 1 day
};

const heartbeatRouter = new Hono<{ Bindings: Bindings }>();

heartbeatRouter.get('/pulse', async (c) => {
	try {
		const isDev = c.env.NODE_ENV === 'development';
		const cached = await c.env.CACHE.get('heartbeat:pulse');

		if (cached) {
			const response = c.json(JSON.parse(cached));

			response.headers.set('X-Cache', 'HIT');

			return response;
		}

		const clerk = createClerkClient({
			secretKey: c.env.CLERK_SECRET_KEY,
			publishableKey: c.env.CLERK_PUBLISHABLE_KEY,
		});

		const userId = c.env.ADMIN_USER_ID;

		if (!userId) {
			throw new Error('ADMIN_USER_ID environment variable is not set');
		}

		const user = await clerk.users.getUser(userId);

		if (!user) {
			return c.json({ error: 'User not found' }, 404);
		}

		if (!isDev) {
			await c.env.CACHE.put(
				'heartbeat:pulse',
				JSON.stringify({ timestamp: user.lastActiveAt }),
				{
					expirationTtl: CACHE_TTL.PULSE,
				}
			);
		}

		return c.json({
			timestamp: user.lastActiveAt,
		});
	} catch (error) {
		console.error('Error fetching pulse:', error);

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

heartbeatRouter.get('/archive', async (c) => {
	try {
		const cached = await c.env.CACHE.get('heartbeat:archive');

		if (!cached) {
			return c.json({ error: 'No archive information available' }, 404);
		}

		const response = c.json(JSON.parse(cached));

		response.headers.set('X-Cache', 'HIT');

		return response;
	} catch (error) {
		console.error('Error fetching archive info:', error);

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

heartbeatRouter.post('/archive/cron', async (c) => {
	try {
		const authHeader = c.req.header('Authorization');

		if (authHeader !== `Bearer ${c.env.ARCHIVE_ORG_CRON_SECRET}`) {
			return c.json({ error: 'Unauthorized' }, 401);
		}

		const db = createDb(c.env.DB);

		const carOwners = await db.select().from(CarOwners);
		const carOwnersPending = await db.select().from(CarOwnersPending);
		const cars = await db.select().from(Cars);
		const carsPending = await db.select().from(CarsPending);
		const editions = await db.select().from(Editions);
		const owners = await db
			.select({
				id: Owners.id,
				name: Owners.name,
				city: Owners.city,
				state: Owners.state,
				country: Owners.country,
				user_id: Owners.user_id,
				links: sql<string>`json(${Owners.links})`.as('links'),
			})
			.from(Owners);
		const ownersPending = await db.select().from(OwnersPending);
		const tips = await db.select().from(Tips);

		const carOwnersCSV = objectsToCSV(carOwners);
		const carOwnersPendingCSV = objectsToCSV(carOwnersPending);
		const carsCSV = objectsToCSV(cars);
		const carsPendingCSV = objectsToCSV(carsPending);
		const editionsCSV = objectsToCSV(editions);
		const ownersCSV = objectsToCSV(owners);
		const ownersPendingCSV = objectsToCSV(ownersPending);
		const tipsCSV = objectsToCSV(tips);

		const zip = new JSZip();

		zip.file('car_owners.csv', carOwnersCSV);
		zip.file('car_owners_pending.csv', carOwnersPendingCSV);
		zip.file('cars.csv', carsCSV);
		zip.file('cars_pending.csv', carsPendingCSV);
		zip.file('editions.csv', editionsCSV);
		zip.file('owners.csv', ownersCSV);
		zip.file('owners_pending.csv', ownersPendingCSV);
		zip.file('tips.csv', tipsCSV);

		const zipBlob = await zip.generateAsync({
			type: 'blob',
			compression: 'DEFLATE',
			mimeType: 'application/zip',
		});

		const timestamp = new Date().toISOString().split('T')[0];
		const identifier = `miata-registry-${timestamp}`;
		const filename = `miata-registry-${timestamp}.zip`;

		const response = await fetch(
			`https://s3.us.archive.org/${identifier}/${filename}`,
			{
				method: 'PUT',
				headers: {
					Authorization: `LOW ${c.env.ARCHIVE_ORG_ACCESS_KEY}:${c.env.ARCHIVE_ORG_SECRET_KEY}`,
					'x-archive-auto-make-bucket': '1',
					'x-archive-meta01-collection': 'opensource',
					'x-archive-meta-mediatype': 'data',
					'x-archive-meta-title': `Miata Registry Database Backup - ${timestamp}`,
					'x-archive-meta-creator': 'Miata Registry',
					'x-archive-meta-description':
						'Weekly backup of the Miata Registry database in CSV format',
					'x-archive-meta-subject': 'mazda;miata;mx5;cars;automotive',
					'x-archive-meta-licenseurl':
						'https://www.gnu.org/licenses/agpl-3.0.html',
					'Content-Type': 'application/zip',
				},
				body: zipBlob,
			}
		);

		let responseText;

		try {
			responseText = await response.text();
		} catch (e) {
			console.error('Failed to read response text:', e);
		}

		if (!response.ok) {
			throw new Error(
				`Upload failed: ${response.status} ${response.statusText}\nResponse: ${responseText}`
			);
		}

		await c.env.CACHE.put(
			'heartbeat:archive',
			JSON.stringify({
				timestamp: Date.now(),
				filename,
				url: `https://archive.org/details/${identifier}`,
			}),
			{
				expirationTtl: CACHE_TTL.ARCHIVE,
			}
		);

		return c.json({ success: true });
	} catch (error) {
		console.error('Error fetching pulse:', error);

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

export default heartbeatRouter;
