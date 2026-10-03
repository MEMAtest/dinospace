async (page) => {
  const read = async () => page.locator('main').evaluate((main) => ({
    text: main.innerText,
    marker: main.querySelector('[aria-label*="Current position"]')?.getAttribute('aria-label') || null,
    liveRegions: [...main.querySelectorAll('[aria-live="polite"]')].map((el) => el.innerText),
    step: [...main.querySelectorAll('button')].filter((b) => /Jump one step/.test(b.innerText)).map((b) => { const r=b.getBoundingClientRect(); return {text:b.innerText,disabled:b.disabled,bounds:[r.width,r.height]}; }),
    reset: [...main.querySelectorAll('button')].filter((b)=>b.innerText==='Start again').map((b)=>({disabled:b.disabled, bounds:[b.getBoundingClientRect().width,b.getBoundingClientRect().height]}))
  }));
  const trace = [{ label: 'after clue before movement', state: await read() }];
  await page.getByRole('button', { name: 'Jump one step back' }).click();
  trace.push({ label: 'pointer activation 1', state: await read() });
  await page.getByRole('button', { name: 'Start again' }).click();
  trace.push({ label: 'reset to start', state: await read() });
  await page.getByRole('button', { name: 'Jump one step back' }).focus();
  await page.keyboard.press('Enter');
  trace.push({ label: 'keyboard Enter', state: await read() });
  await page.getByRole('button', { name: 'Jump one step back' }).focus();
  await page.keyboard.press('Space');
  trace.push({ label: 'keyboard Space', state: await read() });
  await page.getByRole('button', { name: 'Jump one step back' }).click();
  trace.push({ label: 'pointer activation 3', state: await read() });
  await page.getByRole('button', { name: 'Jump one step back' }).click();
  trace.push({ label: 'last legal pointer activation', state: await read() });
  const terminalDisabled = await page.getByRole('button', { name: 'Jump one step back' }).isDisabled();
  if (!terminalDisabled) throw new Error('Jump control was not disabled at the end of the specified hops');
  const terminalBefore = await read();
  await page.getByRole('button', { name: 'Jump one step back' }).focus();
  await page.keyboard.press('Space');
  trace.push({ label: 'Space at hop limit', state: await read() });
  const noOvershoot = JSON.stringify(terminalBefore) === JSON.stringify(trace.at(-1).state);
  await page.getByRole('button', { name: '11', exact: true }).click();
  await page.waitForTimeout(250);
  trace.push({ label: 'wrong answer at completed practice', state: await read() });
  const usableAfterWrong = await page.getByRole('button', { name: 'Jump one step back' }).count() === 1;
  await page.getByRole('button', { name: '10', exact: true }).click();
  await page.waitForTimeout(900);
  const answered = await read();
  const controlsHiddenAfterCorrect = await page.getByRole('button', { name: 'Jump one step back' }).count() === 0;
  await page.screenshot({ path: 'docs/qa-evidence/monster-guided-jumps-20261003/desktop/story-q1-correct-held-1280x800.png' });
  await page.getByRole('button', { name: 'Next question' }).click();
  await page.waitForTimeout(250);
  const afterNext = await read();
  await page.screenshot({ path: 'docs/qa-evidence/monster-guided-jumps-20261003/desktop/story-q2-after-next-1280x800.png' });
  return { trace, terminalDisabled, noOvershoot, usableAfterWrong, answered, controlsHiddenAfterCorrect, afterNext };
}
