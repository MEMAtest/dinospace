import json,subprocess,sys,re
from pathlib import Path
origin,width,game,out=sys.argv[1:5]
source_script=sys.argv[5] if len(sys.argv)>5 else 'docs/qa-evidence/trace-tactics-20261025/rehearsal.cjs'
source=Path('src/components/games/LetterTrace.jsx').read_text()
js='const UPPER_STROKES = '+source.split('const UPPER_STROKES = ')[1].split('\n\n// A stroke')[0]
js=js.split('export const getLetterStrokes')[0]+"console.log(JSON.stringify({...UPPER_STROKES,...LOWER_STROKES}))"
guides=json.loads(subprocess.run(['node','--input-type=module','-e',js],capture_output=True,text=True,check=True).stdout)
entry=re.search(r'<script[^>]+type="module"[^>]+src="([^"]+)"',Path('dist/index.html').read_text()).group(1)
runtime=subprocess.run(['git','rev-parse','HEAD'],capture_output=True,text=True,check=True).stdout.strip()
code=Path(source_script).read_text().replace('QA_ORIGIN',json.dumps(origin)).replace('VIEW_WIDTH',width).replace('QA_GAME',json.dumps(game)).replace('TRACE_GUIDES',json.dumps(guides)).replace('QA_EXPECTED_ENTRY',json.dumps(entry)).replace('QA_RUNTIME',json.dumps(runtime)).replace('QA_SCREENSHOTS','true' if 'production' in out else 'false')
r=subprocess.run(['bash','/Users/omosanya_main/.codex/skills/playwright/scripts/playwright_cli.sh','-s=amari-targeted-contained','run-code',code],capture_output=True,text=True,timeout=240)
if r.returncode or '### Error' in r.stdout:
 Path(out+'.failure.txt').write_text(r.stdout+'\n'+r.stderr);print(r.stdout[-8000:]);print(r.stderr[-1500:]);sys.exit(1)
try:j=json.loads(r.stdout.split('### Result\n')[1].split('\n### Ran')[0])
except Exception:print(r.stdout);raise
Path(out).write_text(json.dumps(j,indent=2)+'\n');print(json.dumps({'passed':j['passed'],'game':j['game'],'width':j['width'],'rows':len(j['rows']),'file':out}))
