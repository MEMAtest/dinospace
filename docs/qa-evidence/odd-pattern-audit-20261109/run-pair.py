import json, subprocess, sys, re, hashlib
from pathlib import Path
root=Path.cwd();origin,width,kind,entry=sys.argv[1:];width=int(width)
assert origin in ('http://127.0.0.1:5180','https://dinospace.netlify.app') and width in (390,1440) and kind in ('odd','pattern')
owner=json.loads((root/'tmp/amari-qa-browser-owner.json').read_text()); assert owner.get('active') and owner.get('owner')=='odd-pattern-audit'
base=root/'docs/qa-evidence/odd-pattern-20261027'; out=root/'docs/qa-evidence/odd-pattern-audit-20261109';content=json.loads(Path('/tmp/odd-pattern-content.json').read_text())[kind]
helpers=(base/'browser-common.cjs').read_text().replace('height:900','height:740' if width==390 else 'height:844')
s=(base/'rehearsal.cjs').read_text().replace('COMMON_HELPERS',helpers).replace('QA_ORIGIN',json.dumps(origin)).replace('QA_WIDTH',str(width)).replace('QA_GAME',json.dumps(kind)).replace('QA_CONTENT',json.dumps(content,separators=(',',':'))).replace('QA_AUDIO','true').replace('QA_STAGE',json.dumps('production' if origin.startswith('https') else 'native'))
s=s.replace("docs/qa-evidence/odd-pattern-20261027/", "docs/qa-evidence/odd-pattern-audit-20261109/")
needle="const sound=page.getByRole('button',{name:audioRequired?"
ins="""const startButton=page.getByRole('button',{name:/^Start /});await startButton.waitFor();const startGeometry=await startButton.evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {text:el.innerText,x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height,viewportW:innerWidth,viewportH:innerHeight,hit:!!hit&&(hit===el||el.contains(hit))}});if(startGeometry.x<0||startGeometry.y<0||startGeometry.right>startGeometry.viewportW||startGeometry.bottom>startGeometry.viewportH||startGeometry.h<48||!startGeometry.hit)throw Error('Start not fully in view '+JSON.stringify(startGeometry));
 const sound=page.getByRole('button',{name:audioRequired?"""
assert needle in s;s=s.replace(needle,ins,1);s=s.replace('return{passed:true,scope:', 'return{passed:true,startGeometry,scope:')
cli=Path.home()/'.codex/skills/playwright/scripts/playwright_cli.sh';r=subprocess.run(['bash',str(cli),'-s=amari-targeted-contained','run-code',s],cwd=root,capture_output=True,text=True,timeout=1200)
if '### Result\n' not in r.stdout: raise SystemExit('No structured result: '+(r.stdout+r.stderr)[-3000:])
d=json.loads(r.stdout.split('### Result\n',1)[1].split('\n### Ran',1)[0]);d['expectedEntry']=entry;d['instrumentedDriverHash']=hashlib.sha256(s.encode()).hexdigest();d['sourceHead']=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip();d['passed']=bool(d.get('passed')) and d.get('runtime',{}).get('entry')==entry
path=out/(('production' if origin.startswith('https') else 'native')+'-'+kind+'-'+str(width)+'.json');path.write_text(json.dumps(d,indent=2)+'\n');print(json.dumps({'passed':d['passed'],'game':kind,'width':width,'rows':len(d.get('rows',[])),'report':str(path),'start':d.get('startGeometry')}),flush=True)
if r.returncode or not d['passed']:raise SystemExit('failed; see report')
