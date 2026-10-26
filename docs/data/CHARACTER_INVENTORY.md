# Character directory and resolved conflicts

76 named character folders own 120 complete records across 19 collections. 15 documented conflicts are resolved; 0 remain open. No character was deleted: previous shared IDs resolve through explicit redirects, and each extracted source record is retained in full alongside its corrected version.

## Where to edit a character

Open the character’s folder under frontend/src/game-content/characters/people. character.json owns identity, aliases, legacy IDs and references. Other files hold social, mail, dialogue, phone, registry, workplace, agency, relationship, story or investigation records. Only relevant files are created.

For example, aelita-hopper contains character.json, social.json, mail.json, dialogue.json, phone.json and story.json. dr-miracle-jerome is stored under miracle-jerome with agency, mail, registry and relationship records. The README in each folder lists its files.

## Merge policy

Game Doc names take precedence for Aelita Hopper, Odd Della Robia, Sissi Delmas and Riven Kalbera. Previous names remain aliases. K. Vesper is consolidated with Kieran Vesper. Miracle Jerome’s agency and medical appointments belong to one character. Elena Rostova’s case and registry facts belong to one identity but retain explicit source contexts; no global alive/dead state is inferred.

Headmistress Vael, scholar Vaelen and Dean Cassian Rook remain distinct. Broker Kaelen, supervisor Kaelen Vance and subject Kaelen Voss remain distinct. The two Marcus Vance records remain distinct people in role-labelled folders. Archivist Rowan remains separate from Elara Vale.

The three conflicting mail MAIDs now use their existing registry-seed IDs. Previous wrong values are retained as source history only, not as alternate issued credentials. Student S. Mercer has no issued MAID recorded rather than borrowing Elara Vale’s. Existing player-owned saved IDs and mailboxes are not reassigned.

## Resolution register

- **aelita-name — resolved:** Merged under Aelita Hopper from the Game Doc. Schaeffer remains a name alias and its former shared ID redirects to Hopper.
- **odd-spelling — resolved:** Merged under the Game Doc spelling Odd Della Robia. Robbia remains a spelling alias; profile and phone IDs are unchanged.
- **sissi-name — resolved:** Merged under Sissi Delmas. Elisabeth Delmas remains an alias, preserving the established Sissi dialogue and social keys.
- **riven-name — resolved:** Merged under Riven Kalbera from the Game Doc; Asterwind is retained as an alias.
- **vesper-identity — resolved:** Merged under Kieran Vesper. K. Vesper is the abbreviated professional name; the world NPC ID remains npc-vesper.
- **miracle-agent — resolved:** Merged under Dr. Miracle Jerome with separate medical and agency professional profiles. Both role histories and the agency badge remain intact.
- **elena-roles — resolved:** Consolidated under Elena Rostova with separate agency, civic and case-context profiles; professional and investigative details are preserved.
- **elara-maid — resolved:** Mail now references the existing issued seed MAID-OR-00481926. The old mail MAID is source history only; the unrelated Rowan NPC key is removed. Archivist Rowan remains a separate character.
- **miracle-maid — resolved:** Mail now references MAID-OR-00481927. The previous mail MAID and borrowed ilyra key remain provenance only. Medical reply routing uses the actual contact ID.
- **julian-maid — resolved:** Mail now references MAID-OR-00481928; its previous MAID is retained in source history, not used as an automatic identity alias.
- **faculty-coverage — resolved:** Resolved as distinct characters with separate folders: Headmistress Vael, scholar Vaelen and Dean Cassian Rook. No faculty member was removed.
- **kaelen-identity — resolved:** Resolved as distinct characters: broker Kaelen, supervisor Kaelen Vance and investigative subject Kaelen Voss. Each retains a separate folder and ID.
- **elena-case-identity — resolved:** Merged identity, scoped records: active agency/civic records and the deceased P-401 case profile remain separate contexts. No global life status is inferred and no case outcome is overwritten.
- **marcus-vance-identity — resolved:** Resolved as distinct people: Marcus Vance the diplomatic courier and Marcus Vance the motorcycle technician. Separate role-labelled folders preserve both.
- **student-mercer-maid — resolved:** Removed the wrong association. Student S. Mercer is retained with no issued MAID; Elara’s existing registry identity is untouched. The original value remains provenance only.

## Named folders

| Character | Shared ID | Folder | Records |
| --- | --- | --- | --- |
| Queen Maeryn Seraphima | char-maeryn-seraphima | [maeryn-seraphima](../../frontend/src/game-content/characters/people/maeryn-seraphima/README.md) | 2 |
| High Warden Holly | char-holly | [holly](../../frontend/src/game-content/characters/people/holly/README.md) | 1 |
| Chancellor Lucia | char-lucia | [lucia](../../frontend/src/game-content/characters/people/lucia/README.md) | 1 |
| Lord Neryx | char-neryx | [neryx](../../frontend/src/game-content/characters/people/neryx/README.md) | 1 |
| Grand Dispatcher Yoko | char-yoko | [yoko](../../frontend/src/game-content/characters/people/yoko/README.md) | 1 |
| High Forge-Master Ember | char-ember | [ember](../../frontend/src/game-content/characters/people/ember/README.md) | 1 |
| Seer Keket | char-keket | [keket](../../frontend/src/game-content/characters/people/keket/README.md) | 1 |
| Kieran Vesper | char-kieran-vesper | [kieran-vesper](../../frontend/src/game-content/characters/people/kieran-vesper/README.md) | 2 |
| Dr. Robert Mercer | char-robert-mercer | [robert-mercer](../../frontend/src/game-content/characters/people/robert-mercer/README.md) | 1 |
| Ambassador Christian Vance | char-christian-vance | [christian-vance](../../frontend/src/game-content/characters/people/christian-vance/README.md) | 4 |
| Dr. Gregory Thorne | char-gregory-thorne | [gregory-thorne](../../frontend/src/game-content/characters/people/gregory-thorne/README.md) | 4 |
| Viktor Krell | char-viktor-krell | [viktor-krell](../../frontend/src/game-content/characters/people/viktor-krell/README.md) | 4 |
| Courier Marcus Vance (No Relation) (Diplomatic courier) | char-marcus-vance | [marcus-vance-courier](../../frontend/src/game-content/characters/people/marcus-vance-courier/README.md) | 2 |
| Elena Rostova | char-elena-rostova | [elena-rostova](../../frontend/src/game-content/characters/people/elena-rostova/README.md) | 4 |
| Director Evelyn Cross | char-evelyn-cross | [evelyn-cross](../../frontend/src/game-content/characters/people/evelyn-cross/README.md) | 1 |
| Deputy Chief Miller | char-deputy-chief-miller | [deputy-chief-miller](../../frontend/src/game-content/characters/people/deputy-chief-miller/README.md) | 1 |
| Specialist Marcus Chen | char-marcus-chen | [marcus-chen](../../frontend/src/game-content/characters/people/marcus-chen/README.md) | 1 |
| Dr. Miracle Jerome | char-miracle-jerome | [miracle-jerome](../../frontend/src/game-content/characters/people/miracle-jerome/README.md) | 5 |
| Jeremie Belpois | char-jeremie-belpois | [jeremie-belpois](../../frontend/src/game-content/characters/people/jeremie-belpois/README.md) | 5 |
| Aelita Hopper | char-aelita-hopper | [aelita-hopper](../../frontend/src/game-content/characters/people/aelita-hopper/README.md) | 5 |
| Sissi Delmas | char-sissi-delmas | [sissi-delmas](../../frontend/src/game-content/characters/people/sissi-delmas/README.md) | 4 |
| Odd Della Robia | char-odd-della-robia | [odd-della-robia](../../frontend/src/game-content/characters/people/odd-della-robia/README.md) | 4 |
| Dr. Sharon Voss | char-sharon-voss | [sharon-voss](../../frontend/src/game-content/characters/people/sharon-voss/README.md) | 3 |
| Riven Kalbera | char-riven-kalbera | [riven-kalbera](../../frontend/src/game-content/characters/people/riven-kalbera/README.md) | 3 |
| Mara Thorne | char-mara-thorne | [mara-thorne](../../frontend/src/game-content/characters/people/mara-thorne/README.md) | 1 |
| Archivist Rowan | char-rowan | [rowan](../../frontend/src/game-content/characters/people/rowan/README.md) | 1 |
| Director Ronald Sterling | char-ronald-sterling | [ronald-sterling](../../frontend/src/game-content/characters/people/ronald-sterling/README.md) | 1 |
| Vance Lowe | char-vance-lowe | [vance-lowe](../../frontend/src/game-content/characters/people/vance-lowe/README.md) | 1 |
| Mireille Chen | char-mireille-chen | [mireille-chen](../../frontend/src/game-content/characters/people/mireille-chen/README.md) | 1 |
| Sergeant Derek Brody | char-derek-brody | [derek-brody](../../frontend/src/game-content/characters/people/derek-brody/README.md) | 1 |
| Dr. Aris Thorne | char-aris-thorne | [aris-thorne](../../frontend/src/game-content/characters/people/aris-thorne/README.md) | 1 |
| Katherine Mercer | char-katherine-mercer | [katherine-mercer](../../frontend/src/game-content/characters/people/katherine-mercer/README.md) | 1 |
| Soren Lind | char-soren-lind | [soren-lind](../../frontend/src/game-content/characters/people/soren-lind/README.md) | 1 |
| Silas Oryn | char-silas-oryn | [silas-oryn](../../frontend/src/game-content/characters/people/silas-oryn/README.md) | 1 |
| Elise Vance | char-elise-vance | [elise-vance](../../frontend/src/game-content/characters/people/elise-vance/README.md) | 1 |
| Tobias Gale | char-tobias-gale | [tobias-gale](../../frontend/src/game-content/characters/people/tobias-gale/README.md) | 1 |
| Julian Thorne | char-julian-thorne | [julian-thorne](../../frontend/src/game-content/characters/people/julian-thorne/README.md) | 1 |
| Maren Holt | char-maren-holt | [maren-holt](../../frontend/src/game-content/characters/people/maren-holt/README.md) | 1 |
| Kaelen Vance | char-kaelen-vance | [kaelen-vance](../../frontend/src/game-content/characters/people/kaelen-vance/README.md) | 1 |
| Nadia Cruz | char-nadia-cruz | [nadia-cruz](../../frontend/src/game-content/characters/people/nadia-cruz/README.md) | 1 |
| Thalia Vane | char-thalia-vane | [thalia-vane](../../frontend/src/game-content/characters/people/thalia-vane/README.md) | 1 |
| Gregory Bell | char-gregory-bell | [gregory-bell](../../frontend/src/game-content/characters/people/gregory-bell/README.md) | 1 |
| Corin Mercer | char-corin-mercer | [corin-mercer](../../frontend/src/game-content/characters/people/corin-mercer/README.md) | 1 |
| Mara Finch | char-mara-finch | [mara-finch](../../frontend/src/game-content/characters/people/mara-finch/README.md) | 1 |
| Vivienne Rose | char-vivienne-rose | [vivienne-rose](../../frontend/src/game-content/characters/people/vivienne-rose/README.md) | 1 |
| Leo Sterling | char-leo-sterling | [leo-sterling](../../frontend/src/game-content/characters/people/leo-sterling/README.md) | 1 |
| Talia Moss | char-talia-moss | [talia-moss](../../frontend/src/game-content/characters/people/talia-moss/README.md) | 1 |
| Felix Ward | char-felix-ward | [felix-ward](../../frontend/src/game-content/characters/people/felix-ward/README.md) | 1 |
| Dean Cassian Rook | char-cassian-rook | [cassian-rook](../../frontend/src/game-content/characters/people/cassian-rook/README.md) | 2 |
| Elara Vale | char-elara-vale | [elara-vale](../../frontend/src/game-content/characters/people/elara-vale/README.md) | 4 |
| Dr. Julian Paul Vance | char-julian-paul-vance | [julian-paul-vance](../../frontend/src/game-content/characters/people/julian-paul-vance/README.md) | 2 |
| Sora Takahashi | char-sora-takahashi | [sora-takahashi](../../frontend/src/game-content/characters/people/sora-takahashi/README.md) | 1 |
| Mai | char-mai | [mai](../../frontend/src/game-content/characters/people/mai/README.md) | 1 |
| Vaelen | char-vaelen | [vaelen](../../frontend/src/game-content/characters/people/vaelen/README.md) | 1 |
| Kaelen | char-kaelen | [kaelen](../../frontend/src/game-content/characters/people/kaelen/README.md) | 1 |
| Headmistress Vael | char-vael | [vael](../../frontend/src/game-content/characters/people/vael/README.md) | 1 |
| Professor Idris | char-idris | [idris](../../frontend/src/game-content/characters/people/idris/README.md) | 1 |
| Coach Rhen | char-rhen | [rhen](../../frontend/src/game-content/characters/people/rhen/README.md) | 1 |
| Instructor Lyse | char-lyse | [lyse](../../frontend/src/game-content/characters/people/lyse/README.md) | 1 |
| Professor Oryn | char-oryn | [oryn](../../frontend/src/game-content/characters/people/oryn/README.md) | 1 |
| Yumi Ishiyuma | char-yumi-ishiyuma | [yumi-ishiyuma](../../frontend/src/game-content/characters/people/yumi-ishiyuma/README.md) | 2 |
| Ulrich Stern | char-ulrich-stern | [ulrich-stern](../../frontend/src/game-content/characters/people/ulrich-stern/README.md) | 2 |
| Franz Hopper | char-franz-hopper | [franz-hopper](../../frontend/src/game-content/characters/people/franz-hopper/README.md) | 1 |
| Echo Neket | char-echo-neket | [echo-neket](../../frontend/src/game-content/characters/people/echo-neket/README.md) | 1 |
| Solis Agni | char-solis-agni | [solis-agni](../../frontend/src/game-content/characters/people/solis-agni/README.md) | 1 |
| Lyric Enya | char-lyric-enya | [lyric-enya](../../frontend/src/game-content/characters/people/lyric-enya/README.md) | 1 |
| Nerya | char-nerya | [nerya](../../frontend/src/game-content/characters/people/nerya/README.md) | 1 |
| Null Cantor | char-null-cantor | [null-cantor](../../frontend/src/game-content/characters/people/null-cantor/README.md) | 1 |
| Marcus Vance (Motorcycle technician) | char-marcus-vance-technician | [marcus-vance-technician](../../frontend/src/game-content/characters/people/marcus-vance-technician/README.md) | 1 |
| Dominic Sterling | char-dominic-sterling | [dominic-sterling](../../frontend/src/game-content/characters/people/dominic-sterling/README.md) | 1 |
| Driver of Navy Fleet SUV (Unidentified) | char-unidentified-driver-p404 | [unidentified-driver-p404](../../frontend/src/game-content/characters/people/unidentified-driver-p404/README.md) | 1 |
| Trooper Travis Miller | char-travis-miller | [travis-miller](../../frontend/src/game-content/characters/people/travis-miller/README.md) | 1 |
| Officer Tyler Ross | char-tyler-ross | [tyler-ross](../../frontend/src/game-content/characters/people/tyler-ross/README.md) | 1 |
| Jane Doe (Unidentified Subject) | char-unidentified-patient-pat95881 | [unidentified-patient-pat95881](../../frontend/src/game-content/characters/people/unidentified-patient-pat95881/README.md) | 1 |
| Kaelen Voss | char-kaelen-voss | [kaelen-voss](../../frontend/src/game-content/characters/people/kaelen-voss/README.md) | 1 |
| Student S. Mercer (Vertex House) | char-s-mercer | [s-mercer](../../frontend/src/game-content/characters/people/s-mercer/README.md) | 1 |

## Source index

| Character | Collection | Existing key | Person-owned file |
| --- | --- | --- | --- |
| Queen Maeryn Seraphima | NPCS | npc-maeryn | frontend/src/game-content/characters/people/maeryn-seraphima/world.json |
| Queen Maeryn Seraphima | story-bible | Queen Maeryn Seraphima | frontend/src/game-content/characters/people/maeryn-seraphima/story.json |
| High Warden Holly | NPCS | npc-holly | frontend/src/game-content/characters/people/holly/world.json |
| Chancellor Lucia | NPCS | npc-lucia | frontend/src/game-content/characters/people/lucia/world.json |
| Lord Neryx | NPCS | npc-neryx | frontend/src/game-content/characters/people/neryx/world.json |
| Grand Dispatcher Yoko | NPCS | npc-yoko | frontend/src/game-content/characters/people/yoko/world.json |
| High Forge-Master Ember | NPCS | npc-ember | frontend/src/game-content/characters/people/ember/world.json |
| Seer Keket | NPCS | npc-keket | frontend/src/game-content/characters/people/keket/world.json |
| Kieran Vesper | NPCS | npc-vesper | frontend/src/game-content/characters/people/kieran-vesper/world.json |
| Kieran Vesper | defaultInputs | MAID-OR-00481929 | frontend/src/game-content/characters/people/kieran-vesper/registry.json |
| Dr. Robert Mercer | NPCS | npc-mercer | frontend/src/game-content/characters/people/robert-mercer/world.json |
| Ambassador Christian Vance | seedPeople | P-101 | frontend/src/game-content/characters/people/christian-vance/agency.json |
| Ambassador Christian Vance | DGA_26_194_STARTING_PAYLOAD | P-101 | frontend/src/game-content/characters/people/christian-vance/investigations.json |
| Ambassador Christian Vance | INITIAL_MEDICAL_CHART | PAT-88194 | frontend/src/game-content/characters/people/christian-vance/investigations.json |
| Ambassador Christian Vance | seedRelationships | REL-002 | frontend/src/game-content/characters/people/christian-vance/relationships.json |
| Dr. Gregory Thorne | seedPeople | P-102 | frontend/src/game-content/characters/people/gregory-thorne/agency.json |
| Dr. Gregory Thorne | seedNPCs | NPC-THORNE | frontend/src/game-content/characters/people/gregory-thorne/agency.json |
| Dr. Gregory Thorne | DGA_26_194_STARTING_PAYLOAD | P-102 | frontend/src/game-content/characters/people/gregory-thorne/investigations.json |
| Dr. Gregory Thorne | seedRelationships | REL-003 | frontend/src/game-content/characters/people/gregory-thorne/relationships.json |
| Viktor Krell | seedPeople | P-103 | frontend/src/game-content/characters/people/viktor-krell/agency.json |
| Viktor Krell | seedNPCs | NPC-KRELL | frontend/src/game-content/characters/people/viktor-krell/agency.json |
| Viktor Krell | DGA_26_194_STARTING_PAYLOAD | P-103 | frontend/src/game-content/characters/people/viktor-krell/investigations.json |
| Viktor Krell | seedRelationships | REL-004 | frontend/src/game-content/characters/people/viktor-krell/relationships.json |
| Courier Marcus Vance (No Relation) | seedPeople | P-104 | frontend/src/game-content/characters/people/marcus-vance-courier/agency.json |
| Courier Marcus Vance (No Relation) | seedRelationships | REL-005 | frontend/src/game-content/characters/people/marcus-vance-courier/relationships.json |
| Elena Rostova | seedPeople | P-105 | frontend/src/game-content/characters/people/elena-rostova/agency.json |
| Elena Rostova | defaultInputs | MAID-OR-00481931 | frontend/src/game-content/characters/people/elena-rostova/registry.json |
| Elena Rostova | INV_26_402_STARTING_PAYLOAD | P-401 | frontend/src/game-content/characters/people/elena-rostova/investigations.json |
| Elena Rostova | seedRelationships | REL-006 | frontend/src/game-content/characters/people/elena-rostova/relationships.json |
| Director Evelyn Cross | seedNPCs | NPC-CROSS | frontend/src/game-content/characters/people/evelyn-cross/agency.json |
| Deputy Chief Miller | seedNPCs | NPC-MILLER | frontend/src/game-content/characters/people/deputy-chief-miller/agency.json |
| Specialist Marcus Chen | seedNPCs | NPC-CHEN | frontend/src/game-content/characters/people/marcus-chen/agency.json |
| Dr. Miracle Jerome | primarySeedAgent | DGA-SA-8804 | frontend/src/game-content/characters/people/miracle-jerome/agency.json |
| Dr. Miracle Jerome | AUREMAIL_DIRECTORY | dir-miracle-jerome | frontend/src/game-content/characters/people/miracle-jerome/mail.json |
| Dr. Miracle Jerome | defaultInputs | MAID-OR-00481927 | frontend/src/game-content/characters/people/miracle-jerome/registry.json |
| Dr. Miracle Jerome | seedRelationships | REL-001 | frontend/src/game-content/characters/people/miracle-jerome/relationships.json |
| Dr. Miracle Jerome | seedRelationships | REL-007 | frontend/src/game-content/characters/people/miracle-jerome/relationships.json |
| Jeremie Belpois | PEOPLE | jeremie | frontend/src/game-content/characters/people/jeremie-belpois/social.json |
| Jeremie Belpois | AUREMAIL_DIRECTORY | dir-jeremie | frontend/src/game-content/characters/people/jeremie-belpois/mail.json |
| Jeremie Belpois | personas | Jeremie | frontend/src/game-content/characters/people/jeremie-belpois/dialogue.json |
| Jeremie Belpois | phone-contact | Jeremie | frontend/src/game-content/characters/people/jeremie-belpois/phone.json |
| Jeremie Belpois | story-bible | Jeremie Belpois | frontend/src/game-content/characters/people/jeremie-belpois/story.json |
| Aelita Hopper | PEOPLE | aelita | frontend/src/game-content/characters/people/aelita-hopper/social.json |
| Aelita Hopper | AUREMAIL_DIRECTORY | dir-aelita | frontend/src/game-content/characters/people/aelita-hopper/mail.json |
| Aelita Hopper | personas | Aelita | frontend/src/game-content/characters/people/aelita-hopper/dialogue.json |
| Aelita Hopper | phone-contact | Aelita | frontend/src/game-content/characters/people/aelita-hopper/phone.json |
| Aelita Hopper | story-bible | Aelita Hopper | frontend/src/game-content/characters/people/aelita-hopper/story.json |
| Sissi Delmas | PEOPLE | sissi | frontend/src/game-content/characters/people/sissi-delmas/social.json |
| Sissi Delmas | personas | Sissi | frontend/src/game-content/characters/people/sissi-delmas/dialogue.json |
| Sissi Delmas | phone-contact | Sissi | frontend/src/game-content/characters/people/sissi-delmas/phone.json |
| Sissi Delmas | story-bible | Sissi Delmas | frontend/src/game-content/characters/people/sissi-delmas/story.json |
| Odd Della Robia | PEOPLE | odd | frontend/src/game-content/characters/people/odd-della-robia/social.json |
| Odd Della Robia | AUREMAIL_DIRECTORY | dir-odd | frontend/src/game-content/characters/people/odd-della-robia/mail.json |
| Odd Della Robia | phone-contact | Odd | frontend/src/game-content/characters/people/odd-della-robia/phone.json |
| Odd Della Robia | story-bible | Odd Della Robia | frontend/src/game-content/characters/people/odd-della-robia/story.json |
| Dr. Sharon Voss | PEOPLE | voss | frontend/src/game-content/characters/people/sharon-voss/social.json |
| Dr. Sharon Voss | AUREMAIL_DIRECTORY | dir-dr-voss | frontend/src/game-content/characters/people/sharon-voss/mail.json |
| Dr. Sharon Voss | phone-contact | Dr. Voss | frontend/src/game-content/characters/people/sharon-voss/phone.json |
| Riven Kalbera | PEOPLE | riven | frontend/src/game-content/characters/people/riven-kalbera/social.json |
| Riven Kalbera | AUREMAIL_DIRECTORY | dir-riven | frontend/src/game-content/characters/people/riven-kalbera/mail.json |
| Riven Kalbera | story-bible | Riven Kalbera | frontend/src/game-content/characters/people/riven-kalbera/story.json |
| Mara Thorne | PEOPLE | mara | frontend/src/game-content/characters/people/mara-thorne/social.json |
| Archivist Rowan | PEOPLE | rowan | frontend/src/game-content/characters/people/rowan/social.json |
| Director Ronald Sterling | INSTITUTIONAL_REGISTRY | sup-dga | frontend/src/game-content/characters/people/ronald-sterling/workplace.json |
| Vance Lowe | INSTITUTIONAL_REGISTRY | cw-dga-1 | frontend/src/game-content/characters/people/vance-lowe/workplace.json |
| Mireille Chen | INSTITUTIONAL_REGISTRY | cw-dga-2 | frontend/src/game-content/characters/people/mireille-chen/workplace.json |
| Sergeant Derek Brody | INSTITUTIONAL_REGISTRY | cw-dga-3 | frontend/src/game-content/characters/people/derek-brody/workplace.json |
| Dr. Aris Thorne | INSTITUTIONAL_REGISTRY | sup-faithmed | frontend/src/game-content/characters/people/aris-thorne/workplace.json |
| Katherine Mercer | INSTITUTIONAL_REGISTRY | cw-fm-1 | frontend/src/game-content/characters/people/katherine-mercer/workplace.json |
| Soren Lind | INSTITUTIONAL_REGISTRY | cw-fm-2 | frontend/src/game-content/characters/people/soren-lind/workplace.json |
| Silas Oryn | INSTITUTIONAL_REGISTRY | sup-finance | frontend/src/game-content/characters/people/silas-oryn/workplace.json |
| Elise Vance | INSTITUTIONAL_REGISTRY | cw-fin-1 | frontend/src/game-content/characters/people/elise-vance/workplace.json |
| Tobias Gale | INSTITUTIONAL_REGISTRY | cw-fin-2 | frontend/src/game-content/characters/people/tobias-gale/workplace.json |
| Julian Thorne | INSTITUTIONAL_REGISTRY | sup-archives | frontend/src/game-content/characters/people/julian-thorne/workplace.json |
| Maren Holt | INSTITUTIONAL_REGISTRY | cw-arc-1 | frontend/src/game-content/characters/people/maren-holt/workplace.json |
| Kaelen Vance | INSTITUTIONAL_REGISTRY | sup-engineer | frontend/src/game-content/characters/people/kaelen-vance/workplace.json |
| Nadia Cruz | INSTITUTIONAL_REGISTRY | cw-eng-1 | frontend/src/game-content/characters/people/nadia-cruz/workplace.json |
| Thalia Vane | INSTITUTIONAL_REGISTRY | sup-diplomat | frontend/src/game-content/characters/people/thalia-vane/workplace.json |
| Gregory Bell | INSTITUTIONAL_REGISTRY | cw-dip-1 | frontend/src/game-content/characters/people/gregory-bell/workplace.json |
| Corin Mercer | INSTITUTIONAL_REGISTRY | sup-warden | frontend/src/game-content/characters/people/corin-mercer/workplace.json |
| Mara Finch | INSTITUTIONAL_REGISTRY | cw-war-1 | frontend/src/game-content/characters/people/mara-finch/workplace.json |
| Vivienne Rose | INSTITUTIONAL_REGISTRY | sup-artist | frontend/src/game-content/characters/people/vivienne-rose/workplace.json |
| Leo Sterling | INSTITUTIONAL_REGISTRY | cw-art-1 | frontend/src/game-content/characters/people/leo-sterling/workplace.json |
| Talia Moss | INSTITUTIONAL_REGISTRY | sup-questnotice | frontend/src/game-content/characters/people/talia-moss/workplace.json |
| Felix Ward | INSTITUTIONAL_REGISTRY | cw-qn-1 | frontend/src/game-content/characters/people/felix-ward/workplace.json |
| Dean Cassian Rook | AUREMAIL_DIRECTORY | dir-dean-rook | frontend/src/game-content/characters/people/cassian-rook/mail.json |
| Dean Cassian Rook | personas | Dean Cassian Rook | frontend/src/game-content/characters/people/cassian-rook/dialogue.json |
| Elara Vale | AUREMAIL_DIRECTORY | dir-elara-vale | frontend/src/game-content/characters/people/elara-vale/mail.json |
| Elara Vale | defaultInputs | MAID-OR-00481926 | frontend/src/game-content/characters/people/elara-vale/registry.json |
| Elara Vale | FORMAL_INVESTIGATION_CASES | CASE-FM-401 | frontend/src/game-content/characters/people/elara-vale/investigations.json |
| Elara Vale | PATIENT_CARE_ASSIGNMENTS | pc-vale | frontend/src/game-content/characters/people/elara-vale/investigations.json |
| Dr. Julian Paul Vance | AUREMAIL_DIRECTORY | dir-julian-vance | frontend/src/game-content/characters/people/julian-paul-vance/mail.json |
| Dr. Julian Paul Vance | defaultInputs | MAID-OR-00481928 | frontend/src/game-content/characters/people/julian-paul-vance/registry.json |
| Sora Takahashi | defaultInputs | MAID-OR-00481930 | frontend/src/game-content/characters/people/sora-takahashi/registry.json |
| Mai | personas | Mai | frontend/src/game-content/characters/people/mai/dialogue.json |
| Vaelen | personas | Vaelen | frontend/src/game-content/characters/people/vaelen/dialogue.json |
| Kaelen | personas | Kaelen | frontend/src/game-content/characters/people/kaelen/dialogue.json |
| Headmistress Vael | story-bible | Headmistress Vael | frontend/src/game-content/characters/people/vael/story.json |
| Professor Idris | story-bible | Professor Idris | frontend/src/game-content/characters/people/idris/story.json |
| Coach Rhen | story-bible | Coach Rhen | frontend/src/game-content/characters/people/rhen/story.json |
| Instructor Lyse | story-bible | Instructor Lyse | frontend/src/game-content/characters/people/lyse/story.json |
| Professor Oryn | story-bible | Professor Oryn | frontend/src/game-content/characters/people/oryn/story.json |
| Yumi Ishiyuma | phone-contact | Yumi | frontend/src/game-content/characters/people/yumi-ishiyuma/phone.json |
| Yumi Ishiyuma | story-bible | Yumi Ishiyuma | frontend/src/game-content/characters/people/yumi-ishiyuma/story.json |
| Ulrich Stern | phone-contact | Ulrich | frontend/src/game-content/characters/people/ulrich-stern/phone.json |
| Ulrich Stern | story-bible | Ulrich Stern | frontend/src/game-content/characters/people/ulrich-stern/story.json |
| Franz Hopper | story-bible | Franz Hopper | frontend/src/game-content/characters/people/franz-hopper/story.json |
| Echo Neket | story-bible | Echo Neket | frontend/src/game-content/characters/people/echo-neket/story.json |
| Solis Agni | story-bible | Solis Agni | frontend/src/game-content/characters/people/solis-agni/story.json |
| Lyric Enya | story-bible | Lyric Enya | frontend/src/game-content/characters/people/lyric-enya/story.json |
| Nerya | phone-contact | Nerya | frontend/src/game-content/characters/people/nerya/phone.json |
| Null Cantor | phone-contact | Null Cantor | frontend/src/game-content/characters/people/null-cantor/phone.json |
| Marcus Vance | INV_26_402_STARTING_PAYLOAD | P-402 | frontend/src/game-content/characters/people/marcus-vance-technician/investigations.json |
| Dominic Sterling | INV_26_402_STARTING_PAYLOAD | P-403 | frontend/src/game-content/characters/people/dominic-sterling/investigations.json |
| Driver of Navy Fleet SUV (Unidentified) | INV_26_402_STARTING_PAYLOAD | P-404 | frontend/src/game-content/characters/people/unidentified-driver-p404/investigations.json |
| Trooper Travis Miller | INV_26_402_STARTING_PAYLOAD | P-405 | frontend/src/game-content/characters/people/travis-miller/investigations.json |
| Officer Tyler Ross | MOTORCYCLE_CRASH_MEDICAL_CHART | PAT-94102 | frontend/src/game-content/characters/people/tyler-ross/investigations.json |
| Jane Doe (Unidentified Subject) | OVERDOSE_TOXICOLOGY_MEDICAL_CHART | PAT-95881 | frontend/src/game-content/characters/people/unidentified-patient-pat95881/investigations.json |
| Kaelen Voss | FORMAL_INVESTIGATION_CASES | CASE-DGA-402 | frontend/src/game-content/characters/people/kaelen-voss/investigations.json |
| Student S. Mercer (Vertex House) | PATIENT_CARE_ASSIGNMENTS | pc-mercer | frontend/src/game-content/characters/people/s-mercer/investigations.json |

## Provenance and access

The user-supplied Game Doc.docx (user attachment) is identified by SHA-256 d2b3ec5e19966ece362e3fb9f81f523f2343f8883102e7b25d006f5cd00433fd. Its named-figure references remain in story-bible-characters.json. No document-only character is automatically inserted into gameplay.

Each profile entry contains corrected data plus its complete original source record and origin. Case knowledge, secrets, patient histories and answers are imported through their owning collections only; the shared identity lookup does not load those records or grant access.

The migrated scope is the previous structured inventory plus authored agency relationships. Prose-only names and incidental clinician signatures outside those sources are not claimed to have been exhaustively resolved. Shared cases, locations, organizations and story logic remain in their owning modules.

Run node scripts/build_character_content.mjs after changing identity metadata or adding references. Run node scripts/audit_characters.mjs to rebuild this directory. Both scripts support --check. Run node --test frontend/tests/character-registry.test.mjs for identity and preservation checks.
