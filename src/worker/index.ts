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
import type { Bindings } from './types';
import carsRouter from './routes/cars';
import editionsRouter from './routes/editions';
import ownersRouter from './routes/owners';
import statsRouter from './routes/stats';

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS
app.use('*', cors());

// Basic test endpoint
app.get('/', (c) => c.json({ status: 'ok' }));

// Mount API routes
app.route('/cars', carsRouter);
app.route('/editions', editionsRouter);
app.route('/owners', ownersRouter);
app.route('/stats', statsRouter);

export default app;
