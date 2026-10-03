async (page) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download game log' }).click(),
  ]);
  await download.saveAs('docs/qa-evidence/sky-shapes-runtime-20261003/sky-shapes-ui-diagnostics-fixed-build-20261003.json');
}
