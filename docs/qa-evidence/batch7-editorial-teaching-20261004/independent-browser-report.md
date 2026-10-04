# Batch 7 independent teaching-copy browser review

Date: 4 October 2026
Candidate: `18e3c30636ecd46dfc8a06fbbfb75451c915338e`
Origin: `http://127.0.0.1:5366/`
Scope: Memory Match Level 4 strategy and repeat control; revised Earth, Saturn, Neptune and Pluto discovery facts at desktop and 390×844. This is a bounded copy/render review, not a rerun of the retained 10-board/9-planet gameplay matrix.

## Identity and test conditions

The builder identity at [`identity.json`](identity.json) reports all 5,694 frozen files served with matching SHA-256 hashes and no mismatches. Live SHA-256 checks for the entry HTML and the main CSS, main JS and Solar System JS matched the frozen `dist`. The current origin served the exact candidate named above.

I used a fresh browser profile. Before the first application navigation, I opened `about:blank`, installed blocking routes for `/api/voice` and `/api/story`, verified both routes were active, then navigated to the candidate. The routes remained installed through reloads. Sound was turned off through the visible control. No voice/story requests were observed, and browser console errors and warnings were zero. No audio control was invoked; no playback, voice generation, provider call or listening claim is part of this report.

## Findings

### Memory Match

I progressed through Levels 1–3 using visible card interactions and the ordinary Next-level control, then inspected the newly unlocked Level 4 strategy at 1280×800 and 390×844. The UI displayed:

> Scan one row at a time. When you turn a picture, remember its row and place. If you see it again, look for the place where its partner appeared.

The tip is actionable and relates a picture to its remembered position. The language is suitable for a six-year-old. It occupies five short lines on the 390px screen without horizontal overflow; the board continues below it with normal vertical scrolling. The `Repeat the memory tip` control measured 48×48px. Activating it left the strategy text in place. This verifies its visible route and affordance only; it does not verify spoken playback or that audio matches the text.

On desktop, moving from a completed Level 3 board to Level 4 retained the prior page scroll offset (the strategy began above the viewport). Scrolling back to the top made the new tip visible. This is a navigation-state observation; it did not prevent ordinary access, but the transition did not reset to the new level’s top.

Evidence: [desktop Level 4 tip](screenshots/desktop-memory-level4-tip-visible.png), [mobile Level 4 tip](screenshots/mobile-memory-level4-tip.png), and [mobile repeat control](screenshots/mobile-memory-repeat-tip.png). The earlier `desktop-memory-level4-tip.png` was captured before scrolling to the top and is not used as evidence of a visible tip.

### Solar System Explorer

Using the normal planet selector and Discovery 6 card, I rendered the four changed facts at 1280×800 and 390×844. The visible copy matched the candidate data in each case. All four cards fit within the 390px viewport without horizontal page overflow. The mobile selector’s More control exposed Uranus, Neptune and Pluto through an internal planet-strip scroll; the document itself remained within 390px width. The passport increased through normal discovery interactions.

| Topic | Rendered fact | Teaching assessment |
|---|---|---|
| Earth: magnetic field | “A magnetic field is an invisible part of space where magnetic forces can act. Earth’s field reaches into space and makes a region called the magnetosphere. It turns many particles from the Sun away from Earth.” | Scientifically careful wording, but too abstract and long for a first explanation to a six-year-old. “Magnetic forces” does not make “magnetic field” more concrete, and “magnetosphere” and “particles” arrive before a familiar anchor. Lead with a simple magnet comparison, then name the magnetosphere and retain “particles” with a short explanation. |
| Saturn: methane | “Methane is usually a gas on Earth. Titan is so cold that liquid methane can fall as rain and fill lakes.” | The Earth/Titan contrast and rain/lakes are concrete. Identify Titan as one of Saturn’s moons, and simplify “liquid methane can fall as rain” to a direct child-facing sentence. |
| Neptune: orbit | “An orbit is a repeating path around another space object. Triton follows its path around Neptune in the direction opposite to Neptune’s spin.” | The first sentence gives a useful definition. Identify Triton as Neptune’s moon and express “opposite to its spin” in plainer directional language. |
| Pluto: shared centre | “Pluto and Charon both circle one point in space between them, called their shared centre of gravity.” | Starting with one point between the bodies is a helpful concrete image. Identify Charon as Pluto’s moon and explain that the two travel around that point before naming “shared centre of gravity.” |

The key teaching weakness is Earth’s definition; the other three are understandable but can be made more self-contained for a child encountering Titan, Triton and Charon for the first time. These are editorial recommendations, not factual-error findings. The facts appeared in the discovery cards. No separate Next action was present in this Solar discovery flow; I did not claim one was tested.

Evidence: [Earth desktop](screenshots/desktop-earth-magnetic-field.png), [Earth mobile](screenshots/mobile-earth-magnetic-field.png), [Saturn desktop](screenshots/desktop-saturn-methane.png), [Saturn mobile](screenshots/mobile-saturn-methane.png), [Neptune desktop](screenshots/desktop-neptune-orbit.png), [Neptune mobile](screenshots/mobile-neptune-orbit.png), [Pluto desktop](screenshots/desktop-pluto-shared-centre.png), [Pluto mobile](screenshots/mobile-pluto-shared-centre.png).

## Acceptance boundary

The retained full gameplay matrices remain the evidence for unchanged board, planet, progression and challenge mechanics. This report covers the new copy in its ordinary UI context and its 390px/desktop rendering. It does not establish native narration readiness or human audio quality. The builder’s readiness file records 2/183 Memory phrases and 111/127 Solar phrases packaged; updated text has missing voice keys. No audio should be treated as accepted from these browser checks. No combined 4.5 score or overall award is assigned here.

## Separate Batch 6 teaching-dimension reconciliation

I reviewed the published Batch 6 assessment (`a8e9bab`, `docs/qa-evidence/batch6-independent-editorial-assessment-20261004.md`) against its retained matrix and subsequent `48925ea` copy/render evidence. This is a teaching-dimension-only reassessment; it does not change the formal feedback/audio dimension, reliability score, or overall acceptance.

| Game | Teaching dimension recommendation | Reason |
|---|---:|---|
| Pattern Parade | 4.5 supported for teaching | The rendered copy delta shows the pre-answer heading is neutral (“What comes next?”); AB/AAB/ABB rule names remain in the held explanation, and the mobile ABB clue identifies the three-place unit accurately. This addresses the assessment’s answer-revealing-title concern using the retained full progression baseline plus the narrow rendering delta. |
| Dino Hangman | 4.5 supported for teaching | The rendered first-question wording is “The hidden word ends in -at. Look for words with the same ending.” It replaces the unexplained `Word family` label with a plain description of the shared ending. The separate Letter clue identifies a letter, not a phoneme, and does not expose the whole word. Full progression/retry baseline remains in force; the copy delta is limited to the opening family wording and clue. |
| Chess Explorers | 4.5 supported for teaching | The assessment’s 4.0 rationale was that one mission is preceded by an all-piece rules paragraph. The retained exact-source copy delta and rendered mission evidence show the instructions reduced to the current task’s relevant rule and the optional-rule disclosure retained. Given the published contract’s one objective and named simplified rules, that addresses the cited teaching defect; this is not an inference from test-string success alone. |
| Astronaut Academy | 4.0 remains | The assessment identified the pre-answer clue as repeating the answer-bearing fact. The bounded retained evidence does not establish the clue/fact separation across authored missions or that the answer remains undisclosed before response. The two diagrams also remain unobserved. |

The Pattern, Hangman and Chess recommendations rely on the exact candidate evidence and screenshots in the separate [Batch 6 editorial browser delta](../../../../dinospace-batch6-quality/docs/qa-evidence/batch6-editorial-copy-browser-20261004/report.md), plus the retained full gameplay matrix; they are not fresh interactions on this Batch 7 origin. The Astronaut sample and diagrams remain insufficient to rescore its teaching dimension. These are supported teaching-dimension recommendations only. They do not imply formal feedback/audio acceptance, reliability evidence, or a 4.5 game/overall award. Where the copy/render delta does not answer the documented child-facing weakness, the prior 4.0 is retained rather than treating missing proof as improvement.
