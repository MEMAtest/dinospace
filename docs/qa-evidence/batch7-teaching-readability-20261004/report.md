# Batch 7 Solar copy and Memory mobile readability candidate

Date: 4 October 2026  
Candidate source commit: `21ee7b240b271c5d775e4ebca3b5f29e0ad63ade`  
Base/runtime lineage: frozen Batch 7 integration source `c4db1d4b3e469bf71409ec7d859a05a2c7fa9301`  
Preview: `http://127.0.0.1:5391/` (local only; not deployed)  
Independent browser review: pending. This report records the source/content audit and candidate build; it is not a visual acceptance or 4.5 score.

## Scope and result

I reviewed every one of the nine planet records and all 54 authored discovery facts against the age-six teaching criterion and NASA primary references. Thirty-two facts remain unchanged because they are already short, understandable in their planet context, and supported. Twenty-two receive targeted edits. The complete per-fact before/after text, stable fact IDs, old/new voice keys, readiness and usage are in [`fact-and-voice-audit.json`](fact-and-voice-audit.json).

| Planet | Facts reviewed | Edited fact IDs |
|---|---:|---|
| Mercury | 6 | `mercury-fact-2`, `mercury-fact-4`, `mercury-fact-6` |
| Venus | 6 | `venus-fact-3`, `venus-fact-4` |
| Earth | 6 | `earth-fact-5`, `earth-fact-6` |
| Mars | 6 | `mars-fact-4`, `mars-fact-5`, `mars-fact-6` |
| Jupiter | 6 | `jupiter-fact-2`, `jupiter-fact-6` |
| Saturn | 6 | `saturn-fact-2`, `saturn-fact-3`, `saturn-fact-4` |
| Uranus | 6 | `uranus-fact-1`, `uranus-fact-2` |
| Neptune | 6 | `neptune-fact-3`, `neptune-fact-4` |
| Pluto | 6 | `pluto-fact-2`, `pluto-fact-4`, `pluto-fact-6` |

The copy changes address specific gaps rather than extending every card: planet names and comparisons are made explicit where context was missing; Saturn’s “float” example now explains that it depends on an equal volume of water and an imaginary enormous tub; Uranus and Neptune introduce methane as a gas; Pluto names Charon before explaining their shared motion in ordinary words. Uncertainty remains explicit in the Uranus diamond-rain fact (“Scientists think…”).

Earth’s long magnetosphere card is reduced to “Earth acts like a giant invisible magnet. It can steer some tiny bits from the Sun away from Earth.” This avoids an undefined technical term and avoids suggesting that Earth blocks every kind of radiation. For Mars’s Olympus Mons, the former “nearly three times taller than Everest” is replaced with “much taller than Mount Everest, Earth’s tallest mountain.” NASA pages use differing height reference frames; the qualitative comparison is supported without presenting a disputed base-to-summit/elevation number as if it had one frame.

Venus’s stat is now labelled “One spin — 243 Earth days.” This is its rotation period; it is not a sunrise-to-next-sunrise solar day (about 116.75 Earth days). The NASA/NSSDC fact sheet distinguishes the two measures. Jupiter’s retained comparison is a volume/size claim, not a mass claim: NASA’s Earth-ratio table supplies the planetary diameter ratios used to compare volumes. No additional “mass” lesson was added to that card.

## Primary science references

The following NASA sources were used to check the facts and preserve the original scientific meaning while simplifying the language:

- [Mercury facts](https://science.nasa.gov/mercury/facts/) — 176-Earth-day solar cycle, near-Sun orbit, contraction cliffs, no substantial atmosphere, and day/night temperature extremes.
- [Venus facts](https://science.nasa.gov/venus/venus-facts/) and the [NASA/NSSDC Venus fact sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/venusfact.html) — greenhouse heating, clouds, backward spin, 243.69-Earth-day sidereal rotation versus 116.75-Earth-day length of day.
- [Earth facts](https://science.nasa.gov/earth/facts/) and [Earth’s magnetosphere](https://science.nasa.gov/science-research/earth-science/earths-magnetosphere-protecting-our-planet-from-harmful-space-energy/) — moving plates and the magnetic field’s interaction with solar charged particles.
- [Mars facts](https://science.nasa.gov/mars/facts/) and [NASA/JPL’s Olympus Mons description](https://science.nasa.gov/photojournal/flows-on-olympus-mons/) — iron rusting, polar ice, and the robust Everest comparison. NASA also reports different Olympus Mons height frames, including [base-to-summit](https://science.nasa.gov/missions/odyssey/nasas-mars-odyssey-captures-huge-volcano-nears-100000-orbits/).
- [Jupiter facts](https://science.nasa.gov/jupiter/jupiter-facts/) and [NASA/NSSDC planetary ratios](https://nssdc.gsfc.nasa.gov/planetary/factsheet/planet_table_ratio.html) — ring dust, Great Red Spot, and planetary size/volume comparisons.
- [Saturn facts](https://science.nasa.gov/saturn/facts/) and [Titan facts](https://science.nasa.gov/saturn/moons/titan/facts/) — density less than water, the deliberately hypothetical bathtub analogy, rings and Titan’s methane weather.
- [Uranus facts](https://science.nasa.gov/uranus/facts/) — sideways rotation, methane colour, long seasons, and the uncertainty around diamond rain.
- [Neptune facts](https://science.nasa.gov/neptune/neptune-facts/) — methane colour, year length, high winds and Triton’s retrograde orbit.
- [Pluto facts](https://science.nasa.gov/dwarf-planets/pluto/facts/) and [NASA’s Pluto–Charon common-centre description](https://science.nasa.gov/resource/charon-discovery-image/) — dwarf-planet status, 248-year orbit, Charon and their common centre of mass.

These are source checks, not claims that a child has understood the cards or that narration has been listened to.

## Memory late-board mobile layout

The actual authored pair count is now exposed as `data-pairs` on the Memory board. At mobile widths through 680px, 13–18-pair boards use four columns, a 420px board maximum, and 12px labels with room to wrap. At widths up to 370px they use three columns to keep the cards and names bounded. The desktop grid rules and all level/pair data are unchanged. This targets the late-board captions that were previously rendered below 12px without changing the 18-pair maximum or reducing the game’s board size.

The existing 19 focused progression/content tests pass, including the level pair counts, complete seeded-deck pair integrity, best-star/reload behavior, passport filtering and sibling isolation. Those tests are source regression evidence; independent rendered 390px caption/clip/overflow and 18-pair interaction checks remain pending.

## Narration impact and gates

The fact-specific Solar utterance scope covers each planet intro, six facts, six `Discovery N.` lines and quiz answer (126 unique lines). On base `c4db1d4`, it had 110 manifest-ready and 16 missing lines. Twenty-two edited facts create 44 changed utterance keys: the direct fact plus its `Discovery N.` narration. All 44 new keys are currently absent from the unchanged `OFFLINE_VOICE_MANIFEST`; the fact-specific scope is now 74 ready and 52 missing. Thirty-six prior ready keys and eight prior missing keys are no longer referenced by those edited facts. Including Solar’s unchanged shared wrong-quiz line gives the full 127-line runtime corpus: readiness moves from 111/127 to 75/127, with 52 missing. The audit JSON contains every old/new key, utterance text and manifest path.

No narration manifest or audio file was changed, and no generation, worker, provider, or audio-listening run occurred. Existing readiness cannot be carried forward to the new sentences. Narration packaging/readiness, native playback/cancellation, human listening, and independent rendered candidate checks remain open gates.

## Build and asset identity

Focused tests: 19/19 passed (`test/batch7Progress.test.mjs`, `test/memoryMatchContent.test.mjs`). Targeted ESLint passed for `src/data/index.js` and `src/components/games/MemoryMatch.jsx`. The configured `npm run build:android` passed using the production voice/story URL build settings. Vite emitted its existing Browserslist-data-age and large-chunk advisory warnings; the build completed successfully.

The preview returned HTTP 200 for all 5,963 files in `dist`; every response body’s SHA-256 matched its local build file. See [`identity.json`](identity.json) and [`served-assets-sha256.txt`](served-assets-sha256.txt). The hash audit fetched only static files from the local preview. It did not navigate into the application or call the configured voice/story endpoints.
