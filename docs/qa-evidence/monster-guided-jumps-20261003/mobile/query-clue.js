async (page) => {
  const details = await page.locator('main').evaluate((main) => ({
    text: main.innerText,
    live: [...main.querySelectorAll('[aria-live], [role="status"]')].map((el) => ({ tag: el.tagName, role: el.getAttribute('role'), live: el.getAttribute('aria-live'), text: el.innerText, aria: el.getAttribute('aria-label') })),
    controls: [...main.querySelectorAll('button')].map((el) => { const r = el.getBoundingClientRect(); return { text: el.innerText, aria: el.getAttribute('aria-label'), disabled: el.disabled, bounds: [r.width, r.height] }; }),
    markers: [...main.querySelectorAll('[aria-label*="Current position"]')].map((el) => ({ label: el.getAttribute('aria-label'), role: el.getAttribute('role'), tag: el.tagName, ariaLive: el.getAttribute('aria-live') }))
  }));
  await page.screenshot({ path: 'docs/qa-evidence/monster-guided-jumps-20261003/mobile/story-q1-clue-initial-390x844.png' });
  return details;
}
