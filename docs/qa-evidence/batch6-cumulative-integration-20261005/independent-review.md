# Independent Batch 6 cumulative source/build review

Date: 2026-10-05

## Identity

- Canonical base: `1accc99e89be303678ead99def6a3095ab1cb886`.
- Reviewed Batch 6 source: `2a82fd8fd17d9e76ec4310f2fecf489291f5bbff`.
- Cumulative source freeze: `7c350f4bff66c1e9aff922cb5ee98e0fdd1d4ef8`, on `codex/amari-batch6-cumulative-20261005`.
- The current documentation correction is commit `f0d11aef5afc58365913974be50746f6e3a2f9b9`; runtime tree remains the stated freeze.

## Source and base preservation

I independently checked all 12 imported Batch 6 files against their hashes in `identity.json` and Git blobs at the reviewed source commit: 12 matched, 0 mismatches. The frozen commit has exactly 15 changed paths from the canonical base, matching the identity list: 12 imported B6 files plus the App, session ownership helper, and ownership test integration changes.

The canonical base tree and integrated tree hashes match `identity.json`. The Count component/data/test, offline voice manifest, `api/**`, and `public/audio/**` are unchanged. This also confirms the older B6 integration source was not used as a base: the actual frozen commit's parent is `1accc99`.

## Routing and narration cancellation review

The four Amari chapter game IDs are handled as an explicit set in `App.jsx`; Askia is excluded by the `!little` condition. `gameSessions.js` bypasses the legacy answer-count wrapper for Amari's Pattern, Hangman, Chess, and Astronaut routes while retaining the Askia wrapper. The shared chapter components select their Askia implementation in `littleMode`. The focused ownership test asserts both sides of this split.

For Amari, App passes the shared narration cancellation callback into these game components and requests forced parent navigation only after their own Back/Leave action. `Batch6Journey` cancels narration on chapter start, Next, Back, Leave, and unmount; its in-progress Back opens the chapter's Keep/Leave guard, and Keep closes that guard without changing the route. The App route cleanup cancels audio when the player or route changes. The completed chapter Back first returns to the chapter map. These are source-level findings; no browser was opened, so this is not a live interaction or playback assertion.

The frozen built entry chunk contains the four game titles and the `cancelNarration` plumbing; the Solar System is retained as its separately loaded chunk. No import or build-manifest mismatch was found.

## Build and focused verification

I checked the actual `dist` directory against the frozen sorted manifest: all 5,879 files exist and match their recorded byte lengths and SHA-256 values. The compact manifest digest is `fcdd380858803bb1bf97d6483136a424e81698b51079152c52a5a148f6558747`, matching `identity.json`.

I ran the focused progression-ownership and Batch 6 game tests: 10 passed, 0 failed. Targeted ESLint on the changed JavaScript/JSX files passed. I did not rerun the full 238-test suite or rebuild the frozen output.

## Scope

This closes the independent source/build identity review only. There was no browser launch, provider request, narration generation, deployment, or human listening. Retained Batch 6 browser matrices are prior evidence, not a fresh check of this cumulative build. Packaged narration/playback/listening and final production checks remain open.
