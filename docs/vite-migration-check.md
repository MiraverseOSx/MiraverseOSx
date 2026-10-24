# Vite migration compatibility check

## Precache correction follow-up

October 24, 2026: the offline plugin now runs its `generateBundle` hook with
`order: 'post'`, after CSS-only JavaScript placeholders are removed. The
regression fixture fails before this change and passes afterward. The rebuilt
Vite 6 production frontend has 61 valid precache entries covering 56 bundles.
An isolated browser check passed obsolete-cache removal, saved-session
restoration, offline reload, and DGAOS lazy loading with no runtime errors.
Frontend tests and the production build passed. No player saves were cleared;
the installed Vite version remains unchanged. Results are recorded in
`output/precache-audit-result.json`. The Vite 7/8 results below describe the
earlier unchanged-plugin audit; those migrations still need their remaining gates.

October 24, 2026. This is an isolated audit, not a toolchain upgrade or DGAOS repair.

## Result

The existing configuration compiles on Vite **6.4.5**, **7.3.7**, and **8.3.5**,
but its generated service worker fails the precache integrity check on all three.
An upgrade is not ready for acceptance until the offline manifest is corrected.

| Check | Vite 6.4.5 | Vite 7.3.7 | Vite 8.3.5 |
| --- | --- | --- | --- |
| Production compilation | Pass | Pass | Pass |
| DGAOS aliases resolve during build | Pass | Pass | Pass |
| Manifest imports and referenced files exist | Pass | Pass | Pass |
| Named Framer Motion and Lucide chunks | Present | Present | Present |
| Every worker precache entry exists | **Fail** | **Fail** | **Fail** |
| Installed React plugin declares peer support | Yes | Yes | **No** |

The browser/offline acceptance gate was not passed: the checker stops at the
missing resource before attempting the browser workflow. No claim is made that
native Photino runtime behavior or a live backend proxy passed migration tests.

## Confirmed offline blocker

Vite 6 and 7 generate this nonexistent precache entry:

```text
/assets/case-workspace-CvFoilM5.js
```

Vite 8 generates another nonexistent entry:

```text
/assets/case-workspace-C1Vy18Eo.js
```

The build manifests contain no unresolved imports or missing file references.
The problem is specifically the separately generated `sw.js` asset list. The
worker installs with `cache.addAll(PRECACHE)`, so a failed fetch for one of these
URLs can reject installation of the shell cache.

The likely ordering issue is that the custom `generateBundle` hook enumerates
JavaScript before Vite removes empty CSS-only chunks. The installed Vite source
contains a later CSS cleanup that deletes those chunks from the bundle. Test
generating the precache list after this cleanup before changing the main plugin.
The plugin and configuration have deliberately not been rewritten in this audit.

## Other findings

- The installed Node version, 24.21.0, satisfies the tested Vite 7/8 engine ranges.
- The installed `@vitejs/plugin-react` 4.7.0 declares Vite support through major 7.
  Its use with Vite 8 produces deprecated `esbuild` and
  `optimizeDeps.esbuildOptions` warnings even though compilation completes.
  Select a supported React plugin before accepting a Vite 8 migration.
- Vite 7 reports inconsistent JSON import attributes in existing modules. They
  are warnings in this build, but should be normalized as a migration follow-up.
- `build.outDir` remains `../wwwroot` in the real configuration, and the C#
  project still copies `wwwroot` into its output. Audit builds override only their
  output directory to avoid replacing the native frontend assets.
- The real `/api` proxy remains pointed at `http://localhost:5000`; it was
  inspected, not live-tested in this audit. No player world API was contacted.
- The manual chunk callback continues to produce the named vendor bundles in
  the tested Vite 8 build. Its function form is deprecated by the Vite migration
  guide, so later migration should consider the supported code-splitting API.
- The migration guide also changes default browser targets. A successful build
  does not establish that the actual Photino webview supports the chosen target.

## Reproduction

Run from `frontend`, retaining the real configuration:

```powershell
npm run build -- --outDir ../output/vite-compatibility/v6 --emptyOutDir --manifest
npm exec --yes --package=vite@7.3.7 -- vite build --outDir ../output/vite-compatibility/v7 --emptyOutDir --manifest
npm exec --yes --package=vite@8.3.5 -- vite build --outDir ../output/vite-compatibility/v8 --emptyOutDir --manifest
```

From the repository root:

```powershell
node scripts/check_vite_artifacts.mjs output/vite-compatibility/v7
node scripts/check_vite_artifacts.mjs output/vite-compatibility/v8
```

The checker validates precache paths, code/font coverage, vendor chunks, and build
manifest references. If those pass, it can run an isolated production browser
check for obsolete-cache cleanup, saved-session restoration, offline reload, and
DGAOS lazy loading. Its HTTP server returns 503 for `/api` and uses disposable
browser storage; it never connects to the live world database.

Build logs: `output/vite6-build-check.txt`, `output/vite7-build-check.txt`, and
`output/vite8-build-check.txt`. Artifact failure logs are in
`output/vite7-artifact-check.txt` and `output/vite8-artifact-check.txt`.
Generated builds and structural reports are under ignored
`output/vite-compatibility/`.

## Preserved state and next gates

`frontend/package.json`, its lockfile, `frontend/vite.config.js`, the offline
worker source, and production `wwwroot` were not changed by these audit commands.
Vite remains installed at 6.4.5. DGAOS repair remains cancelled.

Before upgrading: fix and retest the worker manifest ordering, validate a cache
update between releases, use a supported React plugin, exercise the proxy against
the backend, and launch the native host with the resulting frontend. Storybook
and the existing browser regression suite also need to pass on the selected
toolchain before a permanent migration.

References: [Vite 6 → 7 migration](https://v7.vite.dev/guide/migration),
[Vite 7 → 8 migration](https://vite.dev/guide/migration.html).
