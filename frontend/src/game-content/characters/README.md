# Character files

Each character now has one named folder under [people](people). Identity, aliases and references live in character.json. Their actual app records live beside it, rather than in separate global character lists.

Examples:

- [Aelita Hopper](people/aelita-hopper/README.md): social profile, mail contact, dialogue, phone thread and Game Doc reference. Aelita Schaeffer remains an alias.
- [Dr. Miracle Jerome](people/miracle-jerome/README.md): medical registry seed, mail, agency profile and authored agency relationships.
- [Elena Rostova](people/elena-rostova/README.md): civic profile, agency profile, case-context records and relationships.
- [Marcus Vance the courier](people/marcus-vance-courier/README.md) and [Marcus Vance the technician](people/marcus-vance-technician/README.md): distinct people with separate folders.

The full folder directory and conflict resolutions are in [the character inventory](../../../../../docs/data/CHARACTER_INVENTORY.md).

## Editing

Edit the named folder. character.json owns the canonical name, aliases, previous shared IDs, primary registry MAID when one exists, and the list of profiles. Social, mail, dialogue, phone, world, workplace, registry, agency, relationships, story and investigation files are created only where applicable.

Each profile entry contains data (the current authored record), original (the complete source record before consolidation), origin (its original location), and context (the source collection). Keep original immutable as provenance. Case-specific clinical statuses and knowledge stay in their explicit context; they are not global character facts.

When adding a profile, add its reference to character.json and its collection/key to manifest.json's order list. Run:

```text
node scripts/build_character_content.mjs
node scripts/audit_characters.mjs
node --test frontend/tests/character-registry.test.mjs
```

Use --check on either script to validate without writing. Generated files are people.json, legacy-links.json, id-aliases.json and collections/*.ts. Do not edit those directly. The manifest lists folders and collection order; it contains no clinical or private profile data.

## Compatibility

The seven retired duplicate shared IDs redirect to their consolidated characters. All previous app IDs, case-person IDs, phone thread keys, dialogue keys, email addresses, registry UUIDs and save references remain intact. Old names remain identity aliases. The loaders return fresh profiles and include characterId on object records.

Three mail contacts now use their existing registry-seed MAIDs. The former wrong mail MAIDs are preserved only as source history, not as alternate issued credentials. Borrowed Rowan/Ilyra NPC keys were removed from the unrelated citizen contacts. Student S. Mercer no longer uses Elara Vale's MAID; no replacement issued ID is invented.

## Access and saves

Public identity lookup imports only the generated identity index, links and redirects. Domain loaders import only the category files they need. Never display investigation answers, secrets or clinical records merely because a character ID is known. Game Doc-only characters remain in their folders without being automatically inserted into gameplay.

This reorganization changes authored defaults and lookup compatibility. It does not overwrite player-owned saved citizens, relationships, medical outcomes, mailboxes or issued document history.
