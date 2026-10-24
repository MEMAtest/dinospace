# Time Teller and Number Line Jump — targeted close-out, 24 October 2026

## Acceptance before implementation

Existing production baseline: `8efdde9d7b1f130f2c720e64584127303b04032e`, public Netlify origin. These games already have three six-mission chapters; this work must improve the learning interactions while preserving their records, packaged narration and curriculum return route.

| Game | Release acceptance |
|---|---|
| Time Teller | One clear mission and start action; readable hour/minute distinction; optional hands-on clock practice available before the first chapter. Direct touch/mouse hand-setting plus keyboard/button alternatives, quarter-hour snapping and correct hour carry/wrap. Read, quarter-to, routine and set missions agree with rendered hand angles and answer labels. Six distinct questions per chapter; wrong retry and one-use clue; correct worked answer stays until Next and packaged explanation replays. All three chapters, replay, earned stars/badges, reload and Maths/Curriculum return work at 390 and 1440px. Final earned chapter is stored when the last answer is solved, even before Finish. |
| Number Line Jump | Whole number line fits the phone without a hidden horizontal strip; start, current frog and each accepted hop are visible. Full-size tap/keyboard controls and frog swipe move exactly one step; wrong direction changes neither position nor hop count. Missing-start/hops/landing and farther/larger comparisons have clear, separate visual models without accidentally labelling an unknown answer. Six distinct questions in each of three worlds. Retry, clue, held/replayable explanation, normal unlock, replay, durable earned records, reload and parent return work at both widths. Final earned world is stored before Finish. |

Shared: controls at least48px, no page overflow, broken images, console/page errors or paid provider requests. Use only the one persistent synthetic headless QA browser and existing installed dependencies. No resetting of any progress ledger. Production acceptance requires the verified immutable candidate, gateway preview and final public Netlify rehearsal. Technical playback is recorded separately from subjective human listening; no automatic5/5 editorial claim.

## Status

Implementation and rehearsal in progress. Baseline DOM/phone geometry retained in `baseline.json`. No production release claimed yet.

## Rehearsal repairs

The first390px local run found a3px inner overflow in one comparison figure when the frog sat at the scale edge. The endpoint padding was increased and the SVG scale aligned with the new inset. Retain the failure observation; rerun the actual chapters before accepting.

The QA helper briefly false-blocked on a CLI event/status line because it counted every leading dash as a tab. Read-only session/tab inventory confirmed one persistent headless tab. The parser now counts only numbered tab entries and still rejects two/zero tabs; fixture checks cover both. One local rerun command continued after the false block due shell exit handling; the existing owner lease remained valid, the same single tab was used, and no browser resource was created. Subsequent orchestration requires a successful ready result before gameplay.
