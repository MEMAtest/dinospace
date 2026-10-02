const polygon = (points, id) => ({ id, points, closed: true });
const openLine = (points, id) => ({ id, points, closed: false });

const circle = (cx, cy, radius, id, count = 48) => polygon(Array.from({ length: count }, (_, index) => {
  const angle = (index / count) * Math.PI * 2;
  return [cx + (Math.cos(angle) * radius), cy + (Math.sin(angle) * radius)];
}), id);

const star = (cx, cy, outer, inner, id, count = 5) => polygon(Array.from({ length: count * 2 }, (_, index) => {
  const angle = -Math.PI / 2 + ((index / (count * 2)) * Math.PI * 2);
  const radius = index % 2 === 0 ? outer : inner;
  return [cx + (Math.cos(angle) * radius), cy + (Math.sin(angle) * radius)];
}), id);

const heart = (id) => polygon(Array.from({ length: 48 }, (_, index) => {
  const t = (index / 48) * Math.PI * 2;
  const x = 16 * Math.sin(t) ** 3;
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return [500 + (x * 13), 345 - (y * 13)];
}), id);

const SKY_EPISODES = Object.freeze([
  Object.freeze({
    id: 'cloud-meadow', title: 'Cloud Meadow', subtitle: 'Fly around one clear outline at a time.', band: 'starter',
    missions: Object.freeze([
      Object.freeze({ id: 'sky-circle', name: 'Round Sun', icon: '☀️', shape: 'circle', paths: Object.freeze([circle(500, 330, 205, 'sun-edge')]) }),
      Object.freeze({ id: 'sky-triangle', name: 'Mountain Peak', icon: '⛰️', shape: 'triangle', paths: Object.freeze([polygon([[500, 120], [735, 535], [265, 535]], 'mountain-edge')]) }),
      Object.freeze({ id: 'sky-square', name: 'Window Cloud', icon: '🪟', shape: 'square', paths: Object.freeze([polygon([[300, 145], [700, 145], [700, 545], [300, 545]], 'window-edge')]) }),
      Object.freeze({ id: 'sky-diamond', name: 'Kite', icon: '🪁', shape: 'diamond', paths: Object.freeze([polygon([[500, 105], [735, 325], [500, 545], [265, 325]], 'kite-edge')]) }),
    ]),
  }),
  Object.freeze({
    id: 'rainbow-ridge', title: 'Rainbow Ridge', subtitle: 'Trace familiar shapes with more corners and curves.', band: 'growing',
    missions: Object.freeze([
      Object.freeze({ id: 'sky-heart', name: 'Heart Balloon', icon: '💛', shape: 'heart', paths: Object.freeze([heart('heart-edge')]) }),
      Object.freeze({ id: 'sky-star', name: 'Bright Star', icon: '⭐', shape: 'star', paths: Object.freeze([star(500, 330, 230, 100, 'star-edge')]) }),
      Object.freeze({ id: 'sky-house', name: 'Cloud House', icon: '🏠', shape: 'house', paths: Object.freeze([
        polygon([[290, 315], [500, 135], [710, 315], [710, 535], [290, 535]], 'house-wall'),
        polygon([[445, 535], [445, 390], [555, 390], [555, 535]], 'house-door'),
      ]) }),
      Object.freeze({ id: 'sky-cloud', name: 'Puffy Cloud', icon: '☁️', shape: 'cloud', paths: Object.freeze([polygon([
        [280, 465], [250, 430], [250, 375], [275, 330], [315, 310], [335, 250], [390, 215], [445, 220], [490, 265],
        [525, 195], [590, 180], [650, 210], [675, 275], [710, 285], [750, 325], [760, 385], [735, 435], [690, 465],
      ], 'cloud-edge')]) }),
    ]),
  }),
  Object.freeze({
    id: 'aurora-station', title: 'Aurora Station', subtitle: 'Put several outlines together to guide each flying machine.', band: 'challenge',
    missions: Object.freeze([
      Object.freeze({ id: 'sky-rocket', name: 'Rocket Ship', icon: '🚀', shape: 'rocket', paths: Object.freeze([
        polygon([[500, 95], [620, 265], [620, 430], [570, 485], [430, 485], [380, 430], [380, 265]], 'rocket-body'),
        polygon([[390, 365], [285, 485], [430, 450]], 'left-fin'),
        polygon([[610, 365], [715, 485], [570, 450]], 'right-fin'),
        circle(500, 300, 42, 'rocket-window', 28),
      ]) }),
      Object.freeze({ id: 'sky-airplane', name: 'Winged Jet', icon: '✈️', shape: 'airplane', paths: Object.freeze([
        openLine([[500, 115], [500, 515]], 'fuselage'),
        openLine([[500, 300], [295, 410], [315, 445], [500, 390], [685, 445], [705, 410], [500, 300]], 'main-wings'),
        openLine([[500, 445], [415, 515], [420, 535], [500, 505], [580, 535], [585, 515], [500, 445]], 'tail-wings'),
      ]) }),
      Object.freeze({ id: 'sky-castle', name: 'Sky Castle', icon: '🏰', shape: 'castle', paths: Object.freeze([
        polygon([[300, 300], [700, 300], [700, 535], [300, 535]], 'castle-wall'),
        polygon([[300, 300], [300, 215], [390, 215], [390, 300]], 'left-tower'),
        polygon([[610, 300], [610, 215], [700, 215], [700, 300]], 'right-tower'),
        polygon([[300, 215], [345, 145], [390, 215]], 'left-roof'),
        polygon([[610, 215], [655, 145], [700, 215]], 'right-roof'),
        polygon([[450, 535], [450, 420], [550, 420], [550, 535]], 'castle-door'),
      ]) }),
      Object.freeze({ id: 'sky-observatory', name: 'Moon Observatory', icon: '🔭', shape: 'observatory', paths: Object.freeze([
        polygon([[315, 380], [685, 380], [645, 525], [355, 525]], 'observatory-base'),
        polygon([[350, 380], [420, 290], [580, 290], [650, 380]], 'observatory-roof'),
        circle(500, 310, 70, 'observatory-dome', 36),
        circle(740, 185, 72, 'observatory-moon', 36),
      ]) }),
    ]),
  }),
]);

export const SKY_SHAPE_EPISODES = SKY_EPISODES;
export const SKY_SHAPE_MISSIONS = Object.freeze(SKY_EPISODES.flatMap((episode, episodeIndex) => episode.missions.map((mission, missionIndex) => Object.freeze({
  ...mission,
  episodeId: episode.id,
  episodeIndex,
  episodeTitle: episode.title,
  missionIndex,
}))));
export const SKY_SHAPE_MISSION_BY_ID = Object.freeze(Object.fromEntries(SKY_SHAPE_MISSIONS.map((mission) => [mission.id, mission])));

export const tracePointsForOutline = (outline, stepSize = 25) => {
  const vertices = outline.points;
  const edges = outline.closed ? vertices.length : Math.max(0, vertices.length - 1);
  const points = [];
  for (let edge = 0; edge < edges; edge += 1) {
    const from = vertices[edge];
    const to = vertices[(edge + 1) % vertices.length];
    const distance = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const steps = Math.max(1, Math.ceil(distance / stepSize));
    for (let index = 0; index < steps; index += 1) {
      const progress = index / steps;
      points.push([from[0] + ((to[0] - from[0]) * progress), from[1] + ((to[1] - from[1]) * progress)]);
    }
  }
  points.push([...vertices[outline.closed ? 0 : vertices.length - 1]]);
  return points;
};

export const skyAccuracyStars = (accuracy) => accuracy >= 95 ? 3 : accuracy >= 82 ? 2 : 1;

export const skyTraceProgressPercent = (guidePaths, pathIndex, cursorIndex, complete = false) => {
  const totalPoints = guidePaths.reduce((total, path) => total + path.length, 0);
  if (!totalPoints) return 0;
  if (complete) return 100;
  const passedPoints = guidePaths.slice(0, pathIndex).reduce((total, path) => total + path.length, 0) + Math.max(0, cursorIndex);
  return Math.min(100, Math.round((passedPoints / totalPoints) * 100));
};

export const skyLearningAttemptDetail = ({ level, round, seed, difficulty, missionId, accuracy, firstAttempt, hints }) => ({
  level,
  round,
  seed,
  difficulty,
  skill: 'shape-tracing',
  item: missionId,
  response: accuracy,
  expected: 100,
  correct: true,
  firstAttempt,
  independent: firstAttempt,
  hints,
});

export const createSkyRunSeed = () => {
  if (globalThis.crypto?.getRandomValues) {
    const words = new Uint32Array(1);
    globalThis.crypto.getRandomValues(words);
    return words[0] || 1;
  }
  return (Math.floor(Math.random() * 0xffffffff) >>> 0) || 1;
};

const mulberry32 = (seed) => {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
};

export const skyMissionQueueForEpisode = (episodeIndex, seed, recentIds = []) => {
  const episode = SKY_SHAPE_EPISODES[episodeIndex] || SKY_SHAPE_EPISODES[0];
  const recent = new Set(recentIds);
  const fresh = episode.missions.filter((mission) => !recent.has(mission.id));
  const source = fresh.length >= Math.min(episode.missions.length, 2) ? fresh : episode.missions;
  const queue = [...source];
  const random = mulberry32(seed);
  for (let index = queue.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [queue[index], queue[other]] = [queue[other], queue[index]];
  }
  // The recent list is stored as ordered queue history. When all four missions
  // have just been played, force a different order even if the next random seed
  // happens to produce the same permutation.
  const previousRun = recentIds.slice(-episode.missions.length);
  if (queue.length > 1 && previousRun.length === queue.length
    && queue.every((mission, index) => mission.id === previousRun[index])) {
    queue.push(queue.shift());
  }
  return queue;
};
