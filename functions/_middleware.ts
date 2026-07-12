/**
 * Miata Registry
 * Copyright (C) 2024-2026 Matthew Congrove
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

import type { D1Database, Fetcher, KVNamespace } from '@cloudflare/workers-types';
import { ASSET_PATH_PATTERN } from '../src/seo/constants';
import {
	buildBotHtmlResponse,
	buildBotNotFoundResponse,
	buildDefaultBotHtml,
	isKnownSpaRoute,
	resolveBotPageMeta,
} from '../src/seo/botMiddleware';
import { isBotUserAgent } from '../src/seo/indexing';

interface Env {
	ASSETS: Fetcher;
	CACHE: KVNamespace;
	DB: D1Database;
}

const acceptsHtml = (request: Request): boolean => {
	const accept = request.headers.get('Accept') ?? '';

	return accept.includes('text/html') || accept.includes('*/*');
};

const isAssetPath = (pathname: string): boolean => {
	if (pathname.startsWith('/assets/')) {
		return true;
	}

	return ASSET_PATH_PATTERN.test(pathname);
};

const fetchIndexHtml = async (
	env: Env,
	request: Request
): Promise<string | null> => {
	const assetRequest = new Request(new URL('/index.html', request.url), request);
	const response = await env.ASSETS.fetch(assetRequest);

	if (!response.ok) {
		return null;
	}

	return response.text();
};

export const onRequest: PagesFunction<Env> = async (context) => {
	const { request, env } = context;
	const url = new URL(request.url);
	const userAgent = request.headers.get('User-Agent') ?? '';

	if (
		!isBotUserAgent(userAgent) ||
		request.method !== 'GET' ||
		isAssetPath(url.pathname) ||
		!acceptsHtml(request)
	) {
		return context.next();
	}

	const html = await fetchIndexHtml(env, request);

	if (!html) {
		return context.next();
	}

	const meta = await resolveBotPageMeta(env.DB, url.pathname, url.searchParams);

	if (meta === 'not_found') {
		return buildBotNotFoundResponse();
	}

	if (meta) {
		return buildBotHtmlResponse(html, meta);
	}

	if (!isKnownSpaRoute(url.pathname)) {
		return buildBotNotFoundResponse();
	}

	return buildDefaultBotHtml(html, url.pathname);
};
