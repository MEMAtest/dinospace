"""Run one normal-UI journey against the frozen, final web candidate."""
import json
import re
import subprocess
import sys
from pathlib import Path

origin, player, game, width = sys.argv[1:5]
base = Path('docs/qa-evidence/rocket-fuel-20261028')
entry = re.search(r'src="([^" ]*arcade[^" ]+\.js)"', Path('dist/index.html').read_text()).group(1)
code = (base / 'native-matrix.cjs').read_text()
for key, value in {'ORIGIN': origin, 'PLAYER': player, 'GAME': game, 'WIDTH': width, 'EXPECTED_ENTRY': entry}.items():
    code = code.replace(f'__{key}__', value)
code = code.replace('/native-rocket-', '/production-rocket-').replace('/native-fuel-', '/production-fuel-')
code = code.replace('.png`', '.jpg`')
code = code.replace('await page.screenshot(', "await page.getByText('Hooray! You did it!', {exact: true}).waitFor({state: 'hidden', timeout: 10000}); await page.screenshot(")
name = f'production-{player}-{game}-{width}'
result = subprocess.run([
    'bash', '/Users/omosanya_main/.codex/skills/playwright/scripts/playwright_cli.sh',
    '-s=amari-targeted-contained', 'run-code', code,
], capture_output=True, text=True, timeout=900)
Path(f'tmp/{name}.log').write_text(result.stdout + '\n' + result.stderr)
if result.returncode or '### Error' in result.stdout:
    raise RuntimeError(result.stdout[-2500:] + '\n' + result.stderr[-500:])
data = json.loads(result.stdout.split('### Result\n')[1].split('\n### Ran')[0])
output = base / f'{name}.json'
output.write_text(json.dumps(data, indent=2) + '\n')
print(json.dumps({'passed': data['passed'], 'levelRuns': data['levelRunCount'], 'entry': data['entryIdentity'], 'report': str(output), 'failures': data['failures']}))
if not data['passed']:
    sys.exit(1)
