# Chess native control protocol

Status: harness updated after source-bound 390 px rehearsals; the latest compiled matrix is incomplete. Preserved partial reports include six legal opening cases and a naturally completed Scholar’s Mate; see the dated JSON files for exact entry, retries, and harness-only stop reasons. No native acceptance is claimed by this document.

## Invocation

Root leases the existing retained profile and tab with `scripts/ensure-amari-qa-browser.py --owner <owner>`, then runs one viewport at a time:

```sh
PAIR9_BROWSER_OWNER=<exact-active-owner> python3 docs/qa-evidence/chess-jigsaw-20261029/run-chess-native.py http://127.0.0.1:5180 390 native
PAIR9_BROWSER_OWNER=<exact-active-owner> python3 docs/qa-evidence/chess-jigsaw-20261029/run-chess-native.py http://127.0.0.1:5180 1440 native
```

For public runs, pass the canonical origin, `production`, and `PAIR9_EXPECTED_ENTRY` set to the verified compiled module basename. The runner checks the current lease owner and compiled module in `dist/index.html`, uses the existing `amari-targeted-contained` Playwright session, and refuses to replace prior evidence files. It does not launch a browser, create a tab/context/profile, reset storage, or seed app state.

## Actual UI coverage

- The script derives its move plan offline from the shipped chess adapter and AI. In the app it uses the normal `Age 6+` Amari chooser when shown, navigates from Amari’s visible `Thinking & Play` world to `Chess Explorers`, selects the full game, and performs moves using visible board-square controls. World and catalogue cards may be deliberately scrolled into view before their center-hit measurement.
- At each viewport it plays short real openings for Beginner, Growing, and Challenge with White and Black. A Challenge/Black sample leaves while the computer is thinking, returns through the normal parent route, waits, and checks the saved board for a stale AI move.
- The Beginner/White line exercises an illegal e2–e5 attempt, keyboard selection/destination input, board/piece geometry, save/reload/resume, canceled New Game, and Undo of the player/computer turn. Beginner/Black exercises Undo while retaining the computer’s opening move. If the app reopens directly on a saved board, the harness uses the visible New Game confirmation and “Keep saved game” action to reach setup before replacing it through the normal confirmed flow.
- A full normal-start Beginner Scholar’s Mate is played on the visible board. The harness observes the final checkmate position/status while it remains held, verifies saved completion and the one-per-difficulty parent claim, uses Finish and Review final board, then replays the line to check zero reward farming. On a first positive Beginner reward it attempts a one-operation parent-storage failure and checks the held retry path. The held board currently exposes that action as “Retry save”; the setup summary can expose “Retry reward confirmation.” If the retained storage wrapper cannot arm that fault, the report records a coverage limitation and is marked non-passing; an ordinary positive claim is never described as Retry coverage.
- A one-operation local storage write failure on the first legal move and a committed-write/readback failure on the next human move verify board retention and same-action Retry. The harness checks the lesson record, all other storage hashes, and the expected chess/reward key allowlist.

## Boundaries and retained evidence

The harness reads only rendered square labels, visible move/status text, visible saved move lists, and saved records to verify positions. It never writes FEN, moves, answers, rewards, or progress into app storage; it does not use hidden component state. The offline plan is generated from standard chess start positions and actual pure AI decisions. Exact computer positions are expected only for Beginner, whose opening choice is deterministic. Growing and Challenge can choose a different legal move when their wall-clock search completes at a different time; those runs compare the rendered board with the app’s saved FEN and capture the actual move list/history. `validate-chess-native-report.mjs` replays those actual saved moves through the chess rules adapter and confirms the resulting FEN. Rare-rule engine fixtures remain source tests, not played native matches. The full UI matrix does not claim that every promotion, castling, en-passant, draw, or terminal path was naturally played.

The browser guard blocks provider/API destinations and records provider attempts, failed requests/responses, page errors, and console errors. The page must expose `window.__amariQaNamespaced === true` and the expected module entry before any game interaction. One screenshot is retained only on harness failure. JSON rows include the exact origin, viewport, entry, baseline/protected storage hashes, completed opening cases, and partial progress on failure.

Reward-token compatibility: current Chess claims use `dino:chess:<match-id>` so an older open reward decoder retains them. Legacy pre-release `chess:<match-id>` keys are treated as the same Chess claim when checking preservation and unique-claim counts. Both forms are excluded from the other-game claim comparison; game attribution/counts remain under `chess`.

Run separately at 390×740 and 1440×844. Never relax primary-square/control geometry or retry assertions to compensate for an app defect; retain the failing report and stop for source review.
