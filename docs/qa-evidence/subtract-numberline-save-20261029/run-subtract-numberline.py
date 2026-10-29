#!/usr/bin/env python3
"""Run Pair 16 on the current leased Playwright page."""
import datetime as dt
import hashlib
import json
import os
import re
import subprocess
import sys
import time
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path("/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-b7-memory-cumulative-20261006")
BASE = ROOT / "docs/qa-evidence/subtract-numberline-save-20261029"
OWNER_FILE = ROOT / "tmp/amari-qa-browser-owner.json"
PROFILE = ROOT / "tmp/amari-production-qa-profile"
CLI = Path("/Users/omosanya_main/.codex/skills/playwright/scripts/playwright_cli.sh")
MAX_BYTES = 8 * 1024 * 1024
MAX_ENTRY_BYTES = 16 * 1024 * 1024
SOURCE_FILES = [
    "src/App.jsx", "src/gameCatalog.jsx", "src/data/learningWorlds.js",
    "src/data/arithmeticAdventure.js", "src/data/arithmeticProgress.js",
    "src/data/timeLineAdventure.js", "src/data/timeLineProgress.js",
    "src/data/batch4Narration.js", "src/data/playerRewards.js",
    "src/components/games/SubtractionStation.jsx", "src/components/games/NumberLineJump.jsx",
    "src/components/games/NumberLineJourney.jsx", "src/components/games/TimeLineLearningUI.jsx",
    "docs/game-delivery-20261027/integration-native.cjs",
    "docs/qa-evidence/subtract-numberline-save-20261029/protocol.md",
    "docs/qa-evidence/subtract-numberline-save-20261029/subtract-numberline-native.cjs",
]

def fail(message):
    raise SystemExit(message)

def preflight(origin, entry):
    request = urllib.request.Request(origin + "/", headers={"Cache-Control": "no-cache", "Pragma": "no-cache"})
    with urllib.request.urlopen(request, timeout=12) as response:
        document, status = response.read(2 * 1024 * 1024 + 1), response.status
    if status != 200 or len(document) > 2 * 1024 * 1024 or entry.encode() not in document:
        fail("Live document did not serve the exact supplied arcade entry")
    request = urllib.request.Request(origin + entry, headers={"Cache-Control": "no-cache", "Pragma": "no-cache"})
    with urllib.request.urlopen(request, timeout=20) as response:
        asset, asset_status = response.read(MAX_ENTRY_BYTES + 1), response.status
        content_type = response.headers.get("Content-Type", "")
    if asset_status != 200 or len(asset) > MAX_ENTRY_BYTES or "javascript" not in content_type.lower():
        fail("Exact arcade entry is unavailable as a bounded JavaScript response")
    return {"documentStatus": status, "entryStatus": asset_status, "entryContentType": content_type,
            "entryBytes": len(asset), "entrySha256": hashlib.sha256(asset).hexdigest(), "cacheControl": "no-cache request"}

def main():
    if len(sys.argv) != 6:
        fail("Usage: run-subtract-numberline.py ORIGIN WIDTH HEIGHT ENTRY SOURCE_RUNTIME_SHA")
    origin = sys.argv[1].rstrip("/")
    width, height = map(int, sys.argv[2:4])
    entry, runtime_sha = sys.argv[4:6]
    faults = os.environ.get("SUBTRACT_LINE_FAULTS") == "1"
    if origin not in {"http://127.0.0.1:5180", "https://dinospace.netlify.app"}:
        fail("Origin must be the existing local preview or canonical Amari site")
    if (width, height) not in {(390, 740), (1440, 844)}:
        fail("Viewport must be 390x740 or 1440x844")
    if faults and (width, height) != (390, 740):
        fail("SUBTRACT_LINE_FAULTS=1 is allowed only at 390x740")
    if not re.fullmatch(r"/assets/arcade-[A-Za-z0-9_-]+\.js", entry):
        fail("Supply the exact compiled arcade entry path")
    if not re.fullmatch(r"[0-9a-f]{40}", runtime_sha):
        fail("Supply the exact 40-character source/runtime SHA")
    if not OWNER_FILE.is_file():
        fail("The existing browser lease manifest is missing")
    owner = json.loads(OWNER_FILE.read_text())
    expected_owner = os.environ.get("SUBTRACT_LINE_BROWSER_OWNER", "")
    if not expected_owner:
        fail("Set SUBTRACT_LINE_BROWSER_OWNER to the explicitly issued lease owner")
    expires = dt.datetime.fromisoformat(owner.get("expiresAt", "1970-01-01T00:00:00+00:00"))
    if owner.get("owner") != expected_owner or owner.get("active") is not True or expires <= dt.datetime.now(dt.timezone.utc):
        fail("A matching active browser lease is required")
    if Path(owner.get("profile", "")).resolve() != PROFILE.resolve():
        fail("Lease does not reference the retained synthetic QA profile")
    if urlparse(origin).scheme == "http":
        dist = ROOT / "dist/index.html"
        match = re.search(r'<script[^>]+type="module"[^>]+src="([^"]+)"', dist.read_text()) if dist.exists() else None
        if not match or match.group(1) != entry:
            fail("Exact entry does not match the existing built preview")
    served = preflight(origin, entry)
    modules = {
        "./integration-native.cjs": (ROOT / "docs/game-delivery-20261027/integration-native.cjs").read_text(),
        "./subtract-numberline-native.cjs": (BASE / "subtract-numberline-native.cjs").read_text(),
    }
    stamp = dt.datetime.now().strftime("%Y%m%dT%H%M%S") + f"-{time.time_ns() % 1_000_000_000:09d}"
    stage = "production" if urlparse(origin).scheme == "https" else "native"
    failure_image = BASE / f"failure-{width}x{height}-{entry.rsplit('/', 1)[-1][:-3]}-{stamp}.jpg"
    callback = r'''async page => {
const sources=__MODULES__,loaded={};
const localRequire=id=>{if(loaded[id])return loaded[id];if(typeof sources[id]!=='string')throw Error('Unlisted module '+id);const m={exports:{}};new Function('require','module','exports',sources[id])(localRequire,m,m.exports);return loaded[id]=m.exports;};
return await localRequire('./subtract-numberline-native.cjs')(page,{origin:__ORIGIN__,expectedEntry:__ENTRY__,width:__WIDTH__,height:__HEIGHT__,failurePath:__FAILURE_PATH__,faults:__FAULTS__});
}'''
    substitutions = {"__MODULES__": json.dumps(modules, separators=(",", ":")), "__ORIGIN__": json.dumps(origin),
                     "__ENTRY__": json.dumps(entry), "__WIDTH__": str(width), "__HEIGHT__": str(height),
                     "__FAILURE_PATH__": json.dumps(str(failure_image)), "__FAULTS__": "true" if faults else "false"}
    for token, value in substitutions.items():
        if token not in callback: fail(f"Callback template is missing {token}")
        callback = callback.replace(token, value)
    if re.search(r"__[A-Z][A-Z0-9_]*__", callback): fail("Unresolved callback placeholder")
    report = BASE / f"{stage}-subtract-numberline-{width}x{height}-{entry.rsplit('/', 1)[-1][:-3]}-{stamp}.json"
    if report.exists(): fail(f"Refusing to overwrite {report}")
    bytes_before = sum(p.stat().st_size for p in BASE.rglob("*") if p.is_file())
    if bytes_before >= MAX_BYTES: fail(f"Evidence folder uses {bytes_before} bytes; pause for storage review")
    run = subprocess.run(["bash", str(CLI), "-s=amari-targeted-contained", "run-code", callback],
                         cwd=ROOT, capture_output=True, text=True, timeout=1800)
    raw = None
    if "### Result\n" in run.stdout:
        try: raw = json.loads(run.stdout.split("### Result\n", 1)[1].split("\n### Ran", 1)[0])
        except json.JSONDecodeError: raw = None
    if not isinstance(raw, dict):
        raw = {"passed": False, "failure": {"message": "Playwright callback returned no structured result", "outputTail": (run.stdout + run.stderr)[-4000:]}}
    raw.update({"stage": stage, "origin": origin, "runtimeSource": runtime_sha, "entry": entry,
                "sourceHead": subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip(),
                "sourceHashes": {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in SOURCE_FILES},
                "driverSHA256": hashlib.sha256((BASE / "subtract-numberline-native.cjs").read_bytes()).hexdigest(),
                "runnerSHA256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
                "cliReturnCode": run.returncode, "httpEntryPreflight": served, "leaseOwner": expected_owner,
                "faultModeRequested": faults,
                "scope": "Full actual-visible-control Subtraction Station and Number Line Jump acceptance for three chapters, six normal questions and six lower-rated replay questions per chapter at this viewport. No state reset, answer/queue injection, provider call, or automatic primary-control scrolling."})
    report.write_text(json.dumps(raw, indent=2, ensure_ascii=False) + "\n")
    bytes_after = sum(p.stat().st_size for p in BASE.rglob("*") if p.is_file())
    print(json.dumps({"passed": bool(raw.get("passed")) and run.returncode == 0, "stage": stage,
                      "viewport": f"{width}x{height}", "entry": entry, "questionRows": len(raw.get("rows", [])),
                      "report": str(report), "failure": raw.get("failure"), "bytesAdded": bytes_after - bytes_before}, ensure_ascii=False))
    if bytes_after > MAX_BYTES: fail("Pair 16 evidence folder exceeded the 8 MiB bound")
    if not raw.get("passed") or run.returncode != 0: fail(f"Subtraction + Number Line acceptance failed; see {report}")

if __name__ == "__main__": main()
