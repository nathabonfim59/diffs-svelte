import {
	UnresolvedFile,
	type FileContents,
	type FileDiffMetadata,
	type MergeConflictMarkerRow
} from '@pierre/diffs';
import type { MergeConflictDiffAction } from '../types.js';

export interface ConflictState {
	file: FileContents;
	fileDiff: FileDiffMetadata;
	actions: (MergeConflictDiffAction | undefined)[];
	markerRows: MergeConflictMarkerRow[];
}

/**
 * The core parses conflict markers in a helper it doesn't export. The
 * component parses on the first render and caches the result, so this
 * subclass reads that cache to seed the controlled state.
 */
export class ControlledUnresolvedFile<LAnnotation> extends UnresolvedFile<LAnnotation> {
	getConflictState(): ConflictState | undefined {
		const { file, fileDiff, actions, markerRows } = this.computedCache;
		if (file == null || fileDiff == null || actions == null || markerRows == null) return undefined;
		return { file, fileDiff, actions, markerRows };
	}
}

/** Same slot name the core gives the <slot> for a conflict's action row. */
export function mergeConflictSlotName(
	action: MergeConflictDiffAction,
	fileDiff: FileDiffMetadata
): string | undefined {
	const hunk = fileDiff.hunks[action.hunkIndex];
	if (hunk == null) return undefined;
	let lineIndex = hunk.unifiedLineStart;
	for (let index = 0; index < action.startContentIndex; index++) {
		const content = hunk.hunkContent[index];
		lineIndex += content.type === 'context' ? content.lines : content.deletions + content.additions;
	}
	return `merge-conflict-action-${action.hunkIndex}-${lineIndex}-${action.conflictIndex}`;
}
