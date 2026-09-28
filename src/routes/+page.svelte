<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { MultiFileDiff } from '$lib/index.js';
	import CodeBlock from '../docs/CodeBlock.svelte';
	import ComponentsDemo from '../docs/demos/ComponentsDemo.svelte';
	import HeaderDemo from '../docs/demos/HeaderDemo.svelte';
	import Playground from '../docs/demos/Playground.svelte';
	import ReviewDemo from '../docs/demos/ReviewDemo.svelte';
	import SelectionDemo from '../docs/demos/SelectionDemo.svelte';
	import { counterAfter, counterBefore, PKG, REPO_URL, samples } from '../docs/examples.js';
	import { baseOptions, loadMode, setMode, ui } from '../docs/theme.svelte.js';

	let { data } = $props();

	const nav = [
		{
			title: 'Getting started',
			items: [
				['overview', 'Overview'],
				['installation', 'Installation'],
				['agents', 'Build with agents'],
				['quick-start', 'Quick start']
			]
		},
		{
			title: 'Components',
			items: [
				['components', 'Components'],
				['props', 'Props'],
				['snippets', 'Snippets'],
				['annotations', 'Annotations and gutter'],
				['header', 'Header'],
				['selection', 'Line selection']
			]
		},
		{
			title: 'Configuration',
			items: [
				['options', 'Options'],
				['instance', 'Renderer instance'],
				['worker-pool', 'Worker pool'],
				['ssr', 'Server rendering']
			]
		},
		{
			title: 'Reference',
			items: [
				['core-types', 'Core types'],
				['from-react', 'Coming from React'],
				['status', 'Not bound yet']
			]
		}
	] as const;

	let heroStyle = $state<'split' | 'unified'>('split');
	let current = $state('overview');
	let tocOpen = $state(false);

	onMount(() => {
		loadMode();
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) current = entry.target.id;
				}
			},
			{ rootMargin: '-80px 0px -70% 0px' }
		);
		for (const el of document.querySelectorAll('main [id]')) observer.observe(el);
		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<title>diffs-svelte</title>
	<meta
		name="description"
		content="Svelte 5 components for @pierre/diffs: syntax-highlighted diffs and code files with annotations, line selection, and server rendering."
	/>
</svelte:head>

<header class="topbar">
	<div class="topbar-inner">
		<a class="brand" href="#overview">
			<span class="brand-name">diffs-svelte</span>
			<span class="brand-sub">Svelte 5 bindings for @pierre/diffs</span>
		</a>
		<nav class="top-links">
			<a href="https://diffs.com/docs" target="_blank" rel="noreferrer">@pierre/diffs docs ↗</a>
			<a href={REPO_URL} target="_blank" rel="noreferrer">GitHub ↗</a>
			<button
				class="mode"
				aria-label={ui.mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
				onclick={() => setMode(ui.mode === 'dark' ? 'light' : 'dark')}
			>
				{#if ui.mode === 'dark'}
					<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"
						><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2" /><path
							d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						/></svg
					>
				{:else}
					<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"
						><path
							d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linejoin="round"
						/></svg
					>
				{/if}
			</button>
		</nav>
	</div>
</header>

<div class="layout">
	<aside class="sidebar" class:open={tocOpen}>
		<button class="toc-toggle" onclick={() => (tocOpen = !tocOpen)} aria-expanded={tocOpen}>
			On this page
		</button>
		<nav aria-label="Sections">
			{#each nav as group (group.title)}
				<p class="group">{group.title}</p>
				<ul>
					{#each group.items as [id, label] (id)}
						<li>
							<a href="#{id}" class:active={current === id} onclick={() => (tocOpen = false)}
								>{label}</a
							>
						</li>
					{/each}
				</ul>
			{/each}
		</nav>
	</aside>

	<main>
		<section id="overview">
			<h1>diffs-svelte</h1>
			<p class="lead">
				Svelte 5 components for <a href="https://diffs.com" target="_blank" rel="noreferrer"
					>@pierre/diffs</a
				>. Render diffs and code files with Shiki highlighting, split or unified layout, line
				annotations, and line selection.
			</p>
			<p>
				The components drive the vanilla <code>@pierre/diffs</code> renderers directly. Your bundle
				contains no React, and props and snippets replace the React render functions.
			</p>

			<div class="toolbar">
				<button onclick={() => (heroStyle = heroStyle === 'split' ? 'unified' : 'split')}>
					Switch to {heroStyle === 'split' ? 'unified' : 'split'}
				</button>
			</div>
			<div class="frame">
				<MultiFileDiff
					oldFile={counterBefore}
					newFile={counterAfter}
					prerenderedHTML={data.heroHTML}
					options={{ ...baseOptions(), diffStyle: heroStyle }}
				/>
			</div>
			<p class="caption">A Svelte 4 component migrated to runes, rendered with MultiFileDiff.</p>
		</section>

		<section id="installation">
			<h2>Installation</h2>
			<p>
				Install the package and its peer dependency. The components use attachments, so they need
				Svelte 5.29 or later.
			</p>
			<CodeBlock file={samples.install} html={data.html.install} />
			<p>
				<code>@pierre/diffs</code> is a peer dependency, so your app and these components share one
				copy. You also import from it directly for parsing helpers, types, the worker, and server
				rendering.
			</p>
		</section>

		<section id="agents">
			<h2>Build with agents</h2>
			<p>
				An agent skill gives coding agents the component API and the recipes from this page. Any
				agent the Skills CLI supports can load it, including Claude Code, Cursor, and Codex.
			</p>

			<h3 id="agent-skill">Agent skill</h3>
			<p>Install it with the Skills CLI:</p>
			<CodeBlock file={samples.skillInstall} html={data.html.skillInstall} />
			<p>
				The skill covers choosing a component, props, snippets, options, the worker pool, and server
				rendering. For the full list of <code>@pierre/diffs</code> options, also install the upstream
				skill with <code>npx skills add pierrecomputer/pierre --skill diffs</code>.
			</p>

			<h3 id="agent-prompt">Prompt an agent</h3>
			<p>
				You can also paste this prompt into your agent. It installs the skill and points the agent to
				the plain-text docs.
			</p>
			<CodeBlock file={samples.agentPrompt} html={data.html.agentPrompt} />

			<h3 id="plain-text">Plain-text docs</h3>
			<ul>
				<li><a href={resolve('/llms.txt')}>llms.txt</a> lists the sections of this page.</li>
				<li>
					<a href={resolve('/llms-full.txt')}>llms-full.txt</a> has the skill and all of its references
					in one Markdown file.
				</li>
			</ul>
		</section>

		<section id="quick-start">
			<h2>Quick start</h2>
			<p>
				Pass two versions of a file to <code>MultiFileDiff</code>. The diff recomputes when either
				file changes.
			</p>
			<CodeBlock file={samples.quickStart} html={data.html.quickStart} />
			<p>
				<code>name</code> sets the header label and picks the highlighting language from the file
				extension. Set <code>lang</code> to choose the language yourself.
			</p>
		</section>

		<section id="components">
			<h2>Components</h2>
			<p>
				The three diff components differ only in their input. All four render into a
				<code>&lt;diffs-container&gt;</code> element with a shadow root, so page CSS does not reach the
				code.
			</p>
			<div class="table-wrap">
				<table>
					<thead><tr><th>Component</th><th>Input</th><th>Use it when</th></tr></thead>
					<tbody>
						<tr>
							<td><code>MultiFileDiff</code></td>
							<td><code>oldFile</code>, <code>newFile</code></td>
							<td>You have both versions of a file.</td>
						</tr>
						<tr>
							<td><code>PatchDiff</code></td>
							<td><code>patch</code></td>
							<td>You have unified diff text for one file.</td>
						</tr>
						<tr>
							<td><code>FileDiff</code></td>
							<td><code>fileDiff</code></td>
							<td>You already parsed the diff, for example many files from one patch.</td>
						</tr>
						<tr>
							<td><code>File</code></td>
							<td><code>file</code></td>
							<td>You want highlighted code without a diff.</td>
						</tr>
					</tbody>
				</table>
			</div>
			<ComponentsDemo html={data.html} />
		</section>

		<section id="props">
			<h2>Props</h2>
			<p>Every component accepts these props next to its input.</p>
			<div class="table-wrap">
				<table>
					<thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
					<tbody>
						<tr>
							<td><code>options</code></td>
							<td><code>FileDiffOptions</code> or <code>FileOptions</code></td>
							<td>Display and interaction settings. See <a href="#options">Options</a>.</td>
						</tr>
						<tr>
							<td><code>lineAnnotations</code></td>
							<td><code>DiffLineAnnotation&lt;T&gt;[]</code></td>
							<td>
								Rows to place under lines. The <code>annotation</code> snippet renders them. File takes
								<code>LineAnnotation&lt;T&gt;[]</code>.
							</td>
						</tr>
						<tr>
							<td><code>selectedLines</code></td>
							<td><code>SelectedLineRange | null</code></td>
							<td>Controls the selection. Leave it undefined to let the component manage it.</td>
						</tr>
						<tr>
							<td><code>prerenderedHTML</code></td>
							<td><code>string</code></td>
							<td>
								HTML from <code>@pierre/diffs/ssr</code>. The component hydrates it instead of rendering
								from scratch.
							</td>
						</tr>
						<tr>
							<td><code>disableWorkerPool</code></td>
							<td><code>boolean</code></td>
							<td>Highlight on the main thread even inside a <code>WorkerPoolProvider</code>.</td>
						</tr>
						<tr>
							<td><code>class</code>, <code>style</code></td>
							<td><code>string</code></td>
							<td>Applied to the <code>&lt;diffs-container&gt;</code> element.</td>
						</tr>
						<tr>
							<td><code>bind:instance</code></td>
							<td><code>FileDiff</code> or <code>File</code></td>
							<td>The vanilla renderer. See <a href="#instance">Renderer instance</a>.</td>
						</tr>
					</tbody>
				</table>
			</div>
			<p>
				When <code>options</code> changes, the component compares the new object with the current one
				and re-renders only if a value differs. You can pass an object literal without memoizing it.
			</p>
			<p>
				Keep large inputs such as <code>fileDiff</code> and <code>lineAnnotations</code> in
				<code>$state.raw</code>. Plain <code>$state</code> wraps them in deep proxies, and the renderer
				reads these structures once per line.
			</p>
		</section>

		<section id="snippets">
			<h2>Snippets</h2>
			<p>
				The React components take render functions. These components take snippets instead. Each
				snippet's output goes into a named slot of the shadow root. It stays in your page's DOM, so
				your component styles apply to it.
			</p>
			<div class="table-wrap">
				<table>
					<thead><tr><th>Snippet</th><th>Arguments</th><th>Renders</th></tr></thead>
					<tbody>
						<tr>
							<td><code>annotation</code></td>
							<td><code>annotation</code></td>
							<td>One entry of <code>lineAnnotations</code>.</td>
						</tr>
						<tr>
							<td><code>gutterUtility</code></td>
							<td><code>getHoveredLine</code></td>
							<td>A control next to the line under the pointer.</td>
						</tr>
						<tr>
							<td><code>header</code></td>
							<td><code>fileDiff</code> or <code>file</code></td>
							<td>A replacement for the whole file header.</td>
						</tr>
						<tr>
							<td><code>headerPrefix</code></td>
							<td><code>fileDiff</code> or <code>file</code></td>
							<td>Content before the file name.</td>
						</tr>
						<tr>
							<td><code>headerFilenameSuffix</code></td>
							<td><code>fileDiff</code> or <code>file</code></td>
							<td>Content right after the file name.</td>
						</tr>
						<tr>
							<td><code>headerMetadata</code></td>
							<td><code>fileDiff</code> or <code>file</code></td>
							<td>Content at the end of the header, after the change counts.</td>
						</tr>
					</tbody>
				</table>
			</div>
			<p>
				Snippet arguments get their types from the component's generics. In the next example,
				<code>comment.metadata</code> has the type <code>Comment</code> without any annotation.
			</p>

			<h3 id="annotations">Annotations and gutter</h3>
			<p>
				Each entry in <code>lineAnnotations</code> has a <code>side</code>, a
				<code>lineNumber</code>, and a <code>metadata</code> value of your choice. The
				<code>annotation</code> snippet renders one row per entry. <code>gutterUtility</code> renders
				a control beside the hovered line. Its argument, <code>getHoveredLine()</code>, returns the
				line number and side under the pointer. Passing the snippet turns on
				<code>enableGutterUtility</code>, unless you set it to <code>false</code>.
			</p>
			<p>Hover a line in the demo, click the <b>+</b> button, and write a comment.</p>
			<ReviewDemo />
			<CodeBlock file={samples.annotations} html={data.html.annotations} />

			<h3 id="header">Header</h3>
			<p>
				<code>headerPrefix</code>, <code>headerFilenameSuffix</code>, and
				<code>headerMetadata</code> add content to the built-in header. <code>header</code> replaces
				it. Diff components pass <code>FileDiffMetadata</code> to these snippets, and
				<code>File</code> passes <code>FileContents</code>. Set <code>options.collapsed</code> to hide
				the code and keep the header.
			</p>
			<HeaderDemo />
			<CodeBlock file={samples.headers} html={data.html.headers} />

			<h3 id="selection">Line selection</h3>
			<p>
				Set <code>enableLineSelection</code> to let users select lines. Pass
				<code>selectedLines</code> to control the selection from your own state.
				<code>onLineSelected</code> fires on every change, so you can write the value back.
			</p>
			<SelectionDemo />
			<CodeBlock file={samples.selection} html={data.html.selection} />
		</section>

		<section id="options">
			<h2>Options</h2>
			<p>
				The component passes <code>options</code> to the vanilla renderer unchanged. The playground
				covers the display options. The
				<a href="https://diffs.com/docs#react-api-shared-props" target="_blank" rel="noreferrer"
					>@pierre/diffs docs</a
				> list the rest, including event callbacks and expansion settings.
			</p>
			<p>
				<code>theme</code> takes any Shiki theme name or a <code>{'{ dark, light }'}</code> pair.
				<code>themeType</code> picks one side of the pair. Its default, <code>'system'</code>, follows
				the OS setting. This page sets it from the button in the top bar.
			</p>
			<Playground />
		</section>

		<section id="instance">
			<h2>Renderer instance</h2>
			<p>
				<code>bind:instance</code> gives you the vanilla <code>FileDiff</code> or <code>File</code>
				renderer. Use it for methods that have no prop, such as <code>getHoveredLine()</code>, or
				<code>setSelectedLines()</code> without making the selection controlled. The value is
				<code>undefined</code> before mount and after unmount.
			</p>
			<CodeBlock file={samples.instance} html={data.html.instance} />
		</section>

		<section id="worker-pool">
			<h2>Worker pool</h2>
			<p>
				Highlighting runs on the main thread by default. For large diffs, move it to Web Workers by
				wrapping part of your app in <code>WorkerPoolProvider</code>. Every component inside sends
				its highlighting work to the pool. Providers share one pool. The last provider to unmount
				terminates it.
			</p>
			<CodeBlock file={samples.workerPool} html={data.html.workerPool} />
			<p>
				The <code>?worker</code> suffix is Vite syntax that turns the import into a worker constructor.
				Pass <code>disableWorkerPool</code> to keep one component on the main thread.
			</p>
		</section>

		<section id="ssr">
			<h2>Server rendering</h2>
			<p>
				On the server the components output an empty container, because the renderer runs in the
				browser. To send highlighted code with the page, generate the HTML in a <code>load</code>
				function with <code>@pierre/diffs/ssr</code> and pass it as <code>prerenderedHTML</code>.
			</p>
			<CodeBlock file={samples.ssrServer} html={data.html.ssrServer} />
			<CodeBlock file={samples.ssrPage} html={data.html.ssrPage} />
			<p>
				The HTML arrives as declarative shadow DOM, so the code shows before any JavaScript runs.
				After load the component attaches to that markup instead of rendering it again. Use
				<code>preloadPatchDiff</code>, <code>preloadFileDiff</code>, and <code>preloadFile</code> for
				the other components.
			</p>
			<p>
				This page is built this way. SvelteKit prerenders it, and every code block and the diff at
				the top were highlighted at build time.
			</p>
		</section>

		<section id="core-types">
			<h2>Core types</h2>
			<p>
				The components take the data types from <code>@pierre/diffs</code>. This package re-exports
				the common ones, so you can import them from <code>{PKG}</code>.
			</p>
			<CodeBlock file={samples.coreTypes} html={data.html.coreTypes} />
			<p>
				<code>parseDiffFromFile</code> and <code>parsePatchFiles</code> in
				<code>@pierre/diffs</code> create <code>FileDiffMetadata</code>. The
				<a href="https://diffs.com/docs#core-types" target="_blank" rel="noreferrer"
					>core types reference</a
				> describes every field.
			</p>
		</section>

		<section id="from-react">
			<h2>Coming from React</h2>
			<p>
				The components mirror <code>@pierre/diffs/react</code>. These are the differences.
			</p>
			<div class="table-wrap">
				<table>
					<thead><tr><th>React</th><th>Svelte</th></tr></thead>
					<tbody>
						<tr>
							<td><code>renderAnnotation</code>, <code>renderHeaderPrefix</code>, ...</td>
							<td>Snippets without the <code>render</code> prefix: <code>annotation</code>, <code>headerPrefix</code>, ...</td>
						</tr>
						<tr>
							<td><code>renderCustomHeader</code></td>
							<td><code>header</code></td>
						</tr>
						<tr>
							<td><code>className</code></td>
							<td><code>class</code></td>
						</tr>
						<tr>
							<td><code>style</code> object</td>
							<td><code>style</code> string</td>
						</tr>
						<tr>
							<td><code>WorkerPoolContextProvider</code></td>
							<td><code>WorkerPoolProvider</code></td>
						</tr>
						<tr>
							<td><code>useMemo</code> around options</td>
							<td>Not needed. Options are compared by value.</td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>

		<section id="status">
			<h2>Not bound yet</h2>
			<p>These parts of <code>@pierre/diffs</code> have no Svelte component yet:</p>
			<ul>
				<li>Edit mode (<code>edit</code>, <code>EditContext</code>)</li>
				<li><code>Virtualizer</code> and the virtualized renderers</li>
				<li><code>CodeView</code></li>
				<li><code>UnresolvedFile</code> for merge conflicts</li>
			</ul>
			<p>
				You can still use their vanilla classes with an element from <code>bind:this</code>.
				<a href="{REPO_URL}/issues" target="_blank" rel="noreferrer">Open an issue</a> if you need one of
				them.
			</p>
		</section>

		<footer>
			Built on <a href="https://diffs.com" target="_blank" rel="noreferrer">@pierre/diffs</a> by The
			Pierre Computer Company. diffs-svelte is a community package and is not affiliated with them.
		</footer>
	</main>
</div>

<style>
	.topbar {
		position: sticky;
		top: 0;
		z-index: 10;
		background: color-mix(in srgb, var(--bg) 85%, transparent);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--border);
	}
	.topbar-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		max-width: 1280px;
		margin: 0 auto;
		padding: 12px 24px;
	}
	.brand {
		display: flex;
		align-items: baseline;
		gap: 10px;
		text-decoration: none;
		min-width: 0;
	}
	.brand-name {
		font-weight: 700;
		font-size: 18px;
	}
	.brand-sub {
		font-size: 14px;
		color: var(--muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.top-links {
		display: flex;
		align-items: center;
		gap: 20px;
		font-size: 14px;
		white-space: nowrap;
	}
	.top-links a {
		color: var(--muted);
		text-decoration: none;
	}
	.top-links a:hover {
		color: var(--text);
	}
	.mode {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		color: var(--muted);
		background: none;
		border: 1px solid var(--border);
		border-radius: 8px;
		cursor: pointer;
	}
	.mode:hover {
		color: var(--text);
		border-color: var(--border-strong);
	}

	.layout {
		display: grid;
		grid-template-columns: 220px minmax(0, 1fr);
		gap: 56px;
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 24px;
	}

	.sidebar {
		position: sticky;
		top: 57px;
		align-self: start;
		max-height: calc(100vh - 57px);
		overflow-y: auto;
		padding: 28px 0;
	}
	.toc-toggle {
		display: none;
	}
	.group {
		margin: 18px 0 4px;
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.group:first-child {
		margin-top: 0;
	}
	.sidebar ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.sidebar a {
		display: block;
		padding: 4px 10px;
		font-size: 14px;
		color: var(--muted);
		text-decoration: none;
		border-radius: 6px;
	}
	.sidebar a:hover {
		color: var(--text);
	}
	.sidebar a.active {
		color: var(--text);
		background: var(--surface-2);
	}

	main {
		max-width: 900px;
		padding: 36px 0 80px;
	}
	section {
		padding-bottom: 32px;
	}
	h1 {
		margin: 0 0 12px;
		font-size: 40px;
		line-height: 1.15;
		letter-spacing: -0.02em;
	}
	h2 {
		margin: 40px 0 12px;
		font-size: 26px;
		letter-spacing: -0.01em;
	}
	h3 {
		margin: 36px 0 8px;
		font-size: 19px;
	}
	.lead {
		font-size: 19px;
		color: var(--text);
	}
	p,
	li {
		color: color-mix(in srgb, var(--text) 88%, var(--muted));
	}

	.table-wrap {
		overflow-x: auto;
		margin: 16px 0;
		border: 1px solid var(--border);
		border-radius: 10px;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}
	th,
	td {
		padding: 9px 14px;
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid var(--border);
	}
	th {
		font-weight: 600;
		background: var(--surface);
	}
	tbody tr:last-child td {
		border-bottom: none;
	}

	footer {
		margin-top: 40px;
		padding-top: 20px;
		font-size: 14px;
		color: var(--muted);
		border-top: 1px solid var(--border);
	}

	@media (max-width: 900px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
			gap: 0;
			padding: 0 16px;
		}
		.sidebar {
			position: sticky;
			top: 57px;
			z-index: 5;
			max-height: none;
			margin: 0 -16px;
			padding: 0 16px;
			background: var(--bg);
			border-bottom: 1px solid var(--border);
		}
		.toc-toggle {
			display: block;
			width: 100%;
			padding: 10px 0;
			font: inherit;
			font-size: 14px;
			text-align: left;
			color: var(--muted);
			background: none;
			border: none;
			cursor: pointer;
		}
		.sidebar nav {
			display: none;
			max-height: 60vh;
			overflow-y: auto;
			padding-bottom: 12px;
		}
		.sidebar.open nav {
			display: block;
		}
		.brand-sub,
		.top-links a:first-child {
			display: none;
		}
		h1 {
			font-size: 32px;
		}
		main {
			padding-top: 24px;
		}
	}
</style>
