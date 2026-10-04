# Count the Stars canonical smoke

Date: 2026-10-04. This is a bounded live canonical-alias smoke for the promoted Count scene-variety release, not a repeat of the retained full 18-round production run.

## Runtime identity

- URL: `https://dinospace-eight.vercel.app`
- Vercel deployment: `dpl_5cKFB6U489CLoEPucaY9pDarcHsp` (READY; confirmed by release owner)
- Audited runtime source: `40c053408d47ca76ff26cc8ae5c2e8ad9bb99d70` (`1accc99`)
- The release owner verified the canonical alias resolves to that deployment and all four canonical runtime assets match the frozen candidate. The canonical URL, deployment, source, and four asset hashes are recorded in `identity.json`; candidate-specific identity is in `../production-candidate-identity.json`.

## Method and results

Reused the existing Playwright CLI session `count-prod-scatter-qa-20261004` only. The browser was already isolated for QA. Before navigating to the canonical alias, the `/api/voice` and `/api/story` guards were installed and verified as active; both guard probes returned 403. Sound was turned off through the visible control, and Amari was selected through the ordinary player picker. No storage, answer, or progress state was injected, and no voice/story provider call was made.

At 1280×800, navigated through Maths Missions → Count the Stars → Star Garden using visible controls. Round 1 showed three Moon Berries. Tapping each visible object and choosing 3 produced the correct feedback, the held explanation “There are 3 moon berries. You counted each one once.”, and a visible Next control.

Resized the same session to 390×844 and completed the remaining five Starter rounds with the rendered object buttons and the visible answer choices:

| Round | Visible scene | Count | Board arrangement |
|---|---|---:|---|
| 2 | Comet Seeds | 1 | scattered one by one |
| 3 | Rocket Lights | 4 | rows/array |
| 4 | Moon Berries | 5 | rows/array |
| 5 | Tiny Planets | 5 | scattered one by one |
| 6 | Firefly Meadow | 2 | scattered one by one |

The final correct response held the explanation “There are 2 fireflies. You counted each one once.” before Next. The Star Garden completion showed Best 3 stars and the constellation book at 1/3. Reloading the same route retained Best 3, 1/3 progress, Growing unlocked, and Galaxy locked. The post-reload snapshot confirmed those states. The visible Back to Maths Missions control returned to `#/world/maths`, where Count the Stars showed “Played 1”.

## Runtime signals and limits

- Browser console: 0 messages (no errors or warnings).
- Static requests: all 18 observed static requests returned HTTP 200, including the canonical HTML, JS, CSS, `AmariCountTheStars` chunk, and images. No broken asset was observed.
- Guarded `/api/voice` and `/api/story` probes returned 403; routes remained active. This confirms the QA guard boundary, not narration playback.
- The browser stayed muted. This smoke makes no claim about audible quality or human listening.
- Scope covers one desktop held-feedback round, the complete six-round Starter chapter continued at mobile width in the same legitimately earned profile, reload persistence, and return to Maths. It does not repeat Growing/Challenge or claim full 4.5 acceptance.

## Evidence

- `screenshots/desktop-first-round-held.png`
- `screenshots/mobile-round-two-board.png`
- `screenshots/mobile-maths-return.png`
- Playwright snapshot after reload showed the persisted Star Garden map; the final screenshot captures the subsequent Maths return.
