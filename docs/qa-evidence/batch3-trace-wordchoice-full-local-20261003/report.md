# Letter Trace word-choice candidate: full Challenge rehearsal

Date: 2026-10-03
Frozen candidate: `http://127.0.0.1:5231`
Source SHA: `c7c6575d956238c9b6d6797c76de253fe4e95c50`
Identity: [`batch3-word-choice-identity-20261003.json`](../batch3-word-choice-identity-20261003.json)
Scope: Full Challenge pointer rounds at both viewport sizes, ordinary Starter/Growing unlocks, choice/replay/persistence checks. Local only.

## Identity and test setup

The frozen identity records `servedAssetMatch: true`, 204/204 source tests, focused ESLint, and a production-configuration build. Six served JS/CSS hashes were independently fetched and matched that identity. Browser sessions used the frozen URL, fresh ordinary profiles, visible controls, and actual Playwright pointer gestures. Voice/story routes were blocked before each session's first app navigation; sound stayed off during gameplay. No app state, seeds, answers, storage, or hidden guide coordinates were read or injected.

Desktop viewport was 1280×800; mobile viewport was 390×844. Mobile document width stayed 390px with no horizontal overflow. The evidence is a mobile-sized browser viewport, not a physical touch-device test.

## Challenge pointer matrix

Challenge was completed 8/8 by pointer at both widths. The visible letter/word sequence was `d/DOG`, `t/TAP`, `m/MAP`, `k/KID`, `a/ANT`, `s/SAT`, `p/PIN`, and `c/CAT`. On mobile, a wrong `MAP` choice for `t` produced the different-sound feedback; selecting `TAP` then produced the success explanation, which remained visible while Next was held. Desktop same-band replay used the visible Replay chapter control and retraced both strokes of `T`; the word choices were shown after tracing and `TAP` produced the expected held success explanation. Screenshots capture the replay's stroke progress and the mobile matrix representatives in `screenshots/`.

The `d` attempt on mobile needed the visible “Show this stroke” hint after two incomplete pointer lifts, then passed both strokes. Those attempts were not unhinted mastery evidence. The recorded rejection was an incomplete lift (“Nice try. Start this stroke again at green 1”), not a rejected start; the successful run followed the visible guide. Other challenge rounds completed through the visible guide. Randomized letter/word rounds naturally exercised the repaired choice reset between consecutive rounds; each round exposed choices matching its current letter after Find the word.

## Unlocks, persistence, isolation

On the fresh mobile profile, Starter and Growing were each completed through the visible keyboard alternative solely to unlock Challenge. These are assisted unlocks and are not pointer or handwriting-mastery evidence. After Challenge, the visible map showed three chapters earned and one letter independently mastered. Reloading through the browser UI, returning through normal profile selection, and opening Letter Trace again retained the badge. Switching to the sibling Askia profile showed no Amari stars or Trace access; switching back restored Amari's saved state. On desktop, Starter and Growing had also been unlocked through ordinary UI before the pointer Challenge run; the resulting badge reported three chapters earned and zero independently mastered letters on that profile.

## Limits

This is local evidence for candidate 5231 only. It does not certify the subsequent keyboard classification/help candidate or the later visible-cursor rewind behavior. It does not establish full Starter/Growing pointer coverage on candidate 5231; earlier Starter/Growing evidence belongs to the separately identified 5215/5223 candidates. No complete packaged narration playback was verified and no provider-generated voice/story calls were made. Candidate 5231's voice inventory maps 46 of 275 entries, so audio acceptance remains pending. This report makes no production or 4.5 acceptance claim.
