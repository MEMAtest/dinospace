# Dinosaur Discovery World and Shadow Match · 19 November 2026

Both activities are live at https://dinospace.netlify.app. The runtime is `03229e62c00a650f444124851051372301afab6c`, the entry is `/assets/arcade-CU4MqZVs.js` and the worker cache is `amari-discovery-v80`. The Netlify gateway `6aff5a8bbfb02c64891c0537` points at immutable Vercel deployment `dpl_3zNKWJNYfq8338A6jRwb2MzcaTvM`.

Askia’s Dino World opens Discovery World from its first activity. Amari can open it through Explore & Languages. The roster consists of 19 land dinosaurs, three marine reptiles and two flying reptiles. Existing illustrations were reused for 22 creatures. Pteranodon and Ichthyosaurus received new transparent WebP portraits totalling 116 KiB, with their source images retained in the ImageGen output folder. Each creature has a tap-to-reveal feature and a two-picture match. Four also have a food activity. Stickers are saved to a per-player book. Narration uses the device’s English speech voice when available.

Shadow Match has a turn control for the reference picture on mirrored rounds and a marked shadow when the child asks for a clue. Wrong choices are retryable and the matched creature’s fact stays up until Next.

Scoped lint and production-configured build passed. All 762 tests passed with zero skips. Live Chromium checks at 390×740 and 1440×844 decoded the artwork for all 24 creatures and tested Askia’s menu, Spinosaurus picture retry, Elasmosaurus food retry, sticker persistence across reload, audio invocation and mute, mirrored turning, clue and held fact. The local phone run also earned Shadow Match levels 2 through 5 through the game controls. No provider calls, page errors or failed HTTP responses occurred in the final runs.

Through the actual Refresh games control, all 117 synthetic localStorage records and the synthetic Storybook database matched their pre-release hashes. The public shell, CSS, JavaScript, worker and sampled art matched the local build and draft. Tests used the existing synthetic browser at phone and desktop viewport sizes. Speech invocation and mute were checked, with human listening and physical handset checks outstanding.

[Production summary](production-summary.json) · [Phone screenshot](phone-spinosaurus.png)
