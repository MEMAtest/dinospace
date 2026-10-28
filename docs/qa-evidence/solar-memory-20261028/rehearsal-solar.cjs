async page => {
  const origin='http://127.0.0.1:5180';
  const worlds=[
    {name:'Mercury',answer:'It has no air'}, {name:'Venus',answer:'Venus'}, {name:'Earth',answer:'Its oceans'},
    {name:'Mars',answer:'Rusty dust'}, {name:'Jupiter',answer:'A giant storm'}, {name:'Saturn',answer:'Ice and rock'},
    {name:'Uranus',answer:'On its side'}, {name:'Neptune',answer:'Super-fast winds'}, {name:'Pluto',answer:'A dwarf planet'},
  ];
  const errors=[],consoleErrors=[],failedAssets=[],providerRequests=[],viewports=[];
  page.setDefaultTimeout(15000);
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());});
  page.on('response',response=>{if(response.status()>=400&&/\.(?:mp3|webp|png|jpe?g|glb|gltf|bin|ktx)(?:[?#]|$)/i.test(response.url()))failedAssets.push({url:response.url(),status:response.status()});});
  await page.unroute('**/api/**');
  await page.route('**/api/**',route=>{providerRequests.push(route.request().url());return route.fulfill({status:403,body:'Synthetic Pair4 provider guard'});});
  await page.addInitScript(()=>{
    if(window.__pair4AudioInstalled)return;
    window.__pair4AudioInstalled=true;window.__pair4Audio=[];
    const original=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=function(...args){
      const row={src:this.currentSrc||this.src,started:false,ended:false,paused:false};window.__pair4Audio.push(row);
      this.addEventListener('playing',()=>row.started=true,{once:true});this.addEventListener('ended',()=>row.ended=true,{once:true});this.addEventListener('pause',()=>row.paused=true);
      return original.apply(this,args);
    };
  });
  const coreState=()=>page.evaluate(()=>Object.fromEntries(Array.from({length:localStorage.length},(_,index)=>localStorage.key(index)).filter(key=>key&&!/diagnostic/i.test(key)).sort().map(key=>[key,localStorage.getItem(key)])));
  for(const width of [390,1440]){
    await page.setViewportSize({width,height:900});
    await page.goto(`${origin}/?pair4=solar-${width}-${Date.now()}#/`);
    await page.getByRole('button',{name:/Age 6\+.*Amari/}).click();
    await page.locator('.discovery-world-card').filter({hasText:'Explore & Languages'}).click();
    await page.locator('.catalogue-game-card').filter({hasText:'Solar System'}).click();
    await page.getByRole('heading',{name:'Solar System Explorer',exact:true}).waitFor();
    await page.waitForFunction(()=>Boolean(document.querySelector('[data-planet-models="9"]')),null,{timeout:45000});
    const initial3d=await page.evaluate(()=>({canvas:!!document.querySelector('.solar-premium canvas'),models:document.querySelector('[data-planet-models]')?.dataset.planetModels,fallback:document.querySelector('[data-planet-model-fallback]')?.dataset.planetModelFallback||null,canvasSize:document.querySelector('.solar-premium canvas')?{width:document.querySelector('.solar-premium canvas').width,height:document.querySelector('.solar-premium canvas').height}:null}));
    if(!initial3d.canvas||initial3d.models!=='9'||initial3d.fallback)throw Error(`Solar is not rendering all nine GLB models: ${JSON.stringify(initial3d)}`);
    const view=page.getByRole('button',{name:/Show all planets/});
    await view.click();await page.getByText('All worlds in view',{exact:true}).waitFor();
    await page.getByRole('button',{name:/Inspect Earth/}).click();
    for(const [name,action] of [['Turn left','Turn left'],['Turn right','Turn right'],['Tilt up','Tilt up'],['Tilt down','Tilt down'],['Zoom in','Zoom in'],['Zoom out','Zoom out']])await page.getByRole('button',{name:action,exact:true}).click();
    const pause=page.getByRole('button',{name:/^(Pause rotation|Resume rotation)$/});
    const beforePause=await pause.getAttribute('aria-pressed');await pause.click();if(await page.getByRole('button',{name:/^(Pause rotation|Resume rotation)$/}).getAttribute('aria-pressed')===beforePause)throw Error('Solar rotation control did not change state');
    await page.getByRole('button',{name:/^(Pause rotation|Resume rotation)$/}).click();
    await page.getByRole('button',{name:'More planets in strip',exact:true}).click();
    await page.getByRole('button',{name:'Previous planets in strip',exact:true}).click();
    const rows=[];
    for(const [index,world] of worlds.entries()){
      const wasEarned=await page.evaluate(name=>{const value=JSON.parse(localStorage.getItem('amari_discovery_passport_v1')||'{"facts":{},"quizzes":{}}');return value.quizzes?.[name]===true},world.name);
      const rewardsBefore=await page.evaluate(()=>localStorage.getItem('amari_rewards_v2'));
      await page.getByRole('button',{name:world.name==='Pluto'?'Pluto, dwarf planet':world.name,exact:true}).click();
      await page.getByRole('heading',{name:world.name,exact:true}).waitFor();
      const mission=page.getByRole('region',{name:`${world.name} mission`,exact:true});
      const start=mission.getByRole('button',{name:new RegExp(`^(Start|Replay) ${world.name} mission$`)});
      const startText=await start.innerText();
      if(wasEarned&&!startText.startsWith('Replay'))throw Error(`${world.name} did not offer a real replay for an earned mission`);
      if(!wasEarned&&!startText.startsWith('Start'))throw Error(`${world.name} offered replay before its challenge had been earned`);
      await start.click();
      await mission.getByText('Step 1: Choose any three facts',{exact:false}).waitFor();
      const factCount=await page.getByRole('button',{name:/^Discovery \d+:/}).count();
      const visited=[];
      while(visited.length<3){
        const factIndex=Array.from({length:factCount},(_,i)=>i).find(candidate=>!visited.includes(candidate));
        if(factIndex===undefined)throw Error(`${world.name} has fewer than three distinct fact controls`);
        await page.getByRole('button',{name:new RegExp(`^Discovery ${factIndex+1}:`)}).click();visited.push(factIndex);
        if(await mission.getByText('Step 2: Compare',{exact:false}).count())break;
      }
      await mission.getByText('Step 2: Compare',{exact:false}).waitFor();
      await mission.getByRole('button',{name:'Continue to the challenge',exact:true}).click();
      await mission.getByText('Step 3: Challenge',{exact:false}).waitFor();
      const optionButtons=mission.getByRole('button');
      const optionNames=(await optionButtons.allTextContents()).map(text=>text.trim());
      if(optionNames.length<2||optionNames.length>3||!optionNames.includes(world.answer))throw Error(`${world.name} challenge options do not match authored answer: ${JSON.stringify(optionNames)}`);
      const wrong=optionNames.find(option=>option!==world.answer);
      await optionButtons.filter({hasText:wrong}).click();
      await mission.getByText('Not quite — use the facts and try again.',{exact:true}).waitFor();
      if(JSON.stringify((await optionButtons.allTextContents()).map(text=>text.trim()))!==JSON.stringify(optionNames))throw Error(`${world.name} answer order changed during feedback`);
      let saveFaultRetried=false;
      if(width===390&&world.name==='Pluto'){
        const beforeFault=await coreState();
        await page.evaluate(()=>{const original=Storage.prototype.setItem;window.__pair4BlockSolar=true;window.__pair4OriginalSolarSetItem=original;Storage.prototype.setItem=function(key,value){if(window.__pair4BlockSolar&&key==='amari_discovery_passport_v1')throw new DOMException('Synthetic quota failure','QuotaExceededError');return original.call(this,key,value);};});
        await optionButtons.filter({hasText:world.answer}).click();
        await page.getByRole('alert').getByRole('button',{name:'Retry save',exact:true}).waitFor();
        const afterFault=await coreState();if(JSON.stringify(beforeFault)!==JSON.stringify(afterFault))throw Error('Blocked Solar challenge write changed stored records');
        if(!(await page.getByRole('button',{name:'Neptune',exact:true}).isDisabled()))throw Error('Planet strip remained active during a pending save');
        if(await mission.getByText('Mission complete — saved in your discovery passport.',{exact:true}).count())throw Error('Solar showed completion before the challenge write persisted');
        const canvas=page.locator('.solar-premium canvas');const box=await canvas.boundingBox();
        if(box)await canvas.click({position:{x:box.width/2,y:box.height/2}});
        if(await page.getByRole('heading',{name:world.name,exact:true}).count()!==1||await mission.getByText('Step 3: Challenge',{exact:false}).count()!==1)throw Error('3D pick dismissed the pending Solar challenge write');
        await page.evaluate(()=>{window.__pair4BlockSolar=false;Storage.prototype.setItem=window.__pair4OriginalSolarSetItem;});
        await page.getByRole('alert').getByRole('button',{name:'Retry save',exact:true}).click();
        await page.getByRole('alert').waitFor({state:'detached'});saveFaultRetried=true;
      }else await optionButtons.filter({hasText:world.answer}).click();
      // The brief correct-answer toast can disappear before Playwright observes it; durable completion is the saved passport state.
      await mission.getByText('Mission complete — saved in your discovery passport.',{exact:true}).waitFor();
      await page.waitForTimeout(150);
      const persisted=await page.evaluate(name=>JSON.parse(localStorage.getItem('amari_discovery_passport_v1')||'{"facts":{},"quizzes":{}}'),world.name);
      if(persisted.quizzes?.[world.name]!==true||Object.keys(persisted.facts||{}).filter(key=>key.startsWith(`${world.name}-`)).length<3)throw Error(`${world.name} challenge/facts did not persist`);
      const rewardsAfter=await page.evaluate(()=>localStorage.getItem('amari_rewards_v2'));
      if(wasEarned&&rewardsBefore!==rewardsAfter)throw Error(`${world.name} earned mission replay repeated rewards`);
      rows.push({planet:world.name,missionSteps:['discover','compare','challenge','complete'],factsVisited:visited.length,challengeRetried:true,wasEarned,saveFaultRetried,answerOrderStable:true,passportSaved:true});
    }
    const pluto=page.getByRole('button',{name:'Pluto, dwarf planet',exact:true});await pluto.waitFor();
    const planetStrip=page.getByRole('navigation',{name:'Choose a planet'});const destinationCount=await planetStrip.getByRole('button').count();if(destinationCount!==9||worlds.length!==9||await planetStrip.getByRole('button',{name:'Pluto, dwarf planet',exact:true}).count()!==1)throw Error('Pluto classification or nine destination strip is missing');
    const passport=await page.evaluate(()=>JSON.parse(localStorage.getItem('amari_discovery_passport_v1')||'{"facts":{},"quizzes":{}}'));
    if(Object.keys(passport.quizzes||{}).filter(name=>passport.quizzes[name]===true).length!==9)throw Error('Solar passport does not contain all nine saved challenges');
    const persistedBeforeReload=await coreState();
    await page.reload();
    await page.getByRole('heading',{name:'Solar System Explorer',exact:true}).waitFor();
    await page.waitForFunction(()=>Boolean(document.querySelector('[data-planet-models="9"]')),null,{timeout:45000});
    if(JSON.stringify(persistedBeforeReload)!==JSON.stringify(await coreState()))throw Error('Solar reload changed saved progress/rewards');
    const reloadedPassport=await page.evaluate(()=>JSON.parse(localStorage.getItem('amari_discovery_passport_v1')||'{"facts":{},"quizzes":{}}'));
    if(Object.keys(reloadedPassport.quizzes||{}).filter(name=>reloadedPassport.quizzes[name]===true).length!==9||Object.keys(reloadedPassport.facts||{}).length<27)throw Error('Solar discovery passport did not reload with nine challenges and three facts per destination');
    const passportSection=page.getByRole('region',{name:'Discovery passport',exact:true});
    const shelfBefore=await coreState();
    await page.getByRole('button',{name:'More planets in strip',exact:true}).click();
    await page.getByRole('button',{name:'Previous planets in strip',exact:true}).click();
    await passportSection.innerText();
    if(JSON.stringify(shelfBefore)!==JSON.stringify(await coreState()))throw Error('Reading Solar discovery passport altered saved progress/rewards');
    await page.screenshot({path:`docs/qa-evidence/solar-memory-20261028/solar-${width}-final.jpg`,type:'jpeg',quality:76,fullPage:true});
    viewports.push({width,mode:width===390?'initial progression plus saved-state recheck':'replay-existing-earned-state',initial3d,rows,passportCounts:{facts:Object.keys(reloadedPassport.facts||{}).length,challenges:Object.keys(reloadedPassport.quizzes||{}).length},passportReloaded:true,passportReadOnly:true,allDestinations:true});
  }
  let leaveAudioIndex=null,muteTested=false;
  const listen=page.getByRole('button',{name:'Listen',exact:true}).first();
  if(await listen.count()){
    leaveAudioIndex=await page.evaluate(()=>window.__pair4Audio.length);await listen.click();await page.waitForTimeout(300);
    const audio=await page.evaluate(index=>window.__pair4Audio[index],leaveAudioIndex);
    if(audio?.started){
      await page.getByRole('button',{name:'Turn sound off',exact:true}).click();await page.waitForTimeout(100);
      const muted=await page.evaluate(index=>window.__pair4Audio[index]?.paused||window.__pair4Audio[index]?.ended,leaveAudioIndex);
      if(!muted)throw Error('Solar mute did not cancel packaged narration');
      muteTested=true;await page.getByRole('button',{name:'Turn sound on',exact:true}).click();
      leaveAudioIndex=await page.evaluate(()=>window.__pair4Audio.length);await page.getByRole('button',{name:'Listen',exact:true}).click();await page.waitForTimeout(300);
    }
  }
  const preLeaveAudio=await page.evaluate(()=>window.__pair4Audio.length);
  await page.getByRole('button',{name:'Back to Explore and Languages',exact:true}).click();
  await page.getByText('Explore & Languages',{exact:false}).first().waitFor();
  if(leaveAudioIndex!==null)await page.waitForFunction(index=>{const row=window.__pair4Audio?.[index];return !row||!row.started||row.paused||row.ended;},leaveAudioIndex,{timeout:3000});
  const cancellation=await page.evaluate(({index,wasMuted})=>({index,total:window.__pair4Audio.length,row:index===null?null:window.__pair4Audio[index],muteTested:wasMuted}),{index:leaveAudioIndex,wasMuted:muteTested});
  if(cancellation.row?.started&&!cancellation.row.paused&&!cancellation.row.ended)throw Error('Leaving Solar did not cancel current packaged narration');
  if(errors.length||consoleErrors.length||failedAssets.length||providerRequests.length)throw Error(JSON.stringify({errors,consoleErrors,failedAssets,providerRequests}));
  return{passed:true,origin,viewports,cancellation,providerRequests,failedAssets,errors,consoleErrors,entry:await page.evaluate(()=>document.querySelector('script[type=module][src]')?.getAttribute('src'))};
}
