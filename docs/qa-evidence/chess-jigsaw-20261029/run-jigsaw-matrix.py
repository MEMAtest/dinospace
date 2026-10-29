"""Run one Jigsaw level on the already-leased retained QA page.

Root must first lease the exact session as pair9-jigsaw with
scripts/ensure-amari-qa-browser.py. This runner never opens a browser, tab,
context, profile, or resets storage. Repeat for each player/level/viewport.
"""
import datetime as dt
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path("/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-b7-memory-cumulative-20261006")
BASE = ROOT / "docs/qa-evidence/chess-jigsaw-20261029"
OWNER = ROOT / "tmp/amari-qa-browser-owner.json"
SESSION = "amari-targeted-contained"
CLI = Path.home() / ".codex/skills/playwright/scripts/playwright_cli.sh"


def main():
    args = sys.argv[1:]
    touch = "--emulated-touch" in args
    replay = "--verify-replay" in args
    capture = "--capture-representative" in args
    if touch:
        args.remove("--emulated-touch")
    if replay:
        args.remove("--verify-replay")
    if capture:
        args.remove("--capture-representative")
    if len(args) not in {5, 6}:
        raise SystemExit("Usage: run-jigsaw-matrix.py ORIGIN amari|askia LEVEL 390|1440 native|production [none|progress-write|progress-readback|reward-write|reward-readback] [--emulated-touch] [--verify-replay] [--capture-representative]")
    origin, player, level_text, width_text, stage = args[:5]
    fault = args[5] if len(args) == 6 else "none"
    if player not in {"amari", "askia"} or stage not in {"native", "production"}:
        raise SystemExit("player must be amari/askia and stage must be native/production")
    allowed_faults = {"none", "progress-write", "progress-readback", "reward-write", "reward-readback"}
    if fault not in allowed_faults:
        raise SystemExit("unknown synthetic fault mode")
    level, width = int(level_text), int(width_text)
    if level < (3 if player == "amari" else 1) or level > 5 or width not in {390, 1440}:
        raise SystemExit("Amari levels are 3-5, Askia levels 1-5; supported widths are 390 and 1440")
    if touch and (width, level) != (390, 5):
        raise SystemExit("Emulated-touch sample is restricted to one 390px Level 5 run")
    height = 740 if width == 390 else 844
    if not re.fullmatch(r"https?://[^\s]+", origin):
        raise SystemExit("origin must be an explicit http(s) origin")
    fault_pair = {"progress-write": ("askia", 1), "progress-readback": ("askia", 2),
                  "reward-write": ("amari", 3), "reward-readback": ("amari", 4)}
    if fault != "none" and (player, level) != fault_pair[fault]:
        raise SystemExit(f"{fault} is assigned to {fault_pair[fault][0]} level {fault_pair[fault][1]} for this matrix")
    if not OWNER.exists():
        raise SystemExit("No active retained-browser lease; root must lease pair9-jigsaw first")
    lease = json.loads(OWNER.read_text())
    expires = dt.datetime.fromisoformat(lease.get("expiresAt", "1970-01-01T00:00:00+00:00"))
    if not lease.get("active") or lease.get("owner") != "pair9-jigsaw" or expires <= dt.datetime.now(dt.timezone.utc):
        raise SystemExit("The retained-browser lease is not active for pair9-jigsaw")
    html = (ROOT / "dist/index.html").read_text()
    entries = re.findall(r'<script[^>]+type="module"[^>]+src="([^"]+)"', html)
    if not entries:
        raise SystemExit("No compiled module entry in dist/index.html; builds are root-owned")
    entry = entries[0]
    expected_entry = os.environ.get("PAIR9_EXPECTED_ENTRY", Path(entry).name)
    if stage == "production" and "PAIR9_EXPECTED_ENTRY" not in os.environ:
        raise SystemExit("Set PAIR9_EXPECTED_ENTRY to the verified production module basename before production QA")
    code = (BASE / "jigsaw-native-matrix.cjs").read_text()
    replacements = {
        "__ORIGIN__": json.dumps(origin), "__PLAYER__": json.dumps(player),
        "__LEVEL__": str(level), "__WIDTH__": str(width), "__HEIGHT__": str(height),
        "__EXPECTED_ENTRY__": json.dumps(expected_entry), "__OUT__": json.dumps(str(BASE)),
        "__FAULT__": json.dumps(fault), "__EMULATED_TOUCH__": json.dumps(touch),
        "__VERIFY_REPLAY__": json.dumps(replay), "__CAPTURE_REPRESENTATIVE__": json.dumps(capture),
    }
    for token, value in replacements.items():
        code = code.replace(token, value)
    stamp = dt.datetime.now().strftime("%Y%m%dT%H%M%S") + f"-{time.time_ns() % 1_000_000_000:09d}"
    out = BASE / f"{stage}-{player}-L{level}-{width}x{height}-{stamp}.json"
    if out.exists():
        raise SystemExit("Refusing to replace prior evidence")
    result = subprocess.run(["bash", str(CLI), f"-s={SESSION}", "run-code", code], cwd=ROOT,
                            capture_output=True, text=True, timeout=900)
    marker = "### Result\n"
    if marker not in result.stdout:
        data = {"passed": False, "stage": stage, "player": player, "level": level,
                "width": width, "height": height, "entry": entry,
                "error": (result.stdout + "\n" + result.stderr)[-4000:]}
    else:
        payload = result.stdout.split(marker, 1)[1].split("\n### Ran", 1)[0]
        data = json.loads(payload)
        data.update(stage=stage, cliReturnCode=result.returncode)
    out.write_text(json.dumps(data, indent=2) + "\n")
    print(json.dumps({"passed": bool(data.get("passed")) and result.returncode == 0,
                      "stage": stage, "player": player, "level": level,
                      "viewport": f"{width}x{height}", "fault": fault, "emulatedTouch": touch,
                      "verifyReplay": replay, "captureRepresentative": capture, "entry": entry,
                      "report": str(out)}))
    if result.returncode or not data.get("passed"):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
