# Batch 2 current-canonical editorial gate review

**Run date:** 2026-10-04 (Europe/London)

**Canonical alias:** <https://dinospace-eight.vercel.app>

**READY deployment:** `dpl_2STuJZUmaGLU6Vpvj5sb6uSj4B7t`

**Frozen source:** `f72f59edf2c4df00d3f4649e22310bbf2281c9a0`
**Identity evidence:** [canonical recheck](../canonical-runtime-recheck-20261004.json), [Monster clue identity](../monster-clue-canonical-identity-20261003.json)

## Scope and method

This is a bounded production review of the four Batch 2 games, not a full recertification. I read the 4.5 roadmap, latest remaining-gates audit, current-canonical reconciliation, and production-final reports before testing. Runtime deployment identity and all seven listed served assets were re-fetched and SHA-256 checked against the frozen identity; every asset returned HTTP 200 and matched. The current alias identity also matches the root's independent Vercel recheck.

The mobile UI check used a fresh named Playwright browser profile at 390×844. Before first app navigation, `/api/voice` and `/api/story` were guarded; there were no API/provider calls in the observed request list. The Amari age-6 profile and progress were earned through ordinary visible navigation and answers. No storage, seed, progress, hidden answer, or child-data injection was used. Sound remained off; fetched packaged MP3 resources are not treated as playback or listening evidence. Browser console recorded zero errors, warnings, or messages. Screenshots are under [`mobile/`](mobile/).

The source diff from the retained 3cdf production runtime to f72 changes only `src/components/games/MonsterMath.jsx` among these four game components. Therefore the 3cdf Puzzle, Spot and Sky production baselines remain relevant for unchanged mechanics, but are still cited as linked historical evidence rather than relabelled as new f72 runs. The exact current Monster clue check is separately documented in [its f72 report](../monster-clue-canonical-20261004/report.md).

## Fresh f72 mobile observations

### Puzzle Pop

Normal navigation reached Creative Lab → Puzzle Pop. The active header and preview both showed the full title **Robin’s Tree**. Picture Pioneers exposed its 2×2 picture strategy; Curious Constructors exposed the 3×3 edge/colour strategy; Detail Detectives exposed the 5×5 row/column and small-feature strategy.

I completed all four Starter and all four Growing pictures using visible Hint and ordinary piece/space controls. The visible order was Robin’s Tree, Moon Camp, Dino Park Picnic, River Valley in Starter; Treehouse Robots, Pattern Festival, Hero City Helpers, Sound Safari in Growing. Each picture held one matching fact until I advanced. Challenge unlocked through the visible chapter flow. Its first scene, **Nature Lab**, had a sunny botanical workbench preview with differently shaped leaves, plants and seeds. The visible mapping hint lit preview cell 16 and board cell 16; selecting the piece alone left the move count at zero, and selecting the lit space placed it. The completed fact (“Leaves can have different shapes, but they all help plants use sunlight.”) matched the art.

At 390px, the 5×5 board cells measured 48.8×48.8px and tray pieces 50.7×50.7px; Back, sound, prompt, and mapping controls met 48px height/size. Page/body widths were 390px with no horizontal overflow. The low-margin board cells and tray/last row below the initial fold were reachable by ordinary scroll. This is a narrow positive check of f72 artwork, mapping, facts and target size; it is not a fresh keyboard completion or all-aspect-ratio crop audit.

### Spot the Difference

Normal navigation reached Thinking & Play → Spot the Difference. Its rendered map showed four pairs in each band and a 3/5/7 differences progression, with a top/middle/bottom comparison routine. The first pair was **Moon Camp**, with three changed details. Page/body width stayed at 390px. The two pictures rendered 334×250.5px each; Hear clue and Magnifier were 48px high, and each target measured 56×56px. Picture B and its search surface extended below the initial viewport, but ordinary Playwright scrolling brought the target into view and the first target registered correctly; the large search surface did not intercept that hotspot.

The visible left-bottom star/heart difference registered as 1/3. The first Magnifier use announced “look near the left area of Picture B”; the second announced “look near the right area of Picture B.” The remaining left-middle and right-middle hotspots registered once each and completed the pair at 3/3. Completion held one Moon fact and **Next picture** advanced to a new visible pair (Dino Park), still at 0/3. The tested pair therefore confirms distinct remaining-area hints, hit registration, one held fact and Next. It does not freshly measure all seven Challenge targets on f72; the existing 3cdf production Challenge evidence has two seven-target scenes per viewport, 56×56px controls, no overlap, distinct hints and held facts, and the changed component lineage does not touch Spot.

### Sky Shapes

Normal navigation reached Creative Lab → Sky Shapes. The visible map named Cloud Meadow, Rainbow Ridge and Aurora Station; it showed four missions in the Starter sky and a simple-to-more-detailed progression. The first active mission was **Window Cloud**. The current 390px flight placed the numbered green start and checkered finish on the route with readable labels, a strategy sentence, a 0/1 parts counter, and visible “Start at the green 1. Trace the square outline.” instruction. The board and start/finish markings were clear and did not overlap; document and body width stayed 390px. Hear mission, trace hint and restart controls were at least 48px high. The primary header controls can move above the current viewport after a route transition, but normal scrolling returned them; keyboard help below the fold was also reachable by normal scroll.

The screen-reader live progress text in this candidate included “Guide 1 of 1; 0% of sampled moves are on the guide.” This is a child-facing accessibility-copy defect: technical “sampled moves” language is announced from the live region, even though it is not displayed in the visible screen layout. It does not establish a route-scoring failure. Root has separately prepared a wording repair for an independent narrow retest. Historical 3cdf evidence covers full Starter/Growing, two multipart Challenge missions, restart and held facts; this review did not replay those routes.

### Monster Math

The exact-current f72 Monster check is the linked independent report. With ordinary navigation and guarded API routes, it completed the six visible Counting questions to unlock Growing. Desktop tested a one-use clue, wrong retry, correct answer and held Next. Mobile likewise tested a wrong answer, correct answer and held Next; the 176×56 Next target was below the initial 844px viewport but operable after ordinary scroll. Neither sample generated the known 2 + 10 = 12 regression prompt. The exact canonical report records no console errors and that audio stayed off. This current sample does not close the exact duplicate-model/feedback regression until that prompt is exercised naturally, nor the remaining chapter map and subtraction-route checks.

## Provisional rubric reconciliation

The roadmap uses five dimensions: age-6 teaching, progression, correctness/fair variation, feedback/audio/visual design, and reliability/navigation/persistence. The numeric estimates below are the retained **historical provisional review of local source `037914f`**, not a re-score of f72. New f72 samples support narrow observations noted here but are insufficient to infer a new five-dimension score. `null` means unobserved on the current bounded review, not zero.

| Game | Age-6 teaching | Progression | Correctness / fair variation | Feedback / audio / visual | Reliability / navigation / persistence | Current f72 review result |
|---|---:|---:|---:|---:|---:|---|
| Puzzle Pop | 4.4 historical; current three board strategies are explicit | 4.5 historical; mobile completed 4 Starter + 4 Growing and unlocked Challenge | 4.4 historical; current Nature Lab art, hint mapping and fact align, but all scene bindings/replay are not rescored | 4.1 historical; mapping and feedback observed, but no human listening | 4.5 historical; 390px no overflow and scroll reachability observed; reload/sibling not rechecked | Prior mean 4.38; no f72 re-score or acceptance |
| Spot the Difference | 4.5 historical; current map comparison routine is clear | 4.5 historical; current sample advances to pair 2; no full unlock run | 4.4 historical; three current Moon Camp differences and two distinct hints worked; 7-target set not rescored | 4.2 historical; current pair has 56px targets and one held fact; no listening | 4.5 historical; 390px width and hotspot operability pass; full current-state persistence not rechecked | Prior mean 4.42; no f72 re-score or acceptance |
| Sky Shapes | 4.6 historical; current strategy/start/finish cues clear, but live-region wording defect remains | 4.5 historical; three-sky/four-flight route visible; no full route replay | 4.5 historical; current route markers visible, but route completion/scoring not retested | 4.2 historical; visual cues and target sizes sampled; no human listening | 4.5 historical; no overflow, but current 390px full flow/persistence not rechecked | Prior mean 4.46; no f72 re-score or acceptance |
| Monster Math | 4.5 historical; current clue is single and model-specific in report | 4.5 historical; Counting unlocks Growing in ordinary UI | 4.5 historical; wrong/correct feedback works in sampled questions, exact 2+10 regression remains untested | `null` current sample; no audio playback/listening and broad visual dimension not reassessed | `null` current sample; narrow Next and confirmation/reachability only | Historical three dimensions only; no five-dimension mean or acceptance |

These are not new editorial awards: the retained numeric values remain bound to their old candidate and the current review does not raise them. No current score is assigned where the evidence is insufficient. In particular, no game reaches 4.5 acceptance from this report.

## Product changes, proof gaps, and mandatory gate

| Item | Classification | Remaining action |
|---|---|---|
| Sky `aria-live` “sampled moves” wording | **Confirmed product/accessibility copy defect** | Independently verify the replacement live-region message at desktop and 390px, for progress, rewind/restart and completed state; check it remains understandable with a screen reader and does not change route scoring. |
| Puzzle 5×5 minimum size | **Near-threshold visual risk, no failure observed** | The measured cell is 48.8px, only 0.8px over the 48px contract. Keep a comfortable margin on narrow/zoomed layouts and include all active 5×5 states in the final rendered-control sweep. |
| Puzzle sample scope | **Evidence gap** | Retain current Nature Lab success, but complete the all-art/fact/crop contract audit for portrait, landscape and wide art at 2×2/3×3/5×5; test keyboard completion and another long title on current production if a release delta changes them. |
| Spot visual subtlety | **Editorial decision / potential polish, not a reproduced defect** | The Moon Camp differences are conspicuous object/position changes. Historical Challenge pairs remain proven and Spot code is unchanged since 3cdf, but an editor should decide whether all seven-difference scenes remain scene-integrated and small-but-clear. Do not rewrite art without that review. |
| Spot seven-target geometry | **Historical proof retained; exact f72 geometry not freshly measured** | Carry 3cdf two-pair-per-width geometry evidence under its identity; if later Spot CSS/data changes, measure all seven rectangles and intersections at 390px on that release. |
| Monster 2 + 10 duplicate explanation | **Open concrete production regression gate** | Reproduce exact `2 + 10 = 12` through the natural question queue and compare one pre-answer model/clue with one post-answer explanation; do not infer closure from nearby sums. |
| Monster other sampled current UI | **Proof gaps, not yet demonstrated defects** | Check the available/locked episode label and one subtraction story’s pre-answer route/range; current clue report does not cover these. |
| Shared 390px target sweep | **Open mandatory proof gate** | Finish one per-game exhaustive sweep of visible control classes and states, recording rendered bounds and overflow. This review sampled selected controls only. |
| Human narration review | **Open mandatory external gate** | The corpus has prior decode/asset readiness and historical browser media event evidence; neither proves wording, pronunciation, intelligibility, joins or prosody. Human listening remains required. No voice provider call or audio-quality claim is made. |
| Same-band replay pairs | **Historical identity-linked evidence** | The earlier reports cover all eight game×viewport pairs across linked production releases; this report did not repeat them. Preserve the release lineage; rerun only when changed replay/queue code invalidates it. |

The roadmap also requires per-game mandatory gates in addition to five supported dimensions and a ≥4.5 mean. Batch 2 therefore remains **in progress / not accepted**. This review does not assert catalog acceptance, full f72 gameplay coverage, complete current 390px control coverage, or human audio acceptance.

## Evidence index

- Fresh f72 mobile Puzzle: `mobile/puzzle-*` screenshots.
- Fresh f72 mobile Sky: `mobile/sky-starter-flight-before.png` and `mobile/sky-starter-flight-viewport.png`.
- Fresh f72 mobile Spot: `mobile/spot-starter-start.png` and `mobile/spot-starter-complete.png`.
- Exact f72 Monster clue/wrong/correct/held-Next behavior: [`monster-clue-canonical-20261004/report.md`](../monster-clue-canonical-20261004/report.md) and its desktop/mobile screenshots.
- Prior full gameplay/replay/media lineage: [`batch2-production-final-20261003/report.md`](../batch2-production-final-20261003/report.md), [`follow-up-report.md`](../batch2-production-final-20261003/follow-up-report.md), and the current-canonical reconciliation report. All retain their own exact deployment/source identities and limitations.
