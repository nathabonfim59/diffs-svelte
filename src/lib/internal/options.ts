const noopRender = () => null;

interface MergeFlags {
	controlledSelection: boolean;
	hasCustomHeader: boolean;
	hasGutterUtility: boolean;
}

/**
 * Mirrors the React bindings: when a slot is rendered by the framework, the
 * core still needs a render callback so it emits the matching <slot>.
 */
export function mergeOptions<T extends object>(
	options: T | undefined,
	{ controlledSelection, hasCustomHeader, hasGutterUtility }: MergeFlags
): T | undefined {
	if (!controlledSelection && !hasCustomHeader && !hasGutterUtility) return options;
	const base = options as Record<string, unknown> | undefined;
	return {
		...options,
		controlledSelection,
		renderCustomHeader: hasCustomHeader ? noopRender : base?.renderCustomHeader,
		renderGutterUtility: hasGutterUtility ? noopRender : base?.renderGutterUtility,
		// The core hides the gutter slot unless this is on. Passing the snippet
		// already says the caller wants it, so default to true.
		enableGutterUtility: hasGutterUtility
			? (base?.enableGutterUtility ?? true)
			: base?.enableGutterUtility
	} as T;
}

// z-index matches the core's own [data-utility-button]; without it the line
// number (z-index 1) sits on top and swallows clicks.
export const GUTTER_UTILITY_STYLE =
	'position:absolute;top:0;bottom:0;z-index:4;text-align:center;white-space:normal;touch-action:none';

/** Declarative shadow DOM for SSR; the browser consumes the <template> while parsing. */
export function shadowTemplate(prerenderedHTML: string | undefined): string {
	if (typeof window !== 'undefined' || prerenderedHTML == null) return '';
	return `<template shadowrootmode="open">${prerenderedHTML}</template>`;
}
