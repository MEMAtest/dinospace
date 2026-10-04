# Batch 5 Sound Safari mobile and audio-gap audit — 2026-10-04

## Source identity and boundary

- Audited B5 worktree HEAD: `work/dinospace-batch5-quality`, `c2818da44b59c75134c11824a32fda29695f76ed`.
- Latest B5 runtime candidate remains `99ed1955131bd53b9738264edcde4e2091ad6e5e`; `git diff 99ed195..c2818da -- src` is empty. The intervening commits are documentation-only.
- Frozen desktop/mobile baseline: [5241 report and identity](work/dinospace-batch5-quality/docs/qa-evidence/batch5-final-candidate-local-20261003/report.md); bounded mobile repair: [5255 report and identity](work/dinospace-batch5-quality/docs/qa-evidence/batch5-mobile-repair-local-20261003/report.md).
- This is a source/evidence audit only. No provider/audio calls, source changes, or browser run were made.

## Current mechanics and mobile evidence

Sound Safari has three explicit six-question chapters: Hear and match (first-sound picture match), Blend the sounds (ordered phoneme blending), and Find the sound (first/middle/last sound identification). `createSoundSafariPool` strictly filters against taught graphemes; `start` refuses pools under 20 instead of falling back to untaught sounds. Runs contain six frozen questions, seeded options, one validated correct choice per question, and recent IDs are avoided before pool reuse. Wrong choices leave the question open, hints are one-use, correct feedback stays until Next, and completion follows the sixth held result. These mechanics have unit coverage in `test/batch5Literacy.test.mjs`.

Retained 5241 Playwright evidence covers all three chapters × six rounds at 1280×800. At 390×844, it records Chapter 1 × six rounds and Chapters 2–3 blocked because their core phoneme media is missing. That Chapter 1 run is mechanics/control evidence only; the report also records the missing `/audio/phonemes/en/t.mp3` request, so it is not valid listening or sound-recognition evidence. The 5255 repair delta confirms the floating daily-mission tracker no longer covers active Sound Safari controls/hint at 390×844, and ordinary Back → Keep playing/Back to world works. It is a narrow mobile delta; 5255 did not rerun the desktop layout or the later Sound Safari chapter layouts.

No new source defect is established by these reports. The old mobile overlay is repaired. One state transition is a targeted observation for future testing, not a confirmed bug: `useAmariPhonemeAudio` clears `missingClip` when another sound play starts, while cancellation/Next only stops audio; verify whether an error from one question can remain labelled beneath the next question before considering a fix. No speculative source change is proposed.

## Two separate missing audio inventories

The B5 read-only readiness script on HEAD `c2818da` reports:

| Inventory | Required | Present | Pending | Meaning |
|---|---:|---:|---:|---|
| Distinct authored narration clips | 659 | 11 | 648 | Instructions, prompts, hints, feedback and word/caption sequences used by Batch 5 literacy games; 21,936 authored characters in 332 exact sequences. |
| Pure phoneme files | 37 paths | 0 | 37 | Isolated sound clips required by Sound Safari and Spelling Studio; not narration phrases or letter-name audio. |

All 37 pure phoneme paths are absent. The path keys are `s`, `a`, `t`, `p`, `i`, `n`, `m`, `d`, `o`, `g`, `l`, `c`, `k`, `h`, `e`, `r`, `u`, `ck`, `b`, `ll`, `f`, `ss`, `ff`, `sh`, `th-unvoiced`, `th-voiced`, `ch`, `ng`, `ai`, `w`, `ee`, `oa`, `oo-long`, `oo-short`, `ar`, `or`, and `ur`. There are 32 distinct sound values across the 37 runtime paths because five grapheme aliases share sounds (`s/ss`, `l/ll`, `c/k/ck`, `f/ff`). All 37 runtime URLs are distinct and missing. An ordinary spoken letter name or word narration cannot stand in for these isolated sounds.

The 659 narration items are a separate exact-text inventory aggregated across Sound Safari and Spelling Studio. Its 11 present files have not been treated as pronunciation-accepted, and the other 648 are not packaged. Supplying the 37 pure sounds will unblock auditory blending/phoneme tasks, but does not by itself close the broader narration packaging/listening gate. Conversely, the 659 narration files do not substitute for the 37 isolated phoneme assets.

## Finite mobile QA plan after authorized media is ready

Do not use visible answer words, generated letter-name audio, guessed answers, or hidden queue/state access to claim phoneme acceptance. Once rights-cleared pure sound recordings are supplied and all 37 paths pass integrity checks, freeze the exact candidate and run one fresh, isolated 390×844 UI session with `/api/voice` and `/api/story` guarded before navigation. Use a synthetic profile created through visible UI; do not inject progress or answers.

1. Play one six-question Chapter 1 run. For each item, hear the isolated first sound before choosing its picture; include one wrong → retry and one hint → correct → held explanation → Next. Progress to Chapter 2 only through normal completion.
2. Play one six-question Chapter 2 run. Hear each component phoneme in order before answering each blend; include one wrong/retry and one hint/replay check. Confirm no whole-word audio is supplied before selection and the held result names the blended word only after a correct answer.
3. Play one six-question Chapter 3 run. Hear the word and identify its stated sound position; include one wrong/retry, one hint, and a correct held explanation before Next. Confirm the target sound is not announced before selection.
4. Across those 18 rounds, capture rendered prompts/results and control bounds, confirm no horizontal overflow or daily-task overlay, check all visible targets are at least 48px where applicable, and verify Hear/replay, mute, Next, Keep playing and confirmed Back cancel or stop old audio without stale status on the new question.
5. Separately, check the 659-text narration readiness and human listening gates. If many clips remain unavailable, record which visible controls have no packaged narration; do not count a pure sound success as narration acceptance. Do not repeat the retained desktop full matrix for asset-only changes; perform only a narrow desktop regression if the UI or audio-control code changes.

The scope is bounded to 18 ordinary mobile rounds plus associated controls, not repeated random runs. If any required file is still missing or a sound is not clearly isolated, stop the affected phoneme question without guessing and keep it unaccepted.

## Evidence sources

- `work/dinospace-batch5-quality/docs/qa-evidence/batch5-final-candidate-local-20261003/report.md` and `batch5-final-candidate-identity-20261003.json`.
- `work/dinospace-batch5-quality/docs/qa-evidence/batch5-mobile-repair-local-20261003/report.md` and `batch5-mobile-repair-identity-20261003.json`.
- `work/dinospace-batch5-quality/docs/batch5-literacy-source-gate-20261003.md` and `batch5-pure-phoneme-recording-contract-20261003.md`.
- Read-only `node scripts/check-batch5-literacy-readiness.mjs` on B5 HEAD `c2818da`: 659 narration (11 present/648 pending), 37 pure phoneme files (0 present/37 pending). The script expressly does not decode or assess pronunciation.
