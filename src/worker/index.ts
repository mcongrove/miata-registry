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
import claimsRouter from './routes/claims';
import editionsRouter from './routes/editions';
import emailRouter from './routes/email';
import heartbeatRouter from './routes/heartbeat';
import moderationRouter from './routes/moderation';
import newsRouter from './routes/news';
import ownersRouter from './routes/owners';
import photosRouter from './routes/photos';
import statsRouter from './routes/stats';
import webhooksRouter from './routes/webhooks';
import type { Bindings } from './types';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', async (c, next) => {
	if (
		c.req.path.startsWith('/webhooks') ||
		c.req.path.startsWith('/heartbeat')
	) {
		return cors({
			origin: '*',
			allowMethods: ['GET', 'POST'],
			maxAge: 86400,
			credentials: true,
		})(c, next);
	}

	const ALLOWED_ORIGINS =
		c.env.NODE_ENV !== 'development'
			? ['https://miataregistry.com']
			: ['https://miataregistry.com', 'http://localhost:5173'];

	const origin = c.req.header('Origin');

	if (c.env.NODE_ENV !== 'development') {
		if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
			return c.json(
				{
					error: 'Unauthorized',
					details: "You don't have permission to do that",
				},
				401
			);
		}
	}

	return cors({
		origin: ALLOWED_ORIGINS,
		allowMethods: ['GET', 'PATCH', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		maxAge: 86400,
		credentials: true,
	})(c, next);
});

app.get('/', (c) => c.json({ error: 'Not found' }, 404));

app.route('/heartbeat', heartbeatRouter);
app.route('/cars', carsRouter);
app.route('/claims', claimsRouter);
app.route('/editions', editionsRouter);
app.route('/email', emailRouter);
app.route('/moderation', moderationRouter);
app.route('/news', newsRouter);
app.route('/owners', ownersRouter);
app.route('/photos', photosRouter);
app.route('/stats', statsRouter);
app.route('/webhooks', webhooksRouter);

export default {
	fetch: app.fetch,
	async scheduled(_event: any, env: any, ctx: any) {
		try {
			ctx.waitUntil(
				(async () => {
					const response = await fetch(
						'https://miata-registry.miata-registry.workers.dev/heartbeat/archive/cron',
						{
							method: 'POST',
							headers: {
								Authorization: `Bearer ${env.ARCHIVE_ORG_CRON_SECRET}`,
							},
						}
					);

					if (!response.ok) {
						throw new Error(
							`Failed to trigger archive: ${response.status} ${response.statusText}`
						);
					}
				})()
			);
		} catch (error) {
			console.error('Cron job failed:', error);
		}
	},
};
