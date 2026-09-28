# Components

All components render a `<diffs-container>` custom element with a shadow
root. They share these props.

## Shared props

| Prop                | Type                                         | Notes                                                                 |
| ------------------- | -------------------------------------------- | --------------------------------------------------------------------- |
| `options`           | `FileDiffOptions` (diffs), `FileOptions` (File) | Passed to the vanilla renderer. Compared by value on change.       |
| `lineAnnotations`   | `DiffLineAnnotation<T>[]` (diffs), `LineAnnotation<T>[]` (File) | Rendered by the `annotation` snippet.         |
| `selectedLines`     | `SelectedLineRange \| null`                  | Controlled selection. Leave undefined for uncontrolled.              |
| `prerenderedHTML`   | `string`                                     | HTML from `@pierre/diffs/ssr`. Hydrated instead of re-rendered.      |
| `disableWorkerPool` | `boolean`                                    | Highlight on the main thread even inside `WorkerPoolProvider`.       |
| `class`             | `string`                                     | Applied to `<diffs-container>`.                                       |
| `style`             | `string`                                     | Applied to `<diffs-container>`.                                       |
| `bind:instance`     | `FileDiff` or `File` from `@pierre/diffs`    | The vanilla renderer. `undefined` before mount and after unmount.    |

## Snippets

| Snippet                | Arguments                                   | Renders                                          |
| ---------------------- | ------------------------------------------- | ------------------------------------------------ |
| `annotation`           | one `DiffLineAnnotation<T>` or `LineAnnotation<T>` | A row under the annotated line.           |
| `gutterUtility`        | `getHoveredLine`                            | A control beside the hovered line.               |
| `header`               | `fileDiff` (diffs) or `file` (File)         | A replacement for the whole header.              |
| `headerPrefix`         | same as `header`                            | Content before the file name.                    |
| `headerFilenameSuffix` | same as `header`                            | Content right after the file name.               |
| `headerMetadata`       | same as `header`                            | Content after the change counts.                 |

`getHoveredLine()` returns `{ lineNumber, side }` in diff components and
`{ lineNumber }` in `File`, or `undefined` when no line is hovered.

## Component inputs

```ts
// MultiFileDiff
oldFile: FileContents | null; // null for a new file
newFile: FileContents;

// PatchDiff: unified diff text containing exactly one file
patch: string;

// FileDiff
fileDiff: FileDiffMetadata;

// File
file: FileContents;
```

`MultiFileDiff` recomputes the diff with `parseDiffFromFile` whenever either
file changes. It passes `options.parseDiffOptions` through.

## Core types

```ts
interface FileContents {
  name: string; // header label, also picks the highlighting language
  contents: string;
  lang?: SupportedLanguages; // override the inferred language
  cacheKey?: string; // enables worker pool caching
}

type DiffLineAnnotation<T> = {
  side: 'deletions' | 'additions';
  lineNumber: number; // 0 places it above the first hunk
  metadata: T;
};

type LineAnnotation<T> = { lineNumber: number; metadata: T };

interface SelectedLineRange {
  start: number;
  end: number;
  side?: 'deletions' | 'additions';
  endSide?: 'deletions' | 'additions';
}
```

`FileDiffMetadata` has `name`, `prevName`, `type` (`'change'`,
`'rename-pure'`, `'rename-changed'`, `'new'`, `'deleted'`), and `hunks`.

## Parsing many files

```svelte
<script lang="ts">
  import { parsePatchFiles } from '@pierre/diffs';
  import { FileDiff } from 'diffs-svelte';

  let { patch }: { patch: string } = $props();

  const files = $derived(parsePatchFiles(patch).flatMap((p) => p.files));
</script>

{#each files as fileDiff (fileDiff.name)}
  <FileDiff {fileDiff} />
{/each}
```
