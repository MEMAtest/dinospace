import { seededShuffle } from './arithmeticAdventure.js';

export const TIME_CHAPTERS = Object.freeze([
  { id: 'clock-explorers', title: 'Clock Explorers', skill: 'Read o’clock and half past' },
  { id: 'past-and-to', title: 'Past and To', skill: 'Read quarter past and quarter to' },
  { id: 'daily-routines', title: 'Daily Routines', skill: 'Read and set a routine time' },
]);
export const NUMBER_LINE_CHAPTERS = Object.freeze([
  { id: 'forward-back', title: 'Forward and Back', skill: 'Make each hop', max: 10 },
  { id: 'missing-numbers', title: 'Missing Numbers', skill: 'Find a missing number', max: 20 },
  { id: 'compare-distances', title: 'Compare Values and Distances', skill: 'Compare number line journeys', max: 20 },
]);
export const timeLabel = ({ hour, minute }) => minute === 0 ? `${hour} o’clock` : minute === 30 ? `half past ${hour}` : minute === 15 ? `quarter past ${hour}` : `quarter to ${hour === 12 ? 1 : hour + 1}`;
export const clockAngles = ({ hour, minute }) => ({ hour: (hour % 12) * 30 + minute * 0.5, minute: minute * 6 });
export const formatClock = ({ hour, minute }) => `${hour}:${String(minute).padStart(2, '0')}`;
const wrap = (hour) => ((hour - 1 + 12) % 12) + 1;
const makeTimeOptions = (target, pool, seed) => {
  const labels = new Set([timeLabel(target)]); const options = [target];
  const candidates = [];
  for (const h of [wrap(target.hour - 2), wrap(target.hour - 1), wrap(target.hour + 1), wrap(target.hour + 2)]) for (const m of pool) candidates.push({ hour: h, minute: m });
  for (const time of seededShuffle(candidates, seed)) { const label = timeLabel(time); if (!labels.has(label)) { labels.add(label); options.push(time); } if (options.length === 4) break; }
  return seededShuffle(options, seed ^ 0x1a2b3c);
};
const timePool = (chapter) => chapter === 0 ? [0, 30] : chapter === 1 ? [0, 15, 30, 45] : [0, 15, 30, 45];
const freezeMissionMix = (pool, requiredGroups, recentIds, seed) => {
  let eligible = pool.filter((row) => !recentIds.includes(row.id));
  if (eligible.length < 6) eligible = pool;
  const chosen = [];
  requiredGroups.forEach((group, index) => {
    const options = eligible.filter(group);
    const source = options.length ? options : pool.filter(group);
    const pick = seededShuffle(source.filter((row) => !chosen.some((entry) => entry.id === row.id)), seed + index * 104729)[0];
    if (pick) chosen.push(pick);
  });
  const rest = seededShuffle(eligible.filter((row) => !chosen.some((entry) => entry.id === row.id)), seed ^ 0x7654321);
  if (rest.length < 6 - chosen.length) rest.push(...seededShuffle(pool.filter((row) => !chosen.some((entry) => entry.id === row.id) && !rest.some((entry) => entry.id === row.id)), seed ^ 0x1234567));
  return seededShuffle([...chosen, ...rest.slice(0, 6 - chosen.length)], seed);
};
const routineFor = (hour) => hour === 12 ? ['lunch', 'middle of the day'] : hour <= 4 ? ['after-school play', 'afternoon'] : hour === 5 ? ['family dinner', 'evening'] : hour === 6 ? ['story time', 'evening'] : hour === 7 ? ['breakfast', 'morning'] : hour <= 11 ? ['school activity', 'morning'] : ['daily routine', 'day'];
export const createTimeRun = ({ chapter = 0, seed = 1, recentIds = [] } = {}) => {
  if (!Number.isInteger(chapter) || chapter < 0 || chapter > 2 || !Number.isInteger(seed)) return [];
  const pool = timePool(chapter); const rows = [];
  for (let hour = 1; hour <= 12; hour++) for (const minute of pool) {
    const isSet = chapter === 2 && ((hour + minute / 15) % 3 === 0);
    const routine = chapter === 2 ? routineFor(hour) : null;
    const target = { hour, minute };
    rows.push({ id: `${chapter}:${hour}:${minute}:${isSet ? 'set' : 'read'}`, target, type: isSet ? 'set' : 'read', routine, label: timeLabel(target), prompt: isSet ? `Set the clock to ${timeLabel(target)}${routine ? `, ${routine[0]} time in the ${routine[1]}` : ''}.` : chapter === 2 ? `${routine ? `It is the ${routine[1]} and ${routine[0]} is happening. ` : ''}What time is shown on the clock?` : 'What time is shown on the clock?', explanation: `${timeLabel(target)} means the minute hand points to ${minute === 0 ? '12' : minute === 15 ? '3' : minute === 30 ? '6' : '9'}, and the hour hand is ${minute ? 'moving between numbers' : 'on the hour number'}.${routine ? ` This routine is in the ${routine[1]}.` : ''}`, clue: 'The long blue hand shows minutes. The short red hand shows the hour.' });
  }
  const required = chapter === 2 ? [(row) => row.type === 'read', (row) => row.type === 'set'] : [];
  return freezeMissionMix(rows, required, recentIds, seed).map((row, i) => ({ ...row, chapter, seed, options: row.type === 'read' ? makeTimeOptions(row.target, pool, seed + i * 7919) : [] }));
};

export const isKnownTimeQuestionId = (id, chapter) => {
  const match = /^(\d+):(\d+):(\d+):(read|set)$/.exec(id || '');
  if (!match) return false;
  const [, c, h, m, kind] = match.map((value) => value);
  const hour = Number(h); const minute = Number(m); const chapterNumber = Number(c);
  if (chapterNumber !== chapter || hour < 1 || hour > 12 || !timePool(chapter).includes(minute)) return false;
  const shouldSet = chapter === 2 && ((hour + minute / 15) % 3 === 0);
  return kind === (shouldSet ? 'set' : 'read');
};

const makeNumberRow = (chapter, seed, i) => {
  const max = chapter === 0 ? 10 : 20; const rand = (n) => Math.floor((Math.imul((seed + i * 997 + n) | 0, 2654435761) >>> 0) / 4294967296 * (max + 1));
  const rawA = rand(11); const b = Math.max(1, rand(29));
  if (chapter === 0) { const direction = (i % 2) ? -1 : 1; const a = direction > 0 ? Math.min(rawA, max - 1) : Math.max(rawA, 1); const hop = Math.max(1, Math.min(b, direction > 0 ? max - a : a)); const answer = a + direction * hop; return { id: `hop:${a}:${direction}:${hop}`, type: 'hop', a, b: hop, direction, answer, prompt: `Start at ${a}. Hop ${hop} ${direction > 0 ? 'forward' : 'back'}. Where do you land?`, clue: 'Move one number for each hop.', explanation: `${a} ${direction > 0 ? '+' : '−'} ${hop} = ${answer}. The frog moved ${hop} hop${hop === 1 ? '' : 's'} and landed on ${answer}.` }; }
  if (chapter === 1) { const start = Math.min(rand(41), max - 1); const hops = Math.max(1, Math.min(b, max - start)); const end = start + hops; const missing = i % 3; const answer = missing === 0 ? start : missing === 1 ? hops : end; return { id: `missing:${start}:${hops}:${missing}`, type: 'missing', start, hops, end, missing, answer, prompt: missing === 0 ? `? + ${hops} = ${end}. Which number is the start?` : missing === 1 ? `${start} + ? = ${end}. How many hops?` : `${start} + ${hops} = ?. Where do you land?`, clue: 'Count forward from the known starting number to the known landing number.', explanation: `${start} + ${hops} = ${end}; the missing number is ${answer}.` }; }
  const start1 = Math.min(rand(51), max - 1); const hops1 = Math.max(1, Math.min(b, max - start1)); const start2 = Math.min(rand(63), max - 1); const hops2 = Math.max(1, Math.min(rand(31), max - start2));
  const end1 = start1 + hops1; const end2 = start2 + hops2; const compare = i % 2 ? 'farther' : 'larger';
  const v1 = compare === 'farther' ? hops1 : end1; const v2 = compare === 'farther' ? hops2 : end2; const answer = v1 === v2 ? 'same' : v1 > v2 ? 'A' : 'B';
  return { id: `compare:${compare}:${start1}:${hops1}:${start2}:${hops2}`, type: 'compare', compare, start1, hops1, end1, start2, hops2, end2, answer, prompt: compare === 'farther' ? `Which frog travelled farther: A (${start1} to ${end1}) or B (${start2} to ${end2})?` : `Which frog landed on the larger number: A (${start1} to ${end1}) or B (${start2} to ${end2})?`, clue: compare === 'farther' ? 'Compare how many spaces each frog moved.' : 'Compare the two landing numbers.', explanation: `A moved ${hops1} spaces and landed on ${end1}. B moved ${hops2} spaces and landed on ${end2}. ${answer === 'same' ? 'They are the same.' : `${answer} is ${compare === 'farther' ? 'farther' : 'larger'}.`}` };
};
const numericOptions = (answer, max, seed) => { const candidates = [answer - 1, answer + 1, answer - 2, answer + 2, 0, max]; const distractors = seededShuffle([...new Set(candidates.filter((n) => n >= 0 && n <= max && n !== answer))], seed).slice(0, 3); return seededShuffle([answer, ...distractors], seed ^ 0x921); };
export const createNumberLineRun = ({ chapter = 0, seed = 1, recentIds = [] } = {}) => {
  if (!Number.isInteger(chapter) || chapter < 0 || chapter > 2 || !Number.isInteger(seed)) return [];
  const pool = [...new Map(Array.from({ length: 80 }, (_, i) => makeNumberRow(chapter, seed, i)).map((row) => [row.id, row])).values()];
  const required = chapter === 0 ? [(row) => row.direction === 1, (row) => row.direction === -1] : chapter === 1 ? [0, 1, 2].map((missing) => (row) => row.missing === missing) : ['larger', 'farther'].map((compare) => (row) => row.compare === compare);
  return freezeMissionMix(pool, required, recentIds, seed).map((row, i) => ({ ...row, chapter, options: row.type === 'compare' ? ['A', 'B', 'same'] : numericOptions(row.answer, chapter === 0 ? 10 : 20, seed + i * 23) }));
};
export const isKnownNumberQuestionId = (id, chapter) => {
  const parts = (id || '').split(':'); const n = parts.slice(1).map(Number);
  if (chapter === 0 && parts[0] === 'hop' && n.length === 3) { const [start, direction, hops] = n; return Number.isInteger(start) && start >= 0 && start <= 10 && (direction === -1 || direction === 1) && Number.isInteger(hops) && hops >= 1 && hops <= 10 && start + direction * hops >= 0 && start + direction * hops <= 10; }
  if (chapter === 1 && parts[0] === 'missing' && n.length === 3) { const [start, hops, missing] = n; return Number.isInteger(start) && start >= 0 && start < 20 && Number.isInteger(hops) && hops >= 1 && start + hops <= 20 && Number.isInteger(missing) && missing >= 0 && missing <= 2; }
  if (chapter === 2 && parts[0] === 'compare' && (parts[1] === 'larger' || parts[1] === 'farther') && parts.length === 6) { const [start1, hops1, start2, hops2] = parts.slice(2).map(Number); return [start1, hops1, start2, hops2].every(Number.isInteger) && start1 >= 0 && start2 >= 0 && start1 < 20 && start2 < 20 && hops1 >= 1 && hops2 >= 1 && start1 + hops1 <= 20 && start2 + hops2 <= 20; }
  return false;
};
export const isValidTimeRun = (run, chapter) => Array.isArray(run) && run.length === 6 && new Set(run.map((q) => q?.id)).size === 6 && run.every((q) => q && typeof q === 'object' && q.chapter === chapter && isKnownTimeQuestionId(q.id, chapter) && q.target?.hour >= 1 && q.target.hour <= 12 && timePool(chapter).includes(q.target.minute) && q.id === `${chapter}:${q.target.hour}:${q.target.minute}:${q.type}` && (q.type === 'read' || q.type === 'set') && Array.isArray(q.options) && q.options.length === (q.type === 'read' ? 4 : 0) && (q.type !== 'read' || new Set(q.options.map(timeLabel)).size === 4 && q.options.every((t) => t && t.hour >= 1 && t.hour <= 12 && timePool(chapter).includes(t.minute)) && q.options.filter((t) => t.hour === q.target.hour && t.minute === q.target.minute).length === 1));
export const isValidNumberLineRun = (run, chapter) => Array.isArray(run) && run.length === 6 && new Set(run.map((q) => q?.id)).size === 6 && run.every((q) => q && typeof q === 'object' && q.chapter === chapter && isKnownNumberQuestionId(q.id, chapter) && Array.isArray(q.options) && q.options.length === (q.type === 'compare' ? 3 : 4) && new Set(q.options).size === q.options.length && q.options.includes(q.answer) && (q.type === 'compare' ? q.options.every((v) => ['A', 'B', 'same'].includes(v)) : q.options.every((v) => Number.isInteger(v) && v >= 0 && v <= (chapter === 0 ? 10 : 20))) && (q.type !== 'hop' || q.id === `hop:${q.a}:${q.direction}:${q.b}` && q.answer === q.a + q.direction * q.b && q.answer >= 0 && q.answer <= 10) && (q.type !== 'missing' || q.id === `missing:${q.start}:${q.hops}:${q.missing}` && q.answer === [q.start, q.hops, q.end][q.missing] && q.end === q.start + q.hops && q.start >= 0 && q.end <= 20 && q.missing >= 0 && q.missing <= 2) && (q.type !== 'compare' || q.id === `compare:${q.compare}:${q.start1}:${q.hops1}:${q.start2}:${q.hops2}` && q.end1 === q.start1 + q.hops1 && q.end2 === q.start2 + q.hops2 && q.end1 <= 20 && q.end2 <= 20 && q.answer === (q.compare === 'farther' ? q.hops1 === q.hops2 ? 'same' : q.hops1 > q.hops2 ? 'A' : 'B' : q.end1 === q.end2 ? 'same' : q.end1 > q.end2 ? 'A' : 'B')));
