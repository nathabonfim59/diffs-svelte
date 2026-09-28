# Advanced components

## Edit mode

`File`, `FileDiff`, `MultiFileDiff`, and `PatchDiff` become editable when
`edit` is true. They need an `EditProvider` above them. Without one, setting
`edit` throws.

```svelte
<script lang="ts">
  import { EditProvider, File, type FileContents } from 'diffs-svelte';

  let file = $state<FileContents>({ name: 'notes.ts', contents: 'const a = 1;\n' });
  let editing = $state(false);
</script>

<button onclick={() => (editing = !editing)}>{editing ? 'Save' : 'Edit'}</button>

<EditProvider>
  <File
    {file}
    edit={editing}
    onEditComplete={(event) => {
      file = event.file;
      return 'accept';
    }}
  />
</EditProvider>
```

| Prop             | Notes                                                                          |
| ---------------- | ------------------------------------------------------------------------------ |
| `edit`           | Starts the session when true. Turning it off completes the session.            |
| `onEditChange`   | Fires on every change. Don't write its value back into the props while editing. |
| `onEditComplete` | Return `'accept'` to keep the edit or `'reject'` to restore the props. Defaults to `'reject'`. |
| `editorOptions`  | `EditorOptions` from `@pierre/diffs/edit`, for example `historyMaxEntries` or `keymap`. |
| `editStateKey`   | Keeps the draft and undo history in memory across remounts.                   |

In a diff you edit the new side. The `FileDiffEditCompleteEvent` has the new
`fileDiff` plus `oldFile` and `newFile`. `EditProvider` takes an optional
`createEditor(type, options, key)` to share defaults. By default it calls
`new Editor(type, options, key)`.

## Virtualizer

Wrap a list of components in `Virtualizer` so each one renders only the lines
near the viewport. `Virtualizer` is the scroll container, so it needs a height
and `overflow: auto`.

```svelte
<Virtualizer style="height: 80vh; overflow: auto">
  {#each files as fileDiff (fileDiff.name)}
    <FileDiff {fileDiff} />
  {/each}
</Virtualizer>
```

Props: `config` (read once), `class`, `style`, `contentClass`,
`contentStyle`, and `bind:instance`. Components inside accept a `metrics`
prop with size hints.

## CodeView

One virtualized view for many files and diffs. It scales to thousands of items
and supports `stickyHeaders`, collapsing, and scrolling to a line.

```svelte
<script lang="ts">
  import { CodeView, type CodeViewItem } from 'diffs-svelte';

  let { items }: { items: CodeViewItem<undefined>[] } = $props();
  let viewer = $state<CodeView>();
</script>

<CodeView bind:this={viewer} {items} style="height: 80vh; overflow: auto">
  {#snippet headerMetadata(item)}<span>{item.id}</span>{/snippet}
</CodeView>

<button onclick={() => viewer?.scrollTo({ type: 'line', id: 'src/a.ts', lineNumber: 40 })}>
  Go
</button>
```

- An item is `{ id, type: 'diff', fileDiff }` or `{ id, type: 'file', file }`,
  with optional `annotations`, `collapsed`, `edit`, and `version`.
- CodeView re-renders an item when its object or `version` changes. Replace
  items rather than mutating them, and keep them in `$state.raw`.
- Pass `items` (controlled) or `initialItems` (uncontrolled), never both.
  `addItems`, `updateItem`, `updateItemId`, and `removeItem` work only with
  `initialItems`.
- Other methods on `bind:this`: `scrollTo`, `getItem`, `getEditor`,
  `setSelectedLines`, `getSelectedLines`, `clearSelectedLines`, `getInstance`.
- Snippets: `header`, `headerPrefix`, `headerFilenameSuffix`,
  `headerMetadata`, `annotation`, and `gutterUtility` get the item as their
  last argument. `codeViewHeader` and `codeViewFooter` render above and below
  the list.
- Selection is `{ id, range }`. Use `selectedLines` and
  `onSelectedLinesChange` to control it.
- Items with `edit: true` are editable when an `EditProvider` is above.
  `onItemEditComplete(event, item, nextItem)` returns `'accept'` or
  `'reject'`. In controlled mode, put `nextItem` into `items` on accept.

## Merge conflicts

`UnresolvedFile` shows a file with Git conflict markers as diffs between the
two sides, with buttons to resolve each conflict.

```svelte
<UnresolvedFile {file} onResolve={(resolved) => save(resolved)}>
  {#snippet mergeConflictAction(action, resolve)}
    <button onclick={() => resolve('current')}>Keep ours</button>
    <button onclick={() => resolve('incoming')}>Keep theirs</button>
    <button onclick={() => resolve('both')}>Keep both</button>
  {/snippet}
</UnresolvedFile>
```

- `onResolve(file, payload)` gets the full file after each resolution.
- Leave out `mergeConflictAction` for the built-in buttons, or set
  `options.mergeConflictActionsType` to `'none'` to hide them.
- A new `file` (by content or `cacheKey`) restarts from that file.
- It takes the same annotation, header, and gutter snippets as `FileDiff`, but
  has no edit mode.
