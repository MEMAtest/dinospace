import datetime as dt,subprocess,json,sys,time,hashlib,os,urllib.request,re
from pathlib import Path
root=Path(__file__).resolve().parents[3];base=Path(__file__).resolve().parent
origin,width,height,entry,runtime=sys.argv[1:];width=int(width);height=int(height)
assert origin in ['http://127.0.0.1:5180','https://dinospace.netlify.app']
with urllib.request.urlopen(origin+'/',timeout=20)as response: html=response.read(50000).decode()
assert re.search(r'type="module"[^>]+src="([^"]+)"',html)[1]==entry, 'HTTP entry preflight failed'
owner=json.loads((root/'tmp/amari-qa-browser-owner.json').read_text());assert owner['owner']=='chess-user-blocker'and owner['active']and dt.datetime.fromisoformat(owner['expiresAt'])>dt.datetime.now(dt.timezone.utc)
stage='production'if origin.startswith('https:')else'native';stamp=str(time.time_ns());code=(base/'input-rehearsal.cjs').read_text()
for a,b in {'__ORIGIN__':json.dumps(origin),'__ENTRY__':json.dumps(entry),'__WIDTH__':str(width),'__HEIGHT__':str(height),'__SCREENSHOT__':json.dumps(str(base/f'{stage}-{width}-{Path(entry).stem}-recovered.jpg')),'__FAILURE__':json.dumps(str(base/f'{stage}-{width}-failure-{stamp}.jpg'))}.items():code=code.replace(a,b)
r=subprocess.run(['bash',str(Path.home()/'.codex/skills/playwright/scripts/playwright_cli.sh'),'-s=amari-targeted-contained','run-code',code],capture_output=True,text=True,cwd=root,timeout=180)
try:d=json.loads(r.stdout.split('### Result\n',1)[1].split('\n### Ran',1)[0])
except:d={'passed':False,'failure':{'message':(r.stdout+r.stderr)[-2500:]}}
d.update(runtimeSource=runtime,sourceHead=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),stage=stage,driverSHA256=hashlib.sha256((base/'input-rehearsal.cjs').read_bytes()).hexdigest());out=base/f'{stage}-{width}-{stamp}.json';out.write_text(json.dumps(d,indent=2)+'\n');print(json.dumps({'passed':d.get('passed'),'stage':stage,'width':width,'rows':len(d.get('rows',[])),'failure':d.get('failure'),'output':str(out)}))
if not d.get('passed')or r.returncode:raise SystemExit(1)
