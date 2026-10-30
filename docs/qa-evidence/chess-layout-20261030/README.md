# Chess layout repair — 30 October 2026

The desktop grid placed the instruction in the main board column, leaving the board in the narrower control column. Explicit grid areas put the board in the main column and controls beside it; on phones they stack. A framed board and clearer instruction spacing improve the presentation. The existing chess artwork and game mechanics are retained.

Published on https://dinospace.netlify.app via Netlify gateway deployment `6ae4623026ea168df89b9a06`, pinned to immutable backend `dpl_DNMTzTZhVqhaLT286ZvYei4Zm3ZB`. App source commit `478a007c`, entry `/assets/arcade-C_xp8Sgc.js`, service worker v57. The subsequent test-only commit updates the worker-version assertion.

A retained synthetic Chromium profile on the canonical site measured the board at 548×548 at a 1000×900 viewport, and 353.2×353.2 with 44.1-pixel squares at 390×740, with no horizontal overflow. A legal black pawn move and the computer reply added two moves to the saved game. Tests: 756 passed and one skipped in the normal suite; the separately run built-worker audit passed all eight checks including the initially skipped check. Build and scoped lint passed. This is browser emulation, not physical-device verification. No family data was accessed or cleared.
