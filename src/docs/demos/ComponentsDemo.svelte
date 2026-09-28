<script lang="ts">
	import { parsePatchFiles } from '@pierre/diffs';
	import { File, FileDiff, MultiFileDiff, PatchDiff } from '$lib/index.js';
	import CodeBlock from '../CodeBlock.svelte';
	import Tabs from '../Tabs.svelte';
	import {
		configAfter,
		configBefore,
		multiPatch,
		samples,
		singlePatch,
		utilsFile
	} from '../examples.js';
	import { baseOptions } from '../theme.svelte.js';

	let { html }: { html: Record<string, string> } = $props();

	const tabs = ['MultiFileDiff', 'PatchDiff', 'FileDiff', 'File'] as const;
	const sampleFor = {
		MultiFileDiff: 'multiFileDiff',
		PatchDiff: 'patchDiff',
		FileDiff: 'fileDiff',
		File: 'file'
	} as const;

	const parsedFiles = parsePatchFiles(multiPatch).flatMap((p) => p.files);
</script>

<Tabs {tabs} label="Components">
	{#snippet children(tab)}
		<CodeBlock file={samples[sampleFor[tab]]} html={html[sampleFor[tab]]} />
		<div class="frame">
			{#if tab === 'MultiFileDiff'}
				<MultiFileDiff oldFile={configBefore} newFile={configAfter} options={baseOptions()} />
			{:else if tab === 'PatchDiff'}
				<PatchDiff patch={singlePatch} options={{ ...baseOptions(), diffStyle: 'unified' }} />
			{:else if tab === 'FileDiff'}
				{#each parsedFiles as fileDiff (fileDiff.name)}
					<FileDiff {fileDiff} options={baseOptions()} />
				{/each}
			{:else}
				<File file={utilsFile} options={{ ...baseOptions(), overflow: 'wrap' }} />
			{/if}
		</div>
	{/snippet}
</Tabs>
