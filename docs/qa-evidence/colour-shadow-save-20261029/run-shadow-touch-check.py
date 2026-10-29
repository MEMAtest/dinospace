#!/usr/bin/env python3
"""Run the one-round Shadow Match touch check on the existing leased page."""
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
BASE = ROOT / "docs/qa-evidence/colour-shadow-save-20261029"
OWNER_FILE = ROOT / "tmp/amari-qa-browser-owner.json"
PROFILE = ROOT / "tmp/amari-production-qa-profile"
CLI = Path("/Users/omosanya_main/.codex/skills/playwright/scripts/playwright_cli.sh")
SESSION = "amari-targeted-contained"
MAX_EVIDENCE_BYTES = 8 * 1024 * 1024
MAX_ENTRY_BYTES = 16 * 1024 * 1024
MODULES = [
    "docs/game-delivery-20261027/integration-native.cjs",
    "docs/qa-evidence/colour-shadow-save-20261029/shadow-touch-check.cjs",
]
SOURCE_FILES = [
    "src/App.jsx",
    "src/data/littleProgress.js",
    "src/data/pairLittleProgress.js",
    "src/data/playerRewards.js",
    "src/components/little/games/ShadowMatch.jsx",
    "src/components/little/ShadowDino.jsx",
    "src/components/little/DragItem.jsx",
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
    return {
        "documentStatus": status,
        "entryStatus": asset_status,
        "entryContentType": content_type,
        "entryBytes": len(asset),
        "entrySha256": hashlib.sha256(asset).hexdigest(),
        "cacheControl": "no-cache request",
    }


def check_owner():
    expected_owner = os.environ.get("COLOUR_SHADOW_BROWSER_OWNER", "")
    if not expected_owner:
        fail("Set COLOUR_SHADOW_BROWSER_OWNER to the active Pair18 browser lease owner")
    if not OWNER_FILE.is_file():
        fail("The existing browser lease manifest is missing")
    owner = json.loads(OWNER_FILE.read_text())
    expires = dt.datetime.fromisoformat(owner.get("expiresAt", "1970-01-01T00:00:00+00:00"))
    if owner.get("owner") != expected_owner or owner.get("active") is not True or expires <= dt.datetime.now(dt.timezone.utc):
        fail("A matching active browser lease is required")
    if Path(owner.get("profile", "")).resolve() != PROFILE.resolve():
        fail("Lease does not reference the retained synthetic QA profile")
    return expected_owner


def main():
    if len(sys.argv) != 6:
        fail("Usage: run-shadow-touch-check.py ORIGIN 390 740 EXACT_ENTRY SOURCE_RUNTIME_SHA")
    origin = sys.argv[1].rstrip("/")
    width, height = map(int, sys.argv[2:4])
    entry, runtime_sha = sys.argv[4:6]
    if origin not in {"http://127.0.0.1:5180", "https://dinospace.netlify.app"}:
        fail("Origin must be the existing local preview or canonical Amari site")
    if (width, height) != (390, 740):
        fail("Touch emulation is restricted to 390x740")
    if not re.fullmatch(r"/assets/arcade-[A-Za-z0-9_-]+\.js", entry):
        fail("Supply the exact compiled arcade entry path")
    if not re.fullmatch(r"[0-9a-f]{40}", runtime_sha):
        fail("Supply the exact 40-character source/runtime SHA")
    lease_owner = check_owner()
    stage = "production" if origin.startswith("https:") else "native"
    if stage == "native":
        document = ROOT / "dist/index.html"
        match = re.search(r'<script[^>]+type="module"[^>]+src="([^"]+)"', document.read_text()) if document.is_file() else None
        if not match or match.group(1) != entry:
            fail("Native dist entry does not match the exact supplied entry")
        asset_path = ROOT / "dist" / entry.lstrip("/")
        if not asset_path.is_file():
            fail("Exact native entry asset is missing")
        native_entry_sha = hashlib.sha256(asset_path.read_bytes()).hexdigest()
    else:
        native_entry_sha = None
    served = preflight(origin, entry)

    modules = {
        "./integration-native.cjs": (ROOT / MODULES[0]).read_text(),
        "./shadow-touch-check.cjs": (ROOT / MODULES[1]).read_text(),
    }
    callback = r'''async page => {
const sources=__MODULES__,loaded={};
const localRequire=id=>{if(loaded[id])return loaded[id];if(typeof sources[id]!=='string')throw Error('Unlisted module '+id);const m={exports:{}};new Function('require','module','exports',sources[id])(localRequire,m,m.exports);return loaded[id]=m.exports;};
return await localRequire('./shadow-touch-check.cjs')(page,{origin:__ORIGIN__,expectedEntry:__ENTRY__,width:390,height:740,failurePath:__FAILURE_PATH__});
}'''
    stamp = dt.datetime.now().strftime("%Y%m%dT%H%M%S") + f"-{time.time_ns() % 1_000_000_000:09d}"
    tag = entry.rsplit("/", 1)[-1][:-3]
    failure_image = BASE / f"failure-shadow-touch-390x740-{tag}-{stamp}.jpg"
    replacements = {
        "__MODULES__": json.dumps(modules, separators=(",", ":")),
        "__ORIGIN__": json.dumps(origin),
        "__ENTRY__": json.dumps(entry),
        "__FAILURE_PATH__": json.dumps(str(failure_image)),
    }
    for token, replacement in replacements.items():
        if token not in callback:
            fail(f"Callback template is missing {token}")
        callback = callback.replace(token, replacement)
    if re.search(r"__[A-Z][A-Z0-9_]*__", callback):
        fail("Unresolved callback placeholder")

    report = BASE / f"{stage}-shadow-touch-390x740-{tag}-{stamp}.json"
    if report.exists():
        fail(f"Refusing to overwrite evidence: {report}")
    bytes_before = sum(path.stat().st_size for path in BASE.rglob("*") if path.is_file())
    if bytes_before >= MAX_EVIDENCE_BYTES:
        fail(f"Evidence folder uses {bytes_before} bytes; pause for storage review")
    run = subprocess.run(["bash", str(CLI), f"-s={SESSION}", "run-code", callback], cwd=ROOT,
                         capture_output=True, text=True, timeout=300)
    raw = None
    if "### Result\n" in run.stdout:
        try:
            raw = json.loads(run.stdout.split("### Result\n", 1)[1].split("\n### Ran", 1)[0])
        except json.JSONDecodeError:
            pass
    if not isinstance(raw, dict):
        raw = {"passed": False, "failure": {"message": "Playwright callback returned no structured result",
                                               "outputTail": (run.stdout + run.stderr)[-4000:]}}
    raw.update({
        "stage": stage,
        "origin": origin,
        "viewport": "390x740",
        "runtimeSource": runtime_sha,
        "sourceHead": subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True,
                                      text=True, check=True).stdout.strip(),
        "entry": entry,
        "expectedEntry": entry,
        "entryMatches": (raw.get("runtime") or {}).get("entry") == entry,
        "nativeEntryAssetSha256": native_entry_sha,
        "httpEntryPreflight": served,
        "leaseOwner": lease_owner,
        "sourceHashes": {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in SOURCE_FILES},
        "moduleHashes": {name: hashlib.sha256(source.encode()).hexdigest() for name, source in modules.items()},
        "callbackSha256": hashlib.sha256(callback.encode()).hexdigest(),
        "runnerSha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        "cliReturnCode": run.returncode,
        "scope": "Single natural highest-level Shadow Match wrong/cancel/real-touch sample; leaves held fact before Next. No reset, seeded state, hidden answer data, app writes or new browser state.",
    })
    if not raw["entryMatches"]:
        raw["passed"] = False
        raw.setdefault("failure", {"message": "Live served entry did not match the explicit expected entry"})
    report.write_text(json.dumps(raw, indent=2, ensure_ascii=False) + "\n")
    bytes_after = sum(path.stat().st_size for path in BASE.rglob("*") if path.is_file())
    print(json.dumps({"passed": bool(raw.get("passed")) and run.returncode == 0,
                      "entry": entry, "runtimeSHA": runtime_sha,
                      "touch": raw.get("touch"), "report": str(report),
                      "failure": raw.get("failure"), "bytesAdded": bytes_after - bytes_before}, ensure_ascii=False))
    if bytes_after > MAX_EVIDENCE_BYTES:
        fail("Pair18 evidence folder exceeded the 8 MiB limit")
    if not raw.get("passed") or run.returncode != 0:
        fail(f"Shadow touch check failed; see {report}")


if __name__ == "__main__":
    main()
