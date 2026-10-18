const REPEAT_MISSION_ROUTE = ['forward', 'forward', 'forward', 'right', 'forward', 'forward', 'forward', 'collect'];

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
