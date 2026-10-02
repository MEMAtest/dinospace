# Sky Shapes progress follow-up

This follow-up addresses the desktop pointer result on immutable candidate 5284. The candidate itself and its QA artifacts remain unchanged.

The mission progress calculation previously used the final point's zero-based index as the completed-point count, so it displayed 99% when the last point was accepted. `skyTraceProgressPercent` now returns 100% when the trace is complete; live route accuracy remains a separate percentage.

I reviewed the pointer-to-SVG mapping at narrow widths. The SVG viewBox is 1000×650 and its rendered aspect ratio is explicitly set to 1000/650, so the current bounding-rectangle scaling uses the same aspect ratio and does not introduce letterbox offsets at 390px. No coordinate change was warranted by the current source.

Added a regression test for the old 99% final-point calculation and the completed 100% state. `npm test`, `npm run lint`, `npm run build`, and `git diff --check` pass. The independent tester is covering the remaining QA; this is not a new browser acceptance claim. No deployment or commit was performed.
