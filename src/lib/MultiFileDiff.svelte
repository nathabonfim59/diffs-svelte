<script lang="ts" generics="LAnnotation = undefined">
	import { parseDiffFromFile } from '@pierre/diffs';
	import FileDiff from './FileDiff.svelte';
	import type { MultiFileDiffProps } from './types.js';

	let {
		oldFile,
		newFile,
		options,
		instance = $bindable(),
		...rest
	}: MultiFileDiffProps<LAnnotation> = $props();

	const fileDiff = $derived(parseDiffFromFile(oldFile, newFile, options?.parseDiffOptions));
</script>

<FileDiff {...rest} {fileDiff} {options} bind:instance />
