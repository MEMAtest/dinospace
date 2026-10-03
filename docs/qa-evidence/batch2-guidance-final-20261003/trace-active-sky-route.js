async (page) => {
  const board = page.locator('svg[role="application"]');
  await board.scrollIntoViewIfNeeded();
  const geometry = await board.evaluate((svg) => {
    const rect = svg.getBoundingClientRect();
    const [viewWidth, viewHeight] = svg.viewBox.baseVal
      ? [svg.viewBox.baseVal.width, svg.viewBox.baseVal.height]
      : [1000, 650];
    const groups = [...svg.querySelectorAll('g[aria-hidden="true"]')];
    const group = groups.find((node) => node.querySelector('polyline[stroke-width="9"][stroke="#fde68a"]'))
      || groups.find((node) => node.querySelector('polyline[stroke-width="30"]'));
    const line = group?.querySelector('polyline[stroke-width="30"]');
    const points = line?.getAttribute('points')?.trim()
      .split(/\s+/)
      .map((pair) => pair.split(',').map(Number)) ?? [];
    return {
      box: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      viewWidth,
      viewHeight,
      points,
    };
  });
  const screen = ([x, y]) => ({
    x: geometry.box.x + (x / geometry.viewWidth) * geometry.box.width,
    y: geometry.box.y + (y / geometry.viewHeight) * geometry.box.height,
  });
  const points = geometry.points.map(screen);
  if (!points.length) throw new Error('Visible guide route not found.');
  await page.mouse.move(points[0].x, points[0].y);
  await page.mouse.down();
  for (const point of points.slice(1)) {
    await page.mouse.move(point.x, point.y, { steps: 2 });
    await page.waitForTimeout(5);
  }
  await page.mouse.up();
  await page.waitForTimeout(250);
  return {
    routePointCount: points.length,
    visibleText: await page.locator('main').innerText(),
    buttons: await page.getByRole('button').evaluateAll((items) => items
      .map((button) => button.getAttribute('aria-label') || button.innerText.trim())
      .filter(Boolean)),
  };
}
