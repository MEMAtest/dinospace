#!/usr/bin/env python3
"""Run the German Garage callback on the already-leased QA page only.

This runner never launches a browser or creates a tab/profile/context. It is a
bounded harness utility, not acceptance evidence until an authorized owner
executes it against the frozen compiled entry.
"""
import datetime as dt
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path("/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-b7-memory-cumulative-20261006")
BASE = ROOT / "docs/qa-evidence/curriculum-german-20261029"
OWNER_FILE = ROOT / "tmp/amari-qa-browser-owner.json"
PROFILE = ROOT / "tmp/amari-production-qa-profile"
PLAYWRIGHT_CLI = Path("/Users/omosanya_main/.codex/skills/playwright/scripts/playwright_cli.sh")
MAX_EVIDENCE_BYTES = 8 * 1024 * 1024


def extract_result(stdout):
    marker = "### Result\n"
    if marker not in stdout:
        return None
    raw = stdout.split(marker, 1)[1].split("\n### Ran", 1)[0]
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def verify_owner():
    expected_owner = os.environ.get("PAIR10_BROWSER_OWNER", "")
    if not expected_owner:
        raise SystemExit("Set PAIR10_BROWSER_OWNER to the exact active lease granted by root")
    try:
        owner = json.loads(OWNER_FILE.read_text())
    except Exception as error:
        raise SystemExit(f"Cannot read the current browser owner manifest: {error}") from error
    expires = dt.datetime.fromisoformat(owner.get("expiresAt", "1970-01-01T00:00:00+00:00"))
    if expires <= dt.datetime.now(dt.timezone.utc):
        raise SystemExit("The browser lease has expired")
    if owner.get("owner") != expected_owner or owner.get("active") is not True:
        raise SystemExit(f"The current lease is not active for {expected_owner!r}")
    if Path(owner.get("profile", "")).resolve() != PROFILE.resolve():
        raise SystemExit("The lease does not point at the retained Amari QA profile")


def main():
    if len(sys.argv) != 6:
        raise SystemExit("Usage: run-german-native.py ORIGIN WIDTH HEIGHT STAGE EXPECTED_ENTRY")
    origin = sys.argv[1].rstrip("/")
    width, height = map(int, sys.argv[2:4])
    stage, expected_entry = sys.argv[4:6]
    if (width, height) not in {(390, 740), (1440, 844)}:
        raise SystemExit("Supported viewports are 390x740 and 1440x844")
    if stage not in {"native", "production"}:
        raise SystemExit("Stage must be native or production")
    parsed = urlparse(origin)
    if parsed.hostname not in {"127.0.0.1", "localhost", "dinospace.netlify.app"}:
        raise SystemExit("Origin is outside the approved native/canonical QA origins")
    if parsed.hostname == "dinospace.netlify.app" and (parsed.scheme != "https" or stage != "production"):
        raise SystemExit("Canonical origin is permitted only for explicit production verification")
    if parsed.hostname != "dinospace.netlify.app" and stage != "native":
        raise SystemExit("Noncanonical origins are native-candidate only")
    if not re.fullmatch(r"/assets/arcade-[A-Za-z0-9_-]+\.js", expected_entry):
        raise SystemExit("Expected entry must be the exact compiled arcade asset path")
    verify_owner()

    plan_proc = subprocess.run(["node", str(BASE / "german-native-plan.mjs")], cwd=ROOT,
                               capture_output=True, text=True, check=True)
    plan = json.loads(plan_proc.stdout)
    helper = (BASE / "german-storage-fault.page.js").read_text().strip()
    code = (BASE / "german-native.cjs").read_text()
    replacements = {
        "__ORIGIN__": json.dumps(origin),
        "__EXPECTED_ENTRY__": json.dumps(expected_entry),
        "__WIDTH__": str(width),
        "__HEIGHT__": str(height),
        "__STAGE__": json.dumps(stage),
        "__OUT__": json.dumps(str(BASE)),
        "__PLAN__": json.dumps(plan, ensure_ascii=False, separators=(",", ":")),
        "__FAULT_HELPER__": helper,
    }
    for placeholder, value in replacements.items():
        if placeholder not in code:
            raise SystemExit(f"German callback is missing template placeholder {placeholder}")
        code = code.replace(placeholder, value)
    if re.search(r"__[A-Z][A-Z0-9_]*__", code):
        raise SystemExit("German callback contains an unresolved template placeholder")

    stamp = dt.datetime.now().strftime("%Y%m%dT%H%M%S") + f"-{time.time_ns() % 1_000_000_000:09d}"
    report = BASE / f"{stage}-german-{width}x{height}-{Path(expected_entry).stem}-{stamp}.json"
    if report.exists():
        raise SystemExit(f"Refusing to overwrite evidence: {report}")
    proc = subprocess.run(["bash", str(PLAYWRIGHT_CLI), "-s=amari-targeted-contained", "run-code", code],
                          cwd=ROOT, capture_output=True, text=True, timeout=2400)
    output = proc.stdout + "\n" + proc.stderr
    data = extract_result(proc.stdout)
    if data is None:
        data = {"passed": False, "error": "run-code returned no structured result", "outputTail": output[-5000:]}
    data["stage"] = stage
    data["origin"] = origin
    data["expectedEntry"] = expected_entry
    data["viewport"] = {"width": width, "height": height}
    data["cliReturnCode"] = proc.returncode
    encoded = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    if len(encoded.encode("utf-8")) > MAX_EVIDENCE_BYTES:
        raise SystemExit("Refusing to save a report larger than 8 MiB")
    report.write_text(encoded)
    print(json.dumps({
        "passed": bool(data.get("passed")) and proc.returncode == 0,
        "stage": stage,
        "entry": expected_entry,
        "viewport": f"{width}x{height}",
        "report": str(report),
        "chapters": data.get("chapters", []),
        "answers": data.get("totalChapterAnswers"),
        "practiceModes": data.get("practice", {}).get("modeCount"),
        "error": data.get("error"),
    }, ensure_ascii=False))
    if proc.returncode or not data.get("passed"):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
