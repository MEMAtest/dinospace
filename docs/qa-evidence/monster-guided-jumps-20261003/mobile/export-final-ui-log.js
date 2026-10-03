async (page) => {
  await page.getByRole('button', { name: 'Back to learning world' }).click();
  await page.getByRole('button', { name: 'Back to world' }).click();
  await page.getByRole('button', { name: 'Back to home' }).click();
  await page.getByRole('button', { name: 'Grown-ups' }).click();
  const hold = page.getByRole('button', { name: 'Press and hold' });
  const box = await hold.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(3300);
  await page.mouse.up();
  await page.getByText('Game troubleshooting').click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download game log' }).click();
  const download = await downloadEvent;
  const path = 'docs/qa-evidence/monster-guided-jumps-20261003/mobile/monster-5209-mobile-ui-log-final.json';
  await download.saveAs(path);
  return { suggestedFilename: download.suggestedFilename(), savedAs: path };
}
