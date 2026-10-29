#!/usr/bin/env python3
"""Run Storybook on the caller's already-leased Playwright page only.

The restricted run-code VM has no require/fs/path. This wrapper inlines the
two reviewed CJS sources into a raw async page callback. It never opens a
browser, profile, tab, origin, or database. Optional approved Pip bytes are
decompressed in Python memory and staged in bounded chunks on that page.
"""
import base64
import gzip
import hashlib
import json
import os
import re
import subprocess
import sys
from urllib.parse import urlparse
from pathlib import Path

ROOT = Path("/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-b7-memory-cumulative-20261006")
BASE = ROOT / "docs/qa-evidence/books-spelling-20261029"
PROFILE = "amari-targeted-contained"
CLI = "/Users/omosanya_main/.codex/skills/playwright/scripts/playwright_cli.sh"
PIP_PATH = ROOT / "docs/game-delivery-20261019/batch1/approved-provider-qa/pip-sunflower-backup.json.gz"
PIP_GZIP_SHA256 = "6460dad1981b6053a3e8bd2878d6e1403f671707f9f8a97bc6eec6575dda7cc0"


def invoke(code, timeout=2400):
    return subprocess.run(["bash", CLI, f"-s={PROFILE}", "run-code", code], cwd=ROOT,
                          capture_output=True, text=True, timeout=timeout)


def result_payload(proc):
    marker = "### Result\n"
    if marker not in proc.stdout:
        return None
    payload = proc.stdout.split(marker, 1)[1].split("\n### Ran", 1)[0]
    try:
        return json.loads(payload)
    except json.JSONDecodeError:
        return None


def source_bundle(options):
    helper = (BASE / "storybook-native.cjs").read_text()
    runner = (BASE / "storybook-runner.cjs").read_text()
    helper = helper.replace("module.exports = async (", "const createHarness = async (", 1)
    runner = runner.replace("const createHarness = require('./storybook-native.cjs');\n", "", 1)
    runner = runner.replace("module.exports = async (", "const runStorybook = async (", 1)
    runner = re.sub(r"\nmodule\.exports\.BOOKS = BOOKS;\nmodule\.exports\.QUIZ_ORACLE = QUIZ_ORACLE;\s*$", "\n", runner)
    if "require(" in helper or "require(" in runner or "module.exports" in helper or "module.exports" in runner:
        raise RuntimeError("Unbundled CommonJS reference remains in VM source")
    encoded_options = json.dumps(options, ensure_ascii=False, separators=(",", ":"))
    return ("async page => {\n" + helper + "\n" + runner +
            f"\nconst options = {encoded_options};\n" +
            "if (options.runMode === 'full-with-backup' || options.runMode === 'continuation') options.pipBackupJsonBase64 = await page.evaluate(() => window.__storybookPipBackupBase64 || '');\n" +
            "try { return await runStorybook(page, options); } catch (error) { const diagnostics = page.__storybookNativeDiagnostics?.() || null; page.__storybookNativeDetach?.(); return { passed:false, origin:options.origin, expectedEntry:options.expectedEntry, viewport:options.viewport, runMode:options.runMode, error:String(error.stack || error), diagnostics, partial:page.__storybookNativePartial || null }; } finally { if (options.runMode === 'full-with-backup' || options.runMode === 'continuation') await page.evaluate(() => { delete window.__storybookPipBackupBase64; }); }\n}")


def main():
    if len(sys.argv) != 6:
        raise SystemExit("Usage: run-storybook-native.py ORIGIN WIDTH HEIGHT STAGE MODE")
    origin = sys.argv[1].rstrip("/")
    width, height = map(int, sys.argv[2:4])
    if (width, height) not in {(390, 740), (1440, 844)}:
        raise SystemExit("supported viewports are 390x740 and 1440x844")
    stage, mode = sys.argv[4:6]
    if stage not in {"native", "production"} or mode not in {"preflight", "full", "full-with-backup", "continuation", "continuation-restored", "full-resume"}:
        raise SystemExit("stage must be native|production and mode preflight|full|full-with-backup|continuation|continuation-restored|full-resume")
    if mode in {"full-with-backup", "continuation"} and stage != "native":
        raise SystemExit("the callback-based Pip restore is candidate-only; use the separately approved post-upload continuation on canonical")
    parsed_origin = urlparse(origin)
    approved_hosts = {"127.0.0.1", "localhost", "dinospace.netlify.app"}
    if parsed_origin.hostname not in approved_hosts or (parsed_origin.scheme != "http" and parsed_origin.hostname != "dinospace.netlify.app"):
        raise SystemExit("origin is outside the explicitly approved QA origins")

    html = (ROOT / "dist/index.html").read_text()
    match = re.search(r'<script[^>]+type="module"[^>]+src="([^\"]+arcade-[^\"]+\.js)"', html)
    if not match:
        raise RuntimeError("No compiled arcade entry found in dist/index.html; build is root-owned.")
    entry = match.group(1)
    prefix = "production-storybook" if stage == "production" else "native-storybook"
    view = f"{width}x{height}"
    entry_tag = Path(entry).name.replace(".js", "")
    report = BASE / f"{prefix}-{mode}-{view}-{entry_tag}.json"
    report = report.with_name(report.stem + os.environ.get("STORYBOOK_REPORT_SUFFIX", "") + report.suffix)
    if report.exists():
        raise RuntimeError(f"Refusing to replace prior evidence: {report}")
    options = {
        "origin": origin, "expectedEntry": entry, "viewport": {"width": width, "height": height}, "stage": stage,
        "playerId": os.environ.get("STORYBOOK_PLAYER_ID", "amari"),
        "runMode": "full" if mode == "full-with-backup" else mode,
        "localFaultMode": os.environ.get("STORYBOOK_LOCAL_FAULT", "write" if width == 390 else "readback"),
        "screenshotPath": None if mode in {"preflight", "continuation", "continuation-restored"} else str(BASE / f"{stage}-storybook-{width}-{Path(entry).name.replace('.js','')}.jpg"),
        "injectParentFault": mode not in {"preflight", "continuation", "continuation-restored", "full-resume"},
        "skipReaderIdentityProbe": os.environ.get("STORYBOOK_SKIP_READER_IDENTITY", "0") == "1",
        "skipLocalProgressFault": mode in {"continuation", "continuation-restored", "full-resume"} or os.environ.get("STORYBOOK_SKIP_LOCAL_FAULT", "0") == "1",
        "pipBackupHash": PIP_GZIP_SHA256 if mode in {"full-with-backup", "continuation"} else "",
    }
    if mode == "full-resume":
        prior_path_value = os.environ.get("STORYBOOK_RESUME_REPORT", "")
        if not prior_path_value:
            raise SystemExit("STORYBOOK_RESUME_REPORT must identify the preserved partial report")
        prior_path = Path(prior_path_value).resolve()
        try:
            prior_path.relative_to(BASE.resolve())
        except ValueError as error:
            raise SystemExit("The continuation source report must be inside the Storybook QA evidence folder") from error
        prior = json.loads(prior_path.read_text())
        partial = prior.get("partial")
        if prior.get("stage") != "production" or prior.get("entryIdentity") != entry or prior.get("viewport") != options["viewport"] or not isinstance(partial, dict):
            raise SystemExit("The continuation report must be a matching production candidate and viewport")
        current = partial.get("currentBook")
        if not isinstance(current, dict) or current.get("slug") != "sami-night-light-parade" or len(current.get("pages", [])) < 1:
            raise SystemExit("The preserved report does not contain the expected partial Sami reading journey")
        inherited_books = partial.get("books", [])
        options.update({
            "priorBooks": inherited_books,
            "skipBookSlugs": [book.get("slug") for book in inherited_books if book.get("slug")],
            "priorCurrentBook": current,
            "priorInitialRewards": partial.get("initial", {}).get("rewards"),
            "priorReportPath": str(prior_path),
        })
    if os.environ.get("STORYBOOK_LAUNCHER"):
        options["launcherName"] = os.environ["STORYBOOK_LAUNCHER"]

    capability = invoke("async page => ({ url:page.url(), buffer:typeof Buffer, cryptoSubtle:typeof crypto?.subtle?.digest === 'function' })", timeout=60)
    cap = result_payload(capability)
    if capability.returncode or not isinstance(cap, dict) or cap.get("buffer") != "function" or not cap.get("cryptoSubtle"):
        raise RuntimeError("Playwright run-code VM capability preflight failed: " + (capability.stdout + capability.stderr)[-1600:])

    if mode in {"full-with-backup", "continuation"}:
        compressed = PIP_PATH.read_bytes()
        actual = hashlib.sha256(compressed).hexdigest()
        if actual != PIP_GZIP_SHA256:
            raise RuntimeError(f"Approved backup compressed hash mismatch: {actual}")
        decoded = gzip.decompress(compressed)
        backup_b64 = base64.b64encode(decoded).decode("ascii")
        clear_payload = invoke("async page => page.evaluate(() => { delete window.__storybookPipBackupBase64; return true; })", timeout=60)
        if clear_payload.returncode or result_payload(clear_payload) is not True:
            raise RuntimeError("Could not clear any stale backup payload from the existing page")
        try:
            for offset in range(0, len(backup_b64), 48000):
                chunk = json.dumps(backup_b64[offset:offset + 48000])
                code = f"async page => page.evaluate(chunk => {{ window.__storybookPipBackupBase64 = (window.__storybookPipBackupBase64 || '') + chunk; return {{ stagedBytes: window.__storybookPipBackupBase64.length }}; }}, {chunk})"
                staged = invoke(code, timeout=60)
                if staged.returncode or result_payload(staged) is None:
                    raise RuntimeError(f"Could not stage approved in-memory Pip QA backup at chunk {offset // 48000}; CLI status {staged.returncode}")
        except Exception:
            try: invoke("async page => page.evaluate(() => { delete window.__storybookPipBackupBase64; return true; })", timeout=60)
            except Exception: pass
            raise
        options["runMode"] = mode
        options["approvedBackupCompressedSha256"] = actual

    code = source_bundle(options)
    proc = invoke(code)
    output = proc.stdout + "\n" + proc.stderr
    data = result_payload(proc)
    if data is None:
        data = {"passed": False, "stage": stage, "origin": origin, "entryIdentity": entry,
                "viewport": {"width": width, "height": height}, "runMode": mode,
                "failures": [{"message": "run-code returned no structured result", "outputTail": output[-7000:]}]}
    data["stage"] = stage
    data["mode"] = mode
    data["entryIdentity"] = entry
    data["capabilityPreflight"] = cap
    data["cliReturnCode"] = proc.returncode
    report.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({"passed": bool(data.get("passed")) and proc.returncode == 0,
                      "stage": stage, "mode": mode, "origin": origin, "entry": entry,
                      "viewport": f"{width}x{height}", "report": str(report),
                      "books": len(data.get("books", [])), "failure": (data.get("failures") or [None])[-1]}, ensure_ascii=False))
    if proc.returncode or not data.get("passed"):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
