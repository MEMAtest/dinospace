# Batch 6 editorial-copy browser delta

Date: 4 October 2026  
Tester: independent Playwright UI review  
Candidate: frozen localhost build `http://127.0.0.1:5363/`, source `60f362368d5eedb3b43dedc4fa95eb3097672d7e`  
Scope: rendered editorial delta for Pattern Parade, Dino Hangman, Chess Explorers and Astronaut Academy. This supplements the retained gameplay matrix; it is not a fresh full mechanics matrix or a release/4.5 acceptance.

## Identity and setup

The candidate is the frozen build described by [`identity.json`](../batch6-editorial-copy-20261004/identity.json): 5,610/5,610 served files matched the frozen dist, with zero hash failures. I independently rechecked the runtime JavaScript (`assets/index-C42-a2Zu.js`, SHA-256 `3aa0eb4a25efd0b7c6e6c5a142374954d57aa98b256b3a23f54f00283a0aafc7`) and stylesheet (`assets/index-CZIXwkmD.css`, SHA-256 `c057757199ab545e7594e3b53abd89e1ce8ada62cb531f0f0fafbcb8a2d869b3`) against the frozen dist.

The app was opened from the Playwright context after voice/story request guards were configured before the first app navigation. Sound stayed off using the visible control. No Hear button or provider service was invoked. The recorded network list contained 31 successful static requests and no voice/story request. The console reported zero errors and zero warnings. Progress described below came only from visible UI actions in the fresh Amari profile; no storage, seed, hidden answer, or progress injection was used.

## Rendered checks

### Pattern Parade

At 1280×800, I played Chapter 1 through its six ordinary rounds, then resized the same profile to 390×844 and used the visible replay path. At both sizes I inspected AB, AAB and ABB prompts before choosing, opened the visible clue, chose the matching answer and inspected held success before Next. Before answering, the title remained the neutral “What comes next?” and did not name the pattern rule. The AAB clue explicitly used its three-place unit (“first three places”); AB referred to the first two positions; ABB identified its one-plus-two repeat. Held explanations then named the rule and described its structure. This confirms the rendered copy for these three ordinary rounds, not every authored question or replay variation.

Screenshot: [mobile ABB held explanation](screenshots/mobile-pattern-abb-held.png).

### Dino Hangman

At 390×844, the ordinary first question used a plain word-family sentence: “The hidden word ends in -at. Look for words with the same ending.” I chose a visibly wrong letter; the remaining-supplies count decreased while the prompt stayed available for retry. The visible Letter clue then disclosed the first letter. The held evidence is [mobile word-ending copy](screenshots/mobile-hangman-ending-copy.png).

At 1280×800, I opened the same chapter normally and confirmed the rendered family prompt remained plain (“The hidden word ends in -ap…”). The chapter and question were not forced. The visible Letter clue said “Letter clue: find M. Tap that letter when you find it.” This gives an initial letter as scaffold but does not directly display the whole word. Screenshots: [desktop family prompt](screenshots/desktop-hangman-word-ending.png) and [desktop Letter clue](screenshots/desktop-hangman-letter-clue.png). This is a Q1 editorial delta only, not a claim about the other two chapters or all word families.

### Chess Explorers

At both 1280×800 and 390×844, the normally unlocked Piece moves chapter showed the rook-specific instruction: “Move the rook along its clear row to the star square.” Its rule stated that a rook moves along a row or column and cannot pass through a piece. The disclosure “How other pieces move” remained collapsed until opened; it contains the other piece rules. The mini-board limitation (“no check, castling or promotion”) was visible. Screenshots: [desktop rook rule](screenshots/desktop-chess-rook-rule.png) and [mobile rook rule](screenshots/mobile-chess-rook-rule.png).

This checks one mission and its optional disclosure at both widths. The retained full baseline covers the broader Chess mechanics; this delta does not claim that every piece’s edited instruction was independently rendered here.

### Astronaut Academy

At 390×844, ordinary Space science play showed the clue only after “Mission clue” was selected. On Q2 (“Which planet is called the Red Planet?”), choosing Venus produced retry feedback and no fact/source card. The clue then pointed to the rusty colour of dusty ground without saying Mars. Choosing Mars showed the explanatory fact and NASA source only after success. Q3 asked what pushes a rocket upward; its clue asked the child to compare the rocket’s direction with its exhaust, and the correct answer showed the exhaust/rocket fact and NASA source. Q4’s clue contrasted a rover with a flying robot and asked which explores the surface; its held fact explained rover wheels. Q5–Q6 were answered through ordinary visible choices, and Chapter 1 completed normally with its fact-card summary. Screenshot: [mobile rocket fact after correct answer](screenshots/mobile-astro-rocket-fact.png).

The mission pill “Mission engineering” appeared on a Q3 engineering prompt under the Space science chapter. This matches the distinct mission kind and chapter route; it is recorded as observed wording, not a routing defect. The ordinary queue reached Q1–Q6 in the first chapter and Q1 of the unlocked Mission engineering chapter at desktop. It did not surface the Earth day/night globe or Venus rotation arrow missions. Their conditional diagram visibility/timing is therefore **unobserved** in this UI pass; I did not force those missions. The Q1 desktop engineering view showed “What protects a spacecraft from heat as it enters an atmosphere?” with choices, before clue; it was not answered.

This is rendered evidence for the sampled mobile clue/retry/fact timing and the one desktop prompt, not a 36-mission clue acceptance.

## Results and limits

- No concrete copy rendering defect was found in the sampled states. The clues observed were useful, distinct from the held facts, and did not repeat a complete correct option verbatim. This is a bounded sample, not all-copy sign-off.
- The two optional Astronomy diagrams’ rendered appearance, and confirmation that they appear only after their clue on those exact missions, remain unverified because neither mission appeared in the ordinary queue reached.
- Phrase inventory remains separate: the frozen builder audit records 378 unique phrases, 1 ready and 377 missing; all 64 changed/new phrases are missing locally. No clips were heard or generated, so no audio-playback or human-listening acceptance is claimed.
- Historical gameplay coverage remains in [`batch6-full-local-20261003/report.md`](../batch6-full-local-20261003/report.md). Earlier candidate-specific failures/repairs remain tied to their own identities and are not relabeled as tests on this candidate.
- This report does not award a rubric score or 4.5 acceptance. Full narration coverage, human listening and the unobserved mission-specific diagrams remain open gates.
