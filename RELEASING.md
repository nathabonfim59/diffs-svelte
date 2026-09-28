# Releasing

Pushing a `v*.*.*` tag runs `.github/workflows/release.yml`. The workflow has three jobs:

1. `validate` checks that the tag is strict SemVer, points at the tagged commit, and matches the
   `package.json` version. It then type-checks, builds, and packs the library, and installs the
   tarball into a clean project to type-check a component that uses it.
2. `npm` publishes that exact tarball with npm trusted publishing, so no npm token is stored in
   GitHub. npm adds a provenance statement that links the version to the workflow run. A tag with
   a prerelease part, such as `v0.2.0-rc.1`, publishes under the `next` dist-tag. Every other tag
   publishes under `latest`.
3. `github-release` creates a GitHub release for the tag, with generated notes and the tarball
   attached. Prereleases are marked as such.

## Cut a release

```sh
git switch main && git pull
npm version 0.2.0 --no-git-tag-version   # or edit "version" in package.json
git commit -am "Release v0.2.0"
git tag -s v0.2.0 -m v0.2.0              # -a works too if you don't sign tags
git push origin main v0.2.0
```

To check a tag locally before pushing it, run `pnpm release:check v0.2.0`. Once the jobs finish,
confirm the version with `npm view diffs-svelte`.

## One-time setup

npm lets you add a trusted publisher only to a package that already exists, so the first version
has to come from your machine. Publish a throwaway prerelease so `0.1.0` can still go out through
the workflow:

```sh
npm login
npm view diffs-svelte                     # 404 means the name is still free
pnpm install --frozen-lockfile && pnpm build
TMP=$(mktemp -d) && cp -R package.json README.md LICENSE dist "$TMP"
npm --prefix "$TMP" version 0.0.0-bootstrap.0 --no-git-tag-version
node -e "const f='$TMP/package.json',p=require(f);delete p.publishConfig.provenance;require('fs').writeFileSync(f,JSON.stringify(p,null,2))"
npm publish "$TMP" --access public --tag bootstrap --ignore-scripts
```

The copy drops `publishConfig.provenance` because npm only generates provenance in supported CI,
and that field overrides `NPM_CONFIG_PROVENANCE`.

Next, on npmjs.com, open the settings for `diffs-svelte` and add a GitHub Actions trusted
publisher with these values. They are case-sensitive.

| Setting | Value |
| --- | --- |
| Organization or user | `nathabonfim59` |
| Repository | `diffs-svelte` |
| Workflow filename | `release.yml` |
| Environment | `npm` |

In the GitHub repository settings, create an environment named `npm`. Limit it to tags matching
`v*.*.*`, and add yourself as a required reviewer if you want to approve each publish. The
environment needs no secrets.

After the first tagged release succeeds, go to the package settings on npm. Require two-factor
authentication and disallow tokens for publishing. Then mark the bootstrap version as deprecated:

```sh
npm deprecate diffs-svelte@0.0.0-bootstrap.0 "Placeholder used to set up publishing"
```
