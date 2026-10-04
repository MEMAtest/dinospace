# Dino Detective fact-language edit — 2026-10-04

Scope: two authored Dino Detective world facts only, plus exact-wording regression assertions. No game mechanics, art, route, audio file, or offline manifest edits. This is a local source candidate; do not freeze or deploy until its two new narration clips are available and readiness is restored.

## Editorial wording

| World | Previous wording | New wording | Authored voice key change |
|---|---|---|---|
| Swamp / wetland | “A wetland is land saturated with water, though it may not stay wet all year.” | “A wetland is a place where the ground stays very wet. Some wetlands dry out for part of the year.” | `59aac364` → `f6991245` |
| Cave | “Water can slowly dissolve limestone and help form caves.” | “Water can slowly dissolve (wear away) limestone rock and help caves form.” | `6eb3670c` → `0f0204e5` |

The wetland copy explains the ground condition using common words and preserves that some wetlands dry seasonally. The cave copy retains the scientific word “dissolve” and explains it as “wear away.” These are data copy changes only; the shared held-fact flow still supplies the world fact and target fact before Next.

## Checks

- `node --test test/batch3Narration.test.mjs`: **3/3 passed**, covering the existing finite narration-corpus membership and Dino sequence checks.
- `npx eslint src/data/dinoDetectiveBatch3.js test/batch3Narration.test.mjs`: passed.
- Read-only `node scripts/check-batch3-voice-readiness.mjs`: **273/275 ready**; the only pending items are the two new fact keys above. Count 207/207, Dino 43/45, Trace 7/7, Tic-Tac-Toe 16/16. Their new keys do not yet map in `offlineVoiceManifest.js`, and the corresponding MP3s are not present.
- No narration generation, provider call, asset/manifest mutation, decode claim, listening claim, production build, deployment, or browser QA performed for this local delta.

## Handoff

Keep this source edit local until both clips are supplied through the separately authorized narration workflow. Then bind both exact authored phrases to packaged clips in the manifest, rerun the read-only readiness/decode gates, and retest the held Dino fact/Next flow at desktop and 390 px before considering a freeze. This report makes no acceptance or release claim.
