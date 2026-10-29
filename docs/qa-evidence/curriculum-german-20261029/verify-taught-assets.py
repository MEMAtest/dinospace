#!/usr/bin/env python3
"""Hash a small exact packaged-teaching sample; never fetch full corpora."""
import argparse
import concurrent.futures
import datetime as dt
import importlib.util
import json
import subprocess
import sys
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[3]
BASE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('bounded_release_checks', ROOT / 'docs/qa-evidence/books-spelling-20261029/verify-release.py')
checks = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checks)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--origin', required=True)
    parser.add_argument('--backend', required=True)
    parser.add_argument('--runtime-sha', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    output = Path(args.output)
    if output.exists():
        parser.error('Refusing to overwrite evidence')
    source = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    if source != args.runtime_sha:
        parser.error('Runtime SHA must match frozen checkout HEAD')
    origin, backend = checks.clean_origin(args.origin), checks.clean_origin(args.backend)
    if origin == backend:
        parser.error('Public/draft gateway and immutable backend must be distinct')
    inventory = json.loads((BASE / 'packaged-audio-inventory.json').read_text())
    terms = {'Links', 'Rechts', 'Geradeaus', 'Zurück', 'Langsam', 'Halt'}
    english = {
        'A continent is a large area of land. An ocean is a huge area of salt water. A country is a place where people live. A map helps us find places.',
        'The past is what happened before now. Evidence is a clue that helps us learn. A sequence puts events in order.',
        'Scientists observe, sort and classify. Plants and animals are living things; materials are what objects are made from; seasons bring different weather.',
        'Africa', 'Europe', 'Asia',
        'A prediction is an idea, not a wrong answer.',
        'Good move.',
        'Good detective work. Look closely and try another answer.',
    }
    selected = [row for row in inventory['rows'] if (row['language'] == 'de' and row['text'] in terms) or (row['language'] == 'en' and row['text'] in english)]
    if len(selected) != 15:
        raise RuntimeError(f'Expected15 source-bound sample records; found{len(selected)}')
    def verify(row):
        result = checks.verify_get_path(row['path'], origin, backend, ROOT / 'public' / row['path'].lstrip('/'), ('audio/',), row['sha256'])
        return {'language': row['language'], 'text': row['text'], **result}
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        rows = list(pool.map(verify, selected))
    result = {'passed': True, 'at': dt.datetime.now(dt.timezone.utc).isoformat(), 'runtimeSource': source, 'origin': origin, 'backend': backend,
              'scope': '15 exact packaged teaching clips hashed on gateway and immutable backend; whole local511-file inventory retained separately. No listening claim or provider requests.',
              'rows': rows}
    output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({'passed': True, 'sampleFiles': len(rows), 'output': str(output)}))


if __name__ == '__main__':
    main()
