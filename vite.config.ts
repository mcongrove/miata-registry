import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		svgr(),
		sentryVitePlugin({
			org: 'miata-registry',
			project: 'webapp',
		}),
	],
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
