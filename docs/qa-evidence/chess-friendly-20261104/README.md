# Chess board and piece uplift — 4 November 2026

The board now uses the available width in narrow desktop panels and stacks the controls below at widths up to 1099px. On wider screens the board can grow to 760px beside the controls. Distinct traditional piece silhouettes now have friendly faces and a cream/blue colour scheme. The same SVG component is used on the board, drag preview and promotion choices.

Runtime `bc039853d209d210477793ea0719a2a9dfadd5bd`, entry `arcade-C9Jx51U2.js`, worker v58; immutable backend `dpl_HW1RMc3GkkNFv8sihPZW26EYm8Aj`, Netlify gateway `6aeb011854f3fc822b331fc2`. The draft gateway and immutable backend HTML matched the local build before production cutover.

In the isolated synthetic Chromium profile, canonical production rendered a 748px board at 820×1000 and a 358px board with 44.75px squares at 390×740, with no horizontal overflow. A legal player move and computer response increased the stored move history from 7 to 9; reload and resume retained all nine moves. The local build and all 757 tests passed, including the built-worker audit. Scoped ESLint passed. This is browser emulation, not physical-device certification; no actual family data was inspected.

The browser session required current Chromium headless shell v1252 (205 MiB) and FFmpeg v1013 (2.9 MiB). The Playwright installer automatically removed cached Chromium and headless shell v1247 while installing, without a prior manual inventory of their consumers. Other existing browser caches and the synthetic profile were retained. No worktree or dependency installation was created.
