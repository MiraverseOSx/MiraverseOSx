# Additional Miraverse tools

Added locally October 24, 2026. These extend the React desktop; Phaser and existing
gameplay, institutional permissions, and compensation rules are unchanged.

## React Flow: acquired-evidence board

Open the Broad Street assignment, acknowledge its briefing, acquire sources in
their original apps, then open the DGAOS evidence notebook. Its evidence board
shows only acquired sources. Move cards, connect their handles, and reopen the
original source from its card.

For keyboard use, select From and To, enter a connection note, and choose Connect
sources. Connections are player hypotheses, not accepted findings or report
citations. Remove a link from the textual list or select an edge and press Delete.
Source cards cannot be deleted from the board.

Dragging and connecting save automatically. After moving cards with keyboard
controls, use Save board positions. Positions and links are stored inside the
existing work order's `caseProgress.board`, so they travel with existing player
saves. Older progress gains an empty board without replacing reports, reviews,
or receipts. Current access and an active briefed order are required to edit;
completed cases are read-only. Board actions issue no rewards and do not change
report-review acceptance.

## dnd kit: MAI.SPACE sorting

- Customize → Layer order: drag profile sections into a new overlap order.
  This preserves their freeform coordinates and existing undo/publish workflow.
- Friends → My Top 8: when at least two friends are featured, reorder them with
  the handles. Existing friendship and privacy checks still apply.
- Focus a handle, press Space, move with arrow keys, and press Space to drop.
  Escape cancels. Screen-reader announcements describe pickup and movement.

The original canvas movement/resize tools and arrow controls remain available.

## MiniSearch: offline public search

VerseNet's public catalog supports prefix, multiword, and typo-tolerant matches.
The Broad Street maintenance publication uses its separate public data file.
Private case bodies and answer rules are not imported into this index. Archive
access is filtered before indexing. Search does not call a web or AI service.
Generated reading collections and existing external links retain their routes.

## Storybook: component workshop

From the repository root:

```powershell
npm run storybook
npm run build:storybook
```

The development workshop runs at `http://localhost:6006`. It contains shared
controls, a reading card, window chrome, sortable modules, and acquired/empty/
read-only board examples. Toolbar controls switch light/dark and compact/
comfortable previews. Accessibility inspection is available through the a11y
addon; its presence does not mean every story has passed a full accessibility
audit.

Preview fixtures use in-memory data and do not connect to player saves or the
world API. The Storybook build writes to ignored `frontend/storybook-static`,
not the game's `wwwroot`. Telemetry is disabled in the Storybook configuration.

## Playwright: isolated browser checks

```powershell
npm run test:e2e
```

Tests start their own Vite server on port 4174 and component workshop on port
6006. Keep those ports free. Each test uses a fresh, disposable browser context.
The real world API is intercepted, and external HTTPS requests are blocked.
No existing browser profile or player database is used. Tests exercise the
game's existing local administrator login only inside these disposable worlds.

Checks cover application startup, maximize, settings after reload, responsive
window visibility, keyboard profile sorting and draft restoration, board
connections and original-source buttons, and acquiring Broad Street sources
across WORKNET, VAULT, and DGAOS with board restoration after reload.

The headless Chromium runtime was installed locally. On a fresh machine:

```powershell
cd frontend
npx playwright install chromium --only-shell
```

Reports and traces are written to ignored `frontend/playwright-report` and
`frontend/test-results`. Run `npx playwright show-report` from `frontend` to inspect
the report. Unit/content tests remain separate:

```powershell
npm test --prefix frontend
npm run test:case
npm run test:fiction
npm run build:frontend
```

No GitHub operations or publishing are part of this setup.
