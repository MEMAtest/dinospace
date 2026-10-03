# Sky Shapes packaged narration runtime QA — 3 October 2026

## Decision

**Local runtime GO for the repaired snapshot, within the tested controls and routes below.** The preceding snapshot is **HOLD** because narration continued after confirming Back and leaving the game. The independent repaired build cancels on committed navigation, retains audio when the leave confirmation is canceled, and did not resume the canceled clip after subsequent UI gestures at either viewport.

This is local evidence only. It is not an audio intelligibility/prosody review, a production acceptance, or a 4.5/5 certification.

## Frozen identities

| Snapshot | Origin and source | JavaScript | CSS | Result |
|---|---|---|---|---|
| Before cancellation repair | `http://127.0.0.1:5195`, source `b93ebd7` plus checkpointed generated narration manifest | `index-Dmr-JKNn.js`, SHA-256 `b32ececc238e237cad75666c7006217f9650a678f2cf0fe07db316b46a459e25` | `index-CPZQTFam.css`, SHA-256 `25e3cfc13e4e40f8ceb95c3adf163e301e2f6b800c18052e2ccb9e32e475f459` | HOLD: confirmed Back did not cancel active narration |
| Repaired cancellation candidate | `http://127.0.0.1:5196`, source `70108cb` plus generated narration manifest snapshot | `index-YAjCSdc_.js`, SHA-256 `f79f3b88a7bbb16a86c9a42c04deb3b4634ff139e492176c2d0b1df110f8b8c3` | `index-CPZQTFam.css`, SHA-256 `25e3cfc13e4e40f8ceb95c3adf163e301e2f6b800c18052e2ccb9e32e475f459` | GO for this scoped local runtime delta |

The two identities are kept separate. Neither is attributed to production.

## Procedure and runtime evidence

Used fresh named Playwright sessions at desktop and 390×844. Before initial app navigation, `/api/voice` and `/api/story/**` were intercepted with local 403 responses; the repaired-build session kept those routes active for subsequent controls. Native media instrumentation recorded actual HTMLMediaElement play, playing, pause, ended, duration, and error events. Playback was never mocked and no application progress was injected. The visible SVG polyline was read only to transform its points to screen coordinates; pointer input then traced the actual rendered route.

On the pre-repair snapshot, a visible Hear mission again control started a 4.272-second packaged clip. I confirmed Back to learning world and Back to world within roughly 0.4 seconds. The app returned to Creative Lab, but the same clip continued to `currentTime=4.272` and emitted natural `ended` at `06:47:45.790Z`. This fails the required interruption behavior.

On the repaired snapshot at desktop, I repeated the confirmed-Back flow with a 4.133-second replay. It entered `playing` at `07:03:10.080Z`; confirming Back caused native `pause` at `07:03:10.979Z` with `currentTime=0` and `duration=4.133`, followed by route commit to Creative Lab. The event log shows no resumed playback between that pause and the Home → Creative Lab gestures. A later, separate replay initiated from the game UI played normally.

At both desktop and 390×844, opening the leave confirmation and selecting **Keep playing** left the game route in place and allowed the active clip to finish naturally. Confirming **Back to world** while a replay was active paused at `currentTime=0` before the clip's 4.133-second natural duration; subsequent Home → Creative Lab gestures produced no resumption.

On the repaired build, sound-off before Start blocked the mission prompt/replay/hint play calls. Turning sound back on restored actual playback. Mission replay, hint, and completion clips reached native `ended` events on both widths. The visible Next mission control advanced from Kite to Mountain Peak at desktop and from Window Cloud to Round Sun at 390px; the new mission prompt ended normally. A partial 390px pointer trace reached 12%, then the visible Restart flight control returned progress to 0% and showed the fresh-route guidance. Full visible pointer traces on both widths reached 100%; the completion line played and ended.

Packaged MP3 requests were served locally (HTTP 200, with one earlier local range response HTTP 206). The request inventory showed no `/api/voice` or `/api/story` requests, and the routes were blocked. These network and event results establish runtime delivery only.

## Provisional editor assessment

**Not accepted at 4.5; no aggregate score assigned.** This is an editorial review of retained evidence and current controls, not a rerun of the 12-mission matrix. Scores below are provisional only where evidence supports a dimension. An evidence gap is marked open rather than converted into a product-defect score. The roadmap’s five equally weighted dimensions include feedback/audio/visual usability and reliability/navigation/persistence; audio quality and full acceptance evidence remain open, so a defensible overall average cannot be reported.

| Dimension | Provisional | Evidence and concrete gap |
|---|---:|---|
| Age-6 teaching | Provisional 4.0/5 | One tracing task at a time, concrete start/finish cues, forgiving route feedback, visible hint/replay, and compound routes are supported by the retained 5290/5285 gameplay evidence and this runtime delta. A concrete improvement for 4.5 is a short, child-readable teaching explanation that demonstrates the tracing strategy and remains visible until the child starts/advances, plus an independent age-6 wording review. The current short mission prompts are not that held explanation. |
| Meaningful progression | Provisional 4.0/5 | Retained runs completed all four missions in each of three named skies, with simple outlines, compound ordered parts, saved progress, chapter unlocks, and rewards. This is substantive progression, not merely changed labels. The authored pool is exactly four missions per band. `skyMissionQueueForEpisode` filters recent missions but falls back to the episode’s full pool when fewer than `min(pool size, 2)` fresh items remain; consequently a run can select fewer than four fresh missions. Four rounds are below the roadmap’s usual 5–8 purposeful rounds, and no explicitly approved comparable-route exception is recorded. To reach 4.5, either add purposeful rounds per band or record and validate the comparable flight-route rationale, and make the later band add a distinct learning challenge (for example, a taught precision/ordered-parts objective with feedback), not only harder outlines. |
| Correctness and fair variation | **Open — not scored** | Retained baseline diagnostic exports and ordinary UI runs show numeric seeds and changed queue orders; source tests show seed stability, unique missions within each four-item queue, and avoidance of an exact full-queue repeat after a completed run. Variation is not demonstrated unfair. This QA did not retest that behavior across ordinary starts, the recent-history threshold/fallback, or restart history on the repaired bundle identity. Run the roadmap’s seeded restart/uniqueness checks on the accepted candidate before scoring this dimension. |
| Feedback/audio/visual usability | **Open — not scored** | The current desktop and 390px screens showed visible controls, responsive tracing, replay, hint, sound toggle, completion and next controls, without observed horizontal clipping. A partial mobile route plus visible Restart returned progress to zero. A concrete content improvement is an explanation of why/what shape feature to notice, retained long enough to use; current completion percentage/stars and route guidance are task feedback, not a held teaching fact. Four visible missions/band also limits content variety. Narration reached native media events, but no listener reviewed intelligibility, pronunciation, wording, prosody, joins or perceived volume; do not score audio quality from playback events. Measure all target sizes and review full-screen/page flow at both viewports before acceptance. |
| Reliability/navigation/persistence | Provisional 4.5/5 for the tested local scope only | The repaired frozen candidate passed confirmed-Back cancellation, leave-dialog Cancel retention, mute preventing starts, replay/hint, completion, next mission, and restart at desktop and 390px. The retained touch baseline separately records complete three-sky progression, persistence/reload, profile separation, and parent return on its older identity. This is a narrow local regression plus lineage evidence, not a complete same-identity reliability/persistence gate; repeat required deltas on the exact release candidate and verify the full diagnostic/event gate before acceptance. |

The editorial evidence lineage is: this report’s repaired local runtime identity `70108cb` plus generated manifest snapshot; retained all-band touch baseline `5285` / source checkpoint `48d03ec`; retained independent gameplay repair candidate `5290`; and pre-fix production baseline `d312394…` with its explicit reward-copy defect. These are separate candidates and are not pooled as a single fresh acceptance run. See [touch QA](../../batch2-sky-touch-qa-20261002.md), [independent gameplay repair QA](../../batch2-gameplay-repair-independent-qa.md), [the pre-fix production Sky gate](../../batch2-sky-monster-acceptance-20261003.md), and the [4.5/5 roadmap](../../game-quality-4.5-roadmap.md). The queue code’s actual fallback rule and its source-level tests are cited above; they support characterization of the mechanism, not a repaired-identity runtime pass. The production report’s earlier 4.0 Sky review remains historical; this report does not supersede it with a new 4.5 acceptance.

### Concrete work and gates before a 4.5 claim

- Add or formally justify a comparable-route exception for the four-mission-per-band structure; ensure mission selection provides a purposeful learning run when recent history filters the pool.
- Teach and hold a concrete tracing strategy/explanation (including how to approach ordered/compound parts) until the child can apply it; add a distinct meaningful challenge objective to later bands.
- Run seeded ordinary UI starts/restarts on the exact candidate to verify changed orders, no within-run repeats, recent-history/fallback behavior, diagnostics, and visible rewards/persistence.
- Review all narration with an independent listener for intelligibility, child-appropriate delivery, pronunciation, wording, joins, and volume; separately bind any production audio acceptance to the deployed asset identity.
- Complete the roadmap’s viewport/input and broader band/mechanic gates on one accepted release lineage. The bounded local runtime GO above does not close these editorial or production gates.

## Evidence files

- `old-build-native-media-events.json` and `fixed-build-native-media-events.json` — exact native media observations.
- `old-build-audio-requests.txt` and `fixed-build-audio-requests.txt` — local packaged audio request inventory.
- `old-build-voice-story-requests.txt` and `fixed-build-voice-story-requests.txt` — blocked endpoint/request inventory notes.
- `sky-shapes-ui-diagnostics-old-build-20261003.json` and `sky-shapes-ui-diagnostics-fixed-build-20261003.json` — unique-named exports made using Grown-ups → Game troubleshooting → Download game log.
- `old-build-desktop-flight.png`, `old-build-mobile-flight.png`, `old-build-mobile-completed.png`, `fixed-desktop-completed.png`, `fixed-mobile-next-mission.png`, and `fixed-mobile-restart-reset.png` — screenshots from the named sessions.

## Open gates

No independent listener checked intelligibility, pronunciation, wording, prosody, joins, or perceived volume. Native media events and HTTP status do not prove those qualities. No production deployment or production playback delta was tested. Full 4.5/5 evidence across every sky, mission, randomized restart, and child usability remains open.
