async (page) => {
  const result = { prompt: await page.locator('main h2').innerText(), mainText: await page.locator('main').innerText(), url: page.url() };
  await page.screenshot({ path: 'docs/qa-evidence/monster-guided-jumps-20261003/mobile/story-q1-hint-correct-held-390x844.png' });
  return result;
}
