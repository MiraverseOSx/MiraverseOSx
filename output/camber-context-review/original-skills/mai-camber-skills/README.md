# MAI Camber starter skills

Three read-only Python tools, using only the standard library. No installation
or connection to your local game is included. Example citizens and missions are
illustrative, not established lore. These tools validate explicit JSON interchange
records, not arbitrary TypeScript, Word lore documents, or native game saves.

## Register in Camber
1. Extract the ZIP and upload the files to Camber Stash, preserving this folder structure.
2. In MAI -> Agent Context -> Skills -> + Skill, select a Python entry script.
3. Paste the contents of its matching Markdown file into the skill description.
4. Repeat for validate_npcs.py, validate_missions.py, and audit_rewards.py.
5. Keep mai_validation.py accessible beside the scripts in the execution directory.
6. Test each tool on its examples/*.json before reviewing and committing the agent version.

Camber may also create/register skills from a chat request. Give MAI the files and
ask her to register the three entry scripts with their provided descriptions.

## Example requests
- Validate examples/npc.json with validate-npcs and explain any errors.
- Check my normalized mission catalog for missing required sources.
- Audit this complete exported reward ledger for duplicate entitlements.

NPC schema: id, name, personality, profile_style, closeness, trust, tension,
interests (string list), relationship_ids (NPC ID list); romantic_interest optional.
Mission schema: id, title, owner_app, completion_rule, objective_ids, source_ids,
required_source_ids (the last three are string lists).
Reward schema: id, player_id, completion_id, reward_key, credits, xp, bits.
Use distinct reward keys for distinct authorized awards. Include all relevant
receipts; omissions cannot be detected. This checker cannot verify actual payout
or eligibility and does not change any record.

## Verification
python test_skills.py
Tests cover valid examples, broken references, duplicate entitlements, malformed
input and negative amounts. Local verification does not establish Camber registration.
