# Batch 5 integrated visual and feedback review

Date: 4 October 2026  
Candidate reviewed: local frozen integration `http://127.0.0.1:5368/`, source `b198dbf49a5023e1b50181a9ef2a3eabd4c80a35`.  
Identity: [`batch5-integration-20261004/identity.json`](../../../dinospace-batch5-integration/docs/qa-evidence/batch5-integration-20261004/identity.json), including served file hashes and integrated component hashes.

This is a visual and visible-feedback follow-up for Sound Safari, Spelling Studio, Colour Mixing Lab and Odd One Out. It does not assign a combined feedback/audio/visual score, an overall score, or release acceptance. No new gameplay matrix or provider request was performed.

## Candidate lineage and inspected evidence

I reviewed the actual rendered 5368 mobile Spelling held-success screen and desktop Odd One Out held-reason screen. I also reviewed the retained 390px screens for the 5255 mobile-repair candidate: Sound Safari active picture choices; Spelling Studio chapter layout; Colour Mixing Lab design recipe; and Odd One Out picture choices. The B5 full-matrix/repair records bind those views to the game implementation: current Sound Safari, Colour Mixing, and Odd One Out component files are byte-identical to the reviewed component source; Spelling's component change between 5255 and the integrated 5368 is limited to the later child-copy refinements. The integration itself carries served-asset identity and its own mobile Spelling/desktop Odd screenshots.

The 5255 screens are evidence for the unchanged component design and narrow fixes, not fresh 5368 browser runs. In particular, the old 5241 duplicate-recipe and daily-tracker screenshots remain failures of 5241. The separate 5255 report records their fixes; current component source has the one-input/one-output recipe presentation and hides the floating tracker during these games.

## Findings by game

### Sound Safari — visual polish gap

The retained 390px active screen fits the prompt, sound controls, four picture choices, and hint in the viewport. The four 112px-high choice cards have clear spacing and a large touch area. Their pictured choices, however, are generic Unicode emoji rendered as roughly 48px glyphs without visible names. In the reviewed sample, the options included a person glyph and a beach umbrella; those are less controlled and less specific than a purpose-drawn picture set, and their appearance can vary by operating system. This is the one concrete visual-quality gap against the requested polished, illustrated direction. It is an editorial/art issue, separate from the missing pure-phoneme package.

**Suggested repair:** replace only the picture glyphs with a cohesive, locally packaged set of clear object illustrations. Preserve the picture-choice task: do not add visible word labels where they would turn “which picture starts with this sound?” into a word-reading task. Keep descriptive accessible names and the existing touch targets.

**Acceptance check:** at natural 390px and 1280px sizes, render representative match, blend and segment choices with their authored clues. Confirm each pictured object is recognizable without zooming, distinguishable from all three decoys, matches the authored word, stays fully inside its choice, and does not cover the sound, hint or Next controls. Keep the 37 missing pure sounds as a separately reported functional/audio gate; art cannot substitute for them.

### Spelling Studio — readable teaching card

The current 5368 mobile held-success screenshot has a strong reading order: prompt and replay controls, a single picture clue, the word model/assembled letters, sound-by-sound feedback, then Next. The artwork is a simple emoji pictogram, but it is paired with an explicit picture clue and visible letters, so the inspected `TOP` example remains understandable without relying on emoji nuance. Text and tile buttons fit the screenshot; the completion panel's green background is paired with words and phoneme chips rather than used as the only signal. The earlier 5255 chapter-map screen also fits all three chapter rows and the start/practice controls at 390px.

I found no concrete visual or feedback defect in these retained screens that warrants a runtime repair. A consistent illustrated picture set could improve finish, but this review does not treat that optional art refinement as a blocker. The spoken phoneme, pronunciation and listening quality remain unreviewed.

### Colour Mixing Lab — model and result remain visible

The retained 390px designer screen uses labelled paint-pot drawings, a two-part recipe and a named beaker result. The design brief is illustrated with an object scene; recipe choices show the two input swatches plus their names/result. This supplies a visual relationship among inputs, recipe and output, rather than relying on colour alone. The 5255 mobile repair screenshot shows Red and Yellow exactly once in the active recipe; the duplicate “Added Yellow” chip seen on 5241 is absent. The six-round panel is taller than one mobile viewport and scrolls vertically, while the repair screenshot shows the recipe controls in view; the integration report separately records ordinary wrong/retry/correct, held fact and Next behavior.

I found no current visual defect in the inspected material. The old tracker overlap and duplicate-input defects are candidate-specific to 5241 and are not carried forward as current findings. Human hearing of colour brief/fact narration is separate.

### Odd One Out — clear group, choice and reason

The 390px question screen shows a plain named group, four large labelled picture cards, and one hint control. The 5368 desktop held state shows the selected item, an explanation that repeats the named property, a “Hear why” control, and a wide Next puzzle button. The art is simple custom line drawing rather than platform emoji in this sample; items and labels remain distinct. No overlay, clipping or colour-only correctness cue appears in the inspected mobile screen. The integration report also records the item-then-reason sequence and held explanation.

I found no concrete visual or visible-feedback defect in these screens that warrants a runtime repair. The illustrated icons are simple but coherent at their displayed scale. The spoken rule and “Hear why” audio still need the separate packaged-media and listening review.

## Separate media boundary

The current integration inventory records **0/37** pure phoneme clips ready for Sound Safari, alongside incomplete narration inventories. The 5368 active Sound Safari test was muted; its pure-sound button was disabled by that visible mute state. Neither fact is evidence of successful or failed sound-on playback. The visual sample is therefore not acceptance of Sound Safari's core listening task. No human listening or full audio-quality judgment is claimed for any game.

## Result

The retained screenshots and source identity support adequate sampled mobile layout and visible feedback for Spelling Studio, Colour Mixing Lab and Odd One Out; their known 5241 layout issues were separately repaired in the byte-bound component lineage. Sound Safari's controls fit and have good touch sizing, but its emoji-only picture vocabulary is visibly less polished and less controlled than a cohesive illustration set. I recommend a bounded local-art replacement and visual delta for Sound Safari before assigning a positive combined visual/audio/feedback judgment. Keep the combined dimension unscored for all four until packaged media and human listening are complete. No broad gameplay rerun is indicated by this screenshot review.
