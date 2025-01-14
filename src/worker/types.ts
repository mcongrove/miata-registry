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

import { ClerkClient } from '@clerk/backend';
import { D1Database, KVNamespace, R2Bucket } from '@cloudflare/workers-types';

declare module 'hono' {
	interface ContextVariableMap {
		clerk: ClerkClient;
		clerkWebhookBody: string;
		userId: string;
	}
}

export type ApiError = {
	details?: string;
	error: string;
};

export interface Bindings {
	ADMIN_USER_ID: string;
	ARCHIVE_ORG_ACCESS_KEY: string;
	ARCHIVE_ORG_SECRET_KEY: string;
	ARCHIVE_ORG_CRON_SECRET: string;
	CACHE: KVNamespace;
	CLERK_PUBLISHABLE_KEY: string;
	CLERK_SECRET_KEY: string;
	CLERK_WEBHOOK_SECRET: string;
	DB: D1Database;
	IMAGES: R2Bucket;
	NODE_ENV: string;
	RESEND_API_KEY: string;
	RESEND_AUDIENCE_ID: string;
}
