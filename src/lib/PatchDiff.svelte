<script lang="ts" generics="LAnnotation = undefined">
	import { getSingularPatch } from '@pierre/diffs';
	import FileDiff from './FileDiff.svelte';
	import type { PatchDiffProps } from './types.js';

	let { patch, instance = $bindable(), ...rest }: PatchDiffProps<LAnnotation> = $props();

	const fileDiff = $derived(getSingularPatch(patch));
</script>

<FileDiff {...rest} {fileDiff} bind:instance />
