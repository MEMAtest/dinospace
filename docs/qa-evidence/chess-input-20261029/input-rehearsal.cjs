async page => {
 const origin=__ORIGIN__,entry=__ENTRY__,width=__WIDTH__,height=__HEIGHT__;
 const rows=[],errors=[],providers=[],failedResources=[],consoleErrors=[];
 const onConsole=m=>{if(m.type()==='error')consoleErrors.push(m.text());};
 const onError=e=>errors.push(e.message),onResponse=r=>{if(r.status()>=400)failedResources.push({url:r.url(),status:r.status()});};
 const guard=async r=>{if(/\/api\/|elevenlabs|openai|story-provider/.test(r.request().url())){providers.push(r.request().url());await r.fulfill({status:403,body:'QA provider guard'});}else await r.continue();};
 let client;
 const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('amari_chess_game_v1')||'null'));
 const rewards=()=>page.evaluate(()=>Object.fromEntries(['amari','askia'].map(p=>[p,localStorage.getItem(p+'_rewards_v2')])));
 const square=s=>page.locator(`[data-chess-square="${s}"]`);
 const waitTurn=()=>page.waitForFunction(()=>{const x=document.querySelector('[data-chess-square]');return x&&!x.disabled;},null,{timeout:15000});
 const measure=async(l,label)=>{const d=await l.evaluate(e=>{const r=e.getBoundingClientRect(),h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom,hit:!!h&&(e===h||e.contains(h))};});if(d.x<0||d.y<0||d.right>width||d.bottom>height||d.w<44||d.h<44||!d.hit)throw Error(label+' geometry '+JSON.stringify(d));return d;};
 const enter=async()=>{const pick=page.getByRole('button',{name:/Age 6\+.*Amari/});await pick.or(page.getByRole('button',{name:/Play a full game vs computer/})).or(page.getByRole('heading',{name:'Choose a world',exact:true})).first().waitFor();if(await pick.count())await pick.click();const full=page.getByRole('button',{name:/Play a full game vs computer/});const intro=page.getByRole('heading',{name:'Choose a world',exact:true});await full.or(intro).first().waitFor();if(await intro.count()){const w=page.locator('.discovery-world-card').filter({hasText:'Thinking & Play'});await w.evaluate(e=>e.scrollIntoView({block:'center'}));await w.click();const c=page.locator('.catalogue-game-card').filter({hasText:'Chess Explorers'});await c.evaluate(e=>e.scrollIntoView({block:'center'}));await c.click();}await measure(full,'Full game entry');await full.click();await page.locator('.chess-full-game').waitFor();};
 const start=async side=>{
  const board=page.locator('.chess-play-board');await board.or(page.getByRole('button',{name:'Play white',exact:true})).first().waitFor();if(await board.count())await page.getByRole('button',{name:'New game',exact:true}).click();
  const keep=page.getByRole('button',{name:'Keep saved game',exact:true});if(await keep.count())await keep.click();
  await page.getByRole('button',{name:'Play '+side,exact:true}).click();
  await page.getByRole('button',{name:/^(Start game|New game)$/,exact:true}).click();
  const confirm=page.getByRole('button',{name:'Start new game',exact:true});if(await confirm.count())await confirm.click();
  await waitTurn();await measure(board,'Whole board');
  const cells=page.getByRole('gridcell');if(await cells.count()!==64)throw Error('Missing squares');for(let i=0;i<64;i++)await measure(cells.nth(i),'Square '+i);
  rows.push({kind:'start',side,savedSide:(await read()).match.humanColor,board:await board.getAttribute('aria-label')});
 };
 const pointer=async(from,to,{cancel=false,outside=false,touch=false}={})=>{
  const a=await square(from).boundingBox(),b=outside?{x:1,y:height-1,width:1,height:1}:await square(to).boundingBox();
  const p={x:a.x+a.width/2,y:a.y+a.height/2},q={x:b.x+b.width/2,y:b.y+b.height/2};
  if(touch){await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:7}]});for(let i=1;i<=10;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x+(q.x-p.x)*i/10,y:p.y+(q.y-p.y)*i/10,id:7}]});if(!await page.locator('.chess-drag-piece').count())throw Error('Touch drag has no moving piece');await client.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});}
  else{await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(q.x,q.y,{steps:12});if(!await page.locator('.chess-drag-piece').count())throw Error('Mouse drag has no moving piece');await page.mouse.up();}
 };
 const expectNoMove=async(label,action)=>{const before=(await read()).match;await action();await page.waitForTimeout(200);const after=(await read()).match;if(JSON.stringify(before.history)!==JSON.stringify(after.history)||before.fen!==after.fen)throw Error(label+' changed board');rows.push({kind:label,historyUnchanged:true,feedback:await page.locator('.chess-live-message').innerText()});};
 const expectMove=async(label,from,to,action)=>{const before=(await read()).match.history.length;await action();await page.waitForFunction(n=>JSON.parse(localStorage.getItem('amari_chess_game_v1')||'null')?.match?.history?.length===n+2,before,{timeout:15000});await waitTurn();const after=(await read()).match;const actual=after.history[before];if(actual.from!==from||actual.to!==to)throw Error(label+' applied wrong move');if(await page.locator('.chess-drag-piece').count())throw Error('Drag piece remains after release');rows.push({kind:label,human:actual,computer:after.history[before+1],history:after.history.length});};
 try{
  page.on('pageerror',onError);page.on('console',onConsole);page.on('response',onResponse);await page.route('**/*',guard);await page.setViewportSize({width,height});await page.goto(origin+'/?qa_chess_input='+Date.now());await page.waitForFunction(()=>window.__amariQaNamespaced===true);await enter();
  const actual=await page.locator('script[type=module][src]').getAttribute('src');if(actual!==entry)throw Error('Wrong entry '+actual);
  const before=await rewards();client=await page.context().newCDPSession(page);
  await start('white');
  await expectNoMove('illegal mouse drop',()=>pointer('e2','e5'));
  await expectNoMove('outside board drop',()=>pointer('e2','e4',{outside:true}));
  await expectNoMove('cancelled touch drag',()=>pointer('e2','e4',{touch:true,cancel:true}));
  await expectMove('mouse drag','e2','e4',()=>pointer('e2','e4'));
  await expectMove('tap selection','g1','f3',async()=>{await square('g1').click();await square('f3').click();});
  await expectMove('keyboard move','b1','c3',async()=>{await square('b1').focus();await page.keyboard.press('Enter');await square('c3').focus();await page.keyboard.press('Enter');});
  const saved=(await read()).match;
  await page.reload();await page.waitForFunction(()=>window.__amariQaNamespaced===true);await enter();await page.getByRole('button',{name:'Resume saved game',exact:true}).click();await waitTurn();const resumed=(await read()).match;if(resumed.fen!==saved.fen||JSON.stringify(resumed.history)!==JSON.stringify(saved.history))throw Error('Reload lost saved board');rows.push({kind:'reload-resume',retained:true,plies:resumed.history.length});
  await start('black');
  await expectMove('reversed board drag','g8','f6',()=>pointer('g8','f6'));
  await expectNoMove('cancelled black touch drag',()=>pointer('e7','e5',{touch:true,cancel:true}));
  await expectMove('touch drag','b8','c6',()=>pointer('b8','c6',{touch:true}));
  const after=await rewards();if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Unfinished input tests changed rewards');if(errors.length||providers.length||failedResources.length||consoleErrors.length)throw Error(JSON.stringify({errors,providers,failedResources,consoleErrors}));
  await page.screenshot({path:__SCREENSHOT__,type:'jpeg',quality:75});
  return{passed:true,origin,entry,viewport:{width,height},rows,errors,providers,failedResources,consoleErrors,unfinishedRewardsUnchanged:true,scope:'Natural synthetic saved games; pointer/tap/keyboard and CDP touch input regression. Existing full engine/mate/reward evidence retained. No physical-device claim.'};
 }catch(e){await page.screenshot({path:__FAILURE__,type:'jpeg',quality:65}).catch(()=>{});return{passed:false,origin,entry,viewport:{width,height},rows,errors,providers,failedResources,consoleErrors,failure:{message:e.message,stack:e.stack}};}
 finally{if(client)await client.detach();await page.unroute('**/*',guard);page.off('pageerror',onError);page.off('console',onConsole);page.off('response',onResponse);}
}
