# Batch 5 Spelling Studio child instruction copy

Date: 2026-10-04  
Source: `codex/amari-batch5-quality-20261003` at `77e86a0c19297c52c8b8d41575405b10dd4dffcd`, based on `7909f9bc9903cee7cb8f932d880fd7bce1d80cdb`.  
Candidate identity: [identity.json](identity.json)

## Copy change

Replaced the start-screen instruction with:

> Use the sounds you have learned to build each word. Each chapter has six words. Your finished word stays here until you tap Next.

The new copy removes “strictly decodable,” “graphemes,” “worked word,” and the grown-up reference from the child instruction. It retains the chapter size and the held-until-Next behavior. Spelling pool construction, taught-sound eligibility, phonics settings, adult-facing settings help, progress, and runtime narration were not changed.

The instruction is display-only. `src/data/batch5Literacy.js` and `src/data/offlineVoiceManifest.js` are unchanged; the existing narration keys and phrase corpus are unaffected. The pre/post read-only readiness inventory reports 659 narration phrases (11 present, 648 pending) and 37 pure phoneme clips pending. The new instruction was not added to the audio corpus, and no audio or manifest was modified.

## Checks

- Existing focused test `node --test test/batch5Literacy.test.mjs`: 4 passed, 0 failed.
- Scoped ESLint `npx eslint src/components/games/AmariSpellingStudio.jsx`: passed.
- Configured production build `npm run build:android`: passed. Vite reported the existing stale Browserslist data and large-chunk warnings.
- Candidate `http://127.0.0.1:5361/` is served from a frozen local build on IPv4 loopback. All 5,610 generated files returned HTTP 200 and matched the frozen SHA-256 manifest.
- No copy-only test was added. No full Batch 5 matrix was repeated, no paid provider or generator was called, and no deployment was made.

## Remaining gates

Independent browser review should verify the revised start-screen copy at the intended widths. The Batch 5 narration and pure-phoneme gaps remain open; this copy delta does not close audio, listening, release, or overall game-quality gates.
