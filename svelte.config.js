import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			// Output directory for Azure App Service
			out: 'build',
			precompress: true, // Precompress files for better performance
			envPrefix: 'SVELTEKIT_', // Helps Azure detect environment variables
			polyfill: false // Modern Node.js doesn't need polyfills
		}),

		// Fix path resolution for imports
		alias: {
			'$lib': './src/lib',
			'$components': './src/lib/components',
			'$routes': './src/routes'
		},

		// Ensure correct paths for Azure App Service
		paths: {
			base: process.env.BASE_PATH || ''
		},

		// Ensure correct CSP settings (needed in some Azure deployments)
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self', 'unsafe-inline'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:']
			}
		},

		// Fixes possible 404s on Azure
		trailingSlash: 'never'
	}
};

export default config;
