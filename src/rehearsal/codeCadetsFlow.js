const REPEAT_MISSION_ROUTE = ['forward', 'forward', 'forward', 'right', 'forward', 'forward', 'forward', 'collect'];

/** Return only the next supported example block; independent missions have no guide program. */
export function nextGuidedMissionInstruction(program, guidedBlocks) {
  if (!Array.isArray(program) || !Array.isArray(guidedBlocks) || program.length >= guidedBlocks.length) return null;
  if (!guidedBlocks.slice(0, program.length).every((op, index) => op === program[index])) return null;
  return guidedBlocks[program.length] ?? null;
}

export function nextRepeatMissionInstruction(program) {
  return REPEAT_MISSION_ROUTE[program.length] ?? null;
}

export function findForwardTriple(program) {
  return program.findIndex((op, index) => op === 'forward' && program[index + 1] === 'forward' && program[index + 2] === 'forward');
}

export function replaceForwardTriple(program) {
  const index = findForwardTriple(program);
  if (index < 0) return null;
  return [...program.slice(0, index), 'repeat3', ...program.slice(index + 3)];
}

export function repeatMissionStage(program, repeatUnlocked) {
  if (!repeatUnlocked) return { stage: 'build', next: nextRepeatMissionInstruction(program) };
  if (findForwardTriple(program) >= 0) return { stage: 'replace', next: null };
  return { stage: 'run', next: null };
}
