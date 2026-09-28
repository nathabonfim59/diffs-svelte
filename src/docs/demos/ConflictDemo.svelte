<script lang="ts">
	import { UnresolvedFile, type FileContents } from '$lib/index.js';
	import { conflictFile } from '../examples.js';
	import { baseOptions } from '../theme.svelte.js';

	let file = $state<FileContents>(conflictFile);
	let remaining = $state(2);
	let version = $state(0);
</script>

<div class="toolbar">
	<code>{remaining} conflict{remaining === 1 ? '' : 's'} left</code>
	<button
		onclick={() => ((file = conflictFile), (remaining = 2), version++)}
		disabled={remaining === 2}>Reset</button
	>
</div>
<div class="frame">
	{#key version}
		<UnresolvedFile {file} options={baseOptions()} onResolve={() => remaining--}>
			{#snippet mergeConflictAction(action, resolve)}
				<div class="actions">
					<button onclick={() => resolve('current')}>Keep HEAD</button>
					<button onclick={() => resolve('incoming')}>Keep feature/deploy</button>
					<button onclick={() => resolve('both')}>Keep both</button>
					<span>conflict {action.conflictIndex + 1}</span>
				</div>
			{/snippet}
		</UnresolvedFile>
	{/key}
</div>
<p class="caption">Each button resolves one conflict. The buttons are a Svelte snippet.</p>

<style>
	.actions {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		font: 12px/1.4 var(--font-sans, system-ui);
	}
	.actions span {
		margin-left: auto;
		opacity: 0.6;
	}
</style>
