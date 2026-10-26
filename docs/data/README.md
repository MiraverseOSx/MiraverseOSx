# Game data organization

Characters are organized by name under frontend/src/game-content/characters/people. There are 76 character folders holding 120 source records. The previous 83 shared IDs are all preserved, with seven duplicate IDs redirected to consolidated identities.

See [the character directory and conflict resolutions](CHARACTER_INVENTORY.md), [the editing guide](../../frontend/src/game-content/characters/README.md), and character-conflicts.json for the recorded decisions.

## Ownership

- Each named character folder owns identity metadata and its world, social, mail, dialogue, phone, workplace, registry, agency, relationship, story and investigation profiles.
- Existing application modules import generated collection loaders, preserving their export paths and record keys.
- Shared case structures, world geography, organizations, items and gameplay logic stay in their existing modules until those domains are organized.
- Player choices, relationship changes, discoveries and current outcomes remain in the save stores, independently of authored defaults.

## Data rules

Use the Game Doc name for the resolved spelling and surname variants. Preserve earlier names as aliases and previous shared IDs as redirects. People who share a surname or first name are not automatically merged. Marcus Vance the courier and Marcus Vance the technician have separate role-labelled folders; the faculty and three Kaelen entries remain distinct.

Preserve case-specific facts in their source context. Elena Rostova's active civic/agency profiles and deceased case profile share an identity but do not overwrite one another or set a global life status. Professional appointments such as Miracle Jerome's medical and agency roles remain separate profile records of one person.

Issued identity remains an AURA concern. Corrected mail references use existing registry seed MAIDs. Wrong historical IDs remain provenance only and do not grant identity access. No player-owned saved record is automatically reassigned by name.

## Build and audit

node scripts/build_character_content.mjs builds identity indexes, compatibility links and per-domain loaders from the named folders. node scripts/audit_characters.mjs rebuilds the source index and readable directory. Both support --check.

The migration baseline records every previous character ID and a hash of every complete original profile. Character tests verify that each old ID still resolves, each original record remains available, distinct people remain distinct, source-context statuses survive, and live mail references use the correct existing registry identity.

The original SQLite exporter still writes frontend/src/data. It must not overwrite game-content. Backend world-saves.db remains a separate store for player progress. Public news and search must still honor discovery and access rules before showing character information.
