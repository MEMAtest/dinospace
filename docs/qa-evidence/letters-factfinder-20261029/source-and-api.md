# Fact Finder source and component contract

## Curated source

The library has 34 entries: 16 animals, five dinosaurs, nine space objects (the eight planets plus Pluto), and four nature topics. Each record has authored child-facing text, a direct institutional source, reusable art, search aliases, and an ordinary Explore target. There is no persistence or reward path. The claim-to-source inventory is [source-check-manifest.json](./source-check-manifest.json). Its `reviewRecord` describes the manual page review and makes clear that the manifest is not an automated verification result or a saved browser transcript. Source links are to official museum, zoo, government, botanical-garden, or horticultural-society pages. The generic fern topic was removed because its existing art is a leafy sprig; the other nature topics now use art matching Seedling, Leaf, Tulip, and Tree.

Animal and dinosaur explainers include an identifying sentence and a sourced interesting detail. Dinosaur articles reuse the existing transparent portraits at `public/art/shadow-match-v1/{trex,trike,stego,bronto,ankylo}.webp`; captions identify them as playful illustrations rather than anatomical reconstructions. Each dinosaur’s feature fact is kept separate from its new introductory sentence so exact packaged playback remains available. Planet models remain labelled as computer-made and not to scale. The earthworm uses the accurate illustration at `public/art/fact-finder-v1/earthworm.webp`; the red fox portrait is labelled as a red fox rather than a specialist species. The shark portrait is presented as a generic shark, not a whale shark. No emoji-only portraits or new narration jobs/runtime generation were added. Existing fact lines for five dinosaurs and nine space objects reuse exact packaged recordings. Other fact audio appears only for exact packaged lines; the interface may add at most one exact packaged topic-name clip per article. There is no speech-synthesis or provider fallback.

## Component API

`FactFinder` is owned as `src/components/games/FactFinder.jsx` and accepts:

- `onBack?: () => void` for ordinary parent navigation.
- `onLaunchGame?: (gameId: 'worldmap' | 'dino' | 'solar', options?: { module: 'nature-lab' }) => void` for the selected article's Explore action. Nature and animal entries pass `worldmap` with `{ module: 'nature-lab' }`; dinosaur and space entries pass their existing game IDs.
- `soundOn?: boolean` and `onToggleSound?: () => void`; the existing shared `SoundToggle` is rendered when a callback is supplied. One local audio controller owns playback and stops on article selection, Back, mute, Explore, or unmount.
- `onPhaseChange?: (phase: 'intro') => void`; this read-only reference screen reports `intro`, so leaving the library is not represented as an active unsaved game.

Selecting a topic replaces the topic browser with its article. `Back to topics` preserves search/category state and restores focus to the prior topic button (or search if that result is no longer present); opening an article focuses its heading.

Data exports include `FACT_FINDER_ENTRIES`, `FACT_FINDER_CATEGORIES`, `filterFactFinderEntries({ query, category })`, `normalizeFactFinderQuery`, `getFactFinderEntry(id)`, and `getFactFinderAudio(entry, optionalExactText)`. `test/fact-finder.test.mjs` covers coverage, unique IDs, direct sources and art existence, explanatory animal content, search/aliases/category behavior, Explore targets, and exact packaged-audio gating. Focused tests and lint are source checks only; compiled, routed, visual, and hosted acceptance remain with root.
