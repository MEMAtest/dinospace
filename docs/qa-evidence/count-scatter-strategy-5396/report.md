# Count the Stars scattered-board strategy correction

Date: 2026-10-04  
Source: `1accc99e89be303678ead99def6a3095ab1cb886` based on frozen `79a719e91e727f09d1f78cf890acd7e671cab381`  
Local preview: http://127.0.0.1:5396/  
Identity: `docs/qa-evidence/count-scatter-strategy-5396/identity.json`

## Change

The visible strategy banner now follows the actual board layout. When `getCountQuestionArrangement` reports `scattered`, the game shows the existing Starter guidance, “Count each glowing object once. A number badge keeps your place.” Arrays and split groups continue to show the current episode’s strategy. No new copy or narration keys were added.

The existing spoken clue remains layout-specific: scattered boards select the number-badge clue, arrays select the row clue, and split groups select the two-group clue. The strategy banner itself is not separately spoken; the generic spoken instruction says to tap each object once, which remains applicable to all layouts.

## Verification

- Added a regression check for a Challenge scattered board using the Starter strategy.
- Confirmed Challenge array and split-group boards still use the Challenge strategy.
- Focused Count tests: 6 passed, 0 failed.
- Scoped ESLint passed for the edited module, component, and test.
- Configured production build passed.
- Local preview on port 5396 served the same index, app bundle, Count component chunk, and stylesheet bytes as the build; hashes are recorded in the identity file.

This is a source/build regression check, not independent browser acceptance. No provider calls, deployment, or audio acceptance were performed. Frozen candidate 5395 was not modified.
