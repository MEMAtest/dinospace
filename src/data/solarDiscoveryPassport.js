// Persist only completed Solar discoveries and challenges for the active child.
const key = (playerId) => `${playerId}_discovery_passport_v1`;
const hasPlayerId = (playerId) => typeof playerId === 'string' && playerId.trim().length > 0;
const storageDefault = () => {
  try { return typeof window === 'undefined' ? null : window.localStorage; }
  catch { return null; }
};
export function readDiscoveryPassport(playerId, planets, storage = storageDefault()) {
  const empty = { facts: {}, quizzes: {} };
  if (!hasPlayerId(playerId) || !storage) return empty;
  try {
    const raw = JSON.parse(storage?.getItem(key(playerId)) || '{}');
    const facts = {}, quizzes = {};
    for (const planet of planets) {
      planet.facts.forEach((_, index) => {
        const id = `${planet.name}-${index}`;
        if (raw.facts?.[id] === true) facts[id] = true;
      });
      if (raw.quizzes?.[planet.name] === true) quizzes[planet.name] = true;
    }
    return { facts, quizzes };
  } catch { return empty; }
}
export function saveDiscoveryPassport(playerId, planets, value, storage = storageDefault()) {
  if (!hasPlayerId(playerId) || !storage) return false;
  let previousRaw;
  try { previousRaw = storage.getItem(key(playerId)); }
  catch { return false; }
  let parsedPrevious = {};
  if (previousRaw !== null && previousRaw !== undefined) {
    try {
      parsedPrevious = JSON.parse(previousRaw);
      if (!parsedPrevious || typeof parsedPrevious !== 'object' || Array.isArray(parsedPrevious)
        || (parsedPrevious.facts !== undefined && (!parsedPrevious.facts || typeof parsedPrevious.facts !== 'object' || Array.isArray(parsedPrevious.facts)))
        || (parsedPrevious.quizzes !== undefined && (!parsedPrevious.quizzes || typeof parsedPrevious.quizzes !== 'object' || Array.isArray(parsedPrevious.quizzes)))) return false;
    } catch { return false; }
  }
  const previous = readDiscoveryPassport(playerId, planets, { getItem: () => JSON.stringify(parsedPrevious) });
  const proposed = readDiscoveryPassport(playerId, planets, { getItem: () => JSON.stringify(value) });
  // Merge monotonic completion flags so an old in-memory view can never erase
  // discoveries that were saved by another mounted view or later session.
  const canonical = {
    facts: { ...previous.facts, ...proposed.facts },
    quizzes: { ...previous.quizzes, ...proposed.quizzes },
  };
  try {
    const serialized = JSON.stringify(canonical);
    storage.setItem(key(playerId), serialized);
    const committedRaw = storage.getItem(key(playerId));
    if (committedRaw !== serialized) return false;
    return {
      persisted: true,
      passport: readDiscoveryPassport(playerId, planets, { getItem: () => committedRaw }),
      previous,
    };
  } catch { return false; }
}
export function discoveredPlanetBadges(planets, facts) {
  return planets.filter((planet) => planet.facts.filter((_, index) => facts[`${planet.name}-${index}`] === true).length >= 3).map((planet) => planet.name);
}
export function solarPassportAwardTransitions(planets, previous, committed, planetName) {
  return {
    planetBadgeEarned: !discoveredPlanetBadges(planets, previous.facts).includes(planetName)
      && discoveredPlanetBadges(planets, committed.facts).includes(planetName),
    challengeEarned: previous.quizzes[planetName] !== true && committed.quizzes[planetName] === true,
  };
}
export function seededPlanetOptions(options, seed) {
  let state = (Number(seed) >>> 0) || 1;
  const cards = [...new Set(options)];
  for (let index = cards.length - 1; index > 0; index--) {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    const other = (state >>> 0) % (index + 1);
    [cards[index], cards[other]] = [cards[other], cards[index]];
  }
  return cards;
}
