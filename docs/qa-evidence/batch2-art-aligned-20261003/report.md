# Independent Puzzle Pop art-alignment delta and three-game score review

## Candidate identity and scope

This report applies to the frozen local candidate served at `http://127.0.0.1:5207`, source `037914f48e5198ca97c03668baa1d0d2dbf40369`, JavaScript bundle `index-BSWKtpbm.js` SHA-256 `31b725a9caf8f216466d79e57097606e8530b0928d372ae7862fabd86414e100`, and CSS bundle `index-D3NTSs-Z.css` SHA-256 `008707f972ebe009fcbfcf5aa50207cc0c8a381f3f4e89fa1d22194374a681db`. See [candidate identity](../batch2-art-aligned-candidate-identity-20261003.json).

I used the existing isolated desktop 1280×800 and mobile 390×844 profiles with normally earned band unlocks. I installed `page.route` abort handlers for `**/api/voice**` and `**/api/story**` immediately before reloading the candidate into each profile, then turned sound off in the UI. Puzzle entry, hints, placements, chapter selection, completion, Next, and leave confirmation used visible controls. No answer, seed, unlock, or progress was injected; no source files were changed and no paid/provider call was made.

This is a targeted art-and-crop delta, not a new 24-row run. The retained full baseline remains tied to `d31239453edf438b5a88ab788db942f2dae76fea`; the released narrow mechanics repairs remain tied to `6b84554e7a1d21b3db658d213a2298462c78599e`. The previous 5205 and 5207 reports remain unchanged and retain their original failures under those identities. The current delta checks only the four art/fact bindings changed by `037914f` at both widths.

The browser `route-list` command reports `No active routes` because it does not display the `page.route` handlers registered inside the Playwright page. The saved static request inventories contain no `/api/voice` or `/api/story` requests; the changed bundle and four art assets returned HTTP 200. Both console inventories report zero messages, errors, and warnings. These are the actual inventories, not a claim that the route-list output enumerated page handlers. Sound stayed off throughout.

## Observed Puzzle Pop delta

| Scene | Viewports and ordinary UI | Rendered evidence | Result |
|---|---|---|---|
| Robin’s Tree, 2×2 | Desktop and mobile; hinted piece placed, both boards completed | `robin-tree-3d-C6X3IbOn.webp`, 1254×1254; preview, tray and board load the same URL with `object-fit: cover`; title and accessible preview alt identify the robin/woodland | Both widths completed. One fact appeared: “Robins use their beaks to find small insects and worms in the soil.” |
| Treehouse Robots, 3×3 | Desktop and mobile; normal shuffled chapter progression, hinted placement, both boards completed | `treehouse-robots-3d-s6y8m7qr.webp`, 1254×1254; astronaut, robot, arrow steps and treehouse workshop agree with the title and alt; preview and pieces use the same source and cover crop | Both widths completed. One fact appeared: “A clear set of steps helps a robot know what to do next.” |
| World Explorer, 5×5 | Desktop and mobile; normal Challenge chapter replay, hinted placements, both boards completed | `world-explorer-map-3d-BiOIYdoV.webp`, 1254×1254; map, globe and explorer tools agree with title/alt; preview and pieces share the same square crop | Both widths completed. One fact appeared: “Maps use symbols and pictures to help us understand places.” |
| Nature Lab, 5×5 | Desktop: one ordinary hinted placement. Mobile: hinted placements and full completion | `nature-lab-leaves-3d-DDByeZD_.webp`, 1254×1254; visible plants, leaf samples and sunny workbench agree with title/alt/fact; preview and pieces share the same square crop | Mobile completion showed the aligned fact once: “Leaves can have different shapes, but they all help plants use sunlight.” Desktop hint targeted a matching tile and space. |

For the sampled scenes, the preview and the segmented tray/board expose matching landmarks at both widths; no stretching or crop mismatch was visible. The same scene image URL is used for preview and piece images. Completed scenes held one factual sentence on the completion panel alongside an explicit Next control. Puzzle chapters and earned completion state remained available after candidate reload.

At 390px, the 5×5 board targets measured 48.80×48.80 CSS pixels and tray targets 50.66×50.66px. At desktop, 5×5 board targets measured 68.80px and tray targets 49.47px. The mobile 2×2 tray minimum was 48.16px; 3×3 board targets measured 84px. The mobile Next picture button measured 161.75×48px; leave-confirmation controls measured 88.32×88.32px and 73.60×73.60px. Document width equaled viewport width (390 or 1280). All sampled controls met the 48px minimum, though the 5×5 board has only about 0.8px of margin at 390px.

**A remaining mobile polish issue:** the top chapter/status line ellipsizes the picture name at 390px (`Detail Detectives · Picture 3 of 4 · …`). The persistent title directly below, inside the preview card, remains fully visible as “Nature Lab”; the scene is identifiable, but the active header is not complete. The observed ellipsis belongs to this 037914f candidate and is preserved here even if a later source fixes it.

The 5207 mismatch—Nature Lab showing animal cutouts while its title/fact described leaves—is resolved in this candidate’s rendered asset and completion card. The prior 5205 duplicate completion copy and 5207 crop mismatch remain historical failures attached to those source identities; the 037 build’s concise status and shared square crop passed the sampled changed scenes.

### Puzzle Pop provisional dimensions

The estimates below are independent reasons for this candidate, not a score uplift automatically inherited from a passing narrow delta. The average is the arithmetic mean of the five displayed dimensions.

| Age-6 teaching | Progression | Correctness and fair variation | Feedback/audio/visual usability | Reliability/navigation/persistence | Mean | Status |
|---:|---:|---:|---:|---:|---:|---|
| 4.4 | 4.5 | 4.4 | 4.1 | 4.5 | 4.38 | Provisional; below 4.5 and unaccepted |

- **Teaching (4.4):** the three chapter strategies are distinct and practical; Hint repeated the appropriate strategy in the sampled boards. The new image/fact bindings now agree. A short guided demonstration of how one preview landmark maps onto a board space would make the spatial strategy more teachable before a child begins the 5×5 route.
- **Progression (4.5):** the 2×2, 3×3 and 5×5 chapters, ordinary unlocks, replay, and rewards appeared in the earned profile. The wider retained baseline remains the evidence for unchanged scene/replay paths.
- **Correctness/fair variation (4.4):** all four changed asset/fact pairs agree in rendered UI and the hinted piece/space placements were accepted. This delta does not re-audit the other eight scene facts or rerun seed/restart variation; it does not erase the retained baseline’s original scope.
- **Feedback/audio/visual (4.1):** the four 3D scenes now align with their facts and with their piece crops; held facts are shown once. The status-line ellipsis remains at 390px, and the 5×5 board targets sit close to the minimum. Audio was muted, so this dimension cannot be certified by listening.
- **Reliability/navigation/persistence (4.5):** reload preserved earned chapters; hinted placement, completion, Next, and the leave dialog worked. No horizontal overflow or console issue appeared in this sample. Full repair/baseline lineage remains separate from this regression.

## Spot the Difference and Sky Shapes lineage

These two game components are byte-identical between the frozen 5205 review snapshot and the current 037914f source: `SpotDifference.jsx` SHA-256 `92846540bd1bf9afeed8645284f5006e1e36822841985524d243acf967408df6`; `JetSkyShapes.jsx` SHA-256 `08a65b713b0e3b22b85a73dace190d0a5b92fe72c5b2a05fb84c44881f1cfb59`. I did not rerun their UI in this Puzzle-only art delta. Their estimates therefore remain the independent 5205 estimates and are not new observations on this turn.

| Game | Age-6 teaching | Progression | Correctness and fair variation | Feedback/audio/visual usability | Reliability/navigation/persistence | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Spot the Difference | 4.5 | 4.5 | 4.4 | 4.2 | 4.5 | 4.42 |
| Sky Shapes | 4.6 | 4.5 | 4.5 | 4.2 | 4.5 | 4.46 |

### Spot the Difference — product work before a 4.5 reconsideration

The 5205 sampled pair has a clear top/middle/bottom comparison routine, single-fact completion copy, and visible 56px amber hint; the separate 5204 no-find test shows two successive Magnifier uses point to distinct unfinished targets. Keep those behaviors. The earlier 5204 completion screen did duplicate the fossil fact in the status and the fact card; 5205 changed the status to “Your fact is below,” and the sampled fact appeared once. Keep a regression check for that duplication across 3-, 5-, and 7-difference completions at both widths.

The remaining visible product improvement is in challenge difficulty: the retained sample uses large, high-contrast symbol swaps that are quickly found. Make 7-change scenes use a mix of scene-integrated details and small-but-clear differences, then verify each pair contains exactly seven defensible changes and that the 56px hint cue remains visible against both light and dark artwork. The provisional feedback/visual dimension is 4.2; human listening and canonical production evidence are separate open gates, not substitutes for this visual refinement.

### Sky Shapes — product work before a 4.5 reconsideration

The 5205 sampled flight has an accurate shape fact, a numbered start point, a red finish marker, readable trace guidance, and an actual completed route. Its route/fact source review and retained baseline remain positive. The active flight repeats overlapping instructions: a chapter goal capsule, “Trace each outline part in order,” and a mission-specific status/tip. Give the active flight one dominant mission-specific action; either remove the repeated capsule during play or make it state a unique chapter objective. Keep start and finish distinguishable with labels/shapes as well as color, and retain strong route contrast on the space background.

The product gap is instruction hierarchy and visual route clarity (feedback/visual dimension 4.2); retain the four meaningful missions per sky and accuracy/save behavior. Re-score the revised copy/contrast with a Starter outline, one multipart Growing route, and one ordered Challenge route at both widths, reusing the retained 12-fact review and baseline. Human listening and canonical production verification remain separate gates.

## Explicit next work and limits

- Keep the title fully visible in the 390px active header; do not rely only on the preview card as a workaround. Recheck 5×5 board controls stay at least 48px after any header/layout adjustment.
- For Puzzle Pop, demonstrate one preview landmark-to-space mapping before or during a 5×5 puzzle, then retest the strategy cue, a hint, and a held fact at both widths. Reuse the retained 24-row baseline; do not imply all 12 images/facts were independently re-reviewed here.
- Preserve Spot’s 5205 single-fact copy and repaired hint distinction; improve Challenge difference subtlety and measure exact target count and visibility.
- Simplify Sky Shapes’ active-flight instruction hierarchy and ensure start/finish cues remain legible beyond color alone.
- The user-reference mock paths previously named were checked and unavailable in this filesystem: `/var/folders/t_/nqjg355s26x2smr80s78_1_r0000gn/T/codex-clipboard-ea0cb788-d9a5-4304-9408-5ec967374329.png` and `/var/folders/t_/nqjg355s26x2smr80s78_1_r0000gn/T/codex-clipboard-1d69d3a4-2e77-43ff-90d0-9a16b562f4de.png`. I did visually inspect the four new Puzzle WebPs and their actual rendered UI, but cannot compare them with those missing mock files.
- Do not infer audible quality from bundled bytes. Human listening, candidate-to-canonical deployment identity, and final production UI/audio deltas remain pending. None of these scores accepts a game at 4.5/5.

## Evidence

- [Desktop Robin’s Tree before, hinted, and completed](desktop-robin-tree-before.png), [mobile Robin’s Tree before and completed](mobile-robin-tree-before.png), (mobile completion: [image](mobile-robin-tree-complete.png)).
- [Desktop Treehouse Robots before and hinted](desktop-treehouse-robots-before.png), [mobile Treehouse Robots before and completed](mobile-treehouse-robots-before.png), (mobile completion: [image](mobile-treehouse-robots-complete.png)).
- [Desktop World Explorer before, hinted, and completed](desktop-world-explorer-before.png); [mobile World Explorer before, hinted, and completed](mobile-world-explorer-before.png).
- [Desktop Nature Lab before and hinted](desktop-nature-lab-before.png); [mobile Nature Lab before and completed](mobile-nature-lab-before.png).
- [Mobile leave-confirmation geometry](mobile-leave-dialog.png).
- Actual UI exports saved using each browser download event’s awaited `download.saveAs`: [desktop diagnostics](desktop-game-log-ui-export.json) and [mobile diagnostics](mobile-game-log-ui-export.json). Requests, route-list output, and console output: [desktop network](desktop-network-inventory.txt), [mobile network](mobile-network-inventory.txt), [desktop console](desktop-console.txt), [mobile console](mobile-console.txt), [desktop CLI route inventory](desktop-route-inventory.txt), [mobile CLI route inventory](mobile-route-inventory.txt).
- Earlier 5205 and 5207 failures and broader retained baseline are documented separately in [the 5205 editorial report](../batch2-editorial-final-20261003/three-games-report.md), [the 5203 improvement plan](../batch2-editorial-candidate-20261003/next-improvements.md), and the roadmap. They remain attributed to their own candidate identities.
