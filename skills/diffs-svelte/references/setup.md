# Setup recipes

## Themes and display options

```svelte
<MultiFileDiff
  {oldFile}
  {newFile}
  options={{
    theme: { dark: 'pierre-dark', light: 'pierre-light' },
    themeType: 'system', // or 'dark' | 'light' to force one side
    diffStyle: 'split', // or 'unified'
    diffIndicators: 'bars', // 'classic' | 'none'
    lineDiffType: 'word-alt', // 'word-line' | 'word' | 'char' | 'none'
    hunkSeparators: 'line-info', // 'line-info-basic' | 'metadata' | 'simple'
    overflow: 'scroll', // or 'wrap'
    disableLineNumbers: false,
    disableBackground: false,
    expandUnchanged: false
  }}
/>
```

`theme` takes any Shiki theme name, or a `{ dark, light }` pair. To follow an
app-level theme toggle, pass `themeType` from your own state.

## Worker pool

Move highlighting off the main thread. Providers share one pool, and the last
provider to unmount terminates it.

```svelte
<!-- +layout.svelte -->
<script lang="ts">
  import { WorkerPoolProvider } from 'diffs-svelte';
  import DiffsWorker from '@pierre/diffs/worker/worker.js?worker';

  let { children } = $props();
</script>

<WorkerPoolProvider
  poolOptions={{ workerFactory: () => new DiffsWorker(), poolSize: 4 }}
  highlighterOptions={{ theme: { dark: 'pierre-dark', light: 'pierre-light' } }}
>
  {@render children()}
</WorkerPoolProvider>
```

The `?worker` suffix is Vite syntax. The provider reads its props once, when
it is created. Pass `disableWorkerPool` to keep a single component on the main
thread. Code outside components can read the pool with `getWorkerPool()`.

## Server rendering in SvelteKit

Without `prerenderedHTML`, the server outputs an empty container and the
browser renders the code. To ship highlighted HTML, preload it in `load`:

```ts
// +page.server.ts
import { preloadMultiFileDiff } from '@pierre/diffs/ssr';

export async function load() {
  const oldFile = { name: 'a.ts', contents: 'const a = 1;\n' };
  const newFile = { name: 'a.ts', contents: 'const a = 2;\n' };
  const options = { theme: { dark: 'pierre-dark', light: 'pierre-light' } } as const;

  const { prerenderedHTML } = await preloadMultiFileDiff({ oldFile, newFile, options });
  return { oldFile, newFile, options, prerenderedHTML };
}
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { MultiFileDiff } from 'diffs-svelte';

  let { data } = $props();
</script>

<MultiFileDiff
  oldFile={data.oldFile}
  newFile={data.newFile}
  options={data.options}
  prerenderedHTML={data.prerenderedHTML}
/>
```

Pass the same files and options that produced the HTML. The markup arrives as
declarative shadow DOM, so the code shows before JavaScript runs. Other
helpers: `preloadPatchDiff`, `preloadFileDiff`, `preloadFile`.

A component mounted later on the client with `prerenderedHTML`, such as one
in a tab, fills its shadow root from the string. It does not need a new
server render.
