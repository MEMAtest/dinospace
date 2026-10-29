async page=>{
const ORIGIN='__ORIGIN__', PLAYER='__PLAYER__', GAME='__GAME__';
const WIDTH=Number('__WIDTH__'), HEIGHT=Number('__HEIGHT__'), EXPECTED_ENTRY='__EXPECTED_ENTRY__';
const OUT='/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-b7-memory-cumulative-20261006/docs/qa-evidence/rescue-pair-20261028';
const progressKey=`${PLAYER}_little_progress`, rewardsKey=`${PLAYER}_rewards_v2`;
const other=PLAYER==='askia'?'amari':'askia', otherProgressKey=`${other}_little_progress`, otherRewardsKey=`${other}_rewards_v2`;
const RUNS=__RUNS__;
const VIEW_TAG=HEIGHT===844?String(WIDTH):`${WIDTH}x${HEIGHT}`;
const title=GAME==='firerescue'?'Fire Truck Rescue':'Ladder Rescue';
const world=GAME==='firerescue'?'Maths Missions':'Thinking & Play';
const counts=[[1,1,2],[1,2,2,3],[2,2,3,3,3],[3,3,4,4,5],[4,4,5,5,6]];
const rounds=[3,4,5,5,5];
const rows=[], completedLevelRuns=[], failures=[], providerRequests=[], failedResources=[], consoleErrors=[], pageErrors=[];
let baseline=null, entryIdentity=null, namespaced=false, faultArmed=false, blockedThisLevel=false;
const onError=e=>pageErrors.push(String(e.message||e));
const onConsole=m=>{if(m.type()==='error')consoleErrors.push(m.text());};
const onRequest=r=>{if(/\/api\//.test(r.url()))providerRequests.push(r.url());};
const onResponse=r=>{if(r.status()>=400&&!/\/api\//.test(r.url()))failedResources.push({status:r.status(),url:r.url()});};
page.on('pageerror',onError); page.on('console',onConsole); page.on('request',onRequest); page.on('response',onResponse);
const local=key=>page.evaluate(k=>{try{return window.localStorage.getItem(k)}catch(e){return `!READ_ERROR:${e.name}`}},key);
const parsed=async key=>{const raw=await local(key);if(raw?.startsWith('!READ_ERROR:'))throw Error(`Storage read failed for ${key}: ${raw}`);try{return raw?JSON.parse(raw):null}catch(e){throw Error(`Malformed JSON in ${key}`)}};
const mediaTracker=()=>{if(window.__rescuePair6DirectMediaV1)return;window.__rescuePair6DirectMediaV1=true;window.__rescuePair6MediaEventsV1=[];const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(...args){for(const type of ['play','playing','timeupdate','pause','ended','error'])this.addEventListener(type,()=>window.__rescuePair6MediaEventsV1.push({type,src:this.currentSrc||this.src||'',time:this.currentTime,duration:this.duration}),{once:true});return play.apply(this,args)}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const assertNamespace=async()=>{namespaced=await page.evaluate(()=>window.__amariQaNamespaced===true);if(!namespaced)throw Error('Retained-profile namespace guard absent after navigation');};
const entry=async()=>{const src=await page.locator('script[type="module"][src]').first().getAttribute('src');entryIdentity=src;if(!src?.includes(EXPECTED_ENTRY))throw Error(`Compiled entry mismatch: ${src} != ${EXPECTED_ENTRY}`);};
const snap=async()=>({progress:await local(progressKey),rewards:await local(rewardsKey),siblingProgress:await local(otherProgressKey),siblingRewards:await local(otherRewardsKey)});
const enterGame=async()=>{
 await page.addInitScript(mediaTracker);
 await page.goto(`${ORIGIN}/?qa_rescue_pair6=${PLAYER}-${GAME}-${WIDTH}-${Date.now()}#/`);await assertNamespace();await entry();
 const chooser=page.getByRole('button',{name:PLAYER==='askia'?/Age 3\+.*Askia/:/Age 6\+.*Amari/});
 let chooserShown=false;try{await chooser.waitFor({state:'visible',timeout:1800});chooserShown=true}catch{}
 if(chooserShown)await chooser.click();
 else{
   await page.getByRole('heading',{name:'Choose a world',exact:true}).waitFor({timeout:10000});
   const current=page.getByRole('button',{name:/is playing.*(?:Change player|Tap to change player)/});
   if(await current.count()){
     const who=(await current.getAttribute('aria-label')||'').toLowerCase();
     if(!who.includes(PLAYER)){await current.click();await page.getByRole('button',{name:PLAYER==='askia'?/Age 3\+.*Askia/:/Age 6\+.*Amari/}).click();}
   }
 }
 await page.getByRole('heading',{name:'Choose a world',exact:true}).waitFor({timeout:10000});
 const soundOn=page.getByRole('button',{name:'Turn sound on',exact:true});if(await soundOn.count())await soundOn.click();
 if(PLAYER==='askia'){
   await page.getByRole('heading',{name:'Rescue World',exact:true}).waitFor({timeout:10000});
   await page.getByRole('button',{name:`Play ${title}`,exact:true}).click();
 }else{
   await page.locator('.discovery-world-card').filter({hasText:world}).click();
   await page.locator('.catalogue-game-card').filter({hasText:title}).click();
 }
 await page.getByRole('button',{name:`Play ${title}`,exact:true}).waitFor({timeout:10000});
};
const chooseLevel=async(i)=>{const b=page.getByRole('button',{name:`Practice level ${i+1}`,exact:true});await b.waitFor({timeout:10000});if(!(await b.isEnabled()))throw Error(`Level ${i+1} is locked in normal UI`);if(await b.getAttribute('aria-pressed')!=='true')await b.click();if(await b.getAttribute('aria-pressed')!=='true')throw Error(`Level ${i+1} selection did not stick`);};
const homeAndReenter=async()=>{await page.getByRole('button',{name:'Go home',exact:true}).first().click();let branch='direct home navigation';const dialog=page.getByRole('heading',{name:'Leave the game?',exact:true});try{await dialog.waitFor({state:'visible',timeout:1200});branch=PLAYER==='askia'?'Leave dialog → Back to home':'Leave dialog → Back to world';await page.getByRole('button',{name:PLAYER==='askia'?'Back to home':'Back to world',exact:true}).click()}catch{};await page.getByRole('heading',{name:PLAYER==='askia'?'Hi Askia!':world,exact:true}).waitFor({timeout:10000});return branch;};
const capture=async(stage,level)=>{const file=`${OUT}/native-${PLAYER}-${GAME}-${VIEW_TAG}-L${level+1}-${stage}.jpg`;await page.screenshot({path:file,type:'jpeg',quality:72,fullPage:false});return file;};
const measureButton=async(stage,button)=>{await button.waitFor({state:'visible',timeout:10000});const geometry=await button.evaluate(element=>{const r=element.getBoundingClientRect();return{label:element.getAttribute('aria-label')||element.innerText.trim(),rect:{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom},viewport:{width:innerWidth,height:innerHeight}}});if(geometry.rect.x<0||geometry.rect.y<0||geometry.rect.right>geometry.viewport.width+1||geometry.rect.bottom>geometry.viewport.height+1)throw Error(`${stage} action is outside the viewport: ${JSON.stringify(geometry)}`);rows.push({kind:`${stage}-visible-without-scroll`,...geometry});};
const measureDoneCaptions=async()=>{const captions=await page.locator('.pair-compact-done button[aria-label]').evaluateAll(buttons=>buttons.map(button=>{const label=button.nextElementSibling;if(!label||label.tagName!=='SPAN')return null;const r=label.getBoundingClientRect(),style=getComputedStyle(label);return{text:label.innerText,rect:{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height},background:style.backgroundColor,color:style.color,viewport:{width:innerWidth,height:innerHeight}}}).filter(Boolean));if(!captions.length)throw Error('No compact completion captions found');for(const label of captions){if(label.rect.x<0||label.rect.y<0||label.rect.right>label.viewport.width+1||label.rect.bottom>label.viewport.height+1)throw Error(`Completion caption is outside viewport: ${JSON.stringify(label)}`);if(label.background==='rgba(0, 0, 0, 0)'||label.background==='transparent')throw Error(`Completion caption has no contrast backing: ${JSON.stringify(label)}`);}rows.push({kind:'completion-captions-visible-with-backing',captions});};
const measureHeldAction=async(stage,label)=>{const button=page.getByRole('button',{name:label,exact:true});await measureButton(stage,button);const path=`${OUT}/native-amari-${GAME}-${VIEW_TAG}-${stage}.jpg`;await page.screenshot({path,type:'jpeg',quality:72,fullPage:false});rows[rows.length-1].path=path;};
const measureSceneLayout=async(scene)=>{const result=await page.evaluate(element=>{const a=element.getBoundingClientRect(),b=document.querySelector(".discovery-game-content > div").getBoundingClientRect();return{scene:{x:a.x,y:a.y,right:a.right,bottom:a.bottom,width:a.width,height:a.height},shell:{x:b.x,y:b.y,right:b.right,bottom:b.bottom,width:b.width,height:b.height},viewport:{width:innerWidth,height:innerHeight}}},await scene.elementHandle());const fits=result.scene.x>=result.shell.x-1&&result.scene.right<=result.shell.right+1&&result.scene.y>=result.shell.y-1&&result.scene.bottom<=result.shell.bottom+1;if(!fits)throw Error(`Fire scene extends beyond the Discovery game shell: ${JSON.stringify(result)}`);const path=`${OUT}/native-amari-firerescue-${VIEW_TAG}-scene-bounds.jpg`;await page.screenshot({path,type:'jpeg',quality:72,fullPage:false});rows.push({kind:'fire-scene-contained-in-shell',...result,path});};
const verifyNoAssetErrors=async()=>{const result=await page.evaluate(async()=>{const images=await Promise.all([...document.images].map(async im=>{try{await im.decode();return{src:im.currentSrc,ok:im.naturalWidth>0&&im.naturalHeight>0}}catch{return{src:im.currentSrc||im.src,ok:false}}}));return{width:innerWidth,scrollWidth:document.documentElement.scrollWidth,images}});if(result.scrollWidth>result.width)throw Error(`Horizontal overflow: ${JSON.stringify(result)}`);if(result.images.some(x=>!x.ok))throw Error(`Broken or undecoded rendered image: ${JSON.stringify(result.images)}`);return result;};
const verifyFireVoiceSequence=async(count)=>{const numberHash=count===1?'44a9aff3':'49a9b7d2',doneHash='86cd19bf';await page.waitForFunction(({numberHash:nh,doneHash:dh})=>{const es=window.__rescuePair6MediaEventsV1||[];const number=es.map((event,index)=>({event,index})).find(({event})=>event.src.includes(nh)&&(event.type==='play'||event.type==='playing'));if(!number)return false;const ended=es.findIndex((event,index)=>index>number.index&&event.src.includes(nh)&&event.type==='ended');const done=es.findIndex((event,index)=>index>number.index&&event.src.includes(dh)&&(event.type==='play'||event.type==='playing'));return ended>=0&&done>ended},{numberHash,doneHash},{timeout:9000});const events=await page.evaluate(()=>window.__rescuePair6MediaEventsV1||[]);const np=events.findIndex(e=>e.src.includes(numberHash)&&(e.type==='play'||e.type==='playing'));const ne=events.findIndex((e,i)=>i>np&&e.src.includes(numberHash)&&e.type==='ended');const dp=events.findIndex((e,i)=>i>np&&e.src.includes(doneHash)&&(e.type==='play'||e.type==='playing'));const de=events.findIndex((e,i)=>i>dp&&e.src.includes(doneHash)&&e.type==='ended');if(np<0||ne<0||dp<=ne)throw Error(`Fire number-to-completion clip order was not observed: ${JSON.stringify(events.filter(e=>e.src.includes(numberHash)||e.src.includes(doneHash)))}`);return{number:count,numberClipStarted:true,numberClipEndedBeforeDone:true,doneClipStarted:true,doneClipEnded:de>dp,events:events.filter(e=>e.src.includes(numberHash)||e.src.includes(doneHash))};};
const callCapture=async(...args)=>{let stage,level;if(GAME==='firerescue'&&args[0]&&typeof args[0]==='object'){stage=args[0].stage;level=args[0].levelIndex}else{stage=args[0];level=args[2]?.level-1}if((stage==='fire-level-start'||stage==='ladder-level-start')&&level===4){await verifyNoAssetErrors();const shot=await capture('start',level);rows.push({kind:'representative-render',game:GAME,player:PLAYER,width:WIDTH,level:5,path:shot});}};
const faultAtFinish=async({page:p,levelIndex,advance})=>{if(levelIndex!==4||WIDTH!==390||faultArmed)return;faultArmed=true;const before=await snap();await p.evaluate(()=>{const original=Storage.prototype.setItem;let once=true;Storage.prototype.setItem=function(k,v){if(once&&String(k).endsWith('_little_progress')){once=false;throw new DOMException('temporary quota failure for native Retry check','QuotaExceededError')}return original.call(this,k,v)};window.__rescuePair6Restore=()=>{Storage.prototype.setItem=original}});return before;};
const readRewardPoints=x=>{try{return JSON.parse(x||'{}').points??JSON.parse(x||'{}').totalPoints??0}catch{return 0}};
const extractGame=(progress)=>{try{return JSON.parse(progress||'{}')[GAME]}catch{return null}};
const emitLevel=async(level,run,prev)=>{
 const isBlocked=Boolean(run.blockedSave);
 if(isBlocked){
   const held=await snap();
   if(held.progress!==prev.progress||held.rewards!==prev.rewards)throw Error('Blocked save changed persisted progress or rewards before Retry');
   rows.push({kind:'save-failure-held',level:level+1,progressUnchanged:true,rewardsUnchanged:true});
   await page.evaluate(()=>window.__rescuePair6Restore?.());
   const retry=page.getByRole('button',{name:'Retry saving this result',exact:true});
   if(PLAYER==='amari'&&WIDTH===390){
     const geometry=await retry.evaluate(element=>{const r=element.getBoundingClientRect();return{label:element.innerText.trim(),rect:{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom},viewport:{width:innerWidth,height:innerHeight}}});
     if(geometry.rect.x<0||geometry.rect.y<0||geometry.rect.right>geometry.viewport.width+1||geometry.rect.bottom>geometry.viewport.height+1)throw Error(`Amari save Retry action is outside the viewport: ${JSON.stringify(geometry)}`);
     const path=`${OUT}/native-amari-${GAME}-${VIEW_TAG}-save-retry.jpg`;await page.screenshot({path,type:'jpeg',quality:72,fullPage:false});rows.push({kind:'save-retry-visible-without-scroll',...geometry,path});
   }
   await retry.click();
 }
 await page.getByRole('heading',{name:/Well done/i}).waitFor({timeout:15000});
 await wait(1200);
 const after=await snap();if(after.siblingProgress!==baseline.siblingProgress||after.siblingRewards!==baseline.siblingRewards)throw Error('Other child data changed');
 const beforeMap=JSON.parse(prev.progress||'{}'), afterMap=JSON.parse(after.progress||'{}');delete beforeMap[GAME];delete afterMap[GAME];
 if(JSON.stringify(beforeMap)!==JSON.stringify(afterMap))throw Error('A non-current game progress row changed during this result');
 const gameRecord=extractGame(after.progress);if(!gameRecord)throw Error(`No ${GAME} record after commit`);
 const beforeRecord=extractGame(prev.progress);const expectedPlays=(beforeRecord?.plays||0)+1;
 if(gameRecord.plays!==expectedPlays)throw Error(`Expected one durable play increment ${expectedPlays}; got ${gameRecord.plays}`);
 const stars=gameRecord.pairBestByLevel?.[String(level)]||gameRecord.pairBestByLevel?.[level];
 if(!Number.isInteger(stars))throw Error('Durable per-level best is absent');
 const reward=readRewardPoints(after.rewards)-readRewardPoints(prev.rewards);
 const previousBest=beforeRecord?.pairBestByLevel?.[String(level)]??beforeRecord?.pairBestByLevel?.[level]??0;
 const legacyCeiling=Number.isInteger(beforeRecord?.pairLegacyRewardThrough)?beforeRecord.pairLegacyRewardThrough:(beforeRecord?beforeRecord.level:-1);
 const rewardBaseline=level<=legacyCeiling?3:previousBest;
 const expectedReward=Math.max(0,(stars*2+2)-(rewardBaseline?rewardBaseline*2+2:0));
 if(reward!==expectedReward||gameRecord.pairRewardPoints!==expectedReward)throw Error(`Reward delta mismatch: expected ${expectedReward}, saved ${gameRecord.pairRewardPoints}, observed ${reward}`);
 const runRow={game:GAME,player:PLAYER,width:WIDTH,level:level+1,rounds:run.rounds,roundDetails:run.rows||[],targetsExtinguished:GAME==='firerescue'?(run.rows||[]).reduce((sum,row)=>sum+row.expectedCount,0):undefined,rescues:GAME==='ladder'?run.rescues?.length:undefined,inputActions:GAME==='firerescue'?{keyboard:(run.targetActions||[]).filter(action=>action.input==='keyboard-space-hold').length,pointer:(run.targetActions||[]).filter(action=>action.input==='mouse-hold').length,touchCancel:(run.targetActions||[]).filter(action=>action.pointerCancel).length,lifecycle:(run.targetActions||[]).filter(action=>action.lifecycle)}:undefined,stars,rewardDelta:reward,expectedReward,previousBest,legacyCeiling,plays:gameRecord.plays,highestLevel:gameRecord.level+1,blockedSaveRetried:isBlocked};
 completedLevelRuns.push(runRow);rows.push(runRow);
};
try{
 await page.setViewportSize({width:WIDTH,height:HEIGHT});await enterGame();
 baseline=await snap();if(baseline.progress?.startsWith('!READ_ERROR')||baseline.rewards?.startsWith('!READ_ERROR'))throw Error('Unable to read baseline storage');
 const gameRecord=extractGame(baseline.progress);const floor=PLAYER==='askia'?0:2;const available=Math.max(floor,gameRecord?.level??floor);
 if(available<floor)throw Error('Existing saved availability below age floor');
 rows.push({kind:'baseline',game:GAME,player:PLAYER,width:WIDTH,height:HEIGHT,progress:baseline.progress,rewards:baseline.rewards,siblingProgress:baseline.siblingProgress,siblingRewards:baseline.siblingRewards,availableThrough:available+1});
 // Preflight packaged prompt/audio, mute cancellation, and exact parent navigation with no commit.
 if(WIDTH===390){
   await chooseLevel(floor);
   if(GAME==='ladder'){
     const play=page.getByRole('button',{name:'Play Ladder Rescue',exact:true});await play.click();
     const prompt=page.getByRole('button',{name:/^Hear again:/});await prompt.waitFor();
     const n=await page.evaluate(()=>window.__rescuePair6MediaEventsV1?.length||0);await prompt.click();
     await page.waitForFunction(before=>window.__rescuePair6MediaEventsV1?.slice(before).some(e=>e.type==='playing'||e.type==='play'),n,{timeout:6000});
     const toggle=page.getByRole('button',{name:'Turn sound off',exact:true});if(await toggle.count())await toggle.click();
     await page.waitForFunction(before=>window.__rescuePair6MediaEventsV1?.slice(before).some(e=>e.type==='pause'||e.type==='ended'),n,{timeout:6000});
     await page.getByRole('button',{name:'Turn sound on',exact:true}).click().catch(()=>{});
   } else {
     await page.getByRole('button',{name:'Play Fire Truck Rescue',exact:true}).click();
     const prompt=page.getByRole('button',{name:'Hear again: spray the fire',exact:true});await prompt.waitFor();
     const n=await page.evaluate(()=>window.__rescuePair6MediaEventsV1?.length||0);await prompt.click();
     await page.waitForFunction(before=>window.__rescuePair6MediaEventsV1?.slice(before).some(e=>e.type==='playing'||e.type==='play'),n,{timeout:6000});
     const toggle=page.getByRole('button',{name:'Turn sound off',exact:true});if(await toggle.count())await toggle.click();
     await page.waitForFunction(before=>window.__rescuePair6MediaEventsV1?.slice(before).some(e=>e.type==='pause'||e.type==='ended'),n,{timeout:6000});
     await page.getByRole('button',{name:'Turn sound on',exact:true}).click().catch(()=>{});
   }
   await wait(10500);const leaveBranch=await homeAndReenter();const afterLeave=await snap();if(afterLeave.progress!==baseline.progress||afterLeave.rewards!==baseline.rewards)throw Error('Leaving before completion wrote game progress or rewards');
   rows.push({kind:'audio-and-leave-preflight',game:GAME,player:PLAYER,width:WIDTH,leaveBranch,exactPackagedClipObserved:true,mutePausedPlayback:true,uncommittedStorageUnchanged:true});
 }
 for(const levelIndex of RUNS){
   await enterGame();const previous=await snap();await chooseLevel(levelIndex);
   const beforeCallback=async()=>{const held=await snap();if(held.progress!==previous.progress||held.rewards!==previous.rewards)throw Error('A game round committed before Finish');};
   let run;
   if(GAME==='firerescue'){
     run=await runRescueFireLevel(page,levelIndex,{startSelectedLevel:async(i)=>{await chooseLevel(i);const b=page.getByRole('button',{name:'Play Fire Truck Rescue',exact:true});if(await b.count()){if(PLAYER==='amari'&&WIDTH===390&&HEIGHT===740&&levelIndex===RUNS[0])await measureButton('start-primary-action',b);await b.click()}else await page.getByRole('button',{name:`Play level ${i+1}`,exact:true}).click()},firstRoundDiagnostics:levelIndex===0&&WIDTH===390&&PLAYER==='askia',waitForRound:async(_value,{roundIndex})=>page.waitForFunction(i=>Number(document.querySelector('[aria-label="Rounds done"]')?.getAttribute('aria-valuenow'))===i,roundIndex,{timeout:10000}),onSceneLayout:async ctx=>{if(PLAYER==='amari'&&WIDTH===390&&HEIGHT===740&&levelIndex===RUNS[0]&&ctx.roundIndex===0)await measureSceneLayout(ctx.scene)},onReview:async ctx=>{await beforeCallback(ctx);if(PLAYER==='amari'&&WIDTH===390&&levelIndex===RUNS[0]&&ctx.roundIndex===0)await measureHeldAction('held-review','Next round');if(ctx.evidence?.lifecycleFreeze||ctx.evidence?.touchCancel||ctx.evidence?.emptyAimKeptTargetsUnchanged)rows.push({kind:'fire-interruption-diagnostics',level:levelIndex+1,round:ctx.roundIndex+1,emptyAimKeptTargetsUnchanged:ctx.evidence.emptyAimKeptTargetsUnchanged??null,touchCancel:ctx.evidence.touchCancel??null,lifecycle:ctx.evidence.lifecycleFreeze??null});if((levelIndex===0&&ctx.roundIndex===0&&ctx.expectedCount===1)||(levelIndex===4&&ctx.roundIndex===4&&ctx.expectedCount===6)){const audio=await verifyFireVoiceSequence(ctx.expectedCount);rows.push({kind:'fire-count-audio-sequence',level:levelIndex+1,round:ctx.roundIndex+1,...audio});}},onBeforeFinish:async()=>{if(levelIndex===4&&WIDTH===390&&(PLAYER==='askia'||PLAYER==='amari')&&!faultArmed){await faultAtFinish({page,levelIndex});blockedThisLevel=true;}},capture:callCapture});
     if(blockedThisLevel){await page.getByRole('heading',{name:'Your result is ready, but it is not saved yet.',exact:true}).waitFor({timeout:10000});run.blockedSave=true;blockedThisLevel=false;}
   }else{
     run=await runRescueLadderLevel(page,levelIndex,{injectWrong:({round})=>round===0,doubleCorrect:levelIndex===0&&WIDTH===390&&PLAYER==='askia',inspectWrongLayout:PLAYER==='amari'&&WIDTH===390&&HEIGHT===740&&levelIndex===RUNS[0],onStartAction:async ctx=>{if(PLAYER==='amari'&&WIDTH===390&&HEIGHT===740&&levelIndex===RUNS[0])await measureButton('start-primary-action',page.getByRole('button',{name:'Play Ladder Rescue',exact:true}))},onReview:async ctx=>{await beforeCallback(ctx);if(PLAYER==='amari'&&WIDTH===390&&levelIndex===RUNS[0]&&ctx.row.round===1)await measureHeldAction('held-review','Next round');},onBeforeFinish:async({levelIndex:i})=>{if(i===4&&WIDTH===390&&(PLAYER==='askia'||PLAYER==='amari')&&!faultArmed){await faultAtFinish({page,levelIndex:i});}},capture:callCapture,expectSaveError:levelIndex===4&&WIDTH===390&&(PLAYER==='askia'||PLAYER==='amari')});
   }
   await emitLevel(levelIndex,run,previous);
   if(WIDTH===390)await measureDoneCaptions();
   if(GAME==='ladder'&&PLAYER==='amari'&&WIDTH===390&&levelIndex===RUNS[0]){
     const primary=page.locator('button[aria-label^="Play level"],button[aria-label^="Next level"]').first();
     await primary.waitFor({state:'visible',timeout:10000});
     const geometry=await primary.evaluate(element=>{const r=element.getBoundingClientRect();return{label:element.getAttribute('aria-label'),rect:{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom},viewport:{width:innerWidth,height:innerHeight}}});
     if(geometry.rect.x<0||geometry.rect.y<0||geometry.rect.right>geometry.viewport.width+1||geometry.rect.bottom>geometry.viewport.height+1)throw Error(`Done primary action is outside the initial viewport: ${JSON.stringify(geometry)}`);
     const image=`${OUT}/native-amari-ladder-${VIEW_TAG}-done-action.jpg`;
     await page.screenshot({path:image,type:'jpeg',quality:72,fullPage:false});
     rows.push({kind:'done-primary-action-visible-without-scroll',...geometry,path:image});
   }
   if(GAME==='firerescue'&&PLAYER==='amari'&&WIDTH===390&&levelIndex===RUNS[0]+1){
     const primary=page.locator('button[aria-label^="Play level"],button[aria-label^="Next level"]').first();
     await primary.waitFor({state:'visible',timeout:10000});
     const geometry=await primary.evaluate(element=>{const r=element.getBoundingClientRect();return{label:element.getAttribute('aria-label'),rect:{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom},viewport:{width:innerWidth,height:innerHeight}}});
     if(geometry.rect.x<0||geometry.rect.y<0||geometry.rect.right>geometry.viewport.width+1||geometry.rect.bottom>geometry.viewport.height+1)throw Error(`Fresh-result primary action is outside the initial viewport: ${JSON.stringify(geometry)}`);
     const levelUp=await page.getByText('Level up!',{exact:true}).count()>0;
     const sticker=await page.getByText('New sticker!',{exact:true}).count()>0;
     const image=`${OUT}/native-amari-firerescue-${VIEW_TAG}-fresh-done-action.jpg`;
     await page.screenshot({path:image,type:'jpeg',quality:72,fullPage:false});
     rows.push({kind:'fresh-level-result-primary-visible-without-scroll',...geometry,levelUpPanel:levelUp,newStickerPanel:sticker,path:image});
   }
   if(GAME==='firerescue'&&PLAYER==='amari'&&WIDTH===390&&HEIGHT===740&&levelIndex===RUNS[0]){
     const primary=page.locator('button[aria-label^="Play level"],button[aria-label^="Next level"]').first();
     const geometry=await primary.evaluate(element=>{const r=element.getBoundingClientRect();return{label:element.getAttribute('aria-label'),rect:{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom},viewport:{width:innerWidth,height:innerHeight}}});
     if(geometry.rect.x<0||geometry.rect.y<0||geometry.rect.right>geometry.viewport.width+1||geometry.rect.bottom>geometry.viewport.height+1)throw Error(`Fire done primary action is outside the short viewport: ${JSON.stringify(geometry)}`);
     const image=`${OUT}/native-amari-firerescue-${VIEW_TAG}-done-action.jpg`;
     await page.screenshot({path:image,type:'jpeg',quality:72,fullPage:false});
     rows.push({kind:'done-primary-action-visible-without-scroll',...geometry,path:image});
   }
   if(levelIndex===RUNS[RUNS.length-1]){
     await page.reload();await assertNamespace();await entry();
     const select=page.getByRole('button',{name:`Practice level ${levelIndex+1}`,exact:true});await select.waitFor({timeout:10000});
     const minimum=PLAYER==='askia'?0:2;
     const max=await page.getByRole('group',{name:'Unlocked practice levels'}).getByRole('button').count();
     if(max<(levelIndex-minimum+1))throw Error(`Reload did not retain age-floor availability through level ${levelIndex+1}`);
     rows.push({kind:'reload-retention',level:levelIndex+1,availableButtons:max});
   }
 }
 if(completedLevelRuns.length!==RUNS.length)throw Error(`Completed ${completedLevelRuns.length}/${RUNS.length} level runs`);
 const completedLeaveBranch=await homeAndReenter();
 rows.push({kind:'completed-parent-return',branch:completedLeaveBranch,parent:PLAYER==='askia'?'Askia home':world,url:page.url()});
 if(providerRequests.length)throw Error(`Provider/API requests observed: ${providerRequests.join(', ')}`);
 if(failedResources.length)throw Error(`Failed resources: ${JSON.stringify(failedResources)}`);
 if(pageErrors.length||consoleErrors.length)throw Error(`Browser errors: ${JSON.stringify({pageErrors,consoleErrors})}`);
 return {passed:true,namespaced,entryIdentity,baseline,completedLevelRuns,levelRunCount:completedLevelRuns.length,rows,errors:[],failures,providerRequests,failedResources,pageErrors,consoleErrors};
}catch(error){failures.push({message:error?.message||String(error),stack:error?.stack||null,completedLevelRuns:completedLevelRuns.length,rows:rows.length});try{await page.evaluate(()=>window.__rescuePair6Restore?.())}catch{};try{await page.screenshot({path:`${OUT}/failure-${PLAYER}-${GAME}-${VIEW_TAG}.jpg`,type:'jpeg',quality:65,fullPage:false})}catch{};return {passed:false,namespaced,entryIdentity,baseline,completedLevelRuns,levelRunCount:completedLevelRuns.length,rows,errors:[{message:error?.message||String(error),stack:error?.stack||null}],failures,providerRequests,failedResources,pageErrors,consoleErrors};}
finally{page.off('pageerror',onError);page.off('console',onConsole);page.off('request',onRequest);page.off('response',onResponse);}
}
