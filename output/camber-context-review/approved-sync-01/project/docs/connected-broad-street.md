# Connected desktop investigation: Broad Street

## Start and play

Open WORKNET → Global Affairs → **Broad Street Vault Breach: Connected Investigation**. Eligible players also receive a deduplicated opportunity dispatch in AureMail. Existing DGA/TRACE access and clearance 2 are required; accepting the work does not issue credentials. Previously closed or paid versions of this case cannot become new paid work.

Accept and acknowledge the briefing. The case folder in VAULT contains the briefing, checklist, access audit, and thermal log. Sources can be investigated in any order:

- VAULT: access audit and facilities thermal log.
- DGAOS evidence notebook: EV-0010 metallurgy and EV-0011 DNA findings.
- AureMail: request and read Mateo Cruz's recorded clarification, then add the statement to the notebook.
- VerseNet: search **First Federal maintenance**, open the fixed public facilities notice, and cite it in the case.

Every source has an explicit acquire/cite action. Reading or saving a record pays nothing. Source buttons reopen the original reader and preserve the case context. An optional hint suggests where to look without choosing findings for the player.

Use WORKNET's Tiptap report editor, choose three structured findings, and select supporting citations for each. Review checks acquired source IDs, relevant source relationships, the chosen findings, and the presence of at least 80 characters of player-written explanation, excluding generated outline headings and placeholders. It does not match keywords or use AI to judge prose. Weak findings receive feedback and unlimited revision, with no rating or reward penalty. The target play length is 20–30 minutes; actual duration depends on reading and writing pace and has not been measured in a player study.

An accepted review enables normal WORKNET finalization: 300 credits, 150 XP, zero bits, once. The existing 10-stamina finalization cost remains. Editing an accepted draft invalidates its acceptance receipt and requires review again. Restoring an earlier accepted draft and reviewing it rebuilds the receipt without duplicating the submitted version or payment. Submitted versions remain readable. Unchanged repeat submissions reuse the previous review; correspondence, sources, dispatches, files, and payout receipts are deduplicated.

## Data and compatibility

The pilot references `CASE-2026-002` / `FS-2026-00422` and preserves the original case chronology, people, and evidence IDs. It has a dedicated source-and-report view; the older courtroom preset and other cases are not rewritten. Report acceptance records a supported investigation, not a criminal verdict.

Progress is stored at `player.worknetOrders['ms-case-002'].caseProgress`. It includes content version, acquired IDs, witness request state, current formatted draft, structured findings and citations, and immutable submitted reviews. Original documents use the existing assignment journal; correspondence uses the existing communications store. Both participate in the existing local saves and backend world snapshots. No new backend route or database migration is needed. Source access and review actions check current authorization.

The public browser route is `https://firstfederal.aure/maintenance`, handled internally with a fixed publication. Public search imports only its separate public data file. Private case sources and answer rules are never added to general search results. Python is a development-time builder, not a process required during play.

The authored assignment manifest is separate from the SQLite-exported mission list. Both mission registries merge it by its stable ID, so running the existing database export cannot erase or duplicate the pilot.

```powershell
npm run data:case
npm run test:case
npm run data:case -- --seed 43
```

The last command varies an incidental reference only; source facts and the solution remain fixed. The default check uses seed 42. Runtime visits never regenerate facts. Older completed case IDs, paid work-order IDs, and matching closed DGA/TRACE case records prevent a fresh payout. Existing unfinished cases and other progress are preserved.

## Verification

Automated checks cover two source orders, app-specific links, eligibility and briefing gates, missing/unknown/unacquired/unrelated citations, witness and dispatch deduplication, report sanitation and revisions, content version mismatch, hydration, shared snapshot inclusion, legacy completion, and one-time compensation. Python checks enforce deterministic builds, original chronology, stable evidence IDs, and separation of public/private material. Live localhost verification covers the full five-app workflow and final acceptance.
