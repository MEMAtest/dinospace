# B2/B3 cumulative narration supplement: bounded independent UI check

**Result:** the B2 Puzzle Pop Dino Park picture-introduction clip and Next-picture clip played from packaged local audio in the actual UI and reached `ended`. The bounded Spot the Difference sample exercised its clue and both visible magnifier controls, but it played the existing pair clips; neither new Spot hint key was reached. Dino Detective was not reached in this bounded session. This is a local preview observation, not production acceptance or a human listening verdict.

## Candidate identity and test boundary

- Preview: `http://127.0.0.1:5405/`
- Runtime source: `aa37a8a807349ca6953f397ef408ae067e6c63cc`
- Canonical base: `22d805b67ced8b36f45d0f5c547bfe67c5dded88`
- Served-file identity: [`served-identity.json`](./served-identity.json). The preview returned HTTP 200 for index, linked JS/CSS, and all seven supplement MP3s with the recorded SHA-256 values.
- Reused the existing single Chrome/Playwright tab, first at 390×844; Spot was then resized in the same tab to 1280×800. No new browser, window, tab, or context was opened.
- The `/api/voice` and `/api/story` guards were confirmed active before app navigation and again afterward; both returned 403. No provider request, story generation, progress injection, answer injection, or real child data was used. UI sound was restored to off before leaving the tab.
- A passive HTML media-event observer recorded `play()`, metadata, `playing`, resolution, `pause`, and `ended` without changing playback behavior. No human listening assessment was performed.

## Observations

### Puzzle Pop: Dino Park

On the normal Creative Lab route, I selected Puzzle Pop and progressed through the visible Picture Pioneers queue to Dino Park. On the Dino Park intro at 390×844, I used its visible **Hear again** control. The browser loaded and played `a39b3546-matilda.mp3` (5.108 seconds) and emitted `loadedmetadata`, `canplay`, `playing`, `play-resolved`, then `ended`. The actual UI remained on Dino Park, Picture Pioneers, Picture 3 of 4. I then used normal world navigation and replayed the chapter. Advancing from the preceding picture into Dino Park played `9685e0ac-matilda.mp3` (5.016 seconds) and likewise reached `ended`.

Both requests returned HTTP 200. Their SHA-256 values match the frozen identity: `a39b3546` → `254457ed89777430e3229991151818defbc72250d8bfc0df3ea3edad631deecb`; `9685e0ac` → `719d07e044ba711640be1fea66a3a1968219c1236ac511ecdd114357ac546cd6`.

The new chapter-introduction key `e077fcc0` was not requested in this bounded flow. I did not repeat or force additional chapter starts to hunt for it. The captured Puzzle Pop page had 390px document width and no horizontal overflow; the header Back and sound controls measured 48×48.

### Spot the Difference

From Thinking & Play, I opened Spot the Difference and started Bright-Eyed Beginners, Pair 1 (Dino Park). At 390×844, I used **Hear clue**, each of the two ordinary **Magnifier** hints, then tapped the visible left-bottom detail that the UI hint had identified. The rendered feedback changed to “You found a change! 1 of 3.” The sound clips observed were `61fb1c94` (clue) and `c9833c19` / `87cb63b8` (hints); the newly added keys `a44acc87` and `5866151d` were not requested by this pair. I resized the same tab to 1280×800 and captured the resulting ordinary state; this was a layout screenshot, not a second gameplay pass.

The Spot viewport screenshot shows the accessible pair controls and visible 1-of-3 feedback. The new Spot hint clips remain unobserved in this bounded sample; no claim is made about their UI playback.

### Dino Detective

Neither new Dino Detective fact key (`f6991245`, `0f0204e5`) was reached. This profile did not have an ordinary unlocked Dino Detective route during the bounded check, and I did not inject progress or extend sampling to unlock it.

## Evidence

- [Puzzle Pop initial board](./puzzle-first-round.png)
- [Dino Park intro at 390×844](./dino-park-intro-390.png)
- [Spot Pair 1 at 390×844](./spot-hints-390.png)
- [Spot Pair 1 resized to 1280×800](./spot-hints-1280.png)

The event and network notes above are from the existing tab’s passive media-event and Playwright request logs during this run. Console inspection reported zero errors and zero warnings. The saved served identity records the exact frozen preview file hashes; it does not establish human audio quality, production delivery, or playback of clips marked unobserved here.
