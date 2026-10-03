# Batch 6 progress sound events — independent browser delta

Date: 4 October 2026
Candidate: frozen source `f8f9f7a938870e415e0feac69761e1c18d7d10ad`, served at `http://127.0.0.1:5295`
Identity: [batch6-progress-sounds-identity-20261003.json](../batch6-progress-sounds-identity-20261003.json)
Scope: actual UI feedback and native WebAudio event scheduling for Pattern Parade, Chess Explorers, Astronaut Academy, and Dino Hangman. This is an event-level QA delta, not a sound-quality or release acceptance report.

## Setup and candidate identity

I began two named Playwright profiles at `about:blank`, set the mobile viewport to 390×844, and installed route handlers for `**/api/voice**` and `**/api/story**` before each first navigation. Both handlers return a local 403 response. No providers, narration generation, seed/progress injection, stored-state edits, or hidden answer/puzzle data were used. Each game was entered through ordinary visible navigation and answers were based on the rendered prompt, board, sequence, or word-family clue.

Before navigation, an init script passively wrapped native `AudioContext.createGain` / `createOscillator`, oscillator `start` / `stop`, and `AudioParam` envelope scheduling calls. It did not create or trigger audio nodes itself. Evidence therefore shows that the app created and scheduled browser-native oscillators and gain envelopes in response to real UI answers. It does not establish that a person heard the result or judged its tone, loudness, timing, or appropriateness.

The five files listed in the identity manifest were fetched again from port 5295 immediately before the report: all returned HTTP 200 and matched SHA-256 (`sw.js`, main JS, SolarSystem JS, CSS, and web JS). The initial preflight at port 5285 had found a different IPv4 listener/build and no sound UI was tested there; that failure and the explicit port correction are preserved in the identity record. The frozen candidate files were not modified. Browser console summaries at both viewports reported zero messages, errors, or warnings. Playwright showed only static requests in the final request summaries; the voice/story guard handlers were installed before navigation.

## Results

For wrong-answer feedback, each game produced two actual oscillator starts with two envelope gain nodes. For success, each produced three oscillator starts with three envelope gain nodes. The sampled wrong-note frequencies were 440 Hz and approximately 349.23 Hz; success used 523.25 Hz, 659.25 Hz, and approximately 783.99 Hz. The browser trace also showed the app scheduling each envelope’s attack/decay and each oscillator’s stop. These are implementation-event observations, not claims about perceived audio.

| Game | Desktop 1280×720 | Mobile 390×844 |
|---|---|---|
| Pattern Parade | Visible AB question: wrong star choice emitted 2 oscillators; changing to the visible repeating moon emitted 3. “Why it works” and “Next pattern” stayed visible after an 1.2 s hold. | Visible AB question: wrong dog choice emitted 2 oscillators; correct star emitted 3. “Why it works” and “Next pattern” stayed visible after a 650 ms hold. |
| Chess Explorers | Selecting the rendered queen emitted no oscillator events. A legal but non-goal move emitted 2; moving the selected queen to the visible star goal emitted 3. “Why it works” / “Next puzzle” stayed visible after an 850 ms hold. | Selecting the knight emitted no events; a legal but non-goal move emitted 2; moving to the visible star square emitted 3. The success panel and “Next puzzle” remained visible after a 750 ms hold. |
| Astronaut Academy | In “Space science,” Neptune was a visible wrong answer for “Which planet is called the Red Planet?” and emitted 2; the rendered correct option Mars emitted 3. The fact and “Next mission” remained visible after an 800 ms hold. | Same rendered question: Venus emitted 2; Mars emitted 3. The success explanation and “Next mission” remained visible after a 700 ms hold. |
| Dino Hangman | In a visible `-at` rescue, wrong X emitted 2. Correct S and A each revealed a letter without oscillator starts. Correct T completed the visible `SAT` word and emitted 3; rescue explanation and “Next word” remained visible after an 850 ms hold. | In a visible `-at` rescue, wrong Q emitted 2. Correct C and A each revealed a letter without oscillator starts. Correct T completed the visible `CAT` word and emitted 3; rescue explanation and “Next word” remained visible after a 750 ms hold. |

### Mute during a cue

At desktop, I chose a wrong answer in Pattern Parade and immediately activated the visible **Turn sound off** control during its scheduled two-note cue. The trace showed the master gain parameter set to `0`, scheduled automation cancelled, and both active oscillators stopped at the current audio-context time. While still muted, I submitted the visible correct answer to that question: the answer feedback appeared, with **zero new oscillator or envelope events**. This checks the current-note interruption and future-answer suppression in one ordinary session. I did not assess perceived fade quality by listening.

## Screenshots

- Pattern: [desktop wrong answer](pattern-wrong-desktop.png), [desktop muted cue](pattern-muted-wrong-desktop.png), [desktop held success](pattern-held-desktop.png), [mobile held success](pattern-held-mobile.png).
- Chess: [desktop selected piece](chess-selection-desktop.png), [desktop held success](chess-held-desktop.png), [mobile wrong destination](chess-wrong-mobile.png), [mobile held success](chess-held-mobile.png).
- Astronaut: [desktop held success](astro-held-desktop.png), [mobile held success](astro-held-mobile.png).
- Hangman: [desktop held word](hangman-held-desktop.png), [mobile held word](hangman-held-mobile.png).

## Limits and acceptance boundary

This confirms actual UI-triggered native WebAudio event behavior for the targeted controls at the two tested viewports. It does not assess human-perceived quality, narration availability, pronunciation, intelligibility, mix, or whether the cues are pleasant or age-appropriate. The separate narration inventory still reports 1 ready / 434 missing authored narration phrases; no narration clips were generated or played in this task. Full game-matrix acceptance remains the prior baseline in [the full local report](../batch6-full-local-20261003/report.md), with narrow clue/copy follow-up in [the independent narration repair report](../batch6-narration-repair-independent-20261003/report.md). No game is declared 4.5 accepted or released from this delta.
