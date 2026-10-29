async function visibleClockHandAngles(svg) {
  return svg.evaluate(element => {
    const rotation = color => {
      const hand = element.querySelector(`line[stroke="${color}"]`);
      const value = hand?.getAttribute('transform')?.match(/rotate\(([-\d.]+)/)?.[1];
      if (value === undefined) throw Error('Visible clock hand rotation is missing');
      return Number(value);
    };
    return { hour: rotation('#be123c'), minute: rotation('#0369a1') };
  });
}
// Visible-control samples for the six retained maths lanes. The runner has
// already entered each game through the normal catalogue. These recipes only
// inspect rendered prompts/models and interact with visible controls; they do
// not read component state or write application storage.

const exactButton = (page, name) => page.getByRole('button', { name, exact: true });
const visibleText = async locator => (await locator.innerText()).replace(/\s+/g, ' ').trim();

async function startVisibleRun(page, lane, helper) {
  // Saved profiles may open a later chapter. Select the first enabled authored
  // chapter/survey using its ordinary control, without changing saved progress.
  if (lane.id === 'counting') {
    const selected=page.locator('main section h2').first();await selected.waitFor();
    if((await selected.innerText()).trim()!=='Star Garden'){
      const picker=page.locator('main details').first(),summary=picker.locator('summary');await summary.scrollIntoViewIfNeeded();await helper.clickControl(summary,{label:'Open the secondary counting survey picker'});
      const first=picker.getByRole('button',{name:/^Star Garden(?: ·|$)/});await first.scrollIntoViewIfNeeded();await helper.clickControl(first,{label:'Select Star Garden survey'});
    }
    const firstSurvey=page.getByRole('button',{name:/^(Start|Replay) selected survey$/});
    await helper.clickControl(firstSurvey,{label:'Start or replay the selected counting survey'});
    return;
  } else {
    const chapterButtons = page.locator('main button[aria-pressed="true"], main button[aria-pressed="false"]');
    for (let index = 0; index < await chapterButtons.count(); index += 1) {
      const button = chapterButtons.nth(index);
      if (await button.isVisible() && await button.isEnabled()) {
        await helper.clickControl(button, { label: `Select first unlocked ${lane.title} chapter` });
        break;
      }
    }
  }
  const startLabels = {
    math: /^(Start six questions|Replay this episode)$/,
    counting: /^(Start next survey|Replay survey|Start survey)$/,
    addition: /^(Start|Replay) .+$/,
    subtraction: /^(Start|Replay) .+$/,
    numberline: /^(Start|Replay) .+$/,
    timeteller: /^(Start|Replay) .+$/,
  };
  const choices = page.getByRole('button', { name: startLabels[lane.id] });
  const next = exactButton(page, 'Start next survey');
  const start = lane.id === 'counting' && await next.count() === 1 && await next.isVisible()
    ? next : choices.first();
  if (await start.count() !== 1 || !await start.isVisible()) {
    throw new Error(`${lane.title} has no single visible unlocked start/replay control`);
  }
  await helper.clickControl(start, { label: `${lane.title} visible start/replay` });
}

function parseNumbers(text) {
  return [...text.matchAll(/\d+/g)].map(match => Number(match[0]));
}

function arithmeticAnswer(laneId, prompt) {
  const values = parseNumbers(prompt);
  if (laneId === 'addition') {
    if (/what number make|missing part/i.test(prompt) && values.length >= 2) return values[1] - values[0];
    if (values.length >= 2) return values[0] + values[1];
  }
  if (laneId === 'subtraction' && values.length >= 2) {
    if (/larger group|how many more|unpaired/i.test(prompt)) return Math.abs(values[0] - values[1]);
    return values[0] - values[1];
  }
  if (laneId === 'math') {
    if (/how many/i.test(prompt) && values.length === 0) return null;
    if (/take away|gives .* away|gives .* more|finds .* more/i.test(prompt) && values.length >= 2) {
      return /take away|gives .* away/i.test(prompt) ? values[0] - values[1] : values[0] + values[1];
    }
    if (/plus/i.test(prompt) && values.length >= 2) return values[0] + values[1];
    if (values.length >= 2) return values[0] - values[1];
  }
  return null;
}

async function answerFromVisibleModel(page, laneId, prompt) {
  if (laneId === 'counting') {
    // In the Amari route, each countable object is an individually labelled,
    // visible button on the current board.
    const objects = page.locator('[aria-label^="not counted yet"], [aria-label$="not counted yet"]');
    const count = await objects.count();
    if (count > 0) return count;
  }
  if (laneId === 'math' && /how many/i.test(prompt) && parseNumbers(prompt).length === 0) {
    const pictures = page.locator('[role="img"][aria-label]');
    const count = await pictures.count();
    if (count > 0) return count;
  }
  if (laneId === 'numberline') {
    const n = parseNumbers(prompt);
    if (/^Start at /i.test(prompt) && n.length >= 2) return /back/i.test(prompt) ? n[0] - n[1] : n[0] + n[1];
    if (/\? \+ \d+ = \d+/i.test(prompt) && n.length >= 2) return n[1] - n[0];
    if (/\d+ \+ \? = \d+/i.test(prompt) && n.length >= 2) return n[1] - n[0];
    if (/\d+ \+ \d+ = \?/i.test(prompt) && n.length >= 2) return n[0] + n[1];
    const pair = [...prompt.matchAll(/([AB]) \((\d+) to (\d+)\)/g)];
    if (pair.length === 2) {
      const [[, , a0, a1], [, , b0, b1]] = pair;
      const aStart = Number(a0), aEnd = Number(a1), bStart = Number(b0), bEnd = Number(b1);
      const av = /travelled farther/i.test(prompt) ? Math.abs(aEnd - aStart) : aEnd;
      const bv = /travelled farther/i.test(prompt) ? Math.abs(bEnd - bStart) : bEnd;
      return av === bv ? 'same' : av > bv ? 'A' : 'B';
    }
    return arithmeticAnswer('addition', prompt);
  }
  if (laneId === 'timeteller') {
    const checkClock = exactButton(page, 'Check clock');
    if (await checkClock.count() === 1 && await checkClock.isVisible()) {
      const target = prompt.match(/Set the clock to (\d{1,2} o['’]clock|half past \d{1,2}|quarter past \d{1,2}|quarter to \d{1,2})(?:,|\.|$)/i)?.[1];
      const parsed = parseTimeLabel(target);
      if (!parsed) throw new Error(`Cannot parse the visible set-clock target: ${prompt}`);
      return parsed;
    }
    const svg = page.locator('svg[viewBox="0 0 200 200"][role="img"]:visible').first();
    const angles = await visibleClockHandAngles(svg);
    const minute = Math.round(angles.minute / 6) % 60;
    const hour = ((Math.round((angles.hour - minute * 0.5) / 30) % 12) || 12);
    return formatTimeLabel(hour, minute);
  }
  if (laneId === 'math' || laneId === 'addition' || laneId === 'subtraction') {
    const fromPrompt = arithmeticAnswer(laneId, prompt);
    if (fromPrompt !== null) return fromPrompt;
    // Monster Math's count round has no numeral in its question; its picture
    // model is the rendered set of accessible picture items.
    const pictureCount = await page.locator('[role="img"][aria-label]').count();
    if (laneId === 'math' && pictureCount) return pictureCount;
  }
  return null;
}

function parseTimeLabel(label = '') {
  let match = label.match(/^(\d{1,2}) o['’]clock$/i);
  if (match) return `${Number(match[1])}:00`;
  match = label.match(/^half past (\d{1,2})$/i);
  if (match) return `${Number(match[1])}:30`;
  match = label.match(/^quarter past (\d{1,2})$/i);
  if (match) return `${Number(match[1])}:15`;
  match = label.match(/^quarter to (\d{1,2})$/i);
  if (match) return `${Number(match[1]) === 1 ? 12 : Number(match[1]) - 1}:45`;
  return null;
}

function formatTimeLabel(hour, minute) {
  if (minute === 0) return `${hour} o’clock`;
  if (minute === 30) return `half past ${hour}`;
  if (minute === 15) return `quarter past ${hour}`;
  if (minute === 45) return `quarter to ${hour === 12 ? 1 : hour + 1}`;
  return `${hour}:${String(minute).padStart(2, '0')}`;
}

async function visiblePrompt(page, laneId) {
  if (laneId === 'math') return page.locator('main h2[aria-live="polite"]').first();
  if (laneId === 'counting') return page.locator('main section h2').first();
  if (laneId === 'numberline' || laneId === 'timeteller') return page.locator('main h2[aria-live="polite"]').first();
  return page.locator('main > p[aria-live="polite"], main > p').first();
}

async function taskIdentity(page, laneId, promptLocator) {
  const prompt = await visibleText(promptLocator);
  if (laneId === 'counting') {
    const board = page.locator('[data-layout-variant]').first();
    const details = await board.evaluate(element => ({
      variant: element.getAttribute('aria-label'),
      objects: [...element.querySelectorAll('button')].map(button => button.getAttribute('style') || ''),
    }));
    return `${prompt}|${details.variant}|${details.objects.join(',')}`;
  }
  if (laneId === 'timeteller') {
    const checkClock = exactButton(page, 'Check clock');
    if (await checkClock.count() === 1 && await checkClock.isVisible()) return prompt;
    const svg = page.locator('svg[viewBox="0 0 200 200"][role="img"]:visible').first();
    const hands = await visibleClockHandAngles(svg);
    const angles = `${hands.hour}:${hands.minute}`;
    return `${prompt}|clock:${angles}`;
  }
  return prompt;
}

async function waitUntilEnabled(locator, label, timeout = 6000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await locator.isVisible().catch(() => false) && await locator.isEnabled().catch(() => false)) return;
    await locator.page().waitForTimeout(100);
  }
  throw new Error(`${label} did not become enabled in time`);
}

function optionIsCorrect(laneId, optionText, answer, prompt) {
  if (laneId === 'numberline' && /^[AB]$/.test(String(answer))) return optionText === `Frog ${answer}`;
  if (laneId === 'numberline' && answer === 'same') return optionText === 'Same';
  if (laneId === 'timeteller') {
    const label = /^\d{1,2}:\d{2}$/.test(answer)
      ? formatTimeLabel(...answer.split(':').map(Number)) : answer;
    return optionText === label;
  }
  return optionText === String(answer);
}

async function clickAnswer(page, laneId, value, helper, label) {
  if (laneId === 'addition' || laneId === 'subtraction' || laneId === 'math') {
    const button = page.getByRole('group', { name: 'Choose the answer' }).getByRole('button', { name: laneId === 'math' ? String(value) : `Answer ${value}`, exact: true });
    await helper.clickControl(button, { label });
    return;
  }
  if (laneId === 'counting') {
    const button = page.getByRole('button', { name: String(value), exact: true }).last();
    await helper.clickControl(button, { label });
    return;
  }
  if (laneId === 'numberline') {
    const promptText = await (await visiblePrompt(page, laneId)).innerText();
    const buttonName = value === 'same' ? 'Same' : /^Which frog/i.test(promptText) ? `Frog ${value}` : String(value);
    await helper.clickControl(page.getByRole('group', { name: 'Choose the answer' }).getByRole('button', { name: buttonName, exact: true }), { label });
    return;
  }
  if (laneId === 'timeteller') {
    const labelValue = /^\d{1,2}:\d{2}$/.test(value) ? (() => {
      const [hour, minute] = value.split(':').map(Number);
      return formatTimeLabel(hour, minute);
    })() : value;
    await helper.clickControl(page.getByRole('group', { name: 'Choose the time' }).getByRole('button', { name: labelValue, exact: true }), { label });
    return;
  }
  throw new Error(`No answer control for ${laneId}`);
}

async function setClockFromVisibleTarget(page, helper, target) {
  const [hourRaw, minuteRaw] = target.split(':').map(Number);
  if (!Number.isInteger(hourRaw) || !Number.isInteger(minuteRaw)) throw new Error(`Cannot read target time from visible prompt: ${target}`);
  const svg = page.locator('svg[role="img"][aria-label="Clock setting controls"]:visible');
  const hand = async (name, degrees) => {
    await helper.clickControl(exactButton(page, name), { label: `Select ${name} for clock model` });
    await helper.measureControl(svg, 'Visible clock face');
    const box = await svg.boundingBox();
    if (!box) throw new Error('Clock face is not measurable');
    const x = box.width / 2 + (67 / 200 * box.width) * Math.sin(degrees * Math.PI / 180);
    const y = box.height / 2 - (67 / 200 * box.height) * Math.cos(degrees * Math.PI / 180);
    await svg.click({ position: { x, y } });
  };
  await hand('Long · minute', minuteRaw * 6);
  await hand('Short · hour', (hourRaw % 12) * 30);
}

async function performModelCorrect(page, laneId, answer, prompt, helper) {
  if (laneId === 'counting') {
    const recount = exactButton(page, 'Recount from 1 · uses a clue');
    if (await recount.count() === 1 && await recount.isVisible()) {
      await helper.clickControl(recount, { label: 'Reopen the same count model to retry' });
    }
    const objects = page.locator('[aria-label$="not counted yet"]');
    const count = await objects.count();
    if (!count) throw new Error('Count board did not expose uncounted object controls');
    for (let i = 0; i < count; i += 1) await helper.clickControl(objects.first(), { label: `Count visible object ${i + 1}` });
    await clickAnswer(page, laneId, answer, helper, 'Count the visibly modelled objects');
    return;
  }
  if (laneId === 'addition') {
    const bring = exactButton(page, 'Bring the groups together');
    if (await bring.count() === 1 && await bring.isVisible()) await helper.clickControl(bring, { label: 'Join the two visible groups' });
    await clickAnswer(page, laneId, answer, helper, 'Choose the total shown by the addition model');
    return;
  }
  if (laneId === 'subtraction') {
    const model = page.getByRole('region', { name: 'Take-away model' });
    if (await model.count()) {
      const buttons = model.getByRole('button', {name:/, remains$/});
      const match = prompt.match(/Take away (\d+)/i) || prompt.match(/gives? (\d+) /i);
      const toMark = match ? Number(match[1]) : 0;
      for (let i = 0; i < toMark; i += 1) await helper.clickControl(buttons.first(), { label: `Mark visible object ${i + 1} as taken away` });
    }
    await clickAnswer(page, laneId, answer, helper, 'Choose the result shown by the subtraction model');
    return;
  }
  if (laneId === 'numberline') {
    if (/^Start at /i.test(prompt)) {
      const direction = /back/i.test(prompt) ? '← Hop back' : 'Hop forward →';
      const hopCount = parseNumbers(prompt)[1];
      for (let i = 0; i < hopCount; i += 1) await helper.clickControl(exactButton(page, direction), { label: `Make visible number-line hop ${i + 1}` });
      return;
    }
    await clickAnswer(page, laneId, answer, helper, 'Choose the answer from the visible number-line journeys');
    return;
  }
  if (laneId === 'timeteller') {
    const checkClock = exactButton(page, 'Check clock');
    if (await checkClock.count() === 1 && await checkClock.isVisible()) {
      await setClockFromVisibleTarget(page, helper, answer);
      await helper.clickControl(exactButton(page, 'Check clock'), { label: 'Check the visibly set clock' });
    } else {
      await clickAnswer(page, laneId, answer, helper, 'Read the visible clock face');
    }
    return;
  }
  await clickAnswer(page, laneId, answer, helper, 'Choose the answer from the visible counter model');
}

function makeExercise(laneId) {
  return ({ page, helper, lane }) => ({
    runVisibleSample: async () => {
    const beforeStorage = await helper.snapshotStorage();
    await startVisibleRun(page, lane, helper);
    const promptLocator = await visiblePrompt(page, laneId);
    await promptLocator.waitFor({ state: 'visible', timeout: 8000 });
    const prompt = await visibleText(promptLocator);
    if (!prompt) throw new Error(`${lane.title} has no readable current-task prompt`);
    const answer = await answerFromVisibleModel(page, laneId, prompt);
    if (answer === null) throw new Error(`Could not derive a visible-model answer for ${lane.title}: ${prompt}`);
    const initialIdentity = await taskIdentity(page, laneId, promptLocator);
    if(laneId==='counting'){const uncounted=page.locator('[aria-label$="not counted yet"]');const total=await uncounted.count();for(let n=0;n<total;n++)await helper.clickControl(uncounted.first(),{label:`Count visible object ${n+1} before first answer`});}

    const wrongValue = laneId === 'numberline' && typeof answer === 'string'
      ? (answer === 'A' ? 'B' : 'A')
      : laneId === 'timeteller' ? (() => {
        const [hour, minute] = answer.split(':').map(Number);
        return `${hour % 12 + 1}:${String(minute).padStart(2, '0')}`;
      })() : String(Number(answer) + 1);
    let wrongControl;
    if (laneId === 'numberline' && prompt.startsWith('Start at ')) {
      wrongControl = exactButton(page, /back/i.test(prompt) ? 'Hop forward →' : '← Hop back');
      if (await wrongControl.isEnabled()) {
        await helper.clickControl(wrongControl, { label: `${lane.title} wrong direction attempt` });
      } else {
        const frog = page.locator('figure .cursor-grab');
        await helper.measureControl(frog, `${lane.title} visible frog swipe target`);
        const box = await frog.boundingBox();
        if (!box) throw new Error('Number-line frog is not measurable for a visible swipe retry');
        const direction = /back/i.test(prompt) ? 1 : -1;
        const x = box.x + box.width / 2, y = box.y + box.height / 2;
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.mouse.move(x + direction * 36, y, { steps: 3 });
        await page.mouse.up();
      }
    } else if (laneId === 'timeteller' && await exactButton(page, 'Check clock').count() === 1 && await exactButton(page, 'Check clock').isVisible()) {
      await setClockFromVisibleTarget(page, helper, wrongValue);
      wrongControl = exactButton(page, 'Check clock');
      await helper.clickControl(wrongControl, { label: 'Submit deliberately different visible clock setting' });
    } else {
      const options = laneId === 'math' || laneId === 'addition' || laneId === 'subtraction'
        ? page.getByRole('group', { name: 'Choose the answer' }).getByRole('button')
        : laneId === 'counting' ? page.getByRole('button', { name: /^\d+$/ })
          : laneId === 'numberline' ? page.getByRole('group', { name: 'Choose the answer' }).getByRole('button')
            : page.getByRole('group', { name: 'Choose the time' }).getByRole('button');
      wrongControl = null;
      for (let index = 0; index < await options.count(); index += 1) {
        const candidate = options.nth(index);
        const candidateText = await visibleText(candidate);
        if (!optionIsCorrect(laneId, candidateText, answer, prompt)) {
          wrongControl = candidate;
          break;
        }
      }
      if (!wrongControl) throw new Error(`${lane.title} showed no visible distractor for a wrong-answer retry`);
      await helper.clickControl(wrongControl, { label: `${lane.title} first wrong attempt` });
    }

    if (await taskIdentity(page, laneId, await visiblePrompt(page, laneId)) !== initialIdentity) throw new Error(`${lane.title} changed prompt after a wrong answer`);
    if(laneId==='counting'){const recount=exactButton(page,'Recount from 1 · uses a clue');await helper.clickControl(recount,{label:'Reopen the visible count model and its narration after wrong retry'});}
    const audioControl = laneId === 'math'
      ? exactButton(page, 'Hear the question again')
      : laneId === 'counting' ? exactButton(page, 'Hear instructions')
        : laneId === 'addition' || laneId === 'subtraction' ? exactButton(page, /Hear question/)
          : exactButton(page, 'Hear mission');
    const audioEvidence = await helper.observePackagedPlayback(audioControl, `${lane.title} packaged narration control`);
    const newAudioRows = audioEvidence.events;
    const audio = audioEvidence.packaged;

    await performModelCorrect(page, laneId, answer, prompt, helper);
    const heldNext = laneId === 'counting'
      ? exactButton(page, 'Next')
      : laneId === 'math' ? page.getByRole('button', { name: /^(Next question|Finish episode)$/ })
        : laneId === 'numberline' || laneId === 'timeteller'
          ? page.getByRole('button', { name: /^(Next mission|Finish world|Finish chapter) →$/ })
          : page.getByRole('button', { name: /^(Next question|Finish chapter)$/ });
    const heldRegion = laneId === 'counting' ? page.getByRole('status').filter({ hasText: /Brilliant counting|Great counting|kept counting/ }).first()
      : laneId === 'math' ? page.locator('main section[aria-live="polite"] p').first()
        : laneId === 'numberline' || laneId === 'timeteller' ? page.getByRole('region', { name: 'Worked answer' }).getByRole('status')
          : page.locator('main p[role="status"]').first();
    await heldNext.waitFor({ state: 'visible', timeout: 5000 });
    if (laneId === 'math') await waitUntilEnabled(heldNext, `${lane.title} animation-gated Next`);
    const heldNextGeometry = await helper.measureControl(heldNext, `${lane.title} held Next`);
    const heldExplanation = await visibleText(heldRegion);
    if (!heldExplanation) throw new Error(`${lane.title} has no visible held explanation`);
    await helper.clickControl(heldNext, { label: `${lane.title} explicit Next` });
    const nextPrompt = await visiblePrompt(page, laneId);
    await nextPrompt.waitFor({ state: 'visible', timeout: 5000 });
    const nextIdentity = await taskIdentity(page, laneId, nextPrompt);
    if (!nextIdentity || nextIdentity === initialIdentity) throw new Error(`${lane.title} did not advance to a distinct visible task`);
    const storage = helper.assertStorageChanges(beforeStorage, await helper.snapshotStorage(), { allowedKeys: lane.allowedKeys });
    return {
      taskIdentity: initialIdentity,
      wrongRetryRetained: true,
      transition: 'held',
      heldExplanation,
      heldNextGeometry,
      audio: { checked: true, packaged: audio, events: newAudioRows.map(({ pathname, events }) => ({ pathname, events: events.map(({ type }) => type) })) },
      storage,
    };
    },
  });
}

const FACTORIES = Object.freeze({
  math: makeExercise('math'),
  counting: makeExercise('counting'),
  addition: makeExercise('addition'),
  subtraction: makeExercise('subtraction'),
  numberline: makeExercise('numberline'),
  timeteller: makeExercise('timeteller'),
});

module.exports = { buildMathExercises: ({ page, helper, lane }) => FACTORIES[lane.id]({ page, helper, lane }), mathExerciseFactories: FACTORIES };
