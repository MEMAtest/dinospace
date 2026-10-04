# Batch 5 Spelling Studio child-facing copy delta

Date: 2026-10-04  
Source: `codex/amari-batch5-quality-20261003` at `a7790ea9c8611d4152da6e660cb46bd02511ac7a`, based on `4146e83f0177694e8a38a0d8658fe035f023a567`.  
Candidate: `http://127.0.0.1:5367/`  
Identity: [identity.json](identity.json)

## Changes

- Replaced “Choose the missing grapheme” with “Choose the letters for the missing sound” in the visible Chapter 2 instruction and accessible group label.
- Replaced “grapheme tiles” with the accessible group label “Tiles for building the word.”
- Replaced the Chapter 1 hint “Look at the word and match each grapheme, including repeated sounds” with “Look at the model word. Copy each box in order, even if the same letters appear again.”
- Replaced the header’s “legacy word records” count with “Spelling practice · N of 3 badges earned.” The underlying legacy word progress continues to load/save under the same key and format; only that count was removed from the child-facing header.

The Chapter 2 spoken prompt is already `BATCH5_NARRATION.instruction[4]`: “One sound is missing. Choose the sound that completes the word.” It agrees with the revised visible instruction. `src/data/batch5Literacy.js`, `src/data/offlineVoiceManifest.js`, the taught-sound filter, word pool, adult phonics settings, and word progress records are unchanged. No narration key or phrase corpus was added or altered.

## Checks and frozen identity

- Focused spelling eligibility/run/progress/narration test: 4 passed, 0 failed (`node --test test/batch5Literacy.test.mjs`). No copy-only test was added.
- Scoped ESLint passed for `AmariSpellingStudio.jsx`.
- Production-config Vite build passed to the frozen directory. Vite printed existing stale Browserslist data and large-chunk warnings.
- Checked port 5367 was unused before binding the preview to IPv4 loopback.
- The immutable local build contains 5,610 files. Each file returned HTTP 200 and its served SHA-256 matched the frozen output; index returned 200. See [served asset hashes](served-assets-sha256.txt).
- Read-only readiness remains 659 authored narration phrases (11 present, 648 pending) and 37 pure phoneme clips (0 present, 37 pending). Presence is not decode or playback evidence.

## Scope limits

This is a source/build/served-identity check, not rendered acceptance. Separate browser review should inspect the changed Chapter 1 hint, Chapter 2 instruction and group name, and the header at desktop and 390px. No provider calls, voice generation, manifest writes, listening claims, or deployment occurred. Existing Batch 5 audio and release gates remain open.
