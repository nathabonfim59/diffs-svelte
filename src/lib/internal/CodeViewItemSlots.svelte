<script lang="ts" module>
	import type { CodeViewProps } from '../types.js';

	export type ItemSnippets<LAnnotation, Caret> = Pick<
		CodeViewProps<LAnnotation, Caret>,
		| 'header'
		| 'headerPrefix'
		| 'headerFilenameSuffix'
		| 'headerMetadata'
		| 'annotation'
		| 'gutterUtility'
	>;
</script>

<script lang="ts" generics="LAnnotation, Caret">
	import type { CodeViewRenderedItem } from '@pierre/diffs';
	import { GUTTER_UTILITY_STYLE } from './options.js';

	interface Props {
		rendered: CodeViewRenderedItem<LAnnotation, Caret>;
		snippets: ItemSnippets<LAnnotation, Caret>;
	}

	// Mounted straight into the item's <diffs-container>, so every top-level
	// element here is a light-DOM child the shadow <slot>s can pick up.
	let { rendered, snippets }: Props = $props();

	const item = $derived(rendered.item);
	const annotations = $derived(rendered.item.annotations ?? []);

	// A spread, because Svelte only allows a literal slot attribute inside a
	// custom element and this component's parent is picked at mount time.
	const slot = (name: string) => ({ slot: name });
</script>

{#if snippets.header}
	<div {...slot('header-custom')}>{@render snippets.header(item)}</div>
{:else}
	{#if snippets.headerPrefix}
		<div {...slot('header-prefix')}>{@render snippets.headerPrefix(item)}</div>
	{/if}
	{#if snippets.headerFilenameSuffix}
		<div {...slot('header-filename-suffix')}>{@render snippets.headerFilenameSuffix(item)}</div>
	{/if}
	{#if snippets.headerMetadata}
		<div {...slot('header-metadata')}>{@render snippets.headerMetadata(item)}</div>
	{/if}
{/if}
{#if snippets.annotation}
	{#each annotations as annotation}
		<div {...slot(rendered.instance.getAnnotationSlotName(annotation))}>
			{@render snippets.annotation(annotation, item)}
		</div>
	{/each}
{/if}
{#if snippets.gutterUtility}
	<div {...slot('gutter-utility-slot')} style={GUTTER_UTILITY_STYLE}>
		{@render snippets.gutterUtility(rendered.instance.getHoveredLine, item)}
	</div>
{/if}
