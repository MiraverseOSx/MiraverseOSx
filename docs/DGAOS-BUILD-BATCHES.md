# DGAOS feature build batches

Keep the existing DGAOS appearance. The work is divided by usable results rather than session estimates.

## Batch 1: record foundation

Implemented in this batch:

- Manual intake uses one case allocator and the signed-in investigator. It no longer creates random three-digit case IDs or invents a citizen record from a reporting-party name.
- New internal task, evidence, person-reference, note, request, and timeline records use collision-resistant IDs. Existing issued identifiers are retained.
- Linking the same registry person into two cases preserves the registry ID and independent case roles. Different registered people sharing a name remain distinct.
- The embassy scenario's timed events and task reactions stay in that scenario. Old unrelated scheduled events are blocked from manual cases, including during offline progression.
- The investigation hub follows the selected docket. It no longer displays another scenario's CCTV, fingerprint, DNA, or warrant records in a custom case, or fabricates evidence storage and custody signatures.
- TRACE saves an editable case library, retains work when changing cases, migrates an existing active docket on save, and rejects unknown cases and incomplete/duplicate-ID imports.
- TRACE results require a matching originating request. The quick-transmit form no longer preloads an unrelated case's result or substitutes a default case/request ID.
- Database saves and portable world backups include TRACE records, drafts, sessions, transmissions, case libraries, open-lab notes, per-examination drafts, suggestion preferences, issued-document snapshots, and service links.
- Restore keeps a displaced-world backup, validates incoming records, removes newer draft keys absent from the selected save, updates IndexedDB mirrors, and rolls local writes back on failure.
- TRACE prefers the restored local mirror and respects an intentionally empty saved docket.
- Creator checkpoints exclude recursive checkpoint copies and synchronize restored IndexedDB records while retaining their existing historical-identity policy.

Use **Settings > Save & sync > Backup and restore** for portable backup files. Restoring a selected file reloads the app so in-memory stores use the restored world.

World backup files contain saved records. Uploaded social media retains its existing separate media-backup workflow; selected external HTML apps and their supporting files remain files on the user's device. Neither is silently represented as embedded in the world JSON.

The expanded database record allowlist requires the updated backend to be running. The next normal `npm start` builds it before launching.

## Batches 2–4: connected operations

Open **DGAOS > Operations**. The workspace uses the existing agency colors and controls.

### Connected cases

- Select an existing case; the full case editor continues to manage intake, exhibits, documents, custody and existing tasks.
- Import existing AURA citizens from Records & legal, or create an investigative profile. Issued AURA IDs are retained; investigative profiles do not issue official identity documents.
- Link a citizen as a witness, suspect, victim, reporting party or other person. Roles remain local to each case.
- Save interviews and cite case-local evidence, documents, interviews or civic reports in findings and follow-up tasks. Reject sources from another case.
- Submit selected exhibits and an investigative question to a supported TRACE discipline. Partial submissions retain their links for retries, and new examinations record all submitted exhibit IDs.
- TRACE release now resolves the exact examination/request/case relationship and persists receipt in DGA before acknowledging delivery. It rejects another recipient, preserves laboratory evidence IDs, retains limitations and waits for every linked examination before completing a request. The linked laboratory workflow no longer completes from a simulation timer.

### Records & legal

- Search citizens by name/ID or vehicle reference. Record vehicles, licenses, BOLOs, arrests and reports, and retain closed records.
- Save warrant scope and grounds, then record approval/rejection and service separately.
- File charges from a configurable fictional Meridion penal code. Preserve the wording used when each charge was filed.
- Record the hearing, verdict, sentence, inmate admission and release as separate steps with actor/history. An acquittal cannot advance to sentencing. Admission requires a sentence.
- Court decisions and penal-code configuration require Command Director authority. Case-linked history follows case clearance.
- TRACE Legal & Warrants and Courtroom Trial use the same persistent records. Submitting an indictment package no longer serves a warrant or closes the case automatically.

### Emergency calls

- Receive the optional Vale-house sample NPC call, or queue an arbitrary caller with a location, emergency description, priority and optional name/number.
- Answer, hold, resume, transfer to a simulated agency destination, disconnect and call back. Only one call can be connected at a time. Callbacks retain a separate log and parent/incident links; an unknown number cannot be called back.
- Ask the caller questions by text. Replies are scripted from the entered caller details; case-aware generative conversations remain batch 7.
- Optionally enable spoken replies or use browser microphone transcription. Support and voices depend on the browser; the text controls remain available. Microphone transcripts populate the message box for review before sending.
- Export call logs, create one incident per call, update its location/priority/description/status, and create or link an investigation. The originating case's call document stays current when callbacks or later call messages are recorded.
- Calls, incidents, interviews and legal records live inside the DGA workstation save and are included in the batch-1 world backup/database snapshot. Failed workstation writes reject an operation without publishing partial changes.

Persistent responding units and radio channels remain batches 5 and 6; this batch provides emergency intake and the incident-to-investigation handoff.

Validation for batches 2–4: 272 Node tests, 13 browser tests, TypeScript checking and an isolated frontend production build passed. The browser checks cover call → incident → investigation → interview → warrant → court stages → inmate record → reload, plus a TRACE report return with a rejected unrelated recipient. Actual microphone hardware and installed speech voices were not exercised.

## Batches 5–8: response, radio and case-aware conversations

Open **DGAOS > Operations > Dispatch & radio**. The existing agency appearance is retained.

### Solo dispatch

- Register persistent police, tactical, fire and medical callsigns. Put units on duty and set availability.
- Assign available units to open incidents, including multi-agency responses. A unit cannot take two active assignments or go off duty before clearing its assignment.
- Advance assigned → en route → on scene → cleared; file or amend response reports. Reports and response histories remain attached to the incident and appear in an investigation even if referral happens afterward.
- **Run NPC response updates** advances due assignments through the shared agency clock while DGAOS is open, including when another agency screen is selected. Pausing the agency/world pauses these updates. **Simulate next response update** advances visible assignments on demand.
- NPC progress reports distinguish received call information from independent scene observations. They do not invent laboratory results or identify a perpetrator.
- Panic alerts create emergency radio traffic and raise the linked incident to Critical. Acknowledge the panic before clearing the unit. Active responses must clear before the incident can close.

### Radio

- Join and switch dispatch, police, tactical, fire, medical, command and all-call channels. Command access requires Command Director authority.
- Save an operator callsign, link transmissions to incidents, broadcast on all-call, and receive acknowledgments reflecting on-duty NPC unit status.
- Mark emergency traffic; linked incidents escalate to Critical. Panic traffic remains visible alongside the current channel.
- Use text, optional hold-to-talk browser transcription, or optional spoken NPC replies. Microphone text can be reviewed before sending. Browser support and installed voices determine voice availability.
- Radio history is persistent and incident radio logs are synchronized into the originating investigation. Case-linked traffic respects clearance.

### Scenario workshop and conversations

- Generate a **Missing delivery** or **Roadside collision** scenario at a chosen location. Each template creates a coherent call, distinct citizen IDs, witnesses, authored character knowledge, hidden author facts and discoverable scene records.
- Answer the call, create its incident, send a unit and refer it to an investigation. Scene records can be collected once a unit has reached the scene. Author facts remain separate from collected records.
- **Character conversations** uses the selected case, the character's own knowledge, their own prior interviews, saved conversation memory and acquired records explicitly presented by the investigator.
- With connected AI enabled, the existing configured AI service selects relevant known fact IDs. The interface renders their canonical text. Unknown or invalid IDs and unavailable providers fall back to the local record engine; no generated prose is promoted to evidence.
- Replies are persisted as case interviews. Changes to knowledge during an outstanding reply invalidate that reply. Different cases and changed conversation context have separate server cache entries, and global persona memories are excluded from investigation requests.
- Command users may explicitly open the author controls to configure a character's knowledge or view hidden scenario notes. Normal conversation requests and investigator exports exclude hidden author notes.

### Verification and exports

- **Export investigation** downloads the selected case, interviews, civic/legal records, calls, incidents, response reports and incident radio history. It excludes undiscovered scenario knowledge and hidden author facts.
- Full world backups retain the complete saved simulation, including author data, unit state, assignments, channel membership, conversations and scenario discovery state. Restore reloads the saved world through the existing workflow.
- The browser playthrough covers scenario call → incident → responding unit → radio → response report → scene record → interview → TRACE report → court outcome → investigation export → backup/restore. Separate checks cover sentencing and inmate admission, unrelated TRACE recipients, panic handling, busy/off-duty units, knowledge boundaries and failed storage writes.
- Actual microphone hardware and installed speech voices require a manual device check. Cloud selection is covered with controlled provider responses; live provider availability depends on the existing local AI configuration. The local record engine remains usable without cloud credentials.

### Bug fixes included

- Disconnected, unanswered incoming calls cannot create an incident from unheard caller details.
- Callbacks made before intake and their original call now share one incident.
- Failed TRACE record writes report an error and roll back the record cache instead of claiming a successful save.
- The caller microphone can be stopped explicitly.
- NPC response updates use the shared agency clock rather than stopping when the response panel is left.
- Multiple module URLs during development reloads share the workstation state and subscribers, preventing a displayed call from being missing in another copy of the store.

The updated backend is required for scoped AI cache/memory behavior. A normal restart with `npm start` builds and loads that backend.

Verification result: 284 Node tests, all 14 browser checks, 22 database/server checks and 25 AI subsystem checks passed. Frontend production and .NET Release builds passed. One screenshot write encountered a transient file lock and passed on retry; its application assertions also passed.
