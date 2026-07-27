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

import { createReadStream, existsSync } from 'node:fs';
import { join, normalize } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import svgr from 'vite-plugin-svgr';

/** Dev-only: serve gitignored files from `/local` at `/local/*` (see local/AGENTS.md). */
function serveLocalDevTools(): Plugin {
	return {
		name: 'serve-local-dev-tools',
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				const raw = req.url?.split('?')[0] ?? '';

				if (!raw.startsWith('/local/')) {
					return next();
				}

				const relative = decodeURIComponent(raw.slice('/local/'.length));

				if (!relative || relative.includes('..')) {
					return next();
				}

				const root = join(process.cwd(), 'local');
				const file = normalize(join(root, relative));

				if (!file.startsWith(root) || !existsSync(file)) {
					return next();
				}

				if (file.endsWith('.html')) {
					res.setHeader('Content-Type', 'text/html; charset=utf-8');
				}

				createReadStream(file)
					.on('error', () => next())
					.pipe(res);
			});
		},
	};
}

export default defineConfig({
	plugins: [react(), svgr(), tailwindcss(), serveLocalDevTools()],
	build: {
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true,
			},
		},
		rollupOptions: {
			output: {
				manualChunks: {
					'react-vendor': ['react', 'react-dom', 'react-router-dom'],
					'maps-vendor': ['@react-google-maps/api'],
					'clerk-vendor': ['@clerk/clerk-react'],
				},
			},
		},
		sourcemap: true,
	},
	server: {
		host: true,
		port: 5173,
	},
});
