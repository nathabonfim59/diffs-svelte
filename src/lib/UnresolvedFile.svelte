<script lang="ts" generics="LAnnotation = undefined">
	import { untrack } from 'svelte';
	import {
		areOptionsEqual,
		getLineAnnotationName,
		type FileContents,
		type MergeConflictActionPayload,
		type MergeConflictResolution,
		type UnresolvedFileOptions as CoreOptions
	} from '@pierre/diffs';
	import { getWorkerPool } from './context.js';
	import {
		GUTTER_UTILITY_STYLE,
		areFileTargetsEqual,
		mergeOptions,
		noopRender,
		shadowTemplate
	} from './internal/options.js';
	import {
		ControlledUnresolvedFile,
		mergeConflictSlotName,
		type ConflictState
	} from './internal/unresolved.js';
	import type { UnresolvedFileProps } from './types.js';

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
		mergeConflictAction,
		onResolve,
		instance = $bindable()
	}: UnresolvedFileProps<LAnnotation> = $props();

	const workerPool = getWorkerPool();
	let renderer = $state.raw<ControlledUnresolvedFile<LAnnotation>>();
	let conflict = $state.raw<ConflictState>();

	// The core parses `file` once per instance. A different file needs a new one.
	let fileVersion = 0;
	let parsedFile: FileContents | undefined;
	const fileKey = $derived.by(() => {
		if (parsedFile != null && !areFileTargetsEqual(file, parsedFile)) fileVersion++;
		parsedFile = file;
		return fileVersion;
	});

	function resolve(payload: MergeConflictActionPayload) {
		const r = renderer;
		if (r == null || conflict == null) return;
		const next = r.resolveConflict(payload.conflict.conflictIndex, payload.resolution, conflict.fileDiff);
		if (next == null) return;
		conflict = next;
		onResolve?.(next.file, payload);
		options?.onMergeConflictResolve?.(next.file, payload);
	}

	const mergedOptions = $derived.by(() => {
		// The component resolves conflicts itself and reports them through
		// `onResolve`; the core forbids both callbacks at once.
		const { onMergeConflictResolve: _, ...rest } = options ?? {};
		const merged = mergeOptions(rest, {
			controlledSelection: selectedLines !== undefined,
			hasCustomHeader: header != null,
			hasGutterUtility: gutterUtility != null
		});
		return {
			...merged,
			onMergeConflictAction: resolve,
			hunkSeparators: options?.hunkSeparators === 'custom' ? noopRender : options?.hunkSeparators,
			mergeConflictActionsType:
				mergeConflictAction != null ? noopRender : options?.mergeConflictActionsType
		} as CoreOptions<LAnnotation>;
	});

	function mount(fileContainer: HTMLElement) {
		const r = untrack(() => {
			const r = new ControlledUnresolvedFile<LAnnotation>(
				mergedOptions,
				disableWorkerPool ? undefined : workerPool,
				true
			);
			r.hydrate({ file, fileContainer, lineAnnotations, prerenderedHTML });
			return r;
		});
		conflict = r.getConflictState();
		renderer = r;
		return () => {
			r.cleanUp();
			renderer = undefined;
			conflict = undefined;
		};
	}

	$effect(() => {
		instance = renderer;
	});

	$effect(() => {
		if (renderer == null || conflict == null) return;
		const forceRender = !areOptionsEqual(renderer.options, mergedOptions);
		renderer.setOptions(mergedOptions);
		renderer.render({ ...conflict, lineAnnotations, forceRender });
		if (selectedLines !== undefined) renderer.setSelectedLines(selectedLines);
	});

	const shownDiff = $derived(conflict?.fileDiff);
	const getHoveredLine = () => renderer?.getHoveredLine();
	const resolver =
		(action: { conflict: MergeConflictActionPayload['conflict'] }) =>
		(resolution: MergeConflictResolution) =>
			resolve({ resolution, conflict: action.conflict });
</script>

{#key fileKey}
	<diffs-container {@attach mount} class={className} {style}>
		{@html shadowTemplate(prerenderedHTML)}
		{#if shownDiff}
			{#if header}
				<div slot="header-custom">{@render header(shownDiff)}</div>
			{:else}
				{#if headerPrefix}
					<div slot="header-prefix">{@render headerPrefix(shownDiff)}</div>
				{/if}
				{#if headerFilenameSuffix}
					<div slot="header-filename-suffix">{@render headerFilenameSuffix(shownDiff)}</div>
				{/if}
				{#if headerMetadata}
					<div slot="header-metadata">{@render headerMetadata(shownDiff)}</div>
				{/if}
			{/if}
		{/if}
		{#if annotation && lineAnnotations}
			{#each lineAnnotations as item}
				<div slot={getLineAnnotationName(item)}>{@render annotation(item)}</div>
			{/each}
		{/if}
		{#if mergeConflictAction && conflict}
			{#each conflict.actions as action}
				{#if action}
					{@const slot = mergeConflictSlotName(action, conflict.fileDiff)}
					{#if slot}
						<div {slot} style="display:contents">
							{@render mergeConflictAction(action, resolver(action))}
						</div>
					{/if}
				{/if}
			{/each}
		{/if}
		{#if gutterUtility}
			<div slot="gutter-utility-slot" style={GUTTER_UTILITY_STYLE}>
				{@render gutterUtility(getHoveredLine)}
			</div>
		{/if}
	</diffs-container>
{/key}
