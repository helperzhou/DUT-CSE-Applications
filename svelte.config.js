import adapter from '@sveltejs/adapter-azure';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		alias: {
            "@/*": "./path/to/lib/*",
        },
		adapter: adapter(),
		// Ensure the correct port is used
		// Azure sets the PORT dynamically, so we respect that
		vite: {
			server: {
				port: process.env.PORT || 3000, // Default to 3000 if no PORT is set
				host: '0.0.0.0', // Required for Azure compatibility
			}
		}
	}
};

export default config;
