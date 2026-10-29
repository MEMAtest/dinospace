async page => {
  await page.goto('https://dinospace.netlify.app/#/');
  const chooser = page.getByRole('button', {name: /Age 6\+.*Amari/});
  await chooser.or(page.locator('.discovery-world-card').first()).first().waitFor();
  if (await chooser.count()) await chooser.click();
  await page.locator('.discovery-world-card').first().waitFor();
  await page.reload();
  await page.locator('.discovery-world-card').first().waitFor();
  return page.evaluate(async () => {
    if (!window.__amariQaNamespaced) throw new Error('Missing synthetic namespace');
    const digest = async text => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))).map(n => n.toString(16).padStart(2, '0')).join('');
    const hashes = {};
    for (const key of Object.keys(localStorage).sort()) {
      if (!key.startsWith('qa_rewards_20261024_')) continue;
      const logical = key.slice('qa_rewards_20261024_'.length);
      if (!/progress|passport|reward|badge|sticker|favourite|digital_rehearsal|game_levels|writing_desk|memory_best|memory_resume|memory_completion/.test(logical)) continue;
      hashes[key] = await digest(localStorage.getItem(key) || '');
    }
    const get = key => JSON.parse(localStorage.getItem(key) || 'null');
    const players = {};
    for (const id of ['askia', 'amari']) {
      const progress = get(`${id}_little_progress`);
      players[id] = {rewards: get(`${id}_rewards_v2`), legacyStickerIds: get(`${id}_earned_sticker_ids_v1`), fire: progress?.firerescue, ladder: progress?.ladder};
    }
    for (const id of ['askia', 'amari']) {
      const progress = get(`${id}_little_progress`) || {};
      players[id].protectedGameRows = {};
      for (const [game, value] of Object.entries(progress)) {
        if (!['firerescue', 'ladder'].includes(game)) players[id].protectedGameRows[game] = await digest(JSON.stringify(value));
      }
    }
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return {at: new Date().toISOString(), entry: document.querySelector('script[type=module][src]')?.getAttribute('src'), hashes, players,
      worker: {script: registration.active?.scriptURL, caches: await caches.keys(), controller: navigator.serviceWorker.controller?.scriptURL},
      notice: Boolean(document.querySelector('[aria-label="Game update available"]')), overflow: document.documentElement.scrollWidth > innerWidth};
  });
}
