# Batch 4 control repair — 3 October 2026

Frozen repair candidate `3e9c282` at http://127.0.0.1:5225. See the full SHA and served JS/CSS hashes in `qa-evidence/batch4-control-repair-identity-20261003.json`. The original `d96e5d7` candidate on 5221 remains unchanged for independent full QA.

## Confirmed independent findings and repairs

- Time Teller's actual minute controls produced 12:00 from 12:45 +15, and 1:45 from 1:00 -15. A shared elapsed-time helper now moves both hands, including twelve-hour boundaries. A property check covers all 48 quarter-hour times under ±15/±60-minute movement and inverse movement.
- Number Line's 44px ticks were only ~35px apart on the 0–20 line. The internally scrollable model now has at least 54px per value; document width still needs rendered reconfirmation. Shared A/B landings now retain both labels instead of replacing A with B. The child-controlled hop marker now includes an authored frog illustration and reduced-motion-aware left-position transition; a new mission remounts its transition. Inactive missing/comparison models no longer highlight unrelated zero as the frog position. Missing-start, missing-hops and missing-landing clues now describe the appropriate reasoning.
- Time/Number Line answer attempts include actual correct/incorrect outcome, question ID and response. A rejected hop also emits its wrong attempt. Celebration uses the actual game ID.
- Arithmetic replay now credits only a positive best-star improvement. Previously the local best increased but the global counter did not, because the callback required a first completion. Equal/lower replays continue to award zero. Time/Number Line replay feedback reports the saved best rather than claiming another earned award.
- The two time/line components were reformatted to make their control logic reviewable.

## Evidence and open gates

Full source tests: 192/192 passed on the final source. Full ESLint passed before the final rejected-hop journal delta; focused ESLint passed on that delta. Production-configuration build passed; every served JS/CSS hash matches the immutable directory. These source/build checks do not prove rendered repair acceptance.

The independent tester is assigned the changed clock controls, line labels/spacing/frog, diagnostics, replay credit and retained related lesson return at desktop and 390px. Packaged narration, intelligibility, editorial review and canonical production evidence remain open. No release or 4.5 score is claimed.
