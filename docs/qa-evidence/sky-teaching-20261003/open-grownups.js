async page => {
  const button = page.getByRole('button', { name: 'Press and hold' });
  const box = await button.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(3200);
  await page.mouse.up();
  await page.waitForTimeout(300);
  return { url: page.url(), text: await page.locator('main').innerText().catch(async () => page.locator('body').innerText()) };
}
