# Batch 7 Memory Match theme candidate: independent QA

**Run date:** 2026-10-03 to 2026-10-04 (Europe/London)
**Frozen candidate:** source `37499e8064b5478d2aebcc52641c4872ecc4e5eb`, served at `http://127.0.0.1:5283`
**Identity:** [`batch7-memory-premium-identity-20261003.json`](../batch7-memory-premium-identity-20261003.json)
**Scope:** independent review of the Amari Memory Match visual/theme upgrade. This report supplements, and does not replace, the earlier full ten-board/two-viewport gameplay matrix on source `b36d078c52bd551efd2cb2b962e386ef78d575c4` in [`batch7-independent-qa-20261003/report.md`](../batch7-independent-qa-20261003/report.md). It is not a release or 4.5 acceptance.

## Setup and method

Before first navigation in each fresh Playwright profile, I installed route guards for `**/api/voice**` and `**/api/story**`, then loaded the local candidate. Profiles: `b7mem-premium-20261003` (1280×800 desktop first, then 390×844 theme/layout checks) and `b7mem-mobile-isolated-20261004` (fresh 390×844 profile). The fresh mobile profile started at 0 pairs, 0/10 stickers, and Levels 2–10 locked. No browser storage, seed, progress, or hidden card content was injected or inspected. Card names were read only after the corresponding card was actually turned face up through the UI.

All five served files listed in the frozen identity were independently SHA-256 checked against that identity before review and again after interaction; every hash matched. Both API patterns were guarded. The desktop profile produced 99 console resource errors, all expected 403 responses from the voice guard; there were zero `/api/story` console errors. No provider-generated data, paid calls, or audio playback/listening claim was made.

## Desktop ordinary unlock and theme/pair review

At 1280×800 I started Amari from the welcome screen, entered Thinking & Play → Memory Match, and completed the levels in order through visible card flips and the enabled **Next level** control. At the initial level the remaining level pills were disabled. Each solved board had exactly twice its expected pair count in matched card controls. These were the rendered, face-up labels observed after real clicks:

| Level | Theme | Expected / observed pairs | Distinct face-up labels observed |
|---:|---|---:|---|
| 1 | Forest Friends | 4 / 4 | dog, frog, monkey, fox |
| 2 | Ocean Splash | 8 / 8 | fish, turtle, crab, jellyfish, squid, shark, dolphin, whale |
| 3 | Space Sparkle | 10 / 10 | galaxy, alien, satellite, moon, rocket, flying saucer, ringed planet, star, glowing star, comet |
| 4 | Party & Treats | 12 / 12 | party popper, chips, party face, pizza, strawberry, watermelon, sweet, cake, doughnut, lolly, cupcake, balloon |
| 5 | Dinosaur Discovery | 13 / 13 | long-neck dinosaur, leaf, fossil dig rock, volcano, mountain, dinosaur nest, fossil dig pick, T-rex, egg, seedling, tree, bone, dinosaur tooth |
| 6 | All Kinds of Vehicles | 14 / 14 | helicopter, fire engine, bicycle, scooter, aeroplane, tractor, passenger train, racing car, steam train, car, speedboat, rocket, bus, flying saucer |
| 7 | Yummy Feast | 15 / 15 | doughnut, lolly, biscuit, drink, apple, cheese, watermelon, strawberry, corn, grapes, pizza, cupcake, banana, carrot, chips |
| 8 | Astronaut Mission | 16 / 16 | satellite, alien, ringed planet, comet, Sun, telescope, shooting star, Earth, moon rock, astronaut, star, flying saucer, moon, galaxy, glowing star, rocket |
| 9 | Garden & Pond Life | 17 / 17 | snail, mushroom, spider, water lily, ant, leaf, bee, worm, ladybird, tulip, caterpillar, frog, pond fish, turtle, seedling, duck, butterfly |
| 10 | Galaxy Challenge | 18 / 18 | Earth, telescope, moon, star, Sun with a face, ringed planet, galaxy, astronaut, flying saucer, glowing star, shooting star, new moon, alien, moon rock, satellite, comet, full moon, rocket |

The sequence was 4, 8, 10, 12, 13, 14, 15, 16, 17, 18 pairs. A deliberate wrong first move on Level 1 turned back over; matched pairs stayed face up. Progressed boards added one visible completion item per level, ending at 10/10. Reload reopened Level 10 with its zeroed round counter and all levels unlocked. The sticker page then showed 10/10 Memory boards collected. After switching through the ordinary player chooser to Askia and back, Amari still showed 21 stars and 10/10 Memory stickers; Askia showed 0 stars and the distinct legacy Memory Match route (“Meet the Friends”, 3 pairs, five boards, only Board 1 unlocked). Askia’s game was not progressed. This is a narrow route/isolation check, not a full Askia regression matrix.

## Mobile layout, reachability, motion and visible quality

At 390×844 I reviewed the fresh Level 1 screen and, after ordinary desktop unlocks, sampled face-up cards in Levels 5, 6, 8, 9 and 10. The fresh mobile profile showed 0/10 and kept Levels 2–10 disabled. A horizontal scroll over the level-pill row exposed Levels 4–10; the body remained 390px wide with no horizontal page overflow. On the fresh profile the eight Level 1 cards were 82×82px. On the progressed profile, the header Back/Sound, memory-tip speaker, level pills, and floating mission button were 48×48px. At desktop, Level 1 cards were 231×231px. The layout uses four card columns on mobile and vertical page scrolling for larger boards.

The rendered title, strategy copy, counters, and active green/blue level pills appeared legible against their backgrounds in the captured screenshots. This is a visual review, not a numeric WCAG contrast audit. With `prefers-reduced-motion: reduce` emulated, `matchMedia` reported true and the card’s computed transition/animation durations were `1e-05s` with `transition-property: none`, indicating the reduced-motion override is applied. No physical-device or assistive-technology certification was performed.

The palettes and card backs are themed: the dinosaur board uses a bone motif and green styling, vehicles a traffic-light motif, the garden a leaf motif, and the space boards star/galaxy motifs. The themed front faces remain standard platform emoji (for example T-rex, fossil pick, turtle, rocket, and dog), with visible text labels. This is a clear visual upgrade over generic uniform boards, but it does **not** meet a premium-illustration bar. The dinosaur board includes natural/prehistory support items (leaf, seedling, tree, volcano, mountain and fossil tools) alongside dinosaur-specific pieces; the vehicle board includes rockets and flying saucers, consistent with its broad “All Kinds of Vehicles” framing. No duplicate-pair mismatch or within-board ambiguous label was observed; distinctions such as `star`/`glowing star`, `Sun`/`Sun with a face`, and `moon`/`new moon`/`full moon` are clear in the rendered labels.

## Reproducible mobile blocker

At Level 5 on the 390px viewport, the fixed Daily Mission panel overlaps the fourth card in the sixth row. Its “Play today’s mission: Complete 3 astronaut questions” button occupied x=319–367, y=763–811; the card’s visible center was x=330, y=795. `elementFromPoint` at that center resolved to the mission button rather than the memory card. A real pointer click at (330,795) navigated from Memory Match to `#/play/astronaut` (mission picker) instead of flipping the card. I did not start a mission. Scrolling the page can move the card away from the panel, but the default mobile board view presents an actionable memory-card location that routes elsewhere. Hide/reposition the fixed panel while these boards are active or reserve enough unobstructed board space, then retest the full level sizes at 390px.

The selector’s initial view also shows only Levels 1–7; horizontal scrolling reveals 8–10. This is recoverable and does not create body overflow, but a visible scroll affordance would make the hidden later levels easier to discover.

## Evidence and lineage

Screenshots in [`screenshots/`](screenshots/) capture the frozen candidate’s desktop boards, mobile theme samples and selector, the mobile mission-overlay hit, the 10/10 Amari passport, the fresh mobile profile, and Askia’s separate Memory Match route. Earlier complete ten-board, replay, reload, mobile reachability, and Solar gameplay evidence remains in the linked 5257 report; this candidate-specific run fully completed all ten boards at desktop and performed targeted 390px theme/control checks, not a second complete mobile gameplay matrix. The reduced-motion inspection and browser screenshots are Chromium-only. No native audio, premium art, human listening, production storage, deployment, or full 4.5 acceptance is certified.

## Findings and next acceptance actions

1. **Essential functional repair:** prevent the fixed Daily Mission CTA from receiving taps meant for Memory cards at 390px. Verify actual clicks on the overlapping target at Levels 5, 6, 8, 9 and 10 after the fix.
2. **Essential visual/content gate:** replace emoji card faces with a cohesive set of custom, child-friendly illustrations and review all ten themes at desktop and mobile; current color/back treatment alone does not close the premium illustration gate.
3. **Editorial/accessibility polish:** the visible tip changes by level and contains concrete strategy sentences, but its repeat control’s accessible name remains generic (“Repeat the memory tip”). Give the repeat action a name tied to the displayed strategy (or its short topic), and verify the rendered accessible name when the tip changes.
4. **Mobile discoverability:** consider an explicit cue that the chapter selector scrolls horizontally; verify that all ten pills remain reachable after the layout repair.
5. Retain the earlier verified counts and Solar baseline. Do not infer audio/listening, human visual acceptance, production readiness, or a 4.5 score from this local candidate.
