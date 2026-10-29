async page => {
  await page.unroute('**/api/**');
  await page.route('**/api/**', route=>route.fulfill({status:403,body:'Synthetic provider guard'}));
  await page.goto('https://dinospace.netlify.app/#/');
  await page.getByRole('button',{name:/Age 6\+.*Amari/}).or(page.locator('.discovery-world-card').first()).first().waitFor();
  if(await page.getByRole('button',{name:/Age 6\+.*Amari/}).count())await page.getByRole('button',{name:/Age 6\+.*Amari/}).click();
  await page.locator('.discovery-world-card').first().waitFor();
  return page.evaluate(async()=>{
    if (!window.__amariQaNamespaced) throw new Error('Missing synthetic namespace');
    const digest=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(n=>n.toString(16).padStart(2,'0')).join('');
    const hashes={};
    for(const key of Object.keys(localStorage).sort()){
      if(!key.startsWith('qa_rewards_20261024_'))continue;
      const logical=key.slice('qa_rewards_20261024_'.length);
      if(!/progress|passport|reward|badge|sticker|favourite|digital_rehearsal|game_levels|writing_desk|memory_best|memory_resume|memory_completion/.test(logical))continue;
      hashes[key]=await digest(localStorage.getItem(key)||'');
    }
    return {entry:document.querySelector('script[type=module][src]')?.getAttribute('src'),hashes,notice:Boolean(document.querySelector('[aria-label="Game update available"]'))};
  });
}
