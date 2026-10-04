# Spelling Studio Phase 2 default: independent browser delta

Date: 2026-10-04  
Candidate: frozen local build `http://127.0.0.1:5364/`  
Source: `f9d398281b86fde8d41a719f54137ab6d835d70a`  
Candidate identity: [batch5-phase2-default-20261004/identity.json](../batch5-phase2-default-20261004/identity.json). The builder identity records HTTP 200 and matching SHA-256 for `index.html`, the served JS, and CSS. This is local candidate evidence only; it is not release or audio acceptance.

## Guarded setup

Used two new Playwright sessions, `b5-phase2-default-dt-20261004` and `b5-phase2-default-mob-20261004`. Each began at `about:blank`; `/api/voice` and `/api/story` were routed to HTTP 403 before the first app navigation and verified in `route-list`. Sound was switched off through the visible `Turn sound off` button before gameplay. Both sessions used a fresh ordinary profile, selected Amari through the visible player card, and entered Spelling Studio through Read & Write. No saved settings were edited and no local storage/progress/answers were injected.

## Desktop, 1280 × 800

On initial Spelling Studio entry, Chapter 1 was selected and displayed `This chapter has 36 words you can make with your learned sounds. It needs at least 20.` The Chapter 2 control was locked. Started Chapter 1 and completed six visible word rounds with the displayed grapheme tiles: `pan`, `not`, `tap`, `sad`, `nod`, `tip`. Each completion showed positive feedback and its sound sequence; Finish chapter earned the badge and unlocked Chapter 2 through normal play.

Chapter 2 then displayed `This chapter has 31 words you can make with your learned sounds. It needs at least 20.` Started the chapter. The first visible prompt was `s • ck` with the clue “Clothing for a foot”; the four visible choices were `o`, `f`, `n`, and `d`. Choosing `f` produced “Not quite. Say the word slowly and listen again.” Choosing `o` completed `SOCK`; the prompt remained held with the `/s/ /o/ /ck/` sequence and a `Next word` control. Screenshot: [desktop Chapter 2 held sock](screenshots/desktop-chapter2-held-sock.png).

## Mobile, 390 × 844

A separate fresh profile showed the same Chapter 1 default and 36 eligible words, with Chapter 2 locked. Completed six visible rounds through actual tile controls: `top`, `sad`, `tin`, `pin`, `kid`, `cot`. Positive feedback and sound sequences appeared; Finish chapter earned the badge and unlocked Chapter 2.

Chapter 2 displayed 31 eligible words. Started normally; the first visible prompt was `h u •` with the clue “Breathe out in a cross way” and choices `n`, `g`, `u`, `ff`. Wrong choice `n` showed retry feedback; `ff` completed `HUFF`, displayed `/h/ /u/ /ff/`, and held the result with `Next word`. The held-result panel and `Next word` button were below the initial 844px viewport edge; a normal vertical scroll brought both into view. The choice buttons and Next button render as large full-width touch controls. Screenshot after scrolling: [mobile Chapter 2 held huff and Next](screenshots/mobile-chapter2-held-huff.png).

## Runtime observations and limits

- Both fresh sessions independently reached the Chapter 2 start state with a 31-word eligible pool without changing settings. This addresses the earlier 0-pool observation recorded separately in [the 5362 independent copy report](../batch5-spelling-pool-copy-independent-20261004/report.md); that report and its observation remain unchanged.
- The visible Chapter 2 prompts use grapheme choices available in the fresh default pool and support wrong-answer recovery, a held correct result, and Next.
- Browser console: 0 errors and 0 warnings in each session. Network summary showed 12 static requests and no non-static requests; provider routes remained guarded. No narration playback or human listening quality was evaluated.
- Scope is the fresh Phase 2 default flow, ordinary Chapter 1 unlock, and one Chapter 2 wrong/correct held round at each viewport. This is not a full Spelling Studio matrix or overall game acceptance.
