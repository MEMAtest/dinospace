# Batch 6 clean integration: independent browser check

Date: 2026-10-04
Candidate: frozen local integration at `http://127.0.0.1:5371/`
Runtime source: `2a82fd8fd17d9e76ec4310f2fecf489291f5bbff`
Integrated Batch 6 source: `764b2ff49b6c40c13df928b4449d0a1f68fbe660`
Builder identity/report: `docs/qa-evidence/batch6-integration-20261004/identity.json` and `report.md`

## Method and identity

I used independent Playwright contexts at desktop `1280×800` and mobile `390×844`. Each started at `about:blank`; before the first app navigation I installed `**/api/voice**` and `**/api/story**` routes returning HTTP 403 with explicit QA-guard bodies. `route-list` showed both routes before and after `goto` in both contexts. I used the visible sound control to test both settings across reloads; the gameplay checks below were performed muted. All navigation, selection and answers used ordinary visible controls. No progress, seed, answer, or storage injection was used.

Before browsing, I independently hashed the served index and four primary bundles. They matched the frozen identity:

| Asset | SHA-256 | Result |
|---|---|---|
| `/` | `6a9655c72f72cc85056e34a5342676321dd2a3f4b8a162e1720167a70221aaef` | match |
| `/assets/index-Cjc3KINP.js` | `9e9d5148abc1e08c97aee23166aa289ec326401e8e9348021316e30efc07a8ba` | match |
| `/assets/index-Ccs6j6LF.css` | `2411e413823eb43b354026da853a4fae30867a13a409ce0daf59351037e8acbf` | match |
| `/assets/web-a8KSCZyE.js` | `769a92950e1f9543938f6c14f32fc5d3913a0fea1bcccd5d093480bb9bfbf987` | match |
| `/assets/SolarSystem-uGsPnBSq.js` | `2eb9cc4b32af85aadb54bd41e27b4a86f8e5cb295c1c1ed76c903e75136adbe3` | match |

Both sessions reported zero console messages (including errors/warnings) and no failed static requests. Filtered requests showed no `/api/voice` or `/api/story` request. The guard routes remained installed. One packaged MP3 was fetched with HTTP 206 and another with HTTP 200 while the fresh profiles initially had sound enabled and the app was navigating. I did not press Hear or evaluate audible quality. The later game interaction was muted; no narration, listening, or audio-release conclusion is made.

## Independent UI observations

| Area | Desktop | 390px mobile |
|---|---|---|
| Amari Pattern Parade | Thinking & Play card opened `#/play/pattern`; its map showed `Repeat it` available and the next two chapters locked. | Same route and chapter map. Document width stayed 390px. |
| Amari Dino Hangman | Read & Write card opened `#/play/hangman`; map showed `Same word ending` available and `Picture-clue rescue` / `Independent rescue` locked. | Same route and chapter map. Document width stayed 390px. |
| Amari Chess Explorers | Thinking & Play card opened `#/play/chess`; map showed `Piece moves` available and `Safe captures` / `Mini-puzzles` locked. | Same route and chapter map. Document width stayed 390px. |
| Amari Astronaut Academy | Explore & Languages card opened `#/play/astronaut`; map showed `Space science` available and `Mission engineering` / `Review missions` locked. | Same route and chapter map, including the discovery-passport control. Document width stayed 390px. |

The four entries resolve to the integrated three-chapter Amari maps with sequential locks. At desktop and mobile I exercised Pattern Parade through ordinary starter-round UI: a wrong choice left question 1 active and showed a retry message; a correct choice showed a held `Why it works` explanation and enabled `Next pattern`; Next moved to question 2. Back opened the leave confirmation, and `Leave game` returned to the parent `Thinking & Play` world. The mobile held explanation named the visible `ABB` rule and supplied a child-readable definition. Desktop’s sampled question named the `AAB` rule. The mobile document width remained 390px through the map, active round and parent return.

At both sizes the player picker exposed Amari and Askia. Selecting Askia led to the ordinary Askia home and the legacy Pattern Parade flow at `#/play/pattern`: `Level 1 of 3: Two take turns`, a `4 to finish` count and a separate `Play Pattern Parade level 1` control. This differs from Amari’s three-chapter map and current-rule explanation. Askia displayed its own `0 stars` label in the sampled fresh profile. I did not complete an Amari chapter to create a different earned-star count; cross-profile earned-star isolation is therefore supported here by the integrated-source comparison and retained B3 profile-specific baseline, not newly demonstrated by a differential award in this run.

The Amari world entry controls for retained Batch 3 routes were visible: `Count the Stars` in Maths Missions, `Dino Detective` in Explore & Languages, `Letter Trace` in Read & Write, and `Cosmic Tic-Tac-Toe` in Thinking & Play. I opened the Count the Stars route at both viewports; it showed the Star Garden starter map and Growing/Challenge bands locked. The three other B3 cards were confirmed as visible entry cards, not gameplay-tested in this integration delta. Their full gameplay remains covered by the retained Batch 3 baselines.

## Sound preference

The visible home/world/game control supported both directions at both viewports. On desktop I muted, reloaded, and confirmed `Turn sound on`; I then re-enabled sound, reloaded, and confirmed `Turn sound off`. The muted preference also remained visible after route reentry and after switching to Askia. On mobile the same off→reload→on and on→reload→off transitions were repeated. This checks persisted preference UI only. It does not establish that unmuted playback sounds correct.

## Evidence files

Screenshots are in `screenshots/`:

- `amari-pattern-map-desktop.png`, `amari-pattern-map-mobile.png`
- `amari-hangman-map-desktop.png`, `amari-hangman-map-mobile.png`
- `amari-chess-map-desktop.png`, `amari-chess-map-mobile.png`
- `amari-astro-map-desktop.png`, `amari-astro-map-mobile.png`
- `pattern-wrong-desktop.png`, `pattern-held-next-desktop.png`
- `pattern-held-mobile.png` (initial sound-on run), `pattern-held-muted-mobile.png`, `pattern-parent-world-mobile.png`
- `askia-pattern-map-desktop.png`, `askia-pattern-legacy-mobile.png`
- `b3-count-the-stars-map-desktop.png`

The desktop/mobile Playwright CLI snapshots and network/console records were produced in isolated sessions `b6i-desktop` and `b6i-mobile`; the session viewport and routes are stated above. The builder identity reports 5,879/5,879 assets matched. This check independently re-hashed the five listed primary assets, not every one of those 5,879 files.

## Lineage, limits, and conclusion

This is a bounded UI integration delta, not a replacement for retained full mechanics evidence. It reuses the builder’s byte comparison against Batch 6 runtime `764b2ff49b6c40c13df928b4449d0a1f68fbe660`, the separately retained Batch 6 quality-checkout full browser matrix and reliability reports, and these Batch 3 records in this checkout: `docs/qa-evidence/batch3-count-quota-ui-20261003/REPORT.md`, `docs/qa-evidence/batch3-final-package-local-20261003/report.md`, and `docs/qa-evidence/sound-preference-canonical-20261004/report.md`. The candidate is a frozen local build, not a production deployment.

The visible evidence supports that the four Amari routes open their integrated chapter maps, Pattern retry/held-success/Next/parent-return work at both tested sizes, Askia still reaches the legacy Pattern flow, the listed B3 entry cards remain present, and the sound preference survives the tested reloads. The exact differential earned-star separation was not retested, all four Amari games were not played through a full chapter here, and B6 narration is materially incomplete (builder inventory: 1 of 378 phrases ready). There is no human listening evidence or overall 4.5 acceptance from this report.
