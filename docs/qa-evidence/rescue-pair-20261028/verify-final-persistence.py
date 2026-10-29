import hashlib,json,datetime
from pathlib import Path
b=Path('docs/qa-evidence/rescue-pair-20261028')
final=json.loads((b/'production-worker-persistence.json').read_text())
pre=json.loads((b/'pre-release-saved-hashes.json').read_text())
baseline=json.loads((b/'production-askia-firerescue-390.json').read_text())['baseline']
assert final['entry']=='/assets/arcade-DJc79J3o.js' and not final['notice'] and not final['overflow']
assert 'amari-discovery-v41' in final['worker']['caches']
assert set(final['worker']['caches'])=={'amari-discovery-v41','amari-discovery-media-v1'}
allowed={'qa_rewards_20261024_'+p+'_'+k for p in ['askia','amari'] for k in ['little_progress','rewards_v2','earned_sticker_ids_v1']}
protected={k:v for k,v in pre['hashes'].items() if k not in allowed}
assert all(final['hashes'].get(k)==v for k,v in protected.items())
assert set(final['hashes'])-set(pre['hashes']) <= allowed
sha=lambda obj:hashlib.sha256(json.dumps(obj,separators=(',',':'),ensure_ascii=False).encode()).hexdigest()
players={}
for player,pk,rk in [('askia','progress','rewards'),('amari','siblingProgress','siblingRewards')]:
 before_progress=json.loads(baseline[pk] or '{}');before_reward=json.loads(baseline[rk] or '{}');after=final['players'][player]
 expected_rows={game:sha(value) for game,value in before_progress.items() if game not in ['firerescue','ladder']}
 assert after['protectedGameRows']==expected_rows,(player,'other game rows')
 old_ids=set(before_reward.get('earnedStickerIds',[]));new_ids=set(after['rewards'].get('earnedStickerIds',[]))
 assert old_ids<=new_ids
 assert set(after['legacyStickerIds'] or [])==new_ids
 for game,value in before_reward.get('gamesPlayed',{}).items():
  if game not in ['firerescue','ladder']:assert after['rewards']['gamesPlayed'].get(game)==value,(player,game)
 total_delta=0;levels=0
 for game in ['firerescue','ladder']:
  game_runs=[]
  for width in [390,1440]:game_runs+=json.loads((b/f'production-{player}-{game}-{width}.json').read_text())['completedLevelRuns']
  current=after['fire' if game=='firerescue' else 'ladder'];before=before_progress.get(game,{})
  assert current['plays']==before.get('plays',0)+len(game_runs),(player,game,'plays')
  assert current['level']==4
  total_delta+=sum(row['rewardDelta'] for row in game_runs);levels+=len(game_runs)
 assert after['rewards']['points']-before_reward.get('points',0)==total_delta,(player,'point delta')
 players[player]={'earlierGameRowsUnchanged':len(expected_rows),'earlierStickerIdsRetained':len(old_ids),'earnedStickerMirrorMatches':True,'pointsBefore':before_reward.get('points',0),'pointsAfter':after['rewards']['points'],'verifiedEarnedDelta':total_delta,'completedLevelRuns':levels}
result={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'passed':True,'protectedKeyHashesUnchanged':len(protected),'players':players,'entry':final['entry'],'workerCaches':final['worker']['caches'],'notice':False,'overflow':False,'scope':'Synthetic canonical earned-record retention and prior-pair protection; no historical family-story recovery claim.'}
(b/'production-retention-summary.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
