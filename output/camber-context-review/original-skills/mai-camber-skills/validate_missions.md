---
name: validate-missions
description: Check normalized mission designs for missing objectives, completion rules, duplicate references, and undeclared required evidence.
---

Use this tool when checking the corresponding Miraverse design or exported records.
Keep `validate_missions.py` and `mai_validation.py` together in the working directory.
Run `python validate_missions.py examples/mission.json` for a demonstration.
Replace the example path with the user's normalized JSON file for a real check.

Input schema: see examples/mission.json. All displayed fields are required except
NPC romantic_interest, which is optional. NPC reference checks require the full
relevant NPC catalog. This is an interchange schema, not a native save format.
Normalize copies transparently; never silently discard records or missing fields.

Return the JSON errors and explain concrete repairs. Exit code 0 means the
structural checks passed; 1 means invalid data or unreadable input.
Do not infer canon approval, successful gameplay, or payment eligibility from a pass.
Do not edit game files, issue payments, install packages, or contact external services.
These tools cannot judge prose, personality consistency, or semantic plot holes.
