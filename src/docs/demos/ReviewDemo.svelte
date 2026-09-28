<script lang="ts">
	import { MultiFileDiff, type DiffLineAnnotation } from '$lib/index.js';
	import { configAfter, configBefore } from '../examples.js';
	import { baseOptions } from '../theme.svelte.js';

	type Comment = { author: string; body: string; draft?: boolean };
	type Side = 'additions' | 'deletions';

	let comments = $state.raw<DiffLineAnnotation<Comment>[]>([
		{
			side: 'additions',
			lineNumber: 9,
			metadata: { author: 'ana', body: 'Debug level keeps request logs out of production output.' }
		}
	]);

	function addDraft(side: Side, lineNumber: number) {
		const exists = comments.some(
			(c) => c.metadata.draft && c.side === side && c.lineNumber === lineNumber
		);
		if (exists) return;
		comments = [...comments, { side, lineNumber, metadata: { author: 'you', body: '', draft: true } }];
	}

	function save(target: DiffLineAnnotation<Comment>, body: string) {
		if (!body.trim()) return remove(target);
		comments = comments.map((c) => (c === target ? { ...c, metadata: { author: 'you', body } } : c));
	}

	function remove(target: DiffLineAnnotation<Comment>) {
		comments = comments.filter((c) => c !== target);
	}
</script>

<div class="frame">
	<MultiFileDiff
		oldFile={configBefore}
		newFile={configAfter}
		lineAnnotations={comments}
		options={baseOptions()}
	>
		{#snippet annotation(comment)}
			{#if comment.metadata.draft}
				<form
					class="comment"
					onsubmit={(e) => {
						e.preventDefault();
						save(comment, new FormData(e.currentTarget).get('body') as string);
					}}
				>
					<textarea name="body" rows="2" placeholder="Leave a comment" {@attach (el) => void requestAnimationFrame(() => el.focus({ preventScroll: true }))}
					></textarea>
					<div class="actions">
						<button type="button" onclick={() => remove(comment)}>Cancel</button>
						<button type="submit" class="primary">Comment</button>
					</div>
				</form>
			{:else}
				<div class="comment">
					<div class="meta">
						<b>{comment.metadata.author}</b>
						<button type="button" class="link" onclick={() => remove(comment)}>Delete</button>
					</div>
					<p>{comment.metadata.body}</p>
				</div>
			{/if}
		{/snippet}

		{#snippet gutterUtility(getHoveredLine)}
			<button
				class="gutter-add"
				aria-label="Add comment"
				onclick={() => {
					const line = getHoveredLine();
					if (line) addDraft(line.side, line.lineNumber);
				}}>+</button
			>
		{/snippet}
	</MultiFileDiff>
</div>

<style>
	.comment {
		margin: 6px 10px;
		padding: 10px 12px;
		font-family: var(--font-sans);
		font-size: 14px;
		color: var(--text);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
	}
	.meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	p {
		margin: 4px 0 0;
		white-space: pre-wrap;
	}
	textarea {
		box-sizing: border-box;
		width: 100%;
		font: inherit;
		color: inherit;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 6px 8px;
		resize: vertical;
	}
	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 6px;
		margin-top: 6px;
	}
	button {
		font: inherit;
		font-size: 13px;
		color: var(--text);
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 3px 10px;
		cursor: pointer;
	}
	button.primary {
		color: var(--accent-contrast);
		background: var(--accent);
		border-color: var(--accent);
	}
	button.link {
		border: none;
		background: none;
		color: var(--muted);
		padding: 0;
	}
	.gutter-add {
		width: 20px;
		height: 20px;
		padding: 0;
		line-height: 18px;
		font-size: 15px;
		color: var(--accent-contrast);
		background: var(--accent);
		border-color: var(--accent);
		border-radius: 5px;
	}
</style>
