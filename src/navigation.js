// Hash routes give every screen its own history entry, so the browser back
// button and the Android hardware back button step back one screen instead of
// closing the app.
//
//   #/                 welcome (who is playing?)
//   #/home             the active player's home
//   #/world/<worldId>  one learning world
//   #/play/<gameId>    a game
//   #/stickers         sticker shelf
//   #/grownups         progress and settings (behind the grown-up gate)

import { LEARNING_WORLDS } from './data/learningWorlds.js';

const PAGES = new Set(['home', 'stickers', 'grownups']);

export const parseRoute = (hash = '') => {
  const [head, arg] = String(hash).replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (!head) return { name: 'welcome' };
  if (PAGES.has(head)) return { name: head };
  if (head === 'world' && arg) return { name: 'world', id: arg };
  if (head === 'play' && arg) return { name: 'game', id: arg };
  return { name: 'home' };
};

export const routeHash = (route) => {
  switch (route?.name) {
    case 'welcome': return '#/';
    case 'world': return `#/world/${encodeURIComponent(route.id)}`;
    case 'game': return `#/play/${encodeURIComponent(route.id)}`;
    case 'stickers':
    case 'grownups':
    case 'home':
      return `#/${route.name}`;
    default: return '#/home';
  }
};

// The screen a "back" should land on when there is no earlier entry in this
// session's history (for example after a reload inside a game).
export const parentRoute = (route) => {
  switch (route?.name) {
    case 'welcome': return null;
    case 'home': return { name: 'welcome' };
    case 'game': {
      const world = LEARNING_WORLDS.find((item) => item.gameIds.includes(route.id));
      return world ? { name: 'world', id: world.id } : { name: 'home' };
    }
    default: return { name: 'home' };
  }
};

export const sameRoute = (a, b) => routeHash(a) === routeHash(b);
