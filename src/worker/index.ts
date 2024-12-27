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
import { cors } from 'hono/cors';
import carsRouter from './routes/cars';
import editionsRouter from './routes/editions';
import ownersRouter from './routes/owners';
import statsRouter from './routes/stats';
import type { Bindings } from './types';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', async (c, next) => {
	const ALLOWED_ORIGINS =
		c.env.NODE_ENV !== 'development'
			? ['https://miataregistry.com']
			: ['https://miataregistry.com', 'http://localhost:5173'];

	const origin = c.req.header('Origin');

	if (c.env.NODE_ENV !== 'development') {
		if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
			return c.json({ error: 'Unauthorized' }, 403);
		}
	}
	return cors({
		origin: ALLOWED_ORIGINS,
		allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		maxAge: 86400,
		credentials: true,
	})(c, next);
});

// API test endpoint
app.get('/', (c) => c.json({ status: 'ok' }));

// Mount API routes
app.route('/cars', carsRouter);
app.route('/editions', editionsRouter);
app.route('/owners', ownersRouter);
app.route('/stats', statsRouter);

export default app;
