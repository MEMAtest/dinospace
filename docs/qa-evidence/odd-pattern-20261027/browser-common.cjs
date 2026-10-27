// Shared diagnostics for this pair's existing single synthetic Chromium tab.
// The caller installs provider guards before navigation; no progress/unlocks
// or random seeds are injected.
async function prepare(page, origin, width) {
  const errors=[],consoleErrors=[],providers=[],failedAssets=[];
  page.setDefaultTimeout(15000);await page.setViewportSize({width,height:900});
  await page.unroute('**/api/**');await page.route('**/api/**',route=>{providers.push(route.request().url());return route.fulfill({status:403,body:'Synthetic QA provider guard'});});
  page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());});page.on('response',response=>{if(response.status()>=400&&/\.(mp3|webp|png)/.test(response.url()))failedAssets.push({url:response.url(),status:response.status()});});
  await page.addInitScript(()=>{
    if(window.__reasoningQaAudio)return;window.__reasoningQaAudio=true;window.__reasoningQaMedia=[];
    const play=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=function(...args){const row={source:this.currentSrc||this.src,started:false,advanced:false,ended:false};window.__reasoningQaMedia.push(row);this.addEventListener('playing',()=>row.started=true);this.addEventListener('timeupdate',()=>{if(this.currentTime>.05)row.advanced=true;});this.addEventListener('ended',()=>row.ended=true);return play.apply(this,args);};
  });
  const root=origin+'/?reasoning-acceptance='+Date.now();await page.goto(root+'#/');await page.getByRole('button',{name:/Age 6\+.*Amari/}).click();
  return {root,errors,consoleErrors,providers,failedAssets};
}
