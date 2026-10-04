# Spot the Difference Nature and World review — 5354

**Review date:** 2026-10-04  
**Candidate:** `8eb10a04c4ed6bd9f2c1888d16f954c7fc0185cc`  
**Origin:** `http://127.0.0.1:5354`  
**Frozen dist:** `tmp/spot-nature-world-physical/dist`  
**Identity:** [`candidate-identity.json`](candidate-identity.json), 14/14 served HTML/runtime assets matched the frozen candidate hashes.

## Scope and setup

Fresh browser profiles were used at 1280×800 and 390×844. On each profile, voice and story routes were registered while on `about:blank`, before the first app navigation; app navigation used `goto`. The visible sound control was turned off before game play. Chapter unlocks were earned through the normal interface. No progress, seed, answer, storage, or child data was injected; no provider requests or narration playback were initiated.

On desktop, Starter and Growing were completed normally with their visible accessible target controls. Challenge Robin and History were also completed through those controls to reach World Explorer and Nature Lab. Those two target scenes were then examined visually before input and completed with direct pointer taps on depicted objects. On mobile, Starter and Growing were completed normally; Challenge History and Robin were used to reach Nature Lab and World Explorer; the target scenes were inspected before interaction and completed with direct pointer taps on pictured objects.

This is a rendered delta review of the two replacement Challenge scenes. It does not repeat the retained baseline for the other ten pairs.

## Results

### World Explorer

Both widths rendered two square, side-by-side-on-desktop / stacked-on-mobile boards with seven target hit regions. Seven direct picture taps completed the pair at each width. Visible changes included the globe’s blue-to-purple surface, the telescope’s brown-to-blue tube, binocular color changes, the magnifier’s round-to-square rim, a map marker changing from an X to a star, a compass detail, and bridge construction. The game displayed the expected held picture fact and a Next action. Two magnifier hints were available and pointed to different regions. A mobile blank tap displayed “Not that spot yet. Compare the same area in Picture A.”

The functional seven-of-seven result does **not** establish visual acceptance. The blue telescope paint had abrupt brown/gold segment boundaries, and the binocular repaint looked partial: burgundy/gray appeared on some barrel surfaces while green remained on others. These may read as patches instead of clear whole-object changes. The scene background otherwise appeared stable at screenshot scale. This concern was reported to the root during testing. Do not count 5354’s World art as accepted.

Desktop direct pictured-object taps (CSS viewport coordinates): globe `(867,438)`, red map marker `(1107,703)`, magnifier rim `(782,704)`, compass `(1063,779)`, telescope `(1120,535)`, binoculars `(1192,643)`, bridge `(916,660)`. The completed pair fact read: “Maps use symbols and labels to show useful information about places.”

### Nature Lab

Both widths rendered seven target controls and completed at seven of seven after direct taps on pictured plant/leaf/jar items. The miss response, two spatially distinct magnifier hints, held picture fact, and Next action were exercised on desktop. At mobile, the profile showed the chapter’s “Played 3” badge after navigating back to the learning world; it remained after reload. Mobile document width and scroll width were both 390 CSS pixels.

Visual quality remains **not accepted**. The seven visible changes were the two notebook leaf specimens, an upper plant leaf, a missing tray sprout, a small potted herb color change, a red watering-can body replacing blue, and the jar roots. The lower-left tray appears to show the same three sprouts in both images at ordinary presentation size; the intended fourth-sprout removal was not discernible at the initial presentation. On a desktop 2× crop, the first changed notebook leaf had a possibly cut left/lower contour resembling a patch boundary. These concerns were reported promptly. Root inspection subsequently confirmed that the tray mask missed the fourth sprout and the notebook mask needed to contain the entire leaf contour. Thus the seven-of-seven control result cannot be used as proof that the pictured differences are all clean or complete.

Desktop direct taps included the red watering-can body `(1184,616)`, notebook heart specimen `(783,783)`, upper plant leaf `(908,382)`, tray sprout region `(790,665)`, notebook narrow-leaf specimen `(856,780)`, small potted herb `(1010,586)`, and jar roots `(1115,704)`. The central-seedling exploratory tap at `(1000,632)` was rejected before the corrected tap. Mobile direct taps included the right-side leaf `(328,697)`, two notebook leaves `(76,790)` and `(140,786)`, upper leaf `(169,565)`, small pot `(225,670)`, jar roots `(309,777)`, and the visible rightmost tray sprout `(101,710)`. The tray change was credited at the rightmost sprout on mobile.

### Interaction and boundaries

- At both widths, the target scenes reached the normal held-fact state after all seven visual taps. Next was explicitly pressed on desktop World to proceed to Nature; on mobile World completion was held on the fact before the profile navigated back to the world.
- Mobile back navigation returned to Thinking & Play and showed “Played 3”; a normal reload retained that badge.
- Target cues and photographs were not supplemented from hidden guides or source-side answer data. All target tests were picture-coordinate clicks.
- The mobile full-page screenshot showed no horizontal overflow; `document.documentElement.clientWidth === 390` and `scrollWidth === 390`.
- Console inspection at the end of both sessions returned zero messages/errors/warnings. Filtered request logs contained no `/api/voice` or `/api/story` calls; static assets were the only requests omitted by the filter. Routes had been installed before navigation, so this is guarded local evidence.
- Sound remained muted. No human-listening, narration readiness, audio-quality, production, or 4.5 acceptance claim is made.

## Screenshots

- `screenshots/world-desktop-before-interaction.png`
- `screenshots/world-desktop-4of7.png`
- `screenshots/world-desktop-held-fact.png`
- `screenshots/nature-desktop-before-interaction.png`
- `screenshots/nature-desktop-5of7.png`
- `screenshots/challenge-mobile-first.png`
- `screenshots/nature-mobile-before-interaction.png`
- `screenshots/nature-mobile-hints.png`
- `screenshots/nature-mobile-6of7.png`
- `screenshots/world-mobile-before-interaction.png`
- `screenshots/world-mobile-hints.png`
- `screenshots/world-mobile-held-fact.png`

## Disposition

5354 is a useful interaction and reachability delta, not an accepted art result. The World repaint edges and Nature tray/notebook mask issues are material visual-search defects. The root has frozen a separate 5355 mask-repair candidate; its rendering must be inspected independently. This report does not claim that candidate passes. The historical full baseline for the other scenes remains separate.
