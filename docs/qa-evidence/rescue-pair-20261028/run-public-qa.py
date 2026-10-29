"""Run one final-source public rescue journey using the accepted UI harness."""
import json
import re
import subprocess
import sys
from pathlib import Path

origin, player, game, width = sys.argv[1:5]
stage = sys.argv[5] if len(sys.argv) > 5 else 'production'
height = int(sys.argv[6]) if len(sys.argv) > 6 else (740 if width == '390' else 844)
view_tag = width if stage == 'production' or height == 844 else f'{width}x{height}'
run_expression = "PLAYER==='askia'?[0,1,2,3,4]:[2,3,4]"
if stage not in ['draft', 'production']:
    raise ValueError('stage must be draft or production')
base = Path('docs/qa-evidence/rescue-pair-20261028')
entry = re.search(r'src="([^" ]*arcade[^" ]+\.js)"', Path('dist/index.html').read_text()).group(1)
code = (base / 'native-matrix.cjs').read_text()
helpers = '\n'.join((base / name).read_text() for name in ['fire-native-steps.cjs', 'ladder-native-steps.cjs'])
code = code.replace('async page=>{', 'async page=>{\n' + helpers + '\n', 1)
for key, value in {'ORIGIN': origin, 'PLAYER': player, 'GAME': game, 'WIDTH': width, 'HEIGHT': str(height), 'RUNS': run_expression, 'EXPECTED_ENTRY': entry}.items():
    code = code.replace(f'__{key}__', value)
code = code.replace('/native-', f'/{stage}-').replace('/failure-', f'/{stage}-failure-')
name = f'{stage}-{player}-{game}-{view_tag}'
run = subprocess.run(['bash', '/Users/omosanya_main/.codex/skills/playwright/scripts/playwright_cli.sh',
                      '-s=amari-targeted-contained', 'run-code', code], capture_output=True, text=True, timeout=1800)
Path(f'tmp/{name}.log').write_text(run.stdout + '\n' + run.stderr)
if run.returncode or '### Error' in run.stdout:
    raise RuntimeError(run.stdout[-2500:] + '\n' + run.stderr[-500:])
data = json.loads(run.stdout.split('### Result\n')[1].split('\n### Ran')[0])
data.update(origin=origin, player=player, game=game, viewportWidth=int(width), viewportHeight=height)
output = base / f'{name}.json'
output.write_text(json.dumps(data, indent=2) + '\n')
print(json.dumps({'passed': data['passed'], 'levelRuns': data['levelRunCount'], 'entry': data['entryIdentity'],
                  'report': str(output), 'failures': data['failures']}))
if not data['passed']:
    sys.exit(1)
