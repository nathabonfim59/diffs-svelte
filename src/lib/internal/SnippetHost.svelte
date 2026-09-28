<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet | undefined } = $props();
</script>

{@render children?.()}
