# Independent vehicle-art UI check — 2026-10-04

## Candidate and method

- Frozen local candidate: `http://127.0.0.1:5312`, source `a59482a7a47a59bea733abc097efa02bbd0153c0`, distribution `tmp/batch7-memory-vehicles-final/dist`.
- Candidate identity: [`batch7-memory-vehicle-art-identity-20261004.json`](../batch7-memory-vehicle-art-identity-20261004.json). Its root, JS, CSS, and four new illustration hashes are recorded as matching the frozen distribution.
- Selected Amari through the visible profile chooser, then entered Thinking & Play → Memory Match. Earned access by completing Levels 1–5 through ordinary card flips and visible Next level buttons; selected Level 6 through its visible selector. No storage, progress, seed, answer, or hidden deck injection.
- The retained prior browser session was no longer addressable by the CLI, so this run restarted with a new isolated browser context and repeated the normal visible unlock path. On the replacement context, the app origin loaded before the CLI route guards could be installed; the `/api/voice` and `/api/story` 403 guards were active before gameplay and all subsequent route changes. The complete request log contains no request to either API. Sound was turned off. This timing is a test-harness limitation, not a claim that the guards preceded the initial page load.

## Observed results

- Level 6, “All Kinds of Vehicles”: 28 cards / 14 pairs. Completed by flipping real cards and reading only their visible face-up labels after each flip. The four illustrated pairs were **Aeroplane**, **Helicopter**, **Steam Train**, and **Passenger Train**; each label matched its distinct visible silhouette. All four image files loaded successfully (native 512×512; train sources preserve their wider/taller source dimensions as recorded in the served identity). The completed mobile board shows all 28 cards matched and the visible Next level control.
- At 1280×800, the selected face-down board had 28 face-down cards, zero card-front images, ten 48×48 level controls, and document scroll width 1280. At 390×844, it had 28 face-down cards, zero card-front images, 82×82 cards, ten 53.5×48 level controls, and scroll width 390. No horizontal overflow or overlay was observed.
- Reload after mobile completion retained the Amari profile and unlocked level access. The app returned to a saved/replayed board (“Yummy Feast”) with its cards face down; selecting Level 6 again through its visible control worked. This confirms profile/progression persistence, not preservation of an in-progress board or the selected level across reload.
- Console inspection: zero errors and zero warnings. The request log shows HTTP 200 for all four new illustration URLs. It also shows local `/audio/en/*.mp3` requests while the app ran; sound remained off and no external voice/story API request was observed. API guards were active for gameplay and the subsequent interaction period.

## Evidence

- `vehicles-level6-desktop-facedown.png` and `vehicles-level6-desktop-facedown-repeat.png`
- `vehicles-level6-mobile-facedown.png`
- `vehicles-level6-desktop-completed.png` and `vehicles-level6-desktop-completed-recheck.png`
- `vehicles-level6-mobile-completed.png`

## Scope and remaining gates

This is independent local browser evidence for the four vehicle illustrations and face-down/layout behavior on the frozen candidate. It is not production, full premium-art, full Memory curriculum, audio/listening, human, device, or Batch 4.5 acceptance. Other Memory art gaps and human listening review remain separate gates.
