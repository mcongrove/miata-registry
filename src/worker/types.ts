/**
 * Miata Registry
 * Copyright (C) 2024 Matthew Congrove
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import { D1Database, R2Bucket } from '@cloudflare/workers-types';

export type Bindings = {
	DB: D1Database;
	IMAGES: R2Bucket;
};

export type ApiError = {
	error: string;
	details?: string;
};
