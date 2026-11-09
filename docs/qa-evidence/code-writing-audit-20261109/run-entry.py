from pathlib import Path
import sys,json,subprocess,hashlib
root=Path.cwd();origin,width,entry=sys.argv[1:];width=int(width);height=740 if width==390 else 844;stage='production' if origin.startswith('https') else 'native';assert origin in ['http://127.0.0.1:5180','https://dinospace.netlify.app'] and width in [390,1440]
source=Path('/tmp/code-writing-entry.cjs').read_text()
for a,b in {'QA_ORIGIN':json.dumps(origin),'QA_WIDTH':str(width),'QA_HEIGHT':str(height),'QA_ENTRY':json.dumps(entry),'QA_STAGE':json.dumps(stage)}.items():source=source.replace(a,b)
r=subprocess.run(['bash',str(Path.home()/'.codex/skills/playwright/scripts/playwright_cli.sh'),'-s=amari-targeted-contained','run-code',source],capture_output=True,text=True,timeout=120)
if '### Result\n' not in r.stdout:raise SystemExit((r.stdout+r.stderr)[-1800:])
d=json.loads(r.stdout.split('### Result\n',1)[1].split('\n### Ran',1)[0]);d['driverSha256']=hashlib.sha256(source.encode()).hexdigest();d['sourceHead']=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip();p=root/'docs/qa-evidence/code-writing-audit-20261109'/f'{stage}-entry-{width}.json';p.write_text(json.dumps(d,indent=2)+'\n');print(json.dumps(d));assert d['passed'] and r.returncode==0
