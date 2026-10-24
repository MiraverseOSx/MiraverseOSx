from pathlib import Path
import sys
from mai_validation import main

if __name__ == "__main__":
    if sys.argv[1:] == ["--example"]:
        sys.argv[1:] = [str(Path(__file__).resolve().parents[1] / "examples" / "mission.json")]
    raise SystemExit(main("mission"))
