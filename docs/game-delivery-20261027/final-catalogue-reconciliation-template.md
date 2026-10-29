# Final catalogue reconciliation template

Read-only source/evidence inventory prepared 2026-10-29 from `queue.json`,
`src/data/learningWorlds.js`, `src/components/home/LittleHome.jsx`, and
`src/gameCatalog.jsx`. This is a template, not a new acceptance report. Fill
the final-run columns only from exact-source evidence. Do not add scores.

## Existing queue state

- Pairs 1–11 are marked `live_verified` in `queue.json`. Their evidence README
  paths exist. Pair production reports exist for Pairs 6–11; Pairs 1–5 retain
  public evidence in their pair reports/source gates without a queue-level
  `production` field. Pair 6 and Pair 11 likewise omit a queue-level
  `sourceGates` field while their listed release evidence remains present.
- These pairs cover 21 unique Amari catalogue IDs. `chess` appears in Pair 2
  and Pair 9: Pair 2 covers Chess lessons; Pair 9 adds the playable computer
  match. Count the catalogue ID once, keep both mode-specific references.
- Fourteen retained scopes remain under `retainedReleasedScopes`; their prior
  source-bound evidence is retained, but the queue calls for a final
  integration regression. The current Trace/Cosmic full layout matrix belongs
  to that final regression and must be reported separately from their older
  functional release evidence.
- Pair 8's queue note about historical personal-story recovery remains outside
  game acceptance. Pair 11's Fact Finder report documents the new curated
  library feature, not historical family-book recovery.

## Amari normal catalogue: 35 unique IDs

The five normal Amari world arrays contain 35 unique IDs (6 + 8 + 6 + 7 + 8).
Prior evidence references below are source-history pointers only; they do not
pre-fill final integration status.

| World | Game ID | Current title | Prior pair/evidence | Final native | Final production |
|---|---|---|---|---|---|
| Read & Write | `letters` | Letter Launch | Pair 11 — `letters-factfinder-20261029/README.md` | pending | pending |
| Read & Write | `phonics` | Sound Safari | Retained — `safari-colour-20261025/README.md` | pending | pending |
| Read & Write | `words` | Spelling Studio | Pair 8 — `books-spelling-20261029/README.md` | pending | pending |
| Read & Write | `trace` | Letter Trace | Retained — `trace-tactics-20261025/README.md`; final fit matrix in progress | pending | pending |
| Read & Write | `hangman` | Dino Hangman | Pair 7 — `dino-pair-20261029/README.md` | pending | pending |
| Read & Write | `storybooks` | Storybook Studio | Pair 8 — `books-spelling-20261029/README.md` | pending | pending |
| Maths Missions | `counting` | Count the Stars | Retained — `three-maths-20261023/README.md` | pending | pending |
| Maths Missions | `fuelup` | Fuel Up | Pair 5 — `rocket-fuel-20261028/README.md` | pending | pending |
| Maths Missions | `firerescue` | Fire Truck Rescue | Pair 6 — `rescue-pair-20261028/README.md` | pending | pending |
| Maths Missions | `addition` | Addition Adventure | Retained — `three-maths-20261023/README.md` | pending | pending |
| Maths Missions | `subtraction` | Subtraction Station | Retained — `three-maths-20261023/README.md` | pending | pending |
| Maths Missions | `math` | Monster Math | Retained — `batch2-uplift-20261022/README.md` | pending | pending |
| Maths Missions | `numberline` | Number Line Jump | Retained — `time-numberline-20261024/README.md` | pending | pending |
| Maths Missions | `timeteller` | Time Teller | Retained — `time-numberline-20261024/README.md` | pending | pending |
| Explore & Languages | `solar` | Solar System | Pair 4 — `solar-memory-20261028/README.md` | pending | pending |
| Explore & Languages | `astronaut` | Astronaut Academy | Pair 2 — `astronaut-chess-20261028/README.md` | pending | pending |
| Explore & Languages | `dino` | Dino Detective | Pair 7 — `dino-pair-20261029/README.md` | pending | pending |
| Explore & Languages | `german` | German Garage | Pair 10 — `curriculum-german-20261029/README.md` | pending | pending |
| Explore & Languages | `worldmap` | Curriculum Quest | Pair 10 — `curriculum-german-20261029/README.md` | pending | pending |
| Explore & Languages | `factfinder` | Fact Finder | Pair 11 — `letters-factfinder-20261029/README.md`; new curated feature | pending | pending |
| Creative Lab | `codecadets` | Code Cadets | Pair 3 — `code-writing-20261028/README.md` | pending | pending |
| Creative Lab | `writingdesk` | My Writing Desk | Pair 3 — `code-writing-20261028/README.md` | pending | pending |
| Creative Lab | `rocketbuilder` | Rocket Builder | Pair 5 — `rocket-fuel-20261028/README.md` | pending | pending |
| Creative Lab | `dinojigsaw` | Dino Jigsaw | Pair 9 — `chess-jigsaw-20261029/README.md` | pending | pending |
| Creative Lab | `jet` | Sky Shapes | Retained — `batch2-uplift-20261022/README.md` | pending | pending |
| Creative Lab | `colormix` | Colour Mixing Lab | Retained — `safari-colour-20261025/README.md` | pending | pending |
| Creative Lab | `puzzle` | Puzzle Pop | Retained — `batch2-uplift-20261022/README.md` | pending | pending |
| Thinking & Play | `memory` | Memory Match | Pair 4 — `solar-memory-20261028/README.md` | pending | pending |
| Thinking & Play | `shadowmatch` | Shadow Match | Retained — `shadow-progression-20261023/README.md` | pending | pending |
| Thinking & Play | `ladder` | Ladder Rescue | Pair 6 — `rescue-pair-20261028/README.md` | pending | pending |
| Thinking & Play | `pattern` | Pattern Parade | Pair 1 — `odd-pattern-20261027/README.md` | pending | pending |
| Thinking & Play | `oddoneout` | Odd One Out | Pair 1 — `odd-pattern-20261027/README.md` | pending | pending |
| Thinking & Play | `chess` | Chess Explorers / play against the computer | Pair 2 lessons and Pair 9 full game — `astronaut-chess-20261028/README.md`, `chess-jigsaw-20261029/README.md` | pending | pending |
| Thinking & Play | `spot` | Spot the Difference | Retained — `batch2-uplift-20261022/README.md` | pending | pending |
| Thinking & Play | `tictactoe` | Cosmic Tic-Tac-Toe | Retained — `trace-tactics-20261025/README.md`; final fit matrix in progress | pending | pending |

## Askia normal home: 10 source-visible routes

`LittleHome.jsx` defines 10 unique game buttons across four worlds, consistent
with `LITTLE_EXPLORER_GAME_IDS`. Eight are the Askia intersection with newly
upgraded Pair 1–11 games; two are retained full-release routes. This distinction
reconciles the requested eight upgraded Askia routes with the ten actual normal
home routes. No hidden route is included.

| Askia world | Game ID | Current title | Scope/evidence | Final native | Final production |
|---|---|---|---|---|---|
| Dino World | `dinojigsaw` | Dino Jigsaw | Pair 9 — `chess-jigsaw-20261029/README.md` | pending | pending |
| Dino World | `shadowmatch` | Shadow Match | Retained — `shadow-progression-20261023/README.md` | pending | pending |
| Dino World | `dino` | Dino Detective | Pair 7 — `dino-pair-20261029/README.md` | pending | pending |
| Rocket World | `rocketbuilder` | Rocket Builder | Pair 5 — `rocket-fuel-20261028/README.md` | pending | pending |
| Rocket World | `fuelup` | Fuel Up | Pair 5 — `rocket-fuel-20261028/README.md` | pending | pending |
| Rocket World | `counting` | Count the Stars | Retained — `three-maths-20261023/README.md` | pending | pending |
| Rescue World | `firerescue` | Fire Truck Rescue | Pair 6 — `rescue-pair-20261028/README.md` | pending | pending |
| Rescue World | `ladder` | Ladder Rescue | Pair 6 — `rescue-pair-20261028/README.md` | pending | pending |
| Little Thinkers | `memory` | Memory Match | Pair 4 — `solar-memory-20261028/README.md` | pending | pending |
| Little Thinkers | `pattern` | Pattern Parade | Pair 1 — `odd-pattern-20261027/README.md` | pending | pending |

## Fill these fields from final runs

- Exact source SHA, runtime entry, worker/cache identity, origin, viewport, and
  observed app build identity.
- For each route: actual normal home/world/card path, rendered title, one
  visible authored control or screen, correct parent after Back, and native and
  production report references. Route smoke must not be described as full game
  content acceptance.
- For each Askia route: actual normal world card, Askia identity, route result,
  and protected game/sibling storage hashes. Do not infer Askia behavior from an
  Amari route.
- Global errors/provider attempts, art errors, storage changes and allowed
  keys, final screenshots, artifact size, and exact limitations. Preserve failed
  runs as failures when a later retry passes.
