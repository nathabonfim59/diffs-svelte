import type { Snippet } from 'svelte';
import type {
	DiffFileInput,
	DiffLineAnnotation,
	FileContents,
	FileDiffMetadata,
	FileDiffOptions,
	FileOptions,
	GetHoveredLineResult,
	LineAnnotation,
	SelectedLineRange,
	File as FileRenderer,
	FileDiff as FileDiffRenderer
} from '@pierre/diffs';

// Edit mode (EditContext) is not bound yet, so the Caret generic is fixed.
type Caret = undefined;

interface CommonProps {
	selectedLines?: SelectedLineRange | null;
	/** HTML from `@pierre/diffs/ssr` preload helpers, hydrated on the client. */
	prerenderedHTML?: string;
	disableWorkerPool?: boolean;
	class?: string;
	style?: string;
}

export interface DiffBaseProps<LAnnotation = undefined> extends CommonProps {
	options?: FileDiffOptions<LAnnotation, Caret>;
	lineAnnotations?: DiffLineAnnotation<LAnnotation>[];
	annotation?: Snippet<[DiffLineAnnotation<LAnnotation>]>;
	header?: Snippet<[FileDiffMetadata]>;
	headerPrefix?: Snippet<[FileDiffMetadata]>;
	headerFilenameSuffix?: Snippet<[FileDiffMetadata]>;
	headerMetadata?: Snippet<[FileDiffMetadata]>;
	gutterUtility?: Snippet<[() => GetHoveredLineResult<'diff'> | undefined]>;
	/** Bindable: the underlying vanilla renderer, once mounted. */
	instance?: FileDiffRenderer<LAnnotation, Caret>;
}

export interface FileDiffProps<LAnnotation = undefined> extends DiffBaseProps<LAnnotation> {
	fileDiff: FileDiffMetadata;
}

export type MultiFileDiffProps<LAnnotation = undefined> = DiffBaseProps<LAnnotation> &
	DiffFileInput;

export interface PatchDiffProps<LAnnotation = undefined> extends DiffBaseProps<LAnnotation> {
	/** A unified patch containing exactly one file. */
	patch: string;
}

export interface FileProps<LAnnotation = undefined> extends CommonProps {
	file: FileContents;
	options?: FileOptions<LAnnotation, Caret>;
	lineAnnotations?: LineAnnotation<LAnnotation>[];
	annotation?: Snippet<[LineAnnotation<LAnnotation>]>;
	header?: Snippet<[FileContents]>;
	headerPrefix?: Snippet<[FileContents]>;
	headerFilenameSuffix?: Snippet<[FileContents]>;
	headerMetadata?: Snippet<[FileContents]>;
	gutterUtility?: Snippet<[() => GetHoveredLineResult<'file'> | undefined]>;
	/** Bindable: the underlying vanilla renderer, once mounted. */
	instance?: FileRenderer<LAnnotation, Caret>;
}
