# Batch 3 Count the Stars and Dino Detective implementation

Status: source implementation and focused validation only. No production deployment or actual-device acceptance is claimed.

## What changed

- Added an Amari-only Count the Stars flow in `src/components/games/AmariCountTheStars.jsx`: three sequential six-question episodes for 1–5, 1–10 and 1–20; fixed seeded queues; one-at-a-time count marking; retry on a wrong answer; held explanation and explicit Next; completion-only constellation page awards; replay and collection screens. Askia's existing Count component and save key remain separate.
- Added pure Count generators and per-player progress helpers. Count IDs are checked against their own episode at run remembrance and completion; malformed recent histories are filtered by episode; orphan pages/best-star records without contiguous episode completion are discarded.
- Rebuilt the Amari `DinoDetective` flow around twelve sequential worlds in three four-world bands. Each run freezes a seeded five-find queue, presents one target at five separated 56px+ locations, keeps the target and both facts in a held card until Next, records explicit clue/wrong-find telemetry, and awards the world sticker only after the fifth find. Each world has a distinct dinosaur species, species fact, scene fact, ambient palette and trail treatment. Non-dinosaur pterosaur and marine-reptile species are excluded as targets; the Ancient Shores world instead features Corythosaurus while teaching a separate shoreline fact.
- Dino progress rejects future-world completions/runs, filters recent signatures by world, and reconciles earned stickers/best stars with contiguous completed worlds. Collections are player scoped. `onPhaseChange` reports `map`, `play`, or `complete` to the parent. New-earned star awards are sent through the existing `/4` callback scale (`newStars * 4`), and completion events fire on replay as well as first completion.
- No shared `App.jsx` integration edits are included in this implementation commit. Root owns the direct Amari routing and collection shelf integration.
- Phase callbacks normalize internal states for the parent's leave guard: Count maps `map`/`collection` to `map`, `count`/`answer`/`fact` to `play`, and `complete` to `complete`; Dino maps active play to `play` and collection to `map`.

## Finite narration inventory

These are authored runtime lines/data exposed for future offline packaging; this change does not make provider calls or add audio files.

- Count fixed strings: instruction (“Tap each object once to count it.”), count prompt (“How many did you count?”), retry (“Check your count badges once more.”), episode-complete line, and the count values 1–20.
- Count generated explanations: 175 distinct lines across 35 count values × their five scene nouns per episode (`There are N … . You counted each one once.`; singular noun/verb forms are used for 1). The component currently uses the browser's local `speechSynthesis` as a development fallback when sound is enabled; this does not establish packaged Matilda playback or premium narration acceptance.
- Dino fixed inventory is exported as `DINO_DETECTIVE_NARRATION`: instruction, wrong-find, found/Next, completion, five directional clue phrases, plus each world's authored hint, unique target fact and scene fact (36 world-specific strings total). The component does not send these strings to `speak` or any voice API. Audio packaging/playback remains a separate release gate.

## Factual source notes

The fixed world and species facts are short paraphrases supported by museum, science-agency and government sources. Subject matching is thematic; a static scene fact is not claimed to be visibly demonstrated by a search prop.

- Fern spores/fronds: [Natural History Museum: ferns](https://www.nhm.ac.uk/discover/ferns.html)
- Magma becomes lava after eruption: [USGS: Volcanoes](https://pubs.usgs.gov/gip/volc/nature.html)
- Flowing water wears land: [USGS: Rivers and the Landscape](https://www.usgs.gov/water-science/science/rivers-and-landscape)
- Moonlight is reflected sunlight: [NASA: Moonlight](https://science.nasa.gov/moon/moonlight/)
- Desert dryness and cold deserts: [National Park Service: Deserts](https://www.nps.gov/subjects/swscience/deserts.htm)
- Rainbows from sunlight and raindrops: [National Weather Service: Rainbows](https://www.weather.gov/fgz/Rainbow)
- Wetland saturation may vary over the year: [NOAA: What is a wetland?](https://oceanservice.noaa.gov/facts/wetland.html)
- Snowflakes are groups of ice crystals that grow in cold clouds: [National Weather Service: Winter precipitation](https://www.weather.gov/grb/typesofwinterwx)
- Limestone dissolution/caves: [USGS: Mammoth Cave geology](https://www.usgs.gov/geology-and-ecology-of-national-parks/geology-mammoth-cave-national-park)
- Fossil footprints as evidence of movement: [Natural History Museum: dinosaur footprints](https://www.nhm.ac.uk/discover/dinosaur-footprints.html)
- Marine reptiles are distinct from dinosaurs: [Natural History Museum: fantastic fossils](https://www.nhm.ac.uk/discover/fantastic-fossils.html)
- Species fact checks: [Tyrannosaurus](https://www.nhm.ac.uk/discover/dino-directory/tyrannosaurus.html), [Spinosaurus](https://www.nhm.ac.uk/discover/dino-directory/spinosaurus.html), [Parasaurolophus](https://www.nhm.ac.uk/discover/dino-directory/parasaurolophus.html), [Brachiosaurus](https://www.nhm.ac.uk/discover/dino-directory/brachiosaurus.html), [Triceratops](https://www.nhm.ac.uk/discover/dino-directory/triceratops.html), [Dilophosaurus](https://www.nhm.ac.uk/discover/dino-directory/dilophosaurus.html), [Ankylosaurus](https://www.nhm.ac.uk/discover/dino-directory/ankylosaurus.html), [Velociraptor](https://www.nhm.ac.uk/discover/dino-directory/velociraptor.html), [Allosaurus](https://www.nhm.ac.uk/discover/dino-directory/allosaurus.html), [Carnotaurus](https://www.nhm.ac.uk/discover/dino-directory/carnotaurus.html), [Corythosaurus](https://www.nhm.ac.uk/discover/dino-directory/corythosaurus.html).

## Verification and limits

- Focused owned tests: `node --test test/countTheStarsBatch3.test.mjs test/countTheStarsProgress.test.mjs test/dinoDetectiveBatch3.test.mjs test/dinoDetectiveProgress.test.mjs` — 7 passed.
- Focused ESLint over owned components, data and tests — passed.
- `npm test` was also attempted while other Batch 3 builders were still editing the shared isolated checkout. It was not a clean pass: two tests in the in-progress `batch3CosmicTactics.test.mjs` failed (seeded transformation diversity and rejection after terminal state), and Vite test helpers logged dev-server scan/port contention. Root will rerun the repository gate after builders stop; those concurrent failures are not attributed to the original baseline.
- `npm run build` transformed 1,884 modules, then failed in the shared `inject-pwa-precache` Vite `closeBundle` hook because it attempted to scan `dist/assets` before that directory existed. The Vite config is outside my owned files; I did not modify it.
- No actual browser/device rehearsal, 24-baseline rerun, audio-input/listening review, packaged narration playback, production lineage check or 4.5 score is included here.
