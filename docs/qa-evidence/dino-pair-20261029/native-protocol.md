# Detective native matrix protocol

This is the reusable actual-control runner for the compiled Dino Detective
candidate. It has **not** been run by its author. Root owns the retained browser
lease, compiled build, and final native/public acceptance. The initial compiled
Amari 390×740 probe found the held-result action below the viewport; that unique
failure remains in `first-amari-dino-geometry.json` and
`first-amari-dino-found-390.jpg`. The component has since been changed to use a
compact held-facts panel; root must bind and recheck that change on its candidate.

## Invocation

After the browser owner has leased the existing retained profile and built the
candidate, run these eight bounded journeys from the canonical checkout. The
runner reads the exact compiled `arcade-*.js` entry from `dist/index.html`,
binds the report and screenshots to that entry, and refuses to overwrite an
existing report.

```sh
python3 docs/qa-evidence/dino-pair-20261029/run-native-matrix.py ORIGIN amari 390 740
python3 docs/qa-evidence/dino-pair-20261029/run-native-matrix.py ORIGIN amari 1440 844
python3 docs/qa-evidence/dino-pair-20261029/run-native-matrix.py ORIGIN askia 390 740
python3 docs/qa-evidence/dino-pair-20261029/run-native-matrix.py ORIGIN askia 1440 844
```

These commands use the default `PAIR7_QA_STAGE=native`. To collect the same
matrix from the canonical production origin, set `PAIR7_QA_STAGE=production`;
that changes report/screenshot names and still requires the served entry to
match the currently built candidate.

Each command runs the full route-defined list (all 12 Amari worlds or all five
Askia levels). For a focused continuation or diagnostic, append a comma-separated
list of actual world/level indexes, zero-based. A report records the selected
indexes through its completed rows; partial failures are preserved with the
exact compiled entry, stack, and rows already completed. The four commands
above are run once per child/viewport; do not repeat a whole journey to repair a
harness assertion without first preserving its failure evidence.

## Evidence captured

- Both parent routes and exact parent return are checked, with the actual leave
  branch recorded. The script uses the existing page's `goto` only and asserts
  the retained QA storage namespace after every navigation. It creates no
  browser, tab, context, profile, or synthetic progress state.
- Before the Amari journey baseline, it snapshots the preserved positive
  world-0 completion receipt and confirms its reward claim is pending. After
  navigating to the new candidate's world map, it verifies quiet recovery of
  exactly that token, expected point/play delta, unchanged world progress, and
  no repeated award after settling.
- Amari answers come from rendered trail geometry or the rendered Challenge
  spatial clue and visible cover labels. Askia answers come from rendered
  footprint geometry and visible spot buttons. Wrong choices use another
  visible choice; answers, unlocks, and progress are never injected.
- Wrong retry, held facts/result, manual Next/Finish, viewport bounds before
  each primary action, unique Amari positions, and each authored world/level
  count are recorded. The runner checks that progress/rewards remain unchanged
  before an explicit Finish.
- Amari snapshots all five covers, the Challenge baseline spatial clue, and
  Hear instructions / Read clue / Show clue control rectangles before any
  answer or optional-help click, then snapshots them again after each clue
  stage. The snapshots are taken without scrolling; every required rectangle
  must be inside the viewport.
- A one-shot browser-storage method wrapper simulates bounded write/readback
  failures on existing UI actions. It restores the original methods in a
  `finally` path. The reports compare durable values before, during, and after
  Retry/reopen. This tests failure handling and does not set saved records.
- The script records actual packaged audio media events, tests mute pause/end
  and requires a pause event after normal UI leave, watches API/provider
  requests, failed resources, page/console errors,
  image decode, and horizontal overflow. This proves technical playback only;
  it does not score audio quality or human listening.
- Baseline and final snapshots compare the sibling child's data, non-Dino
  Little-game rows, non-Dino reward claims, and non-Dino play counts.
- Askia expected reward deltas are calculated from the existing saved record,
  including its permanent legacy reward ceiling. Each level row records the
  prior per-level best, legacy ceiling, applied reward baseline, and expected
  delta; the harness does not create a synthetic legacy or fresh-player row.

The script adds a 10-second wait before leaving a started but unfinished round
to exercise the app's actual confirmation threshold. This is intentionally
separate from scored world/level rows. Extra map scrolling is used only to reach
the authored mission menu; answers and primary action measurements are taken
before any Playwright click can auto-scroll them into view.

## Report interpretation

`levelRunCount` and `completedLevelRuns` count only completed normal-UI world or
level runs. `primaryFinds` counts completed rounds. `rows` also includes
baseline, audio/leave diagnostics, and before-autoscroll action measurements;
those are not extra completions. `recovery` identifies each failure/reopen
path. A `passed: false` report is retained evidence, never an acceptance.

Keep all reports and representative/failure screenshots under the evidence
folder's revised12MiB budget (see evidence-compaction.json for the one public-patch exception). Retain unique failures; keep one representative final
render per route/viewport. Source tests, HTTP status, the initial failed layout
probe, and this runner alone do not establish compiled or public acceptance.
