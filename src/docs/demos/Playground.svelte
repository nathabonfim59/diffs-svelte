<script lang="ts">
	import { File, MultiFileDiff, type FileDiffOptions } from '$lib/index.js';
	import { routerAfter, routerBefore } from '../examples.js';
	import { ui } from '../theme.svelte.js';

	const themes = {
		pierre: { dark: 'pierre-dark', light: 'pierre-light' },
		github: { dark: 'github-dark', light: 'github-light' },
		vitesse: { dark: 'vitesse-dark', light: 'vitesse-light' },
		catppuccin: { dark: 'catppuccin-mocha', light: 'catppuccin-latte' },
		'rose-pine': { dark: 'rose-pine', light: 'rose-pine-dawn' }
	} as const;

	const choices = {
		diffStyle: ['split', 'unified'],
		diffIndicators: ['bars', 'classic', 'none'],
		lineDiffType: ['word-alt', 'word-line', 'word', 'char', 'none'],
		hunkSeparators: ['line-info', 'line-info-basic', 'metadata', 'simple'],
		overflow: ['scroll', 'wrap']
	} as const;

	type Choice<K extends keyof typeof choices> = (typeof choices)[K][number];

	let theme = $state<keyof typeof themes>('pierre');
	let diffStyle = $state<Choice<'diffStyle'>>('split');
	let diffIndicators = $state<Choice<'diffIndicators'>>('bars');
	let lineDiffType = $state<Choice<'lineDiffType'>>('word-alt');
	let hunkSeparators = $state<Choice<'hunkSeparators'>>('line-info');
	let overflow = $state<Choice<'overflow'>>('scroll');
	let disableBackground = $state(false);
	let disableLineNumbers = $state(false);
	let expandUnchanged = $state(false);

	const options = $derived<FileDiffOptions<undefined, undefined>>({
		theme: themes[theme],
		themeType: ui.mode,
		diffStyle,
		diffIndicators,
		lineDiffType,
		hunkSeparators,
		overflow,
		disableBackground,
		disableLineNumbers,
		expandUnchanged
	});

	// Show only what differs from the defaults.
	const source = $derived.by(() => {
		const lines = [`  theme: { dark: '${themes[theme].dark}', light: '${themes[theme].light}' },`];
		if (diffStyle !== 'split') lines.push(`  diffStyle: '${diffStyle}',`);
		if (diffIndicators !== 'bars') lines.push(`  diffIndicators: '${diffIndicators}',`);
		if (lineDiffType !== 'word-alt') lines.push(`  lineDiffType: '${lineDiffType}',`);
		if (hunkSeparators !== 'line-info') lines.push(`  hunkSeparators: '${hunkSeparators}',`);
		if (overflow !== 'scroll') lines.push(`  overflow: '${overflow}',`);
		if (disableBackground) lines.push('  disableBackground: true,');
		if (disableLineNumbers) lines.push('  disableLineNumbers: true,');
		if (expandUnchanged) lines.push('  expandUnchanged: true,');
		return `<MultiFileDiff\n  {oldFile}\n  {newFile}\n  options={{\n${lines.map((l) => '  ' + l).join('\n')}\n  }}\n/>\n`;
	});
</script>

<div class="controls">
	<label>
		<span>theme</span>
		<select bind:value={theme}>
			{#each Object.keys(themes) as name (name)}<option>{name}</option>{/each}
		</select>
	</label>
	<label>
		<span>diffStyle</span>
		<select bind:value={diffStyle}>
			{#each choices.diffStyle as v (v)}<option>{v}</option>{/each}
		</select>
	</label>
	<label>
		<span>diffIndicators</span>
		<select bind:value={diffIndicators}>
			{#each choices.diffIndicators as v (v)}<option>{v}</option>{/each}
		</select>
	</label>
	<label>
		<span>lineDiffType</span>
		<select bind:value={lineDiffType}>
			{#each choices.lineDiffType as v (v)}<option>{v}</option>{/each}
		</select>
	</label>
	<label>
		<span>hunkSeparators</span>
		<select bind:value={hunkSeparators}>
			{#each choices.hunkSeparators as v (v)}<option>{v}</option>{/each}
		</select>
	</label>
	<label>
		<span>overflow</span>
		<select bind:value={overflow}>
			{#each choices.overflow as v (v)}<option>{v}</option>{/each}
		</select>
	</label>
	<label class="check"><input type="checkbox" bind:checked={disableBackground} /> disableBackground</label>
	<label class="check"><input type="checkbox" bind:checked={disableLineNumbers} /> disableLineNumbers</label>
	<label class="check"><input type="checkbox" bind:checked={expandUnchanged} /> expandUnchanged</label>
</div>

<div class="frame">
	<MultiFileDiff oldFile={routerBefore} newFile={routerAfter} {options} />
</div>

<div class="frame">
	<File
		file={{ name: 'Playground.svelte', contents: source }}
		options={{ theme: themes[theme], themeType: ui.mode, disableLineNumbers: true }}
	/>
</div>

<style>
	.controls {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 10px 14px;
		margin-bottom: 14px;
		padding: 14px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 13px;
	}
	label span {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--muted);
	}
	label.check {
		flex-direction: row;
		align-items: center;
		gap: 6px;
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--muted);
	}
	select {
		font: inherit;
		color: var(--text);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 4px 6px;
	}
	input {
		accent-color: var(--accent);
	}
</style>
