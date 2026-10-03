# Batch 2 editorial candidate review — 3 October 2026

## Decision and identity

**Decision: not accepted as 4.5/5 yet.** This is an independent editorial assessment of Puzzle Pop, Spot the Difference, and Sky Shapes, informed by the retained full baseline and repair lineage plus a small fresh visual/UI sample. It does not rerun the full bands. The known production and audio gates remain open, and the bounded sample found one specific feedback improvement for Spot the Difference.

Candidate served locally at `http://127.0.0.1:5203`, source `ead5a1d60d2ad5e2cacefc4cbcecb0aee7cec630`, with `VITE_ELEVENLABS_ENABLED=true` as supplied. The rendered HTML references `/assets/index-DZuRTFaZ.js` SHA-256 `d63a6423477fd3cda6d2e9f66d15eefafc6a693e6039865a79b1f59cc534d85c` and `/assets/index-CU-OkS6z.css` SHA-256 `2613b85082a6ae658aaf50bd961b80106c8249c46da4366c7a7489d3052b9e7e`, matching the retained [complete-candidate identity](../batch2-complete-candidate-identity-20261003.json). This is frozen local candidate evidence, not canonical deployment availability.

Fresh desktop and mobile Playwright contexts began at `about:blank`. Before each first app navigation, both broad route globs `**/api/voice**` and `**/api/story**` were stubbed with HTTP 204 responses; the globs match bare endpoints as well as descendants. Sound was turned off through the visible control. Inventories show no voice/story requests and both console snapshots show zero messages/errors/warnings. All game selection and sampled interactions used ordinary visible controls; no answer, seed, profile, or progress injection was used. The [mobile Game troubleshooting export](diagnostics/mobile-game-log-ui-export-final.json) was obtained through the visible Download game log button and saved using the actual download event's `saveAs` method.

## Full-baseline and repair lineage

The original full desktop/mobile baseline remains bound to source `d31239453edf438b5a88ab788db942f2dae76fea`, production deployment `dpl_H9rc2Rinyamg7bCf7WdcHeWDVFmz`; its 24 game/band/viewport rows are retained in [the full acceptance report](../../batch2-fresh-acceptance-20261003.md). That evidence covers Puzzle Pop’s 2×2/3×3/5×5 chapters, preview/hints/facts/rewards, Spot’s 3/5/7-change chapters and scene facts, and Sky’s touch/mouse/keyboard tracing, reward and save/replay behavior.

The released narrow-repair identity is source `6b84554e7a1d21b3db658d213a2298462c78599e`, canonical deployment `dpl_DGLGVkaMikT5GPntS6YThDsesHyx`. Its [production repair delta](../../batch2-production-repair-delta-20261003.md) independently covers the Puzzle rapid wrong→correct feedback race and held facts on desktop/mobile, plus Spot genuine blank-miss telemetry. The [Sky production delta](../../batch2-production-sky-final6b-20261003.md) covers immediate save/reload and chapter/replay controls; the bounded [Sky teaching review](../sky-teaching-20261003/qa-report-20261003.md) checks current routes/facts and supports four substantial authored missions per sky as a comparable-route justification. These repairs supersede specific old failures only for their recorded cases. They are not newly replayed here, and they do not turn the old baseline into a fresh run on ead5a1d.

## Provisional editorial estimates

These are reasoned candidate estimates only, not accepted scores. The fifth dimension includes audio usability; browser audio was muted and voice/story APIs blocked, so no audibility, pronunciation, intelligibility, or prosody judgment is made. All three games still need the roadmap’s production-bound gameplay and listening gates.

| Game | Age-6 teaching | Progression | Correctness / fair variation | Feedback / audio / visual usability | Reliability / navigation / persistence | Provisional average |
|---|---:|---:|---:|---:|---:|---:|
| Puzzle Pop | 4.1 | 4.4 | 4.5 | 4.2 | 4.5 | 4.34 |
| Spot the Difference | 4.0 | 4.4 | 4.4 | 3.5 | 4.4 | 4.14 |
| Sky Shapes | 4.4 | 4.4 | 4.3 | 4.1 | 4.4 | 4.32 |

### Puzzle Pop

- **Teaching (4.1):** Intro says “Match big picture pieces and spot the main shapes.” During play, a picture preview and plain prompt stay visible, and the hint says which piece fits the glowing space and to compare edges in the preview. The successful first hinted placement returned “Great fit! 1 of 4 pieces are in place.” This teaches a usable strategy, though the task does not yet explain a particular shape or edge-matching concept as a short, cumulative lesson.
- **Progression (4.4):** The map presents 2×2, 3×3, and 5×5 chapters with four pictures each; retained baseline confirms all band runs, facts, chapter rewards, unlock/replay and changed ordinary replay orders. The larger boards add a clear spatial-attention challenge.
- **Correctness and fair variation (4.5):** Retained baseline uses 12 illustrated scenes with shuffled pieces, correct placement feedback and scene facts. The repair delta explicitly tests quick wrong→correct recovery and delayed success/fact persistence at both widths. Current mobile hint and placement agreed: piece 1 was indicated for board space 1, and the UI accepted it.
- **Feedback/audio/visual (4.2):** The fresh 390px board fits the document width and the piece preview/hint/progress are legible, with vertical scrolling for the tray. The visual treatment is cheerful and consistent; scenes appear as small, flat cartoon illustrations. Audio is unreviewed. The active mobile header ellipsizes the scene name (`D…`), although the complete scene title remains in the readable placement prompt.
- **Reliability/navigation/persistence (4.5):** Fresh candidate rendered active board, hint, correct placement, and leave confirmation; document/body width was 390px. Full baseline and 6b deltas cover broader return, completion, replay and correction behavior. This review did not recheck candidate persistence or complete a chapter.

### Spot the Difference

- **Teaching (4.0):** “Look at both pictures. Tap a changed detail in Picture B” is direct and appropriate for age six; both pictures are labelled “Look carefully” / “Find changes here,” and the counter is explicit. Scene-specific facts are shown on completion in retained baseline. The early game offers comparison practice but does not name a systematic scan strategy beyond the prompt/hints.
- **Progression (4.4):** The visible chapter map increases from 3 to 5 to 7 changes across four-pair chapters. Retained baseline covers all bands/widths, facts/rewards, and order variation.
- **Correctness and fair variation (4.4):** Current active pair displayed the three changed details and 0/3 status; candidate image alt labels identify each scene/version without revealing answers in screen text. Retained baseline and marker/telemetry deltas establish reachable target interactions and correct miss accounting for sampled cases.
- **Feedback/audio/visual (3.5):** **Concrete weakness:** on the mobile Superhero City Starter pair, both available Magnifier taps repeated “look near the middle top of Picture B.” A targeted 56×56px `aria-label="Check middle top detail"` button is positioned over that changed spot at z-index 20, but its rendered `borderColor` and `backgroundColor` are both transparent even though its classes include amber border/fill plus `animate-pulse`. Thus the intended pulse does not visibly distinguish the target; the text is the only rendered cue, and the second identical clue adds no new help. Make the amber target cue visibly render and point the second token to a different unresolved change. The paired cartoons are colorful and readable, but visual comparisons are fairly easy because changes use large, high-contrast symbols. This could be intentional for the Starter band; Challenge imagery should retain enough subtlety to test deliberate looking. Audio is unreviewed.
- **Reliability/navigation/persistence (4.4):** Candidate mobile active screen remains 390px wide with no horizontal overflow; “Hear clue,” two magnifier uses, and ordinary leave path rendered. Prior production evidence covers marker placement/miss telemetry and all bands, but this candidate review did not repeat completion or persistence.

### Sky Shapes

- **Teaching (4.4):** Current Kite mission says “Trace each outline part in order,” identifies green start/red finish, gives a diamond-specific tip about sloping sides and turns, and provides a distinct status instruction. These are concrete and age-appropriate. The small “starter sky goal” capsule above them repeats the one-outline learning objective; consolidate only if reducing repetition proves clearer to children. The independent bounded source/path review checked all twelve facts against their authored routes and found them accurate.
- **Progression (4.4):** Fresh map groups twelve guided flights into Starter, Growing, Challenge, with four distinct missions in each sky. The complete retained baseline and independent teaching review support the substantial path-completion work and increasing compound-outline demands; this review did not re-complete each flight.
- **Correctness and fair variation (4.3):** Current starter Kite prompt/tip and traced diamond agree. Retained teaching evidence shows accurate fact-route matches and purposeful multipart ordering; prior baseline/repair evidence covers ordinary replay, accuracy stars and saved chapter rewards. Candidate order and full scoring variation were not independently rerun.
- **Feedback/audio/visual (4.1):** The 390px view puts the route, start/finish legend, progress, star row, tip, status, replay, hint and keyboard instructions together without horizontal overflow. The drawn route and glowing sampled dots are visually clear. UI copy has mild duplication between the capsule goal and the status/tip; after completion, the fact card and Next behavior were checked in retained bounded evidence. Audio is unreviewed.
- **Reliability/navigation/persistence (4.4):** The current mission and leave-confirmation controls work in the ordinary flow; prior narrow evidence independently tested interrupted pointer/focus/cancellation, immediate save/reload, and no extra star credit on replay. No new candidate persistence or input matrix was run here.

## Premium visual and instructional judgment

The UI is coherent, colorful, well-spaced, and convincingly child-oriented at both widths. Artwork is predominantly simple flat cartoons and emoji/symbol details rather than a strongly authored, premium illustrated scene system. I had no separate user reference image in this review context to compare pixel-for-pixel, so this is a bounded visible-art assessment, not a claim of deviation from an unseen reference. Puzzle Pop’s goal is mainly visual-spatial practice and could more explicitly teach a shape/edge strategy across the three board sizes. Spot’s repeated broad Magnifier clue is the most concrete issue and should be fixed before the feedback dimension can approach 4.5. Sky Shapes’ instructional path and facts are the strongest of the three, with minor copy redundancy rather than a factual defect.

## Certification boundary and next work

No human listening, audible-runtime assessment, canonical production check on ead5a1d, or fresh all-band matrix was done. The retained canonical production identity remains `6b84554…`; ead5a1d is a local packaged candidate. The roadmap explicitly requires production-bound evidence and independent editorial reasons before a 4.5 acceptance. Treat all numeric estimates above as provisional and unaccepted. Address Spot’s repeated Magnifier guidance, consider a more explicit strategy cue for Puzzle Pop, then run only the narrow deltas needed on the resulting frozen candidate plus the outstanding production/audio review gates.

## Evidence files

- Screenshots: `screenshots/desktop-creative-world.png`, `desktop-sky-map.png`, `desktop-puzzle-intro.png`, `desktop-puzzle-active.png`, `desktop-thinking-world.png`, `desktop-spot-active.png`, plus all `mobile-*-390x844.png` states. `mobile-spot-first-magnifier-390x844.png` and `mobile-spot-second-magnifier-390x844.png` show the clue UI after each token.
- Network and console: `diagnostics/desktop-requests-static.txt`, `mobile-requests-static.txt`, `route-guards-and-isolation.txt`, `desktop-console.txt`, `mobile-console-final.txt`; the computed hint-target sample is `diagnostics/spot-hint-target-style.json`.
- Actual UI export: `diagnostics/mobile-game-log-ui-export-final.json` (saved through the browser download event after the final sampled UI interactions).
- Fresh session seeds and interaction summaries: final export events for Sky `3376026969`, Puzzle `1535672285`, and Spot `3321277063` / `3670064917`.
