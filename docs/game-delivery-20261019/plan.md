# Amari game delivery plan

Raise each current activity to a reasoned 5/5 editorial acceptance, delivering four games per batch. The next batch is Storybook Studio, Spelling Studio, Memory Match and Letter Trace. Close each game individually, then release and verify the batch before beginning the next one.

The current catalogue contains 34 activities: the original 26, Code Cadets and My Writing Desk, and six little-explorer activities also exposed in Amari’s worlds. The final batch therefore contains two activities. `status.json` inventories each activity exactly once. The 4 October ledger remains historical. Recent seven-game UX repairs retain their tested acceptance; broader teaching, content, imagery and editorial acceptance remain separate.

## Delivery workflow

1. **Audit one game.** Root rehearses the existing production route and records specific defects, speed and visual problems. Luna reviews its mechanics/content and receives bounded implementation work. Preserve good mechanics and prior source-bound evidence.
2. **Define the game contract.** State the first task, learning progression, correct/wrong/hint behavior, imagery, audio, persistence and performance budgets. Record every required scenario before changing code.
3. **Implement and review.** Luna repairs the game. Root reviews teaching correctness and integration, then independently plays it. Return failures for correction. No batch advances while a required game gate is unresolved.
4. **Verify candidate and production.** Check the actual deployed identity and rendered assets. Use the single contained synthetic Chromium session at 1440×844 and 390×844. Exercise all stages, ordinary randomized starts, mistakes, hints, replay, leave/back, reload, save/recovery and relevant touch/keyboard controls. Tests/build support the decision; they do not replace gameplay.
5. **Score and close.** Root records five dimension scores with reasons: teaching, progression, correctness/variation, visual/audio usability, and reliability/navigation/persistence. Target 5 in each dimension with all mandatory checks passed and no known blocker. A missing gate stays pending, with no invented numeric score. Retest affected behavior after each repair. Publish per-game verdicts and batch production evidence.

Keep at most four games in the active batch and one game under final acceptance at a time. No recurring monitor is restarted. A separate explicit external dependency may be documented, but its game remains unaccepted until the gate is satisfied.

## Imagery and interaction standard

- Review both catalogue/world artwork and the actual game screens. Upgrade whichever is weak; a new thumbnail does not finish a game redesign.
- Retain Discovery HQ’s illustrated style, palette, rounded panels and character language. Give each screen one clear primary task and a visible first action. Keep optional tools behind an obvious secondary control.
- Use image generation for illustrations, backgrounds, characters and recognisable learning objects when it improves the lesson. Use existing vectors for controls and diagrams. Keep text and buttons live HTML; never bake interactive UI into a bitmap.
- Learning images must depict the intended word, quantity or concept unambiguously. Check generated anatomy, object counts, letter forms, map geography and scientific facts separately. Decorative art must not obscure targets or reveal answers.
- Crop intentionally at desktop/mobile; use appropriately compressed WebP assets, explicit dimensions and loading states. Record provenance and bundle growth; reuse existing assets where they already pass. The user’s existing built-in image-generation allowance/credits authorization persists. Third-party story/voice spend has its own bounded release test.
- Minimum primary targets 48px; visible focus; spoken instruction replay; clear sound-off guidance. A labelled accessible equivalent is required for gestures.

## Next batch acceptance contracts

### 1 Storybook Studio

**First priority:** separate a fast child-facing reading shelf from parent-controlled story creation.

- Reading: all seven curated books, all pages and required imagery/narration work; clear Read/Continue and return to shelf. Check word help, three comprehension steps, safe wrong-answer recovery, favourites and per-child resume. Inspect narration playback and human-listen for intelligibility and text agreement.
- Persistence: explicitly distinguish curated books from generated books stored in this browser. Test backup/export→import round-trip, partial/missing assets, storage failure and duplicate imports in an isolated profile. Never label new books as recovered legacy stories.
- Speed: record three fresh and three warm runs at each viewport, with cache/network conditions. Working budgets: visible usable shelf within 2 seconds on the agreed normal-network test; warm page navigation within 500ms once assets are ready. Optimize to those budgets; any exception needs measured root cause and a revised concrete decision.
- Creation: acknowledge within 200ms; show truthful stage counts, elapsed time and actionable errors. Provide Pause/Cancel and Resume; no indefinite modal. Return usable story text after the outline and progressively add assets, without representing an unfinished book as complete. Existing library remains reachable during a long generation.
- Reliability: bounded session/outline/image/narration timeouts; cancellation reaches all in-flight work; failure does not leave sibling workers generating or create duplicate paid retries. Retry only missing assets, preserve completed work, and validate a complete saved book before Ready.
- Provider gate: use deterministic simulated slow/failure/recovery tests first. Then one explicitly budgeted end-to-end provider-generated QA book is needed to establish current generation latency and provider health. Do not generate multiple books to fill an evidence gap. Technical playback and human listening are distinct checks.
- Imagery/UX: put Read/Continue and actual book cards above parent management and creation; the observed mobile first screen contains no book cards. Reduce shelf controls competing with reading, expose parent creation tools clearly, review all covers/pages for crop, continuity and text/image agreement. Use generated replacement art where it is actually needed.

**Source findings, not incident diagnoses:** 10-page creation requests an outline plus 11 images and 11 narrations; cover image and cover narration precede the three page workers. Busy UI currently advertises 7–10 minutes, has no visible cancel, and asks the parent to keep the screen open. Session/outline requests have no client timeout/controller supplied; the AbortController begins later. Custom records hydrate every saved page asset when their records update. Worker failures do not explicitly abort the other workers. These paths require repair/reproduction; current provider success and latency remain unverified until the provider gate.

### 2 Spelling Studio

- Reproduce the wrapper’s 5/6/7 targets against WordBuilder’s fixed-five local meter; align them and hold the final explanation until Next word.
- Make Copy→Missing Sound→Build Whole Word meaningful stages. Keep optional practice modes from silently bypassing the named task or resetting one counter while another continues.
- Expand and review decodable content to the existing roadmap’s 20+ eligible words per band. Never introduce untaught graphemes through a small-pool fallback. Keep all repeated letters and multi-letter sounds buildable.
- Seed/shuffle word queues and tile positions independently; test three restarts per band, no repeat before exhaustion, recent-item avoidance and correct retry behavior.
- Replace generic or ambiguous picture hints with word-specific illustration/context and visible, accessible teaching feedback. Review tricky words individually; no generic star as the only teaching clue.
- At both sizes complete all stages, wrong retry, hint, final feedback held ≥6 seconds, replay/next/back; verify caption save and profile progress after reload. Check audio/image/answer agreement and ordinary keyboard/touch use.

### 3 Memory Match

- Preserve L1–L5 counts **4→8→10→12→13 pairs** and later boards **14→15→16→17→18**. Complete all ten boards at both sizes, check every pair appears exactly twice and layouts vary across ten ordinary seeded decks.
- Reproduce the source risk: reach L5+, replay L2, complete it, reload. Preserve the highest progression resume point while allowing an intentional selected replay. Define and label resume versus replay explicitly.
- Add visible sound-off mismatch guidance after cards turn over; retain enough viewing time and a useful scan/remember strategy. Explain the jump from four to eight pairs.
- Show a discoverable level-strip navigation cue. Check 390px target size and legibility at the largest board, native touch, keyboard focus, hint, rewards, saved best moves and later-visit adaptation.
- Review the existing themed illustrations and packaged 183 narration clips. Reuse passing assets; replace any unclear card art. Decode/playback success does not satisfy human listening.

### 4 Letter Trace

- Make the first stroke and direction unmistakable; show a single Start/Next action, animated stroke order, start dot and gentle visible retry.
- Rehearse short, curved and multi-stroke uppercase/lowercase forms using slow and ordinary-speed mouse and native touch. Verify correct paths advance, off-path scribbles do not, early lift restarts only the unfinished stroke, and earlier strokes survive pointer cancellation.
- Include `i`/`j` dot and lift behavior and a discoverable keyboard tracing equivalent with clear focus/instructions. Test the Amari and little-profile routes separately.
- Check all three bands with at least eight eligible letters per band and the taught-grapheme-dependent CVC extension. Restricted profiles receive a clear learning prerequisite rather than an unexplained failed start.
- Review actual word illustrations for semantic accuracy and beginning sound; replace indirect emoji such as musical notes standing for an instrument if that item is reachable. Preserve standard letterforms and visible tracing contrast when adding art.
- Complete chapter/reward, retry, parent return and reload persistence at both sizes. Do not score only the easy straight-letter case.

## Remaining batch order and required focus

Every row inherits the shared evidence/imagery standard and the corresponding detailed game contract in `../game-quality-4.5-roadmap.md`. New activities have explicit contracts below. Recent narrow repairs are regression baselines; they do not erase wider content gates.

| Batch | Four activities | Main acceptance focus |
| --- | --- | --- |
| 2 | Puzzle Pop; Spot the Difference; Sky Shapes; Monster Math | All 12 scenes per scene game; correct crop/tray/hotspots and 3/5/7 differences; tracing alternatives and accuracy; visual maths model agrees with answer. Hold facts, vary runs, verify all chapters. |
| 3 | Count the Stars; Addition Adventure; Subtraction Station; Number Line Jump | Countable tappable objects, no overlap; combine/remove/compare stories; correct manipulatives and hops; meaningful three-band progression, wrong clues and persistence. |
| 4 | Time Teller; Curriculum Quest; German Garage; Letter Launch | Real clock/hand-setting and quarter/past/to lessons; three curriculum modules and durable facts; bilingual bays/tabs; taught-grapheme phonics chapters. Full seeded queues, audio replay, rewards and parent returns. |
| 5 | Dino Detective; Dino Hangman; Cosmic Tic-Tac-Toe; Astronaut Academy | Distinct illustrated scenes/facts; decodable rescue words and safe failure; line/block/fork teaching with legal bot moves; mission diversity and later review of missed concepts. |
| 6 | Sound Safari; Colour Mixing Lab; Odd One Out; Pattern Parade | Build on held-feedback repairs: richer phoneme/blend/segment teaching; shades/colour hunt/palette; defensible semantic/visual/rule categories; AB/AAB/ABB/ABC/growing patterns. Audit sound/image semantics and full progression. |
| 7 | Solar System; Chess Explorers; Code Cadets; My Writing Desk | Preserve current control/export repairs. Complete planet discovery passport; legal captures/mini-puzzles; code sequence/debug/repeat and child-created route save/reopen; writing/format/picture/export teaching. Verify all required stages rather than just first task. |
| 8 | Dino Jigsaw; Shadow Match; Rocket Builder; Fuel Up | Jigsaw pieces form the exact reference with snap/retry and progressive layouts; one defensible shadow match and distinct silhouettes; named rocket construction order and launch/reset; rendered fuel count equals target. Native touch/keyboard equivalent, larger age-6 challenge and gentle younger route. |
| 9 | Fire Truck Rescue; Ladder Rescue | Reachable fire targets and correct remaining count with success/reset; ladder height/floor matches the animal target and supports safe correction. Clear first action, finite varied missions, target size and persistence at both profiles/sizes. Final cross-world integration and catalogue audit. |

## Release and resource record

For each game store: route/profile, source SHA, deployment, rendered asset identities, baseline, discovered defects, exact fixes, scenario results, visual/audio review, timings, unresolved gates and reasoned scores. For each batch store the four per-game verdicts and canonical production rehearsal. Mark a batch complete only when each game passes. The last two-game batch is intentionally smaller.

Reuse this checkout and compatible dependencies. No new checkout/install without a fresh resource check. Use one contained synthetic browser, no real child-data writes, and failure-only traces/videos. Retain a compact summary plus representative final images and unique failures once; aim for under 10 MiB per batch. Close task-owned processes at handoff and preserve unrelated files. The user has authorized built-in imagery generation allowance/credits; no autonomous paid story/voice corpus jobs or monitoring restarts are part of this plan.
