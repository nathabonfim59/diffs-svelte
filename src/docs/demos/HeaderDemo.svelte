<script lang="ts">
	import { MultiFileDiff } from '$lib/index.js';
	import { counterAfter, counterBefore } from '../examples.js';
	import { baseOptions } from '../theme.svelte.js';

	let viewed = $state(false);
	let collapsed = $state(false);
</script>

<div class="frame">
	<MultiFileDiff
		oldFile={counterBefore}
		newFile={counterAfter}
		options={{ ...baseOptions(), collapsed: collapsed || viewed }}
	>
		{#snippet headerPrefix()}
			<input type="checkbox" bind:checked={viewed} aria-label="Mark as viewed" />
		{/snippet}

		{#snippet headerFilenameSuffix(fileDiff)}
			<span class="badge">{fileDiff.type}</span>
		{/snippet}

		{#snippet headerMetadata(fileDiff)}
			<span class="count">{fileDiff.hunks.length} hunk{fileDiff.hunks.length === 1 ? '' : 's'}</span>
			<button onclick={() => (collapsed = !collapsed)} disabled={viewed}>
				{collapsed || viewed ? 'Expand' : 'Collapse'}
			</button>
		{/snippet}
	</MultiFileDiff>
</div>
<p class="caption">Checking the box marks the file as viewed and collapses it.</p>

<style>
	input {
		margin: 0 6px 0 0;
		accent-color: var(--accent);
	}
	.badge {
		margin-left: 6px;
		padding: 1px 6px;
		font-family: var(--font-sans);
		font-size: 11px;
		color: var(--muted);
		border: 1px solid var(--border);
		border-radius: 999px;
	}
	.count {
		margin: 0 8px;
		font-family: var(--font-sans);
		font-size: 12px;
		color: var(--muted);
	}
	button {
		font-family: var(--font-sans);
		font-size: 12px;
		color: var(--text);
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 2px 8px;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.5;
		cursor: default;
	}
</style>
