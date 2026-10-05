# Spelling Studio Chapter 2 coverage audit

**Finding: the bounded miss does not indicate a queue bug.** The reviewer completed 24 Chapter 2 questions and did not see `sell`; the ordinary default-sounds pool contains 31 eligible words. The source shuffles six fresh word IDs into each run and stores those IDs as recent, so four full runs can show 24 unique words while seven remain. A source simulation through the actual queue and progress helpers found a valid deterministic seed sequence with no `sell` in the first four runs; `sell` appeared in run five, and the final unseen item was reached by run six.

## Eligibility and selection

The default profile has all 23 Phase 2 sounds, including `e` and `ll`, so `sell` is eligible in the `phase2-more` band. Its graphemes `s`, `e`, `l`, and `ll` pass the authored taught-sound filter. The full default Chapter 2 pool contains 31 IDs (machine-readable list and hashes in the JSON ledger). Profiles that omit one of those sounds correctly exclude `sell`.

`createSpellingRun` filters out recent IDs, seed-shuffles the remaining eligible words, and takes six. It does not repeat an ID while at least six unseen items remain. When fewer than six remain, it includes the remaining unseen IDs and pads with earlier IDs. `rememberBatch5LiteracyRun` resets recent history only once that full pool cycle is covered, keeping the last run's IDs recent so the next initial subset changes.

A deterministic source-only simulation using the helpers produced these first four completed runs, with 24 distinct items and no `sell`:

1. `fill, lock, run, peck, tick, bell`
2. `dock, fuss, miss, neck, puff, mess`
3. `tell, but, red, fell, hen, back`
4. `sick, less, duck, hiss, fed, hit`

Run five included `sell`; by run six all 31 eligible IDs had appeared. This is an example queue sequence, not an attempt to reproduce the browser session's random seeds. Existing test `test/batch5Literacy.test.mjs:31-73` already checks deterministic six-question runs and full-pool reachability across seeds, so no source change or mirror test was warranted.

## Bounded lifecycle caveat

The UI records the frozen six-question queue when Start is pressed, before individual questions are shown. Leaving early can therefore put not-yet-seen questions into recent history and delay their next appearance. This source review found no evidence of indefinite starvation for normally completed runs. The full-cycle reachability result is conditional on completing the six-question queues.

This is a source audit of the 101-image candidate source (`8282b8582df6a819114803686e19cdf8f38058dd`), not rendered sell-card acceptance. The independent rendered review at [`batch5-spelling-sell-v2-rendered-independent-20261005/report.md`](batch5-spelling-sell-v2-rendered-independent-20261005/report.md) stopped at 24 Chapter 2 questions and explicitly leaves the sell-v2 fit unverified. No browser, saved profile, provider, or hidden application state was used here. See the [machine-readable audit](batch5-spelling-sell-queue-source-audit-20261005.json) for exact file hashes and the six-run sequence.
