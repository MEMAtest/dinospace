async page => {
  const origin = 'http://127.0.0.1:5180';
  const expectedPairs = [4,8,10,12,13,14,15,16,17,18];
  const levelIds = ['forest','ocean','space','party','dinos','vehicles','food','astronaut','garden','cosmic-challenge'];
  const errors = [], consoleErrors = [], failedAssets = [], providerRequests = [], viewportRows = [];
  const progressSnapshot = () => page.evaluate(()=>Object.fromEntries(Array.from({length:localStorage.length},(_,index)=>localStorage.key(index)).filter(key=>key&&!/diagnostic/i.test(key)).sort().map(key=>[key,localStorage.getItem(key)])));
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('response', response => {
    if (response.status() >= 400 && /\.(?:mp3|webp|png|jpe?g|glb|gltf|bin)(?:[?#]|$)/i.test(response.url())) failedAssets.push({url:response.url(),status:response.status()});
  });
  await page.unroute('**/api/**');
  await page.route('**/api/**', route => { providerRequests.push(route.request().url()); return route.fulfill({status:403,body:'Synthetic Pair4 provider guard'}); });
  await page.addInitScript(() => {
    if (window.__pair4AudioInstalled) return;
    window.__pair4AudioInstalled = true; window.__pair4Audio = [];
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function(...args) {
      const row = {src:this.currentSrc||this.src,started:false,advanced:false,ended:false,paused:false};
      window.__pair4Audio.push(row);
      this.addEventListener('playing',()=>row.started=true,{once:true});
      this.addEventListener('timeupdate',()=>{if(this.currentTime>.05)row.advanced=true;});
      this.addEventListener('ended',()=>row.ended=true,{once:true});
      this.addEventListener('pause',()=>row.paused=true);
      return original.apply(this,args);
    };
  });
  const runBoard = async (levelNumber, viewport, injectFailure) => {
    const levelButton = page.getByRole('button',{name:new RegExp(`^Level ${levelNumber}:`)});
    if (!await levelButton.isEnabled()) throw Error(`Level ${levelNumber} stayed locked before its normal prerequisite`);
    const heading = await page.locator('.memory-title-block p').innerText();
    if (!heading.startsWith(`Level ${levelNumber} of 10`)) await levelButton.click();
    await page.waitForFunction(n=>document.querySelector('.memory-title-block p')?.textContent.includes(`Level ${n} of 10`),levelNumber);
    const board = page.locator('.memory-board');
    const pairCount = Number(await board.getAttribute('data-pairs'));
    if (pairCount !== expectedPairs[levelNumber-1]) throw Error(`Level ${levelNumber} has ${pairCount} pairs`);
    const coach = await page.locator('.memory-coach-copy p[role=status]').innerText();
    const startState=await page.evaluate(()=>({passport:JSON.parse(localStorage.getItem('amari_memory_passport_v1')||'{}'),rewards:localStorage.getItem('amari_rewards_v2')}));
    const wasEarned=Boolean(startState.passport?.[levelIds[levelNumber-1]]);
    const layout = await page.evaluate(width=>({width,scrollWidth:document.documentElement.scrollWidth,boardPairs:Number(document.querySelector('.memory-board')?.dataset.pairs),columns:getComputedStyle(document.querySelector('.memory-board')).getPropertyValue('--memory-columns')}),viewport);
    if (layout.scrollWidth > viewport) throw Error(`Level ${levelNumber} overflows ${viewport}px: ${JSON.stringify(layout)}`);
    const card = index => board.getByRole('button').nth(index);
    const cardTotal = pairCount*2;
    const faceDown = async index => (await card(index).getAttribute('aria-label')||'').startsWith('Face-down memory card ');
    const revealed = async index => (await card(index).getAttribute('aria-label')||'').replace(/ card(?:, matched)?$/,'');
    const flip = async index => {
      await card(index).click();
      await page.waitForFunction(i=>{const button=document.querySelectorAll('.memory-board button')[i];return button&&!button.getAttribute('aria-label')?.startsWith('Face-down memory card ')},index);
    };
    const seen = new Map(), matched = new Set();
    let mismatchSeen=false, hintAudioStarted=false, hintAudioRow=null, failureArmed=false, retried=false;
    let storageSnapshot=null;
    const blockFinalSave = async () => {
      if (matched.size !== cardTotal-2 || !injectFailure || failureArmed) return;
      storageSnapshot=await progressSnapshot();
      await page.evaluate(()=>{
        const original=Storage.prototype.setItem; window.__pair4BlockCompletion=true; window.__pair4OriginalSetItem=original;
        Storage.prototype.setItem=function(key,value){if(window.__pair4BlockCompletion&&key==='amari_memory_completion_v1')throw new DOMException('Synthetic quota failure','QuotaExceededError');return original.call(this,key,value);};
      });
      failureArmed=true;
    };
    while (matched.size < cardTotal) {
      let index;
      for (let candidate=0;candidate<cardTotal;candidate+=1) if(await faceDown(candidate)&&!seenHasIndex(seen,candidate)){index=candidate;break;}
      if (index === undefined) throw Error(`Level ${levelNumber} scan ended at ${matched.size}/${cardTotal} matched cards`);
      await flip(index);
      const label=await revealed(index);
      const partner=seen.get(label);
      if (partner !== undefined && !matched.has(partner) && await faceDown(partner)) {
        if (matched.size === cardTotal-2 && !hintAudioStarted && await page.getByRole('button',{name:'Repeat the memory tip',exact:true}).count()) {
          const before=await page.evaluate(()=>window.__pair4Audio.length);
          await page.getByRole('button',{name:'Repeat the memory tip',exact:true}).click();
          await page.waitForTimeout(300);
          const rows=await page.evaluate(()=>window.__pair4Audio);
          if (rows.length>before && rows[before].started) { hintAudioStarted=true; hintAudioRow=before; }
        }
        await blockFinalSave();
        await flip(partner);
        matched.add(index); matched.add(partner); seen.delete(label);
      } else {
        seen.set(label,index);
        let nextIndex;
        for(let candidate=0;candidate<cardTotal;candidate+=1) if(candidate!==index&&await faceDown(candidate)&&!seenHasIndex(seen,candidate)){nextIndex=candidate;break;}
        if(nextIndex !== undefined && await faceDown(nextIndex)) {
          await blockFinalSave();
          await flip(nextIndex);
          const other=await revealed(nextIndex);
          if(other!==label) {
            seen.set(other,nextIndex); mismatchSeen=true;
            await page.locator('.memory-feedback').filter({hasText:'Those pictures are different'}).waitFor();
            await page.waitForTimeout(1600);
            if(!await faceDown(index)||!await faceDown(nextIndex)) throw Error(`Level ${levelNumber} mismatch did not turn back`);
          } else {
            matched.add(index); matched.add(nextIndex); seen.delete(label);
          }
        }
      }
      if(matched.size===cardTotal&&injectFailure) {
        await page.getByRole('button',{name:'Retry saving this board',exact:true}).waitFor();
        const failedText=await page.locator('.memory-complete-panel').innerText();
        if(!failedText.includes('Retry saving this board')) throw Error('Failed save did not remain visibly retryable');
        const failed=await progressSnapshot();
        if(JSON.stringify(storageSnapshot)!==JSON.stringify(failed)) throw Error('Failed completion write changed stored progress/passport/rewards');
        await page.evaluate(()=>{window.__pair4BlockCompletion=false;Storage.prototype.setItem=window.__pair4OriginalSetItem;});
        await page.getByRole('button',{name:'Retry saving this board',exact:true}).click();
        await page.getByRole('button',{name:/^(Next level:|Replay this level)/}).waitFor();
        retried=true;
      }
    }
    await page.locator('.memory-complete-panel').waitFor();
    await page.getByText(await page.locator('.memory-complete-panel p').first().innerText(),{exact:true}).waitFor();
    if(injectFailure&&!retried) throw Error('Retry save gate was not exercised');
    if (!injectFailure) await page.getByRole('button',{name:/^(Next level:|Replay this level)/}).waitFor();
    const moves=Number(await page.locator('.memory-stats span').nth(1).locator('strong').innerText());
    await page.waitForTimeout(150);
    const endState=await page.evaluate(()=>({passport:JSON.parse(localStorage.getItem('amari_memory_passport_v1')||'{}'),rewards:localStorage.getItem('amari_rewards_v2')}));
    if(wasEarned&&startState.passport[levelIds[levelNumber-1]].stars===3&&startState.rewards!==endState.rewards) throw Error(`Perfect-sticker replay repeated a reward on level ${levelNumber}`);
    if(hintAudioRow !== null && levelNumber<10) {
      await page.getByRole('button',{name:/^Next level:/}).click();
      await page.waitForTimeout(200);
      const paused=await page.evaluate(i=>window.__pair4Audio[i]?.paused||window.__pair4Audio[i]?.ended,hintAudioRow);
      if(!paused) throw Error('Next level did not cancel/stop the held coaching clip');
    }
    return {level:levelNumber,pairs:pairCount,moves,mismatchSeen,coach,mode:wasEarned?'replay-existing-earned-state':'normal-progression',hintAudioStarted,saveFaultRetried:retried,layout};
  };
  function seenHasIndex(map,index){for(const value of map.values())if(value===index)return true;return false;}

  for(const width of [390,1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto(`${origin}/?pair4=memory-${width}-${Date.now()}#/`);
    await page.getByRole('button',{name:/Age 6\+.*Amari/}).click();
    await page.locator('.discovery-world-card').filter({hasText:'Thinking & Play'}).click();
    await page.locator('.catalogue-game-card').filter({hasText:'Memory Match'}).click();
    await page.getByRole('heading',{name:'Memory Match',exact:true}).waitFor();
    const rows=[];
    for(let level=1;level<=10;level++) {
      const already=await page.locator('.memory-title-block p').innerText();
      if(!already.startsWith(`Level ${level} of 10`)) {
        const btn=page.getByRole('button',{name:new RegExp(`^Level ${level}:`)});
        if(!await btn.isEnabled()) throw Error(`Ordinary progression did not unlock Level ${level}`);
        await btn.click();
      }
      const shouldFail=width===390&&level===1;
      const row=await runBoard(level,width,shouldFail);
      rows.push(row);
      if(level<10 && !(row.hintAudioStarted && row.level<10)) {
        await page.getByRole('button',{name:/^Next level:/}).click();
      }
    }
    if(width===390) await page.screenshot({path:'docs/qa-evidence/solar-memory-20261028/memory-390-final.jpg',type:'jpeg',quality:78,fullPage:true});
    else await page.screenshot({path:'docs/qa-evidence/solar-memory-20261028/memory-1440-final.jpg',type:'jpeg',quality:78,fullPage:true});
    const passport=await page.evaluate(()=>({passport:localStorage.getItem('amari_memory_passport_v1'),completion:localStorage.getItem('amari_memory_completion_v1'),rewards:localStorage.getItem('amari_rewards_v2')}));
    const completionRecord=JSON.parse(passport.completion||'null');
    if(completionRecord?.resumeIndex!==9||completionRecord?.unlockedIndex!==9) throw Error(`Level 10 resume/unlock was not durably committed: ${JSON.stringify(completionRecord)}`);
    if(Object.keys(JSON.parse(passport.passport||'{}')).length!==10) throw Error('Canonical Memory passport does not contain all ten saved stickers');
    await page.reload();
    await page.getByRole('heading',{name:'Memory Match',exact:true}).waitFor();
    await page.waitForFunction(()=>document.querySelector('.memory-title-block p')?.textContent.includes('Level 10 of 10')&&document.querySelector('.memory-title-block p')?.textContent.includes('Galaxy Challenge'));
    if(await page.locator('.memory-board').getAttribute('data-pairs')!==String(expectedPairs[9])) throw Error('Reload did not resume on Level 10');
    viewportRows.push({width,rows,passportReloaded:true,canonicalResumeIndex:completionRecord.resumeIndex,canonicalUnlockedIndex:completionRecord.unlockedIndex,finalResumePairCount:expectedPairs[9]});
  }
  await page.getByRole('button',{name:'Back to Thinking and Play',exact:true}).click();
  await page.getByText('Thinking & Play',{exact:false}).first().waitFor();
  const shelfBefore=await progressSnapshot();
  await page.getByRole('button',{name:'Back to home',exact:true}).click();
  await page.getByRole('button',{name:'Stickers',exact:true}).waitFor();
  await page.getByRole('button',{name:'Stickers',exact:true}).click();
  await page.getByRole('region',{name:'Memory board stickers',exact:true}).waitFor();
  const shelf=await page.getByRole('region',{name:'Memory board stickers',exact:true}).innerText();
  if(!shelf.includes('10 / 10 collected')) throw Error('Read-only Memory shelf is incomplete');
  if(JSON.stringify(shelfBefore)!==JSON.stringify(await progressSnapshot())) throw Error('Opening the read-only Memory shelf changed persisted progress or rewards');
  if(!viewportRows.flatMap(row=>row.rows).some(row=>row.mismatchSeen)) throw Error('No actual wrong-pair feedback was observed');
  if(errors.length||consoleErrors.length||failedAssets.length||providerRequests.length) throw Error(JSON.stringify({errors,consoleErrors,failedAssets,providerRequests}));
  return {passed:true,origin,viewports:viewportRows,readOnlyShelf:true,providerRequests,failedAssets,errors,consoleErrors,entry:await page.evaluate(()=>document.querySelector('script[type=module][src]')?.getAttribute('src'))};
}
