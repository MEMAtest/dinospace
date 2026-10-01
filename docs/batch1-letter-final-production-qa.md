# Letter Launch final production QA

Date: 1 October 2026  
Canonical: `https://dinospace-eight.vercel.app`  
Release identity: SHA `86e3ecf08d658591c51dc1e394ba7ff32e53fbb1`, deployment `dpl_2azaKnhES6wXXjwPsHxhmwsnu9iQ`; JavaScript `assets/index-Bjt4H7n4.js`, CSS `assets/index-BjKMFMwR.css`.  
Browser: isolated Playwright session `luna_letter_final_prod`; profile records were created only in this isolated browser. All play, answer, retry, replay, and navigation actions used the rendered UI.

## Completed runs

I completed three desktop runs at 1280×800 and four mobile runs at 390×844. That exceeds the shared minimum of three runs per viewport; the extra mobile completion is recorded rather than treated as a requirement to repeat every chapter three times.

| Run | Viewport | Chapter and visible target order | Result |
|---|---:|---|---|
| D1 | 1280×800 | Hear the letter (6): Kite, Insect, Net, Apple, Dog, Top | 3/6 right first time. Wrong choices on Kite, Net, and Apple led to a usable retry clue; the child corrected each and saw the initial-sound explanation. |
| D2 | 1280×800 | Find the first sound (6): CAT, SAT, KID, MAP, TIN, TAP | 6/6 first time; replayed clue audio and saw the correct initial-sound explanation. |
| D3 | 1280×800 | Match big and little letters (7): o→O, k→K, g→G, a→A, c→C, t→T, p→P | 7/7 first time; matching feedback and chapter completion appeared. |
| M1 | 390×844 | Blend the sounds (8): DOG, TAP, TIN, CAT, MAP, SAT, PAT, PIN | 8/8 first time. Built DOG and TAP sound-by-sound; replayed clue and “Hear next sound”; explanations surfaced phonemes and the blended word. |
| M2 | 390×844 | Blend replay (8): KID, DOG, TAP, TIN, CAT, MAP, SAT, PAT | 8/8; order differed from the preceding run and all eight targets were unique within this run. |
| M3 | 390×844 | Blend replay (8): PIN, KID, DOG, TAP, TIN, CAT, MAP, SAT | 8/8; changed order, eight unique targets. |
| M4 | 390×844 | Blend replay (8): PAT, PIN, KID, DOG, TAP, TIN, CAT, MAP | 8/8; changed order, eight unique targets. |

Every stage ended at its finite round count and exposed a completion/review screen. New/replayed runs remained within the selected chapter; correctness history did not change the current run length. The progression changed the skill in each chapter: sound identification, initial-sound selection, case matching, then phoneme blending.

## Feedback, rewards, and replay

Wrong answers in D1 did not advance the question. Retry text directed attention back to the pictured word or first sound. Correcting the choice gave a short explanation, such as “Kite starts with the k sound.” The CVC screen kept the phoneme tiles and explanation visible with an explicit advance control. Replay orders changed across the four CVC completions; each CVC run contained eight distinct targets.

The four chapter completions awarded Sound Scout, First Sound Finder, Letter Match Maker, and CVC Word Builder. The final CVC completion showed the fourth award; Amari’s sticker page showed 4/4. After a full page reload and selecting Amari again, home showed 91 stars and Sticker Shelf still showed 4/4. Switching through the visible profile picker to Askia showed 0 stars and a separate sticker page containing no Letter chapter collection. This confirms profile separation for the tested records.

Diagnostics in the isolated browser were read after real UI gameplay. Seven starts had seven different per-run seeds, each round’s question/correctness events retained that run’s seed, and logs contained start, question, answer-attempt, answer-correct, level-complete, replay, and leave events. Counts: 7 starts, 51 questions, 3 wrong attempts, 51 correct answers, 7 completions, and 6 replay/navigation events. (The replay counter includes next-chapter transitions.) The event payloads used game/round/seed/event metadata; target order above is recorded separately from visible UI. This is browser-local instrumentation evidence; the seed is not displayed to a player.

## Responsive, navigation, and delivery checks

At 390×844 and 1280×800, document width equaled viewport width. The Sticker screen’s visible interactive home control measured 64×64 at both sizes. During CVC gameplay, visible Back/Replay/Next/World controls were all at least 48×48; completion screenshots show the controls within the viewport. The game returned to Read & Write and home via visible parent navigation. Audio clue replay worked. Requests for the exact release JS/CSS and requested English audio returned HTTP 200; range audio responses were HTTP 206. Browser console: zero errors and zero warnings.

Screenshots from this session include:

- Desktop run start: [page-2026-10-01T01-31-26-932Z.png](../.playwright-cli/page-2026-10-01T01-31-26-932Z.png)
- Desktop teaching/feedback: [page-2026-10-01T01-32-17-287Z.png](../.playwright-cli/page-2026-10-01T01-32-17-287Z.png)
- Mobile CVC start: [page-2026-10-01T01-37-39-376Z.png](../.playwright-cli/page-2026-10-01T01-37-39-376Z.png)
- Mobile CVC phoneme feedback: [page-2026-10-01T01-41-36-262Z.png](../.playwright-cli/page-2026-10-01T01-41-36-262Z.png)
- Mobile CVC completion: [page-2026-10-01T01-52-44-794Z.png](../.playwright-cli/page-2026-10-01T01-52-44-794Z.png)

## Editorial findings and remaining 4.5 evidence

The canonical production run satisfies the run-count gate, exercising all four chapters across seven completed runs (the minimum is six), and supplies release-identity evidence for seeded runs, wrong/right feedback, audio, finite progression, badges, replay, persistence, profile isolation, mobile geometry, and clean asset/console checks. I rate Letter Launch **4/5**, not 4.5: answer/distractor position balance and generator-wide untaught-target validation still need direct evidence, and I did not observe a distinct rocket launch animation. The mobile opening art is a static launchpad with sparkle feedback. One target also needs editorial review: SAT is paired with a chair emoji, which is a weak clue for the word “sat” even though the sound answer itself is correct. These are concrete content/mechanics gaps against the roadmap, not failures of the checks above.

There are three desktop and four mobile completed runs total. I did not multiply the count by chapter; the road map’s shared contract is per game.
