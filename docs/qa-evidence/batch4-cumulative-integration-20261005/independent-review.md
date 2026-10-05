# Batch 4 cumulative integration: independent source/build review

Date: 2026-10-05

## Reviewed identity

- Branch: `codex/amari-batch4-cumulative-integration-20261005`
- Runtime: `22e4cc90fb3915b4308a6d40ea693f4843931fbf`
- Canonical base: `1accc99e89be303678ead99def6a3095ab1cb886`
- Builder identity/fingerprint: [cumulative integration report](../batch4-cumulative-integration-20261005.md) and [build fingerprint](../batch4-cumulative-build-fingerprint-20261005.json)

## Independent findings

The 17 fingerprinted Batch 4 owned files match their stated source commits byte-for-byte (17/17). The Subtraction Station file resolves to the reviewed `9c594dd` tree, including its zero-result tray ancestry; the other owned files resolve to `fe5aeff`. Comparing the full runtime diff against the canonical base shows 23 changed paths: those 17 owned files, four narrow shared runtime glue files (App, CurriculumQuest, game sessions, and hash router), and two focused integration tests. The extra test paths are `test/batch3ProgressionOwnership.test.mjs` and `test/batch4ClockNavigation.test.mjs`.

The four routing/ownership glue changes are consistent with the intended boundaries on source inspection: the related clock lesson carries its known Time Detectives origin through reload/popstate/Back, ordinary Maths clock entry does not inherit that origin, Amari's four Batch 4 chapter games own their progression, Askia retains the existing answer-count wrapper, and the Amari badge shelf reads chapter rewards without granting them. This is source-level verification; no browser interaction was performed.

Canonical Count and audio/API preservation checks passed: `git diff --quiet` returned success for the Count component/data/test, offline voice manifest, `public/audio`, and public voice manifest paths between the canonical base and this runtime. The builder fingerprint records 6,022 unchanged non-owned canonical files and a 5,879-file configured build. I independently checked every listed build output path against its recorded size and SHA-256; there were no missing files or mismatches. This verifies the recorded build tree contents, not a fresh build by this review.

## Checks run

- Focused Batch 4 and ownership tests: 27/27 passed.
- Scoped ESLint over the changed runtime, scripts, and tests: passed.
- Source-origin fingerprint: 17/17 owned files matched.
- Build fingerprint: 5,879/5,879 listed files matched.
- Canonical Count/audio/API preservation: passed.

## Limits

No browser QA, provider calls, narration worker changes, deployment, or listening assessment were performed. The existing narration/audio and release gates remain outside this source/build review. This report does not award overall product acceptance.
