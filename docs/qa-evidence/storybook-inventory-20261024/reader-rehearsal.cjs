async page => {
  const errors = [], providerRequests = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/**', route => {
    providerRequests.push(route.request().url());
    return route.fulfill({ status: 403, body: 'QA provider guard' });
  });
  const inventory = page.getByRole('status', { name: 'Story library inventory', exact: true });
  await inventory.getByText('7 stories in this library', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Rex and the Missing Moon Map', exact: true }).click();
  const automatic = page.getByRole('button', { name: 'Auto-turn pages after narration', exact: true });
  if (await automatic.count()) {
    if (await automatic.getAttribute('aria-pressed') === 'true') await automatic.click();
    await page.getByRole('button', { name: 'Start Reading', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Play narration', exact: true }).click();
  await page.waitForFunction(() => {
    const audio = document.querySelector('audio[aria-label="Story narration"]');
    return audio && !audio.paused && audio.currentTime > 0.2;
  });
  const audio = await page.locator('audio[aria-label="Story narration"]').evaluate(el => ({ src: el.currentSrc, currentTime: el.currentTime, readyState: el.readyState }));
  await page.getByRole('button', { name: 'Pause narration', exact: true }).click();
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  const pagePosition = await page.locator('[aria-label^="Page "]').getAttribute('aria-label');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  await page.getByRole('button', { name: 'Back to storybooks', exact: true }).click();
  await page.reload();
  await inventory.getByText('7 stories in this library', { exact: true }).waitFor();
  await page.screenshot({ path: 'docs/qa-evidence/storybook-inventory-20261024/netlify-library-current.jpg', type: 'jpeg', quality: 75 });
  return { origin: new URL(page.url()).origin, viewport: page.viewportSize(), audio, pagePosition, overflow, inventory: await inventory.innerText(), errors, providerRequests };
}
