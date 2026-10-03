async (page) => {
  const read = async () => page.locator('main').evaluate((main) => ({
    prompt: main.querySelector('h2')?.innerText,
    marker: main.querySelector('[aria-label*="Current position"]')?.getAttribute('aria-label') || null,
    status: [...main.querySelectorAll('[aria-live="polite"]')].map((el)=>el.innerText).find((t)=>/^At /.test(t)) || null
  }));
  const before = await read();
  await page.getByRole('button', { name: 'Jump one step back' }).click();
  const afterStep = await read();
  await page.getByRole('button', { name: 'Start again' }).click();
  const afterReset = await read();
  await page.screenshot({ path: 'docs/qa-evidence/monster-guided-jumps-20261003/mobile/story-q2-practice-reset-390x844.png' });
  return { before, afterStep, afterReset, resetMatchesStart: before.marker === afterReset.marker && before.status === afterReset.status };
}
