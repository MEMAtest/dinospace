# Treehouse real-object render: independent local review

Date: 2026-10-04

Candidate: `http://127.0.0.1:5329`

Source: `88ca034948958a48aa3d3fde66aa6bde18720ada`

Frozen dist: `tmp/spot-treehouse-real-objects/dist`

Identity: `docs/qa-evidence/spot-treehouse-real-objects-identity-20261004.json`

## Verdict

**Reject this candidate’s visual changes.** In the ordinarily unlocked desktop Growing chapter, Treehouse Team (Pair 3) shows five visible target controls but Picture A and Picture B contain no discernible corresponding edits. The blue left-arrow block, green up-arrow block, terracotta plant pot, robot eyes and smile, and red shelf-house roof look the same in A and B. The visible pair therefore does not support the five claimed object differences. A labelled “Check right middle detail” button still advanced the score to 1/5 and drew a found marker at the plant pot. That confirms the control can award a target, but does not repair the absent visible difference.

The shared desktop Starter review also failed visually for Dino Park, Superhero City and Moon Camp: the displayed A/B pictures looked unchanged at their intended target objects, while their visible labelled target buttons could still complete the pair. River Valley clearly showed the sun-to-moon and flower-colour changes. This is a partial desktop regression review, not a complete mobile matrix. Root later confirmed the frozen renderer’s SVG clip path contained an unsupported nested `<g>`, leaving these generated colour changes clipped away. That diagnosis is root-provided; the screenshot observations and control results below are my independent evidence.

## Identity and safeguards

Every one of the 12 files in the candidate identity returned HTTP 200 with the expected byte count and SHA256. Both browser sessions began at `about:blank`. Before desktop `page.goto("http://127.0.0.1:5329")`, I installed `/api/voice` and `/api/story` route handlers that return 204, then set the viewport to 1280×800. The mobile session used the same guarded `about:blank` then `goto` order at 390×844, but stopped at the Thinking & Play world list before opening Spot. Sound was turned off in each profile through the visible UI.

On desktop, the page’s performance resource list contained no `/api/voice` or `/api/story` requests, both Treehouse images were fully decoded at their intrinsic 1254×1254 size, document width and scroll width were both 1280, and the browser console reported no messages. No child data, seed, progress, answer, storage, hidden solution or guide state was injected or inspected; no provider request escaped the route guards. The mobile Spot game itself was not entered or tested.

## Rendered findings

At 1280×800, the Treehouse pair was shown as two square source images rendered side by side. A same-size screenshot crop measured 580×435 per displayed image. The aligned A/B screenshot crops differed at 1,280 of 252,300 pixel positions, but those sparse differences did not form the listed object edits. This pixel count is supporting evidence only; the rejection is based on direct visual comparison.

- Blue arrow block: both pictures show a white right-pointing arrow.
- Green arrow block: both pictures show a white upward-pointing arrow.
- Plant pot: both pictures show the same terracotta pot and green plant.
- Robot face: both pictures show the same cyan eyes and smile.
- Shelf house: both pictures show the same small red roof.

The first magnifier hint read “look near the left bottom of Picture B.” After a visible target button click at right middle, the UI showed 1/5 and a found marker around the pot. The two image objects still appeared unchanged. No surrounding badge or crop defect could be accepted as an object difference.

In the four desktop Starter pairs visited in ordinary order, Dino Park, Superhero City and Moon Camp likewise appeared visually unchanged between A/B in the saved initial screenshots. River Valley visibly changed the yellow sun into a crescent and recoloured a lower-left flower; I did not rely on that scene to infer correctness of the absent Treehouse edits. The sampled Growing Pair 1 Sound Safari also had visibly unchanged A/B artwork in its initial render.

## Normal UI coverage

| Viewport and chapter | Observed path and result |
|---|---|
| Desktop 1280×800, Starter | Amari → Thinking & Play → Spot → Bright-Eyed Beginners through normal menus and Start. The ordinary randomized order was Dino Park, Superhero City, Moon Camp, River Valley. The visible accessible `Check … detail` target buttons completed each 3/3, with a completion fact and Next picture for each; the chapter then completed 4/4 and unlocked Curious Comparers. This proves ordinary progression/control response only. It does not make unchanged artwork acceptable. |
| Desktop 1280×800, Growing | Entered Curious Comparers after the visible Starter unlock. Pattern Parade and Sound Safari each reached 5/5 via their visible `Check … detail` controls and exposed their completion fact and Next picture. Treehouse Team appeared as Pair 3 of 4, initially 0/5. One visible `Check right middle detail` click advanced it to 1/5; first magnifier use reported the left-bottom hint. Testing stopped after the concrete visual failure, so no Treehouse held fact, Next, second hint, or reload was exercised. |
| Mobile 390×844 | Fresh guarded profile reached Amari home and the Thinking & Play world list. Spot was not entered; no mobile Starter or Treehouse controls or artwork were tested. |

## Evidence files

- `screenshots/starter-dino-park.png`, `starter-superhero-city.png`, `starter-moon-camp.png`, `starter-river-valley.png` — initial desktop Starter pairs in the randomized order.
- `screenshots/growing-sound-safari.png` — sampled Growing Pair 2 initial render.
- `screenshots/treehouse-before-search.png` and `treehouse-initial-snapshot.yml` — desktop Treehouse at 0/5 before interaction.
- `screenshots/treehouse-desktop-ab.png` — side-by-side crop of the visible pair.
- `screenshots/treehouse-aligned-difference-x16.png` — amplified aligned screenshot difference for review; it does not reveal recognizable target edits.
- `screenshots/treehouse-after-labelled-target-and-hint.png` and `treehouse-hint-snapshot.yml` — 1/5 result and first magnifier hint.

## Gate disposition

- **Treehouse object-edit visibility:** Fail. The five described object changes were not visibly present in Picture B.
- **Shared Starter visual regression:** Fail for the observed desktop Dino Park, Superhero City and Moon Camp pairs; River Valley’s existing sun/moon and flower changes remained visible. Mobile Starter remains untested.
- **Desktop target controls/progression:** Visible target controls completed sampled Starter and Growing pairs, including one Treehouse target. This is control response evidence, not proof that absent changes can be independently identified.
- **Treehouse target alignment, second hint, held fact/Next, reload:** Incomplete after early visual failure; not claimed as passes.
- **Audio, production, overall score:** No listening or provider-generation claim, no production acceptance, and no 4.5 score.
