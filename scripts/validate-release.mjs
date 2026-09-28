// Checks that a release tag is strict SemVer, points at HEAD, and matches the
// version in package.json. Pass the tag as the first argument, or let CI set
// GITHUB_REF_NAME. Run with --self-test to check the SemVer grammar.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const numeric = '0|[1-9]\\d*';
const preIdent = `(?:${numeric}|\\d*[a-zA-Z-][0-9a-zA-Z-]*)`;
const buildIdent = '[0-9a-zA-Z-]+';
const SEMVER_TAG = new RegExp(
	`^v(${numeric})\\.(${numeric})\\.(${numeric})` +
		`(?:-(${preIdent}(?:\\.${preIdent})*))?` +
		`(?:\\+(${buildIdent}(?:\\.${buildIdent})*))?$`
);

function fail(message) {
	console.error(message);
	process.exit(1);
}

if (process.argv[2] === '--self-test') {
	const valid = ['v0.0.0', 'v1.2.3', 'v0.10.0-rc.1', 'v1.0.0-alpha-01', 'v1.0.0-0.1.2', 'v1.0.0+01'];
	const invalid = ['1.2.3', 'v1.2', 'v1.2.3.4', 'v01.2.3', 'v1.2.3-', 'v1.2.3-01', 'v1.2.3-rc..1'];
	for (const tag of valid) if (!SEMVER_TAG.test(tag)) fail(`Expected ${tag} to be valid`);
	for (const tag of invalid) if (SEMVER_TAG.test(tag)) fail(`Expected ${tag} to be invalid`);
	console.log('SemVer self-test passed.');
	process.exit(0);
}

const tag = process.argv[2] ?? process.env.GITHUB_REF_NAME;
if (!tag) fail('Usage: node scripts/validate-release.mjs <tag>');
if (!SEMVER_TAG.test(tag)) fail(`Tag ${tag} is not strict SemVer, such as v1.2.3 or v1.2.3-rc.1`);

const tagsAtHead = execFileSync('git', ['tag', '--points-at', 'HEAD'], { encoding: 'utf8' })
	.split('\n')
	.filter(Boolean);
if (!tagsAtHead.includes(tag)) {
	fail(`Tag ${tag} does not point at HEAD (tags at HEAD: ${tagsAtHead.join(', ') || 'none'})`);
}

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const version = tag.slice(1);
if (manifest.version !== version) {
	fail(`package.json version ${manifest.version} does not match tag ${tag}`);
}
if (manifest.private === true) fail('package.json is private and cannot be published');
if (manifest.publishConfig?.provenance !== true) fail('package.json must set publishConfig.provenance');

console.log(`Tag ${tag} is valid and matches package.json.`);
