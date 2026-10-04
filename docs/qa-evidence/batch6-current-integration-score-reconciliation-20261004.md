# Batch 6 current integration score reconciliation

Date: 4 October 2026  
Candidate runtime source: `2a82fd8fd17d9e76ec4310f2fecf489291f5bbff`  
Integrated Batch 6 source: `764b2ff49b6c40c13df928b4449d0a1f68fbe660`  
Candidate: frozen local build `http://127.0.0.1:5371/`; identity: [`batch6-integration-20261004/identity.json`](../../../dinospace-batch6-integration/docs/qa-evidence/batch6-integration-20261004/identity.json).

## Scope and independence

I built the Batch 6 games and the integrated candidate. This report has explicit **builder overlap** and is an evidence reconciliation for root review, not independent editorial acceptance. It reuses the retained full gameplay matrices and the separate bounded browser reports; it does not claim that every earlier observation was performed again on source `2a82fd8`. The four B6 game components/data are byte-identical to reviewed source `764b2ff`; the integration browser report binds the local build and independently checks its served identity, route entry, Pattern interaction, Askia path, and sound preference.

The historical assessment in the score-refresh worktree is preserved. Its 4.0 teaching/correctness findings refer to earlier candidate-specific issues: Pattern named the rule before the answer, Hangman used opaque word-family wording, Chess displayed unrelated piece rules, and Astronaut's single clue could reveal the answer. Later reviewed candidate `764b2ff` resolves these with neutral Pattern question wording; an ending-family explanation and letter-only clue in Hangman; mission-specific Chess rules with optional other-piece guidance; and distinct labelled `Learn clue` / `Mission clue` paths in Astronaut. The Astronaut `Learn clue` is deliberately answer-bearing teaching and is counted as assisted use. It must not be scored as an inference clue or mistaken for the old leak.

## Current candidate recommendations

Scores below cover the four non-audio dimensions supported by the retained evidence. They are recommendations for root's separate review, not an overall 4.5 award.

| Game | Age-6 teaching | Meaningful progression | Correctness and fair variation | Reliability, navigation and persistence |
|---|---:|---:|---:|---:|
| Pattern Parade | 4.5 | 4.5 | 4.5 | 4.5 |
| Dino Hangman | 4.5 | 4.5 | 4.5 | 4.5 |
| Chess Explorers | 4.5 | 4.5 | 4.5 | 4.5 |
| Astronaut Academy | 4.5 | 4.5 | 4.5 | 4.5 |

### Age-6 teaching — 4.5 each

- **Pattern Parade:** The independent copy delta sampled AB, AAB and ABB on desktop/mobile. The question is now the neutral “What comes next?”; clues describe the displayed repeat unit, while the rule name and explanation are held until the child answers. The retained screenshots show readable sequence choices and a held ABB explanation. See [`batch6-editorial-copy-browser-20261004/report.md`](../../../dinospace-batch6-quality/docs/qa-evidence/batch6-editorial-copy-browser-20261004/report.md).
- **Dino Hangman:** The sampled family prompt uses child-facing wording (“The hidden word ends in -at. Look for words with the same ending.”). A wrong letter preserves the question and reduces supplies; the optional Letter clue gives a letter rather than falsely presenting a phoneme. The original roadmap's strict taught-sound eligibility remains enforced in source, with no untaught-word fallback. The later chapters progressively reveal less support. The UI copy delta was a first-question sample, not a rerun of every word family.
- **Chess Explorers:** The sampled rook mission states one goal and the rook's applicable movement/blocker rule. The remaining pieces' rules are behind a collapsed optional disclosure, and the simplified-board limits are stated. A five-by-five board plus marked legal moves makes the instruction actionable. The independent sample covers the rook mission, while the retained full matrix and validators support the wider game.
- **Astronaut Academy:** The 36-mission source review and bounded ordinary play distinguish answer-bearing `Learn clue` from inferential `Mission clue`. The Learn clue labels its teaching role and counts as help; reasoning clues direct observation without stating the choice. Mars teaching, Earth day/night and Venus rotation samples show readable clues/diagrams, wrong-answer retry, and facts/source cards only after a correct choice. The diagrams appear only after requesting the clue. This is supported by source review plus representative UI checks, not 36 individually clicked clue reviews.

### Meaningful progression — 4.5 each

The retained full desktop and mobile gameplay lineage covers Pattern 3×6 rounds, Hangman 3×6, Chess 3×5 and Astronaut 3×6, with chapter locks/unlocks, completion rewards and ordinary replay. The routes change the skill or support: Pattern develops repeat/growing rules; Hangman moves from word endings to picture help and independent rescue; Chess moves from legal piece movement to safe captures and board puzzles; Astronaut moves from space science through engineering to later review of missed ideas. These are comparable chapter routes allowed by the roadmap, not level labels over unchanged content. Later focused repairs addressed the pre-answer copy and daily tracker obstruction while retaining the full matrix lineage. The retained [`batch6-full-local-20261003/report.md`](../../../dinospace-batch6-quality/docs/qa-evidence/batch6-full-local-20261003/report.md) lists each candidate and its scope; the current integration UI check confirms all four maps and sequential locks at 1280×800 and 390×844.

### Correctness and fair variation — 4.5 each

- **Pattern Parade:** authored validators require enough terms for the rule, a unique defensible answer and supported growth rules. Full-content signatures drive queue avoidance so visually identical variants are not treated as novel. The retained full runs and later AB/AAB/ABB visible checks support the authored rule/clue/answer alignment. The finite content pool is documented; no claim is made that a finite pool can avoid repeats forever.
- **Dino Hangman:** word eligibility is built from the existing taught-grapheme segmentation and has no fallback to an untaught word. Stable word IDs, frozen run queues, randomized letter choices, miss/retry recovery and held facts were exercised in the full matrix. The focused copy review confirms that the family clue describes the ending and the letter clue does not misstate sound knowledge.
- **Chess Explorers:** canonical puzzle checks cover piece-specific legal movement, blockers, board limits, friendly occupancy and defended captures. The retained mechanics review exercised blocked moves, retry after a legal but incorrect destination, stale-error clearing after a successful move, and safe capture. Each puzzle has one stated objective; the mini-board's omitted check, castling and promotion rules are disclosed. The editorial delta directly checked a rook objective, not every authored piece instruction.
- **Astronaut Academy:** the source validator checks answer uniqueness and approved NASA/JPL/ESA source links; missions retain fact/source cards after correct answers, and review queues bring missed concepts into a later run. Source review covered all 36 missions and representative ordinary runs exercised retries, the answer-bearing Learn clue's assisted scoring, and the separate inferential clue. Evidence supports the repaired interaction model. Full rendered clue-by-clue review of all missions remains a narrow residual editorial check, not grounds to preserve the superseded 4.0 answer-leak score.

### Reliability, navigation and persistence — 4.5 each

The old `5363` candidate has a reproduced mute preference reset after reload; its historical 4.0 reliability assessment remains accurate for that candidate only. The current canonical integration retains the saved sound preference. Independent UI at `5371` toggled sound both ways and confirmed persistence through reload and route re-entry at desktop and 390px; it also opened all four Amari chapter maps, exercised Pattern wrong/retry/held-success/Next/confirmed parent return, and verified that Askia still reaches its separate legacy Pattern flow. The retained per-game reliability controls additionally establish normal replay credit and reload outcomes: Pattern best-star gain persisted; a clue-assisted lower Hangman replay left its best record unchanged; Chess equal replay yielded no extra stars and its mobile improvement credited only +1; Astronaut's passport and chapter records survived reload. The progress helper namespaces records by player and game and awards only a positive best-star delta.

This is a 4.5 recommendation, not 5: the integrated-candidate UI delta did not play all four active flows through a full chapter, and ordinary Askia UI comparison proves visible global-star separation rather than every same-game badge/fact collection boundary. Source ownership tests support those boundaries. The current B6 UI evidence is bounded and does not assert a fresh, like-for-like sibling collection test for each game. See [`batch6-integration-browser-20261004/report.md`](../../../dinospace-batch6-integration/docs/qa-evidence/batch6-integration-browser-20261004/report.md), [`batch6-reliability-followup-20261004/report.md`](../../../dinospace-batch6-quality/docs/qa-evidence/batch6-reliability-followup-20261004/report.md), and [`batch6-reliability-root-20261004/report.md`](../../../dinospace-batch6-quality/docs/qa-evidence/batch6-reliability-root-20261004/report.md). Root owns the Chess reliability report; these are attributed evidence, not my browser observations.

## Unscored and open gates

The roadmap's combined feedback/audio/visual dimension remains **unscored**. The current B6 inventory has 378 unique phrases: 1 ready and 377 missing. Correct/wrong WebAudio event scheduling is not playback or human-listening evidence. No child-appropriate pronunciation, pacing, intelligibility, or audio cancellation acceptance is claimed. The B6 batch still needs its packaged narration corpus, runtime playback/cancellation checks, human listening, and production release controls. No overall mean or Batch 6 4.5 award is made here.

The integration candidate is a configured local build, not production. The separate independent integration report observed zero console messages and no voice/story requests during its guarded run; its visible UI scope is described there. Do not extend those claims to unplayed active flows or other sessions.

## Evidence references

- Integrated builder report and full identity: [`batch6-integration-20261004/report.md`](../../../dinospace-batch6-integration/docs/qa-evidence/batch6-integration-20261004/report.md) and [`identity.json`](../../../dinospace-batch6-integration/docs/qa-evidence/batch6-integration-20261004/identity.json).
- Independent integration delta: [`batch6-integration-browser-20261004/report.md`](../../../dinospace-batch6-integration/docs/qa-evidence/batch6-integration-browser-20261004/report.md).
- Full game matrix and candidate-specific failures/repairs: [`batch6-full-local-20261003/report.md`](../../../dinospace-batch6-quality/docs/qa-evidence/batch6-full-local-20261003/report.md).
- Editorial and Astronaut clue controls: [`batch6-editorial-copy-browser-20261004/report.md`](../../../dinospace-batch6-quality/docs/qa-evidence/batch6-editorial-copy-browser-20261004/report.md), [`batch6-astronaut-teaching-independent-20261004/report.md`](../../../dinospace-batch6-quality/docs/qa-evidence/batch6-astronaut-teaching-independent-20261004/report.md), and [`batch6-astronaut-diagram-followup-20261004/report.md`](../../../dinospace-batch6-quality/docs/qa-evidence/batch6-astronaut-diagram-followup-20261004/report.md).
- Reliability and replay controls: [`batch6-reliability-followup-20261004/report.md`](../../../dinospace-batch6-quality/docs/qa-evidence/batch6-reliability-followup-20261004/report.md) and [`batch6-reliability-root-20261004/report.md`](../../../dinospace-batch6-quality/docs/qa-evidence/batch6-reliability-root-20261004/report.md).
- Historical scores and their superseded candidate findings remain in `dinospace-b2-score-refresh/docs/qa-evidence/batch6-independent-editorial-assessment-20261004.md`; this report does not edit or replace that history.
