import { useCallback, useEffect, useRef, useState } from 'react';
import { parentRoute, parseRoute, routeHash } from '../navigation.js';

const currentDepth = () => {
  const depth = window.history.state?.depth;
  return Number.isInteger(depth) && depth > 0 ? depth : 0;
};

// Screen history backed by the browser history, so the device back button,
// the browser back button and the in-app back buttons all agree.
//
// `setLeaveGuard(fn)` lets the app intercept a back step away from a screen
// (for example to ask "leave the game?"). Returning true from `fn(from, to)`
// cancels that step; call `back({ force: true })` to leave after confirming.
export const useHashRouter = () => {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  const routeRef = useRef(route);
  const guardRef = useRef(null);
  const bypassGuardRef = useRef(false);

  useEffect(() => { routeRef.current = route; }, [route]);

  // Native history restoration can put a returning player back at a deep
  // scroll offset, hiding the world's back and game controls on mobile.
  // Each app route starts at the top; keep browser back/forward consistent.
  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const next = parseRoute(window.location.hash);
      const from = routeRef.current;
      if (!bypassGuardRef.current && guardRef.current?.(from, next)) {
        // Undo the browser's step so the child stays where they were.
        window.history.pushState({ depth: currentDepth() + 1 }, '', routeHash(from));
        return;
      }
      bypassGuardRef.current = false;
      routeRef.current = next;
      setRoute(next);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((next, { replace = false } = {}) => {
    const hash = routeHash(next);
    if (!replace && hash === routeHash(routeRef.current)) return;
    const depth = replace ? currentDepth() : currentDepth() + 1;
    window.history[replace ? 'replaceState' : 'pushState']({ depth }, '', hash);
    const parsed = parseRoute(hash);
    routeRef.current = parsed;
    setRoute(parsed);
  }, []);

  const back = useCallback(({ force = false, toParent = false } = {}) => {
    const from = routeRef.current;
    const parent = parentRoute(from);
    if (!force && guardRef.current?.(from, parent)) return;
    if (toParent && parent) {
      navigate(parent, { replace: true });
    } else if (currentDepth() > 0) {
      bypassGuardRef.current = true;
      window.history.back();
    } else if (parent) {
      navigate(parent, { replace: true });
    }
  }, [navigate]);

  // Rewind to the very first screen ("who is playing?"), dropping the whole
  // screen history so one child's screens never sit behind another's.
  const backToStart = useCallback(() => {
    const depth = currentDepth();
    if (depth > 0) {
      bypassGuardRef.current = true;
      window.history.go(-depth);
    } else {
      navigate({ name: 'welcome' }, { replace: true });
    }
  }, [navigate]);

  const setLeaveGuard = useCallback((guard) => { guardRef.current = guard; }, []);

  return { route, navigate, back, backToStart, setLeaveGuard };
};
