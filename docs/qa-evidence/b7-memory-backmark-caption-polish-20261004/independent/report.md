# Independent Memory Match back-mark and desktop-caption QA

Date: 4 October 2026  
Frozen source: `4bdcb7b9769d0f25c493995d016f9eef38968e12`  
Frozen local preview: `http://127.0.0.1:5392/`  
Builder identity/report: [`../identity.json`](../identity.json), [`../report.md`](../report.md)

## Result

**Pass for the scoped desktop first-board presentation and the sampled mobile initial-board regression.** The face-down cards render the white Lucide Sparkles mark clearly over the blue card back; no white rectangle appears. A real visible flip on the 1280×800 first board revealed “monkey”; its label is 12px and fits within the card’s 221px label width. The page and board have no horizontal overflow.

The same isolated profile was resized to 390×844, then a card was flipped through its rendered control. The initial four-column board remains 82px per card, the document width remains 390px, and the visible “monkey” label fits its 72px label box. The mobile media rule computes to 8.19px for this 4-pair board; that rule is unchanged by this candidate. This is only an initial-board regression observation, not an acceptance of late 13–18-pair captions or the desktop long-caption wrapping case.

## Guarded normal UI procedure

A fresh Playwright session opened `about:blank`. Before the first app navigation, `/api/voice` and `/api/story` were routed to 403; `route-list` confirmed both remained installed after navigation. I used the visible `Turn sound off` control at the welcome screen, then selected Amari → Thinking & Play → Memory Match through visible controls. The game consistently showed `Turn sound on`, confirming it remained muted. There were no voice/story requests. The console recorded zero errors or warnings, and the captured local asset requests returned HTTP 200.

Only Level 1 was available in this clean synthetic profile. I inspected its normal 4-pair/8-card board; I did not unlock or inject progress. At 1280×800, the board was 1080px wide, each card 231.25px, and the document width was 1280px. After the first actual card flip, the card’s accessible name became “monkey card”; its computed label font was 12px, measured label width 221px with no text overflow. I then resized the same page to 390×844 and flipped a visible face-down card. Its face-up label stayed inside the 82×82 card (72px label width, 8.19px font); document width equalled viewport width. The visible face-down backs at both sizes used the Sparkles vector.

## Captures

- [Desktop first board with a revealed card and vector backs](screenshots/desktop-level1-faceup-monkey-and-vector-back.png)
- [Mobile initial board with vector backs](screenshots/mobile-level1-face-down-vector-back.png)
- [Mobile initial board after a real card flip](screenshots/mobile-level1-faceup-monkey.png)

## Scope and limits

The source diff against `21ee7b240b271c5d775e4ebca3b5f29e0ad63ade` changes only `MemoryMatch.jsx` and `memoryMatch.css`: the full-mode back mark becomes Lucide Sparkles, its inversion filter is removed, and desktop captions gain a 12px minimum with a taller row. The mobile media overrides remain unchanged. Builder identity binds the frozen preview to its complete served-file hash list; this independent check observed the local runtime and did not deploy it.

This report does not repeat the retained 5391 full ten-level progression and 390px 13–18-pair caption baseline. It does not observe an 18-pair board on this candidate, a long/wrapped desktop label, audio/listening quality, sibling persistence, or release acceptance. Do not infer those from the first-board sample.
