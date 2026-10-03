# Batch 3 preview acceptance preflight

Date: 2026-10-03
Preview: <https://dinospace-92oflqtsf-memas-projects-23a0001d.vercel.app/>
Vercel deployment: `dpl_GgMh8otXVbABPR1p5cjh6wYZQKo6` (READY)
Requested source checkout: `a6e1e675411a9a6d48b3f8e99fdbd5ad44ea44f4`

## Result

Preflight failed the requested runtime-configuration check, so chapter gameplay was held. This is a candidate configuration failure, not a gameplay failure: no child profile was selected and none of the four games was opened. No provider or story request was sent.

The caller specified these preview build values:

- `VITE_ELEVENLABS_ENABLED=true`
- `VITE_VOICE_API_URL=https://dinospace-eight.vercel.app/api/voice`
- `VITE_STORY_API_URL=https://dinospace-eight.vercel.app/api/story`

The source checkout was verified at the requested SHA. `npm run build` generated its default-config `dist`; all six preview-served JS/CSS files (entry, shared `web`, Count, Trace, Solar System, and CSS) matched that output byte-for-byte. The deployment’s selected entry is `index-CIaykvxE.js`; it does not match the older `batch3-final-package-identity-20261003.json`, which belongs to source SHA `8c9fd6e91ad640595d9986fc0d519e242d30d731` and selects `index-CDMB4hb_.js`. That older identity is not applicable to this requested SHA.

Inspection of the exact served entry and lazy chunks found the effective build constants:

- dynamic ElevenLabs flag: `false` (`c9=!1` in the minified voice module)
- packaged narrator flag: `true` (`m9=!0`)
- voice API URL: `"/api/voice"`, not the requested absolute URL
- story API environment object: empty (`Zk={}`); runtime falls back to `https://dinospace-eight.vercel.app/api/story`

The story fallback happens to resolve to the expected URL, but the required explicit build variable is absent. The ElevenLabs flag and voice endpoint are both incorrect for the supplied expected runtime config.

## Browser preflight evidence

An isolated Playwright CLI session was created. Before first app navigation, `**/api/voice` and `**/api/story` were routed to HTTP 204. The app was visited only at the public home screen. Network log contained the HTML, five app/static asset requests, and no API/provider/story requests. Console showed zero errors and zero warnings.

At 1280×800, document width was 1280px; document height was 808px. At 390×844, the home screen rendered within the viewport. Screenshots are in [`screenshots/`](screenshots/). They show only the home screen, before profile selection.

## Scope not exercised

Because runtime flags were wrong, this run did not exercise Count & Collect, Letter Trace, Dino Detective, Cosmic Tic Tac Toe, progression/reload, held feedback, hints, narration playback/cancellation, game diagnostics, return-to-world behavior, or any in-game desktop/mobile layouts. No subjective listening claim is made. Re-run these checks against the next configured preview whose bytes and feature constants match the requested environment. No source code was changed and no deployment was created by this QA session.
