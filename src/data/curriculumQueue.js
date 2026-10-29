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

export const createCurriculumQueue = (rounds, moduleId, seed, recentIds = []) => {
  if (!rounds.length) return [];
  const targetCount = Math.min(5, rounds.length);
  const recent = new Set(recentIds);
  const candidates = rounds.map((round, index) => index).filter((index) => !recent.has(rounds[index].id));
  const random = randomFromSeed(seed);
  const keepTeachingOrder = moduleId === 'time-detectives';
  if (!keepTeachingOrder) {
    for (let index = candidates.length - 1; index > 0; index -= 1) {
      const other = Math.floor(random() * (index + 1));
      [candidates[index], candidates[other]] = [candidates[other], candidates[index]];
    }
  }
  // Use unseen material first. When a band has fewer unseen rounds than the
  // run length, keep its authored progression while filling from older items.
  if (candidates.length < targetCount) {
    const revisits = rounds.map((_, index) => index).filter((index) => recent.has(rounds[index].id));
    if (candidates.length === 0) {
      if (!keepTeachingOrder) {
        for (let index = revisits.length - 1; index > 0; index -= 1) {
          const other = Math.floor(random() * (index + 1));
          [revisits[index], revisits[other]] = [revisits[other], revisits[index]];
        }
      }
      const lastId = recentIds.at(-1);
      if (revisits.length > 1 && rounds[revisits[0]].id === lastId) {
        [revisits[0], revisits[1]] = [revisits[1], revisits[0]];
      }
    } else {
      revisits.sort((a, b) => recentIds.lastIndexOf(rounds[a].id) - recentIds.lastIndexOf(rounds[b].id));
    }
    candidates.push(...revisits.slice(0, targetCount - candidates.length));
  }
  if (keepTeachingOrder) candidates.sort((left, right) => left - right);
  const queue = candidates.slice(0, targetCount);
  if (moduleId === 'nature-lab' && !queue.some((index) => rounds[index].type === 'investigation' && !recent.has(rounds[index].id))) {
    const unseenInvestigations = rounds.map((round, index) => ({ round, index }))
      .filter(({ round }) => round.type === 'investigation' && !recent.has(round.id));
    if (unseenInvestigations.length) {
      const replacementIndex = queue.findIndex((index) => rounds[index].type !== 'investigation');
      if (replacementIndex >= 0) {
        const chosen = unseenInvestigations[Math.floor(random() * unseenInvestigations.length)].index;
        queue[replacementIndex] = chosen;
      }
    }
  }
  return queue;
};

export const createCurriculumReplayQueue = (rounds, moduleId, seed, recentIds = [], previousOrder = []) => {
  let nextOrder = createCurriculumQueue(rounds, moduleId, seed, recentIds);
  // A first history run follows its authored teaching progression. A deliberate
  // replay may vary question order; the clues inside each chronology task keep
  // their actual oldest-to-newest answer order.
  if (moduleId === 'time-detectives') {
    const random = randomFromSeed(seed);
    nextOrder = [...nextOrder];
    for (let index = nextOrder.length - 1; index > 0; index -= 1) {
      const other = Math.floor(random() * (index + 1));
      [nextOrder[index], nextOrder[other]] = [nextOrder[other], nextOrder[index]];
    }
  }
  const repeatsPreviousRun = nextOrder.length > 1
    && nextOrder.length === previousOrder.length
    && nextOrder.every((roundIndex, index) => roundIndex === previousOrder[index]);
  if (!repeatsPreviousRun) return nextOrder;
  return [...nextOrder.slice(1), nextOrder[0]];
};

export const makeCurriculumSeed = () => {
  const entropy = `${Date.now()}-${Math.random()}`;
  let seed = 2166136261;
  for (let index = 0; index < entropy.length; index += 1) {
    seed = Math.imul(seed ^ entropy.charCodeAt(index), 16777619);
  }
  return seed >>> 0;
};
