# Count the Stars run-variety candidate

## Candidate and checks

- Source: `40c053408d47ca76ff26cc8ae5c2e8ad9bb99d70`, based on `3f6a00140738ba1a761cf0a446a6cba8334a833b`.
- Frozen local preview: `http://127.0.0.1:5393/`, serving `tmp/count-scene-variety-40c0534/dist`.
- Exact identity and the complete served-file hash list: [identity.json](identity.json) and [served-assets-sha256.txt](served-assets-sha256.txt).
- Focused tests passed: 7/7 across the Count question selection and progress modules. ESLint passed on both changed files. Production-configured Vite build passed.
- I independently fetched all 5,879 files listed in the frozen manifest from the preview; every byte hash matched.

## Selection behavior

Each six-question run now favors unseen scene motifs and unseen count values before falling back to another available question. Growing and Challenge first satisfy the existing requirement for new-range questions, grouped high-count practice, and lower-range review, then use unused scenes/counts for remaining slots. Selection remains seeded and deterministic. Question IDs and the independent per-question answer-option shuffle are unchanged.

The deterministic sweep covers 500 sequential seeds per band, carrying the last eight question IDs into the next run. All three bands used all five scenes in every tested run. Starter used at least five distinct counts; Growing and Challenge used six. Existing tests continue to verify six unique IDs, recent-question avoidance, safe positions, the harder-band quotas, and answer-option correctness.

## Scope limits

This is source and deterministic test evidence only. No browser QA was performed in this pass; the candidate is ready for independent normal-play review. Existing 5387 and production artifacts were not modified. No provider, audio, or release acceptance is claimed.
