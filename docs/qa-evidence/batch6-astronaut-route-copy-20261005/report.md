# Astronaut Academy route-copy delta

Date: 2026-10-05

## Change

Updated only the three Amari chapter map descriptions and the Starter/Growing display titles in `src/components/games/AstronautAcademy.jsx`.

- Starter: **Space discoveries** — “Explore the Sun, Moon and planets, and learn how simple tools help space explorers.”
- Growing: **Mission planning** — “Explore space science and see how tools protect and power spacecraft.”
- Challenge retains **Review missions** — “Review space science and use evidence to design a mission.”

This resolves the prior mismatch where Growing was titled Mission engineering and promised spacecraft protection/power while its pool was split evenly between science and engineering questions. The visible per-question kind badges remain unchanged. Chapter IDs, mission pools, queue construction, questions, answers, facts, progress, and audio phrase source are unchanged. No UI/browser check was performed on this new copy; independent review is pending.

## Source and build identity

- Source commit: `3dafee7b31302cb1a7ab41f731fa51a5e7fcd2e0`
- Parent source: `9d8692eb3760035251c785826f66619e2e5d5a09`
- Edited source path: `src/components/games/AstronautAcademy.jsx`
- Edited source SHA-256: `f69098b408d1ed6178feb0a1ce490cd142ff87585c2595645bf74161cde0ee08`
- Mission data `src/data/batch6Games.js` SHA-256: `701bf8da8c7c2c40daf30a4c7280d14cb488098ce8a9b5702d835785b21939c0`
- Narration source `src/data/batch6Narration.js` SHA-256: `436791b76cb6f3e807b1d5ea5e985e5fb25268e7e32facbc6469a0ad4ac45124`
- `BATCH6_SPOKEN_PHRASES`: 378 phrases; ordered JSON list SHA-256 `ee76e198c7c2c96adcefb1c8a253783f0156ef755d2cfbff5512df893ca1887a` (same before and after copy edit)
- Configured production build output: `dist-astronaut-route-copy-20261005/`
- Build manifest: 5,879 files; sorted path/SHA manifest SHA-256 `0847dcf00509ff4a4186864f7cd45d4af6fc0da7b1723ad15cbf9c804c4065ca`
- Built `index.html` SHA-256 `eb29b461b6e9309d66247a75550464d50cf529a238152cdebd9f3305e129119b`
- Built main JS `assets/index-CUuCtS9W.js` SHA-256 `472254f7fa18dc4e86bdabeee5143f1443d41a1b18b2c141f63ea57e2c7b64bd`
- Built CSS `assets/index-Ccs6j6LF.css` SHA-256 `2411e413823eb43b354026da853a4fae30867a13a409ce0daf59351037e8acbf`

The configured build used `VITE_ELEVENLABS_ENABLED=true`, `VITE_VOICE_API_URL=https://dinospace-eight.vercel.app/api/voice`, and `VITE_STORY_API_URL=https://dinospace-eight.vercel.app/api/story`. It wrote to the separate output directory; the frozen integration `dist` was not changed.

## Verification and limits

`npx eslint src/components/games/AstronautAcademy.jsx` passed. The configured Vite production build passed. No new test was added for copy-only changes. This build does not establish independent copy acceptance, browser behavior, narration readiness/playback, deployment, or a 4.5 score.
