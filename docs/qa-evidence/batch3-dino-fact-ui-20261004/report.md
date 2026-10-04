# Dino Detective Swamp and Cave fact copy — UI delta

## Candidate

- Exact local candidate commit: `e2aee30169f6ade67f7948b0088a895a9cb119c3`
- Runtime copy source: `src/data/dinoDetectiveBatch3.js` (candidate Git blob `124ea15e934afde6f4ae68ba00357ff4e333469e`)
- Fresh configured build: `npm run build:android`
- Fresh local origin: `http://127.0.0.1:5381`
- Served identity: [identity.json](identity.json); [full served asset SHA-256 list](served-assets-sha256.txt)
- The configured build succeeded. All 5,879 files in the built `dist` returned HTTP 200 and matched their local SHA-256. Both browser viewports had zero console messages and no static HTTP 4xx/5xx responses.

The first Playwright launch attempt requested an absent Chrome for Testing binary and stopped before app navigation. The browser was then started with the installed Chrome channel. In each new test context, the voice and story routes were set to 403 and verified on `about:blank` before the first app navigation; they remained active. No provider request escaped the guards. “Hear instructions”, “Read clue”, and “Listen” were not activated. Mobile gameplay was visibly muted from the start. On desktop, ordinary unlock clicks began while the app's default sound control showed sound on; before both changed-copy held-fact rechecks, I switched sound off through the visible control. This is not audio playback or listening evidence.

## Ordinary unlock and reveal path

I used separate fresh Playwright contexts for desktop (1280×800) and mobile (390×844). No child profile data, storage, seeds, progress, answer state, or hidden answer data was injected or read. To unlock the requested worlds, each context advanced through the game normally: four Starter worlds, then Desert Dash and Rainbow Ridge, then Misty Swamp. The desktop context also completed the remaining Growing world (Ice Age) to unlock Crystal Cave in Challenge. Each find used the visible “Show a clue” control and then clicked the currently highlighted, labeled target. These were ordinary assisted practice actions for progression, not independent-answer evidence. For the Cave mobile check, I resized that same desktop context to 390×844 after earning the unlock through ordinary play; the separate fresh mobile context provided the Swamp mobile check.

## Rendered copy and interaction

At both 1280×800 and 390×844, the held Misty Swamp card showed the target fact “Ankylosaurus had bony armor and a heavy club at the end of its tail.” and the revised world fact:

> A wetland is a place where the ground stays very wet. Some wetlands dry out for part of the year.

At both widths, the held Crystal Cave card showed the target fact “Velociraptor had a curved claw on each foot.” and the revised world fact:

> Water can slowly dissolve (wear away) limestone rock and help caves form.

In each case, the find result stayed on screen with the target fact and world fact until the visible “Next find” control was activated. That tap cleared the facts and moved the visible progress from Find 1 to Find 2. There was no automatic advance. The Dino Detective back control opened the normal Leave the game dialog; selecting its exact “Back to world” action returned to `#/world/explore` at both sizes.

Evidence screenshots:

- Swamp: [desktop held fact with sound muted](screenshots/swamp-desktop-held-muted.png), [mobile starting scene](screenshots/swamp-mobile-start.png), [mobile held fact](screenshots/swamp-mobile-held.png)
- Cave: [desktop held fact with sound muted](screenshots/cave-desktop-held-muted.png), [mobile held fact](screenshots/cave-mobile-held.png), [mobile scrolled to Next](screenshots/cave-mobile-next-scrolled.png)
- Additional map/reveal captures are in this folder.

At 390px, the held card is taller than one viewport. The “Next find” button sits at y=877 in the 844px viewport; document scroll width stays 390px, while document height is 1,031px. Ordinary vertical scrolling exposed the whole held card and the button, and its tap cleared the card. There is no horizontal overflow. The revised world facts wrap to a few readable lines, with “wear away” displayed beside “dissolve” to explain that word.

## Editorial assessment and limits

The Swamp wording explains “wetland” with a familiar ground-and-water description and preserves seasonal drying. The Cave wording retains the accurate term “dissolve” and immediately glosses it as “wear away”; it explains the cave link without requiring a child to infer the vocabulary. In these rendered cards, both world facts are concise and readable for the intended age-six audience. This finding applies only to these two fact strings and their held-fact presentation; it is not a full-game teaching score or a 4.5 award.

The exact new narration keys `f6991245` and `0f0204e5` remain pending; the candidate readiness is 273/275. No voice job, manifest change, clip generation, production action, human playback, or listening review was performed. The build does not close the audio/readiness or release gate. The retained full 12-world mechanics baseline is separate evidence; this report covers only the changed Swamp/Cave copy and its ordinary held-fact → Next interaction at the requested viewport sizes.
