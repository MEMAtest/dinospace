# Puzzle Pop and Spot the Difference — current live audit, 5 November 2026

Both games already contain 12 authored scenes across three chapters. Puzzle Pop uses 9, 16 and 25 pieces; Spot uses 3, 5 and 7 differences. Their previous functional release also included held facts, retries, touch/keyboard support and strict save confirmation. No new changes were made to either game in this audit.

The current canonical module `/assets/arcade-C5jqYKfV.js` (runtime `72ce4a32ee6cf4ca69ffe3276161818b71870efd`) passed the full visible-control layout matrices at 390x740 and 1440x844: each covered all 12 Puzzle Pop scenes and all 12 Spot pairs. These are synthetic browser checks; they do not constitute physical-device testing or a fresh human listening or editorial assessment. The historical audio listening/editorial gate remains open, and no editorial score is assigned.

- `docs/qa-evidence/puzzle-spot-fit-20261029/production-puzzle-spot-390x740-arcade-C5jqYKfV-20261105T001721-489746000.json`
- `docs/qa-evidence/puzzle-spot-fit-20261029/production-puzzle-spot-1440x844-arcade-C5jqYKfV-20261105T001813-810439000.json`
