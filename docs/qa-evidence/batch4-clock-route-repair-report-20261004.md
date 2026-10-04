# Batch 4 clock return route repair

Date: 2026-10-04

## Candidate

- Branch: `codex/amari-batch4-clean-integration-20261004`
- Integration source: `aa81a5602bfa6d941243d916177265a6fae32a38`
- Route repair source: `aa1627216907ae1612e1bdbb309764000a995ae6`
- Canonical base: `0d3ef056e569e3ef59763df388f26c3baa7783b8`
- New local preview: `http://127.0.0.1:5383/`
- New served identity: [batch4-clock-route-repair-identity-20261004.json](./batch4-clock-route-repair-identity-20261004.json)

## Repair

The first integration had correct route helpers and helper-level tests, but `useHashRouter` still used generic parent routing and never called them. That candidate at port 5382 remains preserved with its old identity and is superseded for further QA.

The repaired hook now retains the allow-listed clock-lesson origin in browser history state during navigation and popstate guard restoration, and uses `gameReturnRoute` for in-app Back. A focused wiring regression test confirms the hook calls both helpers and carries route state through navigation, guard restoration, and Back. The existing Time Detectives route helper tests remain in place.

## Verification

- Focused B4, clock-route, and Amari-only ownership tests: 26 passed.
- ESLint on the changed hook, test, and related App/module files: passed.
- Configured production build (`npm run build:android`): passed; the existing large-chunk and stale Browserslist notices remain.
- Static preview on loopback port 5383: all 5,879 built files fetched and compared byte-for-byte; all match, including the rebuilt JavaScript bundle.
- The initial integration's 247-test full suite passed before this narrowly scoped repair. After the repair, the directly affected focused suite and configured build were rerun; the full suite was not rerun.

## Remaining acceptance

The independent browser check should exercise Time Detectives → clock practice → confirmed Back, reload, and mobile presentation from this new 5383 candidate. Narration remains 65 present / 5,181 pending of 5,246 phrases; no decode or human listening claim is made. No production deployment or provider call was made.
