# Spot the Difference continuation rehearsal · 21 November 2026

The previous live release reproduced the reported stall at **2 of 3 changes**. After both hints were used, the hint button was disabled and no reveal or continuation control was available. A separate narrow-screen check found the header took 346 pixels of a 320-pixel screen.

- **Show me a change** appears after the two hints. It names the change, circles it in Picture B and allows either a tap on the circle or **Mark this change**. Help can be repeated until every change is found.
- **Continue chapter** resumes at the first unfinished pair. An unavailable save offers a retry and permits continued practice. A pending chapter reward has its own retry while **Next chapter** remains available.
- The header fits the narrow phone layout with all navigation buttons available. The picture fact screen puts the next action first and focuses the result heading.

| Check | 390×740 live touch | 1440×844 live mouse | 320×740 candidate touch |
| --- | ---: | ---: | ---: |
| Unique pairs completed and saved from scratch | 12 | 12 | 12 |
| Changes in those pairs | 60 | 60 | 60 |
| Hint activations across saved, unsaved and replayed attempts | 28 | 28 | 28 |
| Guided reveals across the same attempts | 42 | 42 | 42 |

Each run denied one pair save and retried it, denied a second pair save and kept playing, then reloaded and finished the skipped pair. The next chapter remained available during a simulated reward write denial, and the saved reward was retried once. All three two-star rewards and all 12 completed pairs survived reload. Replay did not duplicate progress or rewards. The browser sessions used emulated touch or mouse inputs. No browser errors, HTTP errors or provider calls were recorded.

A 390-pixel live progression check also completed a 3×3 Puzzle Pop picture and advanced to the next. Sound Safari recovered from a wrong answer in the same challenge and then advanced.

766 repository tests passed. The immutable backend, Netlify draft and public site matched local hashes for 7 resources. The in-app **Refresh games** update preserved all 118 synthetic records and the IndexedDB Storybook fixture.

Runtime `dcbcae3363fb3f6181925466ce8053c6f844c5b9`, module `/assets/arcade-Bt3UI7Oi.js` and worker cache `amari-discovery-v85`. Vercel deploy `dpl_47U5MoeUpoVgy2PM5sJRE8RxyNq4` and Netlify gateway `6b01cd21d91891928ebf59e7`.

[Play Spot the Difference](https://dinospace.netlify.app/#/play/spot) · [Structured results](production-summary.json) · [Live phone screenshot](reveal-390.jpg)
