---
name: diffs-svelte
description:
  Use when a Svelte 5 or SvelteKit app renders code diffs, patches, or
  syntax-highlighted files with diffs-svelte, the Svelte components for
  @pierre/diffs. Covers MultiFileDiff, PatchDiff, FileDiff, File, snippets for
  annotations, gutter controls, and headers, line selection, options, worker
  pools, and server rendering.
---

# diffs-svelte

`diffs-svelte` is a set of Svelte 5 components for `@pierre/diffs`. The
components drive the vanilla `@pierre/diffs` renderers. There is no React in
the bundle.

Docs with live examples: https://nathabonfim59.github.io/diffs-svelte/

## Install

```bash
pnpm add diffs-svelte @pierre/diffs
```

`@pierre/diffs` is a peer dependency. The components need Svelte 5.29 or
later.

## Pick a component

| Component       | Input                                  | Use it when                                        |
| --------------- | -------------------------------------- | -------------------------------------------------- |
| `MultiFileDiff` | `oldFile`, `newFile` (`FileContents`)  | You have both versions of a file.                  |
| `PatchDiff`     | `patch` (string, exactly one file)     | You have unified diff text for one file.           |
| `FileDiff`      | `fileDiff` (`FileDiffMetadata`)        | You parsed the diff yourself, or a patch has many files. |
| `File`          | `file` (`FileContents`)                | You want highlighted code without a diff.          |

```svelte
<script lang="ts">
  import { MultiFileDiff } from 'diffs-svelte';

  const oldFile = { name: 'greeting.ts', contents: "export const greeting = 'hi';\n" };
  const newFile = { name: 'greeting.ts', contents: "export const greeting = 'hello';\n" };
</script>

<MultiFileDiff
  {oldFile}
  {newFile}
  options={{ theme: { dark: 'pierre-dark', light: 'pierre-light' } }}
/>
```

## Rules

- Import components and common types from `diffs-svelte`. Import parsing
  helpers (`parseDiffFromFile`, `parsePatchFiles`, `getSingularPatch`) from
  `@pierre/diffs`, server helpers from `@pierre/diffs/ssr`, and the worker from
  `@pierre/diffs/worker`.
- Never import from `@pierre/diffs/react` in a Svelte app.
- React render props are snippets. Drop the `render` prefix:
  `renderAnnotation` becomes `annotation`, `renderHeaderMetadata` becomes
  `headerMetadata`, `renderGutterUtility` becomes `gutterUtility`, and
  `renderCustomHeader` becomes `header`.
- Declare snippets as children of the component tag. Their arguments are typed
  from the component generics, so annotation metadata needs no annotation.
- `class` and `style` (a string) apply to the `<diffs-container>` element.
- `options` needs no memoization. The component compares it by value and
  re-renders only when a value changes.
- Keep large inputs (`fileDiff`, `lineAnnotations`) in `$state.raw`, not
  `$state`, so the renderer does not read through deep proxies.
- Passing `selectedLines` makes selection controlled. Write changes back from
  `options.onLineSelected`. Leave the prop undefined for uncontrolled selection.
- Passing a `gutterUtility` snippet turns on `options.enableGutterUtility`
  unless it is set to `false`.
- The code renders in a shadow root, so page CSS does not reach it. Set
  `--diffs-font-family`, `--diffs-font-size`, `--diffs-line-height`, or
  `--diffs-header-font-family` on a parent, or use `options.unsafeCSS`. Snippet
  output stays in the light DOM, so normal component styles apply to it.
- Edit mode, `Virtualizer`, `CodeView`, and `UnresolvedFile` have no Svelte
  component yet. Use their vanilla classes from `@pierre/diffs` with an element
  from `bind:this`.

## References

| Topic                                                  | File                                             |
| ------------------------------------------------------ | ------------------------------------------------ |
| Props, snippets, and types for every component         | [Components](references/components.md)           |
| Annotations, gutter, headers, selection, instance      | [Interaction recipes](references/recipes.md)     |
| Themes, options, worker pool, SvelteKit server render  | [Setup recipes](references/setup.md)             |

For every option `@pierre/diffs` accepts, install the upstream skill:

```bash
npx skills add pierrecomputer/pierre --skill diffs
```
