async (page) => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(100);
  const viewport = await page.evaluate(() => ({
    width: innerWidth,
    height: innerHeight,
    documentWidth: document.documentElement.scrollWidth,
    documentHeight: document.documentElement.scrollHeight,
  }));
  const svg = page.locator('svg[role="application"]');
  const geometry = await svg.evaluate((el) => {
    const rect = (node) => {
      const box = node.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    };
    const route = el.querySelector('polyline')?.getAttribute('points')?.trim()
      .split(/\s+/)
      .map((pair) => pair.split(',').map(Number));
    return {
      board: rect(el),
      routePointCount: route?.length ?? 0,
      startEndViewBoxCoords: route?.length ? [route[0], route.at(-1)] : [],
      circles: [...el.querySelectorAll('circle')].map((node) => ({
        fill: node.getAttribute('fill'),
        rect: rect(node),
      })),
      markerNumbers: [...el.querySelectorAll('text')].map((node) => ({
        text: node.textContent,
        rect: rect(node),
      })),
      transformedGroups: [...el.querySelectorAll('g[transform]')].map((node) => ({
        transform: node.getAttribute('transform'),
        rect: rect(node),
      })),
    };
  });
  const instructions = await page.locator('main').evaluate((el) => [...el.querySelectorAll('p')]
    .filter((node) => node.innerText.trim())
    .map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        text: node.innerText.trim(),
        role: node.getAttribute('role'),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      };
    }));
  await page.screenshot({ fullPage: true });
  return { viewport, geometry, instructions };
}
