# Batch 6 child-copy and clue repair

Date: 4 October 2026  
Scope: Pattern Parade, Dino Hangman, Chess Explorers and Astronaut Academy in the B6 worktree. This is a bounded editorial/runtime delta, not a replacement for the retained full-gameplay matrix or independent acceptance.

## Changes

- Pattern’s question is now “What comes next?” in both the visible prompt and replay/automatic narration. Rule names remain in the successful held explanation. This prevents the prompt from naming the rule before the child answers.
- Hangman’s first chapter is now “Same word ending.” The word-family prompt says the hidden word ends in the shown letters and invites the child to look for that ending. The later chapters use plain learned-sounds wording; taught-grapheme eligibility is unchanged.
- Chess now displays and narrates the active piece’s movement rule, plus the safe-square condition in capture missions. Other piece rules are behind an optional disclosure. The one-goal prompt, mini-board limitation and board mechanics remain in place.
- Astronaut missions now have 36 separate authored clues. The question card shows the clue only after the child taps Mission clue; the source-backed fact and source remain in the correct-answer feedback card. Two clues have optional diagrams, shown with the clue: a lit/dark globe with a rotation arrow for Earth day/night, and a Venus/most-planets arrow comparison. No external globe, lamp, chart or model is required by these two clues.

## Per-mission clue review

I checked each authored clue against its question and all answer options. The text does not repeat a correct option verbatim or copy its complete fact definition. The notes record what the clue asks the child to attend to; semantic leakage still needs independent UI review.

| Mission | Authored clue | Manual review |
|---|---|---|
| sun | Think about the brightest thing we see in daytime and how it warms the ground. | Directs attention to daytime observation without naming the star. |
| moon-orbit | The Moon travels near one of these objects. Which choice is the planet where we live? | Uses the child’s home-planet idea; does not name the option. |
| mars | The nickname comes from the rusty colour of its dusty ground. Which planet in the choices fits? | Points to the observed colour without naming the planet. |
| space-suit | Astronauts have a special name for the clothing they wear outside a spacecraft. | Links the task to safety equipment without naming the item. |
| solar-power | Spacecraft need power for many systems. Look at how sunlight is collected. | Focuses on the input source; does not state the resulting form of energy. |
| rover-wheel | Compare a rover with a flying robot: which one explores the surface? | Contrasts surface travel with flight rather than stating the function verbatim. |
| moon-light | Look at where the Moon is in relation to the Sun and Earth. | Prompts a three-body relationship without stating which body makes or reflects light. |
| earth-water | Most of Earth’s surface is ocean. Think about what oceans are made of. | Connects the surface coverage to the familiar contents of an ocean; does not name the material. |
| space-robot | What information could help scientists plan a rover’s next move? | Asks the child to reason about useful information, without naming the camera’s output. |
| earth-shape | Earth from space has no corners. Which shape choice fits a world like that? | Uses a visible property rather than naming the shape. |
| rocket-fuel | At launch, watch the direction the rocket rises and the direction its exhaust travels. | Prompts comparison of two observed directions without stating the force answer. |
| air-layer | Think about the layer a spacecraft travels through before reaching space. | Names the location and asks for the science term; does not state the answer word. |
| gravity | What do you notice when a ball falls after you let it go? | Starts from a familiar observation instead of defining the force. |
| earth-rotation | Use a globe and lamp to explore which side is lit as the globe moves. | The optional visible diagram supplies the light source and lit/dark sides; the child connects the observation to the choices. |
| water-ice | Think about how water can stay frozen in cold places, including places hidden from view. | Prompts conditions and visibility, without naming either location option. |
| heat-shield | A spacecraft becomes very hot as it enters a planet’s air. What could help it survive? | Restates the hazard as a reasoning problem, without naming the protective part. |
| parachute | Watch what happens when a falling leaf spreads out and catches air. | Uses a familiar air-resistance example rather than naming spacecraft equipment. |
| antenna | Look at the rover’s communication equipment, not the parts that touch the ground. | Narrows attention to communication hardware without naming the device. |
| earth-seasons | Think about how sunlight reaches different parts of Earth during the year. | Focuses on changing illumination, without stating the tilted-axis answer. |
| mars-moons | The names are Phobos and Deimos. Count the names. | Supports the count by naming the two moons; this is an intentional factual count clue. |
| rover-camera | Before crossing a rocky patch, what information would help a rover choose a safe direction? | Frames a route-planning problem without naming a sensor or its output. |
| landing-legs | Imagine a lander touching down on rough ground. What could stop it wobbling? | Uses a stability scenario without naming the support structure. |
| planet-path | Imagine tracing a curved route around a star or planet. Which choice names that kind of route? | Describes a route shape without supplying the vocabulary answer. |
| signal-plan | Think about the long distance between Earth and Mars when a command is sent. | Directs attention to distance, without stating the signal delay. |
| venus | The choices have very different air and surface temperatures. Which one has the thickest, hottest air? | Directs comparison across the provided choices; no absent chart or picture is assumed. |
| jupiter | One choice is a giant planet, while the other two are rocky worlds. Which is the largest? | Invites comparison of planet types and size without naming the planet. |
| europa | The question is about an icy moon, not a planet. Which moon fits the description? | Narrows the category but leaves the moon identity for the child to choose. |
| parachute-design | Think about what changes when a parachute has a wider canopy. | Prompts a design inference rather than stating the resulting slowdown. |
| rover-power | Compare power sources used by spacecraft in places with little sunlight. | Focuses on operating conditions and leaves the source choice to the child. |
| signal-delay | Think about the great distance a radio message must cross between Earth and Mars. | Directs attention to distance, without stating the resulting delay. |
| saturn-rings | One of these planets is easy to recognize by the bright bands around it. | Uses a recognition cue without naming the planet. |
| mars-day | Mars teams use a special word when planning a rover’s daily schedule. | Gives a mission context for the term without supplying it. |
| sample-tube | A rover collects small pieces for scientists to study later. What could keep one safe? | Frames the sample-protection problem without naming the container. |
| solar-or-nuclear | Compare the power sources spacecraft can use when they travel close to the Sun. | Directs comparison for the stated environment without naming the source. |
| venus-rotation | Compare the arrows showing how Venus and most planets turn. | The optional visible arrow diagram supports comparison; clue text does not say “opposite.” |
| rover-obstacle | Look at the ground around a rover and decide what information a route planner needs. | Asks the child to reason about navigation information without naming the tool. |

## Verification and limits

- Focused mechanics/content tests: `node --test test/batch6Games.test.mjs` — 8 passed. Full suite: `npm test` — 187 passed, 0 failed. The full-suite output also contained Vite dependency-scan restart warnings and a WebSocket warning that port 24678 was already in use; all tests exited successfully.
- ESLint on all seven changed source/test files — passed.
- Production-config build: `npm run build:android` — succeeded. Vite emitted the existing stale Browserslist-data and large-chunk notices.
- The Astronaut test validates a distinct nonempty clue for all 36 canonical missions, rejects direct normalized option repetition, and confirms packaged-only phrase allowlisting. Chess tests cover each active-piece instruction, safe-capture wording and phrase allowlisting. Pattern tests confirm the generic question is finite and rule-name free.
- A source audit found no audio manifest or audio-file changes. The read-only full narration audit reports **378 unique phrases: 1 present, 377 missing, 0 invalid**. This differs from the assessment’s earlier 435 count because the duplicate per-mission Pattern question and standalone Chess objective phrases were removed from the finite allowlist while new clue/rule text was added. The 64 changed/new requested phrase keys are recorded in `narration-delta.json`; **0/64** have local clips. No audio was generated or played for acceptance. Human listening and independent visible-checks remain pending.
- The clues are authored copy checked against the source question/options, not evidence that every rendered line fits at both widths. Independent QA should verify both diagrams appear only after Mission clue, facts/sources appear only after a correct answer, and all clues remain useful without revealing the correct option.
