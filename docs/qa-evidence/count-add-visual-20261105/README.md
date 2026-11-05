# Count the Stars and Addition Adventure — 5 November 2026

Live at https://dinospace.netlify.app. Runtime `f9d7c6f27d3a088df59521f600db8f40b21d1839`, entry `/assets/arcade-BBjJnjd-.js`, worker `amari-discovery-v65`, immutable backend deployment `dpl_9jT8YGj6qVzsLsbZsXvDs2xjJF6W`, Netlify gateway `6aecf3fe602cf5c1233a37ee`.

The Count the Stars map header previously showed the stale active episode even when a different survey was selected; it now tracks the actual selected survey, and the book view is labelled Constellation book. Addition's selected chapter card now includes its existing child-friendly addition artwork, without changing maths questions, audio or saved results. A 390px visual rehearsal verified the initial selected survey, switching to another, book title, decoded addition artwork and a visible, centre-hittable 56px start button (`native-visual-390.json`).

The built application passed 760 tests and scoped lint. Both canonical full actual-control runs passed at 390x740 and 1440x844: 72 questions per viewport covering all chapters and lower-rated replays, saved counting, addition and parent reward records identical after reload, and no page, console, request, HTTP or provider errors. The QA driver now asserts the actual selected survey name and decoded addition art; it waits for real catalogue images before a deliberate reload. Native 390 and 1440 full journeys also passed; the first native phone report was generated before the candidate commit and its supplied runtime field is the prior baseline, so it is preliminary, while its driver/source hashes bind the worktree exercised.

A real Refresh games cutover preserved all 117 synthetic local-storage hashes and the synthetic storybook IndexedDB. This does not recover the user's personal stories. Production HTML, worker, stylesheet, module and addition image match both the tested build and immutable backend (`production-core.json`). The first immediate post-cutover check had a mismatch on the module (`production-core-initial-mismatch.json`); two direct follow-up fetches and a complete repeat matched. The cause of that initial response was not established. No paid voice or story calls were made, and no new editorial score, human listening assessment or physical-device certification is claimed.

Live evidence:
- `docs/qa-evidence/count-add-save-20261029/production-count-add-390x740-arcade-BBjJnjd--20261105T212449-269153000.json`
- `docs/qa-evidence/count-add-save-20261029/production-count-add-1440x844-arcade-BBjJnjd--20261105T212552-782473000.json`
