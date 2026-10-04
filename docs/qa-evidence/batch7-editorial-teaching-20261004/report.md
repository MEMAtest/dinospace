# Batch 7 focused teaching-copy update

Date: 4 October 2026  
Scope: one later-board Memory Match strategy and the first in-place use of four Solar System terms. This is a bounded content change. The frozen 5335 build and retained 10-board/9-planet gameplay matrices are unchanged.

## Memory Match

Replaced “Group nearby cards in your mind” with this actionable later-board tip:

> Scan one row at a time. When you turn a picture, remember its row and place. If you see it again, look for the place where its partner appeared.

The visible strategy and repeat-tip narration use the same phrase. This relates each picture to its remembered location rather than suggesting adjacent cards belong together. Board definitions, pair counts, saved levels, sticker progress and Askia rendering were not edited.

## Solar System first-use definitions

I checked each revised claim against the following NASA primary sources on 4 October 2026:

| First-use term | Updated in-place fact | Source check |
|---|---|---|
| Magnetic field / magnetosphere | “A magnetic field is an invisible part of space where magnetic forces can act. Earth’s field reaches into space and makes a region called the magnetosphere. It turns many particles from the Sun away from Earth.” | NASA distinguishes the magnetosphere (the large magnetic region) from the field and says it deflects most solar material. The copy says “many,” not all, and explains the relation rather than calling a magnetic field itself a shield. [NASA: Earth’s Magnetosphere](https://science.nasa.gov/science-research/planetary-science/earths-magnetosphere/) |
| Methane | “Methane is usually a gas on Earth. Titan is so cold that liquid methane can fall as rain and fill lakes.” | NASA’s Cassini report says methane is generally thought of as a gas on Earth, while Titan’s cold allows methane to act as a liquid; it confirms methane-filled lakes and methane rain. [NASA/JPL: Cassini Reveals Surprises with Titan’s Lakes](https://www.nasa.gov/missions/cassini/nasas-cassini-reveals-surprises-with-titans-lakes/) |
| Orbit | “An orbit is a repeating path around another space object. Triton follows its path around Neptune in the direction opposite to Neptune’s spin.” | NASA Space Place defines an orbit as a regular, repeating path one object in space takes around another. NASA confirms Triton’s orbit is opposite Neptune’s rotation. [NASA Space Place: What Is an Orbit?](https://spaceplace.nasa.gov/orbits/en/), [NASA Science: Triton](https://science.nasa.gov/neptune/moons/triton/) |
| Shared centre | “Pluto and Charon both travel around one point in space between them, called their shared centre of gravity.” | NASA describes their barycenter as the shared centre of gravity between the bodies and says it lies between Pluto and Charon (closer to Pluto). The fact gives the plain-language point before naming it. [NASA Photojournal: Pluto and Charon in Color, Barycentric View](https://science.nasa.gov/photojournal/pluto-and-charon-in-color-barycentric-view-animation/) |

No Solar discovery entries, challenges, navigation, or planet order changed. The 54 discoveries and all existing destinations remain in place.

## Readiness and verification

- Existing Memory content test: `node --test test/memoryMatchContent.test.mjs` — 15 passed after the final copy edits.
- The read-only narration audit is 2/183 Memory phrases and 111/127 Solar phrases packaged. The four updated Solar facts each also have a “Discovery N.” spoken variant. The readiness delta and exact voice keys are in `narration-readiness.json`; six previously packaged Solar strings (four fact lines and two discovery lines) now need updated clips, while the old Pluto fact and discovery clips were already missing. The new Memory strategy clip is missing; its previous phrase also had no clip. No manifests, audio files, or generated narration were changed.
- Verification: `node --test test/memoryMatchContent.test.mjs` passed 15/15; scoped ESLint passed for the three edited source files; the serial full suite passed 197/198. Its sole failure is `test/offlineVoice.test.mjs`, which reports 18 missing packaged narration clips across the app. `npm run build:android` passed with the existing stale Browserslist data and large-chunk warnings. No voice generation, provider request, playback certification, or deployment was performed.
- The configured production build used `VITE_ELEVENLABS_ENABLED=true`, `VITE_VOICE_API_URL=https://dinospace-eight.vercel.app/api/voice`, and `VITE_STORY_API_URL=https://dinospace-eight.vercel.app/api/story`. The immutable local freeze identity and served-file verification will be recorded here after freezing. This is builder evidence; separate focused QA is still pending.
- This copy change is awaiting the separate focused QA. Verify the long Memory tip fits at both widths and repeats accurately; render the four Solar cards at desktop and 390px, confirm controls remain usable, and check the fact narration keys match visible text. These are builder/source checks, not independent acceptance or a release claim.
