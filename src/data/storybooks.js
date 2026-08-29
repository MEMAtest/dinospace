/**
 * The first Storybook Studio acceptance batch.
 *
 * Images and narration are deliberately referenced by public URLs rather than
 * imported into the bundle. This lets the asset generation pass replace or
 * regenerate a book without changing React code, while Vite's service-worker
 * build hook still precaches the finished files for offline reading.
 */

const makePages = (slug, pages) => pages.map((page, index) => ({
  id: `${slug}-page-${index + 1}`,
  number: index + 1,
  title: page.title,
  text: page.text,
  image: `/storybooks/${slug}/page-${String(index + 1).padStart(2, '0')}.webp`,
  audio: `/storybooks/${slug}/audio-page-${String(index + 1).padStart(2, '0')}.mp3`,
}));

const STORYBOOK_SEEDS = [
  {
    slug: 'rex-missing-moon-map',
    title: 'Rex and the Missing Moon Map',
    subtitle: 'A teamwork adventure above the craters',
    summary: 'A young dinosaur astronaut follows moon clues and discovers that every explorer brings a useful idea.',
    style: 'colourful 3D animation',
    accent: 'from-indigo-700 via-violet-700 to-fuchsia-700',
    emoji: '🌙',
    pages: [
      { title: 'Moon Mission', text: 'Rex the young dinosaur astronaut packed his silver space boots and climbed into his tiny rocket. Tonight, he would map the Moon.' },
      { title: 'A Blank Space', text: 'At Moon Base Echo, Rex opened the old map. One important corner was missing. Without it, explorers might miss the safest path home.' },
      { title: 'First Clue', text: 'A bright blue feather lay beside the launch pad. Rex followed its sparkly trail past three quiet craters and a friendly Moon rock.' },
      { title: 'Tilly’s Idea', text: 'Rex met Tilly, a clever robot, near a tall ridge. Tilly noticed tiny wheel marks. “The missing piece travelled this way!” she beeped.' },
      { title: 'Across the Craters', text: 'The team bounced gently in the low gravity. Rex carried the scanner while Tilly counted the ridges. They worked carefully and never hurried.' },
      { title: 'A Wobbly Bridge', text: 'A dusty bridge stretched over a deep crater. Rex wanted to leap across, but Tilly suggested a safer route around the edge.' },
      { title: 'The Hidden Cave', text: 'Inside a shadowy cave, they found the map piece beneath a pile of glittering stones. A small Moon moth guarded it with a gentle glow.' },
      { title: 'A Map Together', text: 'Rex measured the stars. Tilly matched the lines. The Moon moth lit the corners. Soon, the lost piece fitted perfectly into the map.' },
      { title: 'The Safest Way', text: 'The finished map showed a smooth route past the craters. Rex thanked his friends. Their different ideas had made one brilliant plan.' },
      { title: 'Home Under Earthlight', text: 'Rex returned to Moon Base Echo and shared the map with every explorer. Together, they watched Earth rise and planned tomorrow’s adventure.' },
    ],
  },
  {
    slug: 'luna-whispering-forest',
    title: 'Luna and the Whispering Forest',
    subtitle: 'A gentle mystery among woodland friends',
    summary: 'Luna the fox listens closely and helps woodland friends find the kind source of a mysterious forest sound.',
    style: 'hand-painted 2D storybook',
    accent: 'from-emerald-700 via-teal-700 to-cyan-700',
    emoji: '🌲',
    pages: [
      { title: 'A Forest Whisper', text: 'Luna the fox was gathering blackberries when she heard a soft sound: “Whoooosh… whoooosh…” The forest seemed to be whispering her name.' },
      { title: 'Friends Gather', text: 'Luna asked Pip the rabbit, Moss the badger and Wren the bird to listen. Each friend heard the whisper, but from a different direction.' },
      { title: 'By the Ferns', text: 'Pip searched beside the ferns. The leaves trembled, yet no creature was hiding there. Luna marked the spot with a smooth white pebble.' },
      { title: 'Up in the Oak', text: 'Wren flew to the tallest oak. Between the branches, she found a loose nest. The wind made it rustle, but the whisper continued below.' },
      { title: 'A Shiny Trail', text: 'Moss spotted tiny drops of water on the path. They sparkled in the moonlight and led the friends towards the old stream.' },
      { title: 'The Stream Sings', text: 'At the stream, Luna heard a deeper whoosh. Water rushed around a fallen branch, making a little tunnel under the bank.' },
      { title: 'A Small Visitor', text: 'A young beaver popped out of the tunnel. He had built a dam, but one branch had slipped. “I am trying to fix it,” he said.' },
      { title: 'Helpful Paws', text: 'Luna held the branch steady. Moss pushed gently, Pip carried twigs, and Wren fetched soft leaves. Their teamwork made the dam snug again.' },
      { title: 'The Whisper Stops', text: 'The stream flowed smoothly once more. The mysterious whisper faded into a cheerful trickle, and the beaver gave everyone a grateful smile.' },
      { title: 'Listen Together', text: 'Luna learned that careful listening can solve a mystery. The friends sat quietly beneath the stars and heard the forest’s many friendly sounds.' },
    ],
  },
  {
    slug: 'nia-great-river-journey',
    title: 'Nia’s Great River Journey',
    subtitle: 'A warm wildlife adventure about sharing water',
    summary: 'Nia the young elephant follows a river, meets animal friends and learns why every living thing needs clean water.',
    style: 'realistic but warm wildlife imagery',
    accent: 'from-amber-700 via-orange-600 to-rose-600',
    emoji: '🐘',
    pages: [
      { title: 'Following the River', text: 'Nia the young elephant followed the wide river through golden grass. She wanted to see where the cool water began and where it travelled.' },
      { title: 'A Thirsty Zebra', text: 'Nia met a zebra family beside a shrinking pool. They needed water, so Nia used her trunk to clear leaves blocking a fresh stream.' },
      { title: 'The Crocodile’s Bend', text: 'At a quiet bend, a crocodile rested in the shallows. Nia kept a respectful distance and watched the river move gently around his broad back.' },
      { title: 'Birds in the Reeds', text: 'Bright birds flew from tall reeds. They showed Nia a muddy path where rainwater collected. The river was feeding many homes along its journey.' },
      { title: 'A Dry Afternoon', text: 'The sun climbed higher. Nia’s ears fanned the warm air, and the animals searched for shade. Water was precious, so everyone shared it carefully.' },
      { title: 'The Hidden Spring', text: 'A meerkat spotted green grass beneath a rocky hill. Nia dug with her feet until clear water bubbled up from a small hidden spring.' },
      { title: 'Make Room', text: 'Nia waited while the smallest animals drank first. Then the zebra, birds and crocodile took turns. There was enough when everyone was patient.' },
      { title: 'Clean Water', text: 'Nia noticed a fallen branch and loose soil near the spring. Together, the animals moved the debris away and kept the water clean.' },
      { title: 'The River’s Lesson', text: 'The spring joined the river, and the river carried water onwards. Nia saw that one careful action could help animals far beyond her herd.' },
      { title: 'A Shared Journey', text: 'Nia returned home with a happy heart. She had followed the river, met new friends and learned that water is a gift to protect together.' },
    ],
  },
].map((book) => ({
  ...book,
  ageBand: '5-6',
  basePath: `/storybooks/${book.slug}`,
  cover: `/storybooks/${book.slug}/cover.webp`,
  coverAudio: `/storybooks/${book.slug}/audio-cover.mp3`,
  pageCount: 10,
  pages: makePages(book.slug, book.pages),
}));

export const STORYBOOK_CATALOG = Object.freeze(STORYBOOK_SEEDS);

export const getStoryBook = (slug) => STORYBOOK_CATALOG.find((book) => book.slug === slug) || null;

const safeAssetPath = (value, fallback, basePath = '') => {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  // Manifests are local app data. Reject protocol and traversal values so a
  // future generated manifest cannot turn an asset into an external request.
  if (/^(?:[a-z]+:)?\/\//i.test(value) || value.includes('..')) return fallback;
  return value.startsWith('/') ? value : `${basePath}/${value.replace(/^\.\//, '')}`;
};

/**
 * Load a generated book manifest while retaining safe, bundled fallback copy.
 * The fallback makes development and a partially downloaded update readable;
 * generated images/audio remain unavailable until their files are present.
 */
export const loadStoryBookManifest = async (bookOrSlug, fetchImpl = globalThis.fetch) => {
  const seed = typeof bookOrSlug === 'string' ? getStoryBook(bookOrSlug) : bookOrSlug;
  if (!seed || typeof fetchImpl !== 'function') return seed;

  try {
    const response = await fetchImpl(`${seed.basePath}/book.json`, { cache: 'no-cache' });
    if (!response.ok) return seed;
    const raw = await response.json();
    const rawPages = Array.isArray(raw?.pages) ? raw.pages : [];
    return {
      ...seed,
      title: typeof raw?.title === 'string' && raw.title.trim() ? raw.title.trim() : seed.title,
      subtitle: typeof raw?.subtitle === 'string' && raw.subtitle.trim() ? raw.subtitle.trim() : seed.subtitle,
      summary: typeof raw?.summary === 'string' && raw.summary.trim() ? raw.summary.trim() : seed.summary,
      cover: safeAssetPath(
        typeof raw?.cover === 'string' ? raw.cover : raw?.cover?.image,
        seed.cover,
        seed.basePath,
      ),
      coverAudio: safeAssetPath(
        raw?.coverAudio || raw?.audioCover || raw?.cover?.audio,
        seed.coverAudio,
        seed.basePath,
      ),
      pages: seed.pages.map((fallbackPage, index) => {
        const page = rawPages[index] || {};
        return {
          ...fallbackPage,
          title: typeof page.title === 'string' && page.title.trim() ? page.title.trim() : fallbackPage.title,
          text: typeof page.text === 'string' && page.text.trim()
            ? page.text.trim()
            : typeof page.narration === 'string' && page.narration.trim()
              ? page.narration.trim()
              : fallbackPage.text,
          image: safeAssetPath(page.image, fallbackPage.image, seed.basePath),
          audio: safeAssetPath(page.audio || page.narrationAudio, fallbackPage.audio, seed.basePath),
        };
      }),
    };
  } catch {
    return seed;
  }
};

export const STORYBOOK_ASSET_PATHS = Object.freeze(
  STORYBOOK_CATALOG.flatMap((book) => [
    book.cover,
    book.coverAudio,
    ...book.pages.flatMap((page) => [page.image, page.audio]),
  ]),
);
