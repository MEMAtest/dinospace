# Batch 5 integration route ownership follow-up

Date: 2026-10-04
Candidate: `http://127.0.0.1:5368/`
Source: `b198dbf49a5023e1b50181a9ef2a3eabd4c80a35`
Frozen identity: [candidate identity](../batch5-integration-20261004/identity.json)

This bounded follow-up checks the ordinary Askia/Amari route resolver and retained B3 game entry points. It supplements the [5368 integration QA report](independent-report.md); it is not a full game matrix or audio acceptance.

## Isolation and diagnostics

Used fresh Playwright profiles `b5ownership5368d` (1280×800) and `b5ownership5368m` (390×844), each opened at `about:blank`. Before first app navigation, both `/api/voice` and `/api/story` routes were installed with HTTP 403 `QA guard` responses. The route list still showed both guards after the UI checks. The synthetic Askia and Amari profiles were selected using the visible profile picker; no progress, answer, seed, or local storage injection was used. Sound remained visibly off. No provider calls were made.

Both sessions reported 0 console messages (0 errors, 0 warnings). Request summaries showed no non-static requests; the CLI noted 27 static requests on desktop and 26 on mobile. This check makes no claim about audio playback or listening quality.

## Askia legacy module resolution

The visible Askia profile was selected from the welcome/profile picker at both sizes. Askia's Little Home does not expose Sound Safari or Spelling Studio, so those two modules were reached by navigating their ordinary internal game routes (`/play/phonics` and `/play/words`) while Askia was active. This verifies the active-profile component resolver and legacy screen rendering; it does not prove those modules are discoverable from Askia's home menu.

- `/play/phonics` rendered the legacy `Sound Safari` screen, `Level 0 of 0`, `Match the sounds`, and `8 to finish`. Starting the level showed the legacy `Letter Match` and `Blend It` modes, a visible prompt (“Which picture starts with …?”), and a `Hear the sound` button. The button was not activated and no answer was guessed from sound.
- `/play/words` rendered the legacy `Spelling Studio` screen, `Level 0 of 0`, `Build the word with the sounds`, and `6 to finish`. Its entry was distinct from the Amari chapter selector. No audio button was activated.

Desktop and mobile snapshots are saved under [route evidence](routes/). Askia's normal home/menu discoverability remains unverified because these two routes are not linked there.

## Amari B3 route retention

After switching to Amari with the visible profile control:

- **Count the Stars:** normal Home → Maths Missions entry opened `#/play/counting` at both widths. The rendered `Star Garden` chapter showed “Count from 1 to 5. Six rounds · starter band.”, its visible `Start survey` control, and later chapters visibly locked. `Back to Maths Missions` returned to the Maths Missions world. This is entry/map/parent-return evidence, not a round-completion retest.
- **Letter Trace:** normal Home → Read & Write entry opened `#/play/trace` at both widths. The `Follow the path` chapter showed “Trace eight big letters, one careful stroke at a time,” 0 chapters earned, and the remaining chapters locked. `Start chapter` opened round 1 of 8 with a visible letter guide, start/direction instruction, `Show this stroke`, `Retry trace`, `Use keyboard`, and disabled `Check shape`. At both widths, `Back to learning world` followed by the visible confirmation returned to Read & Write. No trace answer or narration was activated.

The entry evidence supports preservation of these B3 routes within the integrated candidate; it does not establish full chapter progression, persistence, or handwriting completion on 5368. The Amari-specific chapter route selection is also covered by the source checks below.

## Source and test corroboration

- `src/App.jsx` selects `amariComponent` only when the active profile is not Little/Askia; the explicit Amari `counting` and `trace` components are selected in that same branch. Otherwise, the catalog component is rendered.
- `src/gameCatalog.jsx` maps `phonics` to legacy `SoundSafari` plus Amari `AmariSoundSafari`, and `words` to legacy `WordBuilder` plus Amari `AmariSpellingStudio`. `counting` and `trace` retain their original catalog components.
- `test/batch5ReasoningUi.test.mjs` asserts both legacy and Amari component mappings. `test/batch3ProgressionOwnership.test.mjs` covers the B3 game ownership/session paths, including counting and trace.

These checks support component and progression ownership routing only. They do not claim full collection isolation or prove every profile/game combination.

## Evidence

- Askia legacy Sound Safari and Spelling Studio entry/question snapshots: [routes](routes/)
- Amari Count the Stars desktop/mobile chapter maps: [desktop](routes/amari-desktop-count-stars.yml), [mobile](routes/amari-mobile-count-stars.yml)
- Amari Read & Write listing, Letter Trace chapter entry and round 1: [listing](routes/amari-desktop-read-write.yml), [mobile entry](routes/amari-mobile-trace-entry.yml), [desktop round 1](routes/amari-desktop-trace-round1.png), [mobile round 1](routes/amari-mobile-trace-round1.png)

## Result and limits

The bounded component-resolution checks passed at desktop and mobile: Askia's active profile rendered the legacy routed modules; Amari's ordinary Maths and Read & Write navigation rendered the chapter-owned Count the Stars and Letter Trace paths and returned to their parent worlds. The legacy routes' absence from Askia Home is a discoverability limitation, not a resolver failure. This follow-up does not verify full game completion, audio, full profile isolation, or release readiness.
