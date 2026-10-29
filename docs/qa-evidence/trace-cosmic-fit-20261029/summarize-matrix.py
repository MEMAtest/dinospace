#!/usr/bin/env python3
import sys,json,hashlib,datetime
from pathlib import Path
b=Path(__file__).resolve().parent
stage,entry,runtime=sys.argv[1:4]
assert stage in ['native','production']
rows=[]
for game in ['trace','tictactoe']:
 for width,height in [(390,740),(1440,844)]:
  found=[]
  for p in b.glob(f'{stage}-{game}-{width}x{height}-*.json'):
   d=json.loads(p.read_text())
   if d.get('passed')and d.get('entry')==entry and d.get('expectedRuntime')==runtime:found.append((p,d))
  assert found, f'Missing accepted {stage} {game} {width} exact entry/runtime'
  p,d=sorted(found,key=lambda pair:pair[0].name)[-1]
  rows.append({'game':game,'width':width,'height':height,'report':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'actualRows':len(d.get('rows',[])),'providerAttempts':d['diagnostics']['providerAttempts'],'soundRestored':d['soundRestored']})
  assert d['soundRestored']and not d['diagnostics']['providerAttempts']
result={'passed':True,'stage':stage,'runtime':runtime,'entry':entry,'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'cases':rows,'scope':'Exact-entry complete Trace/Cosmic layout regression at both viewports, preserving earlier source-bound functional acceptance. Synthetic existing records, no reset/provider job/editorial score/historical family recovery.'}
p=b/f'{stage}-summary.json';p.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'passed':True,'stage':stage,'cases':len(rows),'output':str(p)}))
