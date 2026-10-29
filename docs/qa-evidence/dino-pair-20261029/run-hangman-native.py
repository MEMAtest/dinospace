"""Run Hangman normal-UI checks in an explicitly selected existing Playwright session.

This runner has no open/new-tab/profile/reset path. `--session` must name the
already guarded browser session held by root. Full gameplay uses an external
map keyed by visible clue/category/emoji/length; it does not inject app state.
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


BASE = Path(__file__).resolve().parent
SCRIPT = BASE / "hangman-native.cjs"
PLAYWRIGHT_CLI = Path("/Users/omosanya_main/.codex/skills/playwright/scripts/playwright_cli.sh")
MAX_CLUE_MAP_BYTES = 1024 * 1024


def read_clue_map(path: Path | None) -> dict:
    if path is None:
        return {}
    raw = path.read_bytes()
    if len(raw) > MAX_CLUE_MAP_BYTES:
        raise ValueError("Visible clue map exceeds the 1 MiB harness bound")
    value = json.loads(raw)
    if not isinstance(value, dict):
        raise ValueError("Visible clue map must be a JSON object")
    for key, answer in value.items():
        if not isinstance(key, str) or not key.strip():
            raise ValueError("Visible clue map keys must be non-empty visible clues or clue metadata keys")
        answers = answer if isinstance(answer, list) else [answer]
        if not answers or any(not isinstance(word, str) or not re.fullmatch(r"[A-Za-z]{3,7}", word) for word in answers):
            raise ValueError(f"Visible clue map value for {key!r} must be a word or list of 3–7-letter words")
    return value


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--session", required=True, help="Existing persistent Playwright session name; this runner never opens a session")
    parser.add_argument("--origin", required=True)
    parser.add_argument("--player", choices=("amari",), default="amari")
    parser.add_argument("--width", type=int, choices=(390, 1440), required=True)
    parser.add_argument("--height", type=int, help="Defaults to 740 for mobile or 844 for desktop")
    parser.add_argument("--expected-entry", required=True, help="Exact script path from the frozen candidate entry")
    parser.add_argument("--stage", choices=("geometry", "level2-preflight", "full", "clean-reward-retry"), default="geometry")
    parser.add_argument("--visible-clue-map", type=Path, help="JSON test solver keyed by clue or clue||category||emoji||length; answers are still typed/clicked visibly")
    args = parser.parse_args()

    if not args.session.strip() or any(character.isspace() for character in args.session):
        parser.error("--session must be an existing session name without whitespace")
    if not PLAYWRIGHT_CLI.is_file():
        parser.error(f"Playwright CLI not found at {PLAYWRIGHT_CLI}; this runner does not install dependencies")
    height = args.height or (740 if args.width == 390 else 844)
    if args.stage in ("full", "clean-reward-retry") and args.visible_clue_map is None:
        parser.error(f"--stage {args.stage} requires --visible-clue-map; no hidden answer/state lookup is performed")
    clue_map = read_clue_map(args.visible_clue_map)
    code = SCRIPT.read_text()
    replacements = {
        "__ORIGIN__": json.dumps(args.origin),
        "__PLAYER__": json.dumps(args.player),
        "__WIDTH__": str(args.width),
        "__HEIGHT__": str(height),
        "__EXPECTED_ENTRY__": json.dumps(args.expected_entry),
        "__STAGE__": json.dumps(args.stage),
        "__VISIBLE_CLUE_MAP__": json.dumps(clue_map, ensure_ascii=False),
    }
    for token, replacement in replacements.items():
        code = code.replace(token, replacement)

    completed = subprocess.run(
        ["bash", str(PLAYWRIGHT_CLI), f"-s={args.session}", "run-code", code],
        capture_output=True,
        text=True,
        timeout=900,
        check=False,
    )
    output = completed.stdout + ("\n" + completed.stderr if completed.stderr else "")
    marker = "### Result\n"
    if completed.returncode or marker not in output or "### Error" in output:
        print(output[-8000:], file=sys.stderr)
        return completed.returncode or 1
    result_text = output.split(marker, 1)[1].split("\n### Ran", 1)[0].strip()
    try:
        result = json.loads(result_text)
    except json.JSONDecodeError:
        print(output[-8000:], file=sys.stderr)
        return 1
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("passed") is True else 1


if __name__ == "__main__":
    raise SystemExit(main())
