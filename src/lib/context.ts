import { getContext, setContext } from 'svelte';
import type { WorkerPoolManager } from '@pierre/diffs/worker';

const KEY = Symbol('diffs-worker-pool');

export function setWorkerPool(manager: WorkerPoolManager | undefined): void {
	setContext(KEY, manager);
}

export function getWorkerPool(): WorkerPoolManager | undefined {
	return getContext<WorkerPoolManager | undefined>(KEY);
}
