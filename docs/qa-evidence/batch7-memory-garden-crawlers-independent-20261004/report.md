# Independent Garden crawler artwork QA

Date: 2026-10-04
Candidate: `http://127.0.0.1:5319`
Source: `4f6d48122e65d861e73bb2ff0d7e446b845521e9`
Frozen dist: `tmp/batch7-memory-garden-crawlers-final/dist`
Identity record: [`batch7-memory-garden-crawlers-identity-20261004.json`](../batch7-memory-garden-crawlers-identity-20261004.json)

## Method

Opened a uniquely named Playwright session on `about:blank`. Installed route guards for `**/api/voice` and `**/api/story`, verified both appeared in the route list, and only then navigated to the candidate. Chose Amari from the visible chooser and opened Thinking & Play → Memory Match through the visible UI. No storage, progress, deck, React state, or hidden card front data was injected or read. To earn levels, the browser clicked visible card controls and read each card's accessible name only after its face had visibly turned up; each level was completed through its visible Next button. The session was isolated and used no child data. App sound was left off; no narration control or provider was invoked.

## Independent gameplay coverage

Normally completed all cards and advanced through these boards at 1280 × 800:

| Board | Visible pairs completed | Cards |
| --- | ---: | ---: |
| Forest Friends | 4 | 8 |
| Ocean Splash | 8 | 16 |
| Space Sparkle | 10 | 20 |
| Party & Treats | 12 | 24 |
| Dinosaur Discovery | 13 | 26 |
| All Kinds of Vehicles | 14 | 28 |
| Yummy Feast | 15 | 30 |
| Astronaut Mission | 16 | 32 |
| Garden & Pond Life | 17 | 34 |

Then completed Garden & Pond Life again at 390 × 844 through ordinary card flips. The board was reset with the visible Garden level button for each face-down capture.

## Rendered art and layout

- At 1280 × 800, all 34 cards measured about 149.16 × 149.17 px. The four new labels appeared on face-up cards as **Caterpillar**, **Worm**, **Ant**, and **Spider**. The screenshot shows segmented green caterpillars, legless pink earthworms, six-legged ants, and purple eight-legged spiders; each matches its label.
- At 390 × 844, all 34 cards measured 82 × 82 px and the document stayed 390 px wide. All four new labels and illustrations remained visible and distinct. I could count six legs on the ant and eight on the spider in the rendered cards; no stray alpha specks or bright edge halos were visible at this size. Captions remained within their cards.
- At desktop, Back, sound, repeat-tip, and all ten level selectors measured 48 × 48 px. At mobile, Back/sound/repeat-tip measured 48 × 48 px; all ten level pills were 53.5 × 48 px. The 34 card hit areas were 82 × 82 px. No horizontal overflow appeared at either width.
- Once Garden was reset face down, both viewport checks found 34 face-down labels, zero front labels, and zero mounted `<img>` elements. Face-up new art loaded only after ordinary card flips.
- Full-board captures: [desktop face up](desktop-garden-faceup.png), [mobile face up](mobile-garden-faceup.png). Face-down captures after the card-turn animation settled: [desktop](desktop-garden-facedown.png), [mobile](mobile-garden-facedown.png).

## Reload, navigation, and requests

After the desktop Garden completion, reloading returned to unlocked **Galaxy Challenge (Level 10)** with the 9/10 sticker count intact; Garden remained selectable. At 390 px, Back opened the **Leave the game?** guard. **Keep playing** stayed on Memory Match. Confirming **Back to world** returned to Thinking & Play, where the Memory Match tile showed “Played 9”; re-entering it opened the previously selected Garden board with 17 pairs and all 34 cards.

The served index, JavaScript, CSS, and all four crawler WebP resources returned HTTP 200 and matched every byte count and SHA-256 in the frozen identity record. Playwright listed 166 static requests during the run, all successful HTTP 200; the page resource list had no voice/story requests and no failed candidate assets. Both route guards remained installed through the navigation and replay. Browser console errors: 0; warnings: 0.

## Result and limits

**Pass for this frozen candidate's bounded Garden crawler art, responsive card rendering, face-down hiding, and ordinary local navigation/reload behavior.** This is independent local-candidate evidence for these four illustrations. It is not human listening, device/browser coverage, narration acceptance, full illustration-inventory verification, production validation, or an overall 4.5 acceptance.
