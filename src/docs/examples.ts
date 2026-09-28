import type { FileContents } from '@pierre/diffs';

export const PKG = 'diffs-svelte';
export const REPO_URL = 'https://github.com/nathabonfim59/diffs-svelte';
export const SITE_URL = 'https://nathabonfim59.github.io/diffs-svelte';
export const SKILL_INSTALL = 'npx skills add nathabonfim59/diffs-svelte --skill diffs-svelte';

// ---------------------------------------------------------------------------
// Data rendered by the live demos
// ---------------------------------------------------------------------------

export const counterBefore: FileContents = {
	name: 'Counter.svelte',
	contents: `<script>
  import { createEventDispatcher } from 'svelte';

  export let initial = 0;
  export let step = 1;

  const dispatch = createEventDispatcher();
  let count = initial;

  $: doubled = count * 2;

  function increment() {
    count += step;
    dispatch('change', count);
  }
</script>

<button on:click={increment}>
  Clicked {count} times ({doubled})
</button>
`
};

export const counterAfter: FileContents = {
	name: 'Counter.svelte',
	contents: `<script>
  let { initial = 0, step = 1, onchange } = $props();

  let count = $state(initial);
  const doubled = $derived(count * 2);

  function increment() {
    count += step;
    onchange?.(count);
  }
</script>

<button onclick={increment}>
  Clicked {count} times ({doubled})
</button>
`
};

export const configBefore: FileContents = {
	name: 'server.ts',
	contents: `import { createServer } from 'node:http';
import { readConfig } from './config';

const config = readConfig();

export function start() {
  const server = createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('ok');
  });

  server.listen(config.port);
  console.log('listening on ' + config.port);
  return server;
}
`
};

export const configAfter: FileContents = {
	name: 'server.ts',
	contents: `import { createServer } from 'node:http';
import { readConfig } from './config';
import { logger } from './logger';

const config = readConfig();

export function start(port = config.port) {
  const server = createServer((req, res) => {
    logger.debug(\`\${req.method} \${req.url}\`);
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
  });

  server.listen(port, config.host);
  logger.info(\`listening on \${config.host}:\${port}\`);
  return server;
}
`
};

export const singlePatch = [
	'diff --git a/src/math.py b/src/math.py',
	'index 3b18e51..a9c2f4d 100644',
	'--- a/src/math.py',
	'+++ b/src/math.py',
	'@@ -1,8 +1,11 @@',
	'-def mean(values):',
	'-    return sum(values) / len(values)',
	'+def mean(values: list[float]) -> float:',
	'+    if not values:',
	'+        raise ValueError("mean() of empty list")',
	'+    return sum(values) / len(values)',
	// Context lines keep their leading space, even when blank.
	' ',
	' ',
	' def clamp(value, low, high):',
	'-    if value < low: return low',
	'-    if value > high: return high',
	'-    return value',
	'+    return max(low, min(value, high))',
	'+',
	'+',
	'+__all__ = ["mean", "clamp"]',
	''
].join('\n');

export const multiPatch = `diff --git a/package.json b/package.json
index 1f2e3d4..5a6b7c8 100644
--- a/package.json
+++ b/package.json
@@ -1,6 +1,6 @@
 {
   "name": "my-app",
-  "version": "1.2.0",
+  "version": "1.3.0",
   "type": "module",
   "scripts": {
     "dev": "vite dev"
diff --git a/src/lib/format.ts b/src/lib/format.ts
new file mode 100644
index 0000000..e69de29
--- /dev/null
+++ b/src/lib/format.ts
@@ -0,0 +1,5 @@
+const bytes = new Intl.NumberFormat('en', { style: 'unit', unit: 'byte', notation: 'compact' });
+
+export function formatBytes(n: number): string {
+  return bytes.format(n);
+}
`;

export const utilsFile: FileContents = {
	name: 'debounce.ts',
	contents: `export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
`
};

// ---------------------------------------------------------------------------
// Code samples shown on the page. They are prerendered at build time with
// `preloadFile` from `@pierre/diffs/ssr`, then hydrated by <File>.
// ---------------------------------------------------------------------------

const svelte = (name: string, contents: string): FileContents => ({ name, contents });

export const samples = {
	install: {
		name: 'terminal',
		lang: 'bash',
		contents: `pnpm add ${PKG} @pierre/diffs\n`
	},

	skillInstall: {
		name: 'terminal',
		lang: 'bash',
		contents: `${SKILL_INSTALL}\n`
	},

	agentPrompt: {
		name: 'prompt.md',
		contents: `Set up diffs-svelte in this Svelte 5 project.
Install its agent skill first so you have the full API reference:

${SKILL_INSTALL}

Then follow that skill to add diffs-svelte and @pierre/diffs.

Docs: ${SITE_URL}/
Full reference for LLMs: ${SITE_URL}/llms-full.txt
`
	},

	quickStart: svelte(
		'+page.svelte',
		`<script lang="ts">
  import { MultiFileDiff } from '${PKG}';

  const oldFile = { name: 'greeting.ts', contents: "export const greeting = 'hi';\\n" };
  const newFile = { name: 'greeting.ts', contents: "export const greeting = 'hello';\\n" };
</script>

<MultiFileDiff
  {oldFile}
  {newFile}
  options={{ theme: { dark: 'pierre-dark', light: 'pierre-light' } }}
/>
`
	),

	multiFileDiff: svelte(
		'Review.svelte',
		`<script lang="ts">
  import { MultiFileDiff, type FileContents } from '${PKG}';

  let { before, after }: { before: FileContents; after: FileContents } = $props();
</script>

<!-- Recomputes the diff whenever either file changes -->
<MultiFileDiff oldFile={before} newFile={after} options={{ diffStyle: 'split' }} />
`
	),

	patchDiff: svelte(
		'Patch.svelte',
		`<script lang="ts">
  import { PatchDiff } from '${PKG}';

  // Output of \`git diff\` for exactly one file
  let { patch }: { patch: string } = $props();
</script>

<PatchDiff {patch} options={{ diffStyle: 'unified' }} />
`
	),

	fileDiff: svelte(
		'Changeset.svelte',
		`<script lang="ts">
  import { parsePatchFiles } from '@pierre/diffs';
  import { FileDiff } from '${PKG}';

  let { patch }: { patch: string } = $props();

  // One patch can hold many files. Parse once, render each.
  const files = $derived(parsePatchFiles(patch).flatMap((p) => p.files));
</script>

{#each files as fileDiff (fileDiff.name)}
  <FileDiff {fileDiff} />
{/each}
`
	),

	file: svelte(
		'Source.svelte',
		`<script lang="ts">
  import { File } from '${PKG}';

  let { name, contents }: { name: string; contents: string } = $props();
</script>

<File file={{ name, contents }} options={{ overflow: 'wrap' }} />
`
	),

	annotations: svelte(
		'Comments.svelte',
		`<script lang="ts">
  import { MultiFileDiff, type DiffLineAnnotation } from '${PKG}';

  type Comment = { author: string; body: string };

  let comments = $state.raw<DiffLineAnnotation<Comment>[]>([
    { side: 'additions', lineNumber: 9, metadata: { author: 'ana', body: 'Nice.' } }
  ]);

  function add(side: 'additions' | 'deletions', lineNumber: number) {
    const metadata = { author: 'you', body: '' };
    comments = [...comments, { side, lineNumber, metadata }];
  }
</script>

<MultiFileDiff {oldFile} {newFile} lineAnnotations={comments}>
  {#snippet annotation(comment)}
    <div class="comment">
      <b>{comment.metadata.author}</b>
      {comment.metadata.body}
    </div>
  {/snippet}

  {#snippet gutterUtility(getHoveredLine)}
    <button
      onclick={() => {
        const line = getHoveredLine();
        if (line) add(line.side, line.lineNumber);
      }}>+</button
    >
  {/snippet}
</MultiFileDiff>
`
	),

	headers: svelte(
		'Header.svelte',
		`<MultiFileDiff {oldFile} {newFile} options={{ collapsed }}>
  {#snippet headerPrefix()}
    <input type="checkbox" bind:checked={viewed} aria-label="Viewed" />
  {/snippet}

  {#snippet headerFilenameSuffix(fileDiff)}
    {#if fileDiff.prevName}<span class="badge">renamed</span>{/if}
  {/snippet}

  {#snippet headerMetadata(fileDiff)}
    <span>{fileDiff.hunks.length} hunks</span>
    <button onclick={() => (collapsed = !collapsed)}>
      {collapsed ? 'Expand' : 'Collapse'}
    </button>
  {/snippet}
</MultiFileDiff>
`
	),

	selection: svelte(
		'Selection.svelte',
		`<script lang="ts">
  import { MultiFileDiff, type SelectedLineRange } from '${PKG}';

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

<button onclick={() => (selectedLines = null)}>Clear</button>
`
	),

	instance: svelte(
		'Instance.svelte',
		`<script lang="ts">
  import type { FileDiff as FileDiffRenderer } from '@pierre/diffs';
  import { MultiFileDiff } from '${PKG}';

  // Set after mount, reset to undefined on unmount
  let instance = $state<FileDiffRenderer<undefined, undefined>>();

  function jumpToLine(lineNumber: number) {
    instance?.setSelectedLines({ start: lineNumber, end: lineNumber, side: 'additions' });
  }
</script>

<MultiFileDiff {oldFile} {newFile} bind:instance />
`
	),

	workerPool: svelte(
		'+layout.svelte',
		`<script lang="ts">
  import { WorkerPoolProvider } from '${PKG}';
  import DiffsWorker from '@pierre/diffs/worker/worker.js?worker';

  let { children } = $props();
</script>

<WorkerPoolProvider
  poolOptions={{ workerFactory: () => new DiffsWorker(), poolSize: 4 }}
  highlighterOptions={{ theme: { dark: 'pierre-dark', light: 'pierre-light' } }}
>
  {@render children()}
</WorkerPoolProvider>
`
	),

	ssrServer: {
		name: '+page.server.ts',
		contents: `import { preloadMultiFileDiff } from '@pierre/diffs/ssr';

export async function load() {
  const oldFile = await readFile('before.ts');
  const newFile = await readFile('after.ts');
  const options = { theme: { dark: 'pierre-dark', light: 'pierre-light' } } as const;

  const { prerenderedHTML } = await preloadMultiFileDiff({ oldFile, newFile, options });
  return { oldFile, newFile, options, prerenderedHTML };
}
`
	},

	ssrPage: svelte(
		'+page.svelte',
		`<script lang="ts">
  import { MultiFileDiff } from '${PKG}';

  let { data } = $props();
</script>

<!-- Pass the same files and options that produced the HTML -->
<MultiFileDiff
  oldFile={data.oldFile}
  newFile={data.newFile}
  options={data.options}
  prerenderedHTML={data.prerenderedHTML}
/>
`
	),

	coreTypes: {
		name: 'types.ts',
		contents: `interface FileContents {
  name: string; // also used to infer the language
  contents: string;
  lang?: SupportedLanguages; // override the inferred language
  cacheKey?: string; // enables worker pool caching
}

interface DiffLineAnnotation<T> {
  side: 'deletions' | 'additions';
  lineNumber: number;
  metadata: T;
}

// <File> uses LineAnnotation, which has no \`side\`
interface LineAnnotation<T> {
  lineNumber: number;
  metadata: T;
}
`
	}
} satisfies Record<string, FileContents>;

// A trailing newline would render as an empty last line in the code blocks.
for (const sample of Object.values(samples)) sample.contents = sample.contents.trimEnd();

export type SampleKey = keyof typeof samples;

// A longer file with two changes far apart, so hunk separators have
// collapsed context to show.
const routerLines = [
	"import type { Handler, Route } from './types';",
	'',
	'export class Router {',
	'  private routes: Route[] = [];',
	'',
	'  get(path: string, handler: Handler) {',
	"    this.routes.push({ method: 'GET', path, handler });",
	'    return this;',
	'  }',
	'',
	'  post(path: string, handler: Handler) {',
	"    this.routes.push({ method: 'POST', path, handler });",
	'    return this;',
	'  }',
	'',
	'  put(path: string, handler: Handler) {',
	"    this.routes.push({ method: 'PUT', path, handler });",
	'    return this;',
	'  }',
	'',
	'  delete(path: string, handler: Handler) {',
	"    this.routes.push({ method: 'DELETE', path, handler });",
	'    return this;',
	'  }',
	'',
	'  match(method: string, path: string) {',
	'    return this.routes.find((r) => r.method === method && r.path === path);',
	'  }',
	'}',
	''
];

export const routerBefore: FileContents = {
	name: 'router.ts',
	contents: routerLines.join('\n')
};

export const routerAfter: FileContents = {
	name: 'router.ts',
	contents: routerLines
		.join('\n')
		.replace("import type { Handler, Route } from './types';", "import type { Handler, Method, Route } from './types';")
		.replace(
			'  match(method: string, path: string) {\n    return this.routes.find((r) => r.method === method && r.path === path);',
			'  match(method: Method, path: string): Route | undefined {\n    const normalized = path.replace(/\\/+$/, \'\') || \'/\';\n    return this.routes.find((r) => r.method === method && r.path === normalized);'
		)
};
