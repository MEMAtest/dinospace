# Spelling Studio pool-copy candidate — independent UI check

**Date:** 4 October 2026  
**Frozen candidate:** `http://127.0.0.1:5362/`  
**Source:** `d7c66992cba8cdfa78a985b26e8aa561b1ec33cf`  
**Identity:** [`identity.json`](../batch5-spelling-pool-copy-20261004/identity.json)

## Guarded ordinary-UI run

Created a fresh Playwright CLI session at `about:blank`. Before the first app navigation, installed 403 route guards for `**/api/voice` and `**/api/story`; verified both were active, then navigated to the frozen candidate. Selected Amari and muted sound with the visible **Turn sound off** action. The guards remained active through game play, settings navigation and the final check. The browser showed no console messages, errors or warnings. Its request summary contained 20 static requests and no provider/story call. No paid service, hidden answers, stored-state edits, seeded progress, or production data were used.

Used 1280×800 for the first Chapter 1 check and 390×844 for subsequent ordinary UI progression. The browser profile contained only progress earned in this run. The candidate identity report records its source and full served-file hash audit (5,610 files, all HTTP 200, no mismatch); this independent check did not repeat that full static hash sweep.

## Pool copy and visible word tasks

At desktop, Spelling Studio showed the revised instruction: “Use the sounds you have learned to build each word. Each chapter has six words. Your finished word stays here until you tap Next.” Chapter 1 showed “This chapter has 36 words you can make with your learned sounds. It needs at least 20.” The visible Start control launched the band.

Chapter 1 Word 1 rendered a picture clue (“A father”) and the completed-model word `dad` before tile selection. This is expected in the route’s Copy stage; it is not reported as answer leakage. Tapping visible wrong tile `n` showed “Not quite. Say the word slowly and listen again.” Selecting visible tiles `d-a-d` produced the held “Well done. You built the word” feedback, `DAD has 3 sounds`, the `/d/ /a/ /d/` sequence, and a visible Next word button. Next advanced to Word 2 with a fresh tile set. At mobile, the visible Chapter 1 prompts were completed using their displayed word models and actual tiles until the six-word chapter badge was earned.

After the normal Chapter 1 unlock, the first Chapter 2 selection showed `0 words you can make with your learned sounds` and “It needs at least 20” while the visible Grown-ups settings showed Phase 2 selected and its sounds pressed. I then used the Grown-ups settings UI to select Phase 3, returned to the home/world through visible Back controls, and re-entered Spelling Studio. Chapter 2 then showed 31 eligible words. This check did not determine whether the earlier zero count was a stale eligibility calculation or an intended consequence of the selected phonics setting; retain it for source-owner review rather than attributing it to this display-copy change.

With the 31-word Chapter 2 pool, Start opened “More Phase 2 sounds,” whose instruction said one sound was missing. The mobile prompt showed a duck picture, “A bird that swims,” `• u ck`, and four visible grapheme choices; it did **not** show the completed word. Wrong choice `p` produced the same gentle retry feedback. Correct `d` held the completed `d u ck` display, “DUCK has 3 sounds,” `/d/ /u/ /ck/`, and Next word. Next reset to a new incomplete word (`m e •`) with no completed target visible. This confirms the intended missing-sound behavior for the observed Chapter 2 question, not the whole chapter pool.

The attempted Back action displayed “Leave the game?” at both widths. **Keep playing** dismissed the dialog and left the current word intact. Desktop evidence covers Chapter 1’s held correct word; mobile evidence covers Chapter 2’s held correct word and subsequent Next reset.

## Evidence

- [Desktop Chapter 1 held `DAD` result](screenshots/desktop-ch1-dad-complete.png)
- [Mobile Chapter 2 held `DUCK` result](screenshots/mobile-ch2-duck-complete.png)
- [Mobile next incomplete Chapter 2 word](screenshots/mobile-ch2-next-word-start.png)

The desktop/mobile copy and feedback checks are a bounded candidate delta. The original implementation plan and prior full matrices remain the authority for unchanged gameplay scope. This report makes no full-game, audio, human-listening, release, production, or 4.5 acceptance claim. Sound was muted throughout; “listen again” is rendered text only and no audible behavior is certified. The pool display copy does not alter the 659-phrase source corpus; the candidate inventory remains 11 packaged and 648 missing phrases, with all 37 pure phoneme clips still missing.

