export { default as FileDiff } from './FileDiff.svelte';
export { default as MultiFileDiff } from './MultiFileDiff.svelte';
export { default as PatchDiff } from './PatchDiff.svelte';
export { default as File } from './File.svelte';
export { default as WorkerPoolProvider } from './WorkerPoolProvider.svelte';
export { getWorkerPool, setWorkerPool } from './context.js';
export type {
	DiffBaseProps,
	FileDiffProps,
	MultiFileDiffProps,
	PatchDiffProps,
	FileProps
} from './types.js';
export type {
	DiffLineAnnotation,
	FileContents,
	FileDiffMetadata,
	FileDiffOptions,
	FileOptions,
	LineAnnotation,
	SelectedLineRange
} from '@pierre/diffs';
