# Batch 4 packaged narration source gate

Status: source phrase design, exact inventory, cancellation wiring and read-only file readiness only. No clips were generated and no provider was called. This does not establish native playback, listening quality or release readiness.

## Phrase design

Arithmetic lines are split at meaningful clauses while keeping each number with its object or operation. Examples:

- `Put 2 apples` · `and 3 apples together.` · `How many altogether?`
- `Mia has 4 shells` · `and gets 2 more.` · `How many now?`
- `There are 5 stars.` · `Take away 2.` · `How many are left?`
- `Group A has 7;` · `Group B has 4.` · `How many more are in the larger group?`

Number-line comparisons are spoken as `Compare the journeys.` followed by one complete sentence for each frog's start and landing, then the semantic question. This retains both start/end values without creating a clip for every pair of journeys. Questions and explanations are held in the UI until the existing user action advances them.

## Finite runtime coverage

The inventory covers all six canonical arithmetic pools (18,096 questions), all Time Teller pools (120 questions), and the full enumerated Number Line pool (88,940 rows: hops, missing values, and ordered journey comparisons). Each line has a phrase sequence that rejoins exactly to its runtime narration text. The comparison prompt has a natural spoken form built from the same canonical operands and semantic question.

The read-only command is `node scripts/check-batch4-voice-readiness.mjs`. Add `--json` to print every unique phrase with its key, path and ready/pending state. Exhaustive canonical-pool traversal lives only in `scripts/batch4NarrationInventory.mjs`; runtime modules derive chunks from the active question and do not allocate full question-pool maps during app import. The readiness command checks the offline manifest and non-empty local file only; it makes no network calls and writes no files.

Source snapshot on 2026-10-03:

| Scope | Unique phrases | Characters |
| --- | ---: | ---: |
| Addition | 2,696 | 53,417 |
| Subtraction | 1,273 | 23,070 |
| Time Teller | 89 | 4,145 |
| Number Line | 1,944 | 44,058 |
| Deduplicated total | 5,246 | 112,234 |
| Ready in local manifest and files | 65 | 1,162 |
| Pending | 5,181 | 111,072 |

Character totals use JavaScript string length over the unique phrase text. Per-game phrase lists overlap; the 5,246 total deduplicates across games.

## Playback and cancellation

All four games pass `premium: false` and finite exact segments to the shared `speak` hook for questions, clues, and explanations. The shared hook owns mute cancellation. Addition, Subtraction, Time Teller and Number Line cancel on chapter start/replay, Next, internal map return, and unmount. The route-level leave callback remains responsible for its confirmation; cancellation on unmount occurs after an accepted leave. No browser speech synthesis fallback or `/api/voice` request was added.

## Remaining checks

- Package the 5,181 pending phrases through the separately authorized audio workflow.
- Decode-check all packaged audio and confirm every manifest path resolves.
- Exercise mute, Next, replay, internal map return and confirmed leave on native Android and iOS playback.
- Listen to representative number/noun, comparison and time sequences at normal speed for pronunciation, pauses and prosody, then complete a full human listening review.

No 4.5 acceptance or release claim is made by source coverage or local file presence.
