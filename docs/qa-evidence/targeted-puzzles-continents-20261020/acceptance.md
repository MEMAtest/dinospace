# Targeted puzzle and continent release — 20 October 2026

## User request

Make Askia's dinosaur games longer and harder, give the jigsaw an understandable 2/4/8/12-piece progression, increase Amari's puzzle challenge, and stop Curriculum Quest repeating/resetting the same continent question. Verify actual controls and release to the canonical production site.

## Scope and release base

Four games: Dino Jigsaw (both children), Askia Dino Detective, Amari Puzzle Pop, and Curriculum Quest. Canonical pre-release identity is `dpl_AZMdxgc4m9pQdnt4uDdsGAB9fjuY`, runtime `aaef3be4c4630f06575949351ee7e39230432664`. Reused the existing checkout and compatible lockfile/dependencies. Preserved the previous unreleased programme on branch `codex/solar-blender-planets-20261016` at `baf5b56f`. This focused branch starts on the canonical runtime; earlier unaccepted Storybook/Spelling/Memory/Trace candidates are not implicitly included.

## Mandatory checks

- Askia Jigsaw: four different picture rounds per level; piece bands 2,4,8,8-to-12,12; all five levels complete through ordinary piece placement; wrong slot rejected; keyboard and touch; later level survives return/reload.
- Amari shared Jigsaw: starts at eight pieces, wider board/tray, reaches twelve; mobile targets at least44px; no horizontal overflow or mismatched picture crop.
- Dino Detective: five searches at first level, then5/6/6/7; useful footprint clues; wrong selection recovers; session/replay variety; visible search progress; full five-level run.
- Amari Puzzle Pop:9/16/25 pieces over twelve existing illustrated scenes; exact piece inventory, wrong handling, keyboard; held picture facts; all chapters unlock, existing child progress retained.
- Curriculum: five distinct prompts per run, fresh seeded/replay variation; no forced Africa opening; Learn has a single Start action and no simultaneous answer question; correct facts held until Next; wrong retry, solved fact, in-progress question and chosen band/module survive leave/reload; no adaptive mid-run reset. Geography at all three bands and both sizes; history sequence and route state checks.
- Release: scoped tests/lint/build; exact canonical deployment reverified before and after; desktop and390px actual-control production rehearsal with provider403guards and only synthetic QA storage. No paid provider calls, real child-data changes or new Chrome windows.

## Evidence rules

Source tests and local UI checks are supporting evidence. Completion is recorded only after canonical production controls pass. This is a targeted repair release, not certification that all catalogue games meet5/5. Keep unique failure logs and distinguish harness defects from product defects.
