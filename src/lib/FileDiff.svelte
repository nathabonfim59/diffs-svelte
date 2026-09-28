<script lang="ts" generics="LAnnotation = undefined">
	import { untrack } from 'svelte';
	import {
		FileDiff as FileDiffRenderer,
		areOptionsEqual,
		getLineAnnotationName
	} from '@pierre/diffs';
	import { getWorkerPool } from './context.js';
	import { GUTTER_UTILITY_STYLE, mergeOptions, shadowTemplate } from './internal/options.js';
	import type { FileDiffProps } from './types.js';

	let {
		fileDiff,
		options,
		lineAnnotations,
		selectedLines,
		prerenderedHTML,
		disableWorkerPool = false,
		class: className,
		style,
		annotation,
		header,
		headerPrefix,
		headerFilenameSuffix,
		headerMetadata,
		gutterUtility,
		instance = $bindable()
	}: FileDiffProps<LAnnotation> = $props();

	const workerPool = getWorkerPool();
	let renderer = $state.raw<FileDiffRenderer<LAnnotation, undefined>>();

	const mergedOptions = $derived(
		mergeOptions(options, {
			controlledSelection: selectedLines !== undefined,
			hasCustomHeader: header != null,
			hasGutterUtility: gutterUtility != null
		})
	);

	function mount(fileContainer: HTMLElement) {
		const r = untrack(() => {
			const r = new FileDiffRenderer<LAnnotation, undefined>(
				mergedOptions,
				disableWorkerPool ? undefined : workerPool,
				true
			);
			r.hydrate({ fileDiff, fileContainer, lineAnnotations, prerenderedHTML });
			return r;
		});
		renderer = r;
		return () => {
			r.cleanUp();
			renderer = undefined;
		};
	}

	$effect(() => {
		instance = renderer;
	});

	$effect(() => {
		if (renderer == null) return;
		const forceRender = mergedOptions !== undefined && !areOptionsEqual(renderer.options, mergedOptions);
		renderer.setOptions(mergedOptions);
		renderer.render({ fileDiff, lineAnnotations, forceRender });
		if (selectedLines !== undefined) renderer.setSelectedLines(selectedLines);
	});

	const getHoveredLine = () => renderer?.getHoveredLine();
</script>

<diffs-container {@attach mount} class={className} {style}>
	{@html shadowTemplate(prerenderedHTML)}
	{#if header}
		<div slot="header-custom">{@render header(fileDiff)}</div>
	{:else}
		{#if headerPrefix}
			<div slot="header-prefix">{@render headerPrefix(fileDiff)}</div>
		{/if}
		{#if headerFilenameSuffix}
			<div slot="header-filename-suffix">{@render headerFilenameSuffix(fileDiff)}</div>
		{/if}
		{#if headerMetadata}
			<div slot="header-metadata">{@render headerMetadata(fileDiff)}</div>
		{/if}
	{/if}
	{#if annotation && lineAnnotations}
		{#each lineAnnotations as item}
			<div slot={getLineAnnotationName(item)}>{@render annotation(item)}</div>
		{/each}
	{/if}
	{#if gutterUtility}
		<div slot="gutter-utility-slot" style={GUTTER_UTILITY_STYLE}>
			{@render gutterUtility(getHoveredLine)}
		</div>
	{/if}
</diffs-container>
