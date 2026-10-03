async (page) => {
  const board = page.getByRole('application');
  await board.scrollIntoViewIfNeeded();
  const route = await board.evaluate((svg) => {
    const box = svg.getBoundingClientRect();
    const [viewWidth, viewHeight] = svg.viewBox.baseVal ? [svg.viewBox.baseVal.width, svg.viewBox.baseVal.height] : [1000, 650];
    const pointsText = svg.querySelector('polyline').getAttribute('points');
    const points = pointsText.trim().split(/\s+/).map((point) => point.split(',').map(Number));
    return { box: { x: box.x, y: box.y, width: box.width, height: box.height }, viewWidth, viewHeight, points };
  });
  const screen = ([x, y]) => [route.box.x + (x / route.viewWidth) * route.box.width, route.box.y + (y / route.viewHeight) * route.box.height];
  const [startX, startY] = screen(route.points[0]);
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  for (const point of route.points.slice(1)) {
    const [x, y] = screen(point);
    await page.mouse.move(x, y, { steps: 1 });
  }
  await page.mouse.up();
  await page.waitForTimeout(500);
}
