const safeOrdinal = (value) => (Number.isInteger(value) && value >= 0 ? value : 0);

// Bind cancellation to real browser lifecycle events without coupling the
// round mechanic to React or a particular browser global implementation.
export const bindRescuePauseCancellation = (documentTarget, windowTarget, stopSpray) => {
  if (!documentTarget?.addEventListener || !documentTarget?.removeEventListener
    || !windowTarget?.addEventListener || !windowTarget?.removeEventListener
    || typeof stopSpray !== 'function') return () => {};
  const cancelForPageState = () => {
    if (documentTarget.visibilityState === 'hidden' || documentTarget.hasFocus?.() === false) stopSpray();
  };
  const cancelForLifecycle = () => stopSpray();
  windowTarget.addEventListener('blur', cancelForLifecycle);
  documentTarget.addEventListener('visibilitychange', cancelForPageState);
  documentTarget.addEventListener('freeze', cancelForLifecycle);
  documentTarget.addEventListener('resume', cancelForLifecycle);
  return () => {
    windowTarget.removeEventListener('blur', cancelForLifecycle);
    documentTarget.removeEventListener('visibilitychange', cancelForPageState);
    documentTarget.removeEventListener('freeze', cancelForLifecycle);
    documentTarget.removeEventListener('resume', cancelForLifecycle);
  };
};

// Return only exact packaged segments that concatenate to the displayed line.
// A null result keeps callers on written guidance and cannot activate fallback
// speech for an incomplete or mismatched sequence.
export const exactRescueSegments = (text, options, hasPackagedClip) => {
  if (typeof text !== 'string' || !text.trim() || typeof hasPackagedClip !== 'function') return null;
  const supplied = options?.segments;
  const segments = supplied === undefined ? [text] : supplied;
  if (!Array.isArray(segments) || segments.length === 0
    || segments.some((segment) => typeof segment !== 'string' || !segment.trim())) return null;
  if (segments.join(' ') !== text) return null;
  try {
    return segments.every((segment) => hasPackagedClip(segment)) ? segments : null;
  } catch {
    return null;
  }
};

// Rotate the actual visible fire targets by run and round. Equal-sized rounds
// in one run therefore do not reuse an identical scene; replay shifts the set.
export const buildFireMissionTargets = (spots, counts, playOrdinal = 0) => {
  if (!Array.isArray(spots) || !spots.length || !Array.isArray(counts)) return [];
  const ordinal = safeOrdinal(playOrdinal);
  return counts.map((requested, roundIndex) => {
    const count = Math.max(0, Math.min(spots.length, Number.isInteger(requested) ? requested : 0));
    const offset = (ordinal + roundIndex * Math.max(1, count)) % spots.length;
    return Array.from({ length: count }, (_, index) => spots[(offset + index) % spots.length]);
  });
};

// Each round changes the rescued animal and rotates the target floor. The
// target animal is placed on that floor; every other available floor gets a
// different animal. The result is stable for a play ordinal and cycles across
// replays so every floor/animal can become the target.
export const buildLadderMissionTargets = (animalPool, requestedFloors, requestedRounds, playOrdinal = 0) => {
  if (!Array.isArray(animalPool) || !animalPool.length) return [];
  const floorCount = Math.max(0, Math.min(animalPool.length, Number.isInteger(requestedFloors) ? requestedFloors : 0));
  const roundCount = Math.max(0, Number.isInteger(requestedRounds) ? requestedRounds : 0);
  if (!floorCount || !roundCount) return [];
  const ordinal = safeOrdinal(playOrdinal);
  return Array.from({ length: roundCount }, (_, roundIndex) => {
    // Offset the animal cycle independently from the floor cycle. With five
    // animals/floors, using the same rotation would permanently pair kitten
    // with floor 1, puppy with floor 2, and so on.
    const targetIndex = (ordinal * 2 + roundIndex) % animalPool.length;
    const targetFloor = ((ordinal + roundIndex) % floorCount) + 1;
    const targetAnimal = animalPool[targetIndex];
    const otherAnimals = Array.from({ length: animalPool.length - 1 }, (_, index) => animalPool[(targetIndex + index + 1) % animalPool.length]);
    const animals = Array.from({ length: floorCount });
    animals[targetFloor - 1] = targetAnimal;
    let otherIndex = 0;
    for (let floor = 0; floor < floorCount; floor += 1) {
      if (floor !== targetFloor - 1) animals[floor] = otherAnimals[otherIndex++];
    }
    return { animals, targetFloor };
  });
};
