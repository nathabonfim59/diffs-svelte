import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// The docs site is prerendered to static files for GitHub Pages.
			adapter: adapter({ pages: 'build', assets: 'build' }),
			paths: {
				// Set by the Pages workflow to "/<repo-name>".
				base: (process.env.BASE_PATH ?? '') as '' | `/${string}`
			}
		})
	]
});
