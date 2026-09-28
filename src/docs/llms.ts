import { SITE_URL } from './examples.js';

// The agent skill is the single source for the plain-text docs.
const files = import.meta.glob<string>('../../skills/diffs-svelte/**/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

const SKILL = '../../skills/diffs-svelte/SKILL.md';

function stripFrontmatter(markdown: string): string {
	return markdown.replace(/^---\n[\s\S]*?\n---\n+/, '');
}

export const sections = [
	['overview', 'Overview'],
	['installation', 'Installation'],
	['agents', 'Build with agents'],
	['quick-start', 'Quick start'],
	['components', 'Components'],
	['props', 'Props'],
	['snippets', 'Snippets'],
	['annotations', 'Annotations and gutter'],
	['header', 'Header'],
	['selection', 'Line selection'],
	['options', 'Options'],
	['instance', 'Renderer instance'],
	['worker-pool', 'Worker pool'],
	['ssr', 'Server rendering'],
	['core-types', 'Core types'],
	['from-react', 'Coming from React'],
	['status', 'Not bound yet']
] as const;

export function llmsIndex(): string {
	const links = sections.map(([id, label]) => `- [${label}](${SITE_URL}/#${id})`).join('\n');
	return `# diffs-svelte

> Svelte 5 components for @pierre/diffs. MultiFileDiff, PatchDiff, FileDiff, and File render
> syntax-highlighted diffs and code files, with snippets for annotations, gutter controls, and
> headers.

## Docs

${links}

## Plain text

- [Full reference](${SITE_URL}/llms-full.txt): the agent skill and all of its references in one file

## Agent skill

Install with \`npx skills add nathabonfim59/diffs-svelte --skill diffs-svelte\`.
`;
}

export function llmsFull(): string {
	const references = Object.keys(files)
		.filter((path) => path !== SKILL)
		.sort()
		.map((path) => files[path].trim());
	return [stripFrontmatter(files[SKILL]).trim(), ...references].join('\n\n---\n\n') + '\n';
}
