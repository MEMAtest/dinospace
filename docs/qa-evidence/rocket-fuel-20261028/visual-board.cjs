async page => {
  await page.goto('https://dinospace.netlify.app/#/');
  await page.getByRole('button', {name: /Age 3\+.*Askia/}).click();
  await page.getByRole('heading', {name: 'Rocket World', exact: true}).waitFor();
  const before = await page.evaluate(() => [localStorage.getItem('askia_little_progress'), localStorage.getItem('askia_rewards_v2')]);
  await page.getByRole('button', {name: 'Play Rocket Builder', exact: true}).click();
  await page.getByRole('button', {name: 'Practice level 5', exact: true}).click();
  await page.getByRole('button', {name: 'Play Rocket Builder', exact: true}).click();
  await page.getByRole('button', {name: 'Rocket rocket body', exact: true}).waitFor();
  await page.getByText('Hooray! You did it!', {exact: true}).waitFor({state: 'hidden', timeout: 10000});
  const renders = [];
  for (const width of [390, 1440]) {
    await page.setViewportSize({width, height: 844});
    const layout = await page.evaluate(() => ({width: innerWidth, documentWidth: document.documentElement.scrollWidth, sprites: [...new Set([...document.querySelectorAll('svg image')].map(n => n.href.baseVal))]}));
    if (layout.documentWidth > width || layout.sprites.length !== 5) throw new Error('Rocket visual layout/asset mismatch');
    const path = `/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-b7-memory-cumulative-20261006/docs/qa-evidence/rocket-fuel-20261028/final-rocket-board-${width}.jpg`;
    await page.screenshot({path, quality: 82, fullPage: false});
    renders.push({width, path, layout});
  }
  await page.getByRole('button', {name: 'Go home', exact: true}).click();
  const dialog = page.getByRole('heading', {name: 'Leave the game?', exact: true});
  if (await dialog.isVisible()) await page.getByRole('button', {name: 'Back to home', exact: true}).click();
  await page.getByRole('heading', {name: 'Hi Askia!', exact: true}).waitFor();
  const after = await page.evaluate(() => [localStorage.getItem('askia_little_progress'), localStorage.getItem('askia_rewards_v2')]);
  if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Incomplete visual practice changed saved progress/rewards');
  return {passed: true, renders, incompletePracticePreservedRecords: true};
}
