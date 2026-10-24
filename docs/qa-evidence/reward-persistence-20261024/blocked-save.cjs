async page=>{
const root='http://127.0.0.1:5178/?blocked-save='+Date.now();await page.goto(root+'#/');await page.getByRole('button',{name:/Age 6\+.*Amari/}).click();await page.goto(root+'#/play/addition');
await page.getByRole('button',{name:/Chapter 2/i}).click();await page.getByRole('button',{name:'Start Number Bonds',exact:true}).click();
for(let i=0;i<6;i++){
 const eq=await page.locator('[aria-label^="Equation:"]').innerText();const [a,total]=eq.match(/\d+/g).map(Number);
 if(i===5)await page.evaluate(()=>{window.__originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='amari_rewards_v2')throw new DOMException('Synthetic quota test','QuotaExceededError');return window.__originalSet.call(this,k,v)}});
 await page.getByRole('button',{name:'Answer '+(total-a),exact:true}).click();if(i<5)await page.getByRole('button',{name:'Next question',exact:true}).click();
}
await page.getByRole('button',{name:'Try saving again',exact:true}).waitFor();const warning=await page.getByRole('alert').innerText();const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('amari_rewards_v2')));
await page.evaluate(()=>{Storage.prototype.setItem=window.__originalSet});await page.getByRole('button',{name:'Try saving again',exact:true}).click();if(await page.getByRole('alert').count())throw Error('Warning did not clear');const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('amari_rewards_v2')));if(after.points-before.points!==3)throw Error('Retry lost or duplicated stars');await page.reload();const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('amari_rewards_v2')));if(JSON.stringify(after)!==JSON.stringify(restored))throw Error('Retry not durable');return{warning,before,after,restored,retryDurable:true};}