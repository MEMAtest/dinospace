# Batch 5 Spelling Studio pool copy follow-up

Date: 2026-10-04  
Source: `codex/amari-batch5-quality-20261003` at `d7c66992cba8cdfa78a985b26e8aa561b1ec33cf`, based on child-copy source commit `77e86a0c19297c52c8b8d41575405b10dd4dffcd`.  
Candidate identity: [identity.json](identity.json)

## Copy delta

Reworded the low-pool error, fallback error, and pool count to explain that the words use sounds the learner has learned. The existing requirement for at least 20 eligible words and six questions is unchanged. The grown-up Phonics-settings help remains. `getEligibleSpellingWords`, the taught-sound filter, adult settings, progress, and game flow are unchanged.

These strings are display-only. `batch5Literacy.js` and `offlineVoiceManifest.js` hashes are unchanged; spoken narration keys and the phrase corpus did not change. The read-only inventory still reports 659 narration phrases (11 present, 648 pending) and 37 pure phonemes pending. No audio or manifest files were changed.

## Checks

- Existing focused test `node --test test/batch5Literacy.test.mjs`: 4 passed, 0 failed.
- Scoped ESLint `npx eslint src/components/games/AmariSpellingStudio.jsx`: passed.
- Configured production build `npm run build:android`: passed. Existing stale Browserslist data and large-chunk warnings remain.
- Revised candidate: `http://127.0.0.1:5362/`, frozen separately from and without changing the 5361 candidate. All 5,610 generated files returned HTTP 200 and matched the frozen SHA-256 manifest.
- No copy-only tests were added, no full matrix was repeated, no paid calls or deployment occurred.

Independent QA may check both the start instruction and pool messages. Audio and release gates remain open.
