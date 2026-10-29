async page => {await page.goto('https://dinospace.netlify.app/?qa_pair7_patch='+Date.now()+'#/');await page.locator('button').first().waitFor({state:'visible',timeout:20000});return await (async page => {
  return page.evaluate(async () => {
    if (location.origin !== 'https://dinospace.netlify.app' || !window.__amariQaNamespaced) throw Error('Canonical synthetic profile required');
    const digest = async text => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))).map(n => n.toString(16).padStart(2, '0')).join('');
    const values = {}, hashes = {}, byteLengths = {}, prefix = 'qa_rewards_20261024_';
    for (const key of Object.keys(localStorage).sort()) {
      if (!key.startsWith(prefix)) continue;
      const logical = key.slice(prefix.length);
      if (!/progress|passport|reward|badge|sticker|favourite|digital_rehearsal|game_levels|writing_desk|memory_best|memory_resume|memory_completion|dino_detective|_points$|_games_played$/.test(logical)) continue;
      const raw = localStorage.getItem(key) || '';
      hashes[logical] = await digest(raw);
      byteLengths[logical] = new TextEncoder().encode(raw).byteLength;
      if (/^(?:amari|askia)_(?:little_progress|rewards_v2|earned_sticker_ids_v1|points|games_played)$/.test(logical) || logical === 'amari_amari_dino_detective_batch3_v1' || logical === 'amari_hangman_progress_v1:amari') values[logical] = raw;
    }
    const registration = await navigator.serviceWorker.getRegistration();
    return { at: new Date().toISOString(), origin: location.origin,
      entry: document.querySelector('script[type=module][src]')?.getAttribute('src'), values, hashes, byteLengths,
      worker: { script: registration?.active?.scriptURL, controller: navigator.serviceWorker.controller?.scriptURL, caches: await caches.keys() },
      notice: Boolean(document.querySelector('[aria-label="Game update available"]')),
      overflow: document.documentElement.scrollWidth > innerWidth };
  });
})(page);}
