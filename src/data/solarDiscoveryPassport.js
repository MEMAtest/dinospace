// Persist only completed Solar discoveries and challenges for the active child.
const key = (playerId) => `${playerId}_discovery_passport_v1`;
const storageDefault = () => typeof window === 'undefined' ? null : window.localStorage;
export function readDiscoveryPassport(playerId, planets, storage = storageDefault()) {
  const empty = { facts: {}, quizzes: {} };
  if (playerId !== 'amari') return empty;
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
  if (playerId !== 'amari' || !storage) return false;
  const canonical = readDiscoveryPassport(playerId, planets, { getItem: () => JSON.stringify(value) });
  try { storage.setItem(key(playerId), JSON.stringify(canonical)); return true; } catch { return false; }
}
export function discoveredPlanetBadges(planets, facts) {
  return planets.filter((planet) => planet.facts.filter((_, index) => facts[`${planet.name}-${index}`] === true).length >= 3).map((planet) => planet.name);
}
export function seededPlanetOptions(options, seed) {
  let state = (Number(seed) >>> 0) || 1;
  const cards = options.flatMap((emoji) => [emoji, emoji]);
  for (let index = cards.length - 1; index > 0; index--) {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    const other = (state >>> 0) % (index + 1);
    [cards[index], cards[other]] = [cards[other], cards[index]];
  }
  return [...new Set(cards)];
}
