#!/usr/bin/env python3
"""Run the Chess actual-control protocol on the already-leased retained page.

The root operator must acquire the exact browser lease first. This runner never
launches a browser, tab, context, or profile, and it never resets app storage.
"""
import datetime as dt
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path("/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-b7-memory-cumulative-20261006")
BASE = ROOT / "docs/qa-evidence/chess-jigsaw-20261029"
OWNER_FILE = ROOT / "tmp/amari-qa-browser-owner.json"
SESSION = "amari-targeted-contained"
CLI = Path.home() / ".codex/skills/playwright/scripts/playwright_cli.sh"


def main():
    if len(sys.argv) != 4:
        raise SystemExit("Usage: run-chess-native.py ORIGIN 390|1440 native|production")
    origin, width_text, stage = sys.argv[1:]
    width = int(width_text)
    if width not in {390, 1440} or stage not in {"native", "production"}:
        raise SystemExit("Supported viewports are 390x740 and 1440x844; stage must be native or production")
    if not re.fullmatch(r"https?://[^\s]+", origin):
        raise SystemExit("origin must be an explicit http(s) origin")

    owner = os.environ.get("PAIR9_BROWSER_OWNER")
    if not owner:
        raise SystemExit("Set PAIR9_BROWSER_OWNER to the exact active lease owner before running")
    if not OWNER_FILE.exists():
        raise SystemExit("No retained-browser lease; root must acquire the same session before running")
    lease = json.loads(OWNER_FILE.read_text())
    expires = dt.datetime.fromisoformat(lease.get("expiresAt", "1970-01-01T00:00:00+00:00"))
    if not lease.get("active") or lease.get("owner") != owner or expires <= dt.datetime.now(dt.timezone.utc):
        raise SystemExit(f"Retained-browser lease is not active for {owner}")

    html = (ROOT / "dist/index.html").read_text()
    entries = re.findall(r'<script[^>]+type="module"[^>]+src="([^"]+)"', html)
    if not entries:
        raise SystemExit("No compiled module entry in dist/index.html; builds are root-owned")
    entry = entries[0]
    expected_entry = os.environ.get("PAIR9_EXPECTED_ENTRY", Path(entry).name)
    if stage == "production" and "PAIR9_EXPECTED_ENTRY" not in os.environ:
        raise SystemExit("Set PAIR9_EXPECTED_ENTRY to the verified public module basename before production QA")

    plan = subprocess.run(["node", str(BASE / "chess-native-plan.mjs")], cwd=ROOT,
                          capture_output=True, text=True, timeout=30, check=True).stdout.strip()
    code = (BASE / "chess-native.cjs").read_text()
    replacements = {
        "__ORIGIN__": json.dumps(origin),
        "__WIDTH__": str(width),
        "__HEIGHT__": str(740 if width == 390 else 844),
        "__EXPECTED_ENTRY__": json.dumps(expected_entry),
        "__PLAN__": plan,
        "__OUT__": json.dumps(str(BASE)),
        "__STAGE__": json.dumps(stage),
    }
    for token, value in replacements.items():
        code = code.replace(token, value)

    stamp = dt.datetime.now().strftime("%Y%m%dT%H%M%S") + f"-{time.time_ns() % 1_000_000_000:09d}"
    output = BASE / f"{stage}-chess-amari-{width}x{740 if width == 390 else 844}-{stamp}.json"
    if output.exists():
        raise SystemExit("Refusing to replace prior evidence")
    result = subprocess.run(["bash", str(CLI), f"-s={SESSION}", "run-code", code], cwd=ROOT,
                            capture_output=True, text=True, timeout=900)
    marker = "### Result\n"
    if marker not in result.stdout:
        data = {
            "passed": False, "stage": stage, "player": "amari", "width": width,
            "height": 740 if width == 390 else 844, "entry": entry,
            "error": (result.stdout + "\n" + result.stderr)[-4000:],
        }
    else:
        payload = result.stdout.split(marker, 1)[1].split("\n### Ran", 1)[0]
        data = json.loads(payload)
        data.update(stage=stage, cliReturnCode=result.returncode)
        validation = subprocess.run(["node", str(BASE / "validate-chess-native-report.mjs")], cwd=ROOT,
                                    input=json.dumps(data), capture_output=True, text=True, timeout=30)
        if validation.returncode == 0 and validation.stdout.strip():
            legal_validation = json.loads(validation.stdout.strip())
        else:
            legal_validation = {"passed": False, "errors": [{"error": (validation.stderr or validation.stdout)[-2500:]}]}
        data["legalHistoryValidation"] = legal_validation
        if not legal_validation.get("passed"):
            data["passed"] = False
            data.setdefault("failures", []).append({"message": "Actual saved chess history did not pass offline legality/FEN replay validation.", "validation": legal_validation})
    output.write_text(json.dumps(data, indent=2) + "\n")
    summary = {
        "passed": bool(data.get("passed")) and result.returncode == 0,
        "stage": stage, "player": "amari", "viewport": f"{width}x{740 if width == 390 else 844}",
        "entry": entry, "openingCases": data.get("openingCaseCount"),
        "legalHistories": (data.get("legalHistoryValidation") or {}).get("openingsChecked"),
        "coverageLimitations": data.get("coverageLimitations", []),
        "report": str(output),
    }
    print(json.dumps(summary))
    if result.returncode or not data.get("passed"):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
