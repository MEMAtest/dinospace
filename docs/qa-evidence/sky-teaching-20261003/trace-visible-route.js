async page => {
  const svg = page.locator('svg[role="application"]');
  const geometry = await svg.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const polyline = el.querySelector('polyline');
    return {
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      points: polyline.getAttribute('points').trim().split(/\s+/).map((pair) => pair.split(',').map(Number)),
      viewBox: el.getAttribute('viewBox'),
    };
  });
  const [vx, vy, vw, vh] = geometry.viewBox.split(/\s+/).map(Number);
  const toScreen = ([x, y]) => ({
    x: geometry.rect.left + ((x - vx) / vw) * geometry.rect.width,
    y: geometry.rect.top + ((y - vy) / vh) * geometry.rect.height,
  });
  const points = geometry.points.map(toScreen);
  await page.mouse.move(points[0].x, points[0].y);
  await page.mouse.down();
  for (const point of points.slice(1)) {
    await page.mouse.move(point.x, point.y, { steps: 2 });
    await page.waitForTimeout(8);
  }
  await page.mouse.up();
  await page.waitForTimeout(250);
  return {
    pathPointCount: points.length,
    rect: geometry.rect,
    status: await page.getByRole('status').allTextContents(),
    visibleText: await page.locator('main').innerText(),
  };
}
