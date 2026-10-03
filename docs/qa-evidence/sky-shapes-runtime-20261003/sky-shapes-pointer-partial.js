async (page) => {
  const board = page.getByRole('application');
  await board.scrollIntoViewIfNeeded();
  const route = await board.evaluate((svg) => {
    const box = svg.getBoundingClientRect();
    const points = svg.querySelector('polyline').getAttribute('points').trim().split(/\s+/).map((point) => point.split(',').map(Number));
    return { box: { x: box.x, y: box.y, width: box.width, height: box.height }, points };
  });
  const screen = ([x, y]) => [route.box.x + (x / 1000) * route.box.width, route.box.y + (y / 650) * route.box.height];
  const [x, y] = screen(route.points[0]);
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (const point of route.points.slice(1, 13)) {
    const [px, py] = screen(point);
    await page.mouse.move(px, py, { steps: 1 });
  }
  await page.mouse.up();
  await page.waitForTimeout(250);
}
