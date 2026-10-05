# Canonical production health sample

Date: 2026-10-05

## Deployment identity and guard

The Vercel CLI resolved `https://dinospace-eight.vercel.app` to READY production deployment `dpl_5cKFB6U489CLoEPucaY9pDarcHsp` (`dinospace-3sqfand4s-memas-projects-23a0001d.vercel.app`). This matches the retained canonical identity at [`count-scatter-strategy-5396/canonical-identity.json`](../count-scatter-strategy-5396/canonical-identity.json): runtime source `1accc99e89be303678ead99def6a3095ab1cb886`, archive `22d805b67ced8b36f45d0f5c547bfe67c5dded88`.

I fetched and SHA-256 checked the four identity-listed production paths. All returned HTTP 200 and matched their recorded hashes:

| Path | SHA-256 |
|---|---|
| `/` | `2e748948880b91d40506124b861e3dabf96c129be8ad07552dbf6cfce0e859b5` |
| `/assets/index-BISzYVQf.js` | `5af0093999f66d016cfbed296bc4a79271d316c94f16414f5189e8a92f737222` |
| `/assets/index-vOQrpuVv.css` | `beb809b91d1c2ee0d0ec4208349a767e34f3f93ce46ba6146a3317ba37f0dc63` |
| `/assets/AmariCountTheStars-CsClYaHL.js` | `a8e614d0c393821723a2f33d41dd235fa58a9dbb072dabfa7ab7e5611b74abe5` |

Using the existing `default` Playwright CLI tab only, I installed `/api/voice/**` and `/api/story/**` 403 guards, probed both routes, observed 403 responses, and returned the same tab to `about:blank` before app navigation. No new browser, tab, context, incognito profile, or window was opened. After navigation, the request log showed no voice/story API call. Static app, map, storybook JSON/image, and requested packaged audio-file resources returned 200 or byte-range 206; no broken asset was observed.

Sound was muted through the visible UI button before gameplay and remained muted (`Turn sound on`) until the session was left at the Amari home screen at 390×844. Console reported zero errors and warnings.

## Curriculum Quest: continents and directions

The selected existing synthetic Amari profile showed 0 stars before ordinary gameplay. At desktop 1280×800, I opened Explore & Languages → Curriculum Quest → Continents & Oceans, started the ordinary Starter round, and selected the visible Africa map pin. The game held the correct result and the fact:

> Super! Africa is between the Atlantic and Indian Oceans. Kenya and Egypt are in Africa.

Progress changed from 0/5 to 1/5. `Next question` advanced to “Which way is east on our map?” (Round 2 of 5). See [the desktop held-result snapshot](snapshots/curriculum-desktop-africa-held.yml).

At 390×844, I chose the visible `Right →` answer for the east question. The held result said “Great job! With north at the top, east is to the right.” Progress changed to 2/5; `Next question` advanced to Round 3, “Find Europe on the map.” [The mobile held-result snapshot](snapshots/curriculum-mobile-east-held.yml) and [Round 3 snapshot](snapshots/curriculum-mobile-round3.yml) record these states.

The visible `Hear` controls were disabled on these screens. I did not attempt to bypass them or play audio. This was a short route/progression sample, not a full five-question run. Leaving through the normal confirmation returned to Explore & Languages. From home, `Play again` opened a fresh Starter run at 0/5 with a different first continent (Antarctica); the profile's global stars remained 2. This shows the observed restart behavior for this explicit replay route, without concluding whether a new run is intended. See [the re-entry snapshot](snapshots/curriculum-reentry-reset.yml). No profile/child was created or edited; the existing synthetic Amari profile gained two stars through the requested normal correct-answer flow.

## Curated Storybook shelf: open, read, return

At both 390×844 and 1280×800, I opened Read & Write → Storybook Studio and used the existing curated entry **Rex and the Missing Moon Map** (ages 5–6, Moon Explorers); I did not select a create/new-story action. The shelf showed the existing curated book list. On mobile, the cover opened into page text. Page 1 began “Rex the young T-Rex astronaut loved exploring.” A visible page advance showed the next story text and the story’s page indicator progressed. The shelf’s `Back to storybooks` control returned to the curated list, and the ordinary `Back to learning world` → confirmation `Back to world` path returned to Read & Write.

At desktop, reopening the same book resumed at Page 4 of 11 with readable page text: “At the big crater, something glimmered in the dust. It was a shiny corner of paper! As Rex stepped closer, his boot nudged the dust, and the paper slipped downhill.” Returning to the shelf and leaving to the learning world worked. The book’s `Auto-turn pages after narration` option was enabled on the cover; progression reached Page 4 while the app was muted. Packaged story audio files were requested as static byte ranges, but no audio was intentionally played or listened to, so this is not playback or audio-quality evidence. The existing synthetic reader’s saved position advanced normally; no story or child record was created. Screenshots: [mobile page 1](screenshots/story-mobile-page1.png), [mobile page 3](screenshots/story-mobile-page3.png), [desktop shelf](screenshots/story-desktop-shelf.png), [desktop page 4](screenshots/story-desktop-page4.png). The saved UI snapshots include the [mobile shelf return](snapshots/story-mobile-shelf-return.yml) and [desktop page text](snapshots/story-desktop-page4.yml).

## Scope and limits

This verifies only a small canonical address/control sample: one ordinary continent answer with its held fact, one directions answer and round advance across viewports, curriculum replay entry behavior, and one existing curated story’s open/read/return path. It does not test all curriculum modules, full rounds, progress persistence after reload, generated stories, paid voice/story behavior beyond blocked guard probes, audible playback, human listening, or any 4.5/release acceptance gate. The profile’s normal-gameplay changes are recorded above; no hidden storage, unlock, answer, or child data was injected or reset.
