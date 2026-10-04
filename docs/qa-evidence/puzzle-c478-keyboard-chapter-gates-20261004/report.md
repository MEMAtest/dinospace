# Puzzle Pop current-c478 chapter and keyboard gates — 2026-10-04

## Scope and exact runtime

This addendum records fresh, ordinary-UI evidence for the canonical alias `https://dinospace-eight.vercel.app`, deployment `dpl_2wMjWv6KPJ4QPMKrSJLWinefowDz`, archive source `c47864404cff1f31c9cefe9b8a363d0ba5542b24`. The exact seven-file identity and hashes are in the root-owned [canonical identity](../sound-preference-canonical-identity-20261004.json); this report does not modify that identity. The 12 scene asset hash manifest is in the earlier [editorial audit](../puzzle-canonical-editorial-keyboard-20261004/scene-assets.json).

Two fresh synthetic browser profiles were used. In each, the browser began at `about:blank`; `**/api/voice**` and `**/api/story**` routes returning 204 were installed before app navigation. There was no seed, progress, localStorage, answer, or child data injection, no hidden-answer/path extraction, and no provider call. The experience was entered through Amari → Creative Lab → Puzzle Pop and all progress was earned through ordinary visible controls. Console reported zero messages/errors/warnings. The request list had no non-static/API requests; 429 static requests were listed. No runtime/source changes were made.

This is the follow-up to [the earlier c478 editorial/keyboard report](../puzzle-canonical-editorial-keyboard-20261004/report.md). It supersedes only that report’s then-open current-c478 keyboard-band and full current progression observations. The original title/art and human-audio limitations remain unchanged.

## Full fresh chapter coverage

The first profile was run at desktop 1280×800 and then mobile 390×844. The ordinary random queue was completed for every band at both sizes. For each puzzle, the visible Hint control (or Challenge’s visible “Show a piece mapping” followed by Hint) selected and described a piece/target; puzzle targets were reached using keyboard focus and Enter. Next picture and chapter progression used the visible controls, including keyboard activation. This was a hybrid visible-hint plus keyboard-placement run, not a claim that every hint was activated from the keyboard in this matrix.

| Band | Desktop 1280×800 scene order | Mobile 390×844 scene order |
|---|---|---|
| Starter 2×2 | River Valley → Robin’s Tree → Moon Camp → Dino Park Picnic | Dino Park Picnic → Moon Camp → River Valley → Robin’s Tree |
| Growing 3×3 | Hero City Helpers → Pattern Festival → Treehouse Robots → Sound Safari | Hero City Helpers → Pattern Festival → Treehouse Robots → Sound Safari |
| Challenge 5×5 | Nature Lab → World Explorer → Time Observatory → History Hall | Nature Lab → History Hall → Time Observatory → World Explorer |

All 24 boards reached their held scene fact and visible Next picture state; Starter and Growing progressions unlocked the next band through the normal Next chapter control. On mobile, after completing Growing, a normal reload returned to the chapter map with all three bands showing 4/4. The saved map is [shown here](screenshots/mobile-map-after-reload.png). Back opened the ordinary “Leave the game?” choice; “Back to world” returned to Creative Lab, where the Puzzle Pop card showed “Played 4.” Re-entering the game showed the saved chapter map. Screenshots for held facts and Next controls after fully keyboard-only representative runs are below.

## Pure keyboard representatives, all sizes and bands

I separately completed one whole puzzle in each band using only keyboard actions for puzzle controls, at both widths. The visible instructions/control labels were used; no internal guide coordinates or answer data were read. I tabbed to Hint (or the visible Challenge mapping control), activated with Enter, Shift+Tab to the announced “Puzzle space N, hint space” target, then Enter to place. I repeated until the app showed correct-placement feedback, a held scene fact, and Next picture.

| Width | Band and board | Placements | Evidence |
|---|---|---:|---|
| 1280×800 | Starter, Dino Park Picnic 2×2 | 4 | [desktop screenshot](screenshots/desktop-starter-dino-park-keyboard.png) |
| 1280×800 | Growing, Sound Safari 3×3 | 9 | [desktop screenshot](screenshots/desktop-growing-sound-safari-keyboard.png) |
| 1280×800 | Challenge, History Hall 5×5 | 25 | [desktop screenshot](screenshots/desktop-challenge-history-hall-keyboard.png) |
| 390×844 | Starter, Moon Camp 2×2 | 4 | [mobile screenshot](screenshots/mobile-starter-moon-camp-keyboard.png) |
| 390×844 | Growing, Treehouse Robots 3×3 | 9 | [mobile screenshot](screenshots/mobile-growing-treehouse-robots-keyboard.png) |
| 390×844 | Challenge, World Explorer 5×5 | 25 | [mobile screenshot](screenshots/mobile-challenge-world-explorer-keyboard.png) |

The keyboard-only sessions completed the whole board rather than just proving focus visibility. Challenge’s mapping and Hint were operated via Tab+Enter; hinted target focus was reached with Shift+Tab. At mobile, Hint focus traversal counts varied with screen position and tab order; the target stayed reachable using normal tab focus, and the browser scrolled vertically as needed. Sound was visibly muted for these six pure-keyboard representative runs. The wider hybrid matrix began with sound enabled; this report does not assert that no packaged audio played during that portion.

## Mobile target and layout measurements

Measurements are from rendered elements at `innerWidth=390`, `innerHeight=844`. The document’s scroll width remained 390px on active 2×2, 3×3, and 5×5 screens; no horizontal overflow was observed.

- 2×2: board x=55, y=462, width=280, height=280; smallest cell 128×128px. Hint was 87.8×48px. Vertical page scroll was available to reach the lower controls.
- 3×3: same 280×280px board bounds; smallest cell 84×84px; Hint 87.8×48px.
- 5×5: same 280×280px board bounds; smallest cell 48.8×48.8px. The page needed vertical scrolling (document height 1195px); the board and hint remained reachable. [5×5 layout screenshot](screenshots/mobile-challenge-5x5-targets.png).
- Held-fact Next picture measured 161.75×48px at x=114.125, y=692, within the 844px viewport; the completed scene page did not require horizontal scrolling.

The smallest measured active target clears 48px. The 5×5 page is taller than the viewport, but vertical scrolling reaches controls and no clipping or overlap blocked completion.

## Replay boundary evidence and correction of prior observation

A separate fresh profile completed all four Starter pictures in one uninterrupted same-band run. The final held scene was Moon Camp. I immediately chose the visible “Replay pictures” control on that same chapter; the first replay scene was River Valley, so the just-completed Moon Camp did not repeat at the boundary. Preserve the pair: [held Moon Camp](screenshots/fresh-same-band-held-moon-camp.png) and [first replay River Valley](screenshots/fresh-same-band-first-replay-river-valley.png).

An earlier first-run screenshot/snapshot was incorrectly reported as a replay-boundary failure: Dino Park Picnic appeared after the first Starter sequence. That replay followed completions in other chapters, so it was not a same-band immediate-boundary comparison. The snapshot is retained as [withdrawn observation](withdrawn-cross-chapter-replay-observation.yml) to make the correction auditable. A second suspected Challenge repeat had the same cross-chapter context problem. After fresh exact same-band repro, **no actual c478 replay-boundary defect is confirmed**; this is not a recovery-after-repair claim because the c478 runtime was unchanged. The separate 295 replay repair lineage remains as previously reported and is not inferred from this c478 observation.

## Retained lineage and limits

The earlier 3cdf full gameplay matrix, f72 mobile/editorial report, and 5207 crop work remain historical evidence under their own identities. The earlier c478 report documents the frozen-source comparison: c478 changes to Puzzle gameplay were limited to completed-scene queue rotation and last-completed-scene persistence in `PuzzlePlay.jsx` and `puzzlePopBatch2.js`; board layout, input mechanics, art, and scene facts did not change. This new fresh 24-board matrix and six pure-keyboard full-board runs provide the current c478 progression and keyboard evidence, while old wrong-placement and sibling-profile evidence remains attributed to its historical runs. This run did not deliberately submit a wrong placement and did not independently re-test Askia/sibling isolation.

The canonical source still uses **Dino Park Picnic**, which the earlier finite art review found unsupported by the scene. Root’s local `2084095` change to **Dino Park** is not deployed or independently tested here; it also requires three newly packaged narration lines. No human listening or narration-quality review occurred. The guarded run makes no paid/provider call and does not establish packaged clip readiness.

## Acceptance state

This report closes the previously missing c478 current-progression and all-band keyboard observations listed in the earlier report. It does not award or update any 4.5 rubric score. The title correction/new clip gate and mandatory human listening/audio-quality gate remain open, so Puzzle Pop is not accepted at 4.5 and no production acceptance claim is made.
