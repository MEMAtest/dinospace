#!/usr/bin/env python3
"""Verify the new Pair11 artwork and a bounded exact teaching-audio sample."""
import argparse, concurrent.futures, datetime as dt, importlib.util, json, subprocess, sys
from pathlib import Path
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parents[3]
BASE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('bounded_checks',ROOT/'docs/qa-evidence/books-spelling-20261029/verify-release.py')
checks=importlib.util.module_from_spec(spec);spec.loader.exec_module(checks)
p=argparse.ArgumentParser();p.add_argument('--origin',required=True);p.add_argument('--backend',required=True);p.add_argument('--runtime-sha',required=True);p.add_argument('--output',required=True);a=p.parse_args()
if subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()!=a.runtime_sha:raise SystemExit('HEAD/runtime mismatch')
out=Path(a.output)
if out.exists():raise SystemExit('Refusing to overwrite evidence')
origin,backend=map(checks.clean_origin,[a.origin,a.backend])
script="""import {getOfflineVoiceClip} from './src/data/offlineVoice.js';import{getFactFinderEntry,getFactFinderAudio}from'./src/data/factFinder.js';import{LETTER_LAUNCH_PROMPT_CORPUS}from'./src/data/letterLaunch.js';const rows=LETTER_LAUNCH_PROMPT_CORPUS.filter((x,i)=>i%20===0).map(text=>({text,path:getOfflineVoiceClip(text,'en-US')}));for(const id of ['dino-trex','space-mars','space-uranus']){const x=getFactFinderAudio(getFactFinderEntry(id));rows.push({text:x.text,path:x.src})}console.log(JSON.stringify(rows));"""
rows=json.loads(subprocess.check_output(['node','--input-type=module','-e',script],cwd=ROOT,text=True))
if any(not r['path'] or not r['path'].startswith('/audio/') for r in rows):raise SystemExit('Non-packaged audio sample')
art=json.loads((BASE/'art-provenance.json').read_text())['assets']
jobs=[('art',{'path':'/'+r['path'].removeprefix('public/'),'sha256':r['sha256']})for r in art]+[('audio',r)for r in rows]
def verify(job):
 kind,r=job
 return {'kind':kind,**({'text':r['text']}if 'text'in r else{}),**checks.verify_get_path(r['path'],origin,backend,ROOT/'public'/r['path'].lstrip('/'),('image/',)if kind=='art'else('audio/',),r.get('sha256'))}
with concurrent.futures.ThreadPoolExecutor(max_workers=6)as pool:results=list(pool.map(verify,jobs))
out.write_text(json.dumps({'passed':True,'at':dt.datetime.now(dt.timezone.utc).isoformat(),'runtimeSource':a.runtime_sha,'scope':'Two new generated/optimized artwork files and bounded exact packaged teaching-audio sample, gateway/backend/local hashes. No provider requests or listening claim.','rows':results},indent=2)+'\n')
print(json.dumps({'passed':True,'art':len(art),'audio':len(rows),'output':str(out)}))
