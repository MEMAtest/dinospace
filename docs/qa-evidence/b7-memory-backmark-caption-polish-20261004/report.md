# B7 Memory Match back-mark and caption candidate

## Candidate

- Source: `4bdcb7b9769d0f25c493995d016f9eef38968e12`, based on the reviewed B7 source `21ee7b240b271c5d775e4ebca3b5f29e0ad63ade`.
- Immutable local preview: `http://127.0.0.1:5392/`, serving `tmp/b7-memory-backmark-caption-polish-4bdcb7b/dist`.
- Exact build identity and complete served-file hashes: [identity.json](identity.json) and [served-assets-sha256.txt](served-assets-sha256.txt).

## Scoped source change

The Amari full-mode face-down card now uses the existing Lucide `Sparkles` SVG instead of a platform emoji passed through a grayscale/brightness/invert filter. That avoids the white-rectangle rendering seen with the cosmic `🌌` mark while keeping the same card back, face-down interaction, and card data.

Desktop face-up labels now have a 12px minimum and a taller row that permits wrapping. The mobile four-column board and its existing caption overrides are unchanged. Pair identities, labels, illustrations, level sizes, progression, and narration data were not edited.

## Verification and limits

- `npx eslint src/components/games/MemoryMatch.jsx` passed.
- Production-configured Vite build passed. The build reported the existing stale Browserslist database and large-chunk warnings.
- Served index, JavaScript, CSS, and complete asset list were checked against the frozen build; see the identity files.
- No browser QA was performed in this builder pass. Independent normal-play review should check the vector card back and wrapped captions on desktop and the late 13–18-pair mobile layouts before accepting the visual delta.
- This candidate provides no audio, listening, or 4.5 acceptance evidence.
