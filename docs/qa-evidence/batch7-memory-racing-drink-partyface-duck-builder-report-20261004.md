# Memory Match racing car, drink, party face, and duck art builder check

**Source commit:** `d1c35b1c35a799acfab69cf263a598e9dd6c9421`
**Frozen local candidate:** [http://127.0.0.1:5333](http://127.0.0.1:5333)
**Served identity:** [batch7-memory-racing-drink-partyface-duck-identity-20261004.json](batch7-memory-racing-drink-partyface-duck-identity-20261004.json)
**Asset provenance:** [memory-racing-drink-partyface-duck-art-provenance-20261004.json](memory-racing-drink-partyface-duck-art-provenance-20261004.json)

## Change scope

Added four separate transparent, toy-like illustrations and 512px WebP derivatives for the existing Memory tokens `🏎️` racing car, `🥤` drink, `🥳` party face, and `🦆` duck. Each is mapped only on its existing authored board. PNG originals are unchanged; prompts, source paths, hashes, dimensions and alpha data are recorded in the provenance file.

`MemoryMatch.jsx` changes only add static imports and entries in its existing asset-path lookup. `memoryMatchContent.js` maps the four existing tokens to their corresponding art. The authored boards, token identities, pair counts, gameplay/progress logic, storage, and Askia rendering and art map are unchanged. Focused tests check each token’s exact board, label, and asset mapping.

## Source checks

- `node --test test/memoryMatchContent.test.mjs test/batch7Progress.test.mjs`: 18 passed.
- `npm run lint`: passed.
- Production-config `npm run build:android`: passed. Existing stale Browserslist data and >500KB chunk-size advisory warnings remain.
- Illustration inventory: 84 of 87 unique authored tokens now have matching illustrations. Remaining: water lily (`🪷`, Garden), dinosaur nest (`🪺`, Dinos), speedboat (`🚤`, Vehicles).
- SHA-256 checks match between the served immutable build and local build for `index.html`, application JS/CSS, and all four new WebPs.

## Ordinary UI check

Used a new CLI browser session with a fresh local profile. Started at `about:blank`, installed 403 routes for `**/api/voice` and `**/api/story`, verified both in `route-list`, then navigated with `goto` to the immutable candidate. Both routes remained active in checks before and after play.

Selected Amari and Memory Match through visible controls. At 1280×800, earned Levels 1–9 by flipping actual face-down cards and using the visible Next Level control. At 390×844, replayed the unlocked target levels from the level selector. For each card, automation used only its visible face-down index before a real click, then its accessible face name after reveal; no progress, deck, or hidden-face state was injected or read. The profile was a CLI test profile, not live child data.

| New illustration | Authored board | Board cards | Visible result |
| --- | --- | ---: | --- |
| Party Face | Party & Treats, level 4 | 24 | Matched image and “Party Face” caption |
| Racing Car | All Kinds of Vehicles, level 6 | 28 | Matched image and “Racing Car” caption |
| Drink | Yummy Feast, level 7 | 30 | Matched image and “Drink” caption |
| Duck | Garden & Pond Life, level 9 | 34 | Matched image and “Duck” caption |

All four target boards completed at their authored pair counts on both viewports. On mobile, every target card measured 82×82px and each loaded its image at 512px natural width. After completion, the mobile face-down-card check found zero remaining face-down cards and zero descendant images on face-down cards. Visible target captions remained present. Screenshots show the actual revealed targets; see [`batch7-memory-racing-drink-partyface-duck-builder-images`](batch7-memory-racing-drink-partyface-duck-builder-images/).

The final CLI route list retained both provider guards. The request summary showed no matching API request (static requests were omitted by the CLI’s default output); console reported 0 messages, 0 errors, and 0 warnings. This check did not test audio playback or certify narration listening.

## Limits

This is builder evidence for this four-token delta only. Independent rendered QA is pending. Three tokens still need art, and the broader premium-art, audio, and human review gates remain open. This does not establish production acceptance, release, deployment, or a 4.5 score.
