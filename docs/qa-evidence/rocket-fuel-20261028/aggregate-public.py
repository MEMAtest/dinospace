import datetime
import json
from pathlib import Path

base = Path('docs/qa-evidence/rocket-fuel-20261028')
rows = []
for player in ['askia', 'amari']:
    for game in ['rocketbuilder', 'fuelup']:
        for width in [390, 1440]:
            path = base / f'production-{player}-{game}-{width}.json'
            data = json.loads(path.read_text())
            assert data['passed'] and data['namespaced'], path
            assert data['origin'] == 'https://dinospace.netlify.app'
            assert data['entryIdentity'] == '/assets/arcade-DOQI-044.js'
            assert [r['level'] for r in data['completedLevelRuns']] == ([1, 2, 3, 4, 5] if player == 'askia' else [3, 4, 5])
            assert not any(data[key] for key in ['providerRequests', 'pageErrors', 'consoleErrors', 'failedResources', 'failures'])
            rows.append({'report': path.name, 'player': player, 'game': game, 'width': width,
                         'levels': data['completedLevelRuns'], 'interactionRows': len(data['rows']),
                         'baselineRecorded': bool(data['baseline'])})
totals = {game: sum(r['rounds'] for row in rows if row['game'] == game for r in row['levels']) for game in ['rocketbuilder', 'fuelup']}
assert totals == {'rocketbuilder': 44, 'fuelup': 74}, totals
summary = {'at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'passed': True,
           'runtime': '6770807d0ad4fc79b8d1fbd305935441189d241d', 'entry': '/assets/arcade-DOQI-044.js', 'worker': 'amari-discovery-v40',
           'publicUrl': 'https://dinospace.netlify.app', 'matrix': rows,
           'totals': {'journeys': len(rows), 'levelRuns': sum(len(r['levels']) for r in rows), 'rounds': totals,
                      'interactionRows': sum(r['interactionRows'] for r in rows), 'providerRequests': 0, 'pageErrors': 0, 'consoleErrors': 0, 'failedResources': 0},
           'scope': 'Source-bound functional acceptance for these two games. No editorial/listening score or historical family-data recovery claim.'}
(base / 'production-summary.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps(summary['totals']))
