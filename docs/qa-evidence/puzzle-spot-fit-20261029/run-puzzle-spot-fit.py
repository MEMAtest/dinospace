#!/usr/bin/env python3
"""Run the Pair 13 visual layout matrix on the already leased QA page.

This runner only calls run-code on the existing Playwright CLI session. It does
not create a browser, tab, context, profile, or modify app storage directly.
"""
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
BASE = ROOT / "docs/qa-evidence/puzzle-spot-fit-20261029"
OWNER_FILE = ROOT / "tmp/amari-qa-browser-owner.json"
PROFILE = ROOT / "tmp/amari-production-qa-profile"
CLI = Path("/Users/omosanya_main/.codex/skills/playwright/scripts/playwright_cli.sh")
MAX_BYTES = 8 * 1024 * 1024
SOURCE_FILES = [
    "src/App.jsx",
    "src/gameCatalog.jsx",
    "src/data/learningWorlds.js",
    "src/data/puzzlePopBatch2.js",
    "src/data/spotDifferenceBatch2.js",
    "src/data/batch2Narration.js",
    "src/components/games/PuzzlePlay.jsx",
    "src/components/games/PuzzlePlay.css",
    "src/components/games/SpotDifference.jsx",
    "src/components/shared/index.jsx",
    "src/discoveryPremium.css",
    "docs/game-delivery-20261027/integration-native.cjs",
    "docs/qa-evidence/puzzle-spot-fit-20261029/puzzle-spot-fit-native.cjs",
]


def fail(message):
    raise SystemExit(message)


def http_entry_preflight(origin, entry):
    try:
        request = urllib.request.Request(origin + "/", headers={"Cache-Control": "no-cache", "Pragma": "no-cache"})
        with urllib.request.urlopen(request, timeout=12) as response:
            html = response.read(2 * 1024 * 1024 + 1)
            status = response.status
        if status != 200 or len(html) > 2 * 1024 * 1024 or entry.encode() not in html:
            fail("Live HTTP document did not serve the exact requested arcade entry; refusing possible cached-shell evidence")
        asset_request = urllib.request.Request(origin + entry, headers={"Cache-Control": "no-cache", "Pragma": "no-cache"})
        with urllib.request.urlopen(asset_request, timeout=20) as response:
            asset = response.read(16 * 1024 * 1024 + 1)
            asset_status = response.status
            content_type = response.headers.get("Content-Type", "")
        if asset_status != 200 or len(asset) > 16 * 1024 * 1024 or "javascript" not in content_type.lower():
            fail("Exact arcade entry is not available as a bounded live JavaScript response")
        return {
            "documentStatus": status,
            "entryStatus": asset_status,
            "entryContentType": content_type,
            "entryBytes": len(asset),
            "entrySha256": hashlib.sha256(asset).hexdigest(),
            "cacheControl": "no-cache request",
        }
    except urllib.error.URLError as error:
        fail(f"Live HTTP entry preflight failed; refusing offline-cache-only evidence: {error}")


def main():
    if len(sys.argv) != 6:
        fail("Usage: run-puzzle-spot-fit.py ORIGIN WIDTH HEIGHT ENTRY RUNTIME_SHA")
    origin = sys.argv[1].rstrip("/")
    width, height = map(int, sys.argv[2:4])
    entry, runtime_sha = sys.argv[4:6]
    faults = os.environ.get("PUZZLE_SPOT_FAULTS") == "1"
    parsed = urlparse(origin)
    if origin not in {"http://127.0.0.1:5180", "https://dinospace.netlify.app"}:
        fail("Origin must be the existing preview or canonical Amari site")
    stage = "production" if parsed.scheme == "https" else "native"
    if (width, height) not in {(390, 740), (1440, 844)}:
        fail("Viewport must be 390x740 or 1440x844")
    if faults and width != 390:
        fail("PUZZLE_SPOT_FAULTS=1 is permitted only for the explicit 390px fault lane")
    if not re.fullmatch(r"/assets/arcade-[A-Za-z0-9_-]+\.js", entry):
        fail("Supply the exact compiled arcade entry path")
    if not re.fullmatch(r"[0-9a-f]{40}", runtime_sha):
        fail("Supply the 40-character runtime SHA")
    if not OWNER_FILE.is_file():
        fail("Existing browser lease manifest is missing")
    owner = json.loads(OWNER_FILE.read_text())
    expected_owner = os.environ.get("PUZZLE_SPOT_BROWSER_OWNER", "")
    if not expected_owner:
        fail("Set PUZZLE_SPOT_BROWSER_OWNER to the owner explicitly granted for this run")
    expires = dt.datetime.fromisoformat(owner.get("expiresAt", "1970-01-01T00:00:00+00:00"))
    if owner.get("owner") != expected_owner or owner.get("active") is not True or expires <= dt.datetime.now(dt.timezone.utc):
        fail("Matching active browser lease is required")
    if Path(owner.get("profile", "")).resolve() != PROFILE.resolve():
        fail("Lease does not reference the retained synthetic QA profile")

    if stage == "native":
        html = ROOT / "dist/index.html"
        match = re.search(r'<script[^>]+type="module"[^>]+src="([^"]+)"', html.read_text()) if html.exists() else None
        if not match or match.group(1) != entry:
            fail("Exact entry does not match the already built preview dist")
    http_preflight = http_entry_preflight(origin, entry)
    modules = {
        "./integration-native.cjs": (ROOT / "docs/game-delivery-20261027/integration-native.cjs").read_text(),
        "./puzzle-spot-fit-native.cjs": (BASE / "puzzle-spot-fit-native.cjs").read_text(),
    }
    stamp = dt.datetime.now().strftime("%Y%m%dT%H%M%S") + f"-{time.time_ns() % 1_000_000_000:09d}"
    failure_image = BASE / f"failure-{width}x{height}-{entry.rsplit('/', 1)[-1].removesuffix('.js')}-{stamp}.jpg"
    callback = r'''async page => {
const sources=__MODULES__,loaded={};
const localRequire=id=>{if(loaded[id])return loaded[id];if(typeof sources[id]!=='string')throw Error('Unlisted module '+id);const m={exports:{}};new Function('require','module','exports',sources[id])(localRequire,m,m.exports);return loaded[id]=m.exports;};
const run=localRequire('./puzzle-spot-fit-native.cjs');
return await run(page,{origin:__ORIGIN__,expectedEntry:__ENTRY__,width:__WIDTH__,height:__HEIGHT__,failurePath:__FAILURE_PATH__,faults:__FAULTS__});
}'''
    values = {
        "__MODULES__": json.dumps(modules, separators=(",", ":")),
        "__ORIGIN__": json.dumps(origin),
        "__ENTRY__": json.dumps(entry),
        "__WIDTH__": str(width),
        "__HEIGHT__": str(height),
        "__FAILURE_PATH__": json.dumps(str(failure_image)),
        "__FAULTS__": "true" if faults else "false",
    }
    for placeholder, value in values.items():
        if placeholder not in callback:
            fail(f"Callback template missing {placeholder}")
        callback = callback.replace(placeholder, value)
    if re.search(r"__[A-Z][A-Z0-9_]*__", callback):
        fail("Unresolved callback placeholder")
    report = BASE / f"{stage}-puzzle-spot-{width}x{height}-{entry.rsplit('/', 1)[-1].removesuffix('.js')}-{stamp}.json"
    if report.exists():
        fail(f"Refusing to overwrite {report}")
    bytes_before = sum(path.stat().st_size for path in BASE.iterdir() if path.is_file())
    if bytes_before >= MAX_BYTES:
        fail(f"Evidence folder already uses {bytes_before} bytes; root review required before adding more")
    result = subprocess.run(
        ["bash", str(CLI), "-s=amari-targeted-contained", "run-code", callback],
        cwd=ROOT, capture_output=True, text=True, timeout=1800,
    )
    raw = None
    if "### Result\n" in result.stdout:
        try:
            raw = json.loads(result.stdout.split("### Result\n", 1)[1].split("\n### Ran", 1)[0])
        except json.JSONDecodeError:
            raw = None
    if not isinstance(raw, dict):
        raw = {"passed": False, "failure": {"message": "Playwright callback returned no structured result", "outputTail": (result.stdout + result.stderr)[-4000:]}}
    raw.update({
        "stage": stage,
        "runtimeSource": runtime_sha,
        "entry": entry,
        "sourceHead": subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip(),
        "sourceHashes": {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in SOURCE_FILES},
        "driverSHA256": hashlib.sha256((BASE / "puzzle-spot-fit-native.cjs").read_bytes()).hexdigest(),
        "cliReturnCode": result.returncode,
        "scope": "Full visible-control layout matrix for 12 Puzzle Pop scenes and 12 Spot pairs. Prior batch2 functional acceptance remains historical evidence; this run measures the current compiled release at 390x740 or 1440x844. No reset, state injection, or hidden-answer inspection.",
        "faultMode": faults,
        "httpEntryPreflight": http_preflight,
        "runnerSHA256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
    })
    report.write_text(json.dumps(raw, indent=2, ensure_ascii=False) + "\n")
    bytes_after = sum(path.stat().st_size for path in BASE.iterdir() if path.is_file())
    print(json.dumps({
        "passed": bool(raw.get("passed")) and result.returncode == 0,
        "stage": stage, "viewport": f"{width}x{height}", "entry": entry,
        "puzzleScenes": len(next((row for row in raw.get("lanes", []) if row.get("id") == "puzzle"), {}).get("puzzleRows", [])),
        "spotPairs": len(next((row for row in raw.get("lanes", []) if row.get("id") == "spot"), {}).get("spotRows", [])),
        "report": str(report), "bytesAdded": bytes_after - bytes_before,
        "failure": raw.get("failure"),
    }, ensure_ascii=False))
    if bytes_after > MAX_BYTES:
        fail("Pair 13 evidence exceeded the 8 MiB bound")
    if result.returncode or not raw.get("passed"):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
