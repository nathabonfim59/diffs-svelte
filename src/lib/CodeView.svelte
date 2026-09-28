<script lang="ts" generics="LAnnotation = undefined, Caret = undefined">
	import { flushSync, getAllContexts, mount, unmount, untrack, type Snippet } from 'svelte';
	import {
		CodeView as CodeViewRenderer,
		areOptionsEqual,
		type CodeViewCoordinator,
		type CodeViewItem,
		type CodeViewItemEditCompleteHandler,
		type CodeViewLineSelection,
		type CodeViewOptions,
		type CodeViewRenderedItem,
		type CodeViewScrollTarget,
		type CodeViewSlotSnapshot
	} from '@pierre/diffs';
	import type { Editor, EditorFactory } from '@pierre/diffs/edit';
	import { getEditorFactory, getWorkerPool } from './context.js';
	import CodeViewItemSlots, { type ItemSnippets } from './internal/CodeViewItemSlots.svelte';
	import SnippetHost from './internal/SnippetHost.svelte';
	import { noopRender } from './internal/options.js';
	import type { CodeViewProps } from './types.js';

	let {
		items,
		initialItems,
		options,
		editorOptions,
		getEditStateKey,
		disableWorkerPool = false,
		selectedLines,
		onSelectedLinesChange,
		onScroll,
		onItemEditChange,
		onItemEditComplete,
		codeViewHeader,
		codeViewFooter,
		header,
		headerPrefix,
		headerFilenameSuffix,
		headerMetadata,
		annotation,
		gutterUtility,
		class: className,
		style,
		container = $bindable(),
		instance = $bindable()
	}: CodeViewProps<LAnnotation, Caret> = $props();

	type Options = CodeViewOptions<LAnnotation, Caret>;
	const noopHost = () => undefined;
	type Snapshot = CodeViewSlotSnapshot<LAnnotation, Caret>;

	const controlled = untrack(() => items !== undefined);
	const workerPool = getWorkerPool();
	const editorFactory = getEditorFactory<LAnnotation, Caret>();
	const context = getAllContexts();

	let viewer = $state.raw<CodeViewRenderer<LAnnotation, Caret>>();
	let lastItems: CodeViewItem<LAnnotation>[] | undefined;
	let lastOptions: Options | undefined;
	let inEffect = false;

	// Stable wrappers, so new callback props don't count as an options change.
	const emitSelectedLinesChange = (selection: CodeViewLineSelection | null) =>
		onSelectedLinesChange?.(selection);
	const emitEditStateKey = (item: CodeViewItem<LAnnotation>) => getEditStateKey?.(item);
	const emitItemEditChange: NonNullable<Options['onItemEditChange']> = (event, item) =>
		onItemEditChange?.(event, item);
	const emitItemEditComplete = ((event, item, nextItem) =>
		onItemEditComplete?.(event, item, nextItem) ??
		'reject') as CodeViewItemEditCompleteHandler<LAnnotation, Caret>;
	const createEditor = ((type, editorOpts, editStateKey) =>
		(editorFactory as EditorFactory<LAnnotation, Caret>)(
			type,
			{ ...editorOptions, ...editorOpts } as typeof editorOpts,
			editStateKey
		)) as NonNullable<Options['createEditor']>;

	const managedOptions = $derived.by(() => {
		const managed: Options = {
			...options,
			controlledSelection: selectedLines !== undefined,
			onSelectedLinesChange: onSelectedLinesChange != null ? emitSelectedLinesChange : undefined,
			createEditor: editorFactory != null ? createEditor : undefined
		};
		if (getEditStateKey != null) managed.getEditStateKey = emitEditStateKey;
		if (onItemEditChange != null) managed.onItemEditChange = emitItemEditChange;
		if (onItemEditComplete != null) managed.onItemEditComplete = emitItemEditComplete;
		if (header != null) managed.renderCustomHeader = noopRender;
		if (gutterUtility != null) {
			managed.renderGutterUtility = noopRender;
			managed.enableGutterUtility = options?.enableGutterUtility ?? true;
		}
		if (codeViewHeader != null) managed.renderCodeViewHeader = noopHost;
		if (codeViewFooter != null) managed.renderCodeViewFooter = noopHost;
		return managed;
	});

	const snippets: ItemSnippets<LAnnotation, Caret> = {
		get header() {
			return header;
		},
		get headerPrefix() {
			return headerPrefix;
		},
		get headerFilenameSuffix() {
			return headerFilenameSuffix;
		},
		get headerMetadata() {
			return headerMetadata;
		},
		get annotation() {
			return annotation;
		},
		get gutterUtility() {
			return gutterUtility;
		}
	};

	const hasHeaderRenderers = $derived(
		header != null || headerPrefix != null || headerFilenameSuffix != null || headerMetadata != null
	);
	const coordinator = $derived.by((): CodeViewCoordinator<LAnnotation, Caret> | undefined => {
		const hasAnnotationRenderer = annotation != null;
		const hasGutterRenderer = gutterUtility != null;
		if (
			!hasHeaderRenderers &&
			!hasAnnotationRenderer &&
			!hasGutterRenderer &&
			codeViewHeader == null &&
			codeViewFooter == null
		) {
			return undefined;
		}
		return {
			hasHeaderRenderers,
			hasAnnotationRenderer,
			hasGutterRenderer,
			onSnapshotChange: publishSnapshot
		};
	});

	// The core creates, recycles, and moves item elements as you scroll, so
	// slot content is mounted into them imperatively instead of rendered here.
	interface MountedItem {
		element: HTMLElement;
		component: object;
		update(rendered: CodeViewRenderedItem<LAnnotation, Caret>): void;
	}
	const mountedItems = new Map<string, MountedItem>();
	const mountedHosts = new Map<'header' | 'footer', { element: HTMLElement; component: object }>();

	function mountItem(initial: CodeViewRenderedItem<LAnnotation, Caret>): MountedItem {
		let rendered = $state.raw(initial);
		const component = mount(CodeViewItemSlots<LAnnotation, Caret>, {
			target: initial.element,
			context,
			props: {
				get rendered() {
					return rendered;
				},
				snippets
			}
		});
		return { element: initial.element, component, update: (next) => (rendered = next) };
	}

	function syncHost(key: 'header' | 'footer', element: HTMLElement | undefined) {
		const current = mountedHosts.get(key);
		if (current?.element === element) return;
		if (current != null) unmount(current.component);
		mountedHosts.delete(key);
		if (element == null) return;
		const component = mount(SnippetHost, {
			target: element,
			context,
			props: {
				get children(): Snippet | undefined {
					return key === 'header' ? codeViewHeader : codeViewFooter;
				}
			}
		});
		mountedHosts.set(key, { element, component });
	}

	function applySnapshot(snapshot: Snapshot | undefined) {
		const seen = new Set<string>();
		for (const rendered of snapshot?.items ?? []) {
			seen.add(rendered.id);
			const current = mountedItems.get(rendered.id);
			if (current?.element === rendered.element) {
				current.update(rendered);
				continue;
			}
			if (current != null) unmount(current.component);
			mountedItems.set(rendered.id, mountItem(rendered));
		}
		for (const [id, current] of mountedItems) {
			if (seen.has(id)) continue;
			unmount(current.component);
			mountedItems.delete(id);
		}
		syncHost('header', codeViewHeader != null ? snapshot?.header : undefined);
		syncHost('footer', codeViewFooter != null ? snapshot?.footer : undefined);
	}

	// The core measures item heights right after this, so slot content has to
	// be in the DOM before it returns.
	function publishSnapshot(snapshot: Snapshot | undefined) {
		applySnapshot(snapshot);
		if (!inEffect) flushSync();
	}

	function setup(node: HTMLDivElement) {
		const v = untrack(
			() =>
				new CodeViewRenderer<LAnnotation, Caret>(
					managedOptions,
					disableWorkerPool ? undefined : workerPool,
					true
				)
		);
		v.setup(node);
		container = node;
		viewer = v;
		return () => {
			v.cleanUp();
			applySnapshot(undefined);
			lastItems = undefined;
			lastOptions = undefined;
			viewer = undefined;
			container = undefined;
		};
	}

	$effect(() => {
		instance = viewer;
	});

	$effect(() => {
		if (viewer == null || onScroll == null) return;
		const listener = onScroll;
		return viewer.subscribeToScroll((scrollTop, v) => listener(scrollTop, v));
	});

	function isPrefix(prev: readonly unknown[], next: readonly unknown[]) {
		for (let index = 0; index < prev.length; index++) if (prev[index] !== next[index]) return false;
		return true;
	}

	$effect(() => {
		const v = viewer;
		if (v == null) return;
		const nextOptions = managedOptions;
		const nextCoordinator = coordinator;
		const nextSelection = selectedLines;
		// Copy so pushes onto a $state array are seen as changes too.
		const nextItems = items !== undefined ? [...items] : undefined;

		untrack(() => {
			inEffect = true;
			try {
				let shouldRender = false;
				if (!areOptionsEqual(nextOptions, lastOptions)) {
					lastOptions = nextOptions;
					v.setOptions(nextOptions);
					shouldRender = true;
				}
				if ((nextItems !== undefined) !== controlled) {
					console.error(
						'CodeView: cannot switch between `items` and `initialItems`. Remount it with {#key} instead.'
					);
				} else if (nextItems !== undefined) {
					const prev = lastItems;
					lastItems = nextItems;
					if (prev != null && prev.length === nextItems.length && isPrefix(prev, nextItems)) {
						// Same items.
					} else if (prev != null && nextItems.length > prev.length && isPrefix(prev, nextItems)) {
						v.addItems(nextItems.slice(prev.length));
					} else {
						v.setItems(nextItems);
						shouldRender = true;
					}
				} else if (lastItems == null) {
					const seed = initialItems ?? [];
					lastItems = [...seed];
					if (seed.length > 0) {
						v.setItems(seed);
						shouldRender = true;
					}
				}
				if (nextSelection !== undefined) v.setSelectedLines(nextSelection, { notify: false });
				const slotPublish = v.setSlotCoordinator(nextCoordinator);
				if (shouldRender || slotPublish) v.render(true);
				if (slotPublish && nextCoordinator == null) applySnapshot(undefined);
			} finally {
				inEffect = false;
			}
		});
	});

	function requireViewer(action: string) {
		if (viewer == null) throw new Error(`CodeView.${action}: the viewer is not mounted yet`);
		return viewer;
	}

	function assertUncontrolled(action: string) {
		if (controlled) {
			throw new Error(
				`CodeView.${action} does not work with \`items\`. Use \`initialItems\` to manage items with methods.`
			);
		}
	}

	export function addItems(newItems: readonly CodeViewItem<LAnnotation>[]): void {
		assertUncontrolled('addItems');
		requireViewer('addItems').addItems(newItems);
	}

	export function getItem(id: string): CodeViewItem<LAnnotation> | undefined {
		return viewer?.getItem(id);
	}

	export function removeItem(id: string): boolean {
		assertUncontrolled('removeItem');
		return requireViewer('removeItem').removeItem(id);
	}

	export function updateItem(item: CodeViewItem<LAnnotation>): boolean {
		assertUncontrolled('updateItem');
		return requireViewer('updateItem').updateItem(item);
	}

	export function updateItemId(oldId: string, newId: string): boolean {
		assertUncontrolled('updateItemId');
		return requireViewer('updateItemId').updateItemId(oldId, newId);
	}

	export function scrollTo(target: CodeViewScrollTarget): void {
		requireViewer('scrollTo').scrollTo(target);
	}

	export function setSelectedLines(selection: CodeViewLineSelection | null): void {
		requireViewer('setSelectedLines').setSelectedLines(selection, { notify: false });
		emitSelectedLinesChange(selection);
	}

	export function getSelectedLines(): CodeViewLineSelection | null {
		return viewer?.getSelectedLines() ?? null;
	}

	export function clearSelectedLines(): void {
		requireViewer('clearSelectedLines').clearSelectedLines({ notify: false });
		emitSelectedLinesChange(null);
	}

	export function getEditor(
		id: string
	): Editor<'file', LAnnotation, Caret> | Editor<'file-diff', LAnnotation, Caret> | undefined {
		return viewer?.getEditor(id);
	}

	export function getInstance(): CodeViewRenderer<LAnnotation, Caret> | undefined {
		return viewer;
	}
</script>

<div {@attach setup} class={className} {style}></div>
