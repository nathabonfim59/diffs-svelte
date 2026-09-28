import type { Snippet } from 'svelte';
import type {
	CodeView as CodeViewRenderer,
	CodeViewItem,
	CodeViewItemEditCompleteHandler,
	CodeViewLineSelection,
	CodeViewOptions,
	DiffFileInput,
	DiffLineAnnotation,
	FileContents,
	FileDiffEditChangeHandler,
	FileDiffEditCompleteHandler,
	FileDiffMetadata,
	FileDiffOptions as CoreFileDiffOptions,
	FileEditChangeHandler,
	FileEditCompleteHandler,
	FileOptions as CoreFileOptions,
	GetHoveredLineResult,
	HunkSeparators,
	LineAnnotation,
	MergeConflictActionPayload,
	MergeConflictResolution,
	RenderMergeConflictActions,
	SelectedLineRange,
	UnresolvedFile as UnresolvedFileRenderer,
	UnresolvedFileOptions as CoreUnresolvedFileOptions,
	VirtualFileMetrics,
	File as FileRenderer,
	FileDiff as FileDiffRenderer
} from '@pierre/diffs';
import type { EditorChangeEvent, EditorOptions, EditorType } from '@pierre/diffs/edit';

/** The component owns these callbacks and exposes them as props instead. */
type OwnedEditCallbacks = 'onEditChange' | 'onEditComplete';

export type FileDiffOptions<LAnnotation = undefined, Caret = undefined> = Omit<
	CoreFileDiffOptions<LAnnotation, Caret>,
	OwnedEditCallbacks
>;

export type FileOptions<LAnnotation = undefined, Caret = undefined> = Omit<
	CoreFileOptions<LAnnotation, Caret>,
	OwnedEditCallbacks
>;

interface CommonProps {
	selectedLines?: SelectedLineRange | null;
	/** HTML from `@pierre/diffs/ssr` preload helpers, hydrated on the client. */
	prerenderedHTML?: string;
	disableWorkerPool?: boolean;
	/** Size hints for the virtualized renderer. Used only inside `<Virtualizer>`. */
	metrics?: VirtualFileMetrics;
	class?: string;
	style?: string;
}

interface DiffSlotProps<LAnnotation> {
	lineAnnotations?: DiffLineAnnotation<LAnnotation>[];
	annotation?: Snippet<[DiffLineAnnotation<LAnnotation>]>;
	header?: Snippet<[FileDiffMetadata]>;
	headerPrefix?: Snippet<[FileDiffMetadata]>;
	headerFilenameSuffix?: Snippet<[FileDiffMetadata]>;
	headerMetadata?: Snippet<[FileDiffMetadata]>;
	gutterUtility?: Snippet<[() => GetHoveredLineResult<'diff'> | undefined]>;
}

export interface DiffBaseProps<LAnnotation = undefined, Caret = undefined>
	extends CommonProps,
		DiffSlotProps<LAnnotation> {
	options?: FileDiffOptions<LAnnotation, Caret>;
	/** Turn on an edit session. Needs an `<EditProvider>` above the component. */
	edit?: boolean;
	/** Options passed to the `<EditProvider>` factory when the session starts. */
	editorOptions?: EditorOptions<'file-diff', LAnnotation, Caret>;
	/** Keep this draft and its undo history in memory under this key. */
	editStateKey?: string;
	/**
	 * Fires on every document change while editing. You edit the new side of
	 * the diff. Don't feed the event back into the props.
	 */
	onEditChange?: FileDiffEditChangeHandler<LAnnotation, Caret>;
	/**
	 * Fires when `edit` turns off or the component unmounts. Return `'accept'`
	 * to keep the edited diff or `'reject'` to go back to the props.
	 */
	onEditComplete?: FileDiffEditCompleteHandler<LAnnotation, Caret>;
	/** Bindable: the underlying vanilla renderer, once mounted. */
	instance?: FileDiffRenderer<LAnnotation, Caret>;
}

export interface FileDiffProps<LAnnotation = undefined, Caret = undefined>
	extends DiffBaseProps<LAnnotation, Caret> {
	fileDiff: FileDiffMetadata;
}

export type MultiFileDiffProps<LAnnotation = undefined, Caret = undefined> = DiffBaseProps<
	LAnnotation,
	Caret
> &
	DiffFileInput;

export interface PatchDiffProps<LAnnotation = undefined, Caret = undefined>
	extends DiffBaseProps<LAnnotation, Caret> {
	/** A unified patch containing exactly one file. */
	patch: string;
}

export interface FileProps<LAnnotation = undefined, Caret = undefined> extends CommonProps {
	file: FileContents;
	options?: FileOptions<LAnnotation, Caret>;
	/** Turn on an edit session. Needs an `<EditProvider>` above the component. */
	edit?: boolean;
	/** Options passed to the `<EditProvider>` factory when the session starts. */
	editorOptions?: EditorOptions<'file', LAnnotation, Caret>;
	/** Keep this draft and its undo history in memory under this key. */
	editStateKey?: string;
	/** Fires on every document change while editing. Don't feed it back into `file`. */
	onEditChange?: FileEditChangeHandler<LAnnotation, Caret>;
	/**
	 * Fires when `edit` turns off or the component unmounts. Return `'accept'`
	 * to keep the edited file or `'reject'` to go back to `file`.
	 */
	onEditComplete?: FileEditCompleteHandler<LAnnotation, Caret>;
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

/** One conflict block, as passed to the `mergeConflictAction` snippet. */
export type MergeConflictDiffAction = Parameters<RenderMergeConflictActions<undefined>>[0];

export interface UnresolvedFileOptions<LAnnotation = undefined>
	extends Omit<CoreUnresolvedFileOptions<LAnnotation>, 'onMergeConflictAction' | 'hunkSeparators'> {
	hunkSeparators?: HunkSeparators;
}

export interface UnresolvedFileProps<LAnnotation = undefined>
	extends Omit<CommonProps, 'metrics'>,
		DiffSlotProps<LAnnotation> {
	/** A file that contains `<<<<<<<`, `=======`, and `>>>>>>>` conflict markers. */
	file: FileContents;
	options?: UnresolvedFileOptions<LAnnotation>;
	/**
	 * Replaces the built-in accept buttons for each conflict. Call `resolve`
	 * with `'current'`, `'incoming'`, or `'both'`.
	 */
	mergeConflictAction?: Snippet<
		[MergeConflictDiffAction, (resolution: MergeConflictResolution) => void]
	>;
	/** Fires after a conflict is resolved, with the file as it is now. */
	onResolve?(file: FileContents, payload: MergeConflictActionPayload): void;
	/** Bindable: the underlying vanilla renderer, once mounted. */
	instance?: UnresolvedFileRenderer<LAnnotation>;
}

export type CodeViewGutterUtilityGetter =
	| (() => GetHoveredLineResult<'file'> | undefined)
	| (() => GetHoveredLineResult<'diff'> | undefined);

export type CodeViewComponentOptions<LAnnotation = undefined, Caret = undefined> = Omit<
	CodeViewOptions<LAnnotation, Caret>,
	| 'controlledSelection'
	| 'createEditor'
	| 'onSelectedLinesChange'
	| 'getEditStateKey'
	| 'onItemEditChange'
	| 'onItemEditComplete'
>;

export interface CodeViewProps<LAnnotation = undefined, Caret = undefined> {
	/**
	 * Controlled items. CodeView re-renders an item when its object or
	 * `version` changes. Leave this out and use `initialItems` plus the
	 * exported methods to manage items yourself.
	 */
	items?: readonly CodeViewItem<LAnnotation>[];
	/** Items for uncontrolled mode, read once on mount. */
	initialItems?: readonly CodeViewItem<LAnnotation>[];
	options?: CodeViewComponentOptions<LAnnotation, Caret>;
	/** Options passed to the `<EditProvider>` factory for items with `edit: true`. */
	editorOptions?: Omit<EditorOptions<EditorType, LAnnotation, Caret>, 'onChange'>;
	/** Key under which an item's draft and undo history stay in memory. */
	getEditStateKey?(item: CodeViewItem<LAnnotation>): string | undefined;
	disableWorkerPool?: boolean;
	selectedLines?: CodeViewLineSelection | null;
	onSelectedLinesChange?(selection: CodeViewLineSelection | null): void;
	onScroll?(scrollTop: number, viewer: CodeViewRenderer<LAnnotation, Caret>): void;
	/** Fires on every document change of an item being edited. */
	onItemEditChange?(
		event: EditorChangeEvent<EditorType, LAnnotation, Caret>,
		item: CodeViewItem<LAnnotation>
	): void;
	/**
	 * Fires when an item's edit session ends. Return `'accept'` to install
	 * `nextItem` or `'reject'` to revert. In controlled mode, also put
	 * `nextItem` into your `items`.
	 */
	onItemEditComplete?: CodeViewItemEditCompleteHandler<LAnnotation, Caret>;
	/** Content at the top of the scroll area, before the first item. */
	codeViewHeader?: Snippet;
	/** Content at the bottom of the scroll area, after the last item. */
	codeViewFooter?: Snippet;
	header?: Snippet<[CodeViewItem<LAnnotation>]>;
	headerPrefix?: Snippet<[CodeViewItem<LAnnotation>]>;
	headerFilenameSuffix?: Snippet<[CodeViewItem<LAnnotation>]>;
	headerMetadata?: Snippet<[CodeViewItem<LAnnotation>]>;
	annotation?: Snippet<
		[LineAnnotation<LAnnotation> | DiffLineAnnotation<LAnnotation>, CodeViewItem<LAnnotation>]
	>;
	gutterUtility?: Snippet<[CodeViewGutterUtilityGetter, CodeViewItem<LAnnotation>]>;
	class?: string;
	style?: string;
	/** Bindable: the scroll container element. */
	container?: HTMLDivElement;
	/** Bindable: the underlying vanilla `CodeView`, once mounted. */
	instance?: CodeViewRenderer<LAnnotation, Caret>;
}
