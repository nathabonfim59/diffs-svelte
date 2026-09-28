<script lang="ts" generics="LAnnotation = undefined, Caret = undefined">
	import { untrack } from 'svelte';
	import {
		FileDiff as FileDiffRenderer,
		VirtualizedFileDiff,
		areDiffTargetsEqual,
		areOptionsEqual,
		getLineAnnotationName,
		type DiffLineAnnotation,
		type FileDiffEditCompleteEvent,
		type FileDiffMetadata
	} from '@pierre/diffs';
	import { getEditorFactory, getVirtualizer, getWorkerPool } from './context.js';
	import { GUTTER_UTILITY_STYLE, mergeOptions, shadowTemplate } from './internal/options.js';
	import type { FileDiffProps } from './types.js';

	let {
		fileDiff,
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
	}: FileDiffProps<LAnnotation, Caret> = $props();

	const workerPool = getWorkerPool();
	const virtualizer = getVirtualizer();
	const createEditor = getEditorFactory<LAnnotation, Caret>();
	let renderer = $state.raw<FileDiffRenderer<LAnnotation, Caret>>();
	let disposeEditor: (() => void) | undefined;
	let pendingAttach: Promise<void> | undefined;
	let attachError = $state.raw<unknown>();

	// After an accepted edit, keep showing the edited diff until the parent
	// passes something other than the value it had before the edit.
	let accepted:
		| {
				fileDiff: { installed: FileDiffMetadata; stale: FileDiffMetadata } | null;
				annotations: {
					installed: DiffLineAnnotation<LAnnotation>[] | undefined;
					stale: DiffLineAnnotation<LAnnotation>[];
				} | null;
		  }
		| undefined;

	// Stable wrappers, so a new callback prop doesn't count as an options change.
	const emitEditChange: typeof onEditChange = (event) => onEditChange?.(event);

	function handleEditComplete(event: FileDiffEditCompleteEvent<LAnnotation, Caret>) {
		const decision = onEditComplete?.(event) ?? 'reject';
		if (decision === 'accept') {
			accepted = {
				fileDiff: { installed: event.fileDiff, stale: event.originalFileDiff },
				annotations: { installed: event.lineAnnotations, stale: event.originalLineAnnotations }
			};
		}
		return decision;
	}

	function resolveAccepted() {
		if (accepted == null) return { fileDiff, lineAnnotations };
		let resolvedDiff = fileDiff;
		if (accepted.fileDiff != null) {
			if (areDiffTargetsEqual(fileDiff, accepted.fileDiff.stale)) {
				resolvedDiff = accepted.fileDiff.installed;
			} else accepted.fileDiff = null;
		}
		let resolvedAnnotations = lineAnnotations;
		if (accepted.annotations != null) {
			if (lineAnnotations === accepted.annotations.stale) {
				resolvedAnnotations = accepted.annotations.installed;
			} else accepted.annotations = null;
		}
		if (accepted.fileDiff == null && accepted.annotations == null) accepted = undefined;
		return { fileDiff: resolvedDiff, lineAnnotations: resolvedAnnotations };
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

	function attachEditor(r: FileDiffRenderer<LAnnotation, Caret>) {
		if (renderer !== r || disposeEditor != null || !r.__canAttachEditor()) return;
		if (createEditor == null) throw new Error('FileDiff: edit needs an <EditProvider> above it');
		const editor = createEditor('file-diff', editorOptions ?? {}, editStateKey);
		try {
			disposeEditor = editor.edit(r);
		} catch (error) {
			editor.cleanUp();
			throw error;
		}
	}

	// A partial diff has to load its files before an editor can attach.
	function startEditing(r: FileDiffRenderer<LAnnotation, Caret>) {
		if (r.__canAttachEditor()) {
			pendingAttach = undefined;
			attachEditor(r);
			return;
		}
		const promise = r.__prepareForEditing();
		if (promise == null || promise === pendingAttach) {
			if (promise == null) pendingAttach = undefined;
			return;
		}
		pendingAttach = promise;
		promise
			.then(() => {
				if (pendingAttach !== promise) return;
				pendingAttach = undefined;
				attachEditor(r);
			})
			.catch((error: unknown) => {
				if (pendingAttach !== promise) return;
				pendingAttach = undefined;
				attachError = error;
			});
	}

	function mount(fileContainer: HTMLElement) {
		const r = untrack(() => {
			const pool = disableWorkerPool ? undefined : workerPool;
			const r =
				virtualizer != null
					? new VirtualizedFileDiff<LAnnotation, Caret>(
							mergedOptions,
							virtualizer,
							metrics,
							pool,
							true
						)
					: new FileDiffRenderer<LAnnotation, Caret>(mergedOptions, pool, true);
			r.hydrate({ fileDiff, fileContainer, lineAnnotations, prerenderedHTML });
			return r;
		});
		renderer = r;
		return () => {
			pendingAttach = undefined;
			r.cleanUp();
			disposeEditor = undefined;
			renderer = undefined;
		};
	}

	$effect(() => {
		instance = renderer;
	});

	$effect(() => {
		if (attachError != null) throw attachError;
	});

	$effect(() => {
		if (renderer == null) return;
		const forceRender =
			mergedOptions !== undefined && !areOptionsEqual(renderer.options, mergedOptions);
		renderer.setOptions(mergedOptions);
		if (!edit) {
			pendingAttach = undefined;
			if (disposeEditor != null) {
				const dispose = disposeEditor;
				disposeEditor = undefined;
				untrack(dispose);
			}
		}
		const resolved = resolveAccepted();
		renderer.render({ ...resolved, forceRender });
		if (selectedLines !== undefined) renderer.setSelectedLines(selectedLines);
		if (edit && disposeEditor == null) {
			const r = renderer;
			untrack(() => startEditing(r));
		}
	});

	const getHoveredLine = () => renderer?.getHoveredLine();
	const slotName = (item: DiffLineAnnotation<LAnnotation>) =>
		renderer?.getAnnotationSlotName(item) ?? getLineAnnotationName(item);
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
			<div slot={slotName(item)}>{@render annotation(item)}</div>
		{/each}
	{/if}
	{#if gutterUtility}
		<div slot="gutter-utility-slot" style={GUTTER_UTILITY_STYLE}>
			{@render gutterUtility(getHoveredLine)}
		</div>
	{/if}
</diffs-container>
