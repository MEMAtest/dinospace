# Storybook Studio: four new curated books

This plan adds four newly authored, age 5–6 (about age 6) books to the three bundled books. It does not recover or represent any older browser-local custom books. The current bundled set is Rex, Luna, and Nia; the four proposals below bring the catalog to seven when fully implemented.

## Proposed titles and page plans

Each page is a concrete beat for a 6–10-page illustrated read-aloud. Target 20–40 spoken words per page, simple present/past-tense sentences, one clear event per illustration, and a visible emotional or causal link between pages. The ten-beat plans can be edited down to eight pages by combining adjacent beats, while preserving beginning, problem, attempts, resolution, and closing reflection.

### 1. Bo and the Busy Bee Garden

**Learning thread:** gardens, pollination, observation, and gentle care for living things. **Cast:** Bo, a curious child; Bea, a tired bee; Gran, a patient gardener. Warm garden adventure; avoid implying that children should handle bees.

1. Bo visits Gran’s garden and notices a row of empty-looking bean flowers.
2. Bea the bee buzzes past but lands only briefly; Bo wonders why.
3. Gran explains that bees visit flowers to find nectar and carry pollen.
4. Bo sees Bea struggle around a puddle and wants to help.
5. Gran asks Bo to watch first; Bea finds a dry flower nearby.
6. Bo places a shallow pebble dish of water where Gran says it is safe.
7. Bea drinks, then visits several flowers while Bo watches from a step away.
8. Days later, tiny bean pods appear where the flowers were.
9. Bo and Gran harvest beans, leaving some flowers for bees and seeds.
10. Bo thanks Bea from a safe distance and plans a garden for more visitors.

**Comprehension checks:** What did Bea look for in flowers? (nectar); How did pollen move between flowers? (Bea carried it); Why did Bo watch from a distance? (to keep the bee and Bo safe); What changed after the flowers were visited? (bean pods began to grow).

### 2. Sami and the Night-Light Parade

**Learning thread:** noticing light and shadow, sequencing day and night, and managing a small worry. **Cast:** Sami, a child; Tavi, a firefly; family members. Calm nighttime walk with reassuring grown-up presence; no frightening creature reveal.

1. Sami helps prepare paper lanterns for a family evening parade.
2. A lantern goes dim as the sun sets; Sami worries the parade is ruined.
3. Dad checks the lantern and explains that its battery has slipped loose.
4. While Dad fixes it, Sami notices the first star and a tiny moving light.
5. Tavi the firefly blinks above the grass; Sami asks Dad before stepping closer.
6. They watch Tavi blink, pause, and blink again without touching it.
7. The lantern glows again, and the family starts the parade together.
8. Sami sees lantern shadows stretch long across the path.
9. The parade reaches the hill; the sky is darker and more stars appear.
10. Sami names the sequence: sunset, lanterns, stars, then bedtime.

**Comprehension checks:** Why did Sami’s lantern go dim? (the battery slipped); Who helped fix it? (Dad); What did Tavi do? (blinked above the grass); What happened to the shadows as the family walked? (they stretched across the path).

### 3. Mina’s Mountain Seed

**Learning thread:** plant needs, patience, and cause and effect. **Cast:** Mina, a young goat; Piko, a marmot; a mountain guide. Gentle alpine journey grounded in a seedling in a sheltered pot; no magical instant growth.

1. Mina finds a small seed in a woolly scarf at the mountain hut.
2. Piko guesses it came from the bright flower beside the trail.
3. The guide helps Mina plant it in a little pot with soil.
4. Mina puts the pot in a sunny, sheltered place and waters it lightly.
5. Nothing changes by morning; Mina thinks she made a mistake.
6. The guide explains seeds take time and need water, warmth, and light.
7. Mina checks the soil each day and keeps the pot safe from wind.
8. A tiny green shoot appears; Mina and Piko measure it with a twig.
9. The shoot grows leaves, and Mina draws its progress in a small book.
10. Mina leaves the seedling at the hut for the next hikers to enjoy.

**Comprehension checks:** Where did Mina find the seed? (in a scarf); What did the seed need? (soil, water, warmth, and light); Why did Mina wait several days? (seeds take time to grow); How did she track the shoot? (with a twig and a drawing).

### 4. Kai and the Lost Library Book

**Learning thread:** memory clues, community helpers, and caring for shared things. **Cast:** Kai, a child; Aunt Jo, librarian; Noor, a neighbor. Everyday neighborhood mystery with a calm, practical resolution.

1. Kai chooses a picture book from the library for a rainy-day visit.
2. At home, the book is missing from the tote bag; Kai feels worried.
3. Aunt Jo helps Kai retrace the route using three remembered stops.
4. At the bakery, the book is not there; the baker remembers Kai’s blue umbrella.
5. At the bus stop, Noor spots a book-shaped corner on a dry bench.
6. The book is there, safe beneath the bench, with its cover facing up.
7. Kai checks that the pages are dry and thanks Noor for noticing it.
8. They return to the library together and tell Aunt Jo what happened.
9. Aunt Jo shows Kai how the return slot works and checks the book in.
10. Kai borrows another book and uses a zipped pocket for the walk home.

**Comprehension checks:** What was missing? (the library book); Which clues helped Kai retrace the route? (the remembered stops and blue umbrella); Who noticed the book? (Noor); What will Kai do next time? (use the zipped pocket).

## Asset and narration requirements

- Give each new book a unique stable slug, title, short subtitle/summary, age band `5-6`, and ten page records in the existing `book.json` shape (`pageNumber`, `title`, `text`, `imagePrompt`, plus generated image/audio paths).
- Produce one cover image and ten page images per title. Keep character appearance, clothes, palette, and setting consistent across pages; compose for a readable child-sized book page, with no embedded text, lettering, or answer clues that spoil later comprehension.
- Produce one cover narration clip and ten page narration clips per title. Narration must match the checked-in page text exactly, use a warm clear voice and natural pauses, and be validated for presence, decodability, duration, and MIME type before a book is called complete.
- Add three or four shuffled comprehension prompts per title, each with one defensible answer, plausible short choices, a page-grounded clue, and a brief explanation. Add three child-friendly word-help entries drawn from each story.
- Confirm the catalog and service worker include all 44 new assets per title (cover image/audio plus ten image/audio pairs), and test an offline read, page replay, reload/resume, and the comprehension path before marking the expansion complete.

## Implementation file plan

1. Author and validate page copy in a reviewed source manifest, then generate assets with the existing bounded Storybook batch pipeline in `scripts/generate-storybook-batch.mjs`; review each generated image and narration against the outline before copying it into `public/storybooks/<slug>/`.
2. Add the four stable entries and ten-page fallback copy to `src/data/storybooks.js` so a missing manifest still presents accurate readable text.
3. Add per-book comprehension and word-help entries to `src/data/storybookLearning.js`; verify learning narration clips are represented by its exported corpus.
4. Extend the relevant Storybook data tests (catalog/manifest safety and learning content) to assert seven unique books, ten non-empty pages, matching narration/image references, and valid comprehension answers.
5. Update `docs/game-quality-4.5-roadmap.md` evidence only after all four books have reviewed content, packaged assets, persistence/resume, and rendered acceptance evidence. Keep old custom-book recovery as a separate gate until imported/exported browser-local books are actually demonstrated.

## Completion boundary

These are proposals for four new books. This document does not claim their copy or assets have been generated, that seven books are available in the app, or that any historical custom book has been recovered.
