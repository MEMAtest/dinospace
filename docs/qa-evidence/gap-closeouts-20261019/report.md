# Reviewed game UX gaps — production acceptance, 19 October 2026

## Scope and decision

**Accepted:** all reviewed criteria passed. The source-bound verdict is in `acceptance-results.json`. This closes the reviewed navigation, progression and teaching-feedback gaps in seven games, plus the shared Start screen in eight games. It does not award all 26 games a 5/5 editorial score or close the separate catalogue roadmap.

Luna implemented bounded file scopes in the existing checkout. Root reviewed the changes, returned defects to Luna and independently exercised real controls in one dedicated headless Chromium tab. Both 390×844 and 1440×844 were used. Mobile Solar and Chess checks included native CDP touch input in that same browser/context. No child production data was used: the contained browser has its own synthetic local profile. Provider voice and story routes were guarded with synthetic 403 responses before gameplay; no paid provider calls or generated stories were made.

## Per-game acceptance evidence

| Game | Changes | Actual production rehearsal |
| --- | --- | --- |
| My Writing Desk | Focused labelled heading field; explained input gate; revisitable steps; Save/Open/Download beside instructions; less competing copy. | Two postcards: short-heading recovery, heading→message→Bold→picture→save, back/forward with content preserved, leave/reopen, actual Word download. OOXML inspection proves heading, message, bold and one embedded image in each file. |
| Colour Mixing Lab | Predict before reveal; useful held result; explicit Next; named count follows 5/6/7 target; final acknowledgement before wrapper completion. | All three levels at both widths, 36 correct rounds, wrong-prediction recovery, stable choices, held first/final results, completion, next level and replay. |
| Solar System | One overview/inspect switch; labelled ≥44px controls beside model; clear discovery goal; optional detail collapsed. | All nine worlds at both widths; turn/tilt/zoom/mouse drag/automatic rotation change rendered planet pixels; wheel scroll; mobile one-finger scroll and two-finger rotation; three facts and wrong→correct quiz recovery. Separately forced WebGL failure and verified planet selection/facts remain usable. |
| Chess Explorers | Recommended Learn entry; explicit five-move goal; named coordinates/piece/legal moves, keyboard focus; correct Pawn start. | All six pieces × both widths: 12 completions / 60 legal moves. Keyboard activation, six native mobile taps, disabled illegal squares, Next Piece and menu/parent return. Pawn now reaches five moves instead of stopping at three. Settled completion render inspected. |
| Odd One Out | Held explanation and explicit Next; item/reason errors count as attempts; fixed run target and final acknowledgement. | Three levels × both widths / 36 correct rounds; wrong item and wrong reason then recovery; held explanation, first-try summary, completion, next and replay. |
| Pattern Parade | Held rule and explicit Next; mode switch cannot bypass feedback; progress survives switching between shapes and numbers. | Three levels × both widths / 36 correct rounds, both modes and alternating mode during level 3; wrong retry, held rule, completion, next and replay. |
| Sound Safari | Held sound/word feedback and explicit Next; stable target across modes; same-phoneme distractors excluded, including C/Cat and K/Kite. | Three levels × both widths / 36 correct rounds with both match and blend modes; wrong retry, held feedback, completion and replay. Additional C and K prompts sampled and answered at both widths with exactly one same-phoneme match. Corrective preview and production evidence supersede the initial literal-key test. |

The four timed-feedback games each completed targets 5, 6 and 7 at both widths: 144 correct rounds in their accepted full matrices. First feedback and final level-3 feedback were held for 6.5 seconds at each width; other final explanations exceeded the old 1.5-second wrapper delay, then required Next. No timer dismissed the explanation. This is a reproducible functional acceptance result, not a universal learning-outcome or accessibility certification.

Shared Start: Odd One Out, Letter Launch, Sound Safari, German Garage, Colour Mixing Lab, Pattern Parade, Spelling Studio and Dino Hangman each show visible Start and Your goal, retain their accessible Play label, expose a visible keyboard focus indicator and launch with Enter. Sixteen production entries checked; this is start-screen coverage for these eight games, not complete acceptance of their other mechanics.

## Root findings that changed the implementation

- Ordinary Writing Desk typing previously missed its heading gate. The labelled field and explicit explanation now make the first step work; revisiting steps preserves document content.
- The first Colour candidate had conflicting fixed-five and session counts. All repaired feedback games now display the actual session target and defer final completion until acknowledgement.
- Root's full Chess rehearsal found a genuine Pawn dead end at 3/5. The Pawn's piece-specific starting rank now permits five legal ordinary forward moves on the practice board.
- Scoped lint caught missing Odd One Out mistake-state declarations before acceptance.
- Screenshot review found Cat and Kite offered for the same initial sound even though the literal-key test passed. Root rejected that pass, Luna added the C/K equivalence, and the tests now compare phonemes as well as literal source labels. See `sound-ck-regression.md`.
- The early Solar dock and Chess completion screenshots were captured during scroll/animation paint. Root checked bounds/hit targets and waited for settled renders. Final accepted screenshots show the controls and completion clearly. Solar rendered-pixel checks crop the model, excluding controls so focus styling cannot falsely prove rotation.

## Release and evidence boundaries

Initial full production matrix: runtime `d4ccfb2219495bf14d50f0e1ba81484deb7e53ee`, deployment `dpl_66ENY7wUTtTEhKCgFqk7ptn7iWkU`.

Corrective candidate: runtime `aaef3be4c4630f06575949351ee7e39230432664`, preview `dpl_DTwhFjpA6bkWUGrb26LPyTNaiMXM`. Final production deployment is `dpl_AZMdxgc4m9pQdnt4uDdsGAB9fjuY` at https://dinospace-eight.vercel.app/. Exact Vercel READY/project/source identity is captured before and after final checks.

The only source delta between these two runtimes is the C/K filter in SoundSafari.jsx. `unchanged-after-sound-fix-hashes.json` binds the other repaired files to their full accepted production matrices. The corrected Sound full matrix and C/K cases were rerun on preview and final production; the shared entries and Writing/Solar/Chess controls were also checked again on the final release. The earlier full matrices and final corrective checks are identified separately.

Local evidence includes the full matrices, scoped ESLint, a successful Vite build and 16 focused contract/export/model tests. These are supporting checks; the acceptance decision rests on actual production controls and downloaded files. Existing build warnings about large chunks/Browserslist are retained. No claim is made about provider narration quality, human listening, every browser/device, unmodified games, or the broader 26-game roadmap.

## Console, visuals and recovery

Every accepted gameplay run checks application page errors, required illustrated/model/audio asset HTTP failures, broken DOM images and horizontal overflow. Console review distinguishes intentional guarded `/api/voice` 403s and the two deliberately forced WebGL-creation errors from unexpected errors. Local software-renderer ReadPixels warnings are diagnostic capture warnings. See `console-review.json`; no claim of a universally empty console is made.

Root inspected the seven representative final renders and both actual DOCX archives. Scripts, raw run outputs and final renders are retained once under this evidence directory; `SHA256SUMS` records their hashes. `recovery.json` records the runtime source/branch, deployments, preserved unrelated files and resource use. No new checkout, worktree, dependency installation, whole-project backup, paid story/voice generation or monitoring automation was created. See recovery/resource records for final artifact size and task-owned process cleanup.

Final retained evidence: approximately 2.39 MiB. The dedicated QA browser and task-owned Vite server were closed. No worktree or dependency installation was created. The pre-existing `dist` build directory was reused and retained; unrelated files were preserved.
