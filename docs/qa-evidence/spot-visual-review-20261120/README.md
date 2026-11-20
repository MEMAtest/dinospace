# Spot the Difference visual rehearsal · 20 November 2026

Live at https://dinospace.netlify.app. The source at `8b47339d366c01f8f0c24cf307a2ea1ae9b0bf7b` is on GitHub main. Nine checked assets matched the local build, immutable backend and Netlify draft and production. All 764 automated tests passed.

## What changed

- A hint pressed from Picture A now displays Picture B and the active marker. Finding a different change leaves the current hint visible until its own change is found or another hint is requested.
- In Sound Safari, the blue flower replaces the faint elephant toenail change. In Robin’s Woodland, the ladybird's whole shell changes colour so the child can spot it at phone size.

## Live results

| Check | Phone-sized Chromium | Desktop-sized Chromium |
| --- | ---: | ---: |
| Picture pairs completed from fresh progress | 12 | 12 |
| Differences accepted through picture taps | 60 | 60 |
| Hints tested | 24 | 24 |
| Chapters with all four pairs still saved after reload | 3 | 3 |

The phone run used simulated touch at 390×740 and the desktop used mouse at 1440×844. Play clicks came from clean rendered picture comparisons and direct visual inspection. The initial mobile run inspected several small details more closely and solved all 12 pre-change pairs. Checks used the hint marker's visible pixels and visible progress controls. No QA answer labels or hidden target positions supplied the play clicks. The two hints in each pair highlighted different details and a third hint was disabled. On the live phone run, all 24 hints switched to Picture B; the marker remained after an unrelated find in all 11 observed instances. No browser errors, failed HTTP responses, or provider requests were observed.

The actual Refresh games update preserved all 118 baseline synthetic save records and the synthetic Storybook database. Physical phones and a child's first-time play remain outside this browser rehearsal.

[Structured results](production-summary.json) · [Before and after phone crops](phone-picture-comparison.webp)
