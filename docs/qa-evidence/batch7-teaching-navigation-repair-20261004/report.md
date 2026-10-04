# Batch 7 teaching and Memory navigation repair

Date: 4 October 2026
Source commit: `b6976948cf61147491e3658a5ce2e249a91bca09`
Candidate: `http://127.0.0.1:5369/`
Frozen output: `tmp/batch7-teaching-scroll-b697694/source/dist`

## Changes

Rewrote the four Discovery 6 facts in place without adding or removing a Solar System destination or discovery. All 54 discovery slots remain present.

- **Earth:** “Earth acts like a giant magnet. Its invisible magnetic field turns many tiny bits from the Sun away from Earth. The space around Earth that the field controls is called the magnetosphere.” The field deflects many particles in the solar wind, not all solar matter or radiation. NASA describes the magnetosphere as the region controlled by Earth’s magnetic field and a protection from solar particles. [NASA: Earth’s Magnetosphere](https://science.nasa.gov/earth/earth-observatory/earths-magnetosphere-50208/), [NASA: Magnetospheres](https://science.nasa.gov/heliophysics/focus-areas/magnetosphere-ionosphere/).
- **Saturn:** “Titan is one of Saturn’s moons. It is so cold that methane, a gas on Earth, falls there as rain and fills lakes.” NASA identifies Titan as Saturn’s largest moon and confirms methane rain and lakes. [NASA: Titan Facts](https://science.nasa.gov/saturn/moons/titan/facts/).
- **Neptune:** “Triton is a moon of Neptune. It goes around Neptune in the direction opposite to the way Neptune spins.” NASA confirms Triton is Neptune’s largest moon and its orbit runs opposite the planet’s rotation. [NASA: Triton](https://science.nasa.gov/neptune/moons/triton/).
- **Pluto:** “Charon is Pluto’s largest moon. Pluto and Charon travel around one point between them. This point is their shared centre of gravity.” NASA’s barycentric view describes both bodies moving around their shared centre of gravity between them. [NASA: Pluto and Charon in Color: Barycentric View](https://science.nasa.gov/photojournal/pluto-and-charon-in-color-barycentric-view-animation/).

The four changes preserve each existing discovery’s subject and factual meaning while introducing each moon’s relationship to its planet. No discovery, challenge, destination, quiz, progression, or profile data was changed.

Memory Match now uses a `useLayoutEffect` keyed to the current level to scroll the page immediately to the top. The same level-start function handles Next level, replay, and visible level selection; the reset therefore puts the new title and strategy in view before paint rather than preserving the previous completion panel’s scroll position. It does not touch the active deck, pair counts, timer, completion state, level unlocks, saved best time, passport, player ID, or strategy selection. The change is limited to the Memory component and applies whenever its current level changes.

## Verification

- `npm test`: 197/198 passed. The existing `test/offlineVoice.test.mjs` gate failed because 18 reviewed app phrases have no packaged clip. The eight current Earth/Saturn/Neptune/Pluto fact and `Discovery 6` phrases are among the missing entries; no audio asset or manifest was generated or edited.
- `npm run lint`: passed.
- `npm run build:android`: passed, including a second build from a clean `git archive` at the exact source commit. Existing warnings remain for stale Browserslist data and a minified chunk over 500 kB.
- Read-only narration inventory: Memory remains 2/183 packaged; Solar remains 111/127 packaged. The four rewritten facts each have a separate unready `Discovery 6` narration key. The prior candidate had the same missing counts; this change replaces eight Solar text keys and does not close the audio gate. Full inventories are in [`narration-delta.json`](narration-delta.json), [`memory-narration-readiness.json`](memory-narration-readiness.json), and [`solar-narration-readiness.json`](solar-narration-readiness.json). No provider request, generation, manifest mutation, decode, playback, or human listening occurred.
- The clean archive candidate served at 5369 returned HTTP 200 and a byte-for-byte SHA-256 match for all 5,694 files. See [`identity.json`](identity.json) and [`served-assets-sha256.txt`](served-assets-sha256.txt).

## Acceptance boundary

This report records source, configured build, served-file identity, and read-only narration readiness. It does not claim browser acceptance for the revised copy or level-scroll transition. An independent tester should verify the visible Discovery 6 wording and ordinary Memory completion → Next level transition at desktop and 390px, including that the new header/tip is visible immediately and that board counts, locks, passport/reload, and player isolation remain intact. The frozen candidate at 5369 is available for that review. Candidate 5366 and its report/screenshots remain unchanged. No deployment or 4.5 award is claimed.
