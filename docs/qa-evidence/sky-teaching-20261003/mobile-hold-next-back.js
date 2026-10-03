async page => {
  const explanation = 'Shape idea: A circle is one smooth curve. It has no corners.';
  await page.waitForTimeout(1200);
  const beforeNext = {
    url: page.url(),
    title: await page.locator('h1').innerText(),
    explanationVisible: await page.getByText(explanation, { exact: true }).isVisible(),
    mobileMetrics: await page.evaluate(() => ({ viewportWidth: innerWidth, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth })),
  };
  await page.getByRole('button', { name: 'Next mission' }).click();
  await page.waitForTimeout(250);
  const afterNext = {
    title: await page.locator('h1').innerText(),
    text: await page.locator('main').innerText(),
    oldExplanationVisible: await page.getByText(explanation, { exact: true }).count() > 0,
  };
  await page.getByRole('button', { name: 'Back to learning world' }).click();
  await page.waitForTimeout(250);
  return { beforeNext, afterNext, afterBack: { url: page.url(), title: await page.locator('h1').innerText(), body: (await page.locator('body').innerText()).slice(0, 350) } };
}
