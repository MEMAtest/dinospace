#!/usr/bin/env python3
"""Run the frozen Curriculum callback on the already-leased QA page only.

This runner never launches a browser or creates a tab/profile/context. It is
prepared for later handoff; do not invoke until the source owner freezes the
selectors and root grants the exact browser lease.
"""
import json
import datetime as dt
import time
import os
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path("/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-b7-memory-cumulative-20261006")
BASE = ROOT / "docs/qa-evidence/curriculum-german-20261029"
OWNER_FILE = ROOT / "tmp/amari-qa-browser-owner.json"
PROFILE = ROOT / "tmp/amari-production-qa-profile"
PLAYWRIGHT_CLI = Path("/Users/omosanya_main/.codex/skills/playwright/scripts/playwright_cli.sh")
MAX_EVIDENCE_BYTES = 8 * 1024 * 1024


def payload(proc):
    marker = "### Result\n"
    if marker not in proc.stdout:
        return None
    raw = proc.stdout.split(marker, 1)[1].split("\n### Ran", 1)[0]
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def invoke(code, timeout=1800):
    return subprocess.run(["bash", str(PLAYWRIGHT_CLI), "-s=amari-targeted-contained", "run-code", code],
                          cwd=ROOT, capture_output=True, text=True, timeout=timeout)


def check_owner():
    owner_name = os.environ.get("PAIR10_BROWSER_OWNER", "")
    if not owner_name:
        raise SystemExit("Set PAIR10_BROWSER_OWNER to the exact owner granted by root before native execution")
    try:
        owner = json.loads(OWNER_FILE.read_text())
    except Exception as error:
        raise SystemExit(f"Cannot read current browser owner manifest: {error}") from error
    expires = dt.datetime.fromisoformat(owner.get("expiresAt", "1970-01-01T00:00:00+00:00"))
    if expires <= dt.datetime.now(dt.timezone.utc):
        raise SystemExit("Browser lease has expired")
    if owner.get("owner") != owner_name or owner.get("active") is not True or Path(owner.get("profile", "")).resolve() != PROFILE.resolve():
        raise SystemExit(f"Browser lease mismatch; expected active {owner_name!r} on the retained Amari profile")


def main():
    if len(sys.argv) != 6:
        raise SystemExit("Usage: run-curriculum-native.py ORIGIN WIDTH HEIGHT STAGE EXPECTED_ENTRY")
    origin = sys.argv[1].rstrip("/")
    width, height = map(int, sys.argv[2:4])
    stage, expected_entry = sys.argv[4:6]
    if (width, height) not in {(390, 740), (1440, 844)}:
        raise SystemExit("supported viewports are 390x740 and 1440x844")
    if stage not in {"native", "production"}:
        raise SystemExit("stage must be native or production")
    parsed = urlparse(origin)
    if parsed.hostname not in {"127.0.0.1", "localhost", "dinospace.netlify.app"}:
        raise SystemExit("origin is outside the approved native/canonical QA origins")
    if parsed.hostname == "dinospace.netlify.app" and (parsed.scheme != "https" or stage != "production"):
        raise SystemExit("canonical origin is allowed only as explicit production verification")
    if parsed.hostname != "dinospace.netlify.app" and stage != "native":
        raise SystemExit("noncanonical origins are native-candidate only")
    if not re.fullmatch(r"/assets/arcade-[A-Za-z0-9_-]+\.js", expected_entry):
        raise SystemExit("expected entry must be the exact compiled arcade asset path")
    check_owner()

    plan_result = subprocess.run(["node", str(BASE / "curriculum-native-plan.mjs")], cwd=ROOT,
                                 capture_output=True, text=True, check=True)
    plan = json.loads(plan_result.stdout)
    helper = (BASE / "curriculum-storage-fault.page.js").read_text().strip()
    code = (BASE / "curriculum-native.cjs").read_text()
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
    for needle, replacement in replacements.items():
        if needle not in code:
            raise RuntimeError(f"Harness template is missing placeholder {needle}")
        code = code.replace(needle, replacement)
    if re.search(r"__[A-Z][A-Z0-9_]*__", code):
        raise RuntimeError("Harness has unresolved template placeholders")

    stamp = dt.datetime.now().strftime("%Y%m%dT%H%M%S") + f"-{time.time_ns() % 1_000_000_000:09d}"
    report = BASE / f"{stage}-curriculum-{width}x{height}-{Path(expected_entry).stem}-{stamp}.json"
    if report.exists():
        raise SystemExit(f"Refusing to overwrite existing evidence: {report}")
    proc = invoke(code)
    output = proc.stdout + "\n" + proc.stderr
    data = payload(proc)
    if data is None:
        data = {"passed": False, "stage": stage, "origin": origin, "entryIdentity": expected_entry,
                "viewport": {"width": width, "height": height},
                "error": "run-code returned no structured result", "outputTail": output[-5000:]}
    data["stage"] = stage
    data["origin"] = origin
    data["expectedEntry"] = expected_entry
    data["cliReturnCode"] = proc.returncode
    encoded = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    if len(encoded.encode("utf-8")) > MAX_EVIDENCE_BYTES:
        raise RuntimeError("Refusing to write an oversized native report")
    report.write_text(encoded)
    print(json.dumps({"passed": bool(data.get("passed")) and proc.returncode == 0,
                      "stage": stage, "entry": expected_entry, "viewport": f"{width}x{height}",
                      "report": str(report), "moduleBands": data.get("moduleBandRunCount"),
                      "questions": data.get("questionCount"), "error": data.get("error")}, ensure_ascii=False))
    if proc.returncode or not data.get("passed"):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
