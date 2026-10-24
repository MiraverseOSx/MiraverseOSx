# WORKNET careers and division oversight

Implementation follow-through for WORKNET-011–017, October 23, 2026.

## Start

Open WORKNET, select a division, and open **Career Record**. Accept division employment if you do not already have a contract. Existing clearance requirements still apply. The contract grants no additional AureMail, Comms, DGAOS, or TRACE credentials.

Choose **Elite Specialist** to continue technical work and qualification-based advancement without personnel management, or **Department Supervisor** to open this division's management console. Both use existing verified career promotion requirements. Switching pathways preserves submitted work and earned progress; current authority is checked each time you act.

## Division management

1. Open **Workplace → Supervisory Console**.
2. Choose an open duty and a colleague at their desk. They must belong to the division, meet its competence threshold, and have no other open docket. Each authored duty can be delegated once per world cycle.
3. Advance game time using **Advance work segment**, or return after time advances elsewhere. NPC work uses the duty's authored duration in game segments. Closing WORKNET or reloading does not cancel it.
4. Select **Read docket** when it is ready. Read the NPC completion report and any verification exception.
5. Approve to archive the docket, or request a revision. Revised work returns after one more game segment and must be read again. An unfunded equipment verification cannot be signed off until maintenance is funded and a revised docket is returned.
6. Approval adds the duty's published merit and funds to the **department**, once. It does not add personal credits or repeat assignment pay.

Coworker routines progress through desk work, meetings, field work and breaks as world time advances. Refreshing a status does not let the player force a colleague back to their desk. A colleague on approved leave is unavailable for the covered segment.

## Budget and leave

The division starts with a 5,000-credit pool, separate from the player's wallet. Allocations must be nonnegative whole credits and cannot exceed the pool. Approved dockets increase that pool by their published departmental funding.

- Equipment maintenance of at least 500 credits supports docket verification.
- Training adds one eligibility point per 1,000 allocated credits, using the saved allocation at assignment time.
- Surge reserves of at least 500 credits provide leave coverage. A subordinate with an unfinished assigned docket cannot be released until the docket is resolved.

Leave decisions are recorded once. Approved leave identifies reserve-roster coverage and blocks assignment for that work segment. Budget drafts reset correctly when changing divisions.

## Pay and flexible shifts

**Disburse cycle stipends** pays 150 credits per eligible active contract for the current cycle, once. Returning after several skipped cycles pays the current cycle only. Salary does not replace existing piece-rate assignment rewards, and does not bypass clearance. Existing paid cycle records are retained.

Schedule entries are optional work rhythms. Taking leave, switching employers, or advancing beyond a suggested time carries no missed-shift penalty. Procedural tier badges describe existing profession workflows; they do not turn civic dispatch into a technical investigation.

## Saves and compatibility

Management records now live under `player.worknetWorkplace` in the ordinary world save, alongside contracts and salary receipts. This includes dockets, deadlines, budgets, merit, coworker relationships, leave, and resolved workplace events. They travel with existing local and backend snapshots rather than remaining in app-only localStorage keys.

On first open, earlier `miraverse_worknet_state_v2_*` records are imported without deleting the old keys. Existing approved dockets remain archived and cannot pay again. Earlier in-progress dockets receive a game-time deadline. Old unrestricted budget totals are bounded to the initial pool; existing allocations within it remain. Old unrelated game progress is retained.

## Verification

`npm test --prefix frontend` exercises the full frontend suite. Added behavioral checks cover contract/pathway/clearance gates, same-division staffing, competence, timing across hydration, revision return, maintenance exceptions, department-only compensation, budget bounds, leave coverage, legacy archives, salary deduplication, and shared world snapshots. `npm run build --prefix frontend` checks the production bundle.

NPC dockets are authored game reports, not a real background employee or external service. No backend route, multiplayer service, or credential grant was added.


## Portal rework — October 24, 2026

Normal WORKNET launches open the operations desk. Explicit assignment links from other applications continue to open the selected assignment, including repeated links to the same work. Existing journal selections are saved history and no longer force a stale assignment on every launch.

The modern portal uses ivory, sage, forest, and each institution's accent. Overview displays current-division assignments, returned dockets, colleague availability, shift suggestions, eligible cycle pay, and employment records. Resume buttons open the existing work-order reader; no new assignment or payment is created by browsing. Empty states reflect actual employment instead of assuming a position exists.

Workplace switching synchronizes the opportunity filter and personnel-file employer. Career-track selectors also switch the active workplace, so reporting chains and permissions remain tied to the selected institution. Navigation wraps or scrolls within the app window, with container-responsive dashboard and opportunity layouts. Existing saved gameplay, management rules, case readers, and compensation receipts are preserved.


### Approved earthy appearance and opportunity reader

The [October 24 visual specification](worknet-visual-spec.md) is now the appearance reference. WORKNET uses warm ivory and beige in Light mode, earthy charcoal in Dark mode, copper actions, serif display headings, and sans-serif forms. Choose **Light**, **Dark**, or **System** in the header; the setting is saved locally. System follows the browser/operating-system color scheme. Appearance changes retain the current component tree, employer, selected assignment, and form state.

Opportunities retain the two-panel layout, with actual counts, search, institution/category filters, and selected-state thumbnails. The assignment reader has Overview, Objectives, Requirements, Saved work, Rewards, and Related opportunities. The existing work-order and Broad Street readers remain mounted while switching these detail tabs. The briefing-folder button opens the original VAULT documents. Department cards link to the selected assignment's institution, and the notification bell opens AureMail with a count of unread employment dispatches.

The transit and depository photographs are generated fictional location artwork, labeled as illustration rather than case evidence. [Asset provenance and prompts](../frontend/public/images/worknet/CREDITS.md) document the built-in image-generation outputs. The reference image's placeholder counts, timestamps, and reward figures were not substituted for game data.
