# Monster Math exact-case production regression — 3 October 2026

Identity: canonical `https://dinospace-eight.vercel.app`, source `a1eec24552c99529ba30ed38d10492a6ce1c7829`, deployment `dpl_HRtGufD4yhwza3iqDu7BfRze6SFS`; [seven served hash identity](../batch3-copy-keyboard-canonical-identity-20261003.json). Functional checks, not4.5 acceptance.

Fresh isolated browser, 390×844, voice/story API routes guarded before app navigation, sound off. Ordinary Home → Maths Missions → Monster Math. Counting six questions completed by counting visible pictures, then Growing unlocked normally. First Growing six-question run completed. A later bounded replay reached **What is 2 plus 10?** after16 recorded visible Growing prompts; no seed, queue, answer or child state injection. Answers computed from visible arithmetic headings only.

## Actual result

- [Before answer](mobile-before.png): two groups on the ten frames, equation2+10=?, neutral strategy, no result revealed.
- [After Show me a clue](mobile-clue.png): **FAIL**. “Put the two groups together, then count every counter.” appears below the model and again in the feedback card. Screenshot review reproduced the old clue duplication despite the separate correct-result repair.
- [Correct12](mobile-correct.png): **PASS for correct-result duplication only**. Equation2+10=12 and exactly one distinct explanation “2 counters. Add10more. That makes12counters.” remain held with Next.
- [Same held result resized to1280×800](desktop-same-held-result.png): same single correct explanation. This is a responsive render check of the existing solved question, not a fresh desktop answer/clue run.
- DOM-derived [390px](mobile-held-result-observation.json) and [desktop](desktop-held-result-observation.json) controls: Back/Sound/Replay/Clue48px minimum height; choices64px; Next56px. Body width matches390/1280. This samples the current solved Growing control state, not every game/control state.

[16 ordinary Growing prompt/result observations](mobile-visible-rounds.json) preserve the replay sample, including exact2+10. The initial script stopped at the first Growing Finish because its harness checked before React rendered Finish. Snapshot then showed an enabled Finish and complete6/6 state. The harness was corrected to await Next-or-Finish; no product failure is attributed to that timeout. An unsupported dynamic-import attempt stopped before controls. Both raw harness logs remain in tmp.

## Repair in progress

Root now suppresses model teaching once a clue is shown, keeping the clue in the feedback card, and preserves one-use hint/assisted scoring. Correct-result behavior is unchanged. Focused regression covers all authored Growing ten-frame models and the exact add:2:10 clue equality. New candidate independent local UI and canonical production retest are required. Current canonical clue failure remains open; no score is promoted. Audio listening and the other Batch2 acceptance gates remain separate.
