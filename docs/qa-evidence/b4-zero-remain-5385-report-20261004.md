# B4 subtraction zero-tray builder check — 4 October 2026

## Change

From `fe5aeff64dca2d1c9aad6dcecee9cede5bdcc128`, the subtraction result tray now shows `0 (empty)` after a locked answer of zero. The tray remains visually blank before answer selection, so the result is not revealed early. No question data, answer, progression, or narration keys changed. The only runtime edit is `src/components/games/SubtractionStation.jsx`.

## Verification

- Source commit: `4a9ae1cd4cd1293aafae4c10877d5cb6cf8ae029` on `codex/b4-zero-remain-tray-20261004`.
- Scoped ESLint and `git diff --check` passed.
- Production-config Vite build succeeded to the isolated `tmp/b4-zero-remain-5385/dist`; the existing large-chunk warning remains.
- Local Vite preview on `http://127.0.0.1:5385/` serves HTML, main JS and CSS byte-identically to that build; exact hashes and lengths are in [identity](b4-zero-remain-5385-identity-20261004.json).
- Browser checks used ordinary app navigation in Chromium with voice and story routes installed as 403 guards before navigation. Sound was muted. Fourteen static requests were observed, all loaded static assets returned 200, and there were zero console errors or warnings.
- At 1280×720, the visible question `There are 5 gems. Take away 5. How many are left?` had a blank Remaining tray before selection. After selecting the visible `0` answer, the held question showed `0 (empty)` in the tray. The app did not advance until `Next question`.
- At 390×844, the visible pre-answer question `There are 10 cookies. Take away 8. How many are left?` showed a blank tray without a remaining count.

Screenshots and a retained desktop pre-answer snapshot are in this evidence folder. This is the builder’s narrow visual check; independent review is pending. The mobile zero-result state was not exercised here. No provider calls, audio changes, worker changes, deployment, or production acceptance occurred.
