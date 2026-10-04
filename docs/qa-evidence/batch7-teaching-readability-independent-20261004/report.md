# Independent Memory late-board readability QA

Date: 4 October 2026  
Candidate: Batch 7 Solar copy and Memory late mobile captions  
Source: `21ee7b240b271c5d775e4ebca3b5f29e0ad63ade`  
Frozen preview: `http://127.0.0.1:5391/` (local only; not deployed)  
Builder identity: [`../batch7-teaching-readability-20261004/identity.json`](../batch7-teaching-readability-20261004/identity.json)

## Scope and verdict

This is a bounded independent UI check of the late-board mobile layout, ordinary Memory progression, final-board replay, Level 1 regression, and one desktop late-board presentation. It is not a full 4.5 acceptance, audio/listening review, or production check.

**Pass for the changed mobile late-board caption/layout behavior and observed gameplay progression.** At 390×844, I earned all ten levels using the visible level flow and actual card flips. The 13-, 17-, and 18-pair boards used four columns and 12px captions; their captions wrapped without horizontal clipping or document-width overflow. I completed and replayed the 18-pair Galaxy Challenge board, then completed Level 1 again through its visible level selector. The visible 10/10 sticker count remained.

At 1280×800, I opened the already unlocked 18-pair Galaxy Challenge from its visible level selector. Its 36-card board fit a 1080px-wide board without horizontal overflow. The first actual flip revealed “comet”; its caption fitted its 139px label box. The desktop caption computed to about 10px, smaller than the mobile 12px captions, but the sampled label was visible and unclipped. This was a desktop presentation sample, not a desktop completion run.

## Guarding and sound-toggle oversight

A fresh isolated Playwright session began at `about:blank`. Before the first application navigation, `/api/voice` and `/api/story` were routed to HTTP 403. `route-list` confirmed both guards remained installed; no provider request could pass. The console reported zero messages, errors, or warnings. The captured request list showed static requests only, with no external voice/story call.

The home-screen sound control was turned off. After entering Memory, I mistakenly clicked the visible `Turn sound on` control, so Level 1 was completed with sound enabled. I noticed this immediately afterward and used the visible `Turn sound off` control before continuing; Levels 2–10, replay, Level 1 regression, and desktop inspection were muted. This mistake limits any sound-related interpretation of Level 1. I make no audible-quality claim. The 403 guards remained active throughout, and no paid provider/story call was made.

## Observations

| Board | Viewport | Rendered evidence | Result |
|---|---:|---|---|
| Dinosaur Discovery, 13 pairs | 390×844 | 26 actual cards, four columns, 12px captions; labels stayed within cards and page width stayed 390px | Pass |
| Garden & Pond Life, 17 pairs | 390×844 | 34 actual cards, four columns, 12px captions; long labels including “caterpillar” and “water lily” remained within cards | Pass |
| Galaxy Challenge, 18 pairs | 390×844 | 36 actual cards, four columns, 12px captions; longest visible labels wrapped without horizontal clipping; document width 390px | Pass |
| Galaxy Challenge replay | 390×844 | Started through visible “Replay this level”; solved all 18 actual pairs through visible flips; 10/10 stickers remained | Pass |
| Forest Friends regression | 390×844 | Returned through visible Level 1 control and completed four actual pairs; board remained 4 pairs/8 cards | Pass |
| Galaxy Challenge presentation sample | 1280×800 | Visible level control opened 36-card board; board width 1080px; page width 1280px; first flipped card showed “comet,” caption about 10px and within its label box | Pass for sampled presentation; no desktop completion run |

Vertical scrolling was needed on the long mobile boards; no horizontal page overflow or card/label escape was observed. Hidden card identities were not inspected: card labels were read only after each ordinary UI flip. Progress was earned only through the rendered game controls; no storage, answer, seed, or progress injection was used.

## Captures

- [Mobile 13-pair board](screenshots/mobile-level5-13-pairs.png)
- [Mobile 13-pair board, top](screenshots/mobile-level5-13-pairs-top.png)
- [Mobile 17-pair board](screenshots/mobile-level9-17-pairs.png)
- [Mobile 18-pair board](screenshots/mobile-level10-18-pairs.png)
- [Desktop 18-pair face-down board](screenshots/desktop-level10-facedown.png)
- [Desktop first revealed caption](screenshots/desktop-level10-faceup-comet.png)

## Limits

The screenshots and UI findings bind to the local frozen candidate SHA above, whose builder identity reports 5,963/5,963 served files matching its frozen build. This check does not certify human narration quality, the candidate’s new Solar narration readiness, production deployment, the full set of 87 Memory images, sibling isolation, or every responsive breakpoint. The only desktop gameplay observation was opening the 18-pair board and revealing one card. Level 1’s first completion happened while sound was enabled due to the documented toggle mistake; later levels and the desktop sample were muted.
