# Batch 3 configured-preview independent browser QA

Date: 2026-10-03
Candidate: [configured preview](https://dinospace-gozbhps8b-memas-projects-23a0001d.vercel.app)
Deployment: `dpl_BYkiU9xkKqGRtdDc79c9BSRyyhDW`
Source: `a6e1e675411a9a6d48b3f8e99fdbd5ad44ea44f4`
Identity: [`batch3-configured-preview-identity-20261003.json`](../batch3-configured-preview-identity-20261003.json)

## Scope and method

This is an independent regression check of the configured preview's four Batch 3 games, not full roadmap acceptance. I used fresh isolated Playwright profiles at desktop 1280×800 and mobile 390×844. Before each profile's first app navigation, `/api/voice` and `/api/story` were guarded with 204 responses. Both guards remained active; network evidence showed no provider or story requests. Gameplay used visible controls and ordinary chapter entry. I did not seed or inspect progress, read hidden answers, or inject application state.

The identity file's seven listed served asset hashes match the expected values. This establishes which static candidate was served; it does not by itself establish gameplay acceptance. Screenshots and accessibility snapshots in this folder provide representative visible-state evidence.

## Game coverage

| Game | Desktop, 1280×800 | Mobile, 390×844 |
|---|---|---|
| Count the Stars | Entered Starter / Star Garden through the home practice control. Counted visible objects, submitted a wrong choice, viewed clue, submitted the visible correct count, verified explanatory success stayed held until Next, then checked Back and reload behavior. | Independently entered Starter / Star Garden. Counted five visible fireflies, submitted wrong then correct choice, verified held explanation, used Next to reach a different round. |
| Letter Trace | Entered Read & Write → Letter Trace → chapter 1. Heard the tracing instruction, enabled keyboard mode, moved with arrow keys, and opened Back/Keep playing/return flow. No full desktop letter was completed. | Entered chapter 1 and traced all three visible strokes of I using pointer movement, verified progress to 100%, checked shape, and confirmed success held until Next. Heard the native instruction and verified cancellation on confirmed exit. |
| Cosmic Tic-Tac-Toe | Entered Thinking & Play, used Show hint, selected its visible target, and verified held success explanation, Next tactic, and leave/map/world return. | Used hint and visible grid cells; verified success is held and Next advances. On a later board, tested a wrong move, retry, hinted target, second held success, Keep playing and confirmed leave; solved count remained visible on the chapter map. |
| Dino Detective | Entered Explore & Languages → Dino Detective → Starter / Jungle Jive. Used the visible clue, searched covers, observed the revealed T-Rex/world facts and Next find. | Tested wrong cover feedback, clue target and correct visible cover, then verified both facts and Next find. Checked Keep playing, confirmed Back to world and reload. |

Screenshots include mobile Letter Trace hint, both desktop and mobile Dino Detective held facts, and mobile Cosmic chapter progress. Snapshots capture Count wrong/success, Letter Trace success, Cosmic wrong/retry and success, and Dino clue/fact states.

## Navigation, persistence, diagnostics, and layout

For Count the Stars, Letter Trace, and Dino Detective, reloading an active run returned to that game's appropriate world or chapter selection rather than preserving the in-progress round. Cosmic showed its solved tactic count on the chapter map after leaving; reload preserved the parent world route. On all observed games, the visible Back flow offered Keep playing and a separate confirmed exit; Keep playing retained the current run. Returning to the world landed in the expected parent area. These checks do not constitute a complete sibling-profile isolation or replay-reward audit.

Mobile document width was 390px on the inspected Dino Detective and Cosmic views; Dino Detective covers measured 56×56px and its header/action controls were at least 48px high. Cosmic chapter controls were at least 48px. This was a targeted layout check, not a complete target-size/overflow audit for every control in every game.

The Count the Stars one-object instruction rendered “How many planet did you count?” This is a small singular/plural copy defect; it did not block counting or feedback. No other blocking functional defect was reproduced in the bounded interactions above.

## Native audio and browser health

Real same-origin packaged audio was exercised in all four games. I observed real media `play`, `playing`, `timeupdate`, and `pause` events while the original browser media playback methods remained in use. A browser-side observer recorded events only; it did not replace playback or synthesize audio. On mobile, confirmed exit paused Letter Trace, Count the Stars, Cosmic hint, and Dino clue playback; observed examples and limitations are in [`native-audio-observations.json`](native-audio-observations.json). Network requests were for same-origin packaged media; no voice/story provider requests occurred. Playback events and time advancement establish browser playback, not subjective speech quality or complete narration coverage.

Desktop and mobile sessions ended with zero console errors and zero warnings. There were no unexpected failed application asset requests in the observed flows.

## Result and limits

No blocking defect was reproduced in the tested visible-control interactions. This is a bounded configured-preview regression pass, not full Batch 3 acceptance or production acceptance. It does not cover all randomized runs, all three chapters × six missions for every game, full cross-game replay/star accounting, complete sibling isolation, all mobile touch targets, every cancellation path at both widths, or human listening review. Letter Trace's desktop run did not complete a letter. Packaged playback coverage and remaining narration gates must be assessed separately.
