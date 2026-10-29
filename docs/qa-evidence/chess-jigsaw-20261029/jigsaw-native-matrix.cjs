async page => {
  const origin=__ORIGIN__, player=__PLAYER__, level=Number(__LEVEL__), width=Number(__WIDTH__), height=Number(__HEIGHT__), expectedEntry=__EXPECTED_ENTRY__, faultMode=__FAULT__, emulatedTouch=__EMULATED_TOUCH__, verifyReplay=__VERIFY_REPLAY__, captureRepresentative=__CAPTURE_REPRESENTATIVE__;
  const rows=[], errors=[], provider=[], failed=[], failedRequests=[], consoleErrors=[]; let entry=null, baseline=null, audioEvidence=null, faultFacts={status:'not-requested'}, replayFacts={status:'not-requested'};
  const listenError=e=>errors.push(String(e.message||e));
  const listenConsole=m=>{if(m.type()==='error')consoleErrors.push(m.text());};
  const listenRequest=r=>{if(/\/api\//.test(r.url()))provider.push(r.url());};
  const listenResponse=r=>{if(r.status()>=400)failed.push({status:r.status(),url:r.url()});};
  const listenFailedRequest=r=>failedRequests.push({url:r.url(),error:r.failure()?.errorText||'request failed'});
  page.on('pageerror',listenError); page.on('console',listenConsole); page.on('request',listenRequest); page.on('requestfailed',listenFailedRequest); page.on('response',listenResponse);
  const mark=async(label,el)=>{const g=await el.evaluate(e=>{const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);return{label:e.getAttribute('aria-label')||e.innerText.trim(),x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height,viewportWidth:innerWidth,viewportHeight:innerHeight,visible:r.width>0&&r.height>0,centerHit:!!hit&&(hit===e||e.contains(hit))}});if(!g.visible||g.width<44||g.height<44||g.x<0||g.y<0||g.right>g.viewportWidth||g.bottom>g.viewportHeight||!g.centerHit)throw Error('Control is not wholly hit-testable at >=44px: '+label+' '+JSON.stringify(g));return g;};
  const imageHealth=async()=>page.evaluate(async()=>{const imgs=[...document.images];return Promise.all(imgs.map(async i=>{try{await i.decode();return{src:i.currentSrc||i.src,ok:i.naturalWidth>0&&i.naturalHeight>0}}catch{return{src:i.currentSrc||i.src,ok:false}}}))});
  const geometrySnapshot=async()=>page.evaluate(()=>{const box=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};return{viewport:{width:innerWidth,height:innerHeight},document:{width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,scrollY,scrollTop:document.scrollingElement?.scrollTop||0},board:box('.dino-jigsaw-board'),tray:box('.dino-jigsaw-tray'),task:box('.dino-jigsaw-task'),feedback:box('.dino-jigsaw-feedback')}});
  const protectedSnapshot=async()=>page.evaluate(()=>{const prefix='qa_rewards_20261024_',keys=Object.keys(localStorage).filter(k=>k.startsWith(prefix)&&/(little_progress|rewards_v2|_points$|games_played|earned_sticker_ids_v1)/.test(k)).sort(),raw=Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]));return raw});
  const hash=async value=>page.evaluate(async value=>{const bytes=new TextEncoder().encode(JSON.stringify(value)),digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')},value);
  const hashRecords=async snapshot=>Object.fromEntries(await Promise.all(Object.entries(snapshot).map(async([key,value])=>[key,await hash(value)])));
  const parsed=(snapshot,key)=>{const value=snapshot['qa_rewards_20261024_'+key];if(value==null)return{};try{return JSON.parse(value)}catch{throw Error('Malformed stored record: '+key)}};
  const littleWithoutTarget=(snapshot,key)=>{const record=parsed(snapshot,key+'_little_progress');const{dinojigsaw,...other}=record;return other};
  const normalizeClaims=claims=>{const normalized={};for(const[token,amount]of Object.entries(claims||{})){let key=token;
    if(token.startsWith('dino:jigsaw:little:'))key=`@jigsaw:${token.slice('dino:jigsaw:little:'.length)}`;
    else if(token.startsWith('dinojigsaw:little:'))key=`@jigsaw:${token.slice('dinojigsaw:little:'.length)}`;
    else if(token.startsWith('dino:chess:'))key=`@chess:${token.slice('dino:chess:'.length)}`;
    else if(token.startsWith('chess:'))key=`@chess:${token.slice('chess:'.length)}`;
    if(Object.hasOwn(normalized,key)&&normalized[key]!==amount)throw Error('Legacy and current claim aliases disagree: '+key);normalized[key]=amount;
  }return Object.fromEntries(Object.entries(normalized).sort(([a],[b])=>a.localeCompare(b)));};
  const rewardWithoutTarget=(snapshot,key)=>{const r=parsed(snapshot,key+'_rewards_v2');const{dinojigsaw,...gamesPlayed}=r.gamesPlayed||{};const rewardClaims=Object.fromEntries(Object.entries(r.rewardClaims||{}).filter(([token])=>!token.startsWith('dino:jigsaw:little:')&&!token.startsWith('dinojigsaw:little:')));const{earnedStickerIds,points,...rest}=r;return{...rest,gamesPlayed,rewardClaims:normalizeClaims(rewardClaims)}};
  const compareSnapshots=(before,after)=>{const sibling=player==='amari'?'askia':'amari',same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),beforePlayer=parsed(before,player+'_little_progress'),afterPlayer=parsed(after,player+'_little_progress'),beforeJ=beforePlayer.dinojigsaw||{level:player==='amari'?2:0,plays:0,best:0,pairBestByLevel:{}},afterJ=afterPlayer.dinojigsaw||{},beforeRewards=parsed(before,player+'_rewards_v2'),afterRewards=parsed(after,player+'_rewards_v2'),plays=Number(afterJ.plays)-Number(beforeJ.plays),playedLevel=afterJ.pairPlayedLevel,expectedPoints=afterJ.pairRewardPoints||0,claimId=afterJ.pairTransactionId,claimToken=claimId?`dino:jigsaw:little:${claimId}`:null,legacyClaimToken=claimId?`dinojigsaw:little:${claimId}`:null,claimAmount=(afterRewards.rewardClaims?.[claimToken]??afterRewards.rewardClaims?.[legacyClaimToken]??0);
    if(!same(littleWithoutTarget(before,player),littleWithoutTarget(after,player)))throw Error('Selected child non-Jigsaw little-game fields changed');
    if(!same(parsed(before,sibling+'_little_progress'),parsed(after,sibling+'_little_progress')))throw Error('Sibling little-game progress changed');
    if(!same(rewardWithoutTarget(before,player),rewardWithoutTarget(after,player)))throw Error('Selected child non-Jigsaw rewards/claims changed');
    if(!same(parsed(before,sibling+'_rewards_v2'),parsed(after,sibling+'_rewards_v2')))throw Error('Sibling rewards changed');
    for(const key of Object.keys(before)){if(/earned_sticker_ids_v1/.test(key)){const old=JSON.parse(before[key]||'[]'),now=JSON.parse(after[key]||'[]');if(old.some(id=>!now.includes(id)))throw Error('An existing earned sticker disappeared');}}
    const oldCanonical=beforeRewards.earnedStickerIds||[],newCanonical=afterRewards.earnedStickerIds||[];if(oldCanonical.some(id=>!newCanonical.includes(id)))throw Error('An existing canonical earned sticker disappeared');
    if(plays!==1||!Number.isInteger(playedLevel)||playedLevel!==level-1||!afterJ.pairTransactionId||afterJ.level<beforeJ.level)throw Error('Saved Dino Jigsaw result does not match the selected level/run');
    const pointsDelta=(afterRewards.points||0)-(beforeRewards.points||0),playsDelta=(afterRewards.gamesPlayed?.dinojigsaw||0)-(beforeRewards.gamesPlayed?.dinojigsaw||0);
    if(pointsDelta!==expectedPoints||playsDelta!==(expectedPoints>0?1:0)||claimAmount!==expectedPoints)throw Error('Reward claim/points/play delta does not match first-save eligibility');
    if(expectedPoints>0){const matchingClaims=[claimToken,legacyClaimToken].filter(token=>afterRewards.rewardClaims?.[token]===expectedPoints);if(matchingClaims.length!==1)throw Error('Expected exactly one current Jigsaw claim under the current or legacy alias');}
    const legacyGamesBefore=parsed(before,player+'_games_played'),legacyGamesAfter=parsed(after,player+'_games_played'),{dinojigsaw:legacyPlaysBefore=0,...otherLegacyGamesBefore}=legacyGamesBefore,{dinojigsaw:legacyPlaysAfter=0,...otherLegacyGamesAfter}=legacyGamesAfter;
    if(!same(otherLegacyGamesBefore,otherLegacyGamesAfter)||legacyPlaysAfter-legacyPlaysBefore!==(expectedPoints>0?1:0))throw Error('Legacy game-play mirror changed outside the eligible Dino Jigsaw award');
    const legacyPointsBefore=Number(parsed(before,player+'_points'))||0,legacyPointsAfter=Number(parsed(after,player+'_points'))||0;if(legacyPointsAfter-legacyPointsBefore!==expectedPoints)throw Error('Legacy points mirror disagrees with the saved award');
    return{targetCommit:{transactionId:afterJ.pairTransactionId,playedLevel,plays:afterJ.plays,level:afterJ.level,best:afterJ.best,previousLevel:afterJ.pairPreviousLevel,levelUp:afterJ.pairLevelUp,levelBests:afterJ.pairBestByLevel,legacyRewardThrough:afterJ.pairLegacyRewardThrough,rewardPoints:expectedPoints},rewardDelta:{points:pointsDelta,plays:playsDelta,expectedPoints}};
  };
  const installFault=async mode=>page.evaluate(({mode,player})=>{
    if(window.__jigsawFaultRestore)throw Error('A storage fault is already armed');
    const progressKey=`${player}_little_progress`,rewardKey=`${player}_rewards_v2`,oldSet=Storage.prototype.setItem,oldGet=Storage.prototype.getItem;
    const state={mode,progressKey,rewardKey,progressWritten:false,rewardWritten:false,triggered:false,attemptedTransactionId:null,attemptedRewardToken:null,attemptedRewardPoints:0};
    const transactionOf=value=>{try{return JSON.parse(value)?.dinojigsaw?.pairTransactionId||null}catch{return null}};
    Storage.prototype.setItem=function(key,value){
      if(key===progressKey){state.attemptedTransactionId=transactionOf(value);if(mode==='progress-write'&&!state.triggered){state.triggered=true;state.faultPhase='progress-write';throw new Error('Synthetic QA progress write fault');}}
      if(key===rewardKey&&mode==='reward-write'&&!state.triggered){let record={};try{record=JSON.parse(value)||{}}catch{};const found=Object.entries(record.rewardClaims||{}).find(([token])=>token.endsWith(`:${state.attemptedTransactionId}`)&&(token.startsWith('dino:jigsaw:little:')||token.startsWith('dinojigsaw:little:')));if(found){state.attemptedRewardToken=found[0];state.attemptedRewardPoints=found[1];state.triggered=true;state.faultPhase='reward-write';throw new Error('Synthetic QA parent reward write fault');}}
      const result=oldSet.call(this,key,value);
      if(key===progressKey){state.progressWritten=true;state.attemptedTransactionId=transactionOf(value);}
      if(key===rewardKey){state.rewardWritten=true;let record={};try{record=JSON.parse(value)||{}}catch{};const found=Object.entries(record.rewardClaims||{}).find(([token])=>token.endsWith(`:${state.attemptedTransactionId}`)&&(token.startsWith('dino:jigsaw:little:')||token.startsWith('dinojigsaw:little:')));if(found){state.attemptedRewardToken=found[0];state.attemptedRewardPoints=found[1];}}
      return result;
    };
    Storage.prototype.getItem=function(key){
      if(key===progressKey&&mode==='progress-readback'&&state.progressWritten&&!state.triggered){state.triggered=true;state.faultPhase='progress-readback';throw new Error('Synthetic QA progress readback fault');}
      if(key===rewardKey&&mode==='reward-readback'&&state.rewardWritten&&!state.triggered){state.triggered=true;state.faultPhase='reward-readback';throw new Error('Synthetic QA parent reward readback fault');}
      return oldGet.call(this,key);
    };
    window.__jigsawFaultState=state;window.__jigsawFaultRestore=()=>{Storage.prototype.setItem=oldSet;Storage.prototype.getItem=oldGet;window.__jigsawFaultRestore=null;return state;};return true;
  },{mode,player});
  const restoreFault=async()=>page.evaluate(()=>window.__jigsawFaultRestore?.()||window.__jigsawFaultState||null);
  const faultState=async()=>page.evaluate(()=>window.__jigsawFaultState||null);
  const rewardFaultEligible=snapshot=>{const rec=parsed(snapshot,player+'_little_progress'),old=rec.dinojigsaw;if(!old)return true;const runLevel=level-1,legacy=Number.isInteger(old.pairLegacyRewardThrough)?old.pairLegacyRewardThrough:(Number.isInteger(old.level)?old.level:-1),best=old.pairBestByLevel?.[runLevel]||0;return runLevel>legacy&&best<3;};
  const rawValue=(snapshot,key)=>snapshot['qa_rewards_20261024_'+key]??null;
  const touchPlace=async(source,target,total)=>{
    const cdp=await page.context().newCDPSession(page),box=async locator=>{const b=await locator.boundingBox();if(!b)throw Error('Touch target has no visible bounds');return{x:b.x+b.width/2,y:b.y+b.height/2};},a=await box(source),b=await box(target),events=[];
    try{
      await page.evaluate(()=>{window.__jigsawTouchEvents=[];if(window.__jigsawTouchObserver)return;window.__jigsawTouchObserver=true;for(const type of ['pointerdown','pointermove','pointerup','pointercancel'])document.addEventListener(type,e=>{if(e.target.closest?.('[data-piece],[data-slot]'))window.__jigsawTouchEvents.push({type,pointerType:e.pointerType,target:e.target.closest('[data-piece],[data-slot]')?.getAttribute('data-piece')||e.target.closest('[data-slot]')?.getAttribute('data-slot')||null});},true);});
      await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
      const drag=async endType=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...a,id:1}]});await new Promise(r=>setTimeout(r,70));for(let i=1;i<=6;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:a.x+(b.x-a.x)*i/6,y:a.y+(b.y-a.y)*i/6}]});await new Promise(r=>setTimeout(r,25));}await cdp.send('Input.dispatchTouchEvent',{type:endType,touchPoints:[]});};
      await drag('touchCancel');await new Promise(r=>setTimeout(r,250));const afterCancel=await page.locator('.dino-jigsaw-progress').innerText();if(!afterCancel.startsWith('0 of '))throw Error('Cancelled emulated touch credited a puzzle placement: '+afterCancel);
      await drag('touchEnd');await page.locator(`[data-slot="0"]`).waitFor({timeout:3000});await page.waitForFunction(n=>document.querySelectorAll('.dino-jigsaw-board [data-slot]:disabled').length===1&&document.querySelector('.dino-jigsaw-progress')?.textContent.startsWith('1 of '),total,{timeout:5000});
      events.push(...await page.evaluate(()=>window.__jigsawTouchEvents||[]));if(!events.some(e=>e.type==='pointerdown'&&e.pointerType==='touch')||!events.some(e=>e.type==='pointerup'&&e.pointerType==='touch'))throw Error('The drag did not arrive as touch pointer events');
      return{performed:true,classification:'emulated touch via CDP; not physical-device certification',cancelDidNotCredit:true,realTouchPlacedOne:true,pointerEvents:events};
    }finally{try{await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:false,maxTouchPoints:1})}finally{await cdp.detach();}}
  };
  try {
    await page.setViewportSize({width,height});
    await page.goto(origin+'/?qa_pair9_jigsaw='+player+'-'+level+'-'+width+'-'+Date.now()+'#/');
    const namespaced=await page.evaluate(()=>window.__amariQaNamespaced===true);if(!namespaced)throw Error('QA storage namespace guard is absent');
    entry=await page.locator('script[type="module"][src]').first().getAttribute('src');if(!entry||!entry.includes(expectedEntry))throw Error('Compiled entry mismatch: '+entry);
    const age=page.getByRole('button',{name:player==='askia'?/Age 3\+.*Askia/:/Age 6\+.*Amari/});if(await age.count()&&await age.first().isVisible())await age.first().click();
    if(player==='amari'){await page.getByRole('heading',{name:'Choose a world'}).waitFor({timeout:10000});await page.locator('.discovery-world-card').filter({hasText:'Creative Lab'}).click();await page.locator('.catalogue-game-card').filter({hasText:'Dino Jigsaw'}).click();}
    else {await page.getByRole('heading',{name:'Hi Askia!',exact:true}).waitFor({timeout:10000});await page.getByRole('button',{name:'Play Dino Jigsaw',exact:true}).first().click();}
    await page.locator('[data-little-game="dinojigsaw"]').waitFor({timeout:10000});
    baseline=await protectedSnapshot();
    await page.evaluate(()=>{if(window.__jigsawMediaWrapped)return;window.__jigsawMediaWrapped=true;window.__jigsawMedia=[];const original=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(...args){if(!this.__jigsawObserved){this.__jigsawObserved=true;for(const type of ['play','playing','pause','ended','error'])this.addEventListener(type,()=>window.__jigsawMedia.push({type,src:this.currentSrc||this.src||'',time:this.currentTime}));}return original.apply(this,args);};});
    const select=page.getByRole('button',{name:`Practice level ${level}`,exact:true});await select.waitFor({timeout:10000});await mark('Select level',select);await select.click();
    const speaker=page.getByRole('button',{name:'Turn sound on',exact:true});if(await speaker.count())await speaker.click();
    const playInstruction=page.getByRole('button',{name:/Dino Jigsaw/}).last();if(!(await playInstruction.count()))throw Error('Readable packaged-instruction control is missing');const before=await page.evaluate(()=>window.__jigsawMedia.length);await playInstruction.click();await page.waitForFunction(n=>window.__jigsawMedia.slice(n).some(e=>['play','playing'].includes(e.type)&&/\/audio\//.test(e.src)),before,{timeout:10000});const source=await page.evaluate(n=>window.__jigsawMedia.slice(n).find(e=>['play','playing'].includes(e.type)&&/\/audio\//.test(e.src))?.src,before);const off=page.getByRole('button',{name:'Turn sound off',exact:true});await off.click();await page.waitForFunction(({n,src})=>window.__jigsawMedia.slice(n).some(e=>e.src===src&&['pause','ended'].includes(e.type)),{n:before,src:source},{timeout:6000});audioEvidence={source,cancelledByMute:true};
    await page.getByRole('button',{name:'Play Dino Jigsaw',exact:true}).click();
    const runRows=[];
    for(let round=0;round<4;round++){
      const board=page.locator('.dino-jigsaw-board'), tray=page.locator('.dino-jigsaw-tray');await board.waitFor({timeout:12000});await tray.waitFor({timeout:12000});
      const puzzle=await page.evaluate(()=>{const tile=document.querySelector('.dino-jigsaw-tray [data-piece] .dino-jigsaw-picture');if(!tile)return null;return{cols:Math.round(parseFloat(tile.style.width)/100),rows:Math.round(parseFloat(tile.style.height)/100)}});
      if(!puzzle)throw Error('Rendered crop geometry unavailable');
      const n=puzzle.cols*puzzle.rows;
      if(await page.locator('.dino-jigsaw-task').innerText().then(t=>!t.includes(`${n} pieces`)))throw Error('Rendered grid disagrees with crop geometry');
      // Level 1's full guide is authored support. On later levels, expose the optional clue once.
      const clue=page.getByRole('button',{name:'Show picture clue',exact:true});let clueShown=false,expandedHelp=null;if(await clue.count()){await mark('Show picture clue',clue);await clue.click();clueShown=true;const view=page.getByRole('img',{name:/picture clue/});expandedHelp=await view.boundingBox();await page.getByRole('button',{name:'Hide picture clue',exact:true}).click();}
      const layout=await geometrySnapshot(),scrollBefore=layout.document.scrollTop;
      for(const name of ['board','tray','task','feedback']){const b=layout[name];if(!b||b.x<0||b.y<0||b.right>layout.viewport.width||b.bottom>layout.viewport.height)throw Error(`${name} is not wholly visible before placement: ${JSON.stringify(layout)}`);}
      if(layout.document.width>layout.viewport.width)throw Error('Horizontal overflow on puzzle screen');
      let representativeScreenshot=null;if(captureRepresentative&&round===0){representativeScreenshot=__OUT__+`/native-jigsaw-${player}-L${level}-${width}x${height}-${Date.now()}.jpg`;await page.screenshot({path:representativeScreenshot,type:'jpeg',quality:70,fullPage:false});}
      const geometry=[];let touchEvidence=null,touchPlacedFirst=false;
      for(let slot=0;slot<n;slot++){
        // CSS values vary in whitespace; inspect actual rendered crop style, then select its matching tray control.
        const matching=page.locator('.dino-jigsaw-tray [data-piece]');let target=null;
        for(let i=0;i<await matching.count();i++){const c=matching.nth(i);const crop=await c.locator('.dino-jigsaw-picture').evaluate(e=>({left:parseFloat(e.style.left),top:parseFloat(e.style.top),width:parseFloat(e.style.width),height:parseFloat(e.style.height)}));if(Math.round(-crop.left/100)===slot%puzzle.cols&&Math.round(-crop.top/100)===Math.floor(slot/puzzle.cols)){target=c;break;}}
        if(!target)throw Error('Could not map visible image crop to picture space '+slot);
        const slotButton=page.locator(`[data-slot="${slot}"]`);if(round===0&&slot===0&&n>1){let wrongAttempted=false;for(let i=0;i<await matching.count();i++){const c=matching.nth(i),crop=await c.locator('.dino-jigsaw-picture').evaluate(e=>({left:parseFloat(e.style.left),top:parseFloat(e.style.top)}));if(Math.round(-crop.left/100)!==0||Math.round(-crop.top/100)!==0){await c.click();await page.locator('[data-slot="0"]').click();await page.getByRole('status').filter({hasText:'Not that space'}).waitFor({timeout:3000});wrongAttempted=true;break;}}if(!wrongAttempted)throw Error('No nonzero crop available for wrong-slot retry test');}
        const g=await mark('Picture piece',target);const sg=await mark('Picture space',slotButton);
        if(emulatedTouch&&round===0&&slot===0){touchEvidence=await touchPlace(target,slotButton,n);touchPlacedFirst=true;}
        else if(round===0&&slot===1){const a=await target.boundingBox(),b=await slotButton.boundingBox();await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:5});await page.mouse.up();}
        else if(round===0&&slot===2){await target.focus();await target.press('Space');await slotButton.focus();await slotButton.press('Enter');}
        else {await target.click();await slotButton.click();}
        geometry.push({piece:g,slot:sg,placedByEmulatedTouch:round===0&&slot===0&&touchPlacedFirst});
      }
      const held=page.locator('section[aria-label="Round complete"]');await held.waitFor({timeout:10000});
      const explanation=page.getByRole('group',{name:'Dinosaur picture explanation'});await explanation.waitFor({timeout:5000});const next=held.getByRole('button',{name:round===3?'Finish game':'Next round'});await next.waitFor({timeout:10000});await mark('Held review next',next);
      const imageResults=await imageHealth();if(imageResults.some(x=>!x.ok))throw Error('Puzzle art failed image decode');
      const postLayout=await geometrySnapshot();if(postLayout.document.scrollTop!==scrollBefore)throw Error('Page scrolled while solving the puzzle');
      runRows.push({round:round+1,pieces:n,clueShown,expandedHelp,layout,representativeScreenshot,wrongRetryChecked:round===0,heldReview:true,touchEvidence,images:imageResults.length,primary:await next.evaluate(e=>e.innerText.trim())});
      let armCurrentFault=false;
      if(round===3&&faultMode!=='none'){
        if(faultMode.startsWith('reward-')&&!rewardFaultEligible(baseline))faultFacts={status:'unavailable',mode:faultMode,reason:'Selected level is already at the three-star best or falls under the legacy reward ceiling; no progress/profile changes were made to force eligibility.'};
        else {await installFault(faultMode);armCurrentFault=true;faultFacts={status:'armed',mode:faultMode};}
      }
      await next.click();
      if(armCurrentFault){
        const retry=page.getByRole('button',{name:'Retry saving this result',exact:true});await retry.waitFor({timeout:10000});await mark('Retry saving this result',retry);
        const state=await faultState();if(!state?.triggered||state.mode!==faultMode)throw Error('Requested storage fault did not intercept the exact operation: '+JSON.stringify(state));
        if(faultMode.startsWith('reward-')&&(state.attemptedRewardToken!==`dino:jigsaw:little:${state.attemptedTransactionId}`&&state.attemptedRewardToken!==`dinojigsaw:little:${state.attemptedTransactionId}`))throw Error('Parent fault did not target the attempted Jigsaw reward claim');
        const heldSnapshot=await protectedSnapshot(),pkey=player+'_little_progress',rkey=player+'_rewards_v2',heldGame=parsed(heldSnapshot,pkey).dinojigsaw||{},heldRewards=parsed(heldSnapshot,rkey),beforeProgress=rawValue(baseline,pkey),beforeRewards=rawValue(baseline,rkey);
        if(!state.attemptedTransactionId)throw Error('Fault hook did not capture the attempted transaction');
        if(faultMode==='progress-write'){
          if(JSON.stringify(heldSnapshot)!==JSON.stringify(baseline)||rawValue(heldSnapshot,pkey)!==beforeProgress||rawValue(heldSnapshot,rkey)!==beforeRewards)throw Error('Blocked progress write changed durable progress, rewards, or protected sibling data');
        }else if(heldGame.pairTransactionId!==state.attemptedTransactionId)throw Error('Committed fault result does not match the attempted transaction');
        if(faultMode==='progress-readback'&&(heldGame.pairTransactionId!==state.attemptedTransactionId||rawValue(heldSnapshot,rkey)!==beforeRewards))throw Error('Readback failure did not hold one committed result before reward payment');
        if(faultMode==='reward-write'&&(heldGame.pairTransactionId!==state.attemptedTransactionId||rawValue(heldSnapshot,rkey)!==beforeRewards||heldGame.pairRewardPoints<=0||state.attemptedRewardPoints!==heldGame.pairRewardPoints))throw Error('Parent write failure did not hold a saved result with a positive unpaid reward');
        if(faultMode==='reward-readback'){
          const currentToken=`dino:jigsaw:little:${state.attemptedTransactionId}`,legacyToken=`dinojigsaw:little:${state.attemptedTransactionId}`;
          if(heldGame.pairTransactionId!==state.attemptedTransactionId||heldGame.pairRewardPoints<=0||(heldRewards.rewardClaims?.[currentToken]??heldRewards.rewardClaims?.[legacyToken])!==heldGame.pairRewardPoints)throw Error('Parent readback failure did not retain the one committed reward claim');
        }
        faultFacts={status:'failed-and-held',mode:faultMode,phase:state.faultPhase,attemptedTransactionId:state.attemptedTransactionId,attemptedRewardToken:state.attemptedRewardToken,attemptedRewardPoints:state.attemptedRewardPoints,progressChangedBeforeRetry:rawValue(heldSnapshot,pkey)!==beforeProgress,rewardChangedBeforeRetry:rawValue(heldSnapshot,rkey)!==beforeRewards};
        await restoreFault();
        const heldRewardState={points:heldRewards.points,gameCount:heldRewards.gamesPlayed?.dinojigsaw||0,claims:heldRewards.rewardClaims||{}};
        await retry.click();await page.getByRole('heading',{name:/Well done/}).waitFor({timeout:12000});
        const retried=await protectedSnapshot(),retriedGame=parsed(retried,pkey).dinojigsaw||{},retriedRewards=parsed(retried,rkey);
        if(retriedGame.pairTransactionId!==state.attemptedTransactionId)throw Error('Retry changed the saved transaction instead of recovering it');
        if(faultMode==='reward-readback'&&(retriedRewards.points!==heldRewardState.points||retriedRewards.gamesPlayed?.dinojigsaw!==heldRewardState.gameCount||JSON.stringify(retriedRewards.rewardClaims||{})!==JSON.stringify(heldRewardState.claims)))throw Error('Parent readback retry awarded the same transaction more than once');
        faultFacts={...faultFacts,status:'retried',sameTransaction:true,heldRetryControl:true,rewardPointsAfterRetry:retriedGame.pairRewardPoints};
      }
    }
    await page.getByRole('heading',{name:/Well done/}).waitFor({timeout:12000});
    const after=await protectedSnapshot(),protection=compareSnapshots(baseline,after);protection.hashes={before:await hashRecords(baseline),after:await hashRecords(after)};
    if(verifyReplay){
      const home=page.getByRole('banner').getByRole('button',{name:'Go home',exact:true});await mark('Return to parent',home);await home.click();
      let parentView;
      if(player==='amari'){const gameCard=page.locator('.catalogue-game-card').filter({hasText:'Dino Jigsaw'});try{await gameCard.waitFor({timeout:3500});}catch{await page.getByRole('heading',{name:'Choose a world',exact:true}).waitFor({timeout:10000});}parentView=await page.evaluate(()=>({url:location.href,headings:[...document.querySelectorAll('h1,h2,h3')].map(e=>e.innerText.trim()).slice(0,8)}));}
      else {await page.getByRole('heading',{name:'Hi Askia!',exact:true}).waitFor({timeout:10000});parentView=await page.evaluate(()=>({url:location.href,headings:[...document.querySelectorAll('h1,h2,h3')].map(e=>e.innerText.trim()).slice(0,8)}));}
      const openGame=async()=>{const existing=page.locator('[data-little-game="dinojigsaw"]');if(await existing.count())return;const age=page.getByRole('button',{name:player==='askia'?/Age 3\+.*Askia/:/Age 6\+.*Amari/});if(await age.count()&&await age.first().isVisible())await age.first().click();if(player==='amari'){let gameCard=page.locator('.catalogue-game-card').filter({hasText:'Dino Jigsaw'});if(!(await gameCard.count())){const world=page.getByRole('heading',{name:'Choose a world',exact:true});if(await world.count())await page.locator('.discovery-world-card').filter({hasText:'Creative Lab'}).click();gameCard=page.locator('.catalogue-game-card').filter({hasText:'Dino Jigsaw'});await gameCard.waitFor({timeout:10000});}await gameCard.click();}else{const homeHeading=page.getByRole('heading',{name:'Hi Askia!',exact:true});if(await homeHeading.count())await page.getByRole('button',{name:'Play Dino Jigsaw',exact:true}).first().click();}await existing.waitFor({timeout:10000});};
      await openGame();await page.reload();await openGame();
      const replayBaseline=await protectedSnapshot();if(JSON.stringify(replayBaseline)!==JSON.stringify(after))throw Error('Normal reopen/reload changed saved progress or rewards before replay');
      const replaySelect=page.getByRole('button',{name:`Practice level ${level}`,exact:true});await replaySelect.waitFor({timeout:10000});await mark('Reopen saved level',replaySelect);await replaySelect.click();await page.getByRole('button',{name:'Play Dino Jigsaw',exact:true}).click();
      for(let round=0;round<4;round++){
        await page.locator('.dino-jigsaw-board').waitFor({timeout:10000});await page.locator('.dino-jigsaw-tray').waitFor({timeout:10000});
        const dims=await page.evaluate(()=>{const e=document.querySelector('.dino-jigsaw-tray [data-piece] .dino-jigsaw-picture');return e?{cols:Math.round(parseFloat(e.style.width)/100),rows:Math.round(parseFloat(e.style.height)/100)}:null;});if(!dims)throw Error('Replay crop geometry unavailable');
        const count=dims.cols*dims.rows;
        for(let slot=0;slot<count;slot++){
          const tiles=page.locator('.dino-jigsaw-tray [data-piece]');let piece=null;
          for(let i=0;i<await tiles.count();i++){const tile=tiles.nth(i),crop=await tile.locator('.dino-jigsaw-picture').evaluate(e=>({left:parseFloat(e.style.left),top:parseFloat(e.style.top)}));if(Math.round(-crop.left/100)===slot%dims.cols&&Math.round(-crop.top/100)===Math.floor(slot/dims.cols)){piece=tile;break;}}
          if(!piece)throw Error('Replay could not match visible crop '+slot);await piece.click();await page.locator(`[data-slot="${slot}"]`).click();
        }
        const review=page.locator('section[aria-label="Round complete"]');await review.waitFor({timeout:10000});const next=review.getByRole('button',{name:round===3?'Finish game':'Next round'});await next.waitFor({timeout:10000});await mark('Replay held review next',next);await next.click();
      }
      await page.getByRole('heading',{name:/Well done/}).waitFor({timeout:12000});const replayAfter=await protectedSnapshot(),replayProtection=compareSnapshots(replayBaseline,replayAfter),replayGame=parsed(replayAfter,player+'_little_progress').dinojigsaw;
      if(replayGame.pairRewardPoints!==0||replayProtection.rewardDelta.points!==0||replayProtection.rewardDelta.plays!==0)throw Error('Replaying the saved level did not have zero reward delta');
      replayFacts={status:'verified',returnedToParent:true,parentView,reopenedAndReloaded:true,sameLevelAvailable:true,sameLevelReplayed:true,zeroRewardDelta:true,transactionId:replayGame.pairTransactionId,commit:{plays:replayGame.plays,playedLevel:replayGame.pairPlayedLevel,rewardPoints:replayGame.pairRewardPoints},hashes:{before:await hashRecords(replayBaseline),after:await hashRecords(replayAfter)}};
    }
    if(provider.length||failed.length||failedRequests.length||errors.length||consoleErrors.length)throw Error('Runtime/API failure '+JSON.stringify({provider,failed,failedRequests,errors,consoleErrors}));
    rows.push({level,rounds:runRows,protection,namespace:namespaced,audioEvidence,faultFacts,replayFacts});
    rows[rows.length-1].faultFacts=faultFacts;
    return{passed:true,origin,player,level,width,height,entry,namespaced,rows,provider,failed,failedRequests,consoleErrors,errors,faultFacts,replayFacts};
  } catch(error) {
    try{await page.screenshot({path:__OUT__+'/failure-jigsaw-'+player+'-L'+level+'-'+width+'x'+height+'-'+Date.now()+'.jpg',type:'jpeg',quality:65,fullPage:false})}catch{}
    return{passed:false,origin,player,level,width,height,entry,rows,provider,failed,failedRequests,consoleErrors,faultFacts,replayFacts,errors:[...errors,{message:error?.message||String(error),stack:error?.stack||null}]};
  } finally {try{await restoreFault()}catch{}page.off('pageerror',listenError);page.off('console',listenConsole);page.off('request',listenRequest);page.off('requestfailed',listenFailedRequest);page.off('response',listenResponse);}
}
