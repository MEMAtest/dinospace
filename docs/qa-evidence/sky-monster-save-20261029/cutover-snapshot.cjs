async page => {
 const mode=__MODE__, expected=__ENTRY__;
 const errors=[],providers=[],consoleErrors=[],responseFailures=[],requestFailures=[];
 const onError=e=>errors.push(e.message);
 const onConsole=m=>{if(m.type()==='error')consoleErrors.push(m.text());};
 const onResponse=r=>{if(r.status()>=400)responseFailures.push({url:r.url(),status:r.status()});};
 const onRequest=r=>requestFailures.push({url:r.url(),error:r.failure()?.errorText});
 page.on('pageerror',onError);page.on('console',onConsole);page.on('response',onResponse);page.on('requestfailed',onRequest);
 await page.unroute('**/api/**');
 await page.route('**/api/**',r=>{providers.push(r.request().url());return r.fulfill({status:403,body:'Synthetic QA guard'});});
 try {
  if(mode==='before') {
   await page.setViewportSize({width:390,height:740});
   await page.goto('https://dinospace.netlify.app/?qa_pair14_cutover='+Date.now()+'#/home');
  } else if(mode==='after') {
   if(!page.url().startsWith('https://dinospace.netlify.app/'))throw Error('Canonical old tab required');
   await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
   const refresh=page.getByRole('button',{name:'Refresh games',exact:true});
   await refresh.waitFor({timeout:20000});
   const hit=await refresh.evaluate(el=>{const r=el.getBoundingClientRect();return {w:r.width,h:r.height,hit:el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))};});
   if(hit.w<44||hit.h<44||!hit.hit)throw Error('Refresh control geometry '+JSON.stringify(hit));
   await refresh.click();
  }
  await page.waitForFunction(()=>window.__amariQaNamespaced===true);
  const pick=page.getByRole('button',{name:/Age 6\+.*Amari/});
  await pick.or(page.getByRole('heading',{name:'Choose a world',exact:true})).first().waitFor();
  if(await pick.count())await pick.click();
  await page.getByRole('heading',{name:'Choose a world',exact:true}).waitFor();
  await page.waitForFunction(entry=>document.querySelector('script[type="module"][src]')?.getAttribute('src')===entry,expected,{timeout:20000});
  if(mode!=='before') {
   let settled=false;
   for(let i=0;i<120;i++){settled=await page.evaluate(async()=>{const keys=await caches.keys();const regs=await navigator.serviceWorker.getRegistrations();return keys.includes('amari-discovery-v51')&&regs.some(r=>r.active?.state==='activated'&&!r.installing&&!r.waiting);});if(settled)break;await page.waitForTimeout(250);}
   if(!settled)throw Error('Current worker installation has not settled');
  }
  const state=await page.evaluate(async()=>{
   const digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',typeof value==='string'?new TextEncoder().encode(value):value))).map(n=>n.toString(16).padStart(2,'0')).join('');
   const records={};
   for(const key of Object.keys(localStorage).sort())if(key.startsWith('qa_rewards_20261024_'))records[key]=await digest(localStorage.getItem(key));
   const inventory=await indexedDB.databases(); let idb={present:false};
   if(inventory.some(d=>d.name==='amari-storybooks')){
    const db=await new Promise((ok,no)=>{const r=indexedDB.open('amari-storybooks');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);r.onupgradeneeded=()=>{r.transaction.abort();no(Error('Unexpected database upgrade'));};});
    try {
     const names=Array.from(db.objectStoreNames).sort();
     const tx=db.transaction(names,'readonly');
     const rows=await Promise.all(names.map(name=>new Promise((ok,no)=>{const r=tx.objectStore(name).getAll();r.onsuccess=()=>ok([name,r.result]);r.onerror=()=>no(r.error);}))); const stores={};let total=0;
     for(const [name,items] of rows){if(items.length>1000)throw Error('Bounded inventory exceeded');const entries=[];for(const item of items){const row={...item};if(row.blob instanceof Blob){total+=row.blob.size;if(total>64*1024*1024)throw Error('Blob hash budget exceeded');row.blob={size:row.blob.size,type:row.blob.type,sha256:await digest(await row.blob.arrayBuffer())};}entries.push(row);}entries.sort((a,b)=>String(a.id||a.key).localeCompare(String(b.id||b.key)));stores[name]={count:entries.length,sha256:await digest(JSON.stringify(entries))};}
     idb={present:true,version:db.version,stores,blobBytes:total};
    } finally {db.close();}
   }
   return {entry:document.querySelector('script[type="module"][src]')?.getAttribute('src'),records,idb,notice:Boolean(document.querySelector('[aria-label="Game update available"]')),caches:await caches.keys(),url:location.href};
  });
  if(mode==='after'&&state.notice)throw Error('Current release still shows update notice');
  if(errors.length||providers.length||consoleErrors.length||responseFailures.length||requestFailures.length)throw Error(JSON.stringify({errors,providers,consoleErrors,responseFailures,requestFailures}));
  return {passed:true,mode,updateTrigger:mode==='after'?'focus observer event then actual Refresh games click':null,...state,errors,providers,consoleErrors,responseFailures,requestFailures};
 } finally {page.off('pageerror',onError);page.off('console',onConsole);page.off('response',onResponse);page.off('requestfailed',onRequest);}
}
