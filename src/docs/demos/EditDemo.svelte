<script lang="ts">
	import { EditProvider, File, type FileContents } from '$lib/index.js';
	import { utilsFile } from '../examples.js';
	import { baseOptions } from '../theme.svelte.js';

	let file = $state<FileContents>(utilsFile);
	let editing = $state(false);
	let changes = $state(0);
	let last = $state<'accepted' | 'rejected'>();
	let keep = true;

	function finish(accept: boolean) {
		keep = accept;
		editing = false;
	}
</script>

<div class="toolbar">
	{#if editing}
		<button onclick={() => finish(true)}>Save</button>
		<button onclick={() => finish(false)}>Discard</button>
		<code>{changes} change{changes === 1 ? '' : 's'}</code>
	{:else}
		<button onclick={() => ((changes = 0), (editing = true))}>Edit</button>
		{#if last}<code>last edit {last}</code>{/if}
	{/if}
</div>
<div class="frame">
	<EditProvider>
		<File
			{file}
			edit={editing}
			options={baseOptions()}
			onEditChange={() => changes++}
			onEditComplete={(event) => {
				last = keep ? 'accepted' : 'rejected';
				if (!keep) return 'reject';
				file = event.file;
				return 'accept';
			}}
		/>
	</EditProvider>
</div>
<p class="caption">Click Edit, then type in the code. Discard puts the original back.</p>
