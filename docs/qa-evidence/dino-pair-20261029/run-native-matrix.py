"""Run one bounded, normal-UI Dino Detective journey in the already-leased QA tab.

Usage: python3 run-native-matrix.py ORIGIN amari|askia WIDTH [HEIGHT] [comma-separated-indexes]
The caller must first acquire the existing retained QA profile using the task's
owner lease. This runner never opens a browser, tab, context, or profile.
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path("/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-b7-memory-cumulative-20261006")
BASE = ROOT / "docs/qa-evidence/dino-pair-20261029"
PROFILE = "amari-targeted-contained"
CLI = "/Users/omosanya_main/.codex/skills/playwright/scripts/playwright_cli.sh"


def main():
    if len(sys.argv) < 4 or len(sys.argv) > 6:
        raise SystemExit(__doc__)
    origin, route, width_text = sys.argv[1:4]
    if route not in {"amari", "askia"}:
        raise SystemExit("route must be amari or askia")
    width = int(width_text)
    height = int(sys.argv[4]) if len(sys.argv) >= 5 else (740 if width == 390 else 844)
    default_runs = list(range(12)) if route == "amari" else list(range(5))
    runs = [int(item) for item in sys.argv[5].split(",")] if len(sys.argv) == 6 else default_runs
    limit = 12 if route == "amari" else 5
    if not runs or len(set(runs)) != len(runs) or any(item < 0 or item >= limit for item in runs):
        raise SystemExit(f"indexes must be unique values from 0 to {limit - 1}")
    if width not in {390, 1440} or height not in {740, 844}:
        raise SystemExit("supported viewport sizes are 390x740, 390x844, and 1440x844")
    if width == 1440 and height != 844:
        raise SystemExit("desktop viewport must be 1440x844")

    html = (ROOT / "dist/index.html").read_text()
    entry = re.search(r'<script[^>]+type="module"[^>]+src="([^"]+arcade-[^"]+\.js)"', html)
    if not entry:
        raise RuntimeError("No compiled arcade module entry found in dist/index.html; build is root-owned.")
    entry_identity = entry.group(1)
    code = (BASE / "native-matrix.cjs").read_text()
    stage = os.environ.get("PAIR7_QA_STAGE", "native")
    if stage not in {"native", "production"}:
        raise SystemExit("PAIR7_QA_STAGE must be native or production")
    attempt = os.environ.get("PAIR7_QA_ATTEMPT", "")
    if attempt and not re.fullmatch(r"[A-Za-z0-9._-]{1,32}", attempt):
        raise SystemExit("PAIR7_QA_ATTEMPT must be 1-32 letters, digits, dots, underscores, or hyphens")
    if stage == "production":
        code = code.replace("'/native-'", "'/production-'").replace("'/failure-'", "'/production-failure-'")
    values = {
        "__ORIGIN__": json.dumps(origin),
        "__PLAYER__": json.dumps(route),
        "__ROUTE__": json.dumps(route),
        "__WIDTH__": str(width),
        "__HEIGHT__": str(height),
        "__EXPECTED_ENTRY__": json.dumps(entry_identity),
        "__RUNS__": json.dumps(runs),
        "__ATTEMPT__": json.dumps(attempt),
    }
    for token, value in values.items():
        code = code.replace(token, value)
    view = str(width) if height == 844 else f"{width}x{height}"
    entry_tag = Path(entry_identity).name.replace(".js", "")
    run_tag = "runs-" + "_".join(map(str, runs))
    attempt_tag = f"-attempt-{attempt}" if attempt else ""
    stem = f"{stage}-{route}-{view}-{entry_tag}-{run_tag}{attempt_tag}"
    output = BASE / f"{stem}.json"
    if output.exists():
        raise RuntimeError(f"Refusing to replace prior evidence: {output}")

    result = subprocess.run(
        ["bash", CLI, f"-s={PROFILE}", "run-code", code],
        capture_output=True,
        text=True,
        timeout=1800,
        cwd=ROOT,
    )
    raw_output = result.stdout + "\n" + result.stderr
    marker = "### Result\n"
    if marker not in result.stdout:
        data = {
            "passed": False,
            "stage": stage,
            "route": route,
            "player": route,
            "width": width,
            "height": height,
            "entryIdentity": entry_identity,
            "completedLevelRuns": [],
            "levelRunCount": 0,
            "rows": [],
            "errors": [{"message": "run-code returned no structured result", "outputTail": raw_output[-6000:]}],
        }
    else:
        payload = result.stdout.split(marker, 1)[1].split("\n### Ran", 1)[0]
        data = json.loads(payload)
        data["stage"] = stage
        data["cliReturnCode"] = result.returncode
    output.write_text(json.dumps(data, indent=2) + "\n")
    print(json.dumps({
        "passed": bool(data.get("passed")) and result.returncode == 0,
        "stage": stage,
        "entry": data.get("entryIdentity"),
        "levels": data.get("levelRunCount", 0),
        "finds": data.get("primaryFinds"),
        "report": str(output),
        "failure": (data.get("failures") or data.get("errors") or [None])[-1],
    }))
    if result.returncode or not data.get("passed"):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
