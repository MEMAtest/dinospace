# Addition Adventure builder acceptance note

Date: 2026-10-23

## Delivered

- Replaced the separate source groups plus a second answer tray with a count-conserving model. Before combination, each object appears in exactly one source group. The child can choose **Bring the groups together**; the source objects then move conceptually into one joined group, preserving one copy of each object. A correct answer also reveals this joined model.
- Added an explicit `a + b = ?` equation for group/story questions. Number-bond questions show `part + ? = whole`, then reveal the missing part after a correct answer.
- Made the number-bond model countable: the whole and known part use visible counter dots; the missing part becomes visible after the answer. Nodes remain labelled as whole and parts.
- Added an explanation replay control using the existing packaged narration segments. After a correct answer, the worked explanation stays visible until the child chooses the explicit Next/Finish control; the game does not auto-advance or impose a timed wait.
- Made the pre-answer group model reversible with one Join/Split control, so the child can compare the separated and combined representations before answering.
- Preserved the seeded six-question rounds, chapter order and unlocks, answer options, prompt/clue/explanation content, reward/progress/analytics calls, hint scoring and retry behavior. Model joining is optional and does not change scoring.
- Existing controls remain native buttons with touch-sized targets; this change adds no external assets, voice generation or provider calls.

## Verification

- `npx eslint src/components/games/AdditionAdventure.jsx` — passed.
- `node --test test/batch4Arithmetic.test.mjs` — 9/9 passed. These existing tests cover seeded question validity, unique questions/options, addition model arithmetic, narration inventory, scoring and progression persistence.

## Acceptance checks for root rehearsal

- At 390 px width, inspect groups/story with 0, 1 and 20 total objects; verify no horizontal overflow and every object remains countable.
- Use keyboard and touch to join and split groups, answer, replay explanation, and explicitly advance. Confirm a wrong answer still allows retry and hint use still affects scoring.
- Check the number-bond whole/parts diagram at totals 0, 10 and 20 and ensure the equation and nodes distinguish the unknown before answering from the revealed part afterward.
- Human listening remains a separate acceptance gate; implementation reuses the existing narration inventory.
