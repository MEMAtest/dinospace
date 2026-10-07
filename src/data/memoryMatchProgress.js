// Memory completion records contain only durable board results: best moves and stars.
const storageDefault = () => typeof window === 'undefined' ? null : window.localStorage;

export function buildSeededMemoryDeck(level, seed) {
  let state = (Number(seed) >>> 0) || 1;
  const cards = level.emojis.flatMap((emoji, index) => ['a', 'b'].map((copy) => ({ id: `${level.id}-${index}-${copy}`, emoji, flipped: false, matched: false })));
  for (let index = cards.length - 1; index > 0; index--) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const other = (state >>> 0) % (index + 1);
    [cards[index], cards[other]] = [cards[other], cards[index]];
  }
  return cards;
}

export function memoryStrategy(levelIndex, previousEfficient = false) {
  if (previousEfficient) return 'Try recalling both places before you turn the second card. Keep the same board until every pair is found.';
  if (levelIndex < 2) return 'Scan one row at a time. Say the picture and remember its place before turning another card.';
  return 'Scan one row at a time. When you turn a picture, remember its row and place. If you see it again, look for the place where its partner appeared.';
}

export function readMemoryPassport(playerId, levels, storage = storageDefault()) {
  if (playerId !== 'amari') return {};
  try {
    const raw = JSON.parse(storage?.getItem('amari_memory_passport_v1') || '{}');
    return Object.fromEntries(levels.filter((level) => Number.isInteger(raw[level.id]?.bestMoves) && raw[level.id].bestMoves >= level.emojis.length && [1, 2, 3].includes(raw[level.id].stars)).map((level) => [level.id, { bestMoves: raw[level.id].bestMoves, stars: raw[level.id].stars }]));
  } catch { return {}; }
}

export function completeMemoryBoard(playerId, levels, levelId, moves, storage = storageDefault()) {
  const previous = readMemoryPassport(playerId, levels, storage);
  const level = levels.find((entry) => entry.id === levelId);
  if (playerId !== 'amari' || !level || !Number.isInteger(moves) || moves < level.emojis.length) return { passport: previous, awardedStars: 0, persisted: false };
  const bestMoves = Math.min(previous[levelId]?.bestMoves || Infinity, moves);
  const stars = bestMoves <= level.emojis.length * 2 ? 3 : bestMoves <= level.emojis.length * 3 ? 2 : 1;
  const passport = { ...previous, [levelId]: { bestMoves, stars } };
  try {
    if (!storage) throw Error('Unavailable storage');
    storage.setItem('amari_memory_passport_v1', JSON.stringify(passport));
    return { passport, awardedStars: Math.max(0, stars - (previous[levelId]?.stars || 0)), persisted: true };
  } catch { return { passport, awardedStars: 0, persisted: false }; }
}
