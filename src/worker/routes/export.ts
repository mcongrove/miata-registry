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
import { CarOwners, Cars, Editions, Owners, Tips } from '../../db/schema';
import { withAuth } from '../middleware/auth';
import type { Bindings } from '../types';

const exportRouter = new Hono<{ Bindings: Bindings }>();

exportRouter.use('*', withAuth());

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

exportRouter.get('/', async (c) => {
	try {
		const db = createDb(c.env.DB);

		// Fetch data from all tables
		const carOwners = await db.select().from(CarOwners);
		const cars = await db.select().from(Cars);
		const editions = await db.select().from(Editions);
		const owners = await db.select().from(Owners);
		const tips = await db.select().from(Tips);

		// Convert to CSVs
		const carOwnersCSV = objectsToCSV(carOwners);
		const carsCSV = objectsToCSV(cars);
		const editionsCSV = objectsToCSV(editions);
		const ownersCSV = objectsToCSV(owners);
		const tipsCSV = objectsToCSV(tips);

		// Create ZIP file
		const zip = new JSZip();

		zip.file('car_owners.csv', carOwnersCSV);
		zip.file('cars.csv', carsCSV);
		zip.file('editions.csv', editionsCSV);
		zip.file('owners.csv', ownersCSV);
		zip.file('tips.csv', tipsCSV);

		const zipBlob = await zip.generateAsync({ type: 'blob' });

		// Set response headers
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
					error instanceof Error ? error.message : 'Unknown error',
			},
			500
		);
	}
});

export default exportRouter;
