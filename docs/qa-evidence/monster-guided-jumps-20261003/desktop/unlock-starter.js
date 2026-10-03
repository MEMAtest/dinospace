async (page) => {
  const results = [];
  for (let i = 0; i < 6; i++) {
    const title = await page.locator('main h2').innerText();
    const n = await page.getByRole('group', { name: 'Counting pictures' }).getByRole('img').count();
    results.push({ question: title, visiblePictureCount: n, chosenVisibleAnswer: String(n) });
    await page.getByRole('button', { name: String(n), exact: true }).click();
    await page.waitForTimeout(100);
    if (i < 5) await page.getByRole('button', { name: 'Next question' }).click();
    else await page.waitForTimeout(250);
  }
  return { results, completion: (await page.locator('main').innerText()).slice(-700) };
}
