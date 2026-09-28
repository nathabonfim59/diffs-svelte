# Interaction recipes

## Comments with annotations and a gutter button

Hover a line, click `+`, and a draft comment row appears under that line.

```svelte
<script lang="ts">
  import { MultiFileDiff, type DiffLineAnnotation, type FileContents } from 'diffs-svelte';

  let { oldFile, newFile }: { oldFile: FileContents; newFile: FileContents } = $props();

  type Comment = { author: string; body: string; draft?: boolean };

  let comments = $state.raw<DiffLineAnnotation<Comment>[]>([]);

  function addDraft(side: 'additions' | 'deletions', lineNumber: number) {
    const metadata = { author: 'you', body: '', draft: true };
    comments = [...comments, { side, lineNumber, metadata }];
  }

  function save(target: DiffLineAnnotation<Comment>, body: string) {
    comments = comments.map((c) => (c === target ? { ...c, metadata: { author: 'you', body } } : c));
  }
</script>

<MultiFileDiff {oldFile} {newFile} lineAnnotations={comments}>
  {#snippet annotation(comment)}
    {#if comment.metadata.draft}
      <form
        onsubmit={(e) => {
          e.preventDefault();
          save(comment, new FormData(e.currentTarget).get('body') as string);
        }}
      >
        <textarea name="body"></textarea>
        <button>Comment</button>
      </form>
    {:else}
      <p><b>{comment.metadata.author}</b> {comment.metadata.body}</p>
    {/if}
  {/snippet}

  {#snippet gutterUtility(getHoveredLine)}
    <button
      onclick={() => {
        const line = getHoveredLine();
        if (line) addDraft(line.side, line.lineNumber);
      }}>+</button
    >
  {/snippet}
</MultiFileDiff>
```

Replace the array to update annotations. Mutating it in place does not
re-render, because `$state.raw` only tracks reassignment.

To focus a textarea inside an annotation, wait a frame and skip scrolling, or
the code column scrolls sideways:

```svelte
<textarea {@attach (el) => void requestAnimationFrame(() => el.focus({ preventScroll: true }))}></textarea>
```

## Header snippets

```svelte
<MultiFileDiff {oldFile} {newFile} options={{ collapsed }}>
  {#snippet headerPrefix()}
    <input type="checkbox" bind:checked={viewed} aria-label="Viewed" />
  {/snippet}

  {#snippet headerFilenameSuffix(fileDiff)}
    <span class="badge">{fileDiff.type}</span>
  {/snippet}

  {#snippet headerMetadata(fileDiff)}
    <button onclick={() => (collapsed = !collapsed)}>
      {collapsed ? 'Expand' : 'Collapse'}
    </button>
  {/snippet}
</MultiFileDiff>
```

`options.collapsed` hides the code and keeps the header. Use `header` instead
to replace the built-in header entirely.

## Controlled line selection

```svelte
<script lang="ts">
  import { MultiFileDiff, type SelectedLineRange } from 'diffs-svelte';

  let selectedLines = $state<SelectedLineRange | null>(null);
</script>

<MultiFileDiff
  {oldFile}
  {newFile}
  {selectedLines}
  options={{
    enableLineSelection: true,
    onLineSelected: (range) => (selectedLines = range)
  }}
/>

<button onclick={() => (selectedLines = { start: 8, end: 12, side: 'additions' })}>
  Select 8 to 12
</button>
```

## Renderer instance

Use `bind:instance` for renderer methods that have no prop.

```svelte
<script lang="ts">
  import type { FileDiff as FileDiffRenderer } from '@pierre/diffs';
  import { MultiFileDiff } from 'diffs-svelte';

  let instance = $state<FileDiffRenderer<undefined, undefined>>();
</script>

<MultiFileDiff {oldFile} {newFile} bind:instance />
<button onclick={() => instance?.setSelectedLines({ start: 3, end: 3, side: 'additions' })}>
  Jump to line 3
</button>
```
