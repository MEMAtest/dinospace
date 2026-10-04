# Independent QA: Batch 7 teaching and Memory transition candidate 5369

Date: 2026-10-04

Candidate: `http://127.0.0.1:5369/`

Runtime source: `b6976948cf61147491e3658a5ce2e249a91bca09`

Build/served identity: [candidate identity](../batch7-teaching-navigation-repair-20261004/identity.json), with [served-file hashes](../batch7-teaching-navigation-repair-20261004/served-assets-sha256.txt); builder recorded 5,694/5,694 HTTP 200 and SHA-256 matches.

This is an independent UI delta for the revised Solar System Discovery 6 copy and Memory Match level transition. It is local-candidate evidence only; it is not a full Solar, Memory, narration, human-listening, production, or 4.5 acceptance.

## Isolation and diagnostics

Used fresh Playwright sessions at 1280×800 and 390×844. Each began at `about:blank`; `/api/voice` and `/api/story` were routed to HTTP 403 and the active routes were checked before navigating to the frozen candidate. Each profile chose Amari through the welcome screen and was muted using the visible sound control. No progress, answer, or profile state was seeded, no hidden answers were inspected, and no provider or generated-story call was made.

Both sessions reported zero console errors and warnings. Network summaries showed only static requests (27 desktop, 13 mobile omitted from the CLI summaries); there was no non-static request output. Routes remained guarded. I did not activate Solar's Listen button or make any audio/listening claim.

## Revised Solar System discoveries

In each fresh profile I navigated through Explore & Languages → Solar System, selected each planet in the visible planet strip, then selected its visible Discovery 6 card. The cards were available on first visit while the discovery passport started at 0/54. Only the four revised cards were opened; the displayed passport then reached 4/54.

| World | Rendered Discovery 6 copy | Visible on mobile |
| --- | --- | --- |
| Earth | “Earth acts like a giant magnet. Its invisible magnetic field turns many tiny bits from the Sun away from Earth. The space around Earth that the field controls is called the magnetosphere.” | Yes; full text is readable in the selected card. “Magnetic field” and “magnetosphere” are technical terms; the copy explains the latter as the space the field controls. |
| Saturn | “Titan is one of Saturn’s moons. It is so cold that methane, a gas on Earth, falls there as rain and fills lakes.” | Yes; full text fits in the discovery card. The moon-to-planet relationship and methane-as-rain fact are stated together. |
| Neptune | “Triton is a moon of Neptune. It goes around Neptune in the direction opposite to the way Neptune spins.” | Yes; full text fits. The unusual orbit is related directly to Neptune’s spin. |
| Pluto | “Charon is Pluto’s largest moon. Pluto and Charon travel around one point between them. This point is their shared centre of gravity.” | Yes; full text fits. The phrase “shared centre of gravity” is paired with the simpler explanation that both travel around one point between them. |

The desktop and mobile screenshots show the selected planet, highlighted Fact 6, and rendered fact in the “Did you know?” panel. Nothing was clipped in these four cards. No child-comprehension test was run, and visibility alone does not establish spoken comprehension.

Evidence: [Earth desktop](desktop-earth-level6.png), [Saturn desktop](desktop-saturn-level6.png), [Neptune desktop](desktop-neptune-level6.png), [Pluto desktop](desktop-pluto-level6.png); [Earth mobile](mobile-earth-level6.png), [Saturn mobile](mobile-saturn-level6.png), [Neptune mobile](mobile-neptune-level6.png), [Pluto mobile](mobile-pluto-level6.png). Matching accessible snapshots are beside each image.

## Memory Match level transition

At desktop, the normal Thinking & Play → Memory Match entry opened Level 1, Forest Friends, with its strategy tip, four pairs and all nine later levels locked. I opened one card through the visible card button and read its accessible name only after the face had turned up. I then completed the board through visible card flips, using the visible names only after each flip. The rendered completion panel showed 4/4 pairs, 8 moves, a 1/10 board sticker, and an enabled `Next level: Ocean Splash` button. Activating that control entered Level 2 with 0 pairs, reset statistics, the Ocean Splash title, and its strategy tip. Immediately after the transition `scrollY` was 0; the title box was at y=18–97.6 and the tip at y=115.6–219.6 in the 800px viewport.

The same flow was repeated in the 390px session. The visible board had four pairs; ordinary visible flips completed it in 6 moves and revealed the enabled Next level control. On Next, Level 2 and its tip appeared at the top without horizontal overflow: `scrollY=0`, title y=10–69.1, tip y=81.1–166.6, document width 390px. The level counter showed 2/10 selected, Levels 3–10 remained locked, and the passport showed 1/10 stickers collected. After a normal reload, Level 2 remained selected and the 1/10 passport remained; the header and tip were still in view. The tip returned to the generic row-scan wording on reload rather than the more specific “recalling both places” variant shown immediately after the efficient completion. That is the observed copy state; it did not hide the heading or tip.

After the mobile Amari run, I used the visible player chooser to switch to Askia and opened Askia’s Memory Match. Askia showed the separate “Meet the Friends” Board 1 of 5 with 0/3 pairs, rather than Amari’s Level 2 board. This is a narrow ordinary-profile isolation spot check, not a full cross-game/profile-isolation audit.

Evidence: [desktop Level 1 entry](desktop-memory-level1-start.png), [desktop completion](desktop-memory-level1-complete.png), [desktop Level 2 after Next](desktop-memory-level2-after-next.png) and [snapshot](desktop-memory-level2-after-next.yml); [mobile Level 1 entry](mobile-memory-level1-start.png), [mobile completion](mobile-memory-level1-complete.png), [mobile Level 2 after Next](mobile-memory-level2-after-next.png) and [snapshot](mobile-memory-level2-after-next.yml), [mobile Level 2 after reload](mobile-memory-after-reload.png) and [snapshot](mobile-memory-after-reload.yml); [Askia board after visible profile switch](askia-memory-isolation.png) and [snapshot](askia-memory-isolation.yml). Numeric transition measurements are in [memory-transition-measurements.json](memory-transition-measurements.json).

## Result and limits

The four revised Solar facts were visible on first use at both tested widths. On the memory transition, Next level changed the board, title, tip, counters and locks, brought the header/tip into the viewport at both widths, and preserved the current level and earned board sticker after mobile reload. No layout or console defect was observed in this bounded check.

The candidate’s narration readiness report lists the four revised Discovery 6 clips as unready. This test left sound muted and did not test native playback, generated speech, or human listening. Packaged narration and listening therefore remain separate gates; no claim of audio acceptance is made.
