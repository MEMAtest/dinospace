async page => {
 const errors=[],failed=[],provider=[];const pe=e=>errors.push(e.message),ce=m=>{if(m.type()==='error')errors.push(m.text())},re=r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()})};
 page.on('pageerror',pe);page.on('console',ce);page.on('response',re);await page.unroute('**/api/**');await page.route('**/api/**',r=>{provider.push(r.request().url());return r.fulfill({status:403,body:'QA guard'})});
 try {
  await page.setViewportSize({width:390,height:740});
  if(!await page.evaluate(()=>window.__amariQaNamespaced===true))throw Error('Missing synthetic namespace');
  const entry=await page.locator('script[type=module][src]').getAttribute('src');if(entry!=='/assets/arcade-UpMdFwWa.js')throw Error(`Unexpected ${entry}`);
  const math=page.locator('.catalogue-game-card').filter({hasText:'Monster Math'});await math.scrollIntoViewIfNeeded();await math.click();
  const start=page.getByRole('button',{name:/^(Start six questions|Replay this episode)$/});await start.waitFor();await start.click();
  const prompt=page.getByRole('button',{name:'Hear the question again'});await prompt.waitFor();
  const mathText=(await page.locator('main').first().innerText()).slice(0,300);
  await page.getByRole('button',{name:'Back to learning world'}).click();
  await page.getByRole('heading',{name:'Maths Missions',exact:true}).waitFor();await page.getByRole('button',{name:'Back to home'}).click();
  const creative=page.locator('.discovery-world-card').filter({hasText:'Creative Lab'});await creative.scrollIntoViewIfNeeded();await creative.click();
  const sky=page.locator('.catalogue-game-card').filter({hasText:'Sky Shapes'});await sky.scrollIntoViewIfNeeded();await sky.click();
  const skyStart=page.getByRole('button',{name:/^(Start|Replay) this sky$/});await skyStart.waitFor();await skyStart.click();
  const board=page.locator('svg[role="application"][aria-label^="Tracing board for "]');await board.waitFor();const skyLabel=await board.getAttribute('aria-label');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  return {passed:!errors.length&&!failed.length&&!provider.length&&!overflow,entry,mathText,skyLabel,overflow,errors,failed,provider};
 } finally {page.off('pageerror',pe);page.off('console',ce);page.off('response',re)}
}
