async page => {
 const result=[];const errors=[];const onerr=e=>errors.push(e.message);page.on('pageerror',onerr);
 try {for(const [width,height] of [[390,740],[1440,844]]){
  await page.setViewportSize({width,height});const root='https://dinospace.netlify.app/?odd_start_check='+width;await page.goto(root+'#/',{waitUntil:'domcontentloaded'});
  if(!await page.evaluate(()=>window.__amariQaNamespaced===true))throw Error('namespace missing');
  const pick=page.getByRole('button',{name:/Age 6\+.*Amari/});await pick.waitFor();await pick.click();await page.getByRole('heading',{name:'Choose a world'}).waitFor();await page.goto(root+'#/play/oddoneout',{waitUntil:'domcontentloaded'});
  const start=page.getByRole('button',{name:/^Start /});await start.waitFor();const text=await start.innerText();await start.click();await page.locator('[data-odd-round]').waitFor();const round=await page.locator('[data-odd-round]').getAttribute('data-odd-round');result.push({width,text,round});
 }return {passed:errors.length===0,result,errors};}finally{page.off('pageerror',onerr)}
}
