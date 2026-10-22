# Citizen Hub and AURA — second implementation package

Implemented October 22, 2026 following the user's instruction to continue the Rev06 cleanup.

## Ownership changes

Citizen Hub replaces the MIRROR name in Orbit and consolidates CIVINET's citizen-facing service entry point. It retains the internal `passport` app ID to preserve existing shortcuts, unlocks, and integrations. AURA remains the separate official registry workspace.

The audit found that MIRROR selected the shared active agency subject, fell back to the first registry citizen, and offered a button that wrote a hard-coded Cyacademy residence into that person's master record. That selector, fallback, and write button have been removed from the personal workspace.

Citizen Hub now resolves the player's own stable identity reference only. An existing MAID, internal person ID, or legacy alias can resolve the record; a name match or a shared AURA/DGAOS selection cannot. Ambiguous, restricted, missing, or deleted records do not silently resolve to another person. An unlinked player keeps their existing gameplay identity and sees an explicit unlinked state.

The registry service has a read-only loader for this view. Opening Citizen Hub does not seed a population, migrate identities, allocate a MAID, or create a citizen.

## Explicit player links

AURA's selected-person view offers **Link to current player** to the existing signed-in world administrator. The store validates that the person already exists and is unrestricted, rejects ambiguous IDs, and rechecks the active player after the asynchronous lookup. It stores only the existing internal person ID in `gameplay.identity.canonicalPersonId`.

Linking does not edit or duplicate the citizen, change the player's balances or progress, replace their existing local citizen ID, or rewrite issued documents. The link persists through the existing gameplay save and world synchronization path. It is never changed merely by browsing an AURA dossier.

This uses the application's existing simulated administrator flag. It is not a new backend authentication or production role-enforcement system. The rest of AURA's administrative permissions still require the later access-control audit.

## Citizen-facing functionality

- Profile and read-only linked AURA identity information.
- Civic service links to Atlas, Vitals, HOMECRAFT, WORKNET, and Cyacademy. The destinations handle their own work and records; the hub does not pretend to schedule an appointment or submit an application itself.
- Personal document issuance history, limited to the linked citizen's identity, travel, birth, residence, and education/service entries. Agency dossiers, forensic sheets, full agency packets, and other citizens' entries are excluded.
- Existing inventory, skills, associations, residence, and world-connection views are retained.
- CIVINET support uses the original `civinet-monthly-stipend` claim ID, amount, and XP. It remains once-only, including for saves that claimed it through the earlier portal. The UI no longer implies a recurring monthly payment that the implementation does not provide.
- Basic services and document navigation remain available before profile calibration. Existing gameplay sections retain their profile setup condition.

The old `civinet.mer`/`.aure` pages open Citizen Hub directly to its services section. `mirror`, `civinet`, and `citizenHub` app aliases redirect to the same existing `passport` window. Old pinned aliases deduplicate to that window. The phone opens Citizen Hub and uses saved local identity values instead of a hard-coded serial.

## Identity and document integrity

Profile calibration is explicitly a local gameplay profile workflow. AURA remains the authority for official identity issuance. Existing citizen IDs and barcodes are retained; repeating calibration cannot replace identifiers, change the AURA link, or issue another setup payout.

Document history displays the original saved issuance name, time, authority, reference, and hash. It never rebuilds an old entry from the current identity. Existing issuance logs store metadata rather than the original rendered file, so the UI identifies this as an issuance log and does not claim to recover original files. The reader supports both historical `citizenRecordId` and current `citizenId` keys. New issuances notify open personal history views without changing the historical entries.

No canonical registry, forensic, legacy identity, social, employment, or issuance storage key is renamed or cleared. The document log remains in its existing local storage; this phase does not add missing document-history synchronization to the backend snapshot.

## Validation

- 139 frontend tests pass, including eight new tests for personal identity isolation, ambiguous aliases, read-only lookups, restricted/unknown identities, administrator linking and persistence, player changes during linking, historical document filtering, stable identity calibration, and once-only civic support.
- Production frontend build passes; the existing DGAOS bundle-size advisory remains.
- Live localhost checks cover Orbit's Citizen Hub entry, the separate AURA window and link control, unchanged personal identity after browsing another registry citizen, personal document empty state, and the old CIVINET-to-Citizen-Hub route.

## Remaining roadmap

Starter personal email and explicitly issued institutional accounts; organization-based Comms memberships; full AURA/DGAOS access permissions; deeper banking, health, housing, archive, and education gameplay; Pulse's final purpose; and Creator Studio pause/publish behavior remain separate work.
