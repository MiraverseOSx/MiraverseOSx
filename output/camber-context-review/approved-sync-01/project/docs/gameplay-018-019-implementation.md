# Profession work and verified activity progress

GAMEPLAY-018 (profession-appropriate mechanics) and GAMEPLAY-019 (graduated consequences) are approved decisions. The activity taxonomy, work-order lifecycle, balance values and linked story activities below implement the pasted proposal; they are implementation choices, not additional approved decisions.

## WorkNet behavior

All 14 assignments in `frontend/src/data/missions.json` have staged workflows in `frontend/src/gameplay/ActivityEngine.ts`. WorkNet renders the current stage, saves drafts, validates the submitted output and exposes accepted receipts for inspection. A selected procedure remains a plan only. Legacy `domain_objective_verified` flags and unrelated world achievements cannot certify a mission.

The eight reusable mechanics are evidence examination, document processing, diagnostic testing, equipment operation, investigation, dialogue, logistics and creative drafting. Each stage supplies its own readings, evidence, fields and acceptance rules. Numeric measurements and exact identifiers are validated against the assigned subject. Reports require a minimum length and specified factual terms; this is structured report validation, not semantic evaluation of free-form writing. These are desk-based interactions, not spatial circuit manipulation or animated instrument simulations.

The GL-12A engineering shift has six stages: prepare the assigned site and equipment, inspect logs, measure and diagnose C4, isolate/replace/reconnect, restore v2.4 firmware and verify readings, and submit a repair report. Archive work requires restoration, catalog classification and submission. Environmental work requires three distinct specimens followed by analysis and a report. Accreditation requires its own practical simulation and thesis.

## Five activity types

| Type | Implementation and proof |
| --- | --- |
| Task | A validated stage output stored once in `player.taskResults`. |
| Quest | Civic WorkNet quests have goal-specific workflows. The Glassline inquiry independently requires relay evidence and a containment finding. |
| Mission | All required stage receipts and deliverables for the specific work order must be accepted before finalization. |
| Journey | The engineering career journey requires field work plus ENG-404 practical and thesis milestones. |
| Adventure | The Old Factory Ward activity requires relay restoration, containment and a lineage audit. |

`evaluateLinkedActivities` returns milestone progress and the IDs of original task receipts. It does not copy accomplishments or award XP each time progress is read. Each completed milestone exposes its own named discovery or qualification in WorkNet. These initial linked activities have no additional currency rewards; the requirements are declarative and can be extended separately. The existing CHRONICLE notice catalog retains its own objective rules.

## Employment, shifts and payment

Employment contracts persist separately from work orders and record position, duties, available-shift schedule and pay terms. Routine staff shifts require an explicitly accepted contract. Special assignments use institutional clearance. Civic quests require no employment.

Each shift reserves its listed equipment and starts with 20 work units. Accepted stages use one unit. Finalization requires and consumes 10 stamina. Nonclinical routine shifts may be repeated once per world cycle, under a new work-order ID, and require fresh outputs. One-time assignments cannot reopen after payment. The Mercer clinical chart is one-time; treating the same patient again is not a new shift.

Work-order IDs are `WORK:<assignment>:<cycle>` for repeatable shifts and `WORK:<assignment>:once` otherwise. Stage receipt IDs append the stage name. `rewardedWorkOrderIds` prevents duplicate payout after reload. The mission catalog determines compensation; caller-supplied reward values cannot inflate it.

Faith Medical and WorkNet use the same canonical Mercer care receipt. Treatment issues the existing clinical compensation once. WorkNet still requires the clinical chart and records its acceptance without paying for the same care a second time. Care for another patient cannot satisfy Mercer’s assignment.

## Consequences and persistence

A minor mistake reduces the work-order evaluation by 2 and allows correction. A configured unsafe procedure reduces it by 15, records one lost supply unit and takes equipment offline. A remediation note must describe isolation and supervisor review before the failed stage can be retried. Accepted earlier outputs remain intact. Evaluation, incidents, losses and remediation notes survive reload. Remediation is a simulated written review; there is no separate supervisor NPC approval service in this implementation.

Old saves gain empty contracts, orders, task receipts and payout ledgers through the existing default merge. Existing balances and completed mission history remain. Old generic flags do not become proof. A previously paid clinical chart without a genuine receipt can be reviewed through the new clinical stage without another care payment. Administrative plan reset retains task evidence and payout history.

## Validation

Run `node --test frontend/tests/os-progress.test.mjs` for persistence, assignment scoping, staged work, error recovery, shared progress, patient receipt sharing and payout regression tests. Build with `npm run build --prefix frontend`; an alternate `--outDir` can be supplied to verify without replacing the existing `wwwroot` bundle.
