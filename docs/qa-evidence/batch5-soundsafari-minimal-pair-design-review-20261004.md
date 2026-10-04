# Sound Safari minimal-pair listening: source design review

Date: 4 October 2026  
Reviewed source: `5e94c429859717c79da8d604681624a67c006e67`  
Scope: source/data and roadmap review only. No runtime changes, artwork generation, browser play, paid calls, or listening assessment.

## Finding

The current Chapter 1 exercise plays a single phoneme and asks the learner to choose among four pictures whose initial phonemes differ. Chapter 2 blends a sequence of phonemes, and Chapter 3 asks for first, middle, or last sound positions. Those activities do not implement the roadmap’s whole-word minimal-pair listening requirement. In particular, the current choices do not ask the child to discriminate one sound contrast between two otherwise similar spoken words.

The existing 79-word chapter lists already contain usable minimal pairs. A pair qualifies when both authored phoneme sequences have equal length and differ at exactly one position. A pure read of the current chapter arrays found 32 distinct relations in Chapter 1, 9 in Chapter 2, and 7 in Chapter 3. Counting both target directions gives 64, 18, and 14 directed questions respectively. Examples from the authored data include `cat/bat`, `cat/rat`, `cat/cap`, `hen/pen`, `duck/dock`, `sock/rock`, `boat/coat`, and `tooth/teeth`.

## Recommended exercise contract

Add a distinct `minimalPair` question type. Each question plays one complete spoken word and presents exactly two wordless picture choices for the contrast pair. The child chooses which picture names the word they heard. Keep this separate from the existing first-sound task and its four phoneme-token choices.

Generate only from pairs whose two words are both eligible for the learner’s saved taught set. Eligibility must require both the authored graphemes and the actual phoneme sequence, using explicit correspondences where the spelling and phoneme IDs differ. In particular, `branch` and `grass` must require the taught `ar` phoneme for their `/ɑː/` pronunciation; selected short `a` alone is insufficient. The existing `th`/`th-unvoiced` distinction also needs explicit treatment. An untaught phoneme must never appear as the target or as a distractor.

Represent each pair with stable IDs and auditable data: two word IDs, both phoneme sequences, the single contrast position, chapter eligibility, artwork IDs, pronunciation/audio keys, and an authored after-answer context sentence. Generate the two target directions as separate question IDs, shuffle left/right placement, and ensure both positions are balanced over a run. The recorded target must agree with the selected image, word record, and contrast metadata.

Use six unique questions per run, matching the existing chapter length. The current pool has only 18 directed Chapter 2 items and 14 directed Chapter 3 items; those are adequate for complete six-question runs but do not satisfy the implementation’s generic `pool.length >= 20` gate. Give the minimal-pair task an explicit finite-pool rule instead of silently blocking a valid six-question run: require at least six eligible directed questions, never repeat a question within a run, and avoid recent IDs on replay until the eligible pool is exhausted. Report the eligible count and finite-pool behavior truthfully. If product requirements later demand 20+ no-repeat questions per chapter, author more valid taught words/pairs and package their images/audio rather than weakening the contrast rule.

Before answering, show no written target, answer label, explanatory clue, or target-specific fact in the visual prompt. The two accessible choice names should remain available to assistive technology, but must not be rendered as visible answer text. A generic animal guide may say “Listen to the whole word” before the response. After a correct answer, show the two word names, identify the differing sound, and add the authored animal/context fact; after a wrong answer, offer a neutral replay/retry without naming the correct picture. Do not reveal the answer through a pre-answer hint, highlighted option, image caption, or target-specific animal fact.

Example for the `bat/cat` pair, after the choice is correct: “A bat is an animal that flies. Bat starts with /b/; cat starts with /k/.” For `hen/pen`, use “A hen is a bird. Hen starts with /h/; pen starts with /p/.” For non-animal contrasts such as `boat/coat`, a recurring animal guide can provide the context (“Robin is listening with you”) without hinting which picture is correct; the post-answer explanation then states the two words and their differing sound. Keep all contrast wording after answer confirmation.

## Data and validation work needed before implementation

1. Add a pure pair builder and phoneme-eligibility helper. Check that sequences have equal length and exactly one differing phoneme; reject duplicate words, duplicate pair relations, missing clip keys, absent taught phonemes, missing art, or mismatched contrast positions.
2. Apply phoneme eligibility to every existing question type as well as the new pair builder. Add a saved-profile regression that selects Phase 2+3 sounds except `ar`, and proves `branch`/`grass` and all questions containing `/ɑː/` disappear; with `ar` selected, verify they can enter only where their full word is taught.
3. Validate six unique question IDs per generated run, target/answer/audio/image agreement, left/right balance across many seeds, no within-run repeat, and recent-question avoidance until finite-pool exhaustion. Cover the 32/9/7 relation counts as a source inventory check, not as evidence of playable art/audio.
4. Keep the game’s current art gate. Do not enable this exercise until both images for each eligible pair are packaged, distinct and fair at the rendered size, and each target word has the correct local recording. Existing report records zero packaged Sound Safari pictures and 0/37 pure-phoneme clips; neither this source review nor synthetic tests closes those asset or listening gates.

## Minimal acceptance matrix

- Source/data: each chapter yields its expected valid pair inventory; no repeated or multi-phoneme contrast enters the pair task.
- Saved settings: test default Phase 2, Phase 3 with `ar` selected, and Phase 3 with `ar` off. The latter must exclude `branch`, `grass`, and `/ɑː/` targets and distractors.
- Run logic: six unique questions; both picture positions occur; retry, one-use hint, correct held explanation, and Next/reset behavior work. Replay avoids recent questions until its valid finite pool is exhausted.
- Packaged local UI, once art/audio exist: actual 1280×800 and 390×844 layouts; two clear wordless images; no answer text before response; controls meet the existing touch-size contract; labels/context fit; no console or asset errors.
- Listening: a human reviewer confirms that the played whole word, intended minimal contrast, image, answer, and post-answer explanation agree. Static audio availability or successful playback events alone do not establish this.

## Boundaries

This is an implementation design recommendation, not an acceptance result. It does not claim that the existing pictures are fair, the recordings are packaged or correct, or children can hear the intended contrasts. The separate current source finding that `branch` and `grass` can bypass actual-phoneme eligibility remains a concrete defect until code and saved-setting regression evidence close it.
