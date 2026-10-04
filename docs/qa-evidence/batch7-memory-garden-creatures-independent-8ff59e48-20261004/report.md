# Independent Garden-creature Memory QA

**Candidate source:** `8ff59e48f0248bac8e4410a008c8b7a0d9f03f7f`  
**Frozen origin:** `http://127.0.0.1:5316`  
**Frozen dist:** `tmp/batch7-memory-garden-creatures-final/dist`  
**Identity:** `docs/qa-evidence/batch7-memory-garden-creatures-identity-20261004.json`

## Scope and procedure

Reviewed the frozen Garden & Pond Life artwork delta only: Bee, Butterfly, Ladybird, and Snail on Amari’s Level 9 board. This is not a full Memory review, audio assessment, production check, human/device sign-off, or 4.5 acceptance.

Created a fresh CLI session at `about:blank`. Installed persistent `**/api/voice` and `**/api/story` routes returning 403, and confirmed both in `route-list` before navigating to the app. A first disposable preflight session was discarded when its route check showed “No active routes”; it had only opened the app shell and did not interact with the game. Its request list contained six static requests and no voice/story requests. All evidence below is from a separate fresh session where both guards were confirmed before the first candidate navigation.

In the guarded session, chose Amari through the visible profile chooser and entered Thinking & Play → Memory Match. Completed levels 1–8 in order by using actual rendered card buttons, waiting for visible accessible card names after each flip, and activating the actual `Next level` control. This created only normal UI-earned synthetic QA progress. Sound remained off. I did not inspect hidden card fronts, seed answers, React state, or write progress/storage.

## Results

The earned sequence completed: Forest Friends 4 pairs/8 cards; Ocean Splash 8/16; Space Sparkle 10/20; Party & Treats 12/24; Dinosaur Discovery 13/26; All Kinds of Vehicles 14/28; Yummy Feast 15/30; Astronaut Mission 16/32. The visible Next control then opened Garden & Pond Life with 17 pairs/34 cards.

| Viewport | Face-down state | Flipped Garden art and layout |
| --- | --- | --- |
| 1280×800 | 34 face-down cards, zero mounted image elements; document width 1280. Garden card was 149.16×149.16px; Level 9 selector was 48×48px. | Completed all 17 pairs. Two cards each revealed Bee, Butterfly, Ladybird and Snail; the eight accessible card labels matched those names and used the corresponding four expected asset URLs. All images loaded. The 34 cards remained within the 1280px document width. Full-page image shows each artwork clearly separated from its caption. |
| 390×844 | 34 face-down cards, zero mounted image elements; document width 390. Garden card was 82×82px; Level 9 selector was 53.5×48px. | Completed all 17 pairs. Both visible copies of each new creature had the correct accessible label and loaded candidate image URL. Cards remained 82×82px and document width stayed 390px. The full-page screenshot shows captions readable and non-overlapping with the image row. |

Mobile revealed-card evidence recorded natural art dimensions Bee 512×512, Butterfly 512×424, Ladybird 512×427 and Snail 512×430; each rendered image box was 63.36×30.41px at 390px. The creatures are visually distinct from one another and from the existing caterpillar, ladybird’s black spots are visible, butterfly wing pattern and antennae are distinct, bee stripes/wings read clearly, and snail shell/body are readily identifiable.

Screenshots in this folder:

- `garden-desktop-facedown.png`, `garden-desktop-fullpage.png`
- `garden-mobile-facedown.png`, `garden-mobile-fullpage.png`

## Reload, network and identity

Reloading the same guarded session returned to the existing Amari Memory journey; the app showed Galaxy Challenge and the visible Level 9 selector remained enabled. The separately selected Garden board continued to render its face-down start state. This confirms the earned unlock survived a page reload in the same isolated profile.

Both paid-endpoint guards remained installed through the session. The guarded browser request list had no voice/story calls; console recorded zero messages, errors or warnings. Every path in the frozen identity report was fetched from port 5316 and compared with the report and frozen dist: root HTML, JavaScript, CSS and the Bee, Butterfly, Ladybird and Snail WebPs all matched both SHA-256 values.

The check confirms this art delta at the two assigned viewport widths. It does not cover the other eight boards in full, Askia parity, packaged narration/listening, every device, production, remaining Memory token inventory, or a product-wide quality score.
