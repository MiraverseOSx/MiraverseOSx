"""Generate repeatable Miraverse examples and report outlines using Python's standard library.

Run: python scripts/generate_fictional_content.py --seed 42 --count 6
Examples are writing material, never official records or reward-bearing assignments.
"""
import argparse
import hashlib
import json
from pathlib import Path
import random

ROOT = Path(__file__).resolve().parents[1]
OUTLINES = [
    {"id": "investigation", "title": "Investigation report", "sections": ["Assignment and scope", "Sources examined", "Evidence and chain of custody", "Witness account", "Findings and uncertainties", "Recommended action"]},
    {"id": "clinical", "title": "Fictional clinical report", "sections": ["Presenting concern", "Observations", "Assessment and uncertainty", "Actions performed", "Response and follow-up"]},
    {"id": "administrative", "title": "Administrative statement", "sections": ["Purpose", "Chronology", "Supporting records", "Discrepancies", "Conclusion and next steps"]},
]

def generate_cases(seed: int, count: int) -> dict:
    rng = random.Random(seed)
    names = ["Iona Reed", "Soren Mire", "Talia Fen", "Neris Rowan", "Oren Vey", "Liora Ash"]
    districts = ["Glassline District", "Orynvell Shallows", "Aureline Library", "Cyacademy Commons"]
    scenarios = [
        ("Records discrepancy", "Two fictional transit records disagree about a departure time.", ["Ticket ledger", "Station clock log", "Passenger statement"]),
        ("Missing archive parcel", "An archive parcel arrived without its routing label.", ["Dispatch sheet", "Receiving register", "Courier statement"]),
        ("Resonance equipment review", "A training instrument returned inconsistent readings during a fictional practice session.", ["Calibration log", "Maintenance note", "Operator statement"]),
    ]
    cases = []
    for index in range(count):
        title, premise, sources = rng.choice(scenarios)
        case_id = "EXAMPLE-" + hashlib.sha256(f"{seed}:{index}".encode()).hexdigest()[:12].upper()
        cases.append({"id": case_id, "fictional": True, "title": title, "subject": rng.choice(names), "location": rng.choice(districts), "premise": premise, "sources": [{"id": f"{case_id}-S{n + 1}", "title": source} for n, source in enumerate(sources)], "writingPrompt": "Compare the sources, describe what is known, and identify what still needs verification. Do not invent missing evidence."})
    return {"schemaVersion": 1, "seed": seed, "purpose": "Fictional writing examples; no world-state or reward effects", "cases": cases}

def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--count", type=int, default=6)
    parser.add_argument("--output", type=Path, default=ROOT / "output" / "fictional-cases.json")
    parser.add_argument("--outlines", type=Path, default=ROOT / "frontend" / "src" / "data" / "report-outlines.json")
    args = parser.parse_args()
    if not 1 <= args.count <= 10000:
        parser.error("--count must be between 1 and 10000")
    if args.output.resolve() == args.outlines.resolve():
        parser.error("Case and outline output paths must differ")
    write_json(args.output, generate_cases(args.seed, args.count))
    write_json(args.outlines, OUTLINES)
    print(f"Generated {args.count} fictional cases: {args.output}")
    print(f"Generated {len(OUTLINES)} report outlines: {args.outlines}")

if __name__ == "__main__":
    main()
