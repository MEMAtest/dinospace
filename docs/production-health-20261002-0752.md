# Production health — 2 October 2026, 07:52–07:58 UTC

Resumed 05:09 heartbeat, isolated Playwright session `health-20261002-0800`.

## Production identity

Vercel inspect and deployment API confirm canonical alias `dinospace-eight.vercel.app` on READY production `dpl_3aXnFd9wZ2599fLqhszR7PyqzAxF`, immutable URL `https://dinospace-rgfi9yvh9-memas-projects-23a0001d.vercel.app`, metadata SHA `8499e15471196f11a4a2665359f0d6cb38992033`. Rendered JS `index-CvLivfU2.js`, CSS `index-Bwl2SrXA.css` match the authorized hotfix. No deployment mismatch.

## Actual Storybook controls

- Selected Amari → Read & Write → Storybook Studio. All seven curated books visible: Rex, Luna, Nia, Bo, Sami, Mina and Kai. This fresh browser contains no historical custom stories; it does not prove recovery of previously created child stories.
- Desktop: opened Kai, clicked Start Reading. The cover stayed visible initially while its packaged narration played, then auto-turn advanced story pages. Next page worked. Reopening resumed the saved reading page. An automation attempt to locate the cover-only auto-turn switch on that resumed page timed out; no application error was observed.
- Opened untouched Bo, disabled auto-turn on the cover, clicked Start Reading. Entered story page 1 immediately (screen 2/11), then Replay fetched packaged narration.
- Resized to 390 × 844. Next reached page 2 (screen 3/11); Previous returned page 1. Back to storybooks returned the library. Back to learning world → leave confirmation → Back to world reached `#/world/read-write`.

## Diagnostics

Mobile document width 390, no broken/incomplete rendered images on final parent screen. Console zero errors and warnings. All 50 observed requests returned HTTP 200, including seven book manifests/covers and sampled Kai/Bo illustrations and MP3s. No `/api/voice` or `/api/story` requests appeared. Dynamic voice was blocked before profile selection; story API routes were additionally blocked before the manual Bo sample. Physical speaker output and narration prosody were not assessed.

Screenshot: `output/playwright/health-20261002-0752-storybook-parent.png`. Browser closed. Only disposable browser-local progress changed; no real child data accessed or changed, no provider story creation or paid narration calls.

No new confirmed regression in this rotating sample. No additional notification required. The independent Batch 2 Sky desktop stall and missing curated narration remain separate open QA issues in `batch2-production-independent-qa.md` and `batch2-narration-repair.md`; this health check does not certify those games or all 26 games at 4.5.
