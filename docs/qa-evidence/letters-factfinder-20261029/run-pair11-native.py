#!/usr/bin/env python3
"""Run a Pair11 caller-page callback on the already-leased Amari QA page.

This runner never opens a browser or creates a profile, context, or tab. Root
owns lease acquisition/release and supplies the exact current entry/origin.
"""
import datetime as dt
import hashlib
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path("/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-b7-memory-cumulative-20261006")
BASE = ROOT / "docs/qa-evidence/letters-factfinder-20261029"
OWNER_FILE = ROOT / "tmp/amari-qa-browser-owner.json"
PROFILE = ROOT / "tmp/amari-production-qa-profile"
SESSION = "amari-targeted-contained"
CLI = Path("/Users/omosanya_main/.codex/skills/playwright/scripts/playwright_cli.sh")
MAX_EVIDENCE_BYTES = 8 * 1024 * 1024
SOURCE_FILES = [
    "src/App.jsx",
    "src/data/learningWorlds.js",
    "src/data/letterLaunch.js",
    "src/data/letterLaunchProgress.js",
    "src/data/factFinder.js",
    "src/components/games/LetterLaunch.jsx",
    "src/components/games/FactFinder.jsx",
    "src/components/games/letterLaunch.css",
    "src/components/games/factFinder.css",
    "src/components/shared/index.jsx",
    "src/components/home/discoveryVisuals.css",
]


def check_owner():
    expected_owner = os.environ.get("PAIR11_BROWSER_OWNER", "")
    if not expected_owner:
        raise SystemExit("Set PAIR11_BROWSER_OWNER to the exact owner granted by root")
    try:
        owner = json.loads(OWNER_FILE.read_text())
    except Exception as error:
        raise SystemExit(f"Cannot read current browser owner manifest: {error}") from error
    expires = dt.datetime.fromisoformat(owner.get("expiresAt", "1970-01-01T00:00:00+00:00"))
    if expires <= dt.datetime.now(dt.timezone.utc):
        raise SystemExit("The retained browser lease has expired")
    if owner.get("owner") != expected_owner or owner.get("active") is not True:
        raise SystemExit(f"Browser owner mismatch: expected active lease {expected_owner!r}")
    if Path(owner.get("profile", "")).resolve() != PROFILE.resolve():
        raise SystemExit("The active lease does not point to the existing Amari QA profile")


def parse_fault_plan(value):
    result = {}
    if not value.strip():
        return result
    for item in value.split(","):
        match = re.fullmatch(r"([0-3]):(local|badge|parent|chain)", item.strip())
        if not match:
            raise SystemExit("PAIR11_FAULT_PLAN entries must look like 0:local,1:badge,2:parent or 2:chain")
        index, mode = int(match.group(1)), match.group(2)
        if index in result:
            raise SystemExit(f"Duplicate fault plan for chapter index {index}")
        result[index] = mode
    return result


def main():
    if len(sys.argv) != 6:
        raise SystemExit("Usage: run-pair11-native.py ORIGIN WIDTH HEIGHT FLOW EXPECTED_ENTRY")
    origin = sys.argv[1].rstrip("/")
    width, height = map(int, sys.argv[2:4])
    flow, expected_entry = sys.argv[4:6]
    stage = os.environ.get("PAIR11_QA_STAGE", "native")
    if flow not in {"letters", "factfinder"}:
        raise SystemExit("FLOW must be letters or factfinder")
    if (width, height) not in {(390, 740), (1440, 844)}:
        raise SystemExit("supported viewports are 390x740 and 1440x844")
    if stage not in {"native", "production"}:
        raise SystemExit("PAIR11_QA_STAGE must be native or production")
    parsed = urlparse(origin)
    if parsed.hostname not in {"127.0.0.1", "localhost", "dinospace.netlify.app"}:
        raise SystemExit("origin is outside the approved native/canonical QA origins")
    if parsed.hostname == "dinospace.netlify.app" and (parsed.scheme != "https" or stage != "production"):
        raise SystemExit("canonical origin is allowed only in explicit production stage")
    if parsed.hostname != "dinospace.netlify.app" and stage != "native":
        raise SystemExit("noncanonical origins are native candidate only")
    if not re.fullmatch(r"/assets/arcade-[A-Za-z0-9_-]+\.js", expected_entry):
        raise SystemExit("expected entry must be the exact compiled arcade asset path")
    check_owner()

    html_path = ROOT / "dist/index.html"
    if not html_path.exists():
        raise SystemExit("dist/index.html is missing; root owns build output")
    module_entry = re.search(r'<script[^>]+type="module"[^>]+src="([^"]+)"', html_path.read_text())
    if not module_entry or module_entry.group(1) != expected_entry:
        raise SystemExit(f"Current dist entry does not match the caller-supplied expected entry {expected_entry}")

    fault_plan = parse_fault_plan(os.environ.get("PAIR11_FAULT_PLAN", "0:local,1:badge,2:parent"))
    code = (BASE / "pair11-native.cjs").read_text()
    values = {
        "__ORIGIN__": json.dumps(origin),
        "__EXPECTED_ENTRY__": json.dumps(expected_entry),
        "__WIDTH__": str(width),
        "__HEIGHT__": str(height),
        "__FLOW__": json.dumps(flow),
        "__FAULT_PLAN__": json.dumps(fault_plan),
        "__OUTPUT__": json.dumps(str(BASE)),
        "__STAGE__": json.dumps(stage),
    }
    for needle, replacement in values.items():
        if needle not in code:
            raise RuntimeError(f"Callback template is missing {needle}")
        code = code.replace(needle, replacement)
    if re.search(r"__[A-Z][A-Z0-9_]*__", code):
        raise RuntimeError("Callback has unresolved template placeholders")

    stamp = dt.datetime.now().strftime("%Y%m%dT%H%M%S") + f"-{time.time_ns() % 1_000_000_000:09d}"
    view = f"{width}x{height}"
    entry_tag = Path(expected_entry).name.replace(".js", "")
    report = BASE / f"{stage}-{flow}-{view}-{entry_tag}-{stamp}.json"
    if report.exists():
        raise RuntimeError(f"Refusing to replace prior evidence: {report}")
    existing_bytes = sum(path.stat().st_size for path in BASE.iterdir() if path.is_file() and path.name.startswith(("native-", "production-")))
    if existing_bytes >= MAX_EVIDENCE_BYTES:
        raise RuntimeError(f"Pair11 QA report/render budget is already at {existing_bytes} bytes; root review is required")

    result = subprocess.run(["bash", str(CLI), f"-s={SESSION}", "run-code", code], cwd=ROOT,
                            capture_output=True, text=True, timeout=1800)
    output = result.stdout + "\n" + result.stderr
    marker = "### Result\n"
    data = None
    if marker in result.stdout:
        raw = result.stdout.split(marker, 1)[1].split("\n### Ran", 1)[0]
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            data = None
    if data is None:
        data = {
            "passed": False, "flow": flow, "stage": stage, "origin": origin,
            "viewport": {"width": width, "height": height}, "entryIdentity": expected_entry,
            "rows": [], "failures": [{"message": "run-code returned no structured result", "outputTail": output[-7000:]}],
        }
    data["sourceHead"] = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip()
    data["sourceHashes"] = {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in SOURCE_FILES}
    data["faultPlanRequested"] = fault_plan if flow == "letters" else {}
    data["cliReturnCode"] = result.returncode
    report.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    final_bytes = sum(path.stat().st_size for path in BASE.iterdir() if path.is_file() and path.name.startswith(("native-", "production-")))
    summary = {
        "passed": bool(data.get("passed")) and result.returncode == 0,
        "flow": flow, "stage": stage, "origin": origin, "entry": data.get("entryIdentity"),
        "viewport": f"{width}x{height}", "report": str(report), "evidenceBytes": final_bytes,
        "faults": [{"chapterId":r.get("chapterId"),"requestedFault":r.get("requestedFault"),"stages":[x.get("stage")for x in r.get("stages",[])]}for r in (data.get("flowResult")or{}).get("faults",[])],
        "failure": ({"message": data["failures"][-1].get("message"), "evidence": data["failures"][-1].get("evidence")} if data.get("failures") else None),
    }
    print(json.dumps(summary, ensure_ascii=False))
    if final_bytes > MAX_EVIDENCE_BYTES:
        raise SystemExit("Pair11 evidence exceeded the 8 MiB budget; retain only unique failure evidence and one render")
    if result.returncode or not data.get("passed"):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
