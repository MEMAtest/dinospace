# Batch 2 production acceptance — 2026-10-03

Independent browser review of the four functional repairs on the canonical production alias. All app interactions used visible UI controls in isolated Playwright profiles: `b2prod-desktop-final` (1280×800) and `b2prod-mobile-final` (390×844). Before opening the app, both profiles blocked `**/api/voice**` and `**/api/story**`; no paid voice/story request was permitted. No source edits or deployments were made.

## Production identity

At start and end, the canonical alias remained on the reported production build. The JS and CSS asset digests matched the supplied identity report at both checks:

| Item | Expected / observed |
|---|---|
| Deployment | `dpl_Yw6eFRkrTbgF7b9hw2oyUdSXJA9W` (READY; root identity report) |
| Deployed source | `3cdfc426e91b46a855448690278ceb6590280b68` |
| Runtime-equivalent source | `83149d897366dcbe8bc4034849d340ed61a0221d` |
| JS `/assets/index-B8F2g6Xc.js` SHA-256 | `eb284559d1686de42a4754d7cf73b0fd3b304a0adb6df0d6c440507176e49752` |
| CSS `/assets/index-CUmO8J4O.css` SHA-256 | `d8fe5109969658486618b98444a2d23d3fb411f1604a6081d45d3e5ed90f5d2f` |

## Results

| Area | Result |
|---|---|
| Puzzle Pop Starter + ordinary same-band Replay, desktop and mobile | Pass. Four actual scenes completed in each band and viewport. First scene changed on replay (desktop Dino Park Picnic → Moon Camp; mobile Dino Park Picnic → Robin’s Tree). On desktop, the visible hint selected a piece and lit its matching space while moves stayed at zero; only a subsequent click on that space placed it. Descriptive preview text/full scene title and held fact/Next were visible. |
| Spot the Difference Starter + ordinary same-band Replay, desktop and mobile | Pass. Four scenes in each band and viewport; replay initial scenes differed (desktop River Valley → Dino Park; mobile Superhero City → Moon Camp). |
| Spot Challenge, desktop and mobile | Pass for two pairs per viewport. Each pair displayed seven targets with 56×56 CSS-pixel controls and zero pairwise overlaps. Two hints per pair marked different targets with amber/pulse styling. A found target stayed counted after tapping its former coordinate; the response was neutral (“Not that spot yet”). Facts remained visible until Next. Desktop: Nature Lab and History Hall. Mobile: History Hall and Robin’s Woodland. |
| Sky Shapes | Partial pass at desktop. Starter and Growing were each completed through all four missions. The first numbered start and absence of a plane before input were checked on Starter and Growing; entering input moved the plane, Restart returned to zero and hid it. Challenge loaded the ordered 1–6 markers with no plane, and after completing part one exposed the numbered 2 start with no plane. Full Challenge, mobile viewport, and one held completed-route fact/Next were not completed. |
| Monster Math Counting + Growing | Pass at both widths. Counting’s visible picture group had individually named image items and no aggregate answer before selection. All six Starter questions completed by counting visible items. Growing’s equation/model was visible; an intentionally incorrect choice produced a gentle retry, the clue described the operation, and the correct result displayed the model and a single feedback explanation. All six Growing questions completed. |
| Monster Math Story Problems | Partial pass at both widths. A guided story was worked from the displayed number line. Desktop used the backward-jump model, including pointer and keyboard input and Start again reset; mobile used the forward-jump model, pointer and keyboard input, reset, completed the jumps, and held the answer/explanation. On mobile, Next auto-scrolled to question 2; viewport, document and body widths stayed 390px. The six-question Challenge episode was not completed. |
| Mobile layout/shared controls | No horizontal overflow observed in Puzzle, Spot Challenge or Monster Story. Puzzle and Spot primary controls measured 48×48px; Spot targets measured 56×56px. Mobile Story Next was below the initial viewport but reachable through normal vertical auto-scroll. |
| Persistence and confirmed Back | Mobile reload returned to the ordinary child picker; selecting the same child restored 16 stars and the same 7 games played. Desktop Back from active Story showed a confirmation; choosing Back to world returned to Maths Missions. Puzzle Back returned to Creative Lab. No duplicate-award increase was seen in the mobile reload check. |
| Packaged media play/end/replay/mute/Next | Not accepted in this pass. In Monster Story, Hear the question again was clicked with sound enabled under guards, but no DOM `audio`/`video` element or native `play`/`ended` event was observed. This does not establish clip playback, end, replay cancellation on Next/Back, or audio quality. |
| 4.5 roadmap acceptance | Not claimed. Human listening remains pending; this report is functional browser evidence only. |

## Diagnostic exports and evidence

Both exports were downloaded using the visible Grown-ups → press-and-hold → Game troubleshooting → Download game log flow, into separate files. They are unmodified app output; each contains 300 recent events and bounded retained run milestones with actual seeds. Early event records may have rolled off the 300-event window; use the retained `start` milestones together with the scene screenshots for the observed first-scene order.

- Desktop: [desktop-amari-game-diagnostics.json](desktop-amari-game-diagnostics.json), 300 events / 25 milestones.
- Mobile: [mobile-amari-game-diagnostics.json](mobile-amari-game-diagnostics.json), 300 events / 19 milestones.
- Screenshots and downloads are colocated in this directory. Key checkpoints include `desktop-puzzle-hint-mapping-no-placement.png`, `desktop-sky-challenge-next-part.png`, both desktop and mobile Spot Challenge held-fact images, and `mobile-monster-next-question-reachable.png`.

Each challenge used ordinary UI, not injected storage, seeds, answers or copied child data. Some wrong game responses were intentionally used to inspect gentle recovery. The Starter/Replay repairs and priority scenarios were exercised; unaffected baseline scenarios were not rerun.
