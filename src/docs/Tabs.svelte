<script lang="ts" generics="T extends string">
	import type { Snippet } from 'svelte';

	let {
		tabs,
		active = $bindable(tabs[0]),
		label,
		children
	}: { tabs: readonly T[]; active?: T; label: string; children: Snippet<[T]> } = $props();
</script>

<div class="tabs" role="tablist" aria-label={label}>
	{#each tabs as tab (tab)}
		<button
			role="tab"
			aria-selected={active === tab}
			class:active={active === tab}
			onclick={() => (active = tab)}>{tab}</button
		>
	{/each}
</div>
<div role="tabpanel">
	{@render children(active)}
</div>

<style>
	.tabs {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 2px;
		padding: 3px;
		margin-bottom: 12px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 9px;
	}
	button {
		font: inherit;
		font-size: 14px;
		color: var(--muted);
		background: none;
		border: 1px solid transparent;
		border-radius: 6px;
		padding: 4px 12px;
		cursor: pointer;
	}
	button:hover {
		color: var(--text);
	}
	button.active {
		color: var(--text);
		background: var(--surface);
		border-color: var(--border);
	}
</style>
