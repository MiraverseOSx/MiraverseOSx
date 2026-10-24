# Game audit — October 23, 2026

Quick cross-system review of desktop routing, mail and files, shared citizen records, save compatibility, rewards, and lineage-story progression. This pass combines automated checks and source review; it does not claim every mission has been manually completed.

## Confirmed issues fixed

- **Wrong mail documents:** attachments without a template key opened the civic registration template. They now retain their own filename, content, provenance, and source message. Saving an attachment in VAULT preserves the same document rather than constructing a different reader record.
- **Disconnected TRACE citizen records:** an asynchronous registry loader was used synchronously, silently omitting canonical citizens. TRACE now awaits the records, refreshes through shared citizen events, and follows the active citizen context. Its AURA and Document Studio buttons use the current owning app IDs.
- **Incomplete MEDSTAT updates:** the medical reader now listens to the same population/context events as AURA and Document Studio, including same-window registry changes.
- **Ignored browser destinations:** HTTP(S) workspace requests now navigate VerseNet to the requested destination instead of being consumed without opening it.
- **Unverified story discovery:** opening an encrypted file previously recorded its inspection before decryption. Inspection now occurs only after its content is readable. An AETHERCORE driver reference no longer proves the player's lineage; unrelated archivist career XP no longer completes that discovery or triggers the protected lineage dream. Existing saved discoveries and completed receipts remain intact.
- **Legacy document reward bypass:** document buttons no longer dispense repeatable credits, silently grant DGA verification, or claim to quarantine a process. They open the owning civic, medical, campus, or system workspace, where the action is handled.
- **Save-format mismatch:** the frontend's creator journal key was absent from the backend allowlist, potentially rejecting an otherwise valid world snapshot. The backend accepts that existing object record and tests verify persistence across restart. No database migration is needed.

## Cleanup

- Removed the unused standalone `TraceWorkspaceApp.tsx` wrapper. Legacy TRACE links still route into DGAOS.
- Removed `folder-structure.txt`, an obsolete snapshot listing files and folders that no longer match the project.
- Removed unused document-reader state/imports and corrected the README's obsolete independent-TRACE descriptions.
- Kept the standalone service-workspace source: its export builder still uses it. Player saves, assets, case content, and recovery backups were not deleted.

## Verification

- **177 frontend tests pass**, including new attachment consistency, document-access, action-routing, and lineage-progression regressions.
- **13 isolated backend integration checks pass**, including creator-journal save/restart and stale-write protection.
- Broad Street package validation and **4 Python tests pass** across case and fictional-content checks.
- Frontend production build passes; .NET Release build passes with **0 warnings and 0 errors**. The frontend retains its existing large-bundle advisory.
- Updated local save server restarted on port 5000; its health endpoint responds successfully through the frontend proxy on port 3000.

Use `npm start` from the project root for both servers. Existing saves and paid-case protections remain in place.
