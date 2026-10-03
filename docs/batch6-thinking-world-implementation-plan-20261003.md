# Batch 6 implementation and acceptance contract

Scope: Pattern Parade, Dino Hangman, Chess Explorers and Astronaut Academy. Four Amari games; Askia's existing games and child data are preserved. Base0d11256 includes the current functional production runtime and status documents; Batch3/4/5 implementations are separate branches and must later be integrated deliberately.

## Source audit

Pattern Parade uses random fixed-pool choices and adapts/reset from a hook mid-game; explanations auto-advance after2.2seconds. Hangman cycles a sliced short practice-word list and auto-advances after1.35seconds, including failure; decodability fallback can supply untaught words. Chess uses existing demonstration/puzzle data and generic difficulty; its legal-move and capture scope must be independently verified rather than inferred from visual highlights. Astronaut Academy relies on profile/trivia data and a timed fact overlay; facts and biographies need a clear mission/science progression and durable collection. These are source risks, not newly confirmed production defects.

## Required builds

| Game | Three chapters | Concrete interaction and data rules |
| --- | --- | --- |
| Pattern Parade | Repeat it / Change the rule / Growing festival | Six missions per chapter. AB/AAB/ABB/ABC/growing rules across objects, spoken sounds and movement. Show enough terms to establish the named rule; exactly one valid next term. Authored rule fact held until Next. Full content signature avoids repeats across eight runs before finite-pool exhaustion; new seed only at next run. |
| Dino Hangman | Word-family rescue / Picture-clue rescue / Independent rescue | Six distinct eligible words per chapter, all strictly within actually taught sounds; no silent untaught fallback. Positive rescue supplies, one-use picture/sound hint, visible recoverable failure and Retry/Next. Completed words earn stable dino facts; no timer removes feedback or failure. Word/letter options shuffle and stay frozen. |
| Chess Explorers | Piece moves / Safe captures / Mini-puzzles | Five puzzles per chapter with one stated objective. Name simplified miniature-board rules. Highlights agree with actual legal moves, paths respect blockers, own pieces cannot be captured, safe-capture tasks reject defended destinations under taught rules. Explain each move, hold feedback, retry wrong moves. Randomize puzzle order/positions without creating ambiguous “best move” objectives. |
| Astronaut Academy | Space science / Mission engineering / Review missions | Six missions per chapter. Labelled mission map with seeded question/options, age6 science/engineering facts, lasting fact cards/passport. Wrong concepts appear in later review runs, never replace the active question silently. Verify factual claims against primary sources and preserve attribution. Six completed missions unlock one chapter badge. |

## Shared acceptance

- Completed-only Amari progress; explicit three-chapter unlocks; replay positive best-star delta only; badges/facts persist after ordinary reload and do not appear for Askia.
- Parent-world Back with leave confirmation/Keep playing, internal chapter map, visible progression, no automatic home redirects; isolated UI state; chapter ownership bypasses generic session reset wrappers.
- Canonical privacy-safe diagnostics for wrong/correct/assisted/hint/completion; no wrong response counted as independent, no successful-attempt double credit. 48px interactive controls and390px layouts, illustrations/local assets with reduced-motion alternatives.
- Every narration phrase derived from a finite exact inventory and packaged-only playback; no paid/provider requests by builders or QA. Cancel narration on Next/replay/map/confirmed leave/unmount; Keep playing retains state. Root performs packaging separately after source freeze.
- Meaningful pure validators and source gates first, then a separate immutable candidate. Independent actual Playwright desktop1280×800 andmobile390×844 completes every chapter plus same-band replay, wrong/hint/held feedback, persistence/sibling/navigation/log controls. Preserve observed failures. No seeds/storage/progress injection.
- Audio file readiness/decode/native cancellation, human listening and physical/offline gates remain separate. Root integrates and releases only an accepted candidate; canonical Vercel identity and actual production Playwright evidence are required. No source/local test alone assigns4.5.
