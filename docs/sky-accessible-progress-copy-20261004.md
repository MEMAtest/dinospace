# Sky Shapes accessible progress wording repair

Independent current production review found technical wording in the screen-reader-only live region: “sampled moves”. It is not visible viewport copy.

The candidate says “Part X of N. Follow the glowing dots to the flag.” while tracing, and “Flight finished. Your stars are saved.” after completion. The live region changes at part/completion boundaries instead of announcing a sampling percentage on each movement. Scoring refs, render setters, pointer/keyboard controls, packaged narration and star persistence are preserved.

Changed-file ESLint and 19 focused Sky/narration/navigation tests pass. The navigation test starts Vite and emits a nonfatal dependency-scan warning for preserved historical tmp snapshots; all 19 assertions pass. A clean configured build and independent candidate/production deltas are required before release. No new 4.5 acceptance.
