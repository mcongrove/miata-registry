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
import JSZip from 'jszip';
import { createDb } from '../../db';
import {
	CarOwners,
	CarOwnersPending,
	Cars,
	CarsPending,
	Editions,
	News,
	Owners,
	OwnersPending,
	Tips,
} from '../../db/schema';
import { withAuth } from '../middleware/auth';
import type { Bindings } from '../types';

const exportRouter = new Hono<{ Bindings: Bindings }>();

const objectsToCSV = (data: any[]) => {
	if (data.length === 0) return '';

	const headers = Object.keys(data[0]);

	const csvRows = [
		headers.join(','),
		...data.map((row) =>
			headers
				.map((header) => {
					const value = row[header]?.toString() ?? '';

					return value.includes(',') || value.includes('"')
						? `"${value.replace(/"/g, '""')}"`
						: value;
				})
				.join(',')
		),
	];

	return csvRows.join('\n');
};

exportRouter.get('/', withAuth(), async (c) => {
	try {
		const db = createDb(c.env.DB);

		const carOwners = await db.select().from(CarOwners);
		const carOwnersPending = await db.select().from(CarOwnersPending);
		const cars = await db.select().from(Cars);
		const carsPending = await db.select().from(CarsPending);
		const editions = await db.select().from(Editions);
		const news = await db.select().from(News);
		const owners = await db.select().from(Owners);
		const ownersPending = await db.select().from(OwnersPending);
		const tips = await db.select().from(Tips);

		const carOwnersCSV = objectsToCSV(carOwners);
		const carOwnersPendingCSV = objectsToCSV(carOwnersPending);
		const carsCSV = objectsToCSV(cars);
		const carsPendingCSV = objectsToCSV(carsPending);
		const editionsCSV = objectsToCSV(editions);
		const newsCSV = objectsToCSV(news);
		const ownersCSV = objectsToCSV(owners);
		const ownersPendingCSV = objectsToCSV(ownersPending);
		const tipsCSV = objectsToCSV(tips);

		const zip = new JSZip();

		zip.file('car_owners.csv', carOwnersCSV);
		zip.file('car_owners_pending.csv', carOwnersPendingCSV);
		zip.file('cars.csv', carsCSV);
		zip.file('cars_pending.csv', carsPendingCSV);
		zip.file('editions.csv', editionsCSV);
		zip.file('news.csv', newsCSV);
		zip.file('owners.csv', ownersCSV);
		zip.file('owners_pending.csv', ownersPendingCSV);
		zip.file('tips.csv', tipsCSV);

		const zipBlob = await zip.generateAsync({ type: 'blob' });

		c.header('Content-Type', 'application/zip');
		c.header(
			'Content-Disposition',
			'attachment; filename=miata-registry-export.zip'
		);

		return new Response(zipBlob);
	} catch (error) {
		console.error('Error exporting database:', error);

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

export default exportRouter;
