# Local game health check — October 24, 2026

This was a regression pass, not a full playthrough of every career and branch.

## Fixes

- Device appearance/density preferences now synchronize across open game tabs.
  The listener ignores unrelated storage keys, handles malformed/reset records,
  and unsubscribes on unmount. It does not import or replace gameplay saves.
- WORKNET shared components and keyboard focus use WORKNET's own palette even
  when its explicit appearance differs from the OS appearance.
- Fullscreen app windows cannot be dragged or inadvertently maximized by
  double-clicking their title bar. Browser-denied fullscreen still falls back
  to desktop maximization.
- Document reader state is scoped to the document revision. Switching records
  resets form fields and unlocked state rather than reusing the previous file's
  reader session. Stable rerenders preserve the current session.

## Checks

- Frontend suite and production build; results in `output/health-check-tests.txt`
  and `output/health-check-build.txt`.
- Python Broad Street package validation plus two case tests and two fictional
  content tests pass.
- Thirteen backend integration checks pass against an isolated temporary test
  database, without replacing the player's saved world.
- Localhost smoke check: VAULT restores existing Broad Street files; WORKNET and
  DGAOS finish loading alongside it without app error screens. The test tab's
  captured console error list is empty after these startups.

The production build retains its existing large-chunk advisory. This pass does
not establish that every app interior has a complete dark theme or that every
story path is free of bugs. No GitHub operations were performed.
