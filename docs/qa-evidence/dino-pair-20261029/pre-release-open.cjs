async page => { await page.goto('https://dinospace.netlify.app/?qa_pair7_cutover='+Date.now()+'#/'); await page.locator('button').first().waitFor({state:'visible',timeout:20000}); return await (async page => {
  return page.evaluate(async () => {
    if (location.origin !== 'https://dinospace.netlify.app' || !window.__amariQaNamespaced) throw Error('Canonical synthetic profile required');
    const digest = async text => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))).map(n => n.toString(16).padStart(2, '0')).join('');
    const values = {}, hashes = {}, prefix = 'qa_rewards_20261024_';
    for (const key of Object.keys(localStorage).sort()) {
      if (!key.startsWith(prefix)) continue;
      const logical = key.slice(prefix.length);
      if (!/progress|passport|reward|badge|sticker|favourite|digital_rehearsal|game_levels|writing_desk|memory_best|memory_resume|memory_completion|_points$|_games_played$/.test(logical)) continue;
      values[logical] = localStorage.getItem(key);
      hashes[logical] = await digest(values[logical] || '');
    }
    const registration = await navigator.serviceWorker.getRegistration();
    return { at: new Date().toISOString(), origin: location.origin,
      entry: document.querySelector('script[type=module][src]')?.getAttribute('src'), values, hashes,
      worker: { script: registration?.active?.scriptURL, controller: navigator.serviceWorker.controller?.scriptURL, caches: await caches.keys() },
      notice: Boolean(document.querySelector('[aria-label="Game update available"]')),
      overflow: document.documentElement.scrollWidth > innerWidth };
  });
})(page); }
