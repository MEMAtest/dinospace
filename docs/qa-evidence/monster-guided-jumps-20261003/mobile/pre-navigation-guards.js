async (page) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/api/voice**', (route) => route.abort());
  await page.route('**/api/story**', (route) => route.abort());
  await page.goto('http://127.0.0.1:5209');
}
