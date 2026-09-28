export { default as FileDiff } from './FileDiff.svelte';
export { default as MultiFileDiff } from './MultiFileDiff.svelte';
export { default as PatchDiff } from './PatchDiff.svelte';
export { default as File } from './File.svelte';
export { default as UnresolvedFile } from './UnresolvedFile.svelte';
export { default as CodeView } from './CodeView.svelte';
export { default as Virtualizer } from './Virtualizer.svelte';
export { default as EditProvider } from './EditProvider.svelte';
export { default as WorkerPoolProvider } from './WorkerPoolProvider.svelte';
export {
	getEditorFactory,
	getVirtualizer,
	getWorkerPool,
	setEditorFactory,
	setVirtualizer,
	setWorkerPool
} from './context.js';
export type {
	DiffBaseProps,
	FileDiffProps,
	MultiFileDiffProps,
	PatchDiffProps,
	FileProps,
	FileOptions,
	FileDiffOptions,
	UnresolvedFileProps,
	UnresolvedFileOptions,
	MergeConflictDiffAction,
	CodeViewProps,
	CodeViewComponentOptions,
	CodeViewGutterUtilityGetter
} from './types.js';
export type {
	CodeViewDiffItem,
	CodeViewFileItem,
	CodeViewItem,
	CodeViewLineSelection,
	CodeViewScrollTarget,
	DiffLineAnnotation,
	FileContents,
	FileDiffEditCompleteEvent,
	FileDiffMetadata,
	FileEditCompleteEvent,
	LineAnnotation,
	MergeConflictActionPayload,
	MergeConflictResolution,
	SelectedLineRange,
	VirtualFileMetrics,
	VirtualizerConfig
} from '@pierre/diffs';
export type { EditorChangeEvent, EditorFactory, EditorOptions } from '@pierre/diffs/edit';
