const city = new URL('../assets/spot-difference/superhero-city.webp', import.meta.url).href;
const dinoPark = new URL('../assets/puzzle-pop/dino-park.jpg', import.meta.url).href;
const dinoRiver = new URL('../assets/puzzle-pop/dino-river-3d.webp', import.meta.url).href;
const dinoRiverB = new URL('../assets/spot-difference/river-valley-pair-b-v1.webp', import.meta.url).href;
const dinoMoon = new URL('../assets/puzzle-pop/dino-moon-3d.webp', import.meta.url).href;
const treehouse = new URL('../assets/puzzle-pop/treehouse-robots-3d.webp', import.meta.url).href;
const soundSafari = new URL('../assets/spot-difference/sound-safari-animals-3d.webp', import.meta.url).href;
const patternParade = new URL('../assets/spot-difference/pattern-parade-landscape-v1.webp', import.meta.url).href;
const timeObservatory = new URL('../assets/spot-difference/time-observatory-landscape-v1.webp', import.meta.url).href;
const robin = new URL('../assets/puzzle-pop/robin-tree-3d.webp', import.meta.url).href;
const geography = new URL('../assets/puzzle-pop/world-explorer-map-3d.webp', import.meta.url).href;
const history = new URL('../assets/curriculum/history-world.webp', import.meta.url).href;
const nature = new URL('../assets/puzzle-pop/nature-lab-leaves-3d.webp', import.meta.url).href;

export const SPOT_DIFFERENCE_CHAPTERS = Object.freeze([
  Object.freeze({ id: 'starter', name: 'Bright-Eyed Beginners', band: 'starter', differenceCount: 3, hintTokens: 2, skill: 'Compare the big shapes and colours in both pictures.' }),
  Object.freeze({ id: 'growing', name: 'Curious Comparers', band: 'growing', differenceCount: 5, hintTokens: 2, skill: 'Look carefully at the middle and edges of each picture.' }),
  Object.freeze({ id: 'challenge', name: 'Super Spotters', band: 'challenge', differenceCount: 7, hintTokens: 2, skill: 'Check small details across the whole scene.' }),
]);

const CHANGE_TEMPLATES = Object.freeze([
  { id: 'moon-sun', label: 'the moon became a sun', normalVisual: 'moon', visual: 'sun' },
  { id: 'star-heart', label: 'the star became a heart', normalVisual: 'star', visual: 'heart' },
  { id: 'flag', label: 'the flag changed', normalVisual: 'flag-normal', visual: 'flag' },
  { id: 'mask', label: 'the mask changed colour', normalVisual: 'mask-normal', visual: 'mask' },
  { id: 'bolt-star', label: 'the lightning bolt became a star', normalVisual: 'bolt', visual: 'star' },
  { id: 'flower', label: 'the flower became a sun', normalVisual: 'flower', visual: 'sun' },
  { id: 'cloud-moon', label: 'the cloud became a moon', normalVisual: 'cloud', visual: 'moon' },
]);

const CHANGE_POSITIONS = Object.freeze([
  { x: 17, y: 18 }, { x: 50, y: 17 }, { x: 82, y: 19 },
  { x: 22, y: 50 }, { x: 77, y: 51 }, { x: 20, y: 82 }, { x: 79, y: 81 },
]);

const CHALLENGE_DETAILS = Object.freeze({
  8: Object.freeze([
    { label: 'the sun has a different number of rays', before: 'sun:rays7', after: 'sun:rays9' },
    { label: 'the canopy leaf points in a different direction', before: 'leaf:point-left', after: 'leaf:point-right' },
    { label: 'the flower has a different number of petals', before: 'flower:petals5', after: 'flower:petals6' },
    { label: 'the small leaf has a different shape', before: 'leaf:round', after: 'leaf:pointed' },
    { label: 'the worm bends the other way', before: 'worm:curve-left', after: 'worm:curve-right' },
    { label: 'the ladybird has one more spot', before: 'ladybug:spots2', after: 'ladybug:spots3' },
    { label: 'the leaf has a different number of veins', before: 'leaf:veins3', after: 'leaf:veins5' },
  ]),
  9: Object.freeze([
    { label: 'the compass needle points in a different direction', before: 'compass:north', after: 'compass:east' },
    { label: 'the map river takes a different route', before: 'route:bend1', after: 'route:bend2' },
    { label: 'the map has one more tree symbol', before: 'trees:count2', after: 'trees:count3' },
    { label: 'the mountain range has a different number of peaks', before: 'mountains:peaks2', after: 'mountains:peaks3' },
    { label: 'the destination marker has a different shape', before: 'marker:circle', after: 'marker:flag' },
    { label: 'the binoculars point a different way', before: 'binoculars:upright', after: 'binoculars:tilted' },
    { label: 'the map has a different number of route bends', before: 'route:bend2', after: 'route:bend3' },
  ]),
  10: Object.freeze([
    { label: 'the book is open instead of closed', before: 'book:closed', after: 'book:open' },
    { label: 'the ruin has a different number of archways', before: 'arches:count2', after: 'arches:count3' },
    { label: 'the compass needle points in a different direction', before: 'compass:north', after: 'compass:west' },
    { label: 'the stone has a different shape', before: 'stone:round', after: 'stone:square' },
    { label: 'the lantern has a different number of flames', before: 'lantern:flame1', after: 'lantern:flame2' },
    { label: 'the scroll is rolled instead of open', before: 'scroll:open', after: 'scroll:rolled' },
    { label: 'the column has a different number of grooves', before: 'column:grooves2', after: 'column:grooves4' },
  ]),
  11: Object.freeze([
    { label: 'the leaf sample has a different shape', before: 'leaf:heart', after: 'leaf:oak' },
    { label: 'the leaf has a different number of veins', before: 'leaf:veins3', after: 'leaf:veins5' },
    { label: 'the seedling has a different number of leaves', before: 'sprout:leaves2', after: 'sprout:leaves3' },
    { label: 'the flower has a different number of petals', before: 'flower:petals5', after: 'flower:petals7' },
    { label: 'the watering can has a different number of drops', before: 'drops:count1', after: 'drops:count2' },
    { label: 'the potted plant has a different number of leaves', before: 'sprout:leaves2', after: 'sprout:leaves4' },
    { label: 'the leaf sample points a different way', before: 'leaf:upright', after: 'leaf:sideways' },
  ]),
});

const makeDifferences = (sceneIndex, count) => Array.from({ length: count }, (_, position) => {
  const templateIndex = (position + sceneIndex * 2) % CHANGE_TEMPLATES.length;
  const template = CHANGE_TEMPLATES[templateIndex];
  const challengeDetail = CHALLENGE_DETAILS[sceneIndex]?.[position];
  if (challengeDetail) return Object.freeze({
    id: `${sceneIndex}-${template.id}`,
    label: challengeDetail.label,
    normalVisual: `prop:${challengeDetail.before}`,
    visual: `prop:${challengeDetail.after}`,
    ...CHANGE_POSITIONS[(position + sceneIndex) % CHANGE_POSITIONS.length],
    radius: 8,
  });
  return Object.freeze({
    ...template,
    id: `${sceneIndex}-${template.id}`,
    ...CHANGE_POSITIONS[(position + sceneIndex) % CHANGE_POSITIONS.length],
    radius: 8,
  });
});

const makeScene = (chapterIndex, sceneIndex, title, image, alt, fact, pair = null) => {
  const chapter = SPOT_DIFFERENCE_CHAPTERS[chapterIndex];
  return Object.freeze({
    id: `spot-${sceneIndex + 1}`,
    chapterId: chapter.id,
    chapterIndex,
    title,
    image,
    alt,
    fact,
    ...(pair ? { ...(pair.aspectRatio ? { aspectRatio: pair.aspectRatio } : {}), ...(pair.imageB ? { imageB: pair.imageB } : {}), pairedArt: true, ...(pair.colorEdits ? { colorEdits: Object.freeze(pair.colorEdits.map((edit) => Object.freeze(edit))) } : {}), ...(pair.editRegions ? { editRegions: Object.freeze(pair.editRegions.map((region) => Object.freeze(region))) } : {}) } : {}),
    differences: Object.freeze(pair?.differences || makeDifferences(sceneIndex, chapter.differenceCount)),
  });
};

const DINO_PARK_OUTLINE = Object.freeze([
  [9.6, 24.4], [8.6, 24.7], [8.6, 26.5], [6.9, 27.6], [6.3, 29.4], [6.4, 31.4], [7.2, 32.3], [8.8, 32.6],
  [13.2, 35.1], [14.2, 44.8], [15.9, 54.3], [16, 65.8], [16, 72.6], [14.5, 78.1], [14.3, 81.4], [15.3, 82.7],
  [19.3, 82.9], [21.6, 82], [22.7, 80], [22.9, 78.7], [25.5, 77.6], [28, 77.8], [29.2, 80.5], [32.9, 81.4],
  [36.3, 81.4], [37.9, 80.3], [38.3, 77.5], [37.5, 72], [37.3, 67.2], [40, 70], [43.2, 72.7], [48.4, 73.7],
  [51.4, 72.8], [52.3, 71.4], [51.9, 71], [50.8, 71.9], [48.6, 72.1], [45.8, 70.7], [41.6, 67.9], [38.7, 63.8],
  [35.2, 60.2], [31, 56.5], [27.8, 55], [21.8, 55], [20.3, 53.3], [19.6, 46.6], [17.3, 34.7], [16.4, 31.9],
  [15.7, 28.1], [14.3, 25.1], [12.4, 24.1],
].map((point) => Object.freeze(point)));

// Trace in native source pixels: the visual boundary excludes the sky above
// the crown and the water gaps between the feet. The touch polygon remains
// generous so a child can select any part of the depicted dinosaur.
const DINO_PARK_COLOUR_PATH = 'M141 265 C149 261 164 261 176 263 C201 267 220 296 239 338 C257 396 269 485 283 547 C294 579 303 589 319 593 C361 585 394 593 431 608 C481 630 512 657 538 685 C581 731 619 771 650 782 L649 823 C616 821 581 809 546 793 C545 820 557 854 557 888 C556 896 547 899 534 900 L488 900 C481 899 481 890 485 879 C491 868 492 860 488 845 L477 809 C451 810 420 807 397 805 L389 849 L381 871 L350 882 L321 899 L304 901 C302 896 306 884 311 877 L320 856 L324 802 L303 796 C299 817 296 839 294 858 L291 886 C290 897 281 900 270 900 L212 898 C210 891 213 881 220 872 L231 852 L233 726 C221 694 214 642 209 587 L199 478 C194 425 185 386 174 368 C157 376 139 377 120 371 C110 368 110 357 117 353 C103 352 97 348 94 341 C90 329 94 311 103 302 C114 294 125 294 132 285 Z';

export const SPOT_DIFFERENCE_SCENES = Object.freeze([
  makeScene(0, 0, 'Superhero City', city, 'A colourful city with friendly heroes', 'People help their community by sharing and caring for the places where they live.', {
    colorEdits: [
      { shape: 'path', d: 'M65.4 19.0 C66.5 17.8 67.3 15.5 70.3 14.5 C72.1 13.8 73.8 14.5 74.3 15.8 C72.0 16.0 71.5 17.4 71.5 19.3 C71.6 21.5 70.9 22.6 68.3 23.3 L65.3 22.2 Z', hue: 45 },
      { shape: 'path', d: 'M18.0 23.4 C18.5 20.0 20.1 18.2 22.2 18.2 C24.6 18.2 26.1 20.2 26.5 23.4 L24.0 22.8 L22.5 21.9 L20.4 22.7 Z', hue: 210 },
      { shape: 'path', d: 'M66.8 73.6 L75.3 73.6 L76.1 78.3 L66.1 78.3 L66.1 75.2 Z', hue: 125 },
    ],
    differences: [
      Object.freeze({ id: 'city-cape', label: 'the flying hero cape changed colour', normalVisual: 'scene:red-cape', visual: 'scene:gold-cape', x: 70, y: 18, radius: 8 }),
      Object.freeze({ id: 'city-dome', label: 'the tower dome changed colour', normalVisual: 'scene:red-dome', visual: 'scene:blue-dome', x: 22, y: 21, radius: 8 }),
      Object.freeze({ id: 'city-awning', label: 'the shop awning changed colour', normalVisual: 'scene:red-awning', visual: 'scene:green-awning', x: 71, y: 76, radius: 8 }),
    ],
  }),
  makeScene(0, 1, 'Dino Park', dinoPark, 'Friendly dinosaurs in a sunny park', 'Fossils are clues that help scientists learn about dinosaurs.', {
    colorEdits: [
      // Colour selection protects the pale underside, eyes and neighbouring plants.
      { shape: 'path', d: DINO_PARK_COLOUR_PATH, transform: 'scale(0.06906077348 0.09208103131)', hue: 70, alphaMatrix: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -2 -3 5 0 -0.4' },
      { shape: 'ellipse', cx: 86.5, cy: 14.4, rx: 4.2, ry: 5.7, hue: -30 },
      { shape: 'rect', x: 12.2, y: 87.5, width: 8.8, height: 10.5, hue: 150, alphaMatrix: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 4 -8 4 0 -0.8' },
    ],
    differences: [
      Object.freeze({ id: 'park-dinosaur', label: 'the long-neck dinosaur changed colour', normalVisual: 'scene:blue-dinosaur', visual: 'scene:purple-dinosaur', x: 28, y: 65, radius: 8, hitPolygon: DINO_PARK_OUTLINE }),
      Object.freeze({ id: 'park-sun', label: 'the sun changed colour', normalVisual: 'scene:yellow-sun', visual: 'scene:orange-sun', x: 86, y: 14, radius: 8 }),
      Object.freeze({ id: 'park-flower', label: 'the flower petals changed colour', normalVisual: 'scene:pink-flower', visual: 'scene:blue-flower', x: 16, y: 86, radius: 8 }),
    ],
  }),
  makeScene(0, 2, 'River Valley', dinoRiver, 'A dinosaur beside a sparkling river', 'A clean river gives plants and animals a place to find fresh water.', {
    imageB: dinoRiverB,
    // Render only these authored edits over the unchanged original scene.
    // Generated full-image redraws must never move unrelated background objects.
    editRegions: [
      { x: 75, y: 0, width: 25, height: 28, feather: 2 },
      { x: 4, y: 80, width: 17, height: 18, feather: 1 },
      { x: 39, y: 44, width: 5, height: 9, feather: 0.3 },
    ],
    differences: [
      Object.freeze({ id: 'river-sky', label: 'the sun became a crescent moon', normalVisual: 'scene:sun', visual: 'scene:crescent', x: 87, y: 14, radius: 8 }),
      Object.freeze({ id: 'river-flower', label: 'the flower petals changed from pink to yellow', normalVisual: 'scene:pink-flower', visual: 'scene:yellow-flower', x: 13, y: 86, radius: 8 }),
      Object.freeze({ id: 'river-bridge', label: 'one upright bridge railing post is missing', normalVisual: 'scene:bridge-post', visual: 'scene:no-post', x: 41, y: 49, radius: 8 }),
    ],
  }),
  makeScene(0, 3, 'Moon Camp', dinoMoon, 'A dinosaur exploring a moon camp', 'The Moon is a rocky world that travels around Earth.', {
    // Change only original object surfaces. Preserve silhouettes, highlights and surroundings.
    colorEdits: [
      { shape: 'ellipse', cx: 15.8, cy: 20.8, rx: 3.6, ry: 5.0, hue: 220 },
      { shape: 'path', d: 'M54.4 63.5 L60.8 63.3 L62.1 67.1 L55.8 67.4 Z', hue: 150 },
      { shape: 'rect', x: 85.6, y: 53.7, width: 2.7, height: 4.3, rx: 0.4, hue: 60 },
    ],
    differences: [
      Object.freeze({ id: 'moon-porthole', label: 'the rocket window glass changed colour', normalVisual: 'scene:blue-glass', visual: 'scene:green-glass', x: 16, y: 21, radius: 8 }),
      Object.freeze({ id: 'moon-panel', label: 'the rover solar panel changed colour', normalVisual: 'scene:blue-panel', visual: 'scene:orange-panel', x: 58, y: 65, radius: 8 }),
      Object.freeze({ id: 'moon-window', label: 'the habitat window changed colour', normalVisual: 'scene:yellow-window', visual: 'scene:green-window', x: 87, y: 56, radius: 8 }),
    ],
  }),
  makeScene(1, 4, 'Treehouse Team', treehouse, 'A young astronaut and robot sharing arrow blocks in a treehouse workshop', 'Taking turns helps everyone share a game or a job.', {
    // Native 1254-square source coordinates mapped into the centered 4:3 crop.
    colorEdits: [
      { shape: 'path', d: 'M323 812 L489 798 Q505 801 508 821 L508 912 Q505 925 483 929 L339 937 Q322 935 322 917 Z', transform: 'matrix(0.07974481659 0 0 0.1063264221 0 -16.66666667)', hue: 90, alphaMatrix: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -2 -3 5 0 -0.4' },
      { shape: 'path', d: 'M709 780 L783 753 L858 772 L881 801 L881 853 Q875 863 754 876 Q739 875 735 861 Z', transform: 'matrix(0.07974481659 0 0 0.1063264221 0 -16.66666667)', hue: 100, alphaMatrix: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -3 5 -2 0 -0.4' },
      { shape: 'path', d: 'M1049 547 Q1121 529 1203 543 L1204 570 L1188 646 Q1180 667 1128 668 Q1076 666 1065 649 Z', transform: 'matrix(0.07974481659 0 0 0.1063264221 0 -16.66666667)', hue: 150, alphaMatrix: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 4 -2 -2 0 -0.4' },
      { shape: 'rect', x: 680, y: 461, width: 173, height: 118, rx: 24, transform: 'matrix(0.07974481659 0 0 0.1063264221 0 -16.66666667)', hue: 100, alphaMatrix: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -5 2 3 0 -0.6' },
      { shape: 'path', d: 'M975 313 L1008 267 L1032 271 L1054 307 L1053 312 Z', transform: 'matrix(0.07974481659 0 0 0.1063264221 0 -16.66666667)', hue: 190, alphaMatrix: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 4 -2 -2 0 -0.4' },
    ],
    differences: [
      Object.freeze({ id: 'treehouse-blue-block', label: 'the left arrow block changed colour', normalVisual: 'scene:blue-block', visual: 'scene:purple-block', x: 33, y: 75, radius: 8 }),
      Object.freeze({ id: 'treehouse-green-block', label: 'the up-arrow block changed colour', normalVisual: 'scene:green-block', visual: 'scene:blue-block', x: 63, y: 69, radius: 8 }),
      Object.freeze({ id: 'treehouse-pot', label: 'the plant pot changed colour', normalVisual: 'scene:orange-pot', visual: 'scene:blue-pot', x: 90, y: 50, radius: 8 }),
      Object.freeze({ id: 'treehouse-robot', label: 'the robot eyes and smile changed colour', normalVisual: 'scene:cyan-face', visual: 'scene:pink-face', x: 61.5, y: 38, radius: 8 }),
      Object.freeze({ id: 'treehouse-roof', label: 'the little house roof changed colour', normalVisual: 'scene:red-roof', visual: 'scene:blue-roof', x: 83, y: 16, radius: 8 }),
    ],
  }),
  makeScene(1, 5, 'Sound Safari', soundSafari, 'An elephant, monkey, bird and frog making sounds beside a waterfall', 'Animals use different sounds to communicate with one another.', {
    // Keep the complete animal composition: no parrot cropped at the top.
    aspectRatio: 1,
    colorEdits: [
      { shape: 'path', d: 'M244 486 C210 471 170 482 130 501 C82 526 44 565 38 602 C29 635 50 651 78 654 C122 657 140 686 187 704 C219 716 248 704 266 678 L266 572 Z', transform: 'scale(0.07974481659)', hue: 180 },
      { shape: 'path', d: 'M780 80 C786 71 796 80 807 91 L837 120 L870 136 L881 159 L905 168 L911 213 L890 231 L872 216 L858 231 L842 219 L831 222 L822 207 L808 207 L801 192 L787 184 L790 169 L778 161 L784 147 L774 143 L779 128 L792 132 L784 116 Z', transform: 'scale(0.07974481659)', hue: 100, alphaMatrix: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -2 -3 5 0 -0.4' },
      { shape: 'ellipse', cx: 1012, cy: 566, rx: 39, ry: 42, transform: 'scale(0.07974481659)', hue: 170 },
      { shape: 'path', d: 'M917 895 Q924 877 941 872 Q938 855 951 848 Q970 842 982 865 L994 871 Q1003 858 1019 859 Q1045 865 1046 897 Q1072 914 1076 940 Q1110 943 1125 970 Q1143 1000 1128 1047 L1124 1068 L1104 1075 L1089 1078 L1063 1073 L1050 1059 L1027 1068 L1008 1079 L992 1074 L996 1055 L1005 1035 L995 1006 L967 1006 L956 1039 L943 1058 L914 1065 L909 1058 L916 1045 L927 1034 L927 984 L925 944 Q911 934 909 920 L908 905 Z', transform: 'scale(0.07974481659)', hue: 140, alphaMatrix: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -3 5 -2 0 -0.5' },
      { shape: 'path', d: 'M202 976 a11 14 0 1 0 22 0 a11 14 0 1 0 -22 0 M228 981 a17 15 0 1 0 34 0 a17 15 0 1 0 -34 0 M262 982 a18 15 0 1 0 36 0 a18 15 0 1 0 -36 0 M299 972 a9 14 0 1 0 18 0 a9 14 0 1 0 -18 0 M390 972 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 M424 973 a17 14 0 1 0 34 0 a17 14 0 1 0 -34 0 M464 969 a16 13 0 1 0 32 0 a16 13 0 1 0 -32 0', transform: 'scale(0.07974481659)', hue: 100 },
    ],
    differences: [
      Object.freeze({ id: 'safari-ear', label: 'the elephant inner ear changed colour', normalVisual: 'scene:pink-ear', visual: 'scene:cyan-ear', x: 17, y: 50, radius: 8 }),
      Object.freeze({ id: 'safari-wing', label: 'the parrot left wing feathers changed colour', normalVisual: 'scene:blue-wing', visual: 'scene:purple-wing', x: 67, y: 14, radius: 8 }),
      Object.freeze({ id: 'safari-belly', label: 'the monkey tummy changed colour', normalVisual: 'scene:cream-belly', visual: 'scene:cyan-belly', x: 80, y: 45, radius: 8 }),
      Object.freeze({ id: 'safari-frog', label: 'the frog skin changed colour', normalVisual: 'scene:green-frog', visual: 'scene:purple-frog', x: 82, y: 77, radius: 8 }),
      Object.freeze({ id: 'safari-toes', label: 'the elephant toenails changed colour', normalVisual: 'scene:cream-toes', visual: 'scene:green-toes', x: 35, y: 78, radius: 8 }),
    ],
  }),
  makeScene(1, 6, 'Pattern Parade', patternParade, 'A sunny festival courtyard with star pennants, an arch, balloons, a parade drum and a shop canopy', 'Repeating patterns follow a rule that we can describe.', {
    colorEdits: [
      { shape: 'path', d: 'M155 164 L301 177 L293 525 L231 464 L165 529 Z', transform: 'scale(0.06906077348 0.09208103131)', hue: 110, alphaMatrix: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -1 -4 5 0 -0.4' },
      { shape: 'ellipse', cx: 733, cy: 320, rx: 44, ry: 44, transform: 'scale(0.06906077348 0.09208103131)', hue: 120, alphaMatrix: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -1 -4 5 0 -0.4' },
      { shape: 'path', d: 'M1179 482 C1234 482 1262 603 1234 640 C1214 667 1175 661 1148 636 C1109 603 1099 540 1110 509 C1121 484 1149 475 1179 482 Z', transform: 'scale(0.06906077348 0.09208103131)', hue: 100, alphaMatrix: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -2 -3 5 0 -0.4' },
      { shape: 'path', d: 'M737 842 Q825 855 911 841 L901 936 Q826 961 747 942 Z', transform: 'scale(0.06906077348 0.09208103131)', hue: 190, alphaMatrix: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 4 -2 -2 0 -0.4' },
      { shape: 'path', d: 'M1320 258 L1448 232 L1448 428 Q1437 437 1420 420 Q1399 449 1375 423 Q1352 454 1328 432 Q1300 466 1275 440 Q1246 467 1229 446 Q1201 457 1186 433 L1186 387 Z', transform: 'scale(0.06906077348 0.09208103131)', hue: 150, alphaMatrix: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 4 -8 4 0 -0.8' },
    ],
    differences: [
      Object.freeze({ id: 'parade-pennant', label: 'the large left pennant cloth changed colour', normalVisual: 'scene:purple-cloth', visual: 'scene:teal-cloth', x: 16, y: 32, radius: 8 }),
      Object.freeze({ id: 'parade-medallion', label: 'the round arch medallion behind the star changed colour', normalVisual: 'scene:purple-medallion', visual: 'scene:teal-medallion', x: 51, y: 29, radius: 8 }),
      Object.freeze({ id: 'parade-balloon', label: 'the blue balloon changed colour', normalVisual: 'scene:blue-balloon', visual: 'scene:purple-balloon', x: 81, y: 53, radius: 8 }),
      Object.freeze({ id: 'parade-drum', label: 'the parade drum body changed colour', normalVisual: 'scene:red-drum', visual: 'scene:blue-drum', x: 57, y: 81, radius: 8 }),
      Object.freeze({ id: 'parade-awning', label: 'the pink shop canopy stripes changed colour', normalVisual: 'scene:pink-canopy', visual: 'scene:green-canopy', x: 90, y: 25, radius: 8 }),
    ],
  }),
  makeScene(1, 7, 'Time Observatory', timeObservatory, 'A landscape observatory with a hanging planet model, Earth globe, telescope, books and an hourglass', 'Earth turns once each day, bringing daylight and darkness.', {
    colorEdits: [
      { shape: 'ellipse', cx: 411, cy: 206, rx: 64, ry: 65, transform: 'scale(0.06906077348 0.09208103131)', hue: 150 },
      { shape: 'ellipse', cx: 357, cy: 674, rx: 126, ry: 128, transform: 'scale(0.06906077348 0.09208103131)', hue: 90, alphaMatrix: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -2 -3 5 0 -0.4' },
      { shape: 'path', d: 'M969 405 L1023 435 L1001 478 L953 448 Z', transform: 'scale(0.06906077348 0.09208103131)', hue: 120, alphaMatrix: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -2 -3 5 0 -0.4' },
      { shape: 'path', d: 'M636 783 L791 772 L857 783 L854 822 L794 839 L640 827 Q627 820 629 798 Z', transform: 'scale(0.06906077348 0.09208103131)', hue: 160, alphaMatrix: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -2 -3 5 0 -0.4' },
      { shape: 'path', d: 'M1170 716 Q1228 726 1284 716 L1264 755 L1233 793 L1263 856 L1283 893 Q1228 912 1171 892 L1192 851 L1217 793 L1194 751 Z', transform: 'scale(0.06906077348 0.09208103131)', hue: 110, alphaMatrix: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -1 -4 5 0 -0.4' },
    ],
    differences: [
      Object.freeze({ id: 'observatory-model', label: 'the hanging planet model changed colour', normalVisual: 'scene:gold-planet', visual: 'scene:cyan-planet', x: 28, y: 19, radius: 8 }),
      Object.freeze({ id: 'observatory-globe', label: 'the globe ocean colour changed', normalVisual: 'scene:blue-oceans', visual: 'scene:purple-oceans', x: 25, y: 63, radius: 8 }),
      Object.freeze({ id: 'observatory-telescope', label: 'the large telescope barrel changed colour', normalVisual: 'scene:blue-barrel', visual: 'scene:green-barrel', x: 69, y: 40, radius: 8 }),
      Object.freeze({ id: 'observatory-book', label: 'the top book cover changed colour', normalVisual: 'scene:blue-book', visual: 'scene:red-book', x: 51, y: 75, radius: 8 }),
      Object.freeze({ id: 'observatory-sand', label: 'the hourglass sand changed colour', normalVisual: 'scene:purple-sand', visual: 'scene:cyan-sand', x: 85, y: 73, radius: 8 }),
    ],
  }),
  makeScene(2, 8, 'Robin’s Woodland', robin, 'A robin pecking at soil beneath a tree among flowers and woodland plants', 'Robins use their beaks to find food and build safe nests.'),
  makeScene(2, 9, 'World Explorer', geography, 'An explorer workbench with a picture-symbol map and an Earth globe', 'Maps use symbols and labels to show useful information about places.'),
  makeScene(2, 10, 'History Hall', history, 'Ancient ruins with books, maps and a compass', 'Old objects can be clues about how people lived long ago.'),
  makeScene(2, 11, 'Nature Lab', nature, 'A sunny plant workbench with differently shaped leaves, seedlings and roots', 'Plants need light and water to grow.'),
]);

export const resolveSpotDifferenceTap = (differences, foundIds, x, y) => {
  const found = new Set(foundIds);
  const withinTolerance = (entry) => {
    if (Math.hypot(x - entry.x, y - entry.y) <= entry.radius) return true;
    if (!entry.hitPolygon) return false;
    let inside = false;
    for (let index = 0, previous = entry.hitPolygon.length - 1; index < entry.hitPolygon.length; previous = index++) {
      const [ax, ay] = entry.hitPolygon[index];
      const [bx, by] = entry.hitPolygon[previous];
      if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
    }
    return inside;
  };
  const alreadyFound = differences.find((entry) => found.has(entry.id) && withinTolerance(entry));
  if (alreadyFound) return { kind: 'already-found', difference: alreadyFound };
  const difference = differences.find((entry) => !found.has(entry.id) && withinTolerance(entry));
  return difference ? { kind: 'new', difference } : { kind: 'miss', difference: null };
};

export const SPOT_DIFFERENCE_PROGRESS_KEY = 'amari_spot_difference_batch2_v1';

export const spotAnswerAttemptDetail = ({ level, round, seed, correct, hadMistake }) => ({
  level,
  round,
  seed,
  correct,
  firstAttempt: !hadMistake,
});

export const spotDifferenceCompletionMessage = ({ chapterComplete = false, chapterName, praise } = {}) => (
  chapterComplete
    ? `${praise} ${chapterName} complete! Your picture fact is below.`
    : 'Picture pair complete! Your fact is below. Choose Next picture when you are ready.'
);

export const getNextSpotDifferenceHint = (differences, foundIds = [], hintedIds = []) => {
  const unavailable = new Set([...foundIds, ...hintedIds]);
  return differences.find(({ id }) => !unavailable.has(id)) || null;
};

export const spotDifferenceRandomFor = (seed) => {
  let state = (Number(seed) >>> 0) || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

export const shuffleSpotDifference = (items, seed) => {
  const random = spotDifferenceRandomFor(seed);
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
};

const readState = (storage) => {
  try {
    const value = JSON.parse(storage?.getItem(SPOT_DIFFERENCE_PROGRESS_KEY) || '{}');
    return value?.version === 1 && value.children && typeof value.children === 'object' ? value : { version: 1, children: {} };
  } catch {
    return { version: 1, children: {} };
  }
};

export const getSpotDifferenceLastQueue = (playerId, storage = globalThis.localStorage) => {
  const state = readState(storage);
  const queue = state.children[playerId || 'amari']?.lastQueue;
  return Array.isArray(queue) ? queue.filter((id) => typeof id === 'string') : [];
};

export const getSpotDifferenceProgress = (playerId, storage = globalThis.localStorage) => {
  const state = readState(storage);
  const child = state.children[playerId || 'amari'] || {};
  return {
    unlockedChapter: Number.isInteger(child.unlockedChapter) ? Math.min(2, Math.max(0, child.unlockedChapter)) : 0,
    completedSceneIds: Array.isArray(child.completedSceneIds) ? [...new Set(child.completedSceneIds.filter((id) => typeof id === 'string'))] : [],
    lastCompletedSceneId: typeof child.lastCompletedSceneId === 'string' ? child.lastCompletedSceneId : undefined,
    lastQueue: Array.isArray(child.lastQueue) ? child.lastQueue.filter((id) => typeof id === 'string') : [],
  };
};

export const saveSpotDifferenceQueue = (playerId, queue, storage = globalThis.localStorage) => {
  const state = readState(storage);
  const key = playerId || 'amari';
  const existing = state.children[key] && typeof state.children[key] === 'object' ? state.children[key] : {};
  state.children[key] = { ...existing, lastQueue: queue.map(({ id }) => id) };
  try { storage?.setItem(SPOT_DIFFERENCE_PROGRESS_KEY, JSON.stringify(state)); } catch { /* The scene queue still works without storage. */ }
};

export const completeSpotDifferenceChapter = (playerId, chapterIndex, completedSceneIds, storage = globalThis.localStorage) => {
  const state = readState(storage);
  const key = playerId || 'amari';
  const child = state.children[key] && typeof state.children[key] === 'object' ? state.children[key] : {};
  const before = Number.isInteger(child.unlockedChapter) ? Math.min(2, Math.max(0, child.unlockedChapter)) : 0;
  const sceneIds = SPOT_DIFFERENCE_SCENES.filter((scene) => scene.chapterIndex === chapterIndex).map(({ id }) => id);
  const newlyCompleted = [...new Set([...(Array.isArray(child.completedSceneIds) ? child.completedSceneIds : []), ...completedSceneIds])];
  const chapterComplete = sceneIds.length > 0 && sceneIds.every((id) => newlyCompleted.includes(id));
  const unlockedChapter = chapterComplete ? Math.min(2, Math.max(before, chapterIndex + 1)) : before;
  state.children[key] = { ...child, unlockedChapter, completedSceneIds: newlyCompleted, lastCompletedSceneId: completedSceneIds.at(-1) || child.lastCompletedSceneId };
  try { storage?.setItem(SPOT_DIFFERENCE_PROGRESS_KEY, JSON.stringify(state)); } catch { /* Keep the current run playable if storage is full. */ }
  return { ...getSpotDifferenceProgress(playerId, storage), chapterComplete, newlyUnlocked: unlockedChapter > before };
};

export const createSpotDifferenceRun = (chapterIndex, seed, previousQueue = [], lastCompletedSceneId = previousQueue.at(-1)) => {
  const chapter = SPOT_DIFFERENCE_CHAPTERS[chapterIndex] || SPOT_DIFFERENCE_CHAPTERS[0];
  const scenes = SPOT_DIFFERENCE_SCENES.filter((scene) => scene.chapterIndex === chapterIndex);
  let ordered = shuffleSpotDifference(scenes, seed);
  // Fix the new run at Start; never reorder the active scene or its targets.
  for (let attempt = 0; attempt < ordered.length && ordered.length > 1; attempt += 1) {
    const repeatedOrder = ordered.map(({ id }) => id).join('|') === previousQueue.join('|');
    if (ordered[0].id !== lastCompletedSceneId && !repeatedOrder) break;
    ordered = [...ordered.slice(1), ordered[0]];
  }
  return ordered.map((scene, index) => ({
    ...scene,
    differences: shuffleSpotDifference(scene.differences, (seed + (index + 1) * 997) >>> 0),
    chapter,
  }));
};
