# Batch 3 current-canonical score reconciliation — 4 October 2026

## Scope and decision

This worksheet reconciles the retained Batch 3 browser evidence and the 4 October editorial assessment against canonical source `0d3ef056e569e3ef59763df388f26c3baa7783b8` (the roadmap identifies this as the current release source, deployment `dpl_7wFmajPYqR6CPrTLFksm4dkGzppv`). It is a source/evidence audit, not a new browser run. I spot-checked the retained Count mobile completion, Trace mobile completion, Cosmic desktop board, and Dino mobile fact screenshots alongside their accessible snapshots and reports.

The roadmap has five equally weighted dimensions. The four non-audio dimensions requested here are scored below. **Feedback/audio/visual usability stays unscored**: packaged mappings/bytes, browser playback events, and visible feedback were retained, but no human listening review is recorded. Do not compute an overall mean or claim 4.5 acceptance from these four scores.

| Game and assessed source | Age-6 teaching | Meaningful progression | Correctness and fair variation | Reliability / navigation / persistence | Formal feedback / audio / visual |
|---|---:|---:|---:|---:|---|
| Count the Stars — current canonical | 4.5 | 4.5 | 4.5 | 4.5 | Unscored; human listening pending |
| Letter Trace — current canonical | 4.5 | 4.5 | 4.5 | 4.5 | Unscored; human listening pending |
| Cosmic Tic-Tac-Toe — current canonical | 4.5 | 4.5 | 4.5 | 4.5 | Unscored; human listening pending |
| Dino Detective — current canonical facts | 4.0 | 4.5 | 4.5 | 4.5 | Unscored; human listening pending |
| Dino Detective — local Swamp/Cave copy candidate only | 4.5 | 4.5 | 4.5 | 4.5 | Unscored; two revised clips pending and human listening pending |

The local Dino row carries forward the three non-copy scores because the edit changes two fact strings only; it is not a deployed score. The local copy UI check is complete, but the changed phrases have no matching packaged clips, so this candidate is not releasable.

## Source lineage checked

Canonical `0d3ef056…` is the shared fresh-profile default repair on top of audited archive `94d44d031d5835d0d9fa2128064ff83ba5880a62`. The Batch 3 owned source areas below match byte-for-byte between this checkout and canonical `0d3ef056…`, with one explicit exception: the working tree has the local Swamp/Cave fact edit.

| Area | Canonical/current blob SHA-1 | Finding |
|---|---|---|
| `AmariCountTheStars.jsx` | `fcffc00daff65f6a67d9f3f54edef407e39cfc00` | Identical |
| `AmariLetterTrace.jsx` | `84b7da81809d91196495aaf0cf768f4bf5188267` | Identical |
| `TicTacToe.jsx` (Cosmic) | `6062f2b4d4e4ce62f3f88cb75ea7b26a328def97` | Identical |
| `DinoDetective.jsx` | `84fda1785aad93e9c78ad80765f2b6cb90c92189` | Identical |
| Count data and progress | `4831cfe89fd609ec44873b6fed4990084b5d3615`; `128bf54634e0645a47db0e58cecc2525ebdb759d` | Both identical |
| Trace learning data | `026c69fad57c344c32f260ce15445c8a4cc9b12b` | Identical |
| Cosmic tactic data | `ff05697bd5c34f1184f4815ed6696f3467b16207` | Identical |
| Dino progress data | `e2fe7dde18bc735543f59236268f26b2fdbdc5fb` | Identical |
| Dino world facts | canonical `907097bde5794960e1363ddcd80e8c4aa6234fa2`; local candidate `124ea15e934afde6f4ae68ba00357ff4e333469e` | Only Swamp and Cave fact copy differs |

The local Dino copy blob is the exact blob tested in candidate `e2aee30169f6ade67f7948b0088a895a9cb119c3`. The current `0d3ef056…` production source still contains “land saturated with water” and “dissolve limestone”; it does not contain the local revision.

## Score reasons and retained evidence

### Count the Stars

- **Teaching 4.5:** The board makes each countable item visible, tap-marked, and countable once; the clue does not reveal the total. Held feedback links the chosen number to the visible arrangement. The retained mobile Challenge completion screenshot shows distinct objects and the answer explanation together. The current copy is grammatical, including the one-object prompt verified on production.
- **Progression 4.5:** Star Garden, Constellation Workshop, and Galaxy Survey change range and representation (scattered items, organized groups, then arrays/two-group totals). The completed local matrix covers six rounds in each band at desktop and 390px; the later quota UI delta shows the higher-band range is actually reached. The relevant Count data/progress blobs match canonical.
- **Correctness / variation 4.5:** The retained run checks compare the rendered item count, answer choices, clue and held result. Queue generation is seeded, avoids recent items when eligible, and enforces harder-range quotas. The quota delta addresses the old full-matrix finding that randomized higher bands could stay too easy.
- **Reliability 4.5:** Full local runs exercised unlocks, replay, earned collection, reload, and the visible Amari/Askia switcher. Production deltas exercised retry, clue, held Next, return route, and reload. The evidence is bounded by named identities; it does not claim exhaustive account isolation.

Evidence: [Count/Dino local full matrix](batch3-count-dino-local-20261003/REPORT.md), [Count quota UI delta](batch3-count-quota-ui-20261003/REPORT.md), [canonical production delta](batch3-canonical-production-independent-20261003/report.md), and [Count copy production delta](batch3-copy-keyboard-production-delta-20261003/report.md).

### Letter Trace

- **Teaching 4.5:** Start dots, ordered arrows, stroke-at-a-time directions, and a forgiving-to-precise progression provide usable scaffolding. The later chapters add upper/lowercase transfer and a decodable initial-sound choice restricted to configured taught graphemes. The mobile completion screenshot shows the trace path and percentage clearly; lower actions can require vertical scrolling, which is documented.
- **Progression 4.5:** Three eight-round chapters progress from large uppercase paths to case transfer and then word/sound transfer. Retained full local work covers Challenge and band unlocks; the keyboard route is an alternative input, not a shortcut that counts as handwriting mastery.
- **Correctness / variation 4.5:** Source-bound tests validate path scoring and eligible taught-word pools. The retained Challenge run exercised visible letter/word choices, wrong-choice guidance, and matching feedback. A previous keyboard backtracking/progress issue was repaired; production evidence shows arrow movement updates progress before the stroke is finished.
- **Reliability 4.5:** The retained runs cover progression and reload, a visible keyboard path, pointer completion at 390px, confirmed Leave/Keep playing, and the exact Read & Write return route. Production rechecked the immediate progress update and ordinary navigation. No separate physical-device claim is made.

Evidence: [Trace full Challenge local report](batch3-trace-wordchoice-full-local-20261003/report.md), [Trace keyboard/native narration local delta](batch3-final-package-local-20261003/report.md), [Trace/Cosmic local repair addendum](batch3-trace-cosmic-local-20261003/repair-candidate-addendum.md), and [production copy/keyboard delta](batch3-copy-keyboard-production-delta-20261003/report.md).

### Cosmic Tic-Tac-Toe

- **Teaching 4.5:** The three authored lessons teach one tactic at a time—make a line, block a line, create a fork—with the fork explained as two winning choices next turn. The simple 3×3 grid and highlighted hint target support the explanation. The retained desktop production screenshot shows a readable mission instruction above a clear board; mobile captures retain held success and the hint target.
- **Progression 4.5:** Three tactic chapters contain three boards each. Completion earns/unlocks the next tactic, with free play separate. The retained full local desktop/mobile matrix completed each tactic and replayed a chapter with a new arrangement.
- **Correctness / variation 4.5:** Mission-specific board checks validate winning line, block, and fork conditions; seeded symmetric layouts vary starts. Retained play exercised wrong move/retry, hint target, tactic completion, and legal bot turns without an impossible move.
- **Reliability 4.5:** Chapter return, Keep playing, confirmed exit, completion/reload, and Amari/Askia profile separation were exercised in retained local runs. Production checked wrong/retry/hint/correct, held Next, reload, and the exact Thinking & Play return path at both viewports.

Evidence: [Cosmic local repair addendum](batch3-trace-cosmic-local-20261003/repair-candidate-addendum.md), [production regression report](batch3-canonical-production-independent-20261003/report.md), and [retained production board screenshot](batch3-canonical-production-independent-20261003/screenshots/desktop-cosmic-held-success.png).

### Dino Detective

- **Teaching 4.0 on canonical facts:** The hunt and visible-location clues are concrete, and each find holds target and world facts until Next. Two current canonical facts still use unexplained vocabulary: “saturated” in the wetland fact and “dissolve limestone” in the cave fact. That misses the roadmap’s short, concrete age-six-language bar. The retained mobile screenshot also shows a tall held fact card that needs ordinary vertical scrolling to reach its lower controls; the report confirms no horizontal overflow and that Next becomes reachable by scrolling.
- **Teaching 4.5 on the local copy candidate only:** “A wetland is a place where the ground stays very wet. Some wetlands dry out for part of the year.” explains the term while retaining seasonal drying. “Water can slowly dissolve (wear away) limestone rock and help caves form.” keeps and glosses the science word. The independent 1280×800 and 390×844 copy delta confirms both target/world facts stay held until Next and wrap legibly.
- **Progression 4.5:** Twelve named worlds form three bands, each requiring five finds before a sticker and next unlock. The retained full desktop/mobile matrix completed all worlds and checked replay, map, collection, reload, and parent-world navigation.
- **Correctness / variation 4.5:** The authored source provides distinct target/world facts and five safe numbered covers; clue target and found target agree in retained runs. The full matrix includes wrong covers, retries, clues, repeated taps, and a different-seed replay; the production delta confirms the two facts remain paired with the find.
- **Reliability 4.5:** Normal completion gates stickers; partial searches do not become completions after reload. The retained work checked the twelve-world map, replay, built-in profile separation, confirmed Back/Keep playing, and Explore & Languages return. The copy delta checks the revised holds/Next flow at both viewports.

Evidence: [Dino full local matrix](batch3-count-dino-local-20261003/REPORT.md), [production regression report](batch3-canonical-production-independent-20261003/report.md), [revised fact source note](batch3-dino-fact-language-20261004.md), and [independent rendered copy delta](batch3-dino-fact-ui-20261004/report.md).

## Reconciled stale statements and remaining work

- The earlier configured-preview report's singular “How many planet did you count?” observation is superseded by the promoted Count copy repair. The later production delta observed “How many planets did you count?” and the correct singular result for one planet.
- The old Count baseline's low-range random Growing/Challenge queues are not current behavior. The later quota source/report enforces and renders the required larger totals; current Count data blobs match canonical `0d3ef056…`.
- Letter Trace's old partial-keyboard-progress observation is candidate-specific to the earlier deployment. The `a1eec245…` production delta observed immediate percentage updates after arrow movement, and the component blob matches canonical `0d3ef056…`.
- The 4 October independent assessment's note that a separate reviewer was still checking revised Dino copy is superseded by the completed rendered report. The local copy candidate is visually checked, but its new keys `f6991245` and `0f0204e5` are still unvoiced/unpackaged; readiness is 273/275. The canonical 0d release and its Dino teaching score remain on the old facts.
- The formal combined feedback/audio/visual dimension and final editorial acceptance remain open for all four games until a human listening review and the published common gate are complete. No new defect was reproduced by this source/evidence reconciliation, and it does not fill any of the retained matrix's identity- or viewport-specific limits.
