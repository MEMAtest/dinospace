#!/usr/bin/env python3
"""Run one Spelling Studio journey in the already-leased retained QA page.

Usage: run-spelling-native.py ORIGIN WIDTH HEIGHT
The caller owns the `amari-targeted-contained` lease. This runner reuses the
existing page with `run-code`; it never launches or opens a browser/tab/profile.
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path("/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-b7-memory-cumulative-20261006")
BASE = ROOT / "docs/qa-evidence/books-spelling-20261029"
PROFILE = "amari-targeted-contained"
CLI = "/Users/omosanya_main/.codex/skills/playwright/scripts/playwright_cli.sh"


def main():
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    origin = sys.argv[1].rstrip("/")
    width, height = map(int, sys.argv[2:4])
    if (width, height) not in {(390, 740), (1440, 844)}:
        raise SystemExit("supported viewports are 390x740 and 1440x844")

    html = (ROOT / "dist/index.html").read_text()
    match = re.search(r'<script[^>]+type="module"[^>]+src="([^"]+arcade-[^"]+\.js)"', html)
    if not match:
        raise RuntimeError("No compiled arcade entry found in dist/index.html; build is root-owned.")
    entry = match.group(1)
    stage = os.environ.get("SPELLING_QA_STAGE", "native")
    if stage not in {"native", "production"}:
        raise SystemExit("SPELLING_QA_STAGE must be native or production")
    start_level = int(os.environ.get("SPELLING_START_LEVEL", "0"))
    if start_level not in range(6):
        raise SystemExit("SPELLING_START_LEVEL must be an index from 0 through 5")
    code = (BASE / "spelling-native.cjs").read_text()
    clue_map = json.loads((BASE / "spelling-visible-clue-map.json").read_text())
    output_prefix = "production-spelling" if stage == "production" else "native-spelling"
    values = {
        "__ORIGIN__": json.dumps(origin),
        "__WIDTH__": str(width),
        "__HEIGHT__": str(height),
        "__START_LEVEL__": str(start_level),
        "__EXPECTED_ENTRY__": json.dumps(entry),
        "__CLUE_MAP__": json.dumps(clue_map, ensure_ascii=False),
        "__OUT__": json.dumps(str(BASE)),
    }
    for token, value in values.items():
        code = code.replace(token, value)
    view = f"{width}x{height}"
    entry_tag = Path(entry).name.replace(".js", "")
    report = BASE / f"{output_prefix}-{view}-{entry_tag}.json"
    if report.exists():
        raise RuntimeError(f"Refusing to replace prior evidence: {report}")

    result = subprocess.run(
        ["bash", CLI, f"-s={PROFILE}", "run-code", code],
        capture_output=True,
        text=True,
        timeout=2400,
        cwd=ROOT,
    )
    output = result.stdout + "\n" + result.stderr
    marker = "### Result\n"
    if marker not in result.stdout:
        data = {
            "passed": False,
            "stage": stage,
            "origin": origin,
            "width": width,
            "height": height,
            "startLevel": start_level + 1,
            "entryIdentity": entry,
            "completedLevelRuns": [],
            "responses": 0,
            "rows": [],
            "failures": [{"message": "run-code returned no structured result", "outputTail": output[-7000:]}],
        }
    else:
        payload = result.stdout.split(marker, 1)[1].split("\n### Ran", 1)[0]
        data = json.loads(payload)
        data["stage"] = stage
        data["cliReturnCode"] = result.returncode
    report.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({
        "passed": bool(data.get("passed")) and result.returncode == 0,
        "stage": stage,
        "origin": origin,
        "entry": data.get("entryIdentity"),
        "startLevel": data.get("startLevel", start_level + 1),
        "responses": data.get("responses", 0),
        "zeroDeltaReplayResponses": data.get("zeroDeltaReplayResponses", 0),
        "levels": len(data.get("completedLevelRuns", [])),
        "report": str(report),
        "failure": (data.get("failures") or [None])[-1],
    }, ensure_ascii=False))
    if result.returncode or not data.get("passed"):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
