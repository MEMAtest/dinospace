const randomFromSeed = (seed) => {
  let state = (Number(seed) >>> 0) || 1;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

export const shuffleCurriculumAnswers = (options, seed, cursor) => {
  const result = [...options];
  const random = randomFromSeed((Number(seed) + Number(cursor) + 1) >>> 0);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
};

export const createCurriculumQueue = (rounds, moduleId, seed, recentIds = [], useTeachingStart = false) => {
  if (!rounds.length) return [];
  const targetCount = Math.min(5, rounds.length);
  const recent = new Set(recentIds);
  const candidates = rounds.map((round, index) => index).filter((index) => !recent.has(rounds[index].id));
  const random = randomFromSeed(seed);
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [candidates[index], candidates[other]] = [candidates[other], candidates[index]];
  }
  // Exhaust the unseen pool before revisiting the oldest completed questions.
  // A short band cannot supply eight unseen items, but must not discard the
  // remaining new questions merely because they cannot fill the entire run.
  if (candidates.length < targetCount) {
    const revisits = rounds.map((_, index) => index).filter((index) => recent.has(rounds[index].id));
    revisits.sort((a, b) => recentIds.lastIndexOf(rounds[a].id) - recentIds.lastIndexOf(rounds[b].id));
    candidates.push(...revisits);
  }
  const preferredId = moduleId === 'time-detectives' ? 'history-communication'
    : moduleId === 'nature-lab' ? 'science-animal-bird' : 'continent-africa';
  const preferredIndex = useTeachingStart && recentIds.length === 0 ? rounds.findIndex((round) => round.id === preferredId) : -1;
  if (preferredIndex >= 0 && candidates.includes(preferredIndex)) {
    candidates.splice(candidates.indexOf(preferredIndex), 1);
    candidates.unshift(preferredIndex);
  }
  return candidates.slice(0, targetCount);
};

export const makeCurriculumSeed = () => {
  const entropy = `${Date.now()}-${Math.random()}`;
  let seed = 2166136261;
  for (let index = 0; index < entropy.length; index += 1) {
    seed = Math.imul(seed ^ entropy.charCodeAt(index), 16777619);
  }
  return seed >>> 0;
};
