# Batch 3 copy and keyboard repair: independent production delta

Date: 2026-10-03  
Canonical URL: [https://dinospace-eight.vercel.app](https://dinospace-eight.vercel.app)  
Deployment: `dpl_HRtGufD4yhwza3iqDu7BfRze6SFS` (READY, promoted)  
Source: `a1eec24552c99529ba30ed38d10492a6ce1c7829`  
Identity: [`batch3-copy-keyboard-canonical-identity-20261003.json`](../batch3-copy-keyboard-canonical-identity-20261003.json)

## Scope and safeguards

This is an independent production delta for the Count the Stars one-object prompt and Letter Trace keyboard-progress repair. It builds on, but does not expand, the bounded four-game production regression recorded in [`batch3-canonical-production-independent-20261003`](../batch3-canonical-production-independent-20261003/report.md). I used fresh Playwright contexts at desktop 1280×800 and 390×844. Before each context's first app navigation, I installed `/api/voice` and `/api/story` routes returning 204 and verified both active. Amari was chosen with the visible player picker; all game entry and interactions used normal rendered controls. No progress seeding, storage access, answer extraction, paid provider calls, or story calls occurred.

The canonical identity record binds the promotion to the named source and lists seven matching runtime asset hashes. Browser request inventories during this delta showed static app/media requests only; the only non-static requests were the two explicit 204 guards.

## Count the Stars

At 1280×800, entered through the visible home “Step 2 Count the Stars” shortcut and chose Starter / Star Garden. Round 1 presented two visible comet seeds. I tapped both, used Show a clue, selected the wrong visible answer `1` and saw “Check your count badges once more,” then selected `2`. Held feedback read “There are 2 comet seeds. You counted each one once.” Round 2 showed five moon berries; counting them and choosing `5` held matching feedback.

The naturally reached Round 3 contained one planet. Its prompt read “How many planets did you count?” Choosing `1` held the correctly singular result: “There is 1 planet. You counted each one once.” This verifies the patched noun prompt with a real one-object queue item and its result. Reloading from the active counting route retained `/#/play/counting` and returned to the Star Garden selector; it did not restore the in-round board. No replay or star-accounting claim is made.

## Letter Trace

At 1280×800, entered Read & Write → Letter Trace → Start chapter and chose the visible keyboard mode. In the G trace, I focused the visible guide, pressed Space to begin, and pressed ArrowRight once. The visible orange marker moved and the visible label immediately changed to `10% traced`. Two more forward arrows followed by ArrowLeft left the displayed high-water progress at `30%`; subsequent forward arrows visibly moved the marker and raised the label through `80%` to `100%`. At 100%, Check shape stayed disabled until Space ended the stroke. Check shape then enabled; submitting held “You followed the letter. Great tracing!” and a visible Next letter action. Screenshots preserve the visible marker/progress states; the held completion snapshot is included.

At a 390×844 viewport, a fresh Amari profile entered Letter Trace through the visible Read & Write world and started the chapter. I traced the visible single-stroke G guide with a continuous Playwright mouse gesture, following the displayed green start, dotted outer loop, arrows, and terminal crossbar. Progress reached 100%, Check shape succeeded, and the same held completion and Next letter appeared. This is a real browser mouse/pointer gesture at a mobile-size viewport; it is not a native touchscreen hardware review.

An earlier attempt on the two-stroke A guide used separate, coarse mouse moves and was rejected with “Nice try. Start this stroke again at green 1.” The UI showed green start 1 and gray 2, but that attempt did not validate the complete path order and is preserved as non-diagnostic tester-attempt evidence. The later G pointer trace completed successfully; the A attempt is not reported as a product defect.

## Navigation, reload, console, and assets

On both desktop and 390×844 sessions, Back to learning world opened the “Leave the game?” dialog. Keep playing dismissed it without leaving; choosing Back to world returned to the exact Read & Write world. A same-context page reload retained `/#/world/read-write`. The desktop count route reload retained `/#/play/counting` and opened the Star Garden selector as noted above.

Both final browser console inventories contained 0 errors and 0 warnings. Static page, JavaScript, CSS, image, and packaged audio requests observed in the test returned HTTP 200 or 206; no failed static request appeared. All other requests were the guarded `/api/voice` and `/api/story` responses (204). Packaged media response status is not evidence of listening quality; no human audio review was performed.

## Evidence and release boundary

Screenshots and accessible snapshots are organized under `desktop/` and `mobile/`. The desktop records include the wrong-answer/clue/correct sequence, one-object prompt/result, keyboard marker progress, completion, and confirmed Back/reload routing. The mobile records include successful G pointer completion and held feedback, a retained failed A test attempt, and confirmed Back/reload routing.

This confirms the exercised controls on the identified promoted deployment only. It is a narrow production patch delta, not a full Batch 3 4.5 acceptance, full multi-chapter/six-round matrix, comprehensive replay/reward or sibling-isolation audit, native touchscreen certification, or complete narration certification. No defect was reproduced in the updated one-object count wording or keyboard progress update in the bounded interactions above.
