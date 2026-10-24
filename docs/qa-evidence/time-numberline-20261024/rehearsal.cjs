async page => {
  const origin = QA_ORIGIN, width = VIEW_WIDTH;
  const rows = [], errors = [], consoleErrors = [], providers = [], badAssets = [];
  page.setDefaultTimeout(15000); page.setDefaultNavigationTimeout(45000);
  await page.setViewportSize({ width, height: 900 });
  await page.unroute('**/api/**');
  await page.route('**/api/**', r => { providers.push(r.request().url()); return r.fulfill({ status: 403, body: 'Synthetic clock/line rehearsal guard' }); });
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400 && /\/(art|audio)\//.test(r.url())) badAssets.push({ url: r.url(), status: r.status() }); });
  await page.addInitScript(() => {
    if (window.__timeLineAudioInstalled) return;
    window.__timeLineAudioInstalled = true; window.__timeLineAudio = [];
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...args) {
      const row = { src: this.src, playing: false, element: this };
      this.addEventListener('playing', () => row.playing = true, { once: true }); window.__timeLineAudio.push(row);
      return play.apply(this, args);
    };
  });
  const root = origin + '/?time-line-qa=' + Date.now();
  await page.goto(root + '#/'); await page.getByRole('button', { name: /Age 6\+.*Amari/ }).click();
  const saved = game => page.evaluate(g => JSON.parse(localStorage.getItem('amari_' + g + '_progress_v1') || 'null'), game);
  const layout = async () => {
    const state = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, badImages: [...document.images].filter(i => i.complete && !i.naturalWidth).map(i => i.src), scrollPanels: [...document.querySelectorAll('main figure')].map(e => ({ w: e.clientWidth, content: e.scrollWidth })) }));
    if (state.overflow || state.badImages.length || state.scrollPanels.some(e => e.content > e.w + 2)) throw Error('Layout/assets ' + JSON.stringify(state));
    return state;
  };
  const replayAudio = async () => {
    const n = await page.evaluate(() => window.__timeLineAudio.length);
    await page.getByRole('button', { name: 'Hear explanation', exact: true }).click();
    await page.waitForFunction(n => window.__timeLineAudio.slice(n).some(r => r.playing && r.element.currentTime > .15), n);
    return page.evaluate(n => window.__timeLineAudio.slice(n).filter(r => r.playing).map(r => ({ src: r.src, time: r.element.currentTime })), n);
  };
  const touch = async (locator, xFraction = .5, yFraction = .5, swipe = 0) => {
    await locator.scrollIntoViewIfNeeded(); const b = await locator.boundingBox();
    const x = b.x + b.width * xFraction, y = b.y + b.height * yFraction;
    const c = await page.context().newCDPSession(page);
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
    await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
    if (swipe) await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + swipe, y, id: 1 }] });
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: false }); await c.detach();
  };
  const click = async (locator, keyboard = false) => { if (keyboard) { await locator.focus(); await page.keyboard.press('Enter'); } else await locator.click(); };
  const label = (hour, minute) => minute === 0 ? `${hour} o’clock` : minute === 30 ? `half past ${hour}` : minute === 15 ? `quarter past ${hour}` : `quarter to ${hour % 12 + 1}`;
  const parseSet = text => { const h = Number(text.match(/(?:to|past) (\d+)| (\d+) o’clock/).slice(1).find(Boolean)); return { hour: text.includes('quarter to') ? (h + 10) % 12 + 1 : h, minute: text.includes('half past') ? 30 : text.includes('quarter past') ? 15 : text.includes('quarter to') ? 45 : 0 }; };
  const enter = async game => { await page.goto(root + '#/world/maths'); await page.getByRole('heading', { name: 'Maths Missions', exact: true }).waitFor(); const title = game === 'timeteller' ? 'Time Teller' : 'Number Line Jump'; await page.getByRole('button').filter({ has: page.getByRole('heading', { name: title, exact: true }) }).click(); await page.getByRole('button', { name: /^Start / }).waitFor(); };
  const gameTitles = { timeteller: ['Clock Explorers', 'Past and To', 'Daily Routines'], numberline: ['Forward and Back', 'Missing Numbers', 'Compare Values and Distances'] };
  const persisted = {}, replay = [];
  for (const game of ['timeteller', 'numberline']) {
    await enter(game);
    const beforeRewards = await page.evaluate(() => localStorage.getItem('amari_rewards_v2'));
    if (game === 'timeteller') {
      await page.getByRole('button', { name: 'Try moving the clock hands', exact: true }).click();
      const practice = page.getByRole('img', { name: 'Practice clock', exact: true });
      await touch(practice, .9, .5); // Minute hand from00 to15.
      if (!(await page.locator('main').innerText()).includes('Set time: 3:15')) throw Error('Touch minute setting failed');
      await page.getByRole('button', { name: 'Short · hour', exact: true }).click();
      await touch(practice, .5, .1);
      if (!(await page.locator('main').innerText()).includes('Set time: 12:15')) throw Error('Touch hour setting failed');
      await click(page.getByRole('button', { name: 'Minute hand back 15 minutes', exact: true }), true);
      await click(page.getByRole('button', { name: 'Minute hand back 15 minutes', exact: true }), true);
      if (!(await page.locator('main').innerText()).includes('Set time: 11:45')) throw Error('Minute carry wrap failed');
      await page.getByRole('button', { name: 'Close clock practice', exact: true }).click();
      if (beforeRewards !== await page.evaluate(() => localStorage.getItem('amari_rewards_v2'))) throw Error('Practice granted rewards');
    }
    for (let chapter = 0; chapter < 3; chapter++) {
      const chapterTitle = gameTitles[game][chapter];
      await page.getByRole('button', { name: new RegExp('^(Chapter|World) ' + (chapter + 1)) }).click();
      await page.getByRole('button', { name: 'Start ' + chapterTitle + ' →', exact: true }).click();
      const seen = new Set(); const types = new Set(); let reloadedBeforeFinish = false;
      for (let round = 0; round < 6; round++) {
        await page.locator('main[data-mission-type]').waitFor(); const type = await page.locator('main').getAttribute('data-mission-type');
        const prompt = await page.getByRole('heading', { level: 2 }).innerText(); types.add(type);
        const id = game === 'timeteller' && type === 'read' ? (await page.locator('svg[data-hour-angle]').getAttribute('data-hour-angle')) + ':' + (await page.locator('svg[data-hour-angle]').getAttribute('data-minute-angle')) : prompt;
        if (seen.has(id)) throw Error('Repeated mission in run'); seen.add(id);
        let answer, model = {};
        if (game === 'timeteller') {
          let time;
          if (type === 'read') {
            const clock = page.locator('svg[data-hour-angle]');
            const ha = Number(await clock.getAttribute('data-hour-angle')), ma = Number(await clock.getAttribute('data-minute-angle'));
            time = { hour: Math.floor(ha / 30) || 12, minute: Math.round(ma / 6) }; answer = label(time.hour, time.minute);
            const choices = page.getByRole('group', { name: 'Choose the time' }).getByRole('button');
            if (round === 0) await choices.filter({ hasNotText: answer }).first().click();
            if (round === 0) { await page.getByRole('button', { name: 'Use one hint', exact: true }).click(); if (await page.getByRole('button', { name: 'Hint used', exact: true }).isEnabled()) throw Error('Clue reusable'); }
            await click(page.getByRole('button', { name: answer, exact: true }), round === 1);
          } else {
            time = parseSet(prompt); answer = label(time.hour, time.minute);
            for (let i = 0; i < time.minute / 15; i++) await page.getByRole('button', { name: 'Minute hand forward 15 minutes', exact: true }).click();
            for (let i = 0; i < time.hour % 12; i++) await click(page.getByRole('button', { name: 'Hour later', exact: true }), true);
            const expected = `${time.hour}:${String(time.minute).padStart(2, '0')}`;
            if (!(await page.locator('main').innerText()).includes('Set time: ' + expected)) throw Error('Clock setting text mismatch');
            const ha = Number(await page.locator('svg[data-hour-angle]').getAttribute('data-hour-angle'));
            if (ha !== time.hour % 12 * 30 + time.minute * .5) throw Error('Clock hand model mismatch');
            await page.getByRole('button', { name: 'Check clock', exact: true }).click();
          }
          model = time;
        } else if (type === 'hop') {
          const [, aText, bText, direction] = prompt.match(/Start at (\d+)\. Hop (\d+) (forward|back)/); const a = Number(aText), b = Number(bText), dir = direction === 'forward' ? 1 : -1; answer = a + dir * b;
          const correct = page.getByRole('button', { name: dir > 0 ? 'Hop forward →' : '← Hop back', exact: true });
          const wrong = page.getByRole('button', { name: dir > 0 ? '← Hop back' : 'Hop forward →', exact: true });
          if (round === 0 && await wrong.isEnabled()) { await wrong.click(); if (await page.locator('[data-hop-arc]').count()) throw Error('Wrong direction moved frog'); }
          for (let i = 0; i < b; i++) {
            if (i === 0 && round === 1) { const frog = page.locator('figure .cursor-grab'); await touch(frog, .5, .5, dir * 24); }
            else if (i === 0 && round === 0) { await correct.focus(); await page.keyboard.press(dir > 0 ? 'ArrowRight' : 'ArrowLeft'); }
            else await correct.click();
          }
          const arcs = await page.locator('[data-hop-arc]').count(); if (arcs !== b) throw Error('Hops and drawn arcs disagree ' + arcs + '/' + b); model = { start: a, hops: b, dir, arcs };
        } else {
          if (type === 'missing') {
            const eq = prompt.split('.')[0]; const [left, end] = eq.split('='); const [start, hops] = left.split('+').map(s => s.trim()); answer = start === '?' ? Number(end) - Number(hops) : hops === '?' ? Number(end) - Number(start) : Number(start) + Number(hops);
            const captions = await page.locator('figcaption').innerText(); if (!prompt.includes('?. Where') && start === '?' && /Start:/.test(captions)) throw Error('Unknown start leaked'); if (end.trim() === '?' && /Land:/.test(captions)) throw Error('Unknown landing leaked');
          } else {
            const [, a, b, c, d] = prompt.match(/A \((\d+) to (\d+)\).*B \((\d+) to (\d+)\)/).map(Number); const vA = prompt.includes('farther') ? b - a : b, vB = prompt.includes('farther') ? d - c : d; answer = vA === vB ? 'Same' : vA > vB ? 'Frog A' : 'Frog B'; model = { a, b, c, d, comparison: prompt.includes('farther') ? 'distance' : 'landing' };
            if (await page.locator('figure').count() !== 2) throw Error('Comparison lacks two separate journeys');
          }
          const choices = page.getByRole('group', { name: 'Choose the answer', exact: true }).getByRole('button');
          if (round === 0) { await choices.filter({ hasNotText: new RegExp('^' + answer + '$') }).first().click(); await page.getByRole('button', { name: 'Use one hint', exact: true }).click(); }
          await click(page.getByRole('button', { name: String(answer), exact: true }), round === 1);
        }
        const next = page.getByRole('button', { name: round === 5 ? (game === 'timeteller' ? 'Finish chapter →' : 'Finish world →') : 'Next mission →', exact: true }); await next.waitFor();
        const explanation = await page.getByRole('region', { name: 'Worked answer', exact: true }).innerText();
        const audio = round === 0 || type === 'set' ? await replayAudio() : [];
        if (round === 0) { await page.waitForTimeout(1700); if (!await next.isVisible()) throw Error('Worked answer advanced itself'); }
        const geometry = await layout();
        if (round === 0 && chapter === 0) await page.screenshot({ path: 'output/playwright/time-numberline-' + game + '-' + width + '.jpg', type: 'jpeg', quality: 80, fullPage: true });
        if (round === 5) { const p = await saved(game); if (!p?.completedChapterIds.includes(chapter === 0 ? game === 'timeteller' ? 'clock-explorers' : 'forward-back' : chapter === 1 ? game === 'timeteller' ? 'past-and-to' : 'missing-numbers' : game === 'timeteller' ? 'daily-routines' : 'compare-distances')) throw Error('Final answer not saved before Finish'); }
        rows.push({ signature: id, game, chapter: chapter + 1, round: round + 1, type, prompt, answer, model, explanation, audio, geometry });
        if (round === 5 && chapter === 0) {
          const earned = await saved(game), reward = await page.evaluate(() => localStorage.getItem('amari_rewards_v2'));
          await page.reload(); await page.getByRole('button', { name: /^Start / }).waitFor();
          if (JSON.stringify(earned) !== JSON.stringify(await saved(game)) || reward !== await page.evaluate(() => localStorage.getItem('amari_rewards_v2'))) throw Error('Reload before Finish lost earned records');
          reloadedBeforeFinish = true;
        } else await next.click();
      }
      if (chapter === 2 && game === 'timeteller' && !types.has('set')) throw Error('No setting mission');
      if (!reloadedBeforeFinish) await page.getByRole('button', { name: game === 'timeteller' ? 'Choose next chapter →' : 'Choose next world →', exact: true }).click();
    }
    const progress = await saved(game); if (progress.completedChapterIds.length !== 3 || progress.unlockedChapter !== 2) throw Error('Full progress missing');
    const beforeReload = JSON.stringify(progress); await page.reload(); await page.getByRole('button', { name: /^Start / }).waitFor(); if (JSON.stringify(await saved(game)) !== beforeReload) throw Error('Reload lost earned record');
    const rewardBeforeReplay = await page.evaluate(() => localStorage.getItem('amari_rewards_v2'));
    await page.getByRole('button', { name: /^(Chapter|World) 1/ }).click();
    await page.getByRole('button', { name: 'Start ' + gameTitles[game][0] + ' →', exact: true }).click();
    for (let round = 0; round < 6; round++) {
      const prompt = await page.getByRole('heading', { level: 2 }).innerText(); let signature;
      if (game === 'timeteller') {
        const clock = page.locator('svg[data-hour-angle]'); const ha = Number(await clock.getAttribute('data-hour-angle')), ma = Number(await clock.getAttribute('data-minute-angle'));
        signature = ha + ':' + ma; await page.getByRole('button', { name: label(Math.floor(ha / 30) || 12, Math.round(ma / 6)), exact: true }).click();
      } else {
        signature = prompt; const [, , b, direction] = prompt.match(/Start at (\d+)\. Hop (\d+) (forward|back)/);
        for (let i = 0; i < Number(b); i++) await page.getByRole('button', { name: direction === 'forward' ? 'Hop forward →' : '← Hop back', exact: true }).click();
      }
      if (rows.some(r => r.game === game && r.chapter === 1 && r.signature === signature)) throw Error('Replay repeated the previous run');
      await page.getByRole('button', { name: round === 5 ? game === 'timeteller' ? 'Finish chapter →' : 'Finish world →' : 'Next mission →', exact: true }).click(); replay.push({ game, round: round + 1, signature });
    }
    await page.getByRole('button', { name: game === 'timeteller' ? 'Choose next chapter →' : 'Choose next world →', exact: true }).click();
    const afterReplay = await saved(game);
    if (afterReplay.unlockedChapter !== 2 || afterReplay.completedChapterIds.length !== 3 || Object.entries(progress.bestStars).some(([id, stars]) => afterReplay.bestStars[id] < stars)) throw Error('Replay regressed earned progress');
    // A replay can improve a best star but cannot pay the same stars twice.
    if (JSON.stringify(afterReplay.bestStars) === JSON.stringify(progress.bestStars) && rewardBeforeReplay !== await page.evaluate(() => localStorage.getItem('amari_rewards_v2'))) throw Error('Replay paid duplicate rewards');
    if (await page.getByRole('button', { name: /^(Chapter|World) 3/ }).getAttribute('aria-pressed') !== 'true') throw Error('Replay regressed resume choice');
    persisted[game] = afterReplay;
    await page.getByRole('button', { name: /Back/ }).filter({ has: page.locator('svg') }).first().click(); await page.getByRole('heading', { name: 'Maths Missions', exact: true }).waitFor();
  }
  if (errors.length || consoleErrors.length || providers.length || badAssets.length) throw Error(JSON.stringify({ errors, consoleErrors, providers, badAssets }));
  return { origin, width, rows, persisted, replay, resetLedgers: false, errors, consoleErrors, providers, badAssets, parentWorldReturn: true, savedBeforeFinish: true, progressRetainedAfterReload: true };
}
