async (page) => {
  const results = [];
  for (let i = 0; i < 6; i++) {
    const title = await page.locator('main h2').innerText();
    const match = title.match(/What is (\d+) (plus|take away) (\d+)\?/);
    if (!match) throw new Error(`Could not derive answer from visible prompt: ${title}`);
    const a = Number(match[1]);
    const b = Number(match[3]);
    const answer = match[2] === 'plus' ? a + b : a - b;
    results.push({ question: title, chosenVisibleAnswer: String(answer) });
    await page.getByRole('button', { name: String(answer), exact: true }).click();
    await page.waitForTimeout(100);
    if (i < 5) await page.getByRole('button', { name: 'Next question' }).click();
    else await page.waitForTimeout(250);
  }
  return { results, finalState: (await page.locator('main').innerText()).slice(-700) };
}
