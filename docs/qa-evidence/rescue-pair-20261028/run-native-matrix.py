"""Run one compiled native Pair 6 journey in the retained QA browser."""
import json
import re
import subprocess
import sys
from pathlib import Path

base = Path("docs/qa-evidence/rescue-pair-20261028")
origin, player, game, width = sys.argv[1:5]
height = int(sys.argv[5]) if len(sys.argv) > 5 else 844
run_levels = [int(value) for value in sys.argv[6].split(",")] if len(sys.argv) > 6 else None
run_expression = json.dumps(run_levels) if run_levels is not None else "GAME==='firerescue'?(PLAYER==='askia'?[0,1,2,3,4]:[2,3,4]):(PLAYER==='askia'?[0,1,2,3,4]:[2,3,4])"
view_tag = str(width) if height == 844 else f"{width}x{height}"
entry = re.search(r'src="([^" ]*arcade[^" ]+\.js)"', Path("dist/index.html").read_text()).group(1)
matrix = (base / "native-matrix.cjs").read_text()
helpers = (base / "fire-native-steps.cjs").read_text() + "\n" + (base / "ladder-native-steps.cjs").read_text() + "\n"
matrix = matrix.replace("async page=>{", "async page=>{\n" + helpers, 1)
for key, value in {
    "ORIGIN": origin,
    "PLAYER": player,
    "GAME": game,
    "WIDTH": width,
    "HEIGHT": str(height),
    "RUNS": run_expression,
    "EXPECTED_ENTRY": entry,
}.items():
    matrix = matrix.replace(f"__{key}__", value)

name = f"native-{player}-{game}-{view_tag}"
run = subprocess.run(
    [
        "bash",
        "/Users/omosanya_main/.codex/skills/playwright/scripts/playwright_cli.sh",
        "-s=amari-targeted-contained",
        "run-code",
        matrix,
    ],
    capture_output=True,
    text=True,
    timeout=1800,
)
Path(f"tmp/{name}.log").write_text(run.stdout + "\n" + run.stderr)
marker = "### Result\n"
if marker not in run.stdout:
    raise RuntimeError(run.stdout[-3000:] + "\n" + run.stderr[-3000:])
payload = run.stdout.split(marker, 1)[1].split("\n### Ran", 1)[0]
data = json.loads(payload)
output = base / f"{name}.json"
output.write_text(json.dumps(data, indent=2) + "\n")
print(json.dumps({
    "passed": data["passed"],
    "levels": data["levelRunCount"],
    "entry": data["entryIdentity"],
    "report": str(output),
    "failure": data["failures"][-1] if data["failures"] else None,
}))
if run.returncode or not data["passed"]:
    sys.exit(1)
