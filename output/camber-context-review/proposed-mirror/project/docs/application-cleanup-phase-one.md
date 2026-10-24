# Application cleanup — first implementation package

Implemented October 22, 2026 against the user's Rev06 architecture decisions. This package consolidates navigation and preserves existing systems; it does not complete the entire architecture roadmap.

## Entry points and ownership

| Former entry point | Current destination | What remains intact |
| --- | --- | --- |
| Standalone TRACE (`traceForensics`) | DGAOS → TRACE | Existing forensic workbench, case records, examination drafts and DGA bridge |
| Chronicle / notice board (`board`, `chronicle`) | WORKNET → Civic notices | Notice IDs, objective verification, category filters, completion records and once-only rewards |
| QUESTNOTICE (`questnotice`) | WORKNET → Civic jobs | Existing objective-driven civic assignments and saved work orders |
| Standalone SpellForge (`spellforge`) | Cyacademy → Magic practice | Existing module compiler, stamina, canonical discoveries and spell history |
| Service Directory (`serviceDirectory`) | VerseNet → Service Directory | Existing eleven links, edits, local HTML preview and external launching |
| Social content formerly shown under Pulse | mai.space in Orbit and VerseNet | Same social portal and saved profile, friends, posts and interactions |

DGAOS also has a Service Directory section using the same saved collection as VerseNet. Updates refresh both mounted directories. External pages receive no citizen or case payload from this integration and continue to use the existing restricted external-page viewer.

Pulse remains in Orbit as a status page linking to mai.space. Its former entry component only wrapped the social portal. No new Pulse purpose has been invented; remaining saved `pulseProfile` data and dependencies have not been renamed or deleted.

## Compatibility and saved data

- The shared OS window entry points redirect legacy IDs and legacy `contentKey` values. They focus a single owning window and deliver a section request instead of creating another standalone app.
- Existing pinned shortcuts migrate to their owner app, preserving order and removing duplicate owners. Appearance settings remain intact.
- Section requests are transient, versioned and consumed once. A stale consumer cannot erase a newer request. Requests to DGAOS wait for the existing workstation lock to clear.
- The persisted gameplay schema, forensic storage keys, social data, employment records and rewards are not migrated into duplicate stores. Window consolidation does not claim rewards or modify gameplay.
- No source forensic, notice or magic implementation has been deleted. The old standalone registry/content entries are retired.
- MAI recognizes legacy launch names. The phone's academy shortcut opens the same magic workspace rather than running its former separate synthesis-and-payout handler.

The public `questnotice.mer` page now leads to WORKNET's existing playable civic jobs. Its three earlier one-click listings (`qn-web-1` through `qn-web-3`) are visible as historical listings, including previously completed status. Their completion IDs and earnings remain in saves; the public page no longer grants a separate payout. These three listings have **not** been rewritten as new playable assignments. The existing objective-driven `qn-01` through `qn-03` assignments remain unchanged in WORKNET.

## Verification

- `npm test --prefix frontend`: 131 tests passed, including six new consolidation tests covering legacy links, custom window IDs, owner focus, stale requests, shortcut migration, saved progress and once-only notice rewards after reload.
- `npm run build --prefix frontend`: production build passes. The existing large DGAOS bundle still triggers Vite's chunk-size advisory.
- Live localhost checks: Orbit has 19 current entries; Cyacademy academic and magic tabs load; the phone opens directly to academy magic practice; WORKNET civic notices load; DGAOS renders TRACE and the Service Directory within its own window. mai.space and the public QUESTNOTICE-to-WORKNET route are checked separately.
- Existing DGAOS authentication remains unchanged. This package does not implement stronger role or membership enforcement.

## Remaining roadmap

Citizen Hub versus AURA ownership was subsequently implemented in [phase two](application-cleanup-phase-two.md). The personal starter mailbox, issued institutional accounts, Comms memberships, deeper banking/health/housing/archive/education interactions, MAI autonomy, Pulse's final purpose, and Creator Studio pause/publish behavior remain future work. They must not be represented as completed by this package.

The standalone HTML workspace remains a separate export. It is not the Miraverse desktop or the canonical way to launch the integrated application. Use the running Miraverse app at `http://localhost:3000/` during local development.
