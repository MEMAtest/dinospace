# Independent Count clue-layout QA

Date: 2026-10-04  
Candidate source: `79a719e91e727f09d1f78cf890acd7e671cab381`  
Frozen preview: `http://127.0.0.1:5395/`  
Identity: [`../identity.json`](../identity.json)

## Scope and method

I used a fresh isolated Playwright CLI profile at 390×844. It began at `about:blank`; `/api/voice` and `/api/story` were configured to return 403 and confirmed active before the first app navigation. I muted sound using the visible control. I entered as Amari and earned the normal unlocks by completing six Starter rounds and six Growing rounds with visible object controls and answers. I then observed three Challenge rounds. No progress, seed, answer, or storage state was injected.

This was a focused check of the changed arrangement-specific text, not a repeat of the retained full scene-variety matrix or full Challenge completion. The preview identity records the frozen served-assets manifest digest; the builder/independent freeze check recorded all 5,879 served files matching the frozen distribution. The browser console had zero messages, errors, or warnings.

## Results

The corrected per-question description and clue matched the displayed arrangement in all three observed classes:

- **Regular rows/array:** Starter Moon Berries (3 objects) and Growing Satellite Bolts (5 objects) showed the row-count clue: “Read one row at a time, and use each badge to keep your place.” Challenge Planet Rings (8 objects) also used this clue. The rows and text fit at mobile width.
- **Separated groups:** Challenge Crater Gems (15 objects) visibly showed two separated groups and the clue “Count one visible group, then the other group. Add the two totals.” I answered 14 first; the rendered retry feedback asked me to check the count badges. I then answered 15, saw the held explanation “There are 15 crater gems. You counted each one once.”, and used Next. Screenshot: [split-group held result](screenshots/crater-gems-mobile-held.jpg).
- **Scattered objects:** Starter rounds Rocket Lights (3), Firefly Meadow (2), and Tiny Planets (5), followed by Challenge Satellite Panels (3), displayed separated individual objects and the clue “Point to each shape once. The numbered badges keep your place.” Screenshot: [scattered Satellite Panels clue](screenshots/satellite-panels-mobile-scattered-clue.jpg).

The split-group board’s counting copy is now appropriate to its visible geometry. However, the **Challenge-level strategy banner remains wrong for a scattered board**: on Satellite Panels it says “Count along a row, or count each group and put the totals together.” The three panels are scattered apart, with neither a row nor separated groups to combine. This is a concrete remaining teaching defect; the per-question clue does not correct the contradictory episode-level instruction. The screenshot preserves both the banner and the board. Do not accept or promote this candidate as complete until that banner is adapted for scattered arrangements. The row/group strategy can remain for layouts where it applies.

## Hint asset observation

For one bounded asset check, I turned sound on through the visible control and selected Show a clue on the scattered Satellite Panels question. The browser requested `/audio/en/03a953b6-matilda.mp3` and received HTTP 200. The current corpus maps that key to “Point to each shape once. The numbered badges keep your place.” No `/api/voice` or `/api/story` request was observed; both guards remained installed. The page exposed no HTML audio/video element from which playback time or cancellation could be inspected. This establishes a successful local asset fetch and key/text correspondence only; it does not establish playback, audibility, or human listening quality. Sound was returned to muted through the visible control.

## Limits

Only 15 ordinary rounds were used to reach and sample the changed Challenge behavior; the Challenge was not completed. The exact same-session interactions covered row, split-group, and scattered clue rendering, a wrong answer/retry/correct held explanation/Next on a split-group board, and one unmuted local clue-asset request. This report does not claim full-game acceptance, production acceptance, human listening, or an overall quality score. Production acceptance remains on hold pending the scattered Challenge banner repair.
