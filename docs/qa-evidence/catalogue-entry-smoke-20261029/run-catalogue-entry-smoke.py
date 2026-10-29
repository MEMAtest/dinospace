#!/usr/bin/env python3
"""Run the bounded catalogue-entry callback on the existing leased page only."""
import datetime as dt
import argparse
import hashlib
import json
import os
import re
import subprocess
import time
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path("/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-b7-memory-cumulative-20261006")
BASE = ROOT / "docs/qa-evidence/catalogue-entry-smoke-20261029"
OWNER_FILE = ROOT / "tmp/amari-qa-browser-owner.json"
PROFILE_PATH = ROOT / "tmp/amari-production-qa-profile"
SESSION = "amari-targeted-contained"
CLI = Path("/Users/omosanya_main/.codex/skills/playwright/scripts/playwright_cli.sh")
MAX_EVIDENCE_BYTES = 8 * 1024 * 1024
SOURCE_FILES = [
    "src/App.jsx",
    "src/gameCatalog.jsx",
    "src/data/learningWorlds.js",
    "src/components/shared/DiscoveryHeader.jsx",
    "src/components/shared/Navigation.jsx",
    "src/components/shared/index.jsx",
    "src/components/home/ExplorerHome.jsx",
    "src/components/home/LittleHome.jsx",
    "src/components/little/LittleGameShell.jsx",
]


def check_owner():
    requested = os.environ.get("CATALOGUE_BROWSER_OWNER", "")
    if not requested:
        raise SystemExit("Set CATALOGUE_BROWSER_OWNER to the owner explicitly leased by root")
    try:
        owner = json.loads(OWNER_FILE.read_text())
    except Exception as error:
        raise SystemExit(f"Cannot read active browser lease: {error}") from error
    expires = dt.datetime.fromisoformat(owner.get("expiresAt", "1970-01-01T00:00:00+00:00"))
    if owner.get("owner") != requested or owner.get("active") is not True or expires <= dt.datetime.now(dt.timezone.utc):
        raise SystemExit(f"No active lease for {requested!r}")
    if Path(owner.get("profile", "")).resolve() != PROFILE_PATH.resolve():
        raise SystemExit("Lease does not target the retained Amari QA profile")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("origin")
    parser.add_argument("width", type=int)
    parser.add_argument("height", type=int)
    parser.add_argument("player", choices=("amari", "askia"))
    parser.add_argument("expected_entry")
    parser.add_argument("--runtime-sha", required=True, help="Explicit 40-character source/runtime identity supplied by the release owner")
    args = parser.parse_args()
    origin = args.origin.rstrip("/")
    width, height = args.width, args.height
    player, expected_entry = args.player, args.expected_entry
    runtime_sha = args.runtime_sha
    stage = os.environ.get("CATALOGUE_QA_STAGE", "native")
    if not re.fullmatch(r"[0-9a-f]{40}", runtime_sha):
        raise SystemExit("--runtime-sha must be a full lowercase 40-character SHA")
    if (width, height) not in {(390, 740), (1440, 844)}:
        raise SystemExit("Supported viewports are 390x740 and 1440x844")
    parsed = urlparse(origin)
    if parsed.hostname not in {"127.0.0.1", "localhost", "dinospace.netlify.app"}:
        raise SystemExit("Origin is outside the approved native/canonical QA origins")
    if parsed.hostname == "dinospace.netlify.app" and (parsed.scheme != "https" or stage != "production"):
        raise SystemExit("Canonical origin requires CATALOGUE_QA_STAGE=production")
    if parsed.hostname != "dinospace.netlify.app" and stage != "native":
        raise SystemExit("Local origin requires CATALOGUE_QA_STAGE=native")
    if not re.fullmatch(r"/assets/arcade-[A-Za-z0-9_-]+\.js", expected_entry):
        raise SystemExit("EXPECTED_ENTRY must be the exact compiled arcade asset path")
    check_owner()

    html = ROOT / "dist/index.html"
    if not html.exists():
        raise SystemExit("dist/index.html missing; root owns build output")
    script = re.search(r'<script[^>]+type="module"[^>]+src="([^"]+)"', html.read_text())
    if not script or script.group(1) != expected_entry:
        raise SystemExit(f"dist entry does not match {expected_entry}")

    ids = "all" if player == "amari" else "normal"
    code = (BASE / "catalogue-entry-smoke.cjs").read_text().strip().removesuffix(";")
    values = {
        "__ORIGIN__": json.dumps(origin),
        "__EXPECTED_ENTRY__": json.dumps(expected_entry),
        "__WIDTH__": str(width),
        "__HEIGHT__": str(height),
        "__PLAYER__": json.dumps(player),
        "__IDS__": json.dumps(ids),
    }
    for needle, replacement in values.items():
        if needle not in code:
            raise RuntimeError(f"Callback placeholder missing: {needle}")
        code = code.replace(needle, replacement)
    if re.search(r"__[A-Z][A-Z0-9_]*__", code):
        raise RuntimeError("Callback contains unresolved placeholders")

    code = "async page=>{const run=(" + code + ");const attempts=[];const guard=async r=>{if(/\\/api\\/|elevenlabs|openai|story-provider/i.test(r.request().url())){attempts.push(r.request().url());return r.fulfill({status:403,body:'QA startup guard'});}return r.continue();};await page.route('**/*',guard);page.setDefaultTimeout(5000);try{await page.setViewportSize(" + json.dumps({"width": width, "height": height}) + ");await page.goto(" + json.dumps(origin + '/?qa_catalogue_entry=') + "+Date.now()+'#/home',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__amariQaNamespaced===true,null,{timeout:10000});const report=await run(page);if(attempts.length){report.passed=false;report.providerAttempts=[...(report.providerAttempts||[]),...attempts];}return report;}finally{await page.unroute('**/*',guard);page.setDefaultTimeout(30000);}}"

    stamp = dt.datetime.now().strftime("%Y%m%dT%H%M%S") + f"-{time.time_ns() % 1_000_000_000:09d}"
    tag = Path(expected_entry).name.removesuffix(".js")
    report = BASE / f"{stage}-{player}-{width}x{height}-{tag}-{stamp}.json"
    if report.exists():
        raise RuntimeError(f"Refusing to overwrite evidence: {report}")
    used = sum(path.stat().st_size for path in BASE.iterdir() if path.is_file() and path.name.startswith(("native-", "production-")))
    if used >= MAX_EVIDENCE_BYTES:
        raise SystemExit(f"Evidence budget is already {used} bytes; root review required")

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
            pass
    if data is None:
        data = {"passed": False, "profile": player, "origin": origin, "expectedEntry": expected_entry,
                "rows": [], "failures": [{"message": "run-code returned no structured result", "outputTail": output[-5000:]}]}
    source_head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip()
    expected_runtime = runtime_sha
    runtime_source_label = "explicit --runtime-sha"
    data["sourceHead"] = source_head
    data["runtimeSource"] = expected_runtime
    data["runtimeSourceLabel"] = runtime_source_label
    data["expectedRuntime"] = expected_runtime
    data["runtimeBinding"] = {"stage": stage, "source": runtime_source_label, "sha": expected_runtime,
                              "verifiedBy": "live page exact entry, origin and QA namespace"}
    data["expectedEntry"] = expected_entry
    data["actualEntry"] = data.get("entryIdentity")
    data["entryMatches"] = data.get("entryIdentity") == expected_entry
    if not data["entryMatches"]:
        data["passed"] = False
        data.setdefault("failures", []).append({"message": "Actual served entry does not match expectedEntry"})
    data["sourceHashes"] = {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in SOURCE_FILES}
    data["runnerSha256"] = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    data["callbackSha256"] = hashlib.sha256(code.encode()).hexdigest()
    data["cliReturnCode"] = result.returncode
    report.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    used = sum(path.stat().st_size for path in BASE.iterdir() if path.is_file() and path.name.startswith(("native-", "production-")))
    print(json.dumps({"passed": bool(data.get("passed")) and result.returncode == 0, "profile": player,
                      "stage": stage, "origin": origin, "expectedRuntime": expected_runtime,
                      "runtimeSource": expected_runtime, "runtimeSourceLabel": runtime_source_label,
                      "expectedEntry": expected_entry,
                      "actualEntry": data.get("entryIdentity"), "entryMatches": data.get("entryMatches"),
                      "viewport": f"{width}x{height}", "catalogueActivities": data.get("catalogueActivitiesCovered"),
                      "completedIds": [row.get("id") for row in data.get("rows", [])],
                      "failure": (data.get("failures") or [None])[-1], "report": str(report), "evidenceBytes": used}, ensure_ascii=False))
    if used > MAX_EVIDENCE_BYTES:
        raise SystemExit("Evidence exceeded 8 MiB; retain unique failures and ask root to review")
    if result.returncode or not data.get("passed"):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
