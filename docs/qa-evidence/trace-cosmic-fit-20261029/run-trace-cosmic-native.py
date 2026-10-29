#!/usr/bin/env python3
"""Run one Trace or Cosmic actual-control lane on the already leased page.

This runner validates the existing lease and invokes run-code in the existing
Playwright CLI session. It never opens a browser or creates a tab/context/profile.
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
BASE = ROOT / "docs/qa-evidence/trace-cosmic-fit-20261029"
OWNER_FILE = ROOT / "tmp/amari-qa-browser-owner.json"
PROFILE = ROOT / "tmp/amari-production-qa-profile"
SESSION = "amari-targeted-contained"
CLI = Path("/Users/omosanya_main/.codex/skills/playwright/scripts/playwright_cli.sh")
SOURCE_FILES = [
    "src/App.jsx",
    "src/gameCatalog.jsx",
    "src/data/learningWorlds.js",
    "src/data/letterTraceLearning.js",
    "src/data/cosmicTactics.js",
    "src/components/games/AmariLetterTrace.jsx",
    "src/components/games/AmariLetterTrace.css",
    "src/components/games/TicTacToe.jsx",
    "src/components/shared/index.jsx",
    "src/components/home/ExplorerHome.jsx",
    "src/discoveryPremium.css",
    "src/components/home/discoveryVisuals.css",
    "docs/game-delivery-20261027/integration-native.cjs",
    "docs/game-delivery-20261027/retained-visual-exercises.cjs",
]
MAX_BYTES = 5 * 1024 * 1024


def require_owner():
    expected = os.environ.get("TRACE_COSMIC_BROWSER_OWNER", "")
    if not expected:
        raise SystemExit("Set TRACE_COSMIC_BROWSER_OWNER to the owner explicitly granted for this run")
    try:
        owner = json.loads(OWNER_FILE.read_text())
    except Exception as error:
        raise SystemExit(f"Cannot read browser lease manifest: {error}") from error
    expires = dt.datetime.fromisoformat(owner.get("expiresAt", "1970-01-01T00:00:00+00:00"))
    if expires <= dt.datetime.now(dt.timezone.utc):
        raise SystemExit("The existing browser lease has expired")
    if owner.get("owner") != expected or owner.get("active") is not True:
        raise SystemExit(f"Expected active existing-page lease for {expected!r}")
    if Path(owner.get("profile", "")).resolve() != PROFILE.resolve():
        raise SystemExit("Lease does not point to the retained synthetic QA profile")


def main():
    if len(sys.argv) != 7:
        raise SystemExit("Usage: run-trace-cosmic-native.py ORIGIN WIDTH HEIGHT GAME EXPECTED_ENTRY RUNTIME_SHA")
    origin = sys.argv[1].rstrip("/")
    width, height = map(int, sys.argv[2:4])
    game, expected_entry, runtime_sha = sys.argv[4:7]
    if game not in {"trace", "tictactoe"}:
        raise SystemExit("GAME must be trace or tictactoe")
    if (width, height) not in {(390, 740), (1440, 844)}:
        raise SystemExit("Supported viewports are 390x740 and 1440x844")
    parsed = urlparse(origin)
    if parsed.hostname not in {"127.0.0.1", "localhost", "dinospace.netlify.app"}:
        raise SystemExit("Origin is outside the approved native/canonical QA origins")
    stage = "production" if parsed.hostname == "dinospace.netlify.app" else "native"
    if stage == "production" and (parsed.scheme != "https" or origin != "https://dinospace.netlify.app"):
        raise SystemExit("Production stage is allowed only for canonical https://dinospace.netlify.app")
    if stage == "native" and origin != "http://127.0.0.1:5180":
        raise SystemExit("Native stage is allowed only for the existing preview on port 5180")
    if not re.fullmatch(r"/assets/arcade-[A-Za-z0-9_-]+\.js", expected_entry):
        raise SystemExit("Supply the exact compiled arcade entry path")
    if not re.fullmatch(r"[0-9a-f]{40}", runtime_sha):
        raise SystemExit("Supply the 40-character frozen runtime SHA")
    require_owner()

    if stage == "native":
        html = ROOT / "dist/index.html"
        if not html.exists():
            raise SystemExit("Root-owned compiled dist/index.html is missing")
        match = re.search(r'<script[^>]+type="module"[^>]+src="([^"]+)"', html.read_text())
        if not match or match.group(1) != expected_entry:
            raise SystemExit(f"Expected compiled entry {expected_entry} does not match dist")

    callback_path = BASE / "trace-cosmic-native.cjs"
    callback = callback_path.read_text()
    guide_source = (ROOT / "docs/game-delivery-20261027/retained-visual-exercises.cjs").read_text()
    guide_match = re.search(r"const TRACE_GUIDES = Object\.freeze\((\{.*\})\);", guide_source)
    if not guide_match:
        raise SystemExit("Could not locate the existing authored visible-letter guide routes")
    try:
        guide_data = json.loads(guide_match.group(1))
    except json.JSONDecodeError as error:
        raise SystemExit(f"Existing visible-guide data is not valid JSON: {error}") from error
    helper_source = (ROOT / "docs/game-delivery-20261027/integration-native.cjs").read_text()
    values = {
        "__ORIGIN__": json.dumps(origin),
        "__ENTRY__": json.dumps(expected_entry),
        "__WIDTH__": str(width),
        "__HEIGHT__": str(height),
        "__GAME__": json.dumps(game),
        "__RUNTIME__": json.dumps(runtime_sha),
        "__TRACE_GUIDES__": json.dumps(guide_data, separators=(",", ":")),
        "__MODULES__": json.dumps({"./integration-native.cjs": helper_source}),
        "__OUTPUT__": json.dumps(str(BASE)),
    }
    for placeholder, value in values.items():
        if placeholder not in callback:
            raise SystemExit(f"Callback is missing {placeholder}")
        callback = callback.replace(placeholder, value)
    if re.search(r"__[A-Z][A-Z0-9_]*__", callback):
        raise SystemExit("Callback contains unresolved placeholders")

    stamp = dt.datetime.now().strftime("%Y%m%dT%H%M%S") + f"-{time.time_ns() % 1_000_000_000:09d}"
    report = BASE / f"{stage}-{game}-{width}x{height}-{expected_entry.rsplit('/', 1)[-1].removesuffix('.js')}-{stamp}.json"
    if report.exists():
        raise SystemExit(f"Refusing to overwrite {report}")
    before_bytes = sum(item.stat().st_size for item in BASE.iterdir() if item.is_file())
    if before_bytes >= MAX_BYTES:
        raise SystemExit(f"Evidence folder already uses {before_bytes} bytes; root review is required before adding more")

    result = subprocess.run(
        ["bash", str(CLI), "-s=amari-targeted-contained", "run-code", callback],
        cwd=ROOT, capture_output=True, text=True, timeout=1800,
    )
    output = result.stdout + "\n" + result.stderr
    data = None
    marker = "### Result\n"
    if marker in result.stdout:
        raw = result.stdout.split(marker, 1)[1].split("\n### Ran", 1)[0]
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            data = None
    if data is None:
        data = {
            "passed": False, "origin": origin, "stage": stage, "game": game,
            "viewport": {"width": width, "height": height}, "entryIdentity": expected_entry,
            "rows": [], "failure": {"message": "run-code returned no structured callback result", "outputTail": output[-5000:]},
        }
    data.update({
        "stage": stage,
        "expectedRuntime": runtime_sha,
        "entry": expected_entry,
        "sourceHead": subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip(),
        "sourceHashes": {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in SOURCE_FILES},
        "driverSHA256": hashlib.sha256(callback_path.read_bytes()).hexdigest(),
        "cliReturnCode": result.returncode,
    })
    report.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    after_bytes = sum(item.stat().st_size for item in BASE.iterdir() if item.is_file())
    print(json.dumps({
        "passed": bool(data.get("passed")) and result.returncode == 0,
        "game": game, "stage": stage, "viewport": f"{width}x{height}",
        "entry": expected_entry, "report": str(report),
        "rowCount": len(data.get("rows", [])), "bytesAdded": after_bytes - before_bytes,
        "failure": data.get("failure"),
    }, ensure_ascii=False))
    if after_bytes > MAX_BYTES:
        raise SystemExit("Trace/Cosmic evidence exceeded the 5 MiB bound")
    if result.returncode or not data.get("passed"):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
