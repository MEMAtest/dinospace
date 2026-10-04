# Independent QA: Spelling Studio copy candidate 5367

Date: 2026-10-04  
Candidate: `http://127.0.0.1:5367/`  
Source: `a7790ea9c8611d4152da6e660cb46bd02511ac7a`; candidate identity and builder report are copied beside this report.

## Method

Fresh Playwright profiles at 1280×800 and 390×844 each started at `about:blank`. `/api/voice` and `/api/story` were set to HTTP 403 and verified before navigating to the app. Sound was switched off with the visible control. No progress, answers, profile data, or browser storage was injected; correct words were assembled from the displayed picture clue, displayed word text, and tiles. The hint control was clicked while muted; this verifies visible copy only, not sound or pronunciation.

## Observations

- Chapter 1's ordinary six-word run completed through visible tiles at both sizes. The hint reads: “Look at the model word. Copy each box in order, even if the same letters appear again.”
- On the desktop second word, tapping “Hear sounds as a hint” displayed that complete hint. The accessible tile group was “Tiles for building the word.”
- Chapter 2 unlocked through normal play on both profiles. Its visible direction is “One sound is missing. Choose the sound that completes the word.” The accessible group is also “Choose the letters for the missing sound.” At desktop, `p` completed visible `• e ck` as PECK; at mobile, `e` completed visible `r • d` as RED. Both produced held correct feedback and a working Next word control.
- The child-facing header says “Spelling practice · N of 3 badges earned”; no “legacy word records” language was present.
- Both viewports had no horizontal overflow or broken images. Console: 0 errors and 0 warnings. Network summaries had 12 desktop and 11 mobile static requests omitted; no non-static request output. Provider routes remained guarded.

Evidence: [desktop Chapter 1 hint snapshot](desktop-chapter1-hint.yml), [mobile Chapter 1 hint snapshot](mobile-chapter1-hint.yml), [desktop held Chapter 2 answer](desktop-chapter2-held-feedback.png) and [snapshot](desktop-chapter2-held-feedback.yml), [mobile held Chapter 2 answer](mobile-chapter2-held-feedback-scrolled.png) and [snapshot](mobile-chapter2-held-feedback.yml). At 390px after ordinary page scroll, Next word measured 358×56 CSS px and was on screen.

## Boundary

This accepts only the rendered child-copy delta on frozen local candidate 5367. Spoken prompts, pure phoneme assets, auditory correctness, and listening quality were not tested; their readiness remains an independent gate.
