#!/usr/bin/env python3
"""Run a bounded, caller-page-only canonical German phone render supplement."""
import datetime as dt
import hashlib
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path('/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-b7-memory-cumulative-20261006')
BASE = ROOT / 'docs/qa-evidence/curriculum-german-20261029'
OWNER_FILE = ROOT / 'tmp/amari-qa-browser-owner.json'
PROFILE = ROOT / 'tmp/amari-production-qa-profile'
PLAYWRIGHT_CLI = Path('/Users/omosanya_main/.codex/skills/playwright/scripts/playwright_cli.sh')
ORIGIN = 'https://dinospace.netlify.app'
ENTRY = '/assets/arcade-mei6ziro.js'
OWNER = 'pair10-german-render'


def verify_owner():
    try:
        owner = json.loads(OWNER_FILE.read_text())
    except Exception as error:
        raise SystemExit(f'Cannot read browser owner manifest: {error}') from error
    expected = dt.datetime.fromisoformat(owner.get('expiresAt', '1970-01-01T00:00:00+00:00'))
    if owner.get('active') is not True or owner.get('owner') != OWNER or expected <= dt.datetime.now(dt.timezone.utc):
        raise SystemExit('The pair10-german-render browser lease is not active.')
    if Path(owner.get('profile', '')).resolve() != PROFILE.resolve():
        raise SystemExit('Lease does not reference the retained QA profile.')


def extract_result(stdout):
    marker = '### Result\n'
    if marker not in stdout:
        return None
    raw = stdout.split(marker, 1)[1].split('\n### Ran', 1)[0]
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def main():
    verify_owner()
    parsed = urlparse(ORIGIN)
    if parsed.hostname != 'dinospace.netlify.app' or parsed.scheme != 'https':
        raise SystemExit('Render supplement is restricted to canonical HTTPS production.')
    callback = (BASE / 'german-render-supplement.page.js').read_text()
    if callback.count('__SCREENSHOT_PATH__') != 1:
        raise SystemExit('Render callback must contain exactly one screenshot path placeholder.')
    stamp = dt.datetime.now().strftime('%Y%m%dT%H%M%S') + f'-{time.time_ns() % 1_000_000_000:09d}'
    screenshot = BASE / f'canonical-german-direction-390x740-{stamp}.jpg'
    callback = callback.replace('__SCREENSHOT_PATH__', json.dumps(str(screenshot)))
    proc = subprocess.run(
        ['bash', str(PLAYWRIGHT_CLI), '-s=amari-targeted-contained', 'run-code', callback],
        cwd=ROOT, capture_output=True, text=True, timeout=120,
    )
    output = proc.stdout + '\n' + proc.stderr
    result = extract_result(proc.stdout)
    if result is None:
        result = {'passed': False, 'error': 'run-code returned no structured result', 'outputTail': output[-4000:]}
    if screenshot.exists():
        result['screenshotBytes'] = screenshot.stat().st_size
        result['screenshotSha256'] = hashlib.sha256(screenshot.read_bytes()).hexdigest()
    result.update({
        'kind': 'representative-render-supplement',
        'runtimeCommit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
        'origin': ORIGIN,
        'expectedEntry': ENTRY,
        'viewport': '390x740',
        'screenshotPath': str(screenshot) if screenshot.exists() else None,
        'cliReturnCode': proc.returncode,
        'notFullAcceptanceRun': True,
    })
    report = BASE / 'german-phone-direction-render-supplement.json'
    encoded = json.dumps(result, indent=2, ensure_ascii=False) + '\n'
    if len(encoded.encode('utf-8')) > 1024 * 1024:
        raise SystemExit('Refusing to save oversized render supplement.')
    report.write_text(encoded)
    print(json.dumps({
        'passed': bool(result.get('passed')) and proc.returncode == 0,
        'report': str(report),
        'screenshot': result.get('screenshotPath'),
        'sha256': result.get('screenshotSha256'),
        'entry': result.get('entryIdentity'),
        'routeId': result.get('routeId'),
        'errors': result.get('errors'),
        'error': result.get('error'),
    }, ensure_ascii=False))
    if proc.returncode or not result.get('passed'):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
