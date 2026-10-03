async (page) => {
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download game log' }).click();
  const download = await downloadEvent;
  const path = 'docs/qa-evidence/monster-guided-jumps-20261003/mobile/monster-5209-mobile-ui-log-final.json';
  await download.saveAs(path);
  return { suggestedFilename: download.suggestedFilename(), savedAs: path };
}
