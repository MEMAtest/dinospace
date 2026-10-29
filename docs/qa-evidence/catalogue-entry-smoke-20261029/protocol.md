# Pair 1–11 catalogue entry and return smoke

This is a bounded route/art/error smoke only. It does not replay any previously accepted gameplay matrix and does not claim full game acceptance. The callback uses the already leased caller page, normal profile selection and ordinary catalogue controls. It does not navigate with `goto`, create browser state, write application storage, seed progress or inject answers.

## Exact catalogue scope

The five ordinary Amari worlds contain 35 unique game IDs. This callback checks all 35 normal catalogue entries: 21 unique Pair 1–11 activities plus the 14 retained integration lanes. It is route/art/error smoke only and does not repeat or replace each game's full functional acceptance. Chess appears once although it was upgraded in more than one pair.

| Pair | ID | Amari title | Normal Amari world |
|---:|---|---|---|
| 1 | `oddoneout` | Odd One Out | Thinking & Play |
| 1 | `pattern` | Pattern Parade | Thinking & Play |
| 2 | `astronaut` | Astronaut Academy | Explore & Languages |
| 2 | `chess` | Chess Explorers | Thinking & Play |
| 3 | `codecadets` | Code Cadets | Creative Lab |
| 3 | `writingdesk` | My Writing Desk | Creative Lab |
| 4 | `solar` | Solar System | Explore & Languages |
| 4 | `memory` | Memory Match | Thinking & Play |
| 5 | `rocketbuilder` | Rocket Builder | Creative Lab |
| 5 | `fuelup` | Fuel Up | Maths Missions |
| 6 | `firerescue` | Fire Truck Rescue | Maths Missions |
| 6 | `ladder` | Ladder Rescue | Thinking & Play |
| 7 | `dino` | Dino Detective | Explore & Languages |
| 7 | `hangman` | Dino Hangman | Read & Write |
| 8 | `storybooks` | Storybook Studio | Read & Write |
| 8 | `words` | Spelling Studio | Read & Write |
| 9 | `dinojigsaw` | Dino Jigsaw | Creative Lab |
| 10 | `worldmap` | Curriculum Quest | Explore & Languages |
| 10 | `german` | German Garage | Explore & Languages |
| 11 | `letters` | Letter Launch | Read & Write |
| 11 | `factfinder` | Fact Finder | Explore & Languages |

The other 14 Amari IDs are the retained integration lanes, included here for route-level entry/return only:

| World | Game ID | Current title |
|---|---|---|
| Read & Write | `trace` | Letter Trace |
| Read & Write | `phonics` | Sound Safari |
| Maths Missions | `counting` | Count the Stars |
| Maths Missions | `addition` | Addition Adventure |
| Maths Missions | `subtraction` | Subtraction Station |
| Maths Missions | `math` | Monster Math |
| Maths Missions | `numberline` | Number Line Jump |
| Maths Missions | `timeteller` | Time Teller |
| Creative Lab | `jet` | Sky Shapes |
| Creative Lab | `colormix` | Colour Mixing Lab |
| Creative Lab | `puzzle` | Puzzle Pop |
| Thinking & Play | `shadowmatch` | Shadow Match |
| Thinking & Play | `spot` | Spot the Difference |
| Thinking & Play | `tictactoe` | Cosmic Tic-Tac-Toe |

Askia's actual normal LittleHome menu exposes 10 routes across four worlds. Eight intersect the newly upgraded Pair 1–11 activities; Count the Stars and Shadow Match are retained routes. All 10 are checked through their normal home cards; no hidden route is claimed.

| Askia world | Game ID | Title | Scope |
|---|---|---|---|
| Dino World | `dinojigsaw` | Dino Jigsaw | Pair 9 |
| Dino World | `shadowmatch` | Shadow Match | Retained |
| Dino World | `dino` | Dino Detective | Pair 7 |
| Rocket World | `rocketbuilder` | Rocket Builder | Pair 5 |
| Rocket World | `fuelup` | Fuel Up | Pair 5 |
| Rocket World | `counting` | Count the Stars | Retained |
| Rescue World | `firerescue` | Fire Truck Rescue | Pair 6 |
| Rescue World | `ladder` | Ladder Rescue | Pair 6 |
| Little Thinkers | `memory` | Memory Match | Pair 4 |
| Little Thinkers | `pattern` | Pattern Parade | Pair 1 |

The 14 separately retained IDs are `trace`, `tictactoe`, `puzzle`, `spot`, `jet`, `math`, `counting`, `addition`, `subtraction`, `numberline`, `timeteller`, `phonics`, `colormix`, and `shadowmatch`. A current-source inventory check found the union is exactly the 35 ordinary Amari world IDs with no duplicate or missing ID.

## Per-entry checks

- Locate the title in the correct normal parent, scroll only that secondary navigation target into the viewport, and require a complete 44px target with center hit before clicking.
- Confirm the catalogue/parent portrait decodes and has nonzero dimensions; in the mounted activity require a visible, nonempty `main` and no broken visible images. Record the visible heading when the activity provides an `h1`.
- Use the app's visible **Worlds** header for Amari or the game's visible **Go home/Back to home** action for Askia. If the ordinary unsaved-leave dialog appears, measure and choose its explicit parent destination. Confirm return to the exact Amari world or Askia parent section and the game's ordinary card.
- Track page, console, failed-request/response and guarded provider calls. Compare reward/points/game-count/sticker storage before and after every launch/return and require it to remain unchanged. Report other storage changes by key; this route smoke is not a claim that every game's mount-side diagnostics or navigation metadata is write-free.

## Invocation

Root supplies the active lease owner and exact frozen entry. `PLAYER` is `amari` or `askia`; `ORIGIN` is the current local preview or canonical Netlify URL. Supported sizes are 390×740 and 1440×844.

```sh
CATALOGUE_BROWSER_OWNER=<active-owner> CATALOGUE_QA_STAGE=native \
  python3 docs/qa-evidence/catalogue-entry-smoke-20261029/run-catalogue-entry-smoke.py \
  http://127.0.0.1:5180 390 740 amari /assets/arcade-<exact-entry>.js
```

For canonical use `CATALOGUE_QA_STAGE=production`, the Netlify origin, and the exact canonical entry. The wrapper only calls `playwright_cli.sh ... run-code` on the existing leased session; it does not open, launch, or create a browser, page, context or profile. Reports are compact JSON; no screenshots or videos are collected.

The runner keeps `sourceHead` as the current checkout HEAD. `expectedRuntime` and `runtimeSource` are stage-bound separately: native reports bind to that HEAD; production reports bind to `docs/game-quality-status.json#canonicalRelease`. `expectedEntry` is the caller's exact bundle path, `actualEntry` is what the page served, and `entryMatches` records the comparison. This records the release expectation without turning a route smoke into a full runtime acceptance claim.
