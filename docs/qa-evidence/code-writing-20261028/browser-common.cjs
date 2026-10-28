// Shared diagnostics for this pair's existing single synthetic Chromium tab.
// The caller installs provider guards before navigation; no progress/unlocks
// or random seeds are injected.
async function prepare(page, origin, width, player = 'amari') {
  const errors=[],consoleErrors=[],providers=[],failedAssets=[];
  page.setDefaultTimeout(15000);await page.setViewportSize({width,height:900});
  await page.unroute('**/api/**');await page.route('**/api/**',route=>{providers.push(route.request().url());return route.fulfill({status:403,body:'Synthetic QA provider guard'});});
  page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());});page.on('response',response=>{if(response.status()>=400&&/\.(mp3|webp|png)/.test(response.url()))failedAssets.push({url:response.url(),status:response.status()});});
  await page.addInitScript(()=>{
    if(window.__creativeQaAudioV1)return;window.__creativeQaAudioV1=true;window.__creativeQaMediaV1=[];
    const play=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=function(...args){const row={source:this.currentSrc||this.src,started:false,advanced:false,ended:false,paused:false};window.__creativeQaMediaV1.push(row);this.addEventListener('playing',()=>row.started=true);this.addEventListener('timeupdate',()=>{if(this.currentTime>.05)row.advanced=true;});this.addEventListener('ended',()=>row.ended=true);this.addEventListener('pause',()=>row.paused=true);return play.apply(this,args);};
  });
  const root=origin+'/?creative-acceptance='+Date.now();await page.goto(root+'#/');await page.getByRole('button',{name:player === 'askia' ? /Age 3\+.*Askia/ : /Age 6\+.*Amari/}).click();
  return {root,errors,consoleErrors,providers,failedAssets};
}
async function checkLayout(page, selector) {
 const result=await page.evaluate(selector=>({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),clipped:[...document.querySelectorAll(selector+' .skill-pill, '+selector+' input, '+selector+' select')].filter(e=>{const r=e.getBoundingClientRect();return r.height>0&&(r.left<-.5||r.right>innerWidth+.5)}).map(e=>e.textContent.trim().slice(0,60)),short:[...document.querySelectorAll(selector+' button')].filter(b=>b.getBoundingClientRect().height>0&&b.getBoundingClientRect().height<47.9).map(b=>({text:b.textContent.trim().slice(0,60),height:b.getBoundingClientRect().height}))}),selector);
 if(result.overflow||result.broken.length||result.short.length||result.clipped.length)throw Error(JSON.stringify(result));return result;
}
async function completedReplay(page, button, minimumEnded=1) {
 const before=await page.evaluate(()=>window.__creativeQaMediaV1.length);await button.click();await page.waitForFunction(({before,minimumEnded})=>window.__creativeQaMediaV1.slice(before).filter(r=>r.ended&&r.advanced).length>=minimumEnded,{before,minimumEnded},{timeout:25000});
}
async function assertMute(page, button) {
 const before=await page.evaluate(()=>window.__creativeQaMediaV1.length);await button.click();await page.waitForFunction(n=>window.__creativeQaMediaV1[n]?.started,before,{timeout:10000});await page.getByRole('button',{name:'Turn sound off',exact:true}).click();await page.waitForFunction(n=>window.__creativeQaMediaV1[n]?.paused||window.__creativeQaMediaV1[n]?.ended,before);await page.waitForTimeout(350);const count=await page.evaluate(()=>window.__creativeQaMediaV1.length);if(count!==before+1)throw Error('Muted narration advanced its chain');await page.getByRole('button',{name:'Turn sound on',exact:true}).click();
}
