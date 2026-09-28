# diffs-svelte

Svelte 5 components for [`@pierre/diffs`](https://diffs.com). The components drive the vanilla
`@pierre/diffs` renderers directly, so your bundle contains no React.

Docs and live examples: https://nathabonfim59.github.io/diffs-svelte/

```sh
pnpm add diffs-svelte @pierre/diffs
```

```svelte
<script lang="ts">
  import { MultiFileDiff } from 'diffs-svelte';

  const oldFile = { name: 'greeting.ts', contents: "export const greeting = 'hi';\n" };
  const newFile = { name: 'greeting.ts', contents: "export const greeting = 'hello';\n" };
</script>

<MultiFileDiff {oldFile} {newFile} options={{ theme: { dark: 'pierre-dark', light: 'pierre-light' } }} />
```

The package has `MultiFileDiff`, `PatchDiff`, `FileDiff`, `File`, and `WorkerPoolProvider`. The
React render props (`renderAnnotation`, `renderHeaderMetadata`, ...) are snippets here
(`annotation`, `headerMetadata`, ...). The docs cover props, snippets, options, server rendering,
and the worker pool.

Edit mode, `Virtualizer`, `CodeView`, and `UnresolvedFile` have no components yet.

## Development

The library lives in `src/lib` and is the only part published to npm. `src/routes` and `src/docs`
hold the docs site, which uses the library through `$lib`.

```sh
pnpm dev          # docs site at http://localhost:5173
pnpm check        # svelte-check
pnpm build        # package the library into dist/
pnpm build:docs   # static docs site into build/
```

`.github/workflows/docs.yml` deploys the docs to GitHub Pages on every push to `main`. In the
repository settings, set Pages to deploy from GitHub Actions.

diffs-svelte is a community package and is not affiliated with The Pierre Computer Company.
