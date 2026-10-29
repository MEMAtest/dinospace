import datetime
import json
from pathlib import Path

base = Path('docs/qa-evidence/rescue-pair-20261028')
gate = json.loads((base / 'source-gates.json').read_text())
matrix = []
for player in ['askia', 'amari']:
    for game in ['firerescue', 'ladder']:
        for width in [390, 1440]:
            path = base / f'production-{player}-{game}-{width}.json'
            data = json.loads(path.read_text())
            assert data['passed'] and data['namespaced'], path
            assert data['origin'] == 'https://dinospace.netlify.app', path
            assert data['entryIdentity'] == gate['entry'], path
            assert data['viewportHeight'] == (740 if width == 390 else 844), path
            levels = data['completedLevelRuns']
            assert [row['level'] for row in levels] == ([1, 2, 3, 4, 5] if player == 'askia' else [3, 4, 5]), path
            for key in ['failures', 'providerRequests', 'pageErrors', 'consoleErrors', 'failedResources']:
                assert not data[key], (path, key, data[key])
            for row in levels:
                assert row['rewardDelta'] == row['expectedReward'], (path, row['level'])
                assert len(row['roundDetails']) == row['rounds'], (path, row['level'])
            if width == 390:
                assert len([row for row in data['rows'] if row.get('kind') == 'completion-captions-visible-with-backing']) == len(levels), path
            matrix.append({'report': path.name, 'player': player, 'game': game, 'width': width, 'height': data['viewportHeight'],
                           'levels': [row['level'] for row in levels], 'levelRuns': len(levels),
                           'rounds': sum(row['rounds'] for row in levels),
                           'targetsExtinguished': sum(row.get('targetsExtinguished', 0) or 0 for row in levels),
                           'rescues': sum(row.get('rescues', 0) or 0 for row in levels),
                           'rewardDeltas': [row['rewardDelta'] for row in levels]})
totals = {'journeys': len(matrix), 'levelRuns': sum(row['levelRuns'] for row in matrix),
          'fireRounds': sum(row['rounds'] for row in matrix if row['game'] == 'firerescue'),
          'ladderRounds': sum(row['rounds'] for row in matrix if row['game'] == 'ladder'),
          'firesExtinguished': sum(row['targetsExtinguished'] for row in matrix),
          'rescues': sum(row['rescues'] for row in matrix),
          'providerRequests': 0, 'pageErrors': 0, 'consoleErrors': 0, 'failedResources': 0}
assert totals['journeys'] == 8 and totals['levelRuns'] == 32
assert totals['fireRounds'] == 74 and totals['ladderRounds'] == 74
assert totals['firesExtinguished'] == 248 and totals['rescues'] == 74
summary = {'at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'passed': True,
           'runtime': gate['runtime'], 'entry': gate['entry'], 'worker': 'amari-discovery-v41',
           'publicUrl': 'https://dinospace.netlify.app', 'matrix': matrix, 'totals': totals,
           'scope': 'Final-source functional production acceptance for this pair; no editorial/listening score or historical family-book recovery claim.'}
(base / 'production-summary.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps(totals))
