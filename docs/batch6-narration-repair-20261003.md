# Batch 6 narration routing repair

Root found a real silence defect: Pattern, Chess and Astronaut clue copy had changed, while packaged-only narration still admitted older phrases. Chess legal-but-wrong-goal feedback also differed by one word. The runtime rejected these authored messages before looking for a clip.

Current visible and spoken clues now share exact phrase helpers. The finite authored allowlist includes every Pattern rule/remix, Chess board-coordinate clue and Astronaut science/engineering/review clue. Unknown or child-supplied text remains rejected; calls remain packaged-only (`premium:false`).

Hangman's former “Sound clue” displayed phoneme slashes but spoke a letter cue. It now truthfully says “Letter clue” and “Find the letter…”; this change does not certify pure-phoneme teaching or change the one-use hint/assisted-credit policy.

Verification: eight focused data/invariant tests passed, including every current authored clue and AAB/ABB three-place units. Changed-file lint and production-configured build passed. This closes narration routing, not playback acceptance.

The read-only [audio audit](qa-evidence/batch6-narration-readiness-20261003.json) reports **435 unique phrases, 1 valid clip, 434 missing, 0 invalid**. Existing clip is fully decoded. No provider calls or manifest mutation. No concurrent generation while Batch4's authorized finite worker remains active. Missing clips, listening, actual native media controls and production acceptance remain open; no4.5 score is awarded.

Prior full gameplay matrix and the5267tracker proof retain their original identity. This narration/label delta requires independent visible-control QA on the new frozen build.
