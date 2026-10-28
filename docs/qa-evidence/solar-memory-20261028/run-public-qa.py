import sys,json,subprocess,hashlib
from pathlib import Path
origin,game,stage=sys.argv[1:4]
base=Path('docs/qa-evidence/solar-memory-20261028')
code=(base/f'rehearsal-{game}.cjs').read_text().replace('http://127.0.0.1:5180',origin)
for width in [390,1440]:code=code.replace(f'{game}-{width}-final.jpg',f'{stage}-{game}-{width}.jpg')
code=code.replace(f'{game}-${{width}}-final.jpg',f'{stage}-{game}-${{width}}.jpg')
try:
 r=subprocess.run(['bash','/Users/omosanya_main/.codex/skills/playwright/scripts/playwright_cli.sh','-s=amari-targeted-contained','run-code',code],capture_output=True,text=True,timeout=900)
 Path(f'tmp/{stage}-{game}-qa.log').write_text(r.stdout+'\n'+r.stderr)
 if r.returncode or '### Error' in r.stdout:raise RuntimeError(r.stdout[-2500:]+'\n'+r.stderr[-300:])
 d=json.loads(r.stdout.split('### Result\n')[1].split('\n### Ran')[0]);out=base/f'{stage}-{game}.json';out.write_text(json.dumps(d,indent=2)+'\n');print(json.dumps({'passed':d['passed'],'viewports':len(d.get('viewports',[])),'rows':sum(len(v['rows'])for v in d.get('viewports',[])),'report':str(out)}))
finally:
 print(subprocess.run(['python3','scripts/ensure-amari-qa-browser.py','--owner','remaining-games-batch4-root','--release'],capture_output=True,text=True).stdout)
