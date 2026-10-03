# Batch 3 packaged voice wiring

Status: source wiring and focused exact-corpus validation only. Packaged clip availability, playback, listening quality, device/browser interaction, release readiness and deployment have not been verified.

## Changes

- Count the Stars now uses the shared `speak` callback with `premium: false` for authored instructions, count prompts, retry and strategy lines, praise/explanation responses, and completion. Count values 1–20 are reusable clips. The final value and question form one exact two-segment sequence; each correct response uses separate praise and explanation clips.
- Dino Detective now uses the shared packaged voice path for instructions, wrong finds, directional clue prompts, world hints, found plus target and scene facts, and completion. The found/facts sequence stays queued while the fact card and Next action are held.
- Both games call the optional `cancelNarration` callback on unmount and genuine exits, restarts, Next actions and map/collection transitions. Sound muting remains controlled by the shared voice hook. No browser speech synthesis fallback or voice API request was added.
- `batch3Narration.js` provides exact joined text and segment builders. Its finite inventory already enumerates the authored counts, all generated count explanations, Dino hints/facts and directional prompts.

## Verification

- `node --test test/batch3Narration.test.mjs` — 3 passed. Checks every count value/question sequence, all praise/explanation combinations, and Dino lines/world-specific sequences against the finite packaged corpus.
- `npx eslint src/components/games/AmariCountTheStars.jsx src/components/games/DinoDetective.jsx src/data/batch3Narration.js test/batch3Narration.test.mjs` — passed.

Listening to physical clips and confirming actual playback remains pending. This wiring and its tests do not establish clip completeness or voice quality.
