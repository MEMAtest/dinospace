async (page) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.route('**/api/voice**', (route) => route.abort());
  await page.route('**/api/story**', (route) => route.abort());
  await page.goto('http://127.0.0.1:5209');
}
