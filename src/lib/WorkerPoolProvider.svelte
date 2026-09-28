<script lang="ts" module>
	let instanceCount = 0;
</script>

<script lang="ts">
	import { onDestroy, untrack, type Snippet } from 'svelte';
	import {
		getOrCreateWorkerPoolSingleton,
		terminateWorkerPoolSingleton,
		type WorkerInitializationRenderOptions,
		type WorkerPoolOptions
	} from '@pierre/diffs/worker';
	import { setWorkerPool } from './context.js';

	interface Props {
		poolOptions: WorkerPoolOptions;
		highlighterOptions: WorkerInitializationRenderOptions;
		children: Snippet;
	}

	let { poolOptions, highlighterOptions, children }: Props = $props();

	// Created once, like the React provider; later prop changes are ignored.
	const pool =
		typeof window === 'undefined'
			? undefined
			: untrack(() => getOrCreateWorkerPoolSingleton({ poolOptions, highlighterOptions }));

	setWorkerPool(pool);

	if (pool != null) {
		instanceCount++;
		onDestroy(() => {
			if (--instanceCount === 0) terminateWorkerPoolSingleton();
		});
	}
</script>

{@render children()}
