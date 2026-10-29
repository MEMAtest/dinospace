"""Summarise accepted full actual-control journeys; exclude partial/historical candidates."""
import datetime
import json
import sys
from pathlib import Path

base = Path('docs/qa-evidence/dino-pair-20261029')
stage = sys.argv[1]
assert stage in {'native', 'production'}
gates = json.loads((base / 'source-gates.json').read_text())
entry = gates['entry']
reports = []
for path in base.glob(stage + '-*.json'):
    try:
        data = json.loads(path.read_text())
    except (ValueError, OSError):
        continue
    if data.get('passed') is True and str(data.get('entryIdentity', '')).endswith(entry):
        assert data.get('origin') == ('https://dinospace.netlify.app' if stage == 'production' else 'http://127.0.0.1:5180'), (path.name, 'unexpected origin')
        reports.append((path, data))
accepted = []
for player, count, finds in [('amari', 12, 60), ('askia', 5, 29)]:
    for width, height in [(390, 740), (1440, 844)]:
        candidates = [(path, data) for path, data in reports if data.get('route') == player and data.get('width') == width and data.get('height') == height and data.get('levelRunCount') == count]
        assert len(candidates) == 1, (stage, player, width, 'full Detective report count', len(candidates))
        path, data = candidates[0]
        assert data['primaryFinds'] == finds
        assert all(not data.get(key) for key in ['errors', 'failures', 'pageErrors', 'consoleErrors', 'providerRequests', 'failedResources'])
        accepted.append({'game': 'dino', 'player': player, 'width': width, 'height': height, 'missionRuns': count, 'primaryResponses': finds, 'report': str(path.relative_to(base))})
for width, height in [(390, 740), (1440, 844)]:
    candidates = [(path, data) for path, data in reports if data.get('stage') == 'full' and data.get('targets') == [3, 3, 6, 4] and data.get('width') == width and data.get('height') == height and data.get('completedLevels') == [0, 1, 2, 3]]
    assert len(candidates) == 1, (stage, width, 'full Hangman report count', len(candidates))
    path, data = candidates[0]
    levels = [row for row in data['rows'] if row.get('kind') == 'level-target-reached']
    assert [row['target'] for row in levels] == [3, 3, 6, 4]
    assert all(len(row['rescued']) == row['target'] == row['uniqueVisibleWordCount'] for row in levels)
    assert data['assistedEvidence'] and data['legacyBytesPreserved'] and data['protectedKeysUnchanged']
    assert all(not data.get(key) for key in ['errors', 'pageErrors', 'consoleErrors', 'apiRequests', 'resourceFailures', 'requestFailures', 'brokenImages'])
    accepted.append({'game': 'hangman', 'player': 'amari', 'width': width, 'height': height, 'missionRuns': 4, 'primaryResponses': 16, 'report': str(path.relative_to(base))})
result = {'at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'passed': True, 'stage': stage, 'runtime': gates['runtime'], 'entry': entry, 'journeys': accepted, 'journeyCount': len(accepted), 'missionRuns': sum(row['missionRuns'] for row in accepted), 'primaryResponses': sum(row['primaryResponses'] for row in accepted), 'scope': 'Six eligible child/game/viewport journeys. Wrong retries, diagnostics and replays are additional checks, not extra primary responses. No new editorial or listening score.'}
assert result['journeyCount'] == 6 and result['missionRuns'] == 42 and result['primaryResponses'] == 210
(base / (stage + '-compiled-summary.json' if stage == 'native' else 'production-summary.json')).write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
