# World previews and longer-word progression — 21 October 2026

Runtime source: `87ad5025f77d5f3da93151e49344e61e89c037c2`. Canonical deployment: `dpl_3GkBnRTWdFep1oz2RGB8FJnZfmhZ`. Earlier deployment identities are retained as superseded diagnostics.

## Changes

- Five world cards immediately preview covered topics on hover or keyboard focus. Escape dismisses; the separate What’s inside button supports click/touch without opening the world.
- Spelling retains the first three instructional stages and adds real four-, five-, and six/seven-letter stages. Thirteen longer words reuse existing full-word recordings. Sound selections remain respected; no unrelated sound settings are changed.
- Hangman progresses through three-, four-, five-, and six/seven-letter rescues, with 12, 12, 18 and 26 letter choices. Queues shuffle; no repeated word is needed within a level. Existing progress is preserved. Visible meaning cues and packaged word replay clarify the task. Scrolling is enabled and solved words remain until Next/New word or the session completion screen.
- Media cache rejects HTML fallback pages, discards invalid HTML entries on access, and fetches the actual media again. Stable valid media caches remain preserved.

## Evidence and limits

Local native-control rehearsal completed all six Spelling stages (31 answers), all four Hangman stages (16 words), and all five world previews at 390 and 1440 pixels. No provider requests or page errors were observed. Desktop supplemental rehearsal played all 13 added word recordings to completion with positive volume and exercised the 26-letter Hangman keyboard with a wrong-letter recovery. These are technical playback checks, not a human listening signoff.

A local audio check caught an HTML response cached at the BRICK MP3 URL during a local rebuild. This was a QA-origin cache defect, not evidence of a production outage. File decoding alone did not detect it. Added regression tests cover rejecting new HTML media responses and recovering previously cached HTML. All 13 native playback checks passed after the service-worker safeguard. The initial failed logs remain in the bounded output folder.

Production full progression rehearsal is recorded separately in `production-result.json`; use its result rather than treating deployment readiness as gameplay acceptance.

16 focused tests passed (including built distribution/bootstrap limits); lint and production build passed. This targeted change does not assign a new editorial score to either game or close unrelated Storybook speed/listening gates.

## Resources

Reused the current checkout, dependencies and one contained headless Chromium session. No new checkout, browser installation, dependency installation, image generation or paid voice/story request. Evidence is bounded to five MiB, including failure diagnostics and representative captures. No real child records were changed by QA.

## Production-only issue caught before acceptance

The initial canonical rehearsal reached the end of every stage but failed its provider guard: 15 `/api/voice` attempts for dynamically assembled narration were blocked with 403 responses. No upstream provider request was made. Hangman now explicitly passes `premium: false` for all narration and uses the existing word recording for success/loss, so new word content cannot trigger per-word generated result messages. The initial failure remains in `output/playwright/world-difficulty-20261021/production.log`; final acceptance requires a clean rerun on the corrected release.

## Final canonical progression result

The corrected release passed 31 native Spelling answers across all six levels and 16 Hangman rescues across all four levels at 390 px. World previews passed for every world at 390 and 1440 px, including hover, focus, Escape and the explicit preview buttons. Native controls earned/unlocked all levels; no answer/progress seed was injected. Browser page errors: zero. Voice/story API attempts: zero. The final hardest Hangman screen exposed all 26 letter choices without horizontal overflow.

Served entry: `/assets/arcade-CYfxQJpG.js`, SHA256 `21bafa73daef9285fb7776e816247838de3beb9221214bdaee1be69224fde3e8`; active cache inventory includes `amari-discovery-v23` and the preserved media cache. Vercel independently binds that canonical deployment to the exact runtime source above.

Final production audio/desktop supplement: all 13 longer-word Hear the word controls played their packaged recordings to completion with positive volume. The hardest Hangman level exposed all 26 letter choices; a wrong-letter attempt followed by a physical-keyboard solution recovered correctly. No page errors or voice/story API attempts. Screenshots were visually inspected; no new 5/5 score is assigned.
