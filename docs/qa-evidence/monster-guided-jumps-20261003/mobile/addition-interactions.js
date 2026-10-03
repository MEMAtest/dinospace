async (page) => {
  const read = async () => page.locator('main').evaluate((main) => ({
    text: main.innerText,
    marker: main.querySelector('[aria-label*="Current position"]')?.getAttribute('aria-label') || null,
    status: [...main.querySelectorAll('[aria-live="polite"]')].map((el) => el.innerText).find((t) => /^At /.test(t)) || null,
    step: [...main.querySelectorAll('button')].filter((b) => /Jump one step/.test(b.innerText)).map((b) => { const r=b.getBoundingClientRect(); return {text:b.innerText,disabled:b.disabled,bounds:[r.width,r.height]}; }),
    reset: [...main.querySelectorAll('button')].filter((b)=>b.innerText==='Start again').map((b)=>({disabled:b.disabled,bounds:[b.getBoundingClientRect().width,b.getBoundingClientRect().height]}))
  }));
  const trace = [{ label: 'after clue before movement', state: await read() }];
  await page.getByRole('button', { name: 'Jump one step forward' }).focus();
  await page.keyboard.press('Enter');
  trace.push({ label: 'keyboard Enter', state: await read() });
  await page.getByRole('button', { name: 'Jump one step forward' }).focus();
  await page.keyboard.press('Space');
  trace.push({ label: 'keyboard Space', state: await read() });
  await page.getByRole('button', { name: '17', exact: true }).click();
  await page.waitForTimeout(200);
  trace.push({ label: 'wrong answer while practice in progress', state: await read() });
  const usableAfterWrong = await page.getByRole('button', { name: 'Jump one step forward' }).count() === 1 && !(await page.getByRole('button', { name: 'Jump one step forward' }).isDisabled());
  for (let i = 0; i < 9; i++) {
    await page.getByRole('button', { name: 'Jump one step forward' }).click();
    trace.push({ label: `pointer activation ${i + 3}`, state: await read() });
  }
  const terminalBefore = await read();
  const terminalDisabled = await page.getByRole('button', { name: 'Jump one step forward' }).isDisabled();
  if (!terminalDisabled) throw new Error('Forward step control was not disabled at the hop limit');
  await page.getByRole('button', { name: 'Jump one step forward' }).focus();
  await page.keyboard.press('Enter');
  const terminalAfter = await read();
  trace.push({ label: 'Enter at hop limit', state: terminalAfter });
  const noOvershoot = JSON.stringify(terminalBefore) === JSON.stringify(terminalAfter);
  await page.screenshot({ path: 'docs/qa-evidence/monster-guided-jumps-20261003/mobile/story-q1-practice-complete-390x844.png' });
  await page.getByRole('button', { name: '15', exact: true }).click();
  await page.waitForTimeout(900);
  const answered = await read();
  const controlsHiddenAfterCorrect = await page.getByRole('button', { name: 'Jump one step forward' }).count() === 0;
  await page.screenshot({ path: 'docs/qa-evidence/monster-guided-jumps-20261003/mobile/story-q1-correct-held-390x844.png' });
  await page.getByRole('button', { name: 'Next question' }).click();
  await page.waitForTimeout(250);
  const afterNext = await read();
  await page.screenshot({ path: 'docs/qa-evidence/monster-guided-jumps-20261003/mobile/story-q2-after-next-390x844.png' });
  return { trace, usableAfterWrong, terminalDisabled, noOvershoot, answered, controlsHiddenAfterCorrect, afterNext };
}
