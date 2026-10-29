# Trace and Cosmic layout matrix

This is a caller-supplied-page native protocol for the existing Amari synthetic
QA session. It checks the source/layout correction after Pair 11's retained-game
smoke found that Letter Trace's primary Start action was below the 390 px phone
viewport. It does not replace the earlier functional acceptance for either
game, and a successful callback is not production acceptance.

## Boundaries

- Run only in the existing `amari-targeted-contained` session and retained QA
  profile after the root grants the named lease. The runner only reads the
  lease file and uses CLI `run-code` on the existing page. It never opens a
  browser, creates a context/tab/profile, seeds progress, changes answers, or
  writes app storage directly.
- Allowed origins are the existing native preview `http://127.0.0.1:5180` and
  the canonical `https://dinospace.netlify.app`. Bind each report to the supplied
  compiled entry, source SHA, helper/guide hashes, viewport, and QA namespace.
- Supported layouts: 390×740 and 1440×844. All task controls, boards, held
  explanations, audio replay, and Next/Finish actions must be fully in view and
  center-hit-testable before the driver clicks them. Scrolling is allowed only
  for secondary world/catalogue navigation and the optional free-play disclosure.
- Preserve the existing sound preference, all prior game records, and all other
  Amari/sibling records. The helper's exact-key storage comparison allows the
  lane's own progress and known shared diagnostics/reward mirrors only.
- Packaged media must be served from the same origin and show actual playback
  plus positive time advancement. Provider/API attempts, broken images, runtime
  errors, and horizontal overflow fail the run.

## Letter Trace journey

Use the normal Read & Write world and Letter Trace catalogue card. Choose the
three authored chapters through the visible chapter picker/completion actions:
`Follow the path`, `Big and little`, and `Trace and read`.

For each chapter, complete eight distinct visible letters by moving a real
pointer along the existing authored guide geometry. On the first letter,
attempt an off-guide start, prove progress stays at zero, view the stroke demo,
and prove it changes neither visible progress nor the saved mastery record.
Before Check, verify it is disabled; after each full trace, verify it enables and
the current letter remains visible. On the first letter of each chapter, replay
the held explanation and require a packaged clip with positive media time. Each
held explanation and its Next/Finish action must fit the viewport without
scrolling. On the word-transfer chapter, derive a correct and a wrong choice
from the visible prompt/options, prove the wrong choice retains the same
question, then finish with the visible matching option.

Before the final Finish in `Trace and read`, reload through the normal browser
reload while the answer is held. Prove the saved mastery bytes are unchanged by
reload, re-enter through the visible profile/world/catalogue routes, and finish
the same chapter normally. End at the normal Read & Write world. This recovery
path does not claim that reload itself awards a badge or chapter completion.

## Cosmic Tic-Tac-Toe journey

Use Thinking & Play → Cosmic Tic-Tac-Toe through the normal catalogue. Complete
`Make a line`, `Block the Rocket`, and `Find a fork`, using each visible board's
rendered squares to calculate a legal tactical answer. For every board, try a
visible non-solution empty square first; the board must remain unchanged and
show same-board retry guidance. On the first board of each chapter, use the
visible one-use hint and verify the marked square is a valid tactic. Use the
keyboard for one chosen target and pointer input for the others. Verify the
explained board's highlighted path count, replayable packaged explanation, and
held Next/Finish geometry.

The normal mission route can contain fewer than three boards when earlier
progress exists. Complete those remaining boards, then use the visible Replay
chapter action to cover three distinct layouts. Report actual board count and
whether rows came from the first route or the explicit replay; do not reset or
rewrite prior progress to force a fresh route.

After all chapters, open the optional whole-game disclosure and play exactly one
legal move against Nova Bot. Require one legal bot response and verify that
leaving through the normal confirmation does not change the optional free-play
record. Return through the visible chapter map and exact Thinking & Play parent.

## Report interpretation

Report Trace as 24 letter tasks plus three chapter-level transitions (and the
explicit pre-Finish reload/re-entry). Report Cosmic as the actual rendered
mission-board rows, including any rows completed via replay, plus one unfinished
free-play human/bot turn. Separate pre-existing source-bound functional evidence
from these layout-regression journeys. Preserve partial rows and screenshots on
failure; do not relabel a harness/setup failure as a product pass or loosen
primary-control geometry requirements.

## Runner

After the root grants a lease and supplies the exact frozen SHA/entry, run one
lane at a time with the caller-page runner:

```sh
TRACE_COSMIC_BROWSER_OWNER=<leased-owner> python3 docs/qa-evidence/trace-cosmic-fit-20261029/run-trace-cosmic-native.py \
  <approved-origin> <390|1440> <740|844> <trace|tictactoe> \
  <exact-/assets/arcade-*.js-entry> <40-character-source-sha>
```

The runner rejects unsupported viewports/origins, stale entries, wrong retained
profile ownership, unresolved callback placeholders, and evidence-folder growth
above 5 MiB. Native reports also verify the entry against the root-owned
`dist/index.html`; production uses only the canonical Netlify origin.
