# Production release and rehearsal — 17 October 2026

## Release identity

Canonical site: https://dinospace-eight.vercel.app/

The authorised promotion of tested preview `dpl_BA9CG8yzqSQCi6Mdu2QqoCLbPZWQ` caused Vercel to create production deployment `dpl_RYDk3vA7HZpY7KX8cL2PdwgKaNDt`. The canonical alias was checked after promotion and again after rehearsal: READY, project `prj_Ynw7abkJRQph4IebF9jonrYmEC4w`, runtime SHA `be72df4075e997f22cd26dca7962f0a4d2232c9d`. Browser served bundle: `/assets/arcade-Dqaahojs.js`.

Previous canonical deployment `dpl_HQNZMHJq3E3qynrJaHjUwNi4rp3b`, runtime `28f6c5980b9f60ad8848392b74d261b7a2d7c8c3`, is recorded in before-identity.json. The first immediate alias query still returned this previous deployment while promotion was completing; the later canonical checks confirmed the new deployment. No claim relied on that initial query.

## Live rehearsal

All checks used the canonical production address and one contained headless Chromium browser/tab, with a fresh isolated synthetic QA profile. The previous dedicated QA session had closed; its named contained session was restored. Unrelated Chrome was not used. Provider voice/story routes were blocked before gameplay; real child data was not used or altered.

- Home: all five generated world illustrations at 1440px and 390px.
- Catalogue: all 34 game illustrations at both widths (68 checks), five world pages at both widths. No broken artwork, clipped card titles, horizontal overflow or page errors. Favourite controls toggled on/off and restored.
- Navigation: one actual game-card launch and parent-world return from every world at both widths (ten journeys), with no broken images, overflow or page errors.
- Code Cadets: first sequence mission completed; second mission's incorrect route ran and was repaired; third mission completed with repeat and collect. Program saved, left and reopened through normal Home → Creative Lab navigation; all four saved blocks remained.
- Writing Desk: Earth postcard title and body typed, Earth picture inserted, document saved, left and reopened. DOCX downloaded. ZIP/XML validation confirmed both expected text strings and embedded image files.
- Solar: nine models ready; all-worlds overview, Earth close-up and mouse drag inspected. Wheel scrolling and touch swipe over the canvas advanced the page. Reduced-motion mode paused initially and explicit Resume enabled rotation.
- Timed Earth-only screenshot comparisons: spinning mean RGB difference 24.526; paused difference 0; drag difference 12.475. These distinguish actual movement from a static image.

## Rehearsal script correction

The long activity script completed its coding, writing and Solar assertions, then timed out looking for a `Next: Code Cadets` link. That link exists only when the optional rehearsal query is enabled; this run deliberately used normal app navigation. No app defect was identified. The continuation script used normal Home → Creative Lab → Code Cadets controls and verified the saved four-block program. Both the original log and successful continuation are retained for audit.

## Console and scope

Final console error check: zero errors. Chromium's software WebGL renderer emitted four GPU ReadPixels performance warnings during Solar captures; browser-console.log preserves these. They were not JavaScript failures.

This release includes the cumulative tested preview, including the world/game imagery, corrected Earth model, shared design frame, Code Cadets and Writing Desk. These are production checks of the named journeys, not certification of every gameplay path or all 26 games at 4.5/5. Paid generation, story-provider availability, audio listening acceptance and global game-quality sign-off were not part of this rehearsal. Monitoring was not restarted.

Screenshots, scripts, production identities, catalogue/navigation results, motion measurements and the downloaded DOCX are retained beside this report.
