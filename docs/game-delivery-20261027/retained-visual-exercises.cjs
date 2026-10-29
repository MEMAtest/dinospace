// Visible-control recipes for the retained tracing, board, picture, shape,
// phonics, mixing, and shadow lanes. These recipes only read rendered text,
// accessible labels, and displayed geometry/art. They never inspect React state
// or write saved progress.
const TRACE_GUIDES = Object.freeze({"A":[[[0.22,0.86],[0.5,0.12],[0.78,0.86]],[[0.34,0.58],[0.66,0.58]]],"B":[[[0.28,0.12],[0.28,0.88]],[[0.28,0.12],[0.58,0.12],[0.72,0.23],[0.72,0.38],[0.58,0.5],[0.28,0.5]],[[0.28,0.5],[0.6,0.5],[0.76,0.62],[0.76,0.78],[0.6,0.88],[0.28,0.88]]],"C":[[[0.76,0.2],[0.62,0.12],[0.4,0.12],[0.24,0.26],[0.2,0.5],[0.24,0.74],[0.4,0.88],[0.62,0.88],[0.76,0.8]]],"D":[[[0.28,0.12],[0.28,0.88]],[[0.28,0.12],[0.56,0.12],[0.74,0.26],[0.78,0.5],[0.74,0.74],[0.56,0.88],[0.28,0.88]]],"E":[[[0.74,0.12],[0.28,0.12],[0.28,0.88],[0.76,0.88]],[[0.28,0.5],[0.64,0.5]]],"F":[[[0.72,0.12],[0.28,0.12],[0.28,0.88]],[[0.28,0.5],[0.62,0.5]]],"G":[[[0.76,0.23],[0.62,0.12],[0.4,0.12],[0.24,0.26],[0.2,0.5],[0.24,0.74],[0.4,0.88],[0.64,0.88],[0.78,0.72],[0.78,0.56],[0.52,0.56]]],"H":[[[0.25,0.12],[0.25,0.88]],[[0.75,0.12],[0.75,0.88]],[[0.25,0.5],[0.75,0.5]]],"I":[[[0.25,0.12],[0.75,0.12]],[[0.5,0.12],[0.5,0.88]],[[0.25,0.88],[0.75,0.88]]],"J":[[[0.72,0.12],[0.72,0.7],[0.64,0.84],[0.48,0.88],[0.32,0.84],[0.24,0.72]],[[0.25,0.12],[0.78,0.12]]],"K":[[[0.28,0.12],[0.28,0.88]],[[0.72,0.12],[0.28,0.5],[0.76,0.88]]],"L":[[[0.28,0.12],[0.28,0.88],[0.76,0.88]]],"M":[[[0.2,0.88],[0.2,0.12],[0.5,0.58],[0.8,0.12],[0.8,0.88]]],"N":[[[0.24,0.88],[0.24,0.12],[0.76,0.88],[0.76,0.12]]],"O":[[[0.5,0.12],[0.3,0.16],[0.2,0.34],[0.2,0.66],[0.3,0.84],[0.5,0.88],[0.7,0.84],[0.8,0.66],[0.8,0.34],[0.7,0.16],[0.5,0.12]]],"P":[[[0.28,0.88],[0.28,0.12]],[[0.28,0.12],[0.58,0.12],[0.74,0.24],[0.74,0.4],[0.58,0.52],[0.28,0.52]]],"Q":[[[0.5,0.12],[0.3,0.16],[0.2,0.34],[0.2,0.66],[0.3,0.84],[0.5,0.88],[0.7,0.84],[0.8,0.66],[0.8,0.34],[0.7,0.16],[0.5,0.12]],[[0.58,0.66],[0.8,0.9]]],"R":[[[0.28,0.88],[0.28,0.12]],[[0.28,0.12],[0.58,0.12],[0.74,0.24],[0.74,0.4],[0.58,0.52],[0.28,0.52]],[[0.52,0.52],[0.78,0.88]]],"S":[[[0.74,0.2],[0.62,0.12],[0.4,0.12],[0.24,0.24],[0.24,0.4],[0.4,0.5],[0.62,0.5],[0.76,0.62],[0.76,0.78],[0.6,0.88],[0.38,0.88],[0.24,0.78]]],"T":[[[0.2,0.12],[0.8,0.12]],[[0.5,0.12],[0.5,0.88]]],"U":[[[0.24,0.12],[0.24,0.68],[0.34,0.84],[0.5,0.88],[0.66,0.84],[0.76,0.68],[0.76,0.12]]],"V":[[[0.2,0.12],[0.5,0.88],[0.8,0.12]]],"W":[[[0.16,0.12],[0.34,0.88],[0.5,0.5],[0.66,0.88],[0.84,0.12]]],"X":[[[0.22,0.12],[0.78,0.88]],[[0.78,0.12],[0.22,0.88]]],"Y":[[[0.2,0.12],[0.5,0.5],[0.8,0.12]],[[0.5,0.5],[0.5,0.88]]],"Z":[[[0.22,0.12],[0.78,0.12],[0.22,0.88],[0.78,0.88]]],"a":[[[0.68,0.48],[0.56,0.38],[0.4,0.4],[0.3,0.54],[0.3,0.7],[0.4,0.82],[0.56,0.82],[0.68,0.7],[0.68,0.38]],[[0.68,0.38],[0.68,0.86]]],"b":[[[0.3,0.12],[0.3,0.86]],[[0.3,0.54],[0.42,0.4],[0.58,0.4],[0.7,0.54],[0.7,0.7],[0.58,0.82],[0.42,0.82],[0.3,0.74]]],"c":[[[0.7,0.48],[0.58,0.4],[0.42,0.4],[0.3,0.54],[0.3,0.7],[0.42,0.82],[0.58,0.82],[0.7,0.74]]],"d":[[[0.68,0.38],[0.56,0.4],[0.4,0.4],[0.3,0.54],[0.3,0.7],[0.4,0.82],[0.56,0.82],[0.68,0.7],[0.68,0.12]]],"e":[[[0.3,0.62],[0.7,0.62],[0.66,0.48],[0.54,0.4],[0.4,0.4],[0.3,0.54],[0.3,0.7],[0.42,0.82],[0.6,0.82],[0.7,0.74]]],"f":[[[0.62,0.24],[0.52,0.14],[0.4,0.2],[0.4,0.86]],[[0.26,0.42],[0.62,0.42]]],"g":[[[0.68,0.48],[0.56,0.4],[0.4,0.4],[0.3,0.54],[0.3,0.7],[0.4,0.82],[0.56,0.82],[0.68,0.7],[0.68,0.4]],[[0.68,0.68],[0.68,0.9],[0.56,0.98],[0.4,0.96],[0.32,0.88]]],"h":[[[0.3,0.88],[0.3,0.12]],[[0.3,0.54],[0.42,0.4],[0.58,0.4],[0.68,0.52],[0.68,0.88]]],"i":[[[0.5,0.4],[0.5,0.86]],[[0.5,0.2],[0.5,0.2]]],"j":[[[0.58,0.4],[0.58,0.88],[0.48,0.98],[0.34,0.94]],[[0.58,0.2],[0.58,0.2]]],"k":[[[0.3,0.88],[0.3,0.12]],[[0.7,0.4],[0.3,0.62]],[[0.5,0.54],[0.72,0.88]]],"l":[[[0.5,0.12],[0.5,0.88]]],"m":[[[0.22,0.86],[0.22,0.4]],[[0.22,0.54],[0.34,0.4],[0.46,0.4],[0.54,0.54],[0.54,0.86]],[[0.54,0.54],[0.66,0.4],[0.78,0.4],[0.84,0.54],[0.84,0.86]]],"n":[[[0.28,0.86],[0.28,0.4]],[[0.28,0.54],[0.4,0.4],[0.56,0.4],[0.68,0.54],[0.68,0.86]]],"o":[[[0.5,0.4],[0.36,0.42],[0.28,0.56],[0.3,0.72],[0.42,0.82],[0.58,0.82],[0.7,0.7],[0.7,0.54],[0.6,0.42],[0.5,0.4]]],"p":[[[0.3,0.98],[0.3,0.4]],[[0.3,0.54],[0.42,0.4],[0.58,0.4],[0.7,0.54],[0.7,0.7],[0.58,0.82],[0.42,0.82],[0.3,0.7]]],"q":[[[0.68,0.4],[0.56,0.4],[0.4,0.4],[0.3,0.54],[0.3,0.7],[0.4,0.82],[0.56,0.82],[0.68,0.7],[0.68,0.4]],[[0.68,0.7],[0.68,0.98]]],"r":[[[0.3,0.86],[0.3,0.4]],[[0.3,0.54],[0.42,0.4],[0.58,0.4]]],"s":[[[0.68,0.48],[0.58,0.4],[0.42,0.4],[0.3,0.5],[0.34,0.62],[0.56,0.66],[0.68,0.74],[0.58,0.82],[0.4,0.82],[0.3,0.74]]],"t":[[[0.5,0.2],[0.5,0.78],[0.58,0.84],[0.68,0.8]],[[0.3,0.42],[0.68,0.42]]],"u":[[[0.3,0.4],[0.3,0.7],[0.4,0.82],[0.56,0.82],[0.68,0.7],[0.68,0.4]],[[0.68,0.7],[0.68,0.86]]],"v":[[[0.28,0.4],[0.5,0.86],[0.72,0.4]]],"w":[[[0.2,0.4],[0.34,0.86],[0.5,0.58],[0.66,0.86],[0.8,0.4]]],"x":[[[0.28,0.4],[0.7,0.86]],[[0.7,0.4],[0.28,0.86]]],"y":[[[0.28,0.4],[0.5,0.7],[0.72,0.4]],[[0.5,0.7],[0.5,0.96],[0.4,0.99],[0.3,0.94]]],"z":[[[0.28,0.4],[0.72,0.4],[0.28,0.86],[0.72,0.86]]]});

const button = (page, name, exact = true) => page.getByRole('button', { name, exact });
const audioCheck = async (page, helper, locator, label) => helper.observePackagedPlayback(locator, label);
const storageDelta = async (helper, before, lane, allowedKeys = []) => helper.assertStorageChanges(before, await helper.snapshotStorage(), {
  allowedKeys: [...lane.allowedKeys, ...allowedKeys],
});
const result = (taskIdentity, heldText, nextGeometry, audio, storage, extra = {}) => ({
  taskIdentity, wrongRetryRetained: true, transition: 'held', heldExplanation: heldText,
  heldNextGeometry: nextGeometry, audio, storage, ...extra,
});

async function trace({ page, helper, lane }) {
  let start = button(page, /Start .*→/, false);
  const visibleStartLabel = (await start.innerText()).trim();
  if (visibleStartLabel !== 'Start Follow the path →') {
    await helper.clickControl(page.locator('summary').filter({hasText:'Choose another chapter'}), { label: 'Open the Letter Trace chapter picker' });
    const chapters = page.getByRole('group', { name: 'Other trace chapters' });
    await helper.clickControl(chapters.getByRole('button', { name: 'Follow the path', exact: true }), { label: 'Choose the first visible Letter Trace chapter' });
    start = button(page, 'Start Follow the path →');
  }
  await helper.clickControl(start, { label: 'Start visible Letter Trace chapter' });
  const canvas = page.locator('main[data-trace-letter] canvas');
  await canvas.waitFor({ state: 'visible' });
  const letter = await page.locator('main[data-trace-letter]').getAttribute('data-trace-letter');
  if (!TRACE_GUIDES[letter]) throw new Error(`No authored trace route for visible letter ${letter}`);
  const before = await helper.snapshotStorage();
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Visible Letter Trace canvas has no geometry');
  const scale = Math.min(box.width, box.height) * .86;
  const left = (box.width - scale) / 2;
  const top = (box.height - scale) / 2 + 8;
  const paths = TRACE_GUIDES[letter].map(stroke => stroke.map(([x, y]) => ({
    x: box.x + left + x * scale, y: box.y + top + y * scale,
  })));
  // Off-guide touch is a real rejected attempt. Retry the same letter along the
  // authored, visibly drawn dots and arrows.
  await page.mouse.click(box.x + 4, box.y + 4);
  if (await page.locator('main[data-trace-letter]').getAttribute('data-trace-letter') !== letter
      || await page.getByRole('progressbar', { name: 'Letter path progress' }).getAttribute('aria-valuenow') !== '0') {
    throw new Error('Off-guide Letter Trace attempt did not retain the same untouched letter');
  }
  for (const points of paths) {
    await page.mouse.move(points[0].x, points[0].y);
    await page.mouse.down();
    let previous = points[0];
    for (const point of points.slice(1)) {
      const distance = Math.hypot(point.x - previous.x, point.y - previous.y);
      await page.mouse.move(point.x, point.y, { steps: Math.max(1, Math.ceil(distance / 4)) });
      previous = point;
    }
    await page.mouse.up();
  }
  const check = button(page, 'Check shape');
  await helper.clickControl(check, { label: 'Check traced letter' });
  const held = page.getByRole('region', { name: 'Completed letter' });
  await held.waitFor({ state: 'visible' });
  const explain = button(page, 'Hear explanation');
  const audio = await audioCheck(page, helper, explain, 'Letter Trace explanation replay');
  const next = button(page, 'Next letter →');
  const nextGeometry = await helper.measureControl(next, 'Letter Trace Next letter');
  const text = await held.innerText();
  await helper.clickControl(next, { label: 'Advance to next Letter Trace letter' });
  const after = await page.locator('main[data-trace-letter]').getAttribute('data-trace-letter');
  if (!after || after === letter) throw new Error('Letter Trace Next did not advance the visible letter');
  return result(`Trace letter ${letter}`, text, nextGeometry, audio, await storageDelta(helper, before, lane), { advancedTo: after });
}

async function tictactoe({ page, helper, lane }) {
  const chapter = button(page, /^Make a line,/, false);
  await helper.clickControl(chapter, { label: 'Select visible Make a line tactic' });
  const board = page.getByRole('grid', { name: 'Cosmic three by three board' });
  await board.waitFor({ state: 'visible' });
  const cells = page.getByRole('gridcell');
  const marks = () => cells.evaluateAll(es => es.map(e => {
    const label = e.getAttribute('aria-label') || '';
    return label.includes(', Dino') ? 'X' : label.includes(', Rocket') ? 'O' : null;
  }));
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const threatens = (state, mark) => state.flatMap((value, index) => {
    if (value) return [];
    const copy = [...state]; copy[index] = mark;
    return lines.some(line => line.every(i => copy[i] === mark)) ? [index] : [];
  });
  const state = await marks();
  const targets = threatens(state, 'X');
  if (!targets.length) throw new Error(`Visible tactic board has no immediate winning line: ${state}`);
  const target = targets[0], wrong = state.findIndex((value, i) => !value && !targets.includes(i));
  if (wrong < 0) throw new Error('No visible legal non-goal square for wrong-attempt retry');
  const before = await helper.snapshotStorage();
  const identity = `Visible tactic board ${state.map(x => x || 'empty').join(', ')}`;
  await helper.clickControl(cells.nth(wrong), { label: 'Try a non-winning empty tactic square' });
  if (JSON.stringify(await marks()) !== JSON.stringify(state)) throw new Error('Non-winning Tactic move changed the board');
  await button(page, 'Show hint').click();
  const clueCell = page.getByRole('gridcell', {name:/, hint/});
  if (await clueCell.count()!==1) throw new Error('Hint did not mark one visible square');
  const hintedIndex=Number((await clueCell.getAttribute('aria-label')).match(/square (\d+)/)?.[1])-1;
  if (!targets.includes(hintedIndex)) throw new Error('Hinted square is not a visible winning move');
  await helper.clickControl(clueCell, { label: 'Play the hinted winning tactic square' });
  const held = page.getByRole('region', { name: 'Tactic explained' }); await held.waitFor({ state: 'visible' });
  const audio = await audioCheck(page, helper, button(page, 'Hear explanation'), 'Tactic explanation replay');
  const next = button(page, 'Next tactic board →');
  const nextGeometry = await helper.measureControl(next, 'Next tactic board');
  const text = await held.innerText();
  await helper.clickControl(next, { label: 'Advance to next tactic board' });
  await board.waitFor({ state: 'visible' });
  return result(identity, text, nextGeometry, audio, await storageDelta(helper, before, lane));
}

async function puzzle({ page, helper, lane }) {
  const chapters = page.locator('[aria-label="Puzzle Pop chapters"]');
  await helper.clickControl(chapters.getByRole('button').first(), { label: 'Choose the first visible Puzzle Pop chapter' });
  const start = button(page, /^(Start|Replay) chapter$/, false);
  await helper.clickControl(start, { label: 'Start visible Puzzle Pop chapter' });
  const board = page.getByRole('grid', { name: /\d by \d puzzle board/ }); await board.waitFor();
  const before = await helper.snapshotStorage();
  const title = await page.locator('aside h2').innerText();
  const identity = `Picture puzzle: ${title}`;
  let didWrong = false;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const piece = page.getByRole('button', { name: /^Choose loose piece / }).first();
    if (await piece.count() === 0) break;
    // Hint explicitly selects the next piece and lights its destination. That
    // visible relationship is the model used to solve this bounded first scene.
    await helper.clickControl(button(page, /^(Hint|Show a piece mapping)$/ , false), { label: 'Reveal one visible piece-to-space mapping' });
    const dest = page.getByRole('button', { name: /, hint space$/ }).first();
    if (await dest.count() !== 1) throw new Error('Puzzle hint did not expose exactly one highlighted target space');
    if (!didWrong) {
      const destinationLabel = await dest.getAttribute('aria-label');
      const destinationNumber = Number(/Puzzle space (\d+)/.exec(destinationLabel)?.[1]);
      const emptySpaces = page.getByRole('button', { name: /Puzzle space \d+, empty/ });
      const wrongLabel = (await emptySpaces.evaluateAll(es=>es.map(e=>e.getAttribute('aria-label')))).find(label=>Number(label.match(/Puzzle space (\d+)/)?.[1])!==destinationNumber);
      const empty = page.getByRole('button', {name:wrongLabel,exact:true});
      if (await empty.count() !== 1) throw new Error('No wrong empty puzzle slot available');
      const looseBefore = await page.getByRole('button', { name: /^Choose loose piece / }).count();
      await helper.clickControl(empty, { label: 'Attempt a wrong empty picture slot' });
      const looseAfter = await page.getByRole('button', { name: /^Choose loose piece / }).count();
      if (!await dest.isVisible() || looseAfter !== looseBefore || await page.locator('aside h2').innerText() !== title) throw new Error('Wrong puzzle placement did not retain the same scene and piece for retry');
      didWrong = true;
    }
    if (!await page.getByRole('button', { name: /^Choose loose piece / }).evaluateAll(es => es.some(e => e.getAttribute('aria-pressed') === 'true'))) {
      await helper.clickControl(piece, { label: 'Select hinted loose picture piece' });
    }
    await helper.clickControl(dest, { label: 'Place picture piece in highlighted slot' });
    if (await page.getByRole('heading', { name: /complete!$/ }).count()) break;
  }
  const held = page.getByRole('region').filter({ has: page.getByText('Picture fact:', { exact: false }) }).first();
  await held.waitFor({ state: 'visible', timeout: 15000 });
  const audio = await audioCheck(page, helper, button(page, 'Hear fact again'), 'Puzzle picture fact replay');
  const next = button(page, 'Next picture');
  const nextGeometry = await helper.measureControl(next, 'Next puzzle picture');
  const text = await held.innerText();
  await helper.clickControl(next, { label: 'Advance to next puzzle picture' });
  await board.waitFor({ state: 'visible' });
  return result(identity, text, nextGeometry, audio, await storageDelta(helper, before, lane));
}

async function spot({ page, helper, lane }) {
  const chapters = page.locator('main').first().locator('button[aria-pressed]');
  await helper.clickControl(chapters.first(), { label: 'Choose the first visible Spot the Difference chapter' });
  await helper.clickControl(button(page, /^(Start|Replay) chapter$/, false), { label: 'Start visible Spot the Difference chapter' });
  const search = page.getByRole('button', { name: 'Search Picture B for a change', exact: true }); await search.waitFor();
  const before = await helper.snapshotStorage();
  const scene = await page.locator('section').filter({ has: search }).first().locator('p').first().innerText();
  const identity = `Picture comparison: ${scene}`;
  const box = await search.boundingBox(); if (!box) throw new Error('Picture B search area has no visible geometry');
  await page.mouse.click(box.x + 6, box.y + 6);
  await page.getByText('Not that spot yet. Compare the same area in Picture A.', { exact: true }).waitFor({ timeout: 3000 });
  if (!await search.isVisible() || (await page.locator('section').filter({ has: search }).first().locator('p').first().innerText()) !== scene) throw new Error('Wrong spot did not retain the same picture pair for retry');
  let attempts = 0;
  while (attempts++ < 12) {
    const highlighted = page.locator('button.animate-pulse[aria-label^="Check "]');
    if (await highlighted.count() !== 1) {
      const magnifier = page.getByRole('button', { name: /^Magnifier/ });
      await helper.clickControl(magnifier, { label: 'Request one Picture B magnifier clue' });
    }
    await helper.clickControl(page.locator('button.animate-pulse[aria-label^="Check "]'), { label: 'Inspect magnifier-highlighted picture detail' });
    if (await page.getByRole('heading', { name: /pair complete!$/ }).count()) break;
  }
  const held = page.locator('section[aria-live="polite"]').filter({ has: page.getByText('Picture fact:', { exact: false }) }).first(); await held.waitFor();
  const audio = await audioCheck(page, helper, button(page, 'Hear fact again'), 'Picture fact replay');
  const next = button(page, 'Next picture'); const nextGeometry = await helper.measureControl(next, 'Next difference picture');
  const text = await held.innerText(); await helper.clickControl(next, { label: 'Advance to next difference picture' });
  await page.getByRole('button', { name: 'Search Picture B for a change' }).waitFor();
  return result(identity, text, nextGeometry, audio, await storageDelta(helper, before, lane));
}

async function sky({ page, helper, lane }) {
  const picker = page.locator('details').filter({ has: page.getByText('Choose another sky', { exact: true }) });
  if (await picker.count() && !await picker.evaluate(el => el.open)) {
    const summary = picker.locator('summary');
    await summary.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'nearest' }));
    await helper.clickControl(summary, { label: 'Open secondary Sky Shapes episode choices' });
  }
  await helper.clickControl(page.getByRole('button').filter({ hasText: /^Sky 1 ·/ }).first(), { label: 'Choose the first visible Sky Shapes episode' });
  const start = button(page, /^(Start|Replay) this sky$/, false);
  await helper.clickControl(start, { label: 'Start visible Sky Shapes sky' });
  const svg = page.getByRole('application', { name: /^Tracing board for / }); await svg.waitFor();
  await helper.measureControl(svg, 'Full visible Sky Shapes tracing board');
  const before = await helper.snapshotStorage();
  const identity = await svg.getAttribute('aria-label');
  const trace = async () => {
    const paths = svg.locator('polyline[stroke="rgba(255,255,255,.92)"]');
    const pathCount = await paths.count();
    if (!pathCount) throw new Error('Sky route did not expose its visible ordered guide dots');
    const box = await svg.boundingBox(); if (!box) throw new Error('Sky Shapes SVG missing visible geometry');
    const view = await svg.evaluate(el => ({ width: el.viewBox.baseVal.width, height: el.viewBox.baseVal.height }));
    const scale = Math.min(box.width / view.width, box.height / view.height);
    const left = box.x + (box.width - view.width * scale) / 2;
    const top = box.y + (box.height - view.height * scale) / 2;
    for (let index = 0; index < pathCount; index += 1) {
      const pointsText = await paths.nth(index).getAttribute('points');
      const points = pointsText.split(/\s+/).map(item => item.split(',').map(Number));
      if (points.length < 3 || points.some(pair => pair.length !== 2 || pair.some(n => !Number.isFinite(n)))) throw new Error('Sky guide path has invalid visible geometry');
      const mapped = points.map(([x,y]) => ({ x: left + x * scale, y: top + y * scale }));
      if (index === 0) {
        await page.mouse.move(mapped[0].x + 110, mapped[0].y + 110); await page.mouse.down();
        await page.mouse.move(mapped[0].x + 125, mapped[0].y + 125); await page.mouse.up();
        if (await svg.getAttribute('aria-label') !== identity) throw new Error('Wrong Sky Shapes start changed the active mission');
      }
      await page.mouse.move(mapped[0].x, mapped[0].y); await page.mouse.down();
      for (const p of mapped.slice(1)) await page.mouse.move(p.x, p.y, { steps: 2 });
      await page.mouse.up();
    }
  };
  await trace();
  const status = page.getByRole('status').filter({ hasText: /route accuracy|Keyboard-guided completion/ }); await status.waitFor({ timeout: 12000 });
  const audioCtl = button(page, 'Hear mission again');
  const audio = await audioCheck(page, helper, audioCtl, 'Sky Shapes mission replay');
  const next = button(page, /^(Next mission|Complete this sky)$/ , false); const nextGeometry = await helper.measureControl(next, 'Next Sky Shapes mission');
  const text = await page.getByRole('status').filter({ hasText: /Shape idea:/ }).innerText().catch(() => status.innerText());
  await helper.clickControl(next, { label: 'Continue Sky Shapes route' });
  await svg.waitFor();
  await page.waitForFunction(previous => document.querySelector('svg[aria-label^="Tracing board for "]')?.getAttribute('aria-label') !== previous, identity, { timeout: 5000 });
  if (await svg.getAttribute('aria-label') === identity) throw new Error('Sky Shapes Next did not change the visible mission');
  return result(identity, text, nextGeometry, audio, await storageDelta(helper, before, lane));
}

async function safari({ page, helper, lane }) {
  const chapter = page.getByRole('button', { name: /Chapter 1 .*Listen for a sound/ });
  await helper.clickControl(chapter, { label: 'Choose Sound Safari listen chapter' });
  const section = page.getByRole('region', { name: 'Sound mission' }); await section.waitFor();
  const roundPrompt = (await section.innerText()).split('\n').slice(0, 3).join(' · ');
  const soundLabel=await page.getByRole('button',{name:/^Hear \/.+\/$/}).first().getAttribute('aria-label');
  const sound=soundLabel?.match(/^Hear \/(.+)\/$/)?.[1];
  if(!sound)throw new Error('No visible initial-sound cue');
  const before = await helper.snapshotStorage();
  const identity = `Listen for /${sound}/ · ${roundPrompt}`;
  await helper.clickControl(button(page, `Hear /${sound}/`), { label: 'Hear target sound' });
  const choices = page.getByRole('button', { name: /^Picture choice \d+: / });
  const options = await choices.evaluateAll(es => es.map(e => ({ label: e.getAttribute('aria-label') || '' })));
  const correct = options.find(option => option.label.split(': ').at(-1)?.toLowerCase().startsWith(sound));
  const wrong = options.find(option => option !== correct);
  if (!correct || !wrong) throw new Error(`Visible Sound Safari choices do not offer a clear initial sound target for ${roundPrompt}`);
  await helper.clickControl(button(page, wrong.label), { label: 'Choose a picture with the wrong initial sound' });
  if (await button(page, 'Try this challenge again').count()) await helper.clickControl(button(page, 'Try this challenge again'), { label: 'Retry same sound challenge' });
  if ((await section.innerText()).split('\n').slice(0, 3).join(' · ') !== roundPrompt) throw new Error('Wrong sound answer changed the visible challenge');
  await helper.clickControl(button(page, correct.label), { label: 'Choose picture beginning with target sound' });
  const explanation = page.getByText(/That word begins with|Listen for the first sound/i).first(); await explanation.waitFor();
  const audio = await audioCheck(page, helper, button(page, 'Hear sounds and word'), 'Sound Safari exact sound and word replay', 900);
  const next = button(page, 'Next challenge'); const nextGeometry = await helper.measureControl(next, 'Sound Safari Next challenge');
  const held = page.getByRole('region', { name: 'Sound mission' }); const text = await held.innerText();
  await helper.clickControl(next, { label: 'Advance to next Sound Safari challenge' });
  await page.getByRole('region', { name: 'Sound mission' }).waitFor();
  return result(identity, text, nextGeometry, audio, await storageDelta(helper, before, lane));
}

async function colour({ page, helper, lane }) {
  await helper.clickControl(page.getByRole('navigation', { name: 'Colour labs' }).getByRole('button').first(), { label: 'Choose the first Colour Mixing Lab' });
  await helper.clickControl(button(page, /^Start Paint Mixer$/, false), { label: 'Start first Colour Mixing Lab' });
  const mission = page.locator('article[aria-label="Paint mission"]'); await mission.waitFor();
  const before = await helper.snapshotStorage();
  const prompt = await mission.innerText();
  const identity = prompt.split('\n').slice(0, 3).join(' · ');
  const recipe = await page.getByLabel('Recipe proportions').innerText();
  const ingredientRows = recipe.split('\n').map(line => line.match(/^(\d+)\s+scoops?\s+(.+)$/i)).filter(Boolean);
  if (!ingredientRows.length) throw new Error('First paint mission has no visible proportion model');
  for (const [, count, name] of ingredientRows) for (let i=0;i<Number(count);i++) await helper.clickControl(button(page, `Add ${name} paint`), { label: `Add ${name} paint from visible recipe` });
  await helper.clickControl(button(page, 'Mix'), { label: 'Mix visible paint recipe' });
  const choices = page.getByRole('button', { name: /^Choose / });
  const resultColor = await page.locator('.mix-result').evaluate(el => getComputedStyle(el).backgroundColor);
  const labelColors = await choices.evaluateAll(es => es.map(e => ({ label: e.getAttribute('aria-label'), color: getComputedStyle(e.querySelector('span') || e).backgroundColor })));
  const correct = labelColors.find(row => row.color === resultColor)?.label;
  if (!correct) throw new Error(`Visible mixed-paint swatch (${resultColor}) has no matching labelled answer option`);
  const correctColorName = correct.replace(/^Choose /, '');
  const wrong = labelColors.find(row => row.label !== correct)?.label;
  if (!wrong) throw new Error(`Paint result ${correctColorName} has no visible retry distractor`);
  await helper.clickControl(button(page, wrong), { label: 'Choose an incorrect mixed-colour answer' });
  if (await page.getByRole('status').filter({ hasText: /Not quite/ }).count() === 0) throw new Error('Wrong paint answer did not remain retryable');
  await helper.clickControl(button(page, correct), { label: 'Choose the colour shown by the mixed recipe' });
  const held = page.getByRole('status').filter({ hasText: /Hear explanation again/ }); await held.waitFor();
  const audio = await audioCheck(page, helper, button(page, 'Hear explanation again'), 'Paint explanation replay');
  const next = button(page, 'Next mix'); const nextGeometry = await helper.measureControl(next, 'Next paint mix');
  const text = await held.innerText(); await helper.clickControl(next, { label: 'Advance to next paint mission' });
  await page.locator('article[aria-label="Paint mission"]').waitFor();
  return result(`Paint mission ${identity}`, text, nextGeometry, audio, await storageDelta(helper, before, lane));
}

async function shadow({ page, helper, lane }) {
  const levelOne = button(page, 'Practice level 1');
  if (await levelOne.count() === 1 && await levelOne.isVisible()) await helper.clickControl(levelOne, { label: 'Choose the first visible Shadow Match practice level' });
  const play = button(page, 'Play Shadow Match');
  if (await play.count()) await helper.clickControl(play, { label: 'Start visible Shadow Match' });
  if (await play.count() && await play.isVisible()) await helper.clickControl(play, { label: 'Confirm Shadow Match start' });
  const targetControl = page.getByRole('button', { name: /— drag to its shadow$/ }); await targetControl.waitFor();
  const target = targetControl.locator('img').first(); await target.waitFor();
  const before = await helper.snapshotStorage();
  const speciesAsset = await target.getAttribute('src');
  const targetName = await page.locator('p').filter({ hasText: /flying reptile|[A-Z][a-z]+/ }).allInnerTexts().then(rows => rows.find(text => / · flying reptile$/.test(text) || /^[A-Z][a-z]+$/.test(text)));
  if (!targetName) throw new Error('Shadow Match does not show its creature name as a visible clue');
  const identity = `Match the visible ${targetName} creature to its silhouette`;
  const options = page.getByRole('button', { name: /^Shadow option / });
  const count = await options.count(); if (count < 2) throw new Error('Shadow Match needs at least two visible shadow choices');
  const matching = options.filter({ has: page.locator(`img[src="${speciesAsset}"]`) });
  if (await matching.count() !== 1) throw new Error('Could not compare displayed silhouette art to the displayed creature art');
  const wrong = options.filter({ hasNot: page.locator(`img[src="${speciesAsset}"]`) }).first();
  await helper.clickControl(wrong, { label: 'Try a visually different shadow' });
  if (await page.getByRole('button', { name: 'Next match →' }).count()) throw new Error('Wrong silhouette advanced the round');
  await helper.clickControl(button(page, 'Show me a clue'), { label: 'Show visible Shadow Match clue' });
  await helper.clickControl(matching, { label: 'Choose the silhouette matching the displayed creature art' });
  const held = page.locator('section[aria-live="polite"]').filter({ has: page.getByRole('button', { name: 'Next match →' }) }); await held.waitFor();
  const audioControl = page.getByRole('button', { name: /Hear the (fact|name) again/ });
  const audio = await audioCheck(page, helper, audioControl, 'Shadow Match fact replay');
  const next = button(page, 'Next match →'); const nextGeometry = await helper.measureControl(next, 'Shadow Match Next match');
  const text = await held.innerText(); await helper.clickControl(next, { label: 'Advance to next Shadow Match round' });
  await page.getByRole('button', { name: /— drag to its shadow$/ }).waitFor();
  return result(identity, text, nextGeometry, audio, await storageDelta(helper, before, lane));
}

module.exports = {
  trace: ({ page, helper, lane }) => ({ runVisibleSample: () => trace({ page, helper, lane }) }),
  tictactoe: ({ page, helper, lane }) => ({ runVisibleSample: () => tictactoe({ page, helper, lane }) }),
  puzzle: ({ page, helper, lane }) => ({ runVisibleSample: () => puzzle({ page, helper, lane }) }),
  spot: ({ page, helper, lane }) => ({ runVisibleSample: () => spot({ page, helper, lane }) }),
  jet: ({ page, helper, lane }) => ({ runVisibleSample: () => sky({ page, helper, lane }) }),
  phonics: ({ page, helper, lane }) => ({ runVisibleSample: () => safari({ page, helper, lane }) }),
  colormix: ({ page, helper, lane }) => ({ runVisibleSample: () => colour({ page, helper, lane }) }),
  shadowmatch: ({ page, helper, lane }) => ({ runVisibleSample: () => shadow({ page, helper, lane }) }),
};
