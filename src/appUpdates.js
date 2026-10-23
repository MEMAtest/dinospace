// Read only the generated HTML's module entry. Never execute fetched markup.
export const moduleEntryFromHtml = html => {
  for (const match of String(html).matchAll(/<script\b([^>]*)>/gi)) {
    if (!/\btype\s*=\s*["']module["']/i.test(match[1])) continue;
    const src = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(match[1]);
    if (src) return src[1];
  }
  return null;
};

export const observeAppRelease = ({ currentEntry, onUpdate, windowTarget = window, documentTarget = document, fetchHtml = fetch, baseUrl = window.location.href, pollMs = 180000 }) => {
  if (!currentEntry) return () => {};
  const current = new URL(currentEntry, baseUrl);
  const abort = new AbortController();
  let stopped = false;
  let checking = false;
  let notified = false;
  const check = async () => {
    if (stopped || checking || notified || documentTarget.visibilityState === 'hidden') return;
    checking = true;
    try {
      // /index.html is not an asset cached by our service worker. no-store also
      // avoids the browser's HTTP cache; no timestamp cache entries accumulate.
      const response = await fetchHtml(new URL('/index.html', baseUrl).href, { cache: 'no-store', signal: abort.signal });
      if (!response.ok) return;
      const entry = moduleEntryFromHtml(await response.text());
      if (!entry || stopped) return;
      const next = new URL(entry, baseUrl);
      if (next.origin === current.origin && next.href !== current.href) {
        notified = true;
        onUpdate();
      }
    } catch {
      // Offline or a failed check must never interrupt play or saved progress.
    } finally {
      checking = false;
    }
  };
  windowTarget.addEventListener('focus', check);
  documentTarget.addEventListener('visibilitychange', check);
  const timer = windowTarget.setInterval(check, pollMs);
  check();
  return () => {
    stopped = true;
    abort.abort();
    windowTarget.clearInterval(timer);
    windowTarget.removeEventListener('focus', check);
    documentTarget.removeEventListener('visibilitychange', check);
  };
};
