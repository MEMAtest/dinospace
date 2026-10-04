# Spot the Difference Challenge review — frozen candidate 5351

Date: 2026-10-04
Candidate origin: `http://127.0.0.1:5351`
Frozen source SHA: `aea335f28ba5c0143349baedd43cb44a49be39ea`
Frozen dist: `tmp/spot-safari-square-wing/dist`
Identity manifest: [candidate-identity.json](candidate-identity.json)

## Scope and stop condition

This run evaluates Challenge scene visuals before interaction at desktop 1280×800, then checks ordinary direct input on the first two scenes. The visible names are **World Explorer**, **Nature Lab**, and **History Hall**; the corresponding actual data title for the bird scene is **Robin’s Woodland** (not “Robin Wood”), and the map scene is **World Explorer** (not “World Map”). Challenge was earned through normal UI progression. No Challenge pair was reached on mobile.

I stopped at History Hall before any tap, hint, or answer control because its pre-interaction A/B screenshot shows multiple flat pictogram badges floating in the sky and over open ground, rather than seven edits to pictured objects. Examples include a padlock over the pyramid, a card/label in the sky, a Roman numeral above the colosseum, and book symbols over open terrain. This fails the mandatory genuine pictured-object-change gate. Scoring 7/7 with visible target controls would not cure that visual failure, so History Hall has no interaction result in this report.

**5351 Challenge visual acceptance fails at History Hall.** This is not an overall 4.5 or production acceptance report.

## Guarded ordinary-play method

A fresh Playwright profile started at `about:blank`; the run registered `204` fulfill handlers for `**/api/voice**` and `**/api/story**`, set 1280×800, and navigated to 5351 using `goto`. The visible `Turn sound off` control was selected before choosing Amari. I opened Thinking & Play → Spot the Difference, completed all four Starter pairs and all four Growing pairs via their ordinary visible `Check … detail` controls, selected the unlocked Super Spotters chapter, and began its normal queue. No seed, hidden answer, local storage, or progress state was injected.

The browser request log contained only static assets, with no voice/story API request or audio-resource entry. The console had zero messages (errors 0, warnings 0). The CLI `route-list` returned “No active routes” after the script-installed page routes and navigation; therefore the guard conclusion is based on the guarded about:blank→goto run and absence of observed endpoint requests, not on the CLI route list as proof of handler persistence.

## Challenge scenes inspected before interaction

### World Explorer — observed pair 1/4

[Pre-interaction screenshot](screenshots/desktop-world-explorer-before-interaction.png) shows the visible title `World Explorer`, “0 of 7 changes,” and the entire 580×435 A/B map-workbench illustration before any Challenge interaction. Seven changes were visually located on map symbols and map/compass/tool details. They appeared contextually related to the map scene; the bottom-right map location marker/X, compass indicators, and magnifier/map details are set on the pictured map or tools, rather than floating unrelated badges. This is a desktop-only visual judgment; mobile discernibility was not tested.

Interaction after the screenshot:

- A tap in a blank scene area was rejected with “Not that spot yet” and remained 0/7.
- The two hints were distinct: “left area of Picture B” and “left top of Picture B”.
- Seven pointer taps on the corresponding visible scene regions registered successively, 1/7 through 7/7.
- The held fact read “Maps use symbols and labels to show useful information about places.” The visible Next picture control was used to advance.

This pair’s click count is not used as proof of its visual quality beyond the desktop observations above.

### Nature Lab — observed pair 2/4

[Pre-interaction screenshot](screenshots/desktop-nature-lab-before-interaction.png) shows the visible title `Nature Lab`, 0/7, and both full 580×435 plant-workbench pictures before interaction. The changed marks appear on botanical/gardening elements: plant leaves, pot/tool surfaces, and watering-related details. They are discernible at desktop size and thematically related to the visible scene. Some marks are icon-like; this run does not establish that every rendered treatment reads as a natural object change at mobile size. No mobile or further isolated crop review was performed.

Interaction after the screenshot:

- A blank scene tap was rejected with “Not that spot yet”.
- The two hints were distinct: “right area” then “right bottom of Picture B”.
- Seven scene taps registered successively, 1/7 through 7/7.
- The held fact read “Plants need light and water to grow.” The visible Next picture control advanced to History Hall.

Again, the 7/7 pointer score is interaction evidence only and does not waive the visual contract.

### History Hall — failed before interaction

[Pre-interaction screenshot](screenshots/desktop-history-hall-failure-before-interaction.png) shows the visible title `History Hall`, 0/7, and the entire pair before any input. The icons are free-standing over the scene’s sky/open terrain or hover above structures; they are not seven plausible changes to historical objects already pictured. This is the point where testing stopped. No scene target, miss, hint, completion fact, or Next action was exercised.

### Robin’s Woodland

Not reached on this queue because History Hall failed the mandatory visual gate. There is no rendered observation for Robin in this report. A separate source review by the integrating agent identified a round-versus-pointed leaf rendering defect, but that is not presented here as my browser observation. The old-candidate rendered check and repaired-candidate leaf delta remain open.

## Identity and limits

All eight served paths in the frozen 5351 identity manifest returned HTTP 200 and matched their declared byte counts and SHA-256 values. The screenshots are from the exact candidate origin and source SHA above.

- Only desktop World Explorer and Nature Lab were interacted with; History Hall failed before interaction and mobile Challenge was not entered.
- No Robin’s Woodland rendered evidence was gathered.
- This review does not evaluate Challenge’s complete 4-scene/desktop+mobile matrix, narration, human listening, production deployment, or 4.5 acceptance.
- The separate 5351 Sound Safari / default-4:3 regression report remains distinct and is not expanded by this review.
