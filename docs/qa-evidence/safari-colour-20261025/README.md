# Sound Safari and Colour Mixing Lab — 25 October 2026

## Status

**Released and functionally accepted for this two-game scope.** The one public site is **https://dinospace.netlify.app**. Monitoring automation `amari-shadow-match-production-health` was deleted at the user's request and was not recreated.

- Runtime source: `5e69c2c3f8d56e17424ffe6dc1049b476d3aaec4`.
- Immutable backend: `dpl_C2QV4SPZvED5AtXMDWm5MJe22ZTi`, `https://dinospace-c85xitlmy-memas-projects-23a0001d.vercel.app`.
- Published Netlify gateway: `6ade32f95c7d7bd2b8aeb2ba`; worker **v35**.
- Actual loaded module in all four final public reports: `/assets/arcade-Cq6KRfD2.js`.

Netlify keeps its origin and existing records. The old Vercel public root/index remain redirect-only entry links. Historical editorial scores/counts are unchanged: this is targeted functional acceptance, not a new whole-catalogue score or historical story recovery.

## Acceptance and delivery

| Area | Delivered and verified |
| --- | --- |
| Sound Safari teaching | Three chapters of six distinct challenges: initial-sound listening, oral blending, and segmentation. Seventeen decodable words use the six supported sounds; INSECT is listening-only for short i. Taught-sound filtering prevents unsupported practice. Blending starts with numbered sound buttons, so printed target spelling does not reveal the answer. Earlier sound tiles can be replayed. |
| Sound Safari feedback | Wrong answers keep the same challenge available. One-use clues, held and replayable sound/word explanation, and a focused solved screen. Missing/muted audio or clues mark assistance; independent listening also requires actual target playback, not simply the presence of a file. Audio stops on mute, leaving or unmount. |
| Colour Mixing Lab teaching | Three six-mission labs: measure and mix primary paint recipes, compare lighter/darker blends with white/black, then choose and measure a recipe to match a picture target. Visible, countable scoops, explicit paint names, consistent simplified pigment model, proportions and object application. Wrong transfer recipes show their own actual blend and can be emptied/retried. |
| Colour Mixing Lab task model | Mix and observe, then name or compare the result. The actual blend is intentionally visible; its answer name is hidden until solved. Colour Makers explicitly presents a transfer target. Both prompts and the independent source review confirm this teaching model. Real pigments can vary; implementation detail is collapsed beneath the activity. |
| Progress and rewards | Final answers save chapter records before Finish. First public phone runs naturally earned all three chapters in each game from zero. Sound Safari committed six scaled stars (52 to58); the Colour game committed its eighteen first-time mission awards. Desktop replay retained earned records without duplicating awards. Per-child keys, prerequisites, schema validation and save-error retry are covered by source tests. New collections are read-only views of saved chapters. |
| Navigation and layout | Clear chapter start/finish/next, exact Read & Write / Creative Lab parent returns, collection navigation and reload retention. Visible main controls at least48px, no page overflow or broken images at390×900 and1440×900. Final renders were visually reviewed. |

## Audio approval and provenance

The user separately approved up to100 fixed narration requests and a six-clip British phoneme trial, with **no automatic retries**. Exactly **64 narration requests and6phoneme trial requests** were made; nine exact existing recordings were reused. No further phonemes were generated. The older56spelling approval was not reused.

On25October the user listened to the ordered six-sound track (s, short a, t, p, short i, n) and confirmed **“All six sound correct”**. This session cannot listen to audio; that articulation acceptance is explicitly the human user's review. Technical playback and decoding are recorded separately.

All **79 required packaged files** decode with positive duration and retained SHA256 hashes (`packaged-audio.json`). Provider ledgers record each request before submission, response metadata, file bytes and hash. Actual clips are canonical in `public/audio`; the six individual trial copies were removed after preserving hashes and the unique review track. No provider requests occurred during browser QA.

The unpublished audio-job deployment `dpl_EWCFnHqb8U9px2MXANLvEDzC32pN` used existing server credentials for a strictly fixed six-sound synthesis mode. No raw secret was exported. The temporary handler is retained as audit source and is not part of the final runtime. That deployment was safely removed after the final release replaced its alias.

## Evidence

| Gate | Result |
| --- | --- |
| Source | **391/391 tests passed**, zero failures/skips; scoped ESLint, production-configured Vite build and diff checks passed. Unit coverage includes seeded variety, taught/supported sounds, segment order, child isolation, schema and failed-storage handling, reward idempotency, progression ownership and physical audio coverage. `source-gates.json`. |
| Local and compiled build | Both games'18missions at both phone/desktop widths; final compiled phone counterparts also passed. Build reports use the same emitted module as production. Earlier partial/gated checks are clearly scoped in their JSON records. |
| Public production | **72 challenges**: all18missions per game at390 and1440. Every chapter, wrong retry, clues, measuring/emptying recipes, keyboard activation, held explanation/replay, packaged playback, natural unlocking and exact parent navigation passed. Four `production-*.json` reports. |
| Saved records | First public runs earned new records; replay retained them. Final records survived reload, Sound Safari's shelf showed3/3 and remained unchanged on visiting/reloading. Local and public Colour records retained all18recipes/three chapters. |
| Media and errors | Every phoneme started and advanced during actual controls; full explanation sequences completed in each chapter. Colour explanations replayed to completion in each lab. Page/console errors, failed media and provider requests: **zero**. |
| Deployment | Full Vercel API confirmed READY, exact `runtimeSource` and `gitCommitSha`; Netlify API confirmed the published deploy and legacy Git builds stopped. Immutable, gateway candidate and public entry/worker/stylesheet/module bytes match the local build. All79audio hashes match both candidate and public Netlify responses. Voice/story OPTIONS preflights and legacy307s pass. |

`failure-observations.json` retains the corrected shelf selector, worker-version assertion and CLI metadata-summary mismatch. An old-pin unpublished gateway draft was superseded before publication. No saved records were reset. The final Safari solved-screen simplification was built and rehearsed again before the final public checks.

## Resources and recovery

Reused the canonical checkout, compatible installed dependencies and one persistent headless Chromium session/tab/profile. **No new worktrees, clones, dependency installs or browser sessions.** Added about **3.02MiB** of canonical recordings and retained about **0.7MiB** of compact QA evidence, including two before and four final renders. Seven redundant task screenshots, six duplicate trial clips and the task-owned placeholder environment file were removed. Unrelated untracked/ignored evidence was preserved.

The existing build was rebuilt in place (about413MiB). Task development and preview servers were stopped; browser ownership was released and its single headless session remains running. The persistent QA profile is retained at about495MiB, above its256MiB maintenance threshold after the rehearsals. This is flagged for separate cache-growth review: no saved state, profile locks or browser data were cleared and no replacement profile was created. Disk remains about51GiB free.

`cleanup-manifest.json` records exact sizes/removals and the prior stable immutable backend/gateway for rollback. Always pin an immutable backend, never the redirecting legacy public alias; do not clear saved data during rollback. Monitoring remains off.
