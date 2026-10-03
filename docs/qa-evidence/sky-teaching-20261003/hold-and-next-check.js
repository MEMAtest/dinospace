async page => {
  const explanation = 'Shape idea: A triangle has 3 straight sides and 3 corners.';
  await page.waitForTimeout(1200);
  const beforeNext = {
    url: page.url(),
    explanationVisible: await page.getByText(explanation, { exact: true }).isVisible(),
    currentTitle: await page.locator('h1').innerText(),
  };
  const controls = await page.getByRole('button').evaluateAll((buttons) => buttons.map((button) => {
    const rect = button.getBoundingClientRect();
    return { label: button.getAttribute('aria-label') || button.innerText.trim(), x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  }));
  const beforeMetrics = await page.evaluate(() => ({
    viewportWidth: innerWidth,
    docWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    docHeight: document.documentElement.scrollHeight,
    viewportHeight: innerHeight,
  }));
  await page.getByRole('button', { name: 'Next mission' }).click();
  await page.waitForTimeout(250);
  const afterNext = {
    title: await page.locator('h1').innerText(),
    text: await page.locator('main').innerText(),
    oldExplanationVisible: await page.getByText(explanation, { exact: true }).count() > 0,
  };
  return { beforeNext, afterNext, beforeMetrics, controls };
}
