import { getContext, setContext } from 'svelte';
import type { Virtualizer } from '@pierre/diffs';
import type { EditorFactory } from '@pierre/diffs/edit';
import type { WorkerPoolManager } from '@pierre/diffs/worker';

const WORKER_POOL_KEY = Symbol('diffs-worker-pool');
const VIRTUALIZER_KEY = Symbol('diffs-virtualizer');
const EDITOR_FACTORY_KEY = Symbol('diffs-editor-factory');

export function setWorkerPool(manager: WorkerPoolManager | undefined): void {
	setContext(WORKER_POOL_KEY, manager);
}

export function getWorkerPool(): WorkerPoolManager | undefined {
	return getContext<WorkerPoolManager | undefined>(WORKER_POOL_KEY);
}

export function setVirtualizer(virtualizer: Virtualizer | undefined): void {
	setContext(VIRTUALIZER_KEY, virtualizer);
}

/** The `Virtualizer` from the nearest `<Virtualizer>`, if any. */
export function getVirtualizer(): Virtualizer | undefined {
	return getContext<Virtualizer | undefined>(VIRTUALIZER_KEY);
}

// `any`: one provider serves components with any annotation or caret type.
export function setEditorFactory(factory: EditorFactory<any, any> | undefined): void {
	setContext(EDITOR_FACTORY_KEY, factory);
}

/** The editor factory from the nearest `<EditProvider>`, if any. */
export function getEditorFactory<LAnnotation = undefined, Caret = undefined>():
	| EditorFactory<LAnnotation, Caret>
	| undefined {
	return getContext<EditorFactory<LAnnotation, Caret> | undefined>(EDITOR_FACTORY_KEY);
}
