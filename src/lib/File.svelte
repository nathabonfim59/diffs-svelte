<script lang="ts" generics="LAnnotation = undefined, Caret = undefined">
	import { untrack } from 'svelte';
	import {
		File as FileRenderer,
		VirtualizedFile,
		areOptionsEqual,
		getLineAnnotationName,
		type FileContents,
		type FileEditCompleteEvent,
		type LineAnnotation
	} from '@pierre/diffs';
	import { getEditorFactory, getVirtualizer, getWorkerPool } from './context.js';
	import {
		GUTTER_UTILITY_STYLE,
		areFileTargetsEqual,
		mergeOptions,
		shadowTemplate
	} from './internal/options.js';
	import type { FileProps } from './types.js';

	let {
		file,
		options,
		lineAnnotations,
		selectedLines,
		prerenderedHTML,
		disableWorkerPool = false,
		metrics,
		edit = false,
		editorOptions,
		editStateKey,
		onEditChange,
		onEditComplete,
		class: className,
		style,
		annotation,
		header,
		headerPrefix,
		headerFilenameSuffix,
		headerMetadata,
		gutterUtility,
		instance = $bindable()
	}: FileProps<LAnnotation, Caret> = $props();

	const workerPool = getWorkerPool();
	const virtualizer = getVirtualizer();
	const createEditor = getEditorFactory<LAnnotation, Caret>();
	let renderer = $state.raw<FileRenderer<LAnnotation, Caret>>();
	let disposeEditor: (() => void) | undefined;

	// After an accepted edit, keep showing the edited file until the parent
	// passes something other than the value it had before the edit.
	let accepted:
		| {
				file: { installed: FileContents; stale: FileContents } | null;
				annotations: {
					installed: LineAnnotation<LAnnotation>[] | undefined;
					stale: LineAnnotation<LAnnotation>[];
				} | null;
		  }
		| undefined;

	// Stable wrappers, so a new callback prop doesn't count as an options change.
	const emitEditChange: typeof onEditChange = (event) => onEditChange?.(event);

	function handleEditComplete(event: FileEditCompleteEvent<LAnnotation, Caret>) {
		const decision = onEditComplete?.(event) ?? 'reject';
		if (decision === 'accept') {
			accepted = {
				file: { installed: event.file, stale: event.originalFile },
				annotations: { installed: event.lineAnnotations, stale: event.originalLineAnnotations }
			};
		}
		return decision;
	}

	function resolveAccepted() {
		if (accepted == null) return { file, lineAnnotations };
		let resolvedFile = file;
		if (accepted.file != null) {
			if (areFileTargetsEqual(file, accepted.file.stale)) resolvedFile = accepted.file.installed;
			else accepted.file = null;
		}
		let resolvedAnnotations = lineAnnotations;
		if (accepted.annotations != null) {
			if (lineAnnotations === accepted.annotations.stale) {
				resolvedAnnotations = accepted.annotations.installed;
			} else accepted.annotations = null;
		}
		if (accepted.file == null && accepted.annotations == null) accepted = undefined;
		return { file: resolvedFile, lineAnnotations: resolvedAnnotations };
	}

	const mergedOptions = $derived(
		mergeOptions(options, {
			controlledSelection: selectedLines !== undefined,
			hasCustomHeader: header != null,
			hasGutterUtility: gutterUtility != null,
			owned: {
				onEditChange: onEditChange != null ? emitEditChange : undefined,
				onEditComplete: onEditComplete != null ? handleEditComplete : undefined
			}
		})
	);

	function attachEditor(r: FileRenderer<LAnnotation, Caret>) {
		if (createEditor == null) throw new Error('File: edit needs an <EditProvider> above it');
		const editor = createEditor('file', editorOptions ?? {}, editStateKey);
		try {
			disposeEditor = editor.edit(r);
		} catch (error) {
			editor.cleanUp();
			throw error;
		}
	}

	function mount(fileContainer: HTMLElement) {
		const r = untrack(() => {
			const pool = disableWorkerPool ? undefined : workerPool;
			const r =
				virtualizer != null
					? new VirtualizedFile<LAnnotation, Caret>(mergedOptions, virtualizer, metrics, pool, true)
					: new FileRenderer<LAnnotation, Caret>(mergedOptions, pool, true);
			if (edit) attachEditor(r);
			r.hydrate({ file, fileContainer, lineAnnotations, prerenderedHTML });
			return r;
		});
		renderer = r;
		return () => {
			r.cleanUp();
			disposeEditor = undefined;
			renderer = undefined;
		};
	}

	$effect(() => {
		instance = renderer;
	});

	$effect(() => {
		if (renderer == null) return;
		const forceRender =
			mergedOptions !== undefined && !areOptionsEqual(renderer.options, mergedOptions);
		renderer.setOptions(mergedOptions);
		if (!edit && disposeEditor != null) {
			const dispose = disposeEditor;
			disposeEditor = undefined;
			untrack(dispose);
		}
		const resolved = resolveAccepted();
		renderer.render({ ...resolved, forceRender });
		if (selectedLines !== undefined) renderer.setSelectedLines(selectedLines);
		if (edit && disposeEditor == null) {
			const r = renderer;
			untrack(() => attachEditor(r));
		}
	});

	const getHoveredLine = () => renderer?.getHoveredLine();
	const slotName = (item: LineAnnotation<LAnnotation>) =>
		renderer?.getAnnotationSlotName(item) ?? getLineAnnotationName(item);
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
			<div slot={slotName(item)}>{@render annotation(item)}</div>
		{/each}
	{/if}
	{#if gutterUtility}
		<div slot="gutter-utility-slot" style={GUTTER_UTILITY_STYLE}>
			{@render gutterUtility(getHoveredLine)}
		</div>
	{/if}
</diffs-container>
