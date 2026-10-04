# Astronaut Academy teaching repair

Date: 2026-10-04  
Runtime source commit: `764b2ff49b6c40c13df928b4449d0a1f68fbe660`  
Scope: authored Amari Astronaut mission prompts, clues and facts; finite clue narration labels; no gameplay, question-pool, progress, source-URL, or Askia changes.

This builder repair follows the [36-mission source audit](astronaut-academy-36-mission-builder-source-audit-20261004.md). Ordinary **Mission clue** still means a reasoning hint. When a clue must teach a factual name or definition directly, the control and visible/speaking prefix now say **Learn clue**. Both kinds use the existing `journey.hint` counter (`hintType: clue` or `hintType: learn`), so using either clue makes the answer assisted and prevents it from earning an independent-answer credit. A Learn clue is not presented as a deduction.

## Mission edits and reasons

The answer, choices, stable mission ID, source URL, queue size, source validation and answer lock were preserved. The changes below cover every changed mission record; `gravity` and `earth-rotation` records were left unchanged.

| Mission | Copy edit | Reason |
|---|---|---|
| sun | Replaced the “brightest thing” description with standing in sunlight and shade and asking what sends the light. | Keeps a concrete observation while avoiding the answer’s near-definition. |
| moon-orbit | Changed to a labelled Learn clue: “The Moon travels around Earth.” | The original clue named the correct choice as the planet where we live; this is factual recall, so direct teaching is marked and counted as assisted. |
| mars | Changed to a labelled Learn clue explaining that rusty-looking dust is why Mars is called the Red Planet; simplified the fact to “Tiny iron-rich grains in Mars dust…” | The nickname clue almost gave the answer; the new clue teaches the recall fact openly and replaces unexplained “iron minerals” and “Martian.” |
| space-suit | Changed to a labelled Learn clue defining the spacesuit’s air and protection jobs; simplified the fact to air to breathe and body safety. | The old clue defined the answer while pretending to be a reasoning hint; “oxygen” also needed a child-friendly gloss. |
| solar-power | Reworked clue around lights, computers and tools; fact now says panels change sunlight into electricity that runs spacecraft systems. | Makes the question’s “what into?” task concrete and explains what electricity does. |
| rover-wheel | Reworked clue as a rover-versus-flight movement question; fact now says wheels let the robot roll over Mars’s rocky ground. | Removes the original clue’s near-answer and uses plain movement language. |
| moon-light | Reworked clue to observe the Moon’s bright part over time; fact explains that moonlight is sunlight bounced back toward us. | Keeps an observation-based path to the answer and glosses “reflected.” |
| earth-water | Replaced “most of Earth is ocean” with a mental globe view comparing blue and brown areas; fact explains water that is not frozen. | The old clue stated the answer; the new prompt supports comparison without naming water. |
| space-robot | Reworked clue to ask what would let scientists see the ground ahead; fact replaces “images/terrain/drives” with pictures, ground and safe drives. | Reduces abstract language and gives the camera a practical purpose. |
| earth-shape | Reworked clue around a curved outside without corners; fact says Earth is almost a ball and slightly wider in the middle. | Keeps the shape inference and explains the more technical “spherical.” |
| rocket-fuel | Replaced the exhaust-direction giveaway with an untied-balloon observation; fact defines hot gas pushed downward and the rocket’s upward motion. | Preserves a concrete action/reaction analogy and defines the former unexplained “exhaust.” |
| air-layer | Changed to a labelled Learn clue naming the atmosphere as the layer of gases around Earth; simplified the fact to the same clear definition. | The question is term recall, and the prior clue effectively gave the definition without labelling it teaching. |
| water-ice | Kept the cold/hidden-location reasoning but made it concrete as the cold top and bottom regions and under-ground places; fact says north/south poles and under the ground. | Clarifies “polar caps” and “beneath” without giving one of the answer options verbatim. |
| heat-shield | Changed to a labelled Learn clue defining a heat shield as a protective covering; the post-answer fact uses the same child-level explanation. | The old clue merely repeated the danger and asked for its named protection; direct term teaching is now disclosed and assisted. |
| parachute | Kept the falling-leaf model and added a question about how catching air can slow something down; fact explains air pushing back. | Retains an actionable physical analogy and explains the former unexplained term “drag.” |
| antenna | Reworked clue around sending messages without driving back; fact explains that the antenna sends radio messages and Earth equipment receives them. | Keeps a functional inference and removes unexplained “receivers.” |
| earth-seasons | Reworked clue as a comparison of sunlight on Earth’s top and bottom halves; fact defines the axis as the imaginary spin-line and connects tilt to seasons. | Glosses “axis” and “hemisphere” while retaining the causal science. |
| mars-moons | Changed “orbit Mars” in the question to “travel around Mars”; retained the Phobos-and-Deimos counting clue. | Avoids an unexplained first-use term and preserves a real count-from-names task. |
| rover-camera | Made the clue ask what could show a rover where a rock is; fact replaces “onboard software/hazards” with the rover’s computer spotting rocks and planning a safe route. | Keeps the safety-planning inference but removes technical wording. |
| landing-legs | Reworked the clue to ask how strong legs keep a lander upright; fact says the legs help it stand steadily and hold its weight. | Keeps the rough-ground reasoning while making the support function plain. |
| planet-path | Changed to a labelled Learn clue defining an orbit as one object’s path around another. | This is vocabulary recall; the old clue gave a full synonym-definition and falsely implied deduction. |
| signal-plan | Replaced the broad distance clue with a command-travel-and-wait scenario; fact explains that radio messages take time and the rover follows prepared steps. | Turns the distance idea into an engineering consequence and explains how planning helps. |
| venus | Changed to a labelled Learn clue explaining that Venus’s thick air holds heat; fact glosses atmosphere/carbon dioxide in plain language. | The previous clue just restated “thickest, hottest”; this mission tests a factual planet property. |
| jupiter | Changed to a labelled Learn clue stating Jupiter is the largest planet. | For planet-name recall without an in-game size diagram, teach the fact openly and record assistance. |
| europa | Changed to a labelled Learn clue identifying Europa and stating the cautious evidence claim in plain terms; fact uses “may have salty water under its icy outer shell.” | The question is factual name recall and the old clue did not offer a meaningful way to reason among three moons. The updated wording preserves scientific uncertainty. |
| parachute-design | Replaced “wider canopy” with a reasoning step: a wider parachute catches more air; asks how that changes a lander’s fall. | Removes unfamiliar “canopy” and does not state the larger-parachute answer. |
| rover-power | Clue now compares weak sunlight with bright sunlight; fact explains that some Mars rovers use a nuclear-powered system that turns heat into electricity when sunlight is limited. | The old fact’s “radioisotope power system” was unexplained jargon; this keeps the supported mechanism in child-level words. |
| signal-delay | Replaced the direct distance-to-delay statement with a room-versus-Mars message comparison; fact explains the delay and what the rover does while waiting. | Keeps a concrete inference without stating the answer in the clue. |
| saturn-rings | Changed to a labelled Learn clue naming Saturn’s bright rings; fact says they are bits of ice and rock. | This is planet-name recall, so the direct fact is openly taught and counted as assisted. |
| mars-day | Changed to a labelled Learn clue teaching that a Mars day is called a sol; fact explains its approximate length in the same wording. | The old clue only said teams use a special word; the new clue teaches the unfamiliar term transparently. |
| sample-tube | Reworked clue to ask what container keeps samples closed and clean; fact explains clean tubes and possible future study/return. | Keeps a useful container-design inference and removes the bare named-mission phrasing. |
| solar-or-nuclear | Clue now compares sunlight near and far from the Sun; fact consistently says solar panels and explains mission planners’ location choice. | Keeps the power-source comparison while replacing unexplained “solar arrays.” |
| venus-rotation | Preserved the arrows-and-comparison clue; simplified the fact from “rotates” to “spins.” | This is a useful visual observation task; the arrows are evidence, not a spoken statement of the answer. Diagram presentation remains for the separate UI reviewer. |
| rover-obstacle | Reworked clue to ask what could show a rover rocks and open ground; fact explains pictures making a nearby-ground map to avoid rocks. | Keeps an actionable navigation inference and removes “onboard navigation,” “terrain” and “hazards.” |

## Useful scaffolds retained

- **gravity:** noticing what happens to a dropped ball remains an observation that supports an inference.
- **earth-rotation:** the globe-and-lamp model remains a concrete experiment. Diagram usability is for the independent reviewer.
- **mars-moons:** learners still count the two named moons; the task is not changed to unassisted factual recall.
- **parachute:** the falling-leaf analogy remains and now asks the learner to connect caught air with slowing down.
- **venus-rotation:** learners still compare the two directional arrows rather than hearing “opposite direction” before answering.
- Camera/rover engineering clues continue to ask what evidence or tool would help plan a safe route; they do not say the correct option.

## Validation and frozen candidate

- `node --test test/batch6Games.test.mjs`: 8/8 passed. The existing Astronaut mission test now distinguishes regular reasoning clues from explicit Learn clues, checks the teaching clue names the recalled answer, and confirms visible/speaking clue labels match. The finite-narration allowlist test includes both clue types. No separate copy-mirroring test was added.
- `npm run lint`: passed.
- Configured production build passed with the three explicit Vite build variables recorded in [candidate identity](qa-evidence/batch6-astronaut-teaching-repair-20261004/identity.json). Existing warnings remain for old `caniuse-lite` data and the shared JavaScript chunk size.
- Static local freeze: `http://127.0.0.1:5370/`; 5,610 files returned HTTP 200 and all 5,610 matched their frozen SHA-256 hashes. Full served manifest and HTTP results are referenced by the identity file. The loaded UI has not been independently reviewed yet.
- Read-only narration comparison against runtime `60f362`: 378 unique phrases before and after, with 92 unique phrases replaced in each direction. Of the 92 new phrases, all 92 have no packaged audio file. Current corpus check: 378 requested, 1 ready, 377 missing, 0 invalid. The phrase-level results and keys are in [narration-delta.json](qa-evidence/batch6-astronaut-teaching-repair-20261004/narration-delta.json). No audio files or voice manifest were changed; no provider calls were made. Text UI remains available, but audio completeness and human listening remain open.
- Existing immutable `5363` was not changed. Askia’s component, gameplay, data and rendering are untouched. No deployment or 4.5 claim is made.
