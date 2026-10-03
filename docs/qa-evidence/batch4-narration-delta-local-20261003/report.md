# Batch 4 packaged narration and cancellation delta — local QA

Date: 2026-10-03 (Europe/London)

## Candidate identity

Tested the immutable local candidate at `http://127.0.0.1:5235`, source SHA `fa47bf73e7d169bb1b37b6bf278718a7b088e97a`. The supplied identity file is `docs/qa-evidence/batch4-narration-identity-20261003.json`. All four served JavaScript/CSS hashes matched that identity before navigation. Source tests (198/198), ESLint, and production-config build are recorded as passed in that identity; they are not browser or listening acceptance.

A fresh Playwright profile was created. Before navigating to the app, routes returned HTTP 204 for `**/api/voice**` and `**/api/story**`. No local storage, progress, seed, or answer state was injected. No paid voice/story call was permitted or made.

## Packaged clip and playback observation

The read-only exact Batch 4 inventory contained 5,246 unique clips: 65 present and 5,181 missing. The 65 present clips all belong to the Subtraction corpus; none belongs to Addition, Time Teller, or Number Line. For the visible subtraction mission, the actual Hear question control was pressed. Its narration segments included a packaged overlap, but at least one segment was absent, so no mission audio request followed and no mission playback could be verified. The question prompt is assembled only when every segment is available. Time Teller's visible Hear hand lesson control was also pressed; it produced no Batch 4 audio request because its phrase is not packaged. The game view showed no available/playing state, and the page had no DOM audio element to inspect. A packaged audio fetch from profile onboarding was present in the network list; it was not caused by either Batch 4 Hear control.

This confirms the local clip inventory and app's all-segments availability behavior. It does **not** confirm audible Batch 4 narration, clip decoding, voice quality, or native playback. Packaged native listening remains pending until the missing clips are supplied and tested. The 65 overlaps are not sufficient for a complete game line.

## Real control and navigation delta

- Subtraction Station: started Chapter 1 through normal controls; pressed Hear question; selected the visible correct choice on the first two missions; pressed Next question. The question advanced normally. Because no game line started playing, this verifies the route/control transition only, not that Next audibly stops narration.
- Subtraction Station leave guard: pressed Back to Maths Missions, chose Keep playing, confirmed the route remained in the mission, then pressed Back and chose Back to world. The confirmation returned to Maths Missions.
- Related curriculum path: opened Explore & Languages → Curriculum Quest → Time Detectives → Practise telling the time → Start Clock Explorers. Pressed Hear hand lesson, pressed Back and chose Keep playing, then pressed Back and chose Back to world. The app returned to `#/play/worldmap/time-detectives`; reloading the same profile retained that exact module route and Time Detectives selection.
- The displayed Time Teller mission controls and clock were captured in `time-teller-mission-desktop.png`; the Time Detectives route after confirmed return and reload is captured in `time-detectives-after-return-reload.png`.

These paths exercise actual Next, Keep playing, confirmed leave, unmount, and reload behavior. Since no Batch 4 mission audio was playing, cancellation during active narration remains unverified. Source-level cancellation logic is documented separately in `docs/batch4-packaged-narration-source-gate-20261003.md`; this browser run does not elevate that source evidence to a playback claim.

## Network and console

The API guards were active for the entire guarded profile. Playwright's full request listing contained no `/api/voice` or `/api/story` request; both remained guarded at 204. The Hear controls therefore did not reach a voice or story provider. Console inspection reported 0 messages, 0 errors, and 0 warnings.

## Acceptance boundary

This is a narrow local delta for the identified 5235 candidate. The full four-game mechanics matrix and original 5221 hold are in their separate reports. This delta does not certify native listening, complete language/audio coverage, production deployment, or production behavior. Those remain separate gates.
