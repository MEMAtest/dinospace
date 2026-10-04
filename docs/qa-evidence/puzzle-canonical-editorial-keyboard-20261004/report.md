# Puzzle Pop canonical editorial and keyboard delta — 2026-10-04

## Scope and identity

This bounded independent review is bound to the production alias `https://dinospace-eight.vercel.app`, deployment `dpl_2wMjWv6KPJ4QPMKrSJLWinefowDz`, source `c47864404cff1f31c9cefe9b8a363d0ba5542b24`. The seven-file identity is recorded in the root-owned `../sound-preference-canonical-identity-20261004.json`; that identity file is referenced, not modified by this report. The complete 12-scene served-asset manifest and exact byte hashes are in [scene-assets.json](scene-assets.json).

No source changes were made for this review. Root committed a local title correction as `2084095` after the browser audit; it is not deployed. The canonical c478 scene still says **Dino Park Picnic**. The audit and screenshots remain bound to c478, not the local title change.

## Fresh canonical browser check

A fresh isolated browser profile was opened at `about:blank`. Before the first app navigation, Playwright routes for `**/api/voice**` and `**/api/story**` were set to return 204. No child data, seed, progress, storage, or answer state was injected or read. I selected Amari, muted sound with the visible control, opened Creative Lab → Puzzle Pop using the ordinary UI, and started Starter.

At 1280×800 I completed River Valley’s 2×2 board using keyboard input only for puzzle interactions. I tabbed to Hint and pressed Enter; the visible hint selected piece 2 and highlighted space 2. I then used Shift+Tab to focus the highlighted space and Enter to place it. Repeating the visible Hint/focus/Enter pattern completed the other placements; the final unhinted piece and space were also selected with keyboard. The app reported each correct placement and reached the held completion fact and visible Next picture control. The fact remained visible at capture. No mouse input was used on a piece or board space.

Evidence: [held fact screenshot](screenshots/river-valley-keyboard-complete-held-fact.png), [visible hint snapshot](screenshots/keyboard-hint-visible.yml), [completed held-fact snapshot](screenshots/keyboard-completion-visible.yml). The first-correct-placement snapshot is [here](screenshots/first-correct-feedback-visible.yml). The screenshot shows the River Valley art and held fact. Document width was 1280px. Console reported zero errors, warnings, or messages. The observed request log contained only the app and static assets; there were no voice/story requests and no provider calls. The pre-navigation guards remained in place during navigation.

This is one current-c478 keyboard completion at 2×2. It does not establish keyboard completion at 3×3 or 5×5, full mobile keyboard operation, or a full current-c478 seeded gameplay matrix.

## Finite 12-scene editorial/art audit

I inspected the full current 12-image contact sheet and compared every current production-served asset byte-for-byte to the frozen c478 source blob. All 12 returned HTTP 200 and matched the source hashes, dimensions, and byte counts recorded in [scene-assets.json](scene-assets.json). The contact sheet is [all 12 scenes](screenshots/all-12-scene-contact-sheet.png).

| Band | Scene | Editorial observation |
|---|---|---|
| Starter | Dino Park Picnic | Dinosaurs and visible teeth support the diet fact. The image has no picnic table, food, or picnic activity. “Picnic” is unsupported by the art. |
| Starter | River Valley | River, waterfall, plants, land, and animal habitat support the river fact. |
| Starter | Moon Camp | Lunar base, rover, rocky surface, sunlight, and Earth support the Moon-reflected-sunlight fact. |
| Starter | Robin’s Tree | Robin, beak, worm/soil, tree, and greenery support the title and fact. |
| Growing | Hero City Helpers | Street, buildings, trees, characters, and police vehicle support the community-places fact. |
| Growing | Treehouse Robots | Child, robot, arrow blocks, and workshop/treehouse setting support the steps-for-robots fact. |
| Growing | Sound Safari | A waterfall gives the listening-discrimination fact a relevant sound source. The still image alone does not demonstrate listening; the alt accurately describes the path, water, rocks, and plants. |
| Growing | Pattern Festival | Repeated decorative motifs support the pattern-rule fact. |
| Challenge | Time Observatory | Telescope, globe, stars, and sunset support the day/night fact. |
| Challenge | World Explorer | Picture-symbol route map, globe, compass, and workbench support the map-symbol fact. |
| Challenge | History Hall | Ancient-looking ruins, books, map, and compass support the past-clue fact. The scene is outdoors, rather than an indoor hall. |
| Challenge | Nature Lab | Different leaf shapes, plants, sunlight, and botanical tools support the title and fact. |

The only clear title/art mismatch in this finite pass is Dino Park Picnic. “History Hall” is mildly suggestive of an interior while the image is outdoors, but the historical-learning content remains accurate and supported; I did not treat that as a correctness failure. Sound Safari’s fact is a listening concept, so image review does not establish that audio is present, audible, or good.

## Asset framing and crop lineage

The current PuzzlePlay implementation uses the same scene image for preview and puzzle tiles, with cover cropping. The relevant layout/art implementation and the 12 assets did not change between the prior f72 visual baseline and c478; the only Puzzle-specific c478 changes add completed-scene queue rotation and persist the last completed scene. This relationship was checked against the frozen source diff. Thus the prior rendered crop evidence remains useful for those unchanged assets/mechanics, but it is not a fresh twelve-scene current-c478 browser run.

Retained evidence lineage:

- The full earlier 3cdf gameplay/replay matrix remains under its original source/deployment identity; it is historical baseline, not current-c478 recertification.
- The f72 mobile report at `docs/qa-evidence/batch2-canonical-editorial-gate-20261004/report.md` records the current replacement art across all four Starter and four Growing scenes, Nature Lab’s full 5×5 board and held fact, a minimum 48.8px target, and no observed overflow. It also records the Robin’s Tree title. Its source/deployment identity is f72, not c478.
- The 5207 crop report at `docs/qa-evidence/puzzle-crop-5207/challenge-5x5-report.md` records full 5×5 Time Observatory and History Hall plus one World Explorer wide-art board at desktop/mobile widths. It predates the replacement Nature Lab art; that obsolete mismatch is superseded by the f72 render and c478 asset-byte audit above.
- The c478 replay rotation itself has separate candidate and canonical evidence under the Puzzle/Spot replay reports. Those bounded runs do not replace the prior full baseline or claim a new all-band matrix.
- This report adds one fresh c478 desktop 2×2 keyboard completion, with a held fact. It does not claim new 3×3/5×5 rendering or mobile completion evidence.

## Findings and 4.5 rubric context

The prior f72 editorial-gate report provisionally recorded the following five dimensions: age-six clarity 4.4; progression/learning 4.5; correctness/fair variation 4.4; feedback/audio/visuals 4.1; reliability/navigation/persistence 4.5; mean 4.38. Those are historical provisional scores, not a score assigned by this bounded c478 audit. This audit does not raise or certify any dimension.

| Dimension | Current evidence and remaining acceptance action |
|---|---|
| Age-six clarity | Most of the 12 title/fact/art pairings are concrete and readable. Dino Park Picnic has an unsupported title word; apply the local Dino Park correction to a new candidate and independently verify it there. |
| Progression and learning | Historical evidence covers 2×2 → 3×3 → 5×5 progression and held facts. This fresh run confirms a keyboard hint and correct placement through a held River Valley fact. Do not infer full current-c478 progression or all-band keyboard access from one scene. |
| Correctness and fair variation | The 12 facts reviewed are supported by the scenes, with the title exception above. Queue-rotation repair has separate replay evidence. Full current-c478 multi-seed desktop/mobile content coverage is not supplied here. |
| Feedback, audio, and visuals | Correct-placement feedback and held fact were visible; all 12 art assets match served bytes. No human listening or narration quality review occurred. Packaged-voice readiness/listening remains an open mandatory gate. |
| Reliability, navigation, and persistence | The fresh keyboard path completed one board without console errors and held the fact/Next state. Current c478 queue rotation is evidenced separately. This report does not repeat full multi-seed navigation, persistence, or mobile acceptance. |

## Gate status

**Not accepted at 4.5.** This review supplies a finite 12-scene static/editorial audit and one fresh desktop keyboard completion. It does not satisfy the remaining mandatory full current-c478 desktop/mobile seeded runs, all-board keyboard proof, or human listening and narration quality review. The Dino Park Picnic title/art mismatch also remains present in canonical c478. The root’s `2084095` local correction is not released and is not independently verified by this report. No production acceptance or release claim is made.
