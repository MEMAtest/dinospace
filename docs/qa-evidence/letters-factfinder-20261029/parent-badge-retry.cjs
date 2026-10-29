async page=>{
const errors=[];const fail=e=>errors.push(e.message);page.on('pageerror',fail);
const hashes=()=>page.evaluate(async()=>{const r={};for(const key of Object.keys(localStorage).filter(x=>x.startsWith('qa_rewards_20261024_')).sort()){r[key]=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(localStorage.getItem(key))))).map(n=>n.toString(16).padStart(2,'0')).join('');}return r;});
const before=await hashes();
try{
 await page.setViewportSize({width:390,height:740});
 await page.evaluate(()=>{if(!window.__amariQaNamespaced)throw Error('QA namespace required');const original=Storage.prototype.getItem;const fault={consumed:false};const wrapper=function(key){if(key==='amari_chapter_badges_v1'&&!fault.consumed){fault.consumed=true;Storage.prototype.getItem=original;throw new DOMException('Bounded parent badge read failure','SecurityError');}return original.call(this,key);};fault.restore=()=>{if(Storage.prototype.getItem===wrapper)Storage.prototype.getItem=original;};window.__pair11ParentBadgeFault=fault;Storage.prototype.getItem=wrapper;});
 await page.getByRole('button',{name:'Stickers',exact:true}).click();
 const section=page.locator('[aria-label="Letter Launch chapter badge collection"]');
 const retry=section.getByRole('button',{name:'Retry rocket badges',exact:true});await retry.waitFor();
 const errorText=await section.innerText();if(errorText.includes('0 of 4'))throw Error('Unreadable badges shown as empty');
 await retry.evaluate(e=>e.scrollIntoView({block:'center',inline:'nearest'}));
 const box=await retry.boundingBox();if(!box||box.width<44||box.height<44)throw Error('Badge retry target too small');
 await retry.click();await section.getByText('4 of 4 earned',{exact:true}).waitFor();
 const recoveredText=await section.innerText();await page.reload();await page.locator('[aria-label="Letter Launch chapter badge collection"]').getByText('4 of 4 earned',{exact:true}).waitFor();
 const after=await hashes();if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Parent read retry changed stored values');if(errors.length)throw Error(errors.join(';'));
 return {passed:true,scope:'Current canonical parent badge unreadable/read Retry and reload retention, existing earned records only.',entry:await page.locator('script[type=module][src]').getAttribute('src'),viewport:{width:390,height:740},errorText,recoveredText,preservedStorageKeys:Object.keys(before).length,errors};
}finally{await page.evaluate(()=>{window.__pair11ParentBadgeFault?.restore?.();delete window.__pair11ParentBadgeFault;});page.off('pageerror',fail);}
}
