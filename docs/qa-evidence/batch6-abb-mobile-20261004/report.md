# Pattern Parade mobile ABB clue — frozen 5295 delta

Date: 2026-10-04. This report closes only the previously unobserved mobile ABB clue/answer case for the frozen Batch 6 progress-sound candidate. It is not a full Pattern Parade matrix or release acceptance.

## Candidate and safeguards

- Candidate origin: `http://127.0.0.1:5295`
- Frozen source: `f8f9f7a938870e415e0feac69761e1c18d7d10ad`
- The five assets in [the candidate identity manifest](../batch6-progress-sounds-identity-20261003.json) were fetched before browser navigation. All returned HTTP 200 and matched expected SHA-256; [the independent recheck](served-identity-recheck.json) preserves the exact bytes and hashes.
- A new Playwright session began at `about:blank`, with 204 route guards for `**/api/voice**` and `**/api/story**` confirmed before the first navigation. The visible sound control was switched off. The ordinary route was Amari → Thinking & Play → Pattern Parade → Repeat it; no state, answers, seeds, hidden data, or provider content was injected.
- At the end, both guards were still listed; there were no `/api/` requests, and the console had zero errors or warnings. All 11 loaded static requests returned HTTP 200. No other Batch 6 games or chapters were retested.

## Mobile ABB round

The first ordinarily presented Repeat it question was **“ABB pattern 3: what comes next?”** Its visible sequence was `💙 💜 💜 💙 💜 ?`, and the visible options were lemon, blue, strawberry, and purple. The clue control was used before answering. It displayed:

> Look at the first three places. They make the ABB repeating unit. Start that same unit again.

The visible first-three unit is blue–purple–purple. I selected purple, the next term implied by that displayed unit. The held result said **“That is the ABB rule. ABB pattern 3.”** and **“An ABB pattern repeats one part, then two matching parts.”** The correct-result panel retained **Next pattern**. Clicking it advanced normally to Question 2 of 6, an AB moon/star sequence.

The [start screenshot](screenshots/abb-start.png), [clue screenshot](screenshots/abb-clue.png), and [held-result screenshot](screenshots/abb-held.png) preserve these visible states.

## Lineage and disposition

The earlier [`batch6-narration-repair-independent` report](../batch6-narration-repair-independent-20261003/report.md) explicitly left ABB at 390×844 unobserved, after checking AB and AAB on mobile and ABB on desktop. This new run observes that missing mobile ABB case on the separate immutable 5295 candidate. Its rule wording matches the visible three-term sequence, the answer is correct, the answer explanation stays held, and Next advances.

This is a narrow UI/content check. It does not repeat the 18-question baseline, establish human-heard narration or SFX quality, or award a quality score. The narration inventory remains incomplete; no provider calls were made.
