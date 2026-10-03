# Batch 2 narrow production gap checks — 2026-10-03

## Scope and release identity

Independent UI checks against the canonical alias `https://dinospace-eight.vercel.app` on the reported READY deployment `dpl_DGLGVkaMikT5GPntS6YThDsesHyx`, source `6b84554e7a1d21b3db658d213a2298462c78599e`. Rendered assets were reported as JS `index-akZ21SWl.js` SHA-256 `3ebd53465f2f2a6994163ce420c3d04e7e4f578544518f9bde4f7b6e2f8fb2b0` and CSS `index-CPZQTFam.css` SHA-256 `25e3cfc13e4e40f8ceb95c3adf163e301e2f6b800c18052e2ccb9e32e475f459`.

No source files, progress seeds, generated answer data, story text, or browser storage were injected. All scenario navigation and answers used visible UI controls. The named Playwright session started with a fresh browser context at `about:blank`; the app selected Amari through its normal UI. Sound was turned off before gameplay. Voice and story endpoint routes were installed before the first navigation and then broadened to cover the bare endpoints and slash paths. Their route inventory is retained in `route-guards.txt`. No voice/story requests or provider calls appeared in the actual request inventory; it contains only 22 static icon/image GETs. The browser console recorded zero errors or warnings. No audio quality claim is made.

The retained old baseline remains under its original pre-fix deployment identity. This report adds only these narrow 6b observations and does not assign an overall score or acceptance claim.

## Results

| Check | Observation | Status |
|---|---|---|
| Sky Shapes desktop Cloud Meadow ordinary run → ordinary replay, same 1280×800 viewport | UI-exported seeds: `530929301` then `676917448`. Completed order: Mountain Peak → Round Sun → Kite → Window Cloud. Ordinary replay began Mountain Peak → Window Cloud; the second flight differs. The replay was stopped after this visible order difference. | Pass for scoped replay order check |
| Sky Shapes Growing restart, 390×844 | Growing flight seed `3145107418`. Visible progress reached 14%; pressing `Restart flight` returned progress to 0% and showed “Start at the green dot and trace the route again.” | Pass |
| Monster episode availability labels | Episode 1 was enabled and startable from a fresh profile; unearned reward copy read “not earned yet”, while disabled episodes read “locked”. After Episode 1 completion, Episode 2 became enabled and was not labelled locked. After Episode 2 completion, Challenge became enabled and was not labelled locked. Navigation and unlocks used six ordinary UI answers per episode. | Pass |
| Monster clue → correct-answer feedback | On a current 6b Growing replay, the visible question “20 take away 15?” showed its clue, accepted visible answer 5, and remained on Question 1/6 until “Next question” was chosen. The screen contained one model explanation and one feedback explanation with distinct wording. | Pass for this subtractive clue case |
| Monster duplicate explanation regression | On the same release, Growing question `2 + 10 = 12` displayed the identical sentence “2 counters and 10 more make 12 counters.” in both the model card and feedback panel after the correct answer. The episode remains on the question until Next, but the single-explanation requirement fails. | **Fail** |
| Monster Story subtraction pre-answer model, desktop and mobile | The same ordinary UI run (`1680336622`) showed `10 − 5` at 1280×800 and 390×844. Before answering, both widths showed the full visible range 3–12, a start marker at 10, and the instruction to jump back 5 steps; landing 5 was inside the range. The app deliberately withholds solved hops and a landing marker until after the answer, so this state does not reveal the answer. No truncation or horizontal overflow was visible. The earlier interpretation that absence of pre-answer solved hops was a failure is withdrawn. | Pass for bounded pre-answer range/start/direction check; post-answer route rendering was outside this bounded sample |
| 390px rendered button targets and overflow | Captured viewport-visible button bounds in Sky Growing play/restart and leave states, and Monster episode map, clue, answer-feedback, and leave states. The recorded buttons include navigation, sound, mission replay, hint, restart, episode selection, answer choices, clue, next, and leave controls. All measured viewport-visible controls were at least 48×48 CSS px. Each sample reported document/body width 390px. | Pass for sampled control classes and states |

## Evidence and diagnostics

- `final-ui-export-20261003.json` is the final Grown-ups → Game troubleshooting → Download game log export, captured by awaiting that browser download event and saving it directly to this unique path. SHA-256 `cbb9879b209ad48198b707c31a0e1d11481e067159c924414546b25989f321ee`. It contains 75 events / 16 milestones and only the `jet` and `math` game identifiers. Relevant milestones include Sky Starter seed `530929301`, replay seed `676917448`, Sky Growing seed `3145107418`, Monster Starter seed `1711639905`, Monster Growing seed `4046520257`, Monster Story seed `1680336622`, and Growing replay seed `375798546`.
- `sky-monster-current6b-ui-export.json` is an earlier unique-path UI export from this same session, captured with the same download-event/saveAs method. It confirms the replay markers before the Growing restart and subsequent scenario work.
- `ui-snapshots/monster-growing-duplicate-explanation-2plus10.yml` preserves the duplicated 2+10 feedback text. The clue, feedback, Sky restart, and replay states have corresponding accessibility snapshots.
- `screenshots/` contains the captured Sky replay state, Growing partial/restart states, Monster episode map, clue/feedback state, and Story subtraction pre-answer model at both widths.
- The six `*-bounds.json` files contain viewport-visible button rectangles, viewport size, and document/body widths for each sampled state. Every stored bound is in CSS pixels.
- `network-inventory.txt`, `route-guards.txt`, and `console.txt` preserve the session request/route/console observations. The earlier ambiguous `.playwright-cli/amari-game-diagnostics.json` default-name artifact was a concurrent Spot-session collision and is excluded from this evidence set.

## Remaining release gate

The Monster duplicate explanation is a concrete current-6b defect. Do not replace or rewrite that failure as a pass based on the clue wording being unique in a different question. The 6b run is independent production evidence; any later local repair candidate needs its own separate retest and must retain this failure under the 6b identity.
