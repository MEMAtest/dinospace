# Batch 4 grammar repair: independent rendered-copy delta

Date: 2026-10-04  
Frozen candidate: `http://127.0.0.1:5384/`  
Runtime source: `fe5aeff64dca2d1c9aad6dcecee9cede5bdcc128`  
Base runtime: `aa1627216907ae1612e1bdbb309764000a995ae6`  
Builder report: [`batch4-grammar-repair-20261004/report.md`](../batch4-grammar-repair-20261004/report.md)  
Served identity: [`runtime-identity.json`](runtime-identity.json)

## Procedure and identity

I opened a fresh Playwright CLI session at `about:blank`, installed context routes that return HTTP 403 for `/api/voice` and `/api/story`, and added a guard sentinel before navigating to 5384. I turned sound off through the visible control and selected Amari through the profile UI. No provider requests, data injection, hidden answers, storage edits, or worker/manifest changes were made.

The served identity reports all eight HTML, service-worker, JS and CSS files as HTTP 200 with matching frozen-build hashes. Browser logging after the bounded run showed 12 static GETs, all local to 5384 and HTTP 200; console reported zero errors and zero warnings. The profile earned its progress only through ordinary visible controls. I began at 1280×800 and resized the same active question to 390×844 to inspect the Number Line result on a narrow viewport; this was not a separate mobile-profile run.

## Visible copy and result

- Subtraction Chapter 1 started normally. Its first two visible questions were plural: “There are 10 apples…3 remain” and “There are 10 shells…2 remain.” After answering those questions through the rendered answer buttons and ordinary Next controls, the third question naturally showed “There is 1 flower. Take away 1. How many are left?” This confirms the one-object prompt uses singular agreement in rendered UI.
- I selected the visible Answer 0. The remaining tray showed `0 flowers` and feedback read “Start with 1. Take 1 away. 0 remain.” The zero case remains grammatical. Screenshots and snapshots preserve the prompt, remaining tray, and feedback.
- In Number Line Jump, World 1 was available and World 3 “Compare Values and Distances” was visibly locked in a fresh profile. I did not unlock additional worlds to search for a particular generated sentence. The ordinary first mission showed “Start at 0. Hop 1 forward. Where do you land?” I pressed the visible Hop forward control once; the held explanation read “0 + 1 = 1. The frog moved 1 hop and landed on 1.” The active result remained readable after resizing to 390×844.
- The UI evidence does not include the repaired Number Line phrase “1 space”: its compare world was locked. That authored phrase is covered by the candidate’s finite-corpus/source evidence, not by this browser observation. Likewise, I did not encounter a subtraction question whose result is exactly one, so `1 remains` was not observed in the UI.

## Scope and limits

This is a narrow rendered-copy delta on the exact 5384 source. It confirms the corrected “There is 1 flower” prompt, a zero-remains explanation, and a visible singular one-hop result. It is not a new gameplay matrix or a complete browser audit of all 47 changed narration phrases. The earlier 5227 mechanics and 5383 route/collection evidence remain tied to their own candidate identities. Corrected recordings, provider/audio playback, listening, and production checks remain open; no 4.5 or production acceptance is claimed.

## Evidence

- `subtraction-one-object-question.yml`
- `subtraction-zero-remain-feedback.yml`
- `numberline-one-hop-question.yml`
- `numberline-one-hop-feedback.yml`
- `screenshots/subtraction-zero-remain.png`
- `screenshots/numberline-one-hop-mobile.png`
- `runtime-identity.json`
