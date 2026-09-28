import { preloadFile, preloadMultiFileDiff } from '@pierre/diffs/ssr';
import { counterAfter, counterBefore, samples } from '../docs/examples.js';
import { pierreTheme } from '../docs/theme.svelte.js';

export const prerender = true;

// Everything is highlighted at build time. The page ships as HTML with
// declarative shadow DOM, and the components hydrate it on load.
export async function load() {
	const codeOptions = { theme: pierreTheme, themeType: 'dark', disableLineNumbers: true } as const;

	const entries = await Promise.all(
		Object.entries(samples).map(async ([key, file]) => {
			const { prerenderedHTML } = await preloadFile({ file, options: codeOptions });
			return [key, prerenderedHTML] as const;
		})
	);

	const hero = await preloadMultiFileDiff({
		oldFile: counterBefore,
		newFile: counterAfter,
		options: { theme: pierreTheme, themeType: 'dark', diffStyle: 'split' }
	});

	return { html: Object.fromEntries(entries), heroHTML: hero.prerenderedHTML };
}
