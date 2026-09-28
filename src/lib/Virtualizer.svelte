<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { Virtualizer, type VirtualizerConfig } from '@pierre/diffs';
	import { setVirtualizer } from './context.js';

	interface Props {
		children: Snippet;
		/** Read once on mount. */
		config?: Partial<VirtualizerConfig>;
		/** Classes for the scroll container. Give it a fixed height and `overflow: auto`. */
		class?: string;
		style?: string;
		contentClass?: string;
		contentStyle?: string;
		/** Bindable: the underlying vanilla `Virtualizer`. */
		instance?: Virtualizer;
	}

	let {
		children,
		config,
		class: className,
		style,
		contentClass,
		contentStyle,
		instance = $bindable()
	}: Props = $props();

	// Created during init so child components can read it from context.
	const virtualizer =
		typeof window === 'undefined' ? undefined : untrack(() => new Virtualizer(config));
	setVirtualizer(virtualizer);
	instance = virtualizer;

	function setup(root: HTMLElement) {
		virtualizer?.setup(root);
		return () => virtualizer?.cleanUp();
	}
</script>

<div {@attach setup} class={className} {style}>
	<div class={contentClass} style={contentStyle}>
		{@render children()}
	</div>
</div>
