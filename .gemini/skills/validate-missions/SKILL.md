---
name: validate-missions
description: Check normalized mission designs for missing objectives, completion rules, duplicate references, and undeclared required evidence.
---

Run the bundled Python entry script with an explicit JSON input path:
`python <skill-directory>/scripts/validate_missions.py /absolute/path/input.json`

For a smoke test, use `python <skill-directory>/scripts/validate_missions.py --example`.
Resolve <skill-directory> to this skill's installed folder before executing.
The helper module is bundled beside the entry script. No PYTHONPATH modification,
package installation, network access or sibling skill is required.
Examples are illustrative design records, not approved canon or native game saves.
Read examples/mission.json for the required interchange schema. Convert copies
explicitly when needed and disclose missing fields. Never change live records.
Exit 0 means structurally valid; 1 means invalid/unreadable data; 2 means CLI misuse.
Report actual stdout, stderr and exit code. Never infer successful execution.
A pass does not establish canon consistency, game eligibility or runtime correctness.
