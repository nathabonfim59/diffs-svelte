<script lang="ts" generics="LAnnotation = undefined, Caret = undefined">
	import type { Snippet } from 'svelte';
	import { Editor, type EditorFactory } from '@pierre/diffs/edit';
	import { setEditorFactory } from './context.js';

	interface Props {
		children: Snippet;
		/**
		 * Builds the editor for each edit session. Use it to share options
		 * across components. Defaults to `new Editor(type, options, key)`.
		 */
		createEditor?: EditorFactory<LAnnotation, Caret>;
	}

	let { children, createEditor }: Props = $props();

	const factory: EditorFactory<LAnnotation, Caret> = (type, options, editStateKey) =>
		createEditor != null
			? createEditor(type, options, editStateKey)
			: new Editor(type, options, editStateKey);

	setEditorFactory(factory);
</script>

{@render children()}
