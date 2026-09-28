#!/usr/bin/env bash
# Packs the library, installs the tarball into a clean consumer project, and
# type-checks a component that uses it. Pass --pack-destination DIR to keep
# the tarball; otherwise it goes to a temporary directory.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

PACK_DIR="$TMP_DIR/pack"
if [[ "${1:-}" == "--pack-destination" ]]; then
	PACK_DIR="$(mkdir -p "$2" && cd "$2" && pwd)"
fi
CONSUMER_DIR="$TMP_DIR/consumer"
mkdir -p "$PACK_DIR" "$CONSUMER_DIR/src"

cd "$REPO_ROOT"
pnpm build
pnpm pack --pack-destination "$PACK_DIR" >/dev/null
TARBALL="$(ls "$PACK_DIR"/diffs-svelte-*.tgz)"
echo "Packed $(basename "$TARBALL")"

# Only the library ships: no docs site, skill, or scripts.
if tar -tzf "$TARBALL" | grep -vE '^package/(dist/|package\.json$|README\.md$|LICENSE$)'; then
	echo 'Unexpected files in the tarball (listed above)' >&2
	exit 1
fi

cd "$CONSUMER_DIR"
cat > package.json <<'EOF'
{ "name": "consumer", "private": true, "type": "module" }
EOF
cat > tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src"]
}
EOF
cat > src/App.svelte <<'EOF'
<script lang="ts">
  import {
    File,
    FileDiff,
    MultiFileDiff,
    PatchDiff,
    WorkerPoolProvider,
    type DiffLineAnnotation,
    type FileDiffMetadata
  } from 'diffs-svelte';
  import { parseDiffFromFile } from '@pierre/diffs';

  const oldFile = { name: 'a.ts', contents: 'const a = 1;\n' };
  const newFile = { name: 'a.ts', contents: 'const a = 2;\n' };
  const fileDiff: FileDiffMetadata = parseDiffFromFile(oldFile, newFile);
  const notes: DiffLineAnnotation<{ body: string }>[] = [
    { side: 'additions', lineNumber: 1, metadata: { body: 'ok' } }
  ];
</script>

<WorkerPoolProvider poolOptions={{ workerFactory: () => new Worker('w.js') }} highlighterOptions={{}}>
  <MultiFileDiff {oldFile} {newFile} lineAnnotations={notes} options={{ diffStyle: 'split' }}>
    {#snippet annotation(note)}<p>{note.metadata.body}</p>{/snippet}
  </MultiFileDiff>
  <PatchDiff patch="" />
  <FileDiff {fileDiff} />
  <File file={newFile} />
</WorkerPoolProvider>
EOF

SVELTE="$(node -p "require('$REPO_ROOT/node_modules/svelte/package.json').version")"
DIFFS="$(node -p "require('$REPO_ROOT/node_modules/@pierre/diffs/package.json').version")"
npm install --no-audit --no-fund --loglevel=error \
	"$TARBALL" "svelte@$SVELTE" "@pierre/diffs@$DIFFS" svelte-check typescript
npx svelte-check --tsconfig ./tsconfig.json --fail-on-warnings
echo 'Pack smoke test passed.'
