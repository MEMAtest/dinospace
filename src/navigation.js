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
  const [head, arg, module] = String(hash).replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (!head) return { name: 'welcome' };
  if (PAGES.has(head)) return { name: head };
  if (head === 'world' && arg) return { name: 'world', id: arg };
  if (head === 'play' && arg) return { name: 'game', id: arg, ...(arg === 'worldmap' && module === 'time-detectives' ? { module } : {}) };
  return { name: 'home' };
};

export const routeHash = (route) => {
  switch (route?.name) {
    case 'welcome': return '#/';
    case 'world': return `#/world/${encodeURIComponent(route.id)}`;
    case 'game': return `#/play/${encodeURIComponent(route.id)}${route.id === 'worldmap' && route.module === 'time-detectives' ? '/time-detectives' : ''}`;
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

// A related clock lesson returns to the curriculum that launched it. Store
// only this known route, so a reload preserves the origin without trusting
// arbitrary routes or carrying another game's origin forward.
export const gameReturnRoute = (route, historyState) => route?.name === 'game'
  && route.id === 'timeteller' && historyState?.clockLessonOrigin === 'worldmap'
  ? { name: 'game', id: 'worldmap', module: 'time-detectives' } : parentRoute(route);

export const nextRouteHistoryState = (from, next, previousState, depth) => ({
  depth,
  ...(next?.name === 'game' && next.id === 'timeteller'
    && ((from?.name === 'game' && from.id === 'worldmap')
      || (from?.name === 'game' && from.id === 'timeteller' && previousState?.clockLessonOrigin === 'worldmap'))
    ? { clockLessonOrigin: 'worldmap' } : {}),
});

// A reload or browser history restoration keeps the known screen and its
// related-lesson origin. A fresh visit still begins with player selection.
export const startupNavigation = (hash, state, navigationType) => {
  const restoring = navigationType === 'reload' || navigationType === 'back_forward';
  const route = parseRoute(hash);
  if (!restoring || routeHash(route) !== hash) return { hash: '#/', state: { depth: 0 } };
  const depth = Number.isSafeInteger(state?.depth) && state.depth >= 0 ? state.depth : 0;
  return {
    hash: routeHash(route),
    state: { depth, ...(route.name === 'game' && route.id === 'timeteller' && state?.clockLessonOrigin === 'worldmap' ? { clockLessonOrigin: 'worldmap' } : {}) },
  };
};
