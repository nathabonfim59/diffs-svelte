<script lang="ts">
	import { MultiFileDiff, type SelectedLineRange } from '$lib/index.js';
	import { configAfter, configBefore } from '../examples.js';
	import { baseOptions } from '../theme.svelte.js';

	let selectedLines = $state<SelectedLineRange | null>(null);
</script>

<div class="toolbar">
	<button onclick={() => (selectedLines = { start: 8, end: 12, side: 'additions' })}>
		Select new lines 8 to 12
	</button>
	<button onclick={() => (selectedLines = null)} disabled={selectedLines == null}>Clear</button>
	<code>{selectedLines ? JSON.stringify(selectedLines) : 'null'}</code>
</div>
<div class="frame">
	<MultiFileDiff
		oldFile={configBefore}
		newFile={configAfter}
		{selectedLines}
		options={{
			...baseOptions(),
			enableLineSelection: true,
			onLineSelected: (range) => (selectedLines = range)
		}}
	/>
</div>
<p class="caption">Click a line number, or shift-click to extend the range.</p>
