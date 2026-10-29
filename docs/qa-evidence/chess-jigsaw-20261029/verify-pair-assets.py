"""Small immutable/gateway identity checks for the new offline worker and license."""
import argparse
import json
import runpy
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--origin', required=True)
    parser.add_argument('--backend', required=True)
    parser.add_argument('--runtime-sha', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    out = Path(args.output)
    if out.exists():
        raise SystemExit('Refusing to replace evidence')
    actual = subprocess.check_output(['git','rev-parse','HEAD'], cwd=ROOT, text=True).strip()
    if actual != args.runtime_sha:
        raise SystemExit('Runtime source differs from checkout')
    verifier = runpy.run_path(str(ROOT / 'docs/qa-evidence/books-spelling-20261029/verify-release.py'))
    origin = verifier['clean_origin'](args.origin)
    backend = verifier['clean_origin'](args.backend)
    workers = list((ROOT/'dist/assets').glob('chessAi.worker-*.js'))
    if len(workers) != 1:
        raise SystemExit('Expected exactly one compiled Chess worker')
    paths = [workers[0], ROOT/'dist/licenses/chess-js.txt']
    rows = []
    for local in paths:
        path = '/' + local.relative_to(ROOT/'dist').as_posix()
        kinds = ('application/javascript','text/javascript') if local.suffix == '.js' else ('text/plain',)
        rows.append(verifier['verify_get_path'](path, origin, backend, local, kinds))
    record = {'passed': True, 'runtime': actual, 'origin': origin, 'backend': backend, 'assets': rows}
    out.write_text(json.dumps(record,indent=2)+'\n')
    print(json.dumps({'passed':True,'assets':len(rows),'output':str(out)}))

if __name__ == '__main__':
    main()
