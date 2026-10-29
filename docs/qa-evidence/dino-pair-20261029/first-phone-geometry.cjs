async page=>{
 const rows=[],errors=[],requests=[]; const err=e=>errors.push(String(e.message||e));const req=r=>{if(/\/api\//.test(r.url()))requests.push(r.url())};page.on('pageerror',err);page.on('request',req);
 try{
 await page.setViewportSize({width:390,height:740});await page.goto('http://127.0.0.1:5180/?qa_pair7_geometry=1#/');
 if(!await page.evaluate(()=>window.__amariQaNamespaced===true))throw Error('Missing synthetic namespace');
 const entry=await page.locator('script[type=module][src]').getAttribute('src');if(entry!=='/assets/arcade-B__1zLPu.js')throw Error('Geometry candidate mismatch:'+entry);
 const chooser=page.getByRole('button',{name:/Age 6\+.*Amari/});await chooser.or(page.getByRole('heading',{name:'Choose a world',exact:true})).first().waitFor();
 if(await chooser.count())await chooser.click();
 const profile=page.getByRole('button',{name:/is playing.*(?:Change player|Tap to change player)/});if(await profile.count()&&!((await profile.getAttribute('aria-label')).toLowerCase().includes('amari'))){await profile.click();await page.getByRole('button',{name:/Age 6\+.*Amari/}).click()}
 await page.locator('.discovery-world-card').filter({hasText:'Explore & Languages'}).click();await page.locator('.catalogue-game-card').filter({hasText:'Dino Detective'}).click();
 await page.getByRole('button',{name:/^(Explore|Replay)$/}).first().click();
 const area=page.getByRole('group',{name:/search area$/});await area.waitFor();
 const trail=await area.locator('path[d^="M 50 96 Q"]').getAttribute('d');const nums=trail.match(/[-+]?\d*\.?\d+/g).map(Number);const[x,y]=nums.slice(-2);
 const covers=area.getByRole('button');const positions=await covers.evaluateAll(es=>es.map(e=>({x:parseFloat(e.style.left),y:parseFloat(e.style.top),label:e.getAttribute('aria-label')})));const index=positions.findIndex(p=>Math.abs(p.x-x)<.1&&Math.abs(p.y-y)<.1);if(index<0)throw Error('Visible trail does not end at a cover');
 const before=await page.evaluate(()=>({progress:localStorage.getItem('amari_amari_dino_detective_batch3_v1'),rewards:localStorage.getItem('amari_rewards_v2')}));
 rows.push({kind:'visible-trail-answer',trail,cover:positions[index]});await covers.nth(index).click();
 const next=page.getByRole('button',{name:'Next find',exact:true});await next.waitFor();
 const geometry=await next.evaluate(e=>{const r=e.getBoundingClientRect();return{label:e.innerText,rect:{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height},viewport:{width:innerWidth,height:innerHeight},scrollY}});
 const after=await page.evaluate(()=>({progress:localStorage.getItem('amari_amari_dino_detective_batch3_v1'),rewards:localStorage.getItem('amari_rewards_v2')}));if(JSON.stringify(before)!==JSON.stringify(after))throw Error('A single find changed durable progress/rewards');
 const path='/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-b7-memory-cumulative-20261006/docs/qa-evidence/dino-pair-20261029/first-amari-dino-found-390.jpg';await page.screenshot({path,type:'jpeg',quality:72,fullPage:false});rows.push({kind:'held-next-geometry',...geometry,path});
 return{at:new Date().toISOString(),scope:'First compiled layout probe only; no full acceptance',entry,namespaced:true,rows,heldNextFits:geometry.rect.y>=0&&geometry.rect.bottom<=740&&geometry.rect.right<=390,errors,requests};
 }catch(e){return{scope:'First compiled layout probe only',failed:true,message:e.message,rows,errors,requests}}finally{page.off('pageerror',err);page.off('request',req)}
}
