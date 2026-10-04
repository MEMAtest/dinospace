# Independent QA: Count the Stars single framed solar panel

**Result:** the repaired `Satellite Panels` counting object is visually consistent with one object at desktop and mobile, and its visible tap, answer, held-feedback, Next, and parent-exit controls worked in the bounded ordinary-UI run. This is a narrow local candidate check, not full game or release acceptance.

## Candidate and setup

- Frozen source: `e067e3d389ad2f1ec1a8583535c07edd4b83268e` (base `0d3ef056e569e3ef59763df388f26c3baa7783b8`), origin `http://127.0.0.1:5387/`.
- Candidate identity: `docs/qa-evidence/count-single-panel-art-20261004/identity.json`. Its `index.html`, primary JS, primary CSS, component, and data hashes are source/served-bound; the identity records matching HTTP/local hashes for the three served entry assets. This report does not imply every asset was independently enumerated.
- Started a fresh Playwright profile at `about:blank`. Installed `/api/voice` and `/api/story` routes returning 403 before the first app navigation; verified both guards remained active after navigation. Muted using the visible sound control. No provider/story request was allowed, no progress or answer state was seeded, and all unlocks were earned through the visible UI.
- Browser console reported 0 errors and 0 warnings. Request inspection showed only the two guarded API routes (403); the app's static assets loaded. No broken-asset finding was observed in the inspected screens.

## Ordinary unlock path and observed run

At desktop 1280×800, completed the six Starter rounds and six Growing rounds through visible object taps and matching visible answer choices. Both completed bands displayed 3-star bests. Started one ordinary six-round Galaxy Survey run; no rerolling or seed manipulation was used.

The first two Galaxy questions were `Constellation Maps` (19 visible tappable objects) and `Nebula Dots` (11). `Satellite Panels` appeared naturally at round 3/6. The desktop pre-answer screenshot shows one small, square, blue framed panel with an internal grid centered in the board. Resized the same in-progress question to 390×844; the mobile screenshot likewise shows a single framed panel with internal cells and no separate panel wing or satellite body in the count board. The SVG source confirms a single outer rectangle plus a 3×3 internal grid. My earlier informal note calling these “four cells” was incorrect; the evidence and final wording use “one framed panel with internal cells.”

On mobile, tapped the one visible panel once, selected the visible answer `1`, and received held feedback: “There is 1 solar panel. You counted each one once.” The explicit `Next` remained available. Tested `Back to Maths Missions`; the “Leave the game?” guard offered `Keep playing` and `Back to world`. `Keep playing` preserved the held question, and `Next` advanced to `Crater Gems`.

Finished this single run through visible taps and answer options: Crater Gems 4, Nebula Dots 20, Satellite Panels 12. The final held feedback stated “There are 12 solar panels. You counted each one once.” Explicit Next completed the survey; Galaxy Survey showed `Best: 3 stars`. The survey map and both return paths showed earned 3-star entries for Star Garden, Constellation Workshop, and Galaxy Survey. Returned to the Maths Missions world at mobile and at desktop. The played Count the Stars card remained marked `Played 3` at both sizes.

## Rendered object assessment

The changed count-board motif passes this bounded check: one framed panel is exposed as one tappable object, with the internal cell grid contained within that frame. At 390px it remained visible and distinguishable without clipping or overlapping other count objects; the board contained no second panel wing/body that might be counted as another object. The desktop screenshot shows the same centered motif at 1280px.

A tiny satellite emoji remains in the question header on both screenshots and depicts a satellite with two small wings. It is outside the count board and outside the tappable object group; the accessible count button names only the single solar panel. I did not find it counted or announced as another board object. It is worth keeping visually distinct from the framed count target in any later illustration review.

## Evidence

Screenshots are saved under `docs/qa-evidence/count-single-panel-independent-20261004/screenshots/`:

- `challenge-satellite-panels-desktop-before-count.png` — 1280×800, round 3/6 before answering (SHA-256 `7e344ce5a5c557ea80c60b6a3f940fa19c3446bfc42a2f38df3b9f5334799e6b`).
- `challenge-satellite-panels-mobile-before-count.png` — 390×844, same visible question after viewport resize (SHA-256 `11e59c7de0d2b308c778ea9917b347366e05b71c9c268d02a7ee0a44c053e76e`).
- `challenge-satellite-panels-mobile-held-correct.png` — held correct feedback and Next (SHA-256 `f82442ab65f5cdd567a3806bfbf5d8e3c87ea45b56f8f0388dfb6c243bd5854d`).
- `maths-world-mobile-earned-stars.png` and `maths-world-desktop-earned-stars.png` — Maths Missions return with Count the Stars marked `Played 3` (SHA-256s `170534e6f7ee1d5d7fcf67875789bef15893825fc0f86bf434d1beab5fb6663a` and `616bb29711be510d8542354aef0c5283bb393633c008c7fe9b935f54d9f65a35`).

## Limits

This check covers one naturally encountered Challenge run and one occurrence of the repaired target at both viewports; it is not an all-round × all-viewport matrix, human listening review, audio-quality result, full-asset audit, production check, or overall 4.5 acceptance. The run's 3-star reward and played shelf entry were observed; sibling isolation and reload persistence were not part of this narrow visual repair check. Packaged/native narration was not evaluated audibly, and provider routes were deliberately blocked.
