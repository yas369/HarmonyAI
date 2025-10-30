from __future__ import annotations

import json
import os
import sys
from pathlib import Path

# Ensure module imports resolve when invoked via child process
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.generation import compose  # noqa: E402


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError as exc:
        sys.stderr.write(f"Invalid JSON input: {exc}\n")
        return 1

    required_fields = {"lyrics", "emotion", "genre", "tempo"}
    missing = required_fields - payload.keys()
    if missing:
        sys.stderr.write(f"Missing fields: {', '.join(sorted(missing))}\n")
        return 1

    try:
        wav, midi, pdf = compose(
            str(payload["lyrics"]),
            str(payload["emotion"]),
            str(payload["genre"]),
            int(payload["tempo"]),
        )
    except Exception as exc:  # pragma: no cover - surfaced to caller
        sys.stderr.write(f"Composition failed: {exc}\n")
        return 1

    result = {"audio": str(wav), "midi": str(midi), "pdf": str(pdf)}
    json.dump(result, sys.stdout)
    sys.stdout.write("\n")
    sys.stdout.flush()
    return 0


if __name__ == "__main__":
    os.environ.setdefault("PYTHONUNBUFFERED", "1")
    raise SystemExit(main())
