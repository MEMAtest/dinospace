"""Build a compact index only after every current-entry pair case passed."""
import argparse
import hashlib
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--stage', choices=['native','production'], required=True)
    p.add_argument('--entry', required=True)
    p.add_argument('--output', required=True)
    args = p.parse_args()
    out = Path(args.output)
    if out.exists():
        raise SystemExit('Refusing to replace evidence')
    selected = {}
    for path in sorted(BASE.glob(args.stage+'-*.json'),key=lambda p:p.stat().st_mtime):
        d = json.loads(path.read_text())
        if not d.get('passed') or (d.get('entry') or d.get('entryIdentity')) != args.entry:
            continue
        if 'openingCaseCount' in d:
            key = ('chess','amari',0,int(d['viewport'].split('x')[0]))
            if not d.get('legalHistoryValidation',{}).get('passed') or d.get('openingCaseCount') != 6 or d.get('coverageLimitations'):
                raise SystemExit('Incomplete Chess acceptance: '+path.name)
        elif d.get('player') in ['askia','amari'] and 'level' in d:
            key = ('dinojigsaw',d['player'],d['level'],d['width'])
            if len(d.get('rows',[])) != 1 or len(d['rows'][0].get('rounds',[])) != 4:
                raise SystemExit('Incomplete Jigsaw acceptance: '+path.name)
        else:
            continue
        for field in ['errors','provider','providers','failed','failedRequests','consoleErrors','failures','pageErrors','providerAttempts','responseFailures','requestFailures']:
            if d.get(field):
                raise SystemExit('Nonempty error/provider field: '+path.name+' '+field)
        selected[key] = (path,d)
    expected = [('chess','amari',0,w) for w in [390,1440]]
    expected += [('dinojigsaw',child,level,w) for child,levels in [('askia',range(1,6)),('amari',range(3,6))] for level in levels for w in [390,1440]]
    missing = [key for key in expected if key not in selected]
    if missing:
        raise SystemExit('Missing accepted current-entry cases: '+str(missing))
    rows=[]
    for key in expected:
        path,d=selected[key]
        item={'game':key[0],'player':key[1],'level':key[2] or None,'width':key[3],'report':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
        if key[0]=='dinojigsaw':
            level=d['rows'][0]
            item.update(pieces=[r['pieces'] for r in level['rounds']],fault=d['faultFacts'],replay=d['replayFacts'],reward=level['protection']['rewardDelta'])
        else:
            item.update(openings=d['openingCaseCount'],legalHistoryValidation=d['legalHistoryValidation'])
        rows.append(item)
    record={'passed':True,'scope':'Targeted functional pair acceptance; no catalogue quality score or historical personal recovery.','stage':args.stage,'entry':args.entry,'chessViewports':2,'jigsawCases':16,'jigsawPuzzles':64,'cases':rows}
    out.write_text(json.dumps(record,indent=2)+'\n')
    print(json.dumps({'passed':True,'cases':len(rows),'output':str(out)}))

if __name__=='__main__':
    main()
