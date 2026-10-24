# Universal design system implementation

Implemented locally October 24, 2026 following approval of the proposal, with
the user's typography amendment: **Times New Roman is the default body font**.
The supplied proposal and its earlier review remain historical planning records.

## Available now

- Settings → Appearance → Interface & reading exposes Light, Dark, and System
  appearance, plus Compact and Comfortable density. Compact is the default.
- Preferences persist per browser/device in `miraverse-interface-v1`; missing,
  invalid, or unavailable storage falls back safely. These preferences are
  independent of player saves, employment records, rewards, and permissions.
- Times New Roman, Times, Georgia, serif is the prose stack. No font downloads
  are required. Interface labels and controls use the existing sans-serif stack;
  technical records retain monospace. MAI.SPACE profile typography is excluded
  from the shared prose override, and existing formatted text is not rewritten.
- Shared window frames and desktop bars use 42px heights in Compact and 48px in
  Comfortable. Normal windows retain 16:9 sizing; maximized windows fill the
  available desktop without aspect-ratio gutters.
- Window controls include browser fullscreen where the browser supports it.
  A denied request falls back to maximizing with a dismissible status message.
  Actual fullscreen can be exited with Esc or the fullscreen control.
- Shared Button, Input, and Card primitives consume semantic colors and density
  tokens. Keyboard focus is visible; reduced-motion preferences are respected.
- Settings uses the inherited palette throughout. WORKNET's System appearance
  follows the OS preference while explicit WORKNET Light/Dark choices remain
  independent. Its approved earthy colors remain unchanged.
- Shared WORKNET cards and VAULT toolbar spacing follow density. Existing
  document readers retain their note, clinical, archival, map, and log layouts.

## Color and layout boundaries

`frontend/src/styles/universal-system.css` defines the proposed light neutral
values, a complementary dark set, and semantic plum, sage, copper, and steel
accents. Body and supporting text contrast and primary actions are tested in
both modes. Existing custom app canvases keep their own colors; legacy interiors
with fixed colors do not automatically gain a complete dark theme merely because
their window frame does. This avoids unreadable light canvases with inherited
light text. App palette redesigns remain separate visual work.

Text-only panels can use `.mira-prose` (75ch). Workspaces have no universal width
cap. Components can use `.mira-toolbar`, `.mira-status`, and `.mira-dialog` for
common layout, status, and dialog presentation. Status text must accompany any
color indicator. Existing workflow-specific dialog and confirmation logic is
preserved; this visual update does not add new permissions or rewards.

## Verification

Run `npm test --prefix frontend` and `npm run build:frontend` from the repository
root. Tests include preference defaults, malformed storage, unavailable storage,
reload persistence, preservation of unrelated save keys, system appearance
resolution, and light/dark contrast. Browser checks cover computed serif body
fonts, sans-serif controls, 42/48px title bars, persistent settings after opening
a fresh tab, normal/maximized layouts, and the denied-fullscreen fallback.

Browser fullscreen was denied in the automated browser session; successful
native fullscreen entry was not confirmed in that environment. The fallback
was verified. No GitHub operations were performed.
