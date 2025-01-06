import { defineConfig } from 'cypress';

export default defineConfig({
	projectId: 'ygesqc',
	e2e: {
		baseUrl: 'http://localhost:5173',
		viewportWidth: 1280,
		viewportHeight: 720,
		video: false,
		screenshotOnRunFailure: true,
		defaultCommandTimeout: 10000,
		retries: {
			runMode: 2,
			openMode: 0,
		},
		experimentalStudio: true,
	},
	env: {
		apiUrl: 'http://localhost:8787',
	},
});
