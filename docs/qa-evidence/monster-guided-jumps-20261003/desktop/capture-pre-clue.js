async (page) => {
  const buttons = await page.getByRole('button').evaluateAll((items) => items.map((el) => {
    const r = el.getBoundingClientRect();
    return { name: (el.getAttribute('aria-label') || el.innerText).trim(), x: r.x, y: r.y, width: r.width, height: r.height, visible: !!(r.width && r.height) };
  }));
  const result = {
    viewport: await page.evaluate(() => ({ width: innerWidth, height: innerHeight, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth })),
    prompt: await page.locator('main h2').innerText(),
    visibleText: await page.locator('main').innerText(),
    buttons,
    activeJumpControls: await page.getByRole('button').filter({ hasText: /jump|reset/i }).allTextContents()
  };
  await page.screenshot({ path: 'docs/qa-evidence/monster-guided-jumps-20261003/desktop/story-q1-preclue-1280x800.png' });
  return result;
}
