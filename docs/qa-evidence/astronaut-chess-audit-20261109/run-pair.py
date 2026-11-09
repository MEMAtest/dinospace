import json, subprocess, sys, hashlib
from pathlib import Path
root=Path.cwd();origin,width,kind,entry=sys.argv[1:];width=int(width)
assert origin in ('http://127.0.0.1:5180','https://dinospace.netlify.app') and width in (390,1440) and kind in ('astro','chess')
owner=json.loads((root/'tmp/amari-qa-browser-owner.json').read_text());assert owner.get('active') and owner.get('owner')=='odd-pattern-audit'
base=root/'docs/qa-evidence/astronaut-chess-20261028';out=root/'docs/qa-evidence/astronaut-chess-audit-20261109';content=json.loads(Path('/tmp/astro-chess-content.json').read_text())[kind]
helpers=(base/'browser-common.cjs').read_text().replace('height:900','height:740' if width==390 else 'height:844')
s=(base/('rehearsal-'+kind+'.cjs')).read_text().replace('COMMON_HELPERS',helpers).replace('QA_ORIGIN',json.dumps(origin)).replace('QA_WIDTH',str(width)).replace('QA_CONTENT',json.dumps(content,separators=(',',':'))).replace('QA_STAGE',json.dumps('production' if origin.startswith('https') else 'native')).replace('docs/qa-evidence/astronaut-chess-20261028/','docs/qa-evidence/astronaut-chess-audit-20261109/')
if kind=='chess':
 old="if(!(await placed.innerText()).includes(content.pieces.find(p=>p.id===m.piece).glyph))throw Error('Wrong moved piece glyph');"
 new="const letter={king:'k',queen:'q',rook:'r',bishop:'b',knight:'n',pawn:'p'}[m.piece];if(await placed.locator('svg.chess-play-piece[data-piece-type=\"'+letter+'\"][data-piece-color=\"w\"]').count()!==1)throw Error('Wrong illustrated moved piece');"
 assert old in s;s=s.replace(old,new)
 s=s.replace("for(const piece of content.pieces){await page.getByRole('button',{name:'Choose '+piece.name,exact:true}).click();", "for(const piece of content.pieces){if(await page.getByRole('button',{name:'Choose '+piece.name,exact:true}).locator('svg.chess-play-piece').count()!==1)throw Error('Missing friendly piece illustration');await page.getByRole('button',{name:'Choose '+piece.name,exact:true}).click();")
if kind=='astro':
 needle="const m=content.questions.find(q=>q.questionId===id);"
 s=s.replace(needle,"if(id.startsWith('numbers:') && (await task.locator('.astro-question-tag').innerText()).trim()!=='Numbers & counting')throw Error('Misleading number category');"+needle)
cli=Path.home()/'.codex/skills/playwright/scripts/playwright_cli.sh';r=subprocess.run(['bash',str(cli),'-s=amari-targeted-contained','run-code',s],cwd=root,capture_output=True,text=True,timeout=1200)
if '### Result\n' not in r.stdout:raise SystemExit('No structured result: '+(r.stdout+r.stderr)[-3000:])
d=json.loads(r.stdout.split('### Result\n',1)[1].split('\n### Ran',1)[0]);d['expectedEntry']=entry;d['instrumentedDriverHash']=hashlib.sha256(s.encode()).hexdigest();d['sourceHead']=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip();d['passed']=bool(d.get('passed')) and d.get('runtime',{}).get('entry')==entry
a=out/(('production' if origin.startswith('https') else 'native')+'-'+kind+'-'+str(width)+'.json');a.write_text(json.dumps(d,indent=2)+'\n');print(json.dumps({'passed':d['passed'],'game':kind,'width':width,'rows':len(d.get('rows',[])),'report':str(a)}),flush=True)
if r.returncode or not d['passed']:raise SystemExit('failed; see report')
