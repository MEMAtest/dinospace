# Letter Launch challenge-tracker overlay fix QA

Date: 1 October 2026  
Canonical: `https://dinospace-eight.vercel.app`  
Release identity: SHA `b6360bbf82cb32643be8a880900f13553c7300af`, deployment `dpl_9rxV9wXYUJrmUH22Z5BTFsCaAJ4s`; JavaScript `assets/index-BCMFohwQ.js`, CSS `assets/index-BH3dde_v.css`.  
Browser: isolated Playwright session `letter-overlayfix`; all gameplay and navigation used visible app controls.

## Scope

This verifies the narrow release change from `7d9d961`: Letter Launch is excluded from the floating daily-challenge tracker. Earlier Letter Launch run, telemetry, and visual proof remain in their existing reports; this is not a repeat of those checks.

## Mobile SAT feedback and motion

At 390×844, I completed Level 1 to unlock Level 2, then replayed Level 2 until its SAT round appeared. The round showed a chair picture and “She sat down on the chair.” I selected O incorrectly; the prompt stayed in place and the retry clue said to listen for the first sound in SAT. Selecting S then showed “Great job! SAT starts with the s sound.” No daily-challenge tracker appeared over the question or feedback.

In normal motion, the success feedback was readable in the initial viewport. The Next mission button began just below the fold at y≈842; scrolling moved it fully into view at about 163×56px. The feedback and Next control remained readable together. In reduced-motion mode, the same SAT scene stayed within the 390px viewport, with no horizontal page overflow; the feedback and Next control were both readable at the scrolled position. Reduced-motion preference was confirmed through `matchMedia`. The normal and reduced screenshots are:

- [Normal-motion SAT success](../output/playwright/batch1-letter-overlayfix-sat-normal-feedback.png)
- [Normal-motion SAT after scrolling to Next](../output/playwright/batch1-letter-overlayfix-sat-normal-scrolled.png)
- [Reduced-motion SAT with Next visible](../output/playwright/batch1-letter-overlayfix-sat-reduced-scrolled.png)

## Home challenge and count continuity

Before gameplay, Home displayed “Daily challenge — Answer 5 subtraction questions” with progress 0/5. After leaving Letter Launch, Home still displayed the challenge at 0/5, which is expected because the Letter Launch answers are not subtraction answers. The Read & Write Letter Launch tile showed `Played 16`, so gameplay activity remained recorded. I did not start the daily subtraction game or claim that its progress advanced.

- [Home daily challenge after Letter Launch](../output/playwright/batch1-letter-overlayfix-home-challenge.png)

## Checks and conclusion

The gameplay snapshot had no challenge tracker; the SAT card, answer choices, feedback, and Next control remained usable. At the reduced-motion SAT view, `document.documentElement.scrollWidth` was 390px, equal to the 390px viewport. The browser console reported zero errors and zero warnings.

The overlay fix is confirmed on the exact `b6360bbf` live release. The prior 390px scroll needed to reach Next remains normal page scrolling; the tracker no longer covers the SAT feedback or its continuation control.
