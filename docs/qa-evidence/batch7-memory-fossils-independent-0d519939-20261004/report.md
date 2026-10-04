# Independent fossil-art candidate QA

**Candidate:** `0d519939042dc8269ff759e3fe0afa6002b1c70c`  
**Frozen origin:** `http://127.0.0.1:5315`  
**Frozen dist:** `tmp/batch7-memory-fossils-final/dist`  
**Evidence identity:** `docs/qa-evidence/batch7-memory-fossils-identity-20261004.json`

## Scope and method

This is an independent rendered-UI check of the four newly illustrated Dinosaur Discovery tokens and preservation of Moon Rock in Astronaut Mission and Galaxy Challenge. It is not a full Memory regression, audio review, device acceptance, release decision, or 4.5 acceptance.

Used a fresh Playwright CLI session named `batch7-fossils-guarded-20261004` starting at `about:blank`. Before navigating to the candidate, installed `/api/voice` and `/api/story` 403 route guards and verified both with `route-list`. Chose Amari using the visible profile chooser, entered Thinking & Play → Memory Match, and normally completed visible boards to unlock Dinosaur Discovery, Astronaut Mission, and Galaxy Challenge. The solver clicked actual rendered card buttons, read each accessible card name only after the flip, and waited for matching or mismatched cards to settle. No app storage/progress injection, hidden card-front reads, provider calls, answer seeds, or source edits were used. Sound was off.

## Results

| Board and viewport | Rendered result |
| --- | --- |
| Dinosaur Discovery, 1280×800 | 26 cards / 13 pairs; ordinary completion. Before flips, all 26 had face-down accessible labels and zero image elements. Document width remained 1280. On completion, both copies of Bone, Dinosaur tooth, Fossil dig pick, and Fossil dig rock had the expected visible accessible label, expected candidate asset URL, and loaded image. |
| Dinosaur Discovery, 390×844 | 26 cards / 13 pairs; ordinary completion. Before flips, 26 face-down cards and zero image elements. Document width remained 390. The full-page capture shows the four new illustrations and captions without caption/art collision or horizontal overflow; cards measured 82×82 and the Level selectors 53.5×48 CSS px in the captured board. |
| Astronaut Mission, 1280×800 | 32 cards / 16 pairs; ordinary completion. Both flipped Moon Rock cards loaded `/assets/moon-rock-v1-card-BGXR3Tx2.webp`; completed board screenshot visibly shows the grey cratered Moon Rock. Face-down start had 32 cards and zero images. |
| Galaxy Challenge, 1280×800 | 36 cards / 18 pairs; ordinary completion. Both flipped Moon Rock cards loaded the same Moon Rock asset; neither showed the newly added fossil-rock asset. Face-down start had 36 cards and zero images. Document width remained 1280. |
| Galaxy Challenge, 390×844 | 36 cards / 18 pairs; ordinary completion. Both revealed Moon Rock tokens used the existing Moon Rock asset; no fossil-rock label appeared. Document width remained 390. |

The Dinosaur Discovery full-page capture shows the fossil rock as a brown, fern-imprint rock, clearly different from the grey Moon Rock in Astronaut Mission. The tooth reads as a curved/conical tooth, the pick as a digging tool, and the bone as a bone. These checks establish the intended visible distinctions for this candidate; they do not validate every level, lesson, or device.

Screenshots in this folder:

- `dinosaur-desktop-facedown.png`, `dinosaur-desktop-fullpage.png`
- `dinosaur-mobile-facedown.png`, `dinosaur-mobile-fullpage.png`
- `astronaut-desktop-facedown.png`, `astronaut-desktop-fullpage.png`
- `galaxy-desktop-facedown.png`, `galaxy-desktop-fullpage.png`

## Identity, privacy, and gates

Fetched every path in the candidate identity report from port 5315 and compared its SHA-256 to both the report and frozen dist. The root HTML, JS, CSS, all four new WebPs, and retained Moon Rock WebP matched both. The two route guards remained installed; browser console recorded zero messages/errors/warnings, and the browser resource list showed no voice/story requests.

This report does not assess the packaged narration gap. The builder’s separately recorded full suite result is 189/190, with the one known failure concerning missing narration clips; no audio assets or narration were generated or played. Human listening, full-suite resolution, other Memory art, other platform parity, and production acceptance remain separate gates.
