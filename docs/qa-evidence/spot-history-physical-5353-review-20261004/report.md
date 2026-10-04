# Spot the Difference — 5353 physical-object delta review

Date: 2026-10-04  
Candidate: `http://127.0.0.1:5353`  
Source SHA: `0b45ed6f8914d442d265124511ed5a9c3ece7c6c`  
Frozen distribution: `tmp/spot-history-physical-artifacts/dist`  
Identity: [`candidate-identity.json`](candidate-identity.json)

## Scope and result

This is a narrow rendered review of the Robin’s Woodland leaf repair and History Hall physical-object replacement, with related Challenge visual observations for Nature Lab and World Explorer. It is not a full Challenge recertification.

- **Robin’s Woodland:** the repaired right-middle leaf difference is visible at both 1280×800 and 390×844. Picture A shows a round leaf; Picture B shows a pointed leaf in the same position at about x=77%, y=51% of the picture. The separate upper-left mark is a vein-count difference and retains its outline. I verified the right-middle target with a real pointer click at desktop (1111,510) and a visible target control at mobile; both registered 1/7.
- **History Hall:** the former pictogram badges have been replaced by seven differences in pictured artifacts. At both widths the closed/open book, arch-opening count, compass direction, round/square stone, flame count, open/rolled scroll and column grooves are visible on the artifacts themselves. I saw no unrelated scene changes or visible mask seams around those objects. This closes the specific visual defect seen on 5351 for this candidate.
- **Nature Lab and World Explorer:** these remain material visual/editorial concerns. The Nature Lab A/B pair still uses small flower, leaf/heart, sprout and star symbols over plant, pot, tool and jar areas; several symbols change while the underlying pictured object looks unchanged. World Explorer’s small compass badge sits over the distant sky/river beyond the physical map, while the scene already has a brass compass on the map; a small binocular badge sits above the pencil cup while large pictured binoculars are already in the foreground. These marks do not read as genuine changes to the pictured props. Evidence is in the four pre-interaction screenshots below.

## Normal UI and controls

Two isolated synthetic Playwright profiles were used. Both started at `about:blank`; handlers for `**/api/voice**` and `**/api/story**` were registered before the first app `goto`. The mobile profile began at 390×844 and used the visible `Turn sound off` control before selecting Amari. I earned Starter and Growing unlocks through ordinary visible UI controls; no seeds, answers, progress, local storage or hidden guide data were injected. The other profile used ordinary UI progression and responsive viewport changes to inspect and exercise both widths.

Robin’s Woodland was played at both sizes. A blank bird-area tap on the first 390px pass produced “Not that spot yet”; its two hints pointed to left bottom and right bottom. At desktop, the right-middle leaf target was clicked directly at the center of its visible 56×56 control and changed the count to 1/7; the other six visible target controls completed the pair. At mobile, the right-middle target control likewise registered and the remaining controls completed 7/7. Both runs held the fact “Robins use their beaks to find food and build safe nests.” Next picture advanced normally.

History Hall was exercised at both sizes. A blank tap in the visible picture returned “Not that spot yet.” The two mobile hints were “left area” and “middle bottom”; desktop hints were “left bottom” and “right area.” Seven visible region controls completed the pair at each width. Target controls measured 56×56 CSS pixels on mobile; the document width remained 390px and no horizontal overflow was present. The held fact read “Old objects can be clues about how people lived long ago.” Next picture advanced to the following pair on desktop and mobile. After a mobile reload, the challenge map retained 2/4 completed pairs in the fresh profile; parent navigation required the visible Leave confirmation and returned to Thinking & Play.

The mobile profile’s sound control stayed off through navigation and reload. The desktop profile began with sound on, but I did not activate Hear clue. No human listening or audio-quality judgment was made. The request log showed no non-static network requests; the static inventory included locally served packaged MP3 files. The API guards were registered before initial navigation, and no `/api/voice` or `/api/story` request was observed. CLI `route-list` does not report the script-installed page routes, so guard evidence is the pre-navigation registration plus the request log, not the route-list output.

## Candidate identity and checks

All 10 served files in the frozen identity manifest were fetched from 5353 and matched their declared byte counts and SHA-256 hashes. Playwright reported zero console messages, errors or warnings in each profile. Static requests returned 200 for the loaded app and image assets. The full served manifest is copied here to bind this report to the candidate.

## Evidence

- [Robin A/B before interaction, desktop](screenshots/desktop-robin-before-interaction.png)
- [Robin A/B before interaction, mobile](screenshots/fresh-mobile-robin-before-interaction.png)
- [Robin held fact after 7/7, desktop](screenshots/desktop-robin-held-fact-replay.png)
- [Robin held fact after 7/7, mobile](screenshots/fresh-mobile-robin-held-fact.png)
- [History Hall A/B before interaction, desktop](screenshots/desktop-history-hall-before-interaction.png)
- [History Hall A/B before interaction, mobile](screenshots/fresh-mobile-history-before-interaction.png)
- [History Hall held fact after 7/7, desktop](screenshots/desktop-history-hall-held-fact-replay.png)
- [History Hall held fact after 7/7, mobile](screenshots/fresh-mobile-history-held-fact.png)
- [Nature Lab A/B before interaction, desktop](screenshots/desktop-nature-lab-before-interaction.png)
- [Nature Lab A/B before interaction, mobile](screenshots/mobile-nature-lab-before-interaction-full.png)
- [World Explorer A/B before interaction, desktop](screenshots/desktop-world-explorer-before-interaction.png)
- [World Explorer A/B before interaction, mobile](screenshots/mobile-world-explorer-before-interaction-full.png)

## Limits

The 5351 round→pointed target failure remains documented against that old immutable candidate; this 5353 observation is a new visual pass for that target, not a rewrite of 5351 history. Challenge target controls and facts were exercised only for Robin and History Hall. Nature Lab and World Explorer were inspected before interaction and are not accepted as genuine seven-object visual sets here. Remaining Challenge scenes, full Spot the Difference matrix, missing packaged-clip gates, human listening, production state and the 4.5 rubric remain unaccepted by this report.
