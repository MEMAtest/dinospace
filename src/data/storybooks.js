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
      {"title": "Page 1", "text": "Rex the young T-Rex astronaut loved exploring. Today he landed his little rocket on the silvery Moon, with his best friend Pip the robot rolling happily beside him."},
      {"title": "Page 2", "text": "\"Time to fly home,\" said Rex. He reached into his pocket for his star map, which showed the way back to Earth. But the pocket was empty. The map was gone!"},
      {"title": "Page 3", "text": "\"Don't worry,\" said Pip kindly. \"We can find it together. I saw a sparkly corner near the big crater!\" Rex smiled. Clues were much easier with a friend."},
      {"title": "Page 4", "text": "At the big crater, something glimmered in the dust. It was a shiny corner of paper! As Rex stepped closer, his boot nudged the dust, and the paper slipped downhill."},
      {"title": "Page 5", "text": "Rex tried to reach it, but his arms were too short. Pip rolled after it, but the dusty slope was too steep for little tracks. They stopped and thought together."},
      {"title": "Page 6", "text": "\"I have an idea,\" said Rex. \"You are small and steady. I am tall and strong. If we hold hands, we can reach it together!\" Pip beeped happily. Teamwork time!"},
      {"title": "Page 7", "text": "Carefully, slowly, Rex held Pip out over the slope. Pip's little gripper arm stretched, stretched, stretched... and caught the paper corner! Up they came together, safe and sound."},
      {"title": "Page 8", "text": "The map was a little crumpled, but every star was still there. \"Look!\" said Rex. \"The map shows a path to a quiet crater. That sounds like the perfect rest stop.\""},
      {"title": "Page 9", "text": "They followed the dotted line across the silver hills, past small craters, all the way to their little rocket waiting patiently under the stars."},
      {"title": "Page 10", "text": "Rex tucked the map safely away and patted Pip's warm metal head. \"We did it together,\" he said. And the two friends flew home, sleepy, smiling, and ready for the next adventure."}
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
      {"title": "Page 1", "text": "One evening, Luna the fox heard a whisper. It floated through the trees like a falling leaf. “Who’s there?” she asked. But only the wind answered. Her whiskers twitched with curiosity."},
      {"title": "Page 2", "text": "Luna padded along the winding path. The whisper grew louder. “This way,” it seemed to say. She followed it past gnarled oaks and soft mossy stones, her heart beating fast with excitement."},
      {"title": "Page 3", "text": "In a clearing, Luna met Barnaby the badger. “Did you hear it too?” he asked, holding up his lantern. Pip the robin fluttered down. “It woke me from my nap!” he chirped. They all listened together."},
      {"title": "Page 4", "text": "The whisper led them to an ancient hollow tree. A soft, blue light glowed from its roots. “It’s coming from in there,” whispered Luna. Barnaby’s eyes grew wide. Pip hid behind his ear."},
      {"title": "Page 5", "text": "Inside, they found a tiny whirlwind of blue light. It was trapped beneath a heavy branch. “Oh dear,” said Barnaby. “It’s a wind sprite. It’s stuck!” The sprite shimmered weakly, its whisper now a sad sigh."},
      {"title": "Page 6", "text": "“We must help it,” said Luna. Barnaby pushed with his strong back. Luna pulled with her teeth. Pip flapped his wings and chirped, “Heave-ho!” The branch began to move, inch by inch."},
      {"title": "Page 7", "text": "With one final push, the branch rolled away. The wind sprite shot up, spinning and sparkling. It danced around their heads, leaving trails of glittering dust. “Thank you,” it whispered, now clear and joyful."},
      {"title": "Page 8", "text": "The sprite swooped through the trees. Wherever it went, flowers bloomed and leaves shimmered. The whole forest glowed with gentle light. “It’s making the woods happy,” breathed Luna. Pip sang a little tune."},
      {"title": "Page 9", "text": "The sprite paused before them and bowed. Luna bowed back. Barnaby tipped his waistcoat. Pip did a little dance. Then the sprite floated up, up, up, and vanished into the starry night."},
      {"title": "Page 10", "text": "As they walked home, the forest felt peaceful. “We made a new friend,” said Luna, yawning. “And saved the woods,” added Barnaby. Pip was already asleep on Luna’s back. And the whisper was gone, replaced by a gentle, happy hum."}
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
      {"title": "Page 1", "text": "Nia the young elephant woke early, her ears pink in the morning sun. Today her herd would follow the great river. She tucked a green leaf behind her ear and trumpeted, \"Let's go!\""},
      {"title": "Page 2", "text": "The elephants walked in a gentle line beside the sparkling water. Nia splashed with her trunk, spraying silver drops into the air. Aunt Amara smiled. \"The river will show us many friends today,\" she said."},
      {"title": "Page 3", "text": "In the shallows, Kito the hippopotamus yawned a wide, bubbly yawn. \"Good morning!\" he spluttered. \"My river is lovely and cool. Would you like a drink?\" Nia sipped carefully. The water tasted fresh and sweet."},
      {"title": "Page 4", "text": "On a swaying reed sat Zuri the kingfisher, bright as a blue jewel. \"I fish here every day,\" she chirped. \"Clear water helps me see my supper!\" Nia watched her dive, quick as a wink."},
      {"title": "Page 5", "text": "Farther along, Nia noticed colourful rubbish caught among the reeds. An old sack and empty bottles floated at the water’s edge. \"That does not belong in the river,\" she said."},
      {"title": "Page 6", "text": "Aunt Amara looked carefully. \"Litter can dirty water or trap an animal. We shall lift it onto dry ground, where the park rangers can collect it safely.\" Nia nodded."},
      {"title": "Page 7", "text": "Kito nudged a floating bottle towards the bank. Zuri called directions from above. Nia carefully lifted the old sack with her trunk and placed it on dry ground."},
      {"title": "Page 8", "text": "Soon the litter rested in a neat pile on dry ground, ready for the rangers. Fish flicked their tails in the clear shallows, while Zuri swooped happily above the water."},
      {"title": "Page 9", "text": "In a grassy clearing stood Grandmother Buffalo. \"Thank you, kind elephants,\" she rumbled. \"My herd drinks downstream. Clean water keeps us all strong.\" Nia stood tall. She felt proud, helpful, and very, very thirsty!"},
      {"title": "Page 10", "text": "That evening, the herd bathed in the calm, clean river. Nia floated happily, her leaf still tucked behind her ear. \"One river,\" she murmured, \"for hippos, kingfishers, buffalo and elephants. Water for everyone.\" The stars twinkled goodnight."}
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
