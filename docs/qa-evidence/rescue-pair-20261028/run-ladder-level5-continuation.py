"""Resume only Askia's not-yet-completed Ladder Level 5 after a harness-only fix."""
import json
import re
import subprocess
import sys
from pathlib import Path

base = Path("docs/qa-evidence/rescue-pair-20261028")
origin = "http://127.0.0.1:5180"
entry = re.search(r'src="([^" ]*arcade[^" ]+\.js)"', Path("dist/index.html").read_text()).group(1)
matrix = (base / "native-matrix.cjs").read_text()
helpers = (base / "fire-native-steps.cjs").read_text() + "\n" + (base / "ladder-native-steps.cjs").read_text() + "\n"
matrix = matrix.replace("async page=>{", "async page=>{\n" + helpers, 1)
matrix = re.sub(r"const RUNS=.*?;", "const RUNS=[4];", matrix, count=1)
for key, value in {"ORIGIN": origin, "PLAYER": "askia", "GAME": "ladder", "WIDTH": "390", "EXPECTED_ENTRY": entry}.items():
    matrix = matrix.replace(f"__{key}__", value)

result = subprocess.run(
    [
        "bash",
        "/Users/omosanya_main/.codex/skills/playwright/scripts/playwright_cli.sh",
        "-s=amari-targeted-contained",
        "run-code",
        matrix,
    ],
    capture_output=True,
    text=True,
    timeout=900,
)
Path("tmp/native-askia-ladder-390-l5-continuation.log").write_text(result.stdout + "\n" + result.stderr)
marker = "### Result\n"
if marker not in result.stdout:
    raise RuntimeError(result.stdout[-3000:] + "\n" + result.stderr[-3000:])
data = json.loads(result.stdout.split(marker, 1)[1].split("\n### Ran", 1)[0])
output = base / "native-askia-ladder-390-l5-continuation.json"
output.write_text(json.dumps(data, indent=2) + "\n")
print(json.dumps({"passed": data["passed"], "levels": data["levelRunCount"], "entry": data["entryIdentity"], "report": str(output), "failure": data["failures"][-1] if data["failures"] else None}))
if result.returncode or not data["passed"]:
    sys.exit(1)
