# Root Solar mobile repair check — 3 October 2026

## Identity and boundaries

This is an integrator check, not the separate editorial acceptance review. Isolated Playwright session `amari-batch7-root`,390×844. Voice/story APIs guarded before navigation; no provider calls or story creation. Normal profile choice and UI controls only, no injected/copying stored progress. Canonical production was not changed.

## Initial defect:5245,source61698c1

Clicked Earth discoveries1,2,3. Actual reload preserved3/54discoveries, but rendered world badge count0/9 although mission badge threshold is3. Initial implementation derived badge from every fact; each planet actually contains6facts. Preserved snapshot `5245-after-three-discoveries-reload.txt` records this mismatch.

## Repair:5247,source76d775f

Fresh origin and normal Amari→Explore→Solar controls. Clicked allthree Earth discoveries; asserted rendered world badge1/9. Selected incorrect Blue paint; held Not quite feedback appeared. Selected correct Its oceans; actual reload then asserted passport3/54discoveries·1/9challenges and world badge1/9. More planets button and actual Pluto tab reached Pluto heading. Back returned to `#/world/explore`. Reopened via normal Solar card; saved Earth passport/challenge state remained. Preserved successful assertion transcript and full-page screenshot.

183source tests/full lint/production-configbuild passed on repaired source. Three-discovery regression test covers all9destinations. This narrowly proves Earth passport/badge/quiz and Pluto-strip/parent route; it does not prove every planet’s full quiz, complete desktop/mobile walkthrough, narration, all Memory boards or a4.5score.

## Pixel review and next source delta

Viewed screenshot: smaller fact and Listen targets, header controls and View controls were below the48px contract. Source increases those targets, shows badge-earned instruction after3discoveries, and adds Memory active/done phase plus reduced-motion flip support. These later source changes must be frozen and browser checked;5247evidence is not silently relabelled as that later build.

## Remaining acceptance

Independent all-game mechanics/editorial/visual review, premium Memory face artwork, completed-board/replay reward controls, physical/native media/listening/offline checks, canonical production release and exact production Playwright evidence remain open.
