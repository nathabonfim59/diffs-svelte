<script lang="ts" generics="LAnnotation = undefined">
	import { untrack } from 'svelte';
	import { File as FileRenderer, areOptionsEqual, getLineAnnotationName } from '@pierre/diffs';
	import { getWorkerPool } from './context.js';
	import { GUTTER_UTILITY_STYLE, mergeOptions, shadowTemplate } from './internal/options.js';
	import type { FileProps } from './types.js';

	let {
		file,
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
	}: FileProps<LAnnotation> = $props();

	const workerPool = getWorkerPool();
	let renderer = $state.raw<FileRenderer<LAnnotation, undefined>>();

	const mergedOptions = $derived(
		mergeOptions(options, {
			controlledSelection: selectedLines !== undefined,
			hasCustomHeader: header != null,
			hasGutterUtility: gutterUtility != null
		})
	);

	function mount(fileContainer: HTMLElement) {
		const r = untrack(() => {
			const r = new FileRenderer<LAnnotation, undefined>(
				mergedOptions,
				disableWorkerPool ? undefined : workerPool,
				true
			);
			r.hydrate({ file, fileContainer, lineAnnotations, prerenderedHTML });
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
		renderer.render({ file, lineAnnotations, forceRender });
		if (selectedLines !== undefined) renderer.setSelectedLines(selectedLines);
	});

	const getHoveredLine = () => renderer?.getHoveredLine();
</script>

<diffs-container {@attach mount} class={className} {style}>
	{@html shadowTemplate(prerenderedHTML)}
	{#if header}
		<div slot="header-custom">{@render header(file)}</div>
	{:else}
		{#if headerPrefix}
			<div slot="header-prefix">{@render headerPrefix(file)}</div>
		{/if}
		{#if headerFilenameSuffix}
			<div slot="header-filename-suffix">{@render headerFilenameSuffix(file)}</div>
		{/if}
		{#if headerMetadata}
			<div slot="header-metadata">{@render headerMetadata(file)}</div>
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
