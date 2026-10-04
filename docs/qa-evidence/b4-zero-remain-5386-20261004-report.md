# B4 subtraction transition-label builder check — 4 October 2026

## Change

Starting from the frozen zero-tray candidate (`4a9ae1cd4cd1293aafae4c10877d5cb6cf8ae029`), this one-line change removes the `opacity-40` transition from the full group container and applies it to the counter illustration row only. During an answer explanation, the group labels remain fully opaque while the counter pictures move and fade. Existing removal marks, the `motion-reduce` transition setting, and the locked `0 (empty)` result tray remain intact. No data, narration, or progression code changed.

## Verification

- Source commit: `9c594dd0e49f5a84588787a084a55aefeec4cdc0` on `codex/b4-zero-remain-tray-20261004`.
- `git diff --check` and scoped ESLint passed.
- The full existing Node test suite passed: 249 tests, 0 failures. Some parallel Vite tests emitted dependency-scan / port-contention diagnostics; they did not fail the suite.
- Production-config Vite build succeeded at `tmp/b4-zero-remain-5386/dist`; the existing large-chunk warning remains.
- Local preview at `http://127.0.0.1:5386/` served HTML, main JS, and CSS byte-identically to the local build. Exact hashes and lengths are in [candidate identity](b4-zero-remain-5386-20261004-identity.json).
- No additional gameplay or browser review was performed for this candidate. Agent3 has been asked to check the post-answer labels together with the zero-result tray; the earlier 5385 screenshots remain the prior-candidate evidence and are not presented as screenshots of this build.
- No provider calls, narration changes, deployment, or production acceptance occurred.
