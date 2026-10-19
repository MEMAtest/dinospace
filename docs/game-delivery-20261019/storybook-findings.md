# Storybook Studio current findings

## Current production reading checks

Canonical production runtime aaef3be4c4630f06575949351ee7e39230432664, deployment dpl_AZMdxgc4m9pQdnt4uDdsGAB9fjuY. Root used the single dedicated synthetic Chromium tab at 1440×844 and 390×844. All seven curated titles opened; every first-page image loaded and every first-page MP3 played, with currentTime advancing. No page errors, required asset failures or horizontal overflow occurred in that sample. These checks do not accept all pages, comprehension, human listening, generated-story persistence or the whole creation pipeline.

The seven titles are Rex and the Missing Moon Map; Luna and the Whispering Forest; Nia’s Great River Journey; Bo and the Busy Bee Garden; Sami and the Night-Light Parade; Mina’s Mountain Seed; Kai and the Lost Library Book. These are curated books. Their presence does not establish that a previously generated personal story was recovered.

The first observed shelf entry took about 3.9 seconds in the initial browser pass. The later warmed pass measured about 0.9 seconds at desktop and 0.12 seconds at 390px. These are small samples on the same desktop host, with cache differences; they are not mobile-hardware benchmarks or percentiles. In the retained detailed script, firstPageAndAudioReadyMs includes actual cover navigation, changing Auto-turn, Start, Play and Pause; it must not be presented as pure network/page-load latency. First-page playback durations were 10.2–13.4 seconds. A reproducible fresh/warm performance benchmark remains in the batch acceptance contract.

The mobile screenshot exposes a clear UX issue: introductory copy, Create a new story and parent controls precede the actual book cards. A child looking to read is directed toward generation and must scroll past settings. Put Read/Continue and book art first, move parent management behind a labelled control, and review hero/card imagery in the app’s design system.

## Why creation can feel slow

These are source-confirmed design properties, not proof of the cause of a particular failed user request:

- StorybookCreator.jsx advertises 3–5 minutes for six pages and 7–10 minutes for ten. Ten pages require an outline, 11 image requests and 11 narration requests. Generation waits for the cover image, then cover narration, before three workers process page image→narration. Ready is set only after all assets finish (StorybookStudio.jsx:478–544).
- The busy modal hides its Close control and provides no visible Pause/Cancel (StorybookCreator.jsx:40–61). Session and outline requests have no client timeout or abort signal supplied at their call sites (StorybookStudio.jsx:574–578; storybookApi.js:18–40). The abort controller starts only in the later asset phase.
- Outline provider timeouts permit a 60-second primary and 90-second fallback. Image primary and fallback may each wait 120 seconds; narration permits 90 seconds. Actual deployed provider timing and function limits have not been reconciled in this audit, so these are configured ceilings, not measured end-to-end duration.
- All saved custom pages/images/audio are hydrated when custom records update; generation persists frequent updates. This may add browser work as the library grows and should be measured. A rejected Promise.all worker does not explicitly abort sibling workers before clearing the generation guard; cancellation/retry races need reproduction.
- Custom books and assets use browser IndexedDB, not account cloud storage (storybookStorage.js:1–60). Another browser/device can legitimately show only curated books. Backup/Restore is the available recovery mechanism; do not clear storage or overwrite real child data while investigating older stories.

## Provider health and logs

A read-only Vercel production log query for requestPath:/api/story over the previous 24 hours returned no matching records. This does not prove provider health or absence of historical failures. The reading audit made no story-provider requests and guards prevented paid calls. A controlled, budgeted generated-story test plus failure/recovery simulations is still required before claiming creation works or is fast today.

## Next work

Follow the Storybook contract in plan.md: fast reading shelf first; progressive usable story rather than a locked all-assets wait; truthful stage progress; bounded waits and visible pause/resume; abort sibling work safely; retry only missing assets; verify local backup/restore and every curated page. Record real generation stage durations and human audio review before a 5/5 claim. Storybook is investigating, not accepted by this planning pass.
