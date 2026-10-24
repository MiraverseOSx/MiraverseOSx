# Universal design system: implementation review

Reviewed October 24, 2026 against the local source. This is a planning record,
not confirmation that the proposed universal styling has shipped.

The supplied [version 1 proposal](universal-design-system-v1-proposal.md) remains
design only. It preserves WORKNET's approved earthy appearance and MAI.SPACE's
profile customization. Existing runtime styles remain unchanged by this review.

## Existing foundations and gaps

| Area | Source evidence | Follow-up |
| --- | --- | --- |
| Shared tokens | `frontend/src/styles/tokens.css` defines colors, typography, and shared roles. | Map proposed semantic roles before changing existing token values; avoid global overrides of app palettes. |
| Fonts | Tokens currently use Segoe UI, Playfair Display, and Cascadia Code with fallbacks. | Inter, DM Serif Display, and IBM Plex Mono are proposed replacements, not installed or selected by this review. |
| Window behavior | `Window.tsx` shares accessible controls, dragging, reduced-motion handling, and responsive geometry. | Keep these behaviors; evaluate user resizing, persisted dimensions, and true fullscreen separately. |
| Window geometry | `windowGeometry.ts` fits normal windows to 16:9, capped at 1120px; maximized windows fill available dimensions. | Preserve edge-to-edge maximization. Do not force maximized windows to 16:9 and introduce gutters. |
| Appearance settings | `SettingsApp.tsx` exposes desktop palettes and wallpapers. | A shared Compact/Comfortable density control is additional work; it is not currently demonstrated by those controls. |
| WORKNET | Dedicated visual spec and local Light/Dark/System appearance already exist. | Preserve its approved tokens and mounted drafts when introducing OS-level inheritance. |
| Existing documentation | `docs/design-system.md` documents an earlier celestial direction. | Keep it as historical implementation context until the universal proposal is approved and migrated. |

## Unspecified design values

- The pasted “LightDark” section contains one neutral palette only. Dark-mode
  universal values must be defined before implementing universal theme switching.
- Heather, plum, sage, copper, and steel are named without exact accent values.
  These need explicit values and contrast validation; WORKNET values must not be
  silently substituted as OS-wide accents.
- New application palettes are directions, not approved complete token sets.
- Width caps apply to reading panels where appropriate, not the desktop or all
  multi-panel workspaces. Existing full-width tool layouts must remain usable.

## Proposed rollout order

1. Complete and review universal light/dark semantic colors and accent values.
2. Add persisted Compact/Comfortable density in Settings using shared spacing
   tokens; default Compact. Avoid shrinking text or targets below readable sizes.
3. Apply shared standards to title bars, buttons, fields, tabs, focus rings,
   status messages, dialogs, and reduced-motion behavior.
4. Migrate app interiors in small groups, maintaining explicit palette and theme
   boundaries for WORKNET, MAI.SPACE, institutional tools, and document readers.
5. Check normal/maximized layouts, narrow viewports, keyboard navigation,
   contrast, saved drafts, and cross-app case links after each migration.

This review changes documentation only. No runtime changes, save migrations,
GitHub operations, or production build are required for this documentation step.
