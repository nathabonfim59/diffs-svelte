export type Mode = 'dark' | 'light';

const STORAGE_KEY = 'diffs-svelte-theme';

export const ui = $state({ mode: 'dark' as Mode });

export const pierreTheme = { dark: 'pierre-dark', light: 'pierre-light' } as const;

/** Options every example on the page shares. */
export function baseOptions() {
	return { theme: pierreTheme, themeType: ui.mode };
}

export function loadMode() {
	const attr = document.documentElement.dataset.theme;
	if (attr === 'light' || attr === 'dark') ui.mode = attr;
}

export function setMode(mode: Mode) {
	ui.mode = mode;
	document.documentElement.dataset.theme = mode;
	try {
		localStorage.setItem(STORAGE_KEY, mode);
	} catch {
		// Storage can be unavailable (private mode, blocked site data).
	}
}
