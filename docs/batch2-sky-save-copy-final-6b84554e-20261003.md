# Batch 2 Sky save and result-copy QA — 2026-10-03

## Scope and decision

This is a narrow independent UI check of Sky Shapes persistence/rewards and the final result-copy delta. It does not certify the four-game 24-run quality matrix, narration quality, or production availability.

**Decision: GO for the final candidate's Sky save/reward and result-copy delta.** No source files were changed by this QA. The final candidate was exercised locally on port 5194; this is not production evidence.

## Candidate identity and changes under review

- Root-reported source HEAD: `6b84554e7a1d21b3db658d213a2298462c78599e`.
- Local preview: `http://127.0.0.1:5194`.
- Browser-loaded JavaScript: `index-Dz1r44Ih.js`, HTTP 200, SHA-256 `59eea5e295efb45d5ff4b406047db31822a39e9b60b877b7d7121ebc78627910`.
- Browser-loaded CSS: `index-CPZQTFam.css`, HTTP 200, SHA-256 `25e3cfc13e4e40f8ceb95c3adf163e301e2f6b800c18052e2ccb9e32e475f459`.
- Root reports 149 tests, lint, and build passing.
- Root states the only changes since source candidate `773b3c3` were Puzzle Pop stale-feedback timer removal and Sky result-copy/`newMissionStars` state. Sky persistence helper behavior was unchanged.

## Final-candidate first completion and replay copy

Browser session `batch2-finalfresh` used an ordinary Amari profile selection and actual Sky Shapes controls. The session had no prior local game state. Voice and story routes were blocked before navigating; sound remained off. No progress, seed, or PRNG state was injected.

The ordinary run generated seed `3878967473`. Its first mission was Kite (`sky-diamond`). Tracing the visible SVG route through pointer input produced 100% accuracy and 3/3 stars. The visible result said:

> Your best flight rating is saved. 3 new stars added to your collection!

Storage showed `amari_points=3` and `bestMissionStars.sky-diamond=3` before using Next. The same ordinary run continued through four unique missions; on the fourth, the result separately showed `Aviator badge saved · 2 bonus stars added!` before the `Complete this sky` button. The ledger then showed all four completed missions, `completedEpisodeIds:["cloud-meadow"]`, `bestStars.cloud-meadow=3`, `unlockedEpisode=1`, and `amari_points=14` (12 flight stars plus the distinct 2-star chapter bonus).

The saved QA Amari profile was then reloaded on the final candidate without changing its storage. Its Sky 1 replay generated seed `753877812` and Mountain Peak (`sky-triangle`). After a 100% / 3-star replay, the result showed:

> Your best flight rating is saved. Try a new mission to collect more stars.

The rendered accuracy remained 100% / 3 of 3, but no new-star claim appeared. `amari_points` stayed at 14 and the best rating/episode ledger remained unchanged.

## Prior 773 candidate evidence and lineage

The earlier `773b3c3` run was completed in local browser session `batch2-local773`, with ordinary UI-generated seeds and no state injection:

| Run | Viewport | Mission | Seed | Observed result |
|---|---:|---|---:|---|
| First save, then leave before Next | 390 × 844 | Window Cloud / `sky-square` | `60885509` | 100%, 3★; ledger and global count immediately became 3; Back → Home showed 3★; reload/reselect Amari preserved it. |
| Second first-completion save, then leave before Next | 1280 × 900 | Round Sun / `sky-circle` | `3773054440` | 100%, 3★; ledger/global count became 6 before Next; leaving did not lose it. |
| Finish remaining two Sky 1 missions | 1280 × 900 | Mountain Peak / `sky-triangle`; Kite / `sky-diamond` | `1106672883` | Both 100%, 3★; chapter state completed, Sky 2 unlocked, points reached 14 including the 2-star bonus before `Complete this sky`. |
| Completed mission replay | 1280 × 900 | Kite / `sky-diamond` | `3129123147` | 100%, 3★; global points stayed 14; no additional reward. |

These checks established the helper/persistence behavior on `773b3c3`; the final candidate retained it. The original 773 UI run did not save individual screenshots at the time. To keep that lineage honest, the screenshot set below is explicitly from final source `6b84554`, with one Home screenshot captured after the 773-populated profile was reloaded on the final bundle. The 773 seeds and observed storage deltas above come from the live session transcript/localStorage reads, not from those final-bundle screenshots.

## Screenshot evidence

All screenshots are copied into `qa-evidence/batch2-sky-save-copy-6b84554e-20261003/`:

- `final-first-completion-3-new-stars-seed-3878967473.png` — first completion result copy on the fresh final-candidate profile.
- `final-saved-profile-replay-no-new-stars-seed-753877812.png` — completed replay result copy on the saved profile; no new-star claim.
- `final-fourth-flight-chapter-bonus-before-complete-seed-3878967473.png` — final flight, separate 2-star chapter bonus, and pre-navigation result state.
- `home-14-stars-after-reload-of-final-bundle.png` — Home shows 14 stars after reloading the final bundle over the QA profile populated by the prior 773 run.

## Boundary

This GO applies only to the local final-candidate Sky save/reward and result-copy delta. Production/canonical verification, the separate Puzzle Pop fix check, voice acceptance, and the broader 24-run gameplay matrix are separate gates.
