"""Read-only validators for explicitly normalized Miraverse design records.
These schemas are interchange formats, not native game-save schemas.
"""
import argparse
import json
from collections import Counter
from pathlib import Path

def validate(kind, data):
    if kind not in {"npc", "mission", "rewards"}:
        return {"valid": False, "errors": ["Unknown validator kind"]}
    errors=[]
    if not isinstance(data, list):
        return {"valid": False, "errors": ["Input must be a JSON array of objects."]}
    ids=[]
    for i, r in enumerate(data):
        label=f"record {i + 1}"
        if not isinstance(r, dict):
            errors.append(f"{label}: expected an object");continue
        rid=r.get("id")
        if not isinstance(rid,str) or not rid.strip():
            errors.append(f"{label}: nonempty string id required")
        else:
            ids.append(rid);label=rid
        if kind == "npc":
            for field in ["name", "personality", "profile_style"]:
                if not isinstance(r.get(field),str) or not r[field].strip():
                    errors.append(f"{label}: nonempty {field} required")
            for field in ["closeness", "trust", "tension", "romantic_interest"]:
                if field not in r:
                    if field != "romantic_interest": errors.append(f"{label}: {field} required")
                    continue
                value=r[field]
                if type(value) not in (int,float) or not 0 <= value <= 100:
                    errors.append(f"{label}: {field} must be numeric from 0 to 100")
            for field in ["interests", "relationship_ids"]:
                if not isinstance(r.get(field),list) or not all(isinstance(x,str) and x.strip() for x in r[field]):
                    errors.append(f"{label}: {field} must be a list of nonempty strings")
        elif kind == "mission":
            for field in ["title", "owner_app", "completion_rule"]:
                if not isinstance(r.get(field),str) or not r[field].strip():
                    errors.append(f"{label}: nonempty {field} required")
            for field in ["objective_ids", "source_ids", "required_source_ids"]:
                values=r.get(field)
                if not isinstance(values,list) or not all(isinstance(x,str) and x.strip() for x in values):
                    errors.append(f"{label}: {field} must be a list of nonempty strings")
                elif len(values)!=len(set(values)):
                    errors.append(f"{label}: duplicate {field}")
            if isinstance(r.get("objective_ids"),list) and not r["objective_ids"]:
                errors.append(f"{label}: at least one objective required")
            available=r.get("source_ids")
            required=r.get("required_source_ids")
            if isinstance(available,list) and isinstance(required,list):
                for source in required:
                    if source not in available: errors.append(f"{label}: required source not declared: {source}")
        elif kind == "rewards":
            for field in ["player_id", "completion_id", "reward_key"]:
                if not isinstance(r.get(field),str) or not r[field].strip():
                    errors.append(f"{label}: nonempty {field} required")
            for field in ["credits", "xp", "bits"]:
                value=r.get(field)
                if type(value) is not int or value < 0:
                    errors.append(f"{label}: {field} must be a nonnegative integer")
    for rid,n in Counter(ids).items():
        if n > 1: errors.append(f"Duplicate id: {rid}")
    if kind == "npc":
        known=set(ids)
        for r in data:
            if isinstance(r,dict) and isinstance(r.get("relationship_ids"),list):
                for target in r["relationship_ids"]:
                    if isinstance(target,str) and target not in known:
                        errors.append(f"{r.get('id')}: unknown relationship id: {target}")
    if kind == "rewards":
        seen=set()
        for r in data:
            if not isinstance(r,dict): continue
            values=[r.get(k) for k in ["player_id", "completion_id", "reward_key"]]
            if all(isinstance(x,str) and x.strip() for x in values):
                key=tuple(values)
                if key in seen: errors.append(f"Duplicate reward entitlement: {key}")
                seen.add(key)
    return {"valid": not errors, "checked_records": len(data), "errors": errors,
            "scope": "Structural checks only; canon, prose quality, eligibility and runtime behavior require separate review."}

def main(kind):
    parser=argparse.ArgumentParser(description=f"Validate normalized Miraverse {kind} JSON without modifying it.")
    parser.add_argument("input", help="Path to normalized JSON array")
    args=parser.parse_args()
    try:
        data=json.loads(Path(args.input).read_text(encoding="utf-8-sig"))
        result=validate(kind,data)
    except (OSError,ValueError) as error:
        result={"valid":False,"errors":[str(error)]}
    print(json.dumps(result,indent=2,ensure_ascii=False))
    return 0 if result["valid"] else 1
