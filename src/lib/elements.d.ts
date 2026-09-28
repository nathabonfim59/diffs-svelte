import type { HTMLAttributes } from 'svelte/elements';

declare module 'svelte/elements' {
	interface SvelteHTMLElements {
		'diffs-container': HTMLAttributes<HTMLElement>;
	}
}

export {};
