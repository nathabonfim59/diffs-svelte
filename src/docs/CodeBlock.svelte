<script lang="ts">
	import { File, type FileContents } from '$lib/index.js';
	import { baseOptions } from './theme.svelte.js';

	let { file, html }: { file: FileContents; html?: string } = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout>;

	async function copy() {
		await navigator.clipboard.writeText(file.contents);
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 1500);
	}
</script>

<div class="frame">
	<File {file} prerenderedHTML={html} options={{ ...baseOptions(), disableLineNumbers: true }}>
		{#snippet headerMetadata()}
			<button class="copy" onclick={copy}>{copied ? 'Copied' : 'Copy'}</button>
		{/snippet}
	</File>
</div>

<style>
	.copy {
		font: inherit;
		font-size: 12px;
		color: var(--muted);
		background: none;
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 2px 8px;
		cursor: pointer;
	}
	.copy:hover {
		color: var(--text);
		border-color: var(--border-strong);
	}
</style>
