# Batch 6 bounded reliability follow-up

Date: 4 October 2026  
Tester: independent Playwright UI review  
Runtime under review: frozen candidate `http://127.0.0.1:5363/`, source `60f362368d5eedb3b43dedc4fa95eb3097672d7e`.  
Scope: saved chapter/fact/badge state and ordinary replay scoring for Pattern Parade, Dino Hangman and Astronaut Academy; combines with root-owned Chess reliability evidence on the same frozen runtime. This supplements the retained desktop/mobile full gameplay baseline; it is not a new matrix or 4.5 award.

## Candidate identity and browser setup

Builder identity at [`batch6-editorial-copy identity`](../batch6-editorial-copy-20261004/identity.json) records 5,610 served files, all matching the frozen dist. I independently fetched the main JavaScript and CSS: `assets/index-C42-a2Zu.js` SHA-256 `3aa0eb4a25efd0b7c6e6c5a142374954d57aa98b256b3a23f54f00283a0aafc7` and `assets/index-CZIXwkmD.css` SHA-256 `c057757199ab545e7594e3b53abd89e1ce8ada62cb531f0f0fafbcb8a2d869b3`; both matched the frozen dist. Root’s same-candidate four-file check is recorded in [`Chess identity`](../batch6-reliability-root-20261004/identity.json).

I resumed the existing `b6-copy-desktop` Amari profile, already loaded at the Astronaut map before this reliability assignment. I installed Playwright route handlers for `/api/voice` and `/api/story` before subsequent reloads and game/world/profile navigation; `route-list` showed both routes active with 204 no-content responses. The profile’s initial app load predates these handlers, so I do not claim the first load was guarded. After guard installation, the request listing contained no dynamic requests (102 successful static requests were omitted by the CLI default view). The console had zero messages, errors or warnings. Sound was kept muted using the visible control after each reload; no Hear control was activated and no audio was played. All progress came from ordinary visible UI actions in this existing synthetic profile, with no seed, storage, answer or progress injection.

## Per-game reliability evidence

| Game | Ordinary run / replay | Saved state after reload | Reliability finding |
|---|---|---|---|
| Astronaut Academy | Existing Review missions best was 2 stars. A clean six-question ordinary replay completed at 3 stars. | Chapter map showed Review missions 3/3, unchanged other bests, and Passport count 29 (up from 24 before replay); after guarded reload the map still showed 3/3 and 29 facts. | Higher replay improved best by one star. Five newly collected facts appeared in the Passport; existing facts were not duplicated. No loss of chapter unlocks. |
| Pattern Parade | Existing Repeat it best was 1 star. A clean six-question replay using visible sequences/options completed at 3 stars. | Map showed Repeat it 3/3; Change the rule unlocked and Growing festival still locked. After guarded reload, 3/3 and the same lock state remained. | Best improved by two stars; Amari’s global total rose from 9 to 11. No additional chapter was opened without completing it. |
| Dino Hangman | In this profile, Same word ending was initially uncompleted. A clean six-word visible-letter run awarded 3 stars. A second ordinary same-band run used the visible Letter clue on each word and included a wrong letter on word 2; it completed at 1 star. | The map retained the chapter’s 3/3 best and kept Picture-clue rescue unlocked / Independent rescue locked after the low-scoring replay and guarded reload. Amari’s global total stayed at 14 after the lower replay and reload. | Lower replay did not lower the saved best or grant duplicate stars. Initial chapter completion advanced the map and awarded its best normally. |

The visible profile total rose from 9 to 11 after Pattern’s 1→3 replay. The home view showed 14 stars after Hangman’s 3-star completion and lower replay; I did not capture an intervening Home total between those two Hangman runs, so I do not use that total alone as a direct replay-delta measurement. The Hangman chapter map did retain its 3-star best after the 1-star replay, and the frozen helper computes a zero delta when a new run is below the saved best. The exact displayed totals and chapter states are captured in the screenshots and snapshots below.

### Astronaut detail

The replayed Review missions queue showed six ordinary visible prompts and options. Correct answers held the fact card until Next; the map then showed Review missions at 3/3, while Mission engineering remained 2/3. The Passport count changed from 24 to 29. A guarded reload retained both. The candidate’s visible sound control reverted from “Turn sound on” (muted) before reload to “Turn sound off” (sound enabled) after reload. I muted again through the visible control. This is a reproducible defect on this frozen candidate; it is not a claim about current canonical.

Evidence: [3-star completion](screenshots/astronaut-clean-replay-complete-3stars.png), [map and 29 facts](screenshots/astronaut-map-29facts-3stars.png), [map after reload](screenshots/astronaut-map-after-reload.png), [before-replay map snapshot](snapshots/astronaut-map-before-replay.yml).

### Pattern detail

Before replay, Repeat it showed ★☆☆. I completed the six visible pattern questions without a hint or wrong answer. The completion screen showed ★★★. The map then showed Repeat it ★★★, Change the rule available with ☆☆☆, and Growing festival disabled; guarded reload retained that map state. The global home total moved from 9 to 11, the expected +2 best-star delta. The visible sound control again changed from muted to enabled after reload.

Evidence: [before replay](screenshots/pattern-before-replay-1star.png), [3-star completion](screenshots/pattern-replay-complete-3stars.png), [saved map after reload](screenshots/pattern-map-after-reload.png), [home before replay](snapshots/home-before-pattern-replay.yml), [home after replay](snapshots/home-after-pattern-replay.yml).

### Hangman detail

The first Same word ending run solved six visible word prompts through the ordinary letter buttons, with no clue or wrong letter. Completion displayed ★★★ and the map showed the next chapter unlocked. In the subsequent same-band replay, I used the visible Letter clue for each word; on word 2 I also tapped P before the shown initial letter M, received no progression from that miss, then completed the word. The lower run completed at ★☆☆. The chapter map retained ★★★ and the same unlock state. After guarded reload, ★★★ and that lock state remained. The global Amari total did not increase from 14 on this lower replay. The visible sound preference reset after reload here as well.

Evidence: [first 3-star completion](screenshots/hangman-clean-completion-3stars.png), [lower replay](screenshots/hangman-lower-replay-1star.png), [best retained after reload](screenshots/hangman-map-after-reload-best3.png), [low-score chapter map](snapshots/hangman-map-after-lower-replay.yml), [Amari home after reload](snapshots/home-after-hangman-reload.yml), [Askia Pattern screen](snapshots/askia-pattern-level.yml).

## Cross-profile boundary and source support

Through the ordinary player picker, Amari’s home showed 14 stars. Askia’s home showed 0 stars. Askia’s Pattern Parade entry opened a distinct legacy “Level 1 of 3: Two take turns” screen rather than the Amari three-chapter B6 map; Dino Hangman and Astronaut Academy were not offered in Askia’s visible menu. Returning to Amari restored the 14-star home. This supports separation of the visible profile-wide star total only. It does **not** establish same-game badge or fact collection isolation for all games; the different Askia Pattern flow prevents a like-for-like UI comparison. The Askia and returned-Amari snapshots are retained in `snapshots/`.

The exact frozen source helper complements that limited UI proof: [`batch6Games.js` at 60f3623](https://github.com/MEMAtest/dinospace/blob/60f362368d5eedb3b43dedc4fa95eb3097672d7e/src/data/batch6Games.js) reads and writes under `root[playerId][gameId]`, filters facts and badges by game, and computes only positive best-star deltas. `Batch6Journey` awards a celebration only when that delta is positive. I did not inspect or modify browser storage.

## Combined reliability view

The retained full baseline is [`batch6-full-local-20261003/report.md`](../batch6-full-local-20261003/report.md), covering all four Amari games and three chapters at desktop and mobile across its stated candidate lineage. Root’s same-runtime [Chess reliability report](../batch6-reliability-root-20261004/report.md) adds desktop equal-replay/no-extra-star evidence and mobile improvement from 2 to 3 stars with a +1 credit, reload retention, and the same sound reset. These are root-owned browser runs, not my observations; I include them only to reconcile the whole dimension.

The combined evidence supports a **provisional Reliability / Navigation / Persistence rating of 4.0/5 for frozen 5363**. The chapters, saved best-star records, unlocks, and tested facts persisted, and improved replays granted only the positive best-star delta while the lower Hangman replay granted none. A 5/5 rating is blocked by the repeatable sound preference reset after reload on this old candidate. The current canonical saved-sound fix is separate; a later selective integration must preserve it and repeat the visible mute/unmute reload check on that exact integrated candidate. The bounded Askia check does not close full game-collection sibling isolation.

No overall game score or 4.5 acceptance is assigned. Full audio readiness/listening and other rubric dimensions remain separate gates. The gameplay baseline and root-owned mobile Chess report carry their exact candidate identities; this follow-up does not relabel those earlier runs as new 5363 sessions.
