async page => {
  return page.evaluate(async () => {
    if (location.origin !== 'https://dinospace.netlify.app' || !window.__amariQaNamespaced) throw Error('Canonical synthetic profile required');
    const digest = async text => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))).map(n => n.toString(16).padStart(2, '0')).join('');
    const values = {}, hashes = {}, byteLengths = {}, prefix = 'qa_rewards_20261024_';
    for (const key of Object.keys(localStorage).sort()) {
      if (!key.startsWith(prefix)) continue;
      const logical = key.slice(prefix.length);
      if (!/progress|passport|reward|badge|sticker|favourite|digital_rehearsal|game_levels|writing_desk|writing_samples|storybook|spelling|memory_best|memory_resume|memory_completion|dino_detective|_points$|_games_played$/.test(logical)) continue;
      const raw = localStorage.getItem(key) || '';
      hashes[logical] = await digest(raw);
      byteLengths[logical] = new TextEncoder().encode(raw).byteLength;
      if (/^(?:amari|askia)_(?:little_progress|rewards_v2|earned_sticker_ids_v1|points|games_played)$/.test(logical) || logical === 'amari_amari_dino_detective_batch3_v1' || logical === 'amari_hangman_progress_v1:amari') values[logical] = raw;
    }
    let idb = { exists: false };
    if ((await indexedDB.databases()).some(item => item.name === 'amari-storybooks')) {
      const db = await new Promise((resolve, reject) => { const request = indexedDB.open('amari-storybooks'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); request.onupgradeneeded = () => request.transaction.abort(); });
      try {
        const stores = {};
        for (const name of [...db.objectStoreNames]) {
          const rows = await new Promise((resolve, reject) => { const request = db.transaction(name, 'readonly').objectStore(name).getAll(); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
          const records = [];
          for (const row of rows) { const value = name === 'assets' ? { key: row.key, type: row.type, blobType: row.blob?.type, bytes: row.blob?.size } : row; records.push({ id: row.id || row.key, sha256: await digest(JSON.stringify(value)) }); }
          records.sort((a,b) => a.id.localeCompare(b.id)); stores[name] = { count: records.length, records };
        }
        idb = { exists: true, version: db.version, stores, scope: 'Book/profile/series metadata hashes and asset key/type/size hashes; no asset payload duplication.' };
      } finally { db.close(); }
    }
    const registration = await navigator.serviceWorker.getRegistration();
    return { idb, at: new Date().toISOString(), origin: location.origin,
      entry: document.querySelector('script[type=module][src]')?.getAttribute('src'), values, hashes, byteLengths,
      worker: { script: registration?.active?.scriptURL, controller: navigator.serviceWorker.controller?.scriptURL, caches: await caches.keys() },
      notice: Boolean(document.querySelector('[aria-label="Game update available"]')),
      overflow: document.documentElement.scrollWidth > innerWidth };
  });
}
