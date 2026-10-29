#!/usr/bin/env python3
"""Bounded canonical smoke on the retained already-leased synthetic page."""
import argparse,datetime as dt,hashlib,json,os,re,subprocess,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3];BASE=Path(__file__).resolve().parent
p=argparse.ArgumentParser();p.add_argument('width',type=int);p.add_argument('height',type=int);p.add_argument('entry');p.add_argument('--lanes',default='');p.add_argument('--origin',default='https://dinospace.netlify.app');a=p.parse_args()
if a.origin not in ['https://dinospace.netlify.app','http://127.0.0.1:5180']:raise SystemExit('Unapproved origin')
stage='production'if a.origin.startswith('https:')else'native'
owner=json.loads((ROOT/'tmp/amari-qa-browser-owner.json').read_text())
if owner.get('owner')!=os.environ.get('FINAL_QA_OWNER')or not owner.get('active')or dt.datetime.fromisoformat(owner['expiresAt'])<=dt.datetime.now(dt.timezone.utc):raise SystemExit('Matching active browser lease required')
if not re.fullmatch(r'/assets/arcade-[\w-]+\.js',a.entry)or(a.width,a.height)not in[(390,740),(1440,844)]:raise SystemExit('Invalid viewport/entry')
sourceRoot=ROOT/'docs/game-delivery-20261027'
mods={f'./{name}.cjs':(sourceRoot/f'{name}.cjs').read_text()for name in ['integration-native','retained-visual-exercises','retained-maths-exercises','retained-integration-native']}
code=r'''async page=>{
const sources=__SOURCES__,loaded={};
const localRequire=id=>{if(loaded[id])return loaded[id];if(!sources[id])throw Error('Unlisted QA module '+id);const m={exports:{}};Function('module','exports','require',sources[id])(m,m.exports,localRequire);loaded[id]=m.exports;return m.exports;};
const run=localRequire('./retained-integration-native.cjs');
const width=__WIDTH__,height=__HEIGHT__,expectedEntry=__ENTRY__,ids=__LANES__,origin=__ORIGIN__;
const providerAttempts=[];
const guard=async route=>{if(/\/api\/|elevenlabs|openai|text-to-speech|story-provider/i.test(route.request().url())){providerAttempts.push(route.request().url());await route.fulfill({status:403,body:'Synthetic QA guard'});}else await route.continue();};
const sound=async()=>{const x=page.getByRole('button',{name:/Turn sound (on|off)/}).first();return await x.count()?(await x.getAttribute('aria-label'))==='Turn sound off':null;};
const setSound=async wanted=>{const current=await sound();if(current!==null&&current!==wanted){const x=page.getByRole('button',{name:wanted?'Turn sound on':'Turn sound off',exact:true}).first();await x.evaluate(e=>e.scrollIntoView({block:'center',inline:'nearest'}));await x.click();}};
const rewards=()=>page.evaluate(()=>Object.fromEntries(['amari','askia'].map(id=>[id,localStorage.getItem(id+'_rewards_v2')])));
let originalSound=null,before=null,report=null;
try{
 await page.route('**/*',guard);
 await page.setViewportSize({width,height});
 await page.goto(origin+'/?qa_final_retained='+Date.now()+'#/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__amariQaNamespaced===true);
 const amari=page.getByRole('button',{name:/Age 6\+.*Amari/});if(await amari.count())await amari.click();
 await page.getByRole('heading',{name:'Choose a world',exact:true}).waitFor();
 originalSound=await sound();before=await rewards();await setSound(true);
 const lanes=ids.length?run.RETAINED_LANES.filter(x=>ids.includes(x.id)):run.RETAINED_LANES;
 if(ids.length&&lanes.length!==ids.length)throw Error('Unknown lane');
 report=await run(page,{origin,expectedEntry,viewport:{width,height},lanes});
 const after=await rewards();
 for(const id of ['amari','askia']){if(before[id]===null)continue;const b=JSON.parse(before[id]),e=JSON.parse(after[id]);if(!e||e.points<b.points)throw Error('Reward total regressed '+id);for(const[k,v]of Object.entries(b.rewardClaims||{}))if(e.rewardClaims?.[k]!==v)throw Error('Existing claim changed '+id+':'+k);for(const sticker of b.earnedStickerIds||[])if(!e.earnedStickerIds.includes(sticker))throw Error('Earned sticker lost '+id);if(id==='askia'&&before[id]!==after[id])throw Error('Sibling rewards changed');}
 report.rewardRetention={passed:true,before,after};
 if(providerAttempts.length)throw Error('Provider attempt blocked');
}catch(error){report=error.retainedIntegrationPartial||report||{passed:false,lanes:[]};report.passed=false;report.failure={message:error.message,completedLaneIds:report.lanes?.map(x=>x.id)||[]};const file=__FAILURE_IMAGE__;await page.screenshot({path:file,type:'jpeg',quality:65}).catch(()=>{});report.failure.render=file;
}finally{try{if(originalSound!==null)await setSound(originalSound);}catch(e){report??={passed:false};report.passed=false;report.soundRestoreError=e.message;}await page.unroute('**/*',guard);}
return {...report,providerAttempts,originalSound,finalSound:await sound(),at:new Date().toISOString()};
}'''
stamp=dt.datetime.now().strftime('%Y%m%dT%H%M%S')+'-'+str(time.time_ns()%1000000000)
report=BASE/f'{stage}-retained-{a.width}x{a.height}-{stamp}.json'
values={'__ORIGIN__':json.dumps(a.origin),'__SOURCES__':json.dumps(mods),'__WIDTH__':str(a.width),'__HEIGHT__':str(a.height),'__ENTRY__':json.dumps(a.entry),'__LANES__':json.dumps(a.lanes.split(',')if a.lanes else[]),'__FAILURE_IMAGE__':json.dumps(str(BASE/f'failure-{a.width}-{stamp}.jpg'))}
for k,v in values.items():code=code.replace(k,v)
r=subprocess.run(['bash',str(Path.home()/'.codex/skills/playwright/scripts/playwright_cli.sh'),'-s=amari-targeted-contained','run-code',code],cwd=ROOT,capture_output=True,text=True,timeout=1800)
try:d=json.loads(r.stdout.split('### Result\n',1)[1].split('\n### Ran',1)[0])
except Exception:d={'passed':False,'failure':{'message':(r.stdout+r.stderr)[-3000:]}}
d['sourceHead']=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip();d['runtimeSource']=json.loads((ROOT/'docs/game-quality-status.json').read_text())['canonicalRelease']if stage=='production'else d['sourceHead'];d['stage']=stage;d['entry']=a.entry;d['harnessHashes']={k:hashlib.sha256(v.encode()).hexdigest()for k,v in mods.items()};d['scope']='Bounded current-release actual-control integration smoke. Prior full source-bound title acceptance retained; no reset or new editorial score.'
report.write_text(json.dumps(d,indent=2)+'\n');print(json.dumps({'passed':d.get('passed'),'lanes':[x['id']for x in d.get('lanes',[])],'failure':d.get('failure'),'report':str(report)}))
if not d.get('passed')or r.returncode:raise SystemExit(1)
