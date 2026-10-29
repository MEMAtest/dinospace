"""Verify retained synthetic records after the canonical Pair7 actual-control matrix."""
import datetime
import json
from pathlib import Path

BASE = Path('docs/qa-evidence/dino-pair-20261029')
pre = json.loads((BASE / 'pre-release-storage.json').read_text())
cutover = json.loads((BASE / 'cutover-storage.json').read_text())
final = json.loads((BASE / 'production-worker-persistence.json').read_text())
patch_pre = json.loads((BASE / 'patch-pre-release-storage.json').read_text())
patch_after = json.loads((BASE / 'patch-cutover-storage.json').read_text())
assert patch_pre['hashes'] == patch_after['hashes'], 'Patch refresh changed saved records'
assert pre['hashes'] == cutover['hashes'], 'Explicit release refresh changed existing saved records'
assert final['entry'].endswith('/assets/arcade-DYyDnHAt.js')
assert not final['notice'] and not final['overflow']
assert set(final['worker']['caches']) == {'amari-discovery-v43', 'amari-discovery-media-v1'}
allowed = {'amari_amari_dino_detective_batch3_v1', 'askia_little_progress', 'amari_hangman_progress_v1:amari'}
for player in ['askia', 'amari']:
    allowed.update(f'{player}_{suffix}' for suffix in ['rewards_v2', 'earned_sticker_ids_v1', 'points', 'games_played'])
protected = {key: value for key, value in pre['hashes'].items() if key not in allowed}
assert all(final['hashes'].get(key) == value for key, value in protected.items()), 'An unrelated saved key changed'
assert set(final['hashes']) - set(pre['hashes']) <= allowed, 'Unexpected saved-record key added'
get = lambda snapshot, key: json.loads(snapshot['values'].get(key) or 'null')
players = {}
for player in ['askia', 'amari']:
    old, new = get(pre, f'{player}_rewards_v2') or {}, get(final, f'{player}_rewards_v2') or {}
    assert set(old.get('earnedStickerIds', [])) <= set(new.get('earnedStickerIds', []))
    assert set(get(final, f'{player}_earned_sticker_ids_v1') or []) == set(new.get('earnedStickerIds', []))
    assert get(final, f'{player}_points') == new.get('points', 0)
    assert get(final, f'{player}_games_played') == new.get('gamesPlayed', {})
    for game, count in old.get('gamesPlayed', {}).items():
        if game not in {'dino', 'hangman'}:
            assert new.get('gamesPlayed', {}).get(game) == count, (player, game)
    for token, amount in old.get('rewardClaims', {}).items():
        assert new.get('rewardClaims', {}).get(token) == amount, (player, token)
    delta = sum(amount for token, amount in new.get('rewardClaims', {}).items() if token not in old.get('rewardClaims', {}))
    assert new.get('points', 0) - old.get('points', 0) == delta, (player, 'reward delta')
    players[player] = {'pointsBefore': old.get('points', 0), 'pointsAfter': new.get('points', 0), 'verifiedNewClaimDelta': delta, 'priorClaimsRetained': len(old.get('rewardClaims', {})), 'priorStickersRetained': len(old.get('earnedStickerIds', []))}
before_little, after_little = get(pre, 'askia_little_progress') or {}, get(final, 'askia_little_progress') or {}
for game, value in before_little.items():
    if game != 'dino':
        assert after_little.get(game) == value, ('askia', game)
assert after_little['dino']['level'] == 4
assert set(get(final, 'amari_amari_dino_detective_batch3_v1')['completedWorldIds']) == {'jungle', 'volcano', 'river', 'moonlight', 'desert', 'rainbow', 'swamp', 'snow', 'cave', 'fern-forest', 'claw-cliffs', 'ancient-shores'}
assert get(final, 'amari_hangman_progress_v1:amari')['completedLevels'] == [0, 1, 2, 3]
result = {'at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'passed': True, 'cutoverProtectedKeys': len(pre['hashes']), 'otherSavedKeyHashesUnchanged': len(protected), 'priorAskiaLittleRowsUnchanged': len(before_little) - ('dino' in before_little), 'players': players, 'entry': final['entry'], 'workerCaches': final['worker']['caches'], 'scope': 'Canonical synthetic persistence only; not historical family-book recovery.'}
(BASE / 'production-retention-summary.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
