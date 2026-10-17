# Refined celestial visual direction

The desktop uses ink blue, lilac, warm white, and soft glass. Application content
uses light surfaces with darker text. Reserve serif typography for editorial
headlines and lore; controls, window titles, and small labels use Segoe UI.

## Shared foundations

| Role | Token | Value |
| --- | --- | --- |
| Primary ink | `--mira-ink` | `#24324b` |
| Supporting text | `--mira-muted` | `#606b80` |
| Paper | `--mira-paper` | `#fcfbff` |
| Canvas | `--mira-canvas` | `#f3f3f9` |
| Divider | `--mira-line` | `#e3e3ee` |
| Main accent | `--mira-lilac` | `#7c639f` |
| Recovery accent | `--mira-sage` | `#377668` |

Tokens live in `frontend/src/styles/tokens.css`. Shared visual primitives live in
`frontend/src/styles/visual-system.css`.

- `AppGlyph` wraps Lucide symbols in the same illustrated tile across shortcuts,
  the dock, Orbit, and window headers. Use its small, medium, and large sizes.
- `CelestialScene` supplies local SVG orbital artwork with unique gradient IDs.
  It is decorative, scales without raster assets, and requires no remote service.
- `Window` supplies shared app chrome, focus states, window controls, and space
  for the desktop menu and dock. Its entrance respects reduced motion.
- `.mira-button` and `.mira-button--primary` are the common action styles.
  Existing Button, Input, and Card primitives use the same palette.

## Implemented surfaces

The desktop, Orbit launcher, dock, and all window frames use the shared visual
language. VITALS is the reference app: a circular aura gauge, separate world
exposure panel, explicit condition labels, and a visible recovery action area.
Status is conveyed with text as well as color.

The main desktop has no app shortcut row or large launcher button. App access
remains in the dock and through Ctrl/⌘+Space. A fixed top-right widget column
shows the local clock and gameplay cycle, aura and conditions, and pending
Notice Board directives. Widgets open existing apps and do not award rewards.
On narrow screens they flow below the introduction, with desktop scrolling and
bottom padding to keep the last action clear of the dock.

At narrow widths, the desktop centers its introduction, Orbit stacks its panels,
and VITALS becomes one column. On shorter desktop screens, VITALS and the Orbit
inspector use compact spacing to keep their main actions available. These
layouts were checked at 1280 × 720 and 390 × 844.

Other app interiors retain their existing layouts for subsequent visual passes.
Use the shared tokens and primitives when updating them rather than introducing
another palette or icon treatment. Keep document and forensic graphics distinct
from decorative celestial artwork.
