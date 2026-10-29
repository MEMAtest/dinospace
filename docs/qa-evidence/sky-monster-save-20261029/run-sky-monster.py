#!/usr/bin/env python3
"""Run one Pair 14 viewport on the already leased Playwright page."""
import datetime as dt
import hashlib
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path("/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-b7-memory-cumulative-20261006")
BASE = ROOT / "docs/qa-evidence/sky-monster-save-20261029"
OWNER_FILE = ROOT / "tmp/amari-qa-browser-owner.json"
PROFILE = ROOT / "tmp/amari-production-qa-profile"
CLI = Path("/Users/omosanya_main/.codex/skills/playwright/scripts/playwright_cli.sh")
MAX_BYTES = 8 * 1024 * 1024
MAX_ENTRY_BYTES = 16 * 1024 * 1024
SOURCE_FILES = [
    "src/App.jsx", "src/gameCatalog.jsx", "src/data/learningWorlds.js",
    "src/data/skyShapes.js", "src/data/skyShapesProgress.js",
    "src/data/monsterMathEpisodes.js", "src/data/monsterMathProgress.js",
    "src/data/playerRewards.js", "src/data/batch2Narration.js",
    "src/components/games/JetSkyShapes.jsx", "src/components/games/MonsterMath.jsx",
    "docs/game-delivery-20261027/integration-native.cjs",
    "docs/qa-evidence/sky-monster-save-20261029/protocol.md",
    "docs/qa-evidence/sky-monster-save-20261029/sky-monster-native.cjs",
]


def fail(message):
    raise SystemExit(message)


def http_preflight(origin, entry):
    request = urllib.request.Request(origin + "/", headers={"Cache-Control": "no-cache", "Pragma": "no-cache"})
    with urllib.request.urlopen(request, timeout=12) as response:
        html = response.read(2 * 1024 * 1024 + 1)
        status = response.status
    if status != 200 or len(html) > 2 * 1024 * 1024 or entry.encode() not in html:
        fail("Live document did not serve the exact requested arcade entry")
    asset_request = urllib.request.Request(origin + entry, headers={"Cache-Control": "no-cache", "Pragma": "no-cache"})
    with urllib.request.urlopen(asset_request, timeout=20) as response:
        asset = response.read(MAX_ENTRY_BYTES + 1)
        asset_status = response.status
        content_type = response.headers.get("Content-Type", "")
    if asset_status != 200 or len(asset) > MAX_ENTRY_BYTES or "javascript" not in content_type.lower():
        fail("Exact arcade entry is unavailable as a bounded JavaScript response")
    return {"documentStatus": status, "entryStatus": asset_status, "entryContentType": content_type,
            "entryBytes": len(asset), "entrySha256": hashlib.sha256(asset).hexdigest(), "cacheControl": "no-cache request"}


def main():
    if len(sys.argv) != 6:
        fail("Usage: run-sky-monster.py ORIGIN WIDTH HEIGHT ENTRY RUNTIME_SHA")
    origin = sys.argv[1].rstrip("/")
    width, height = map(int, sys.argv[2:4])
    entry, runtime_sha = sys.argv[4:6]
    faults = os.environ.get("SKY_MONSTER_FAULTS") == "1"
    mode = os.environ.get("SKY_MONSTER_MODE", "full")
    parsed = urlparse(origin)
    if mode not in {"full", "prepare-sky-pending"}:
        fail("SKY_MONSTER_MODE must be full or prepare-sky-pending")
    if origin not in {"http://127.0.0.1:5180", "https://dinospace.netlify.app"}:
        fail("Origin must be the existing local preview or canonical Amari site")
    if (width, height) not in {(390, 740), (1440, 844)}:
        fail("Viewport must be 390x740 or 1440x844")
    if faults and width != 390:
        fail("SKY_MONSTER_FAULTS=1 is allowed only for the 390px viewport")
    if mode == "prepare-sky-pending" and (not faults or (width, height) != (390, 740)):
        fail("prepare-sky-pending requires SKY_MONSTER_FAULTS=1 at 390x740 on the existing preview or canonical site")
    if not re.fullmatch(r"/assets/arcade-[A-Za-z0-9_-]+\.js", entry):
        fail("Supply the exact compiled arcade entry path")
    if not re.fullmatch(r"[0-9a-f]{40}", runtime_sha):
        fail("Supply the exact 40-character runtime SHA")
    if not OWNER_FILE.is_file():
        fail("Existing browser lease manifest is missing")
    owner = json.loads(OWNER_FILE.read_text())
    expected_owner = os.environ.get("SKY_MONSTER_BROWSER_OWNER", "")
    if not expected_owner:
        fail("Set SKY_MONSTER_BROWSER_OWNER to the explicitly issued lease owner")
    expires = dt.datetime.fromisoformat(owner.get("expiresAt", "1970-01-01T00:00:00+00:00"))
    if owner.get("owner") != expected_owner or owner.get("active") is not True or expires <= dt.datetime.now(dt.timezone.utc):
        fail("A matching active browser lease is required")
    if Path(owner.get("profile", "")).resolve() != PROFILE.resolve():
        fail("Lease does not reference the retained synthetic QA profile")
    if parsed.scheme == "http":
        dist = ROOT / "dist/index.html"
        match = re.search(r'<script[^>]+type="module"[^>]+src="([^"]+)"', dist.read_text()) if dist.exists() else None
        if not match or match.group(1) != entry:
            fail("Exact entry does not match the existing built preview")
    preflight = http_preflight(origin, entry)
    modules = {
        "./integration-native.cjs": (ROOT / "docs/game-delivery-20261027/integration-native.cjs").read_text(),
        "./sky-monster-native.cjs": (BASE / "sky-monster-native.cjs").read_text(),
    }
    stamp = dt.datetime.now().strftime("%Y%m%dT%H%M%S") + f"-{time.time_ns() % 1_000_000_000:09d}"
    stage = "production" if parsed.scheme == "https" else "native"
    failure_image = BASE / f"failure-{width}x{height}-{entry.rsplit('/', 1)[-1][:-3]}-{stamp}.jpg"
    callback = r'''async page => {
const sources=__MODULES__,loaded={};
const localRequire=id=>{if(loaded[id])return loaded[id];if(typeof sources[id]!=='string')throw Error('Unlisted module '+id);const m={exports:{}};new Function('require','module','exports',sources[id])(localRequire,m,m.exports);return loaded[id]=m.exports;};
const api=localRequire('./sky-monster-native.cjs'),options={origin:__ORIGIN__,expectedEntry:__ENTRY__,width:__WIDTH__,height:__HEIGHT__,failurePath:__FAILURE_PATH__,faults:__FAULTS__};
return await (__MODE__==='prepare-sky-pending'?api.prepareSkyPendingReload(page,options):api(page,options));
}'''
    values = {"__MODULES__": json.dumps(modules, separators=(",", ":")), "__ORIGIN__": json.dumps(origin),
              "__ENTRY__": json.dumps(entry), "__WIDTH__": str(width), "__HEIGHT__": str(height),
              "__FAILURE_PATH__": json.dumps(str(failure_image)), "__FAULTS__": "true" if faults else "false",
              "__MODE__": json.dumps(mode)}
    for placeholder, value in values.items():
        if placeholder not in callback:
            fail(f"Callback template missing {placeholder}")
        callback = callback.replace(placeholder, value)
    if re.search(r"__[A-Z][A-Z0-9_]*__", callback):
        fail("Unresolved callback placeholder")
    report = BASE / f"{stage}-{mode}-sky-monster-{width}x{height}-{entry.rsplit('/', 1)[-1][:-3]}-{stamp}.json"
    if report.exists():
        fail(f"Refusing to overwrite {report}")
    bytes_before = sum(p.stat().st_size for p in BASE.rglob("*") if p.is_file())
    if bytes_before >= MAX_BYTES:
        fail(f"Evidence directory uses {bytes_before} bytes; pause for a storage review")
    result = subprocess.run(["bash", str(CLI), "-s=amari-targeted-contained", "run-code", callback],
                            cwd=ROOT, capture_output=True, text=True, timeout=1800)
    raw = None
    if "### Result\n" in result.stdout:
        try:
            raw = json.loads(result.stdout.split("### Result\n", 1)[1].split("\n### Ran", 1)[0])
        except json.JSONDecodeError:
            raw = None
    if not isinstance(raw, dict):
        raw = {"passed": False, "failure": {"message": "Playwright callback returned no structured result", "outputTail": (result.stdout + result.stderr)[-4000:]}}
    raw.update({
        "stage": stage, "origin": origin, "runtimeSource": runtime_sha, "entry": entry,
        "sourceHead": subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip(),
        "sourceHashes": {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in SOURCE_FILES},
        "driverSHA256": hashlib.sha256((BASE / "sky-monster-native.cjs").read_bytes()).hexdigest(),
        "runnerSHA256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        "cliReturnCode": result.returncode, "httpEntryPreflight": preflight, "leaseOwner": expected_owner,
        "mode": mode,
        "scope": ("Targeted visible-control Sky Shapes pending-receipt reload recovery only; a natural one-star keyboard receipt must be pending before same-page reload and claimed exactly once after intro drain." if mode == "prepare-sky-pending" else "Full actual-visible-control acceptance of all three Monster Math episodes and all three Sky Shapes queues at one viewport. No reset, data injection, provider call, hidden state, or automatic primary-task scrolling."),
        "faultModeRequested": faults,
    })
    report.write_text(json.dumps(raw, indent=2, ensure_ascii=False) + "\n")
    bytes_after = sum(p.stat().st_size for p in BASE.rglob("*") if p.is_file())
    print(json.dumps({"passed": bool(raw.get("passed")) and result.returncode == 0,
                      "stage": stage, "mode": mode, "viewport": f"{width}x{height}", "entry": entry,
                      "monsterQuestions": len(raw.get("monsterMathRows", [])), "skyMissions": len(raw.get("skyRows", [])),
                      "pendingReloadRecovery": raw.get("pendingReloadRecovery"),
                      "report": str(report), "failure": raw.get("failure"), "bytesAdded": bytes_after - bytes_before}, ensure_ascii=False))
    if bytes_after > MAX_BYTES:
        fail("Pair 14 evidence directory exceeded the 8 MiB bound")
    if not raw.get("passed") or result.returncode != 0:
        fail(f"Pair 14 acceptance failed; see {report}")


if __name__ == "__main__":
    main()
