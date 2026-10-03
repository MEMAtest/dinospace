# Letter Trace marker repair: local browser delta

Date: 2026-10-03
Candidate: `http://127.0.0.1:5223`
Source SHA: `95f57cbb5a7065e0ae93c0d304165f4d8acb388d`
Identity: [`batch3-trace-marker-identity-20261003.json`](../batch3-trace-marker-identity-20261003.json)

This report covers the immutable 5223 marker repair only. It is separate from the 5219 frozen candidate run recorded in `batch3-trace-full-local-20261003`; the two candidate identities and results must not be combined. The 5223 identity lists all runtime asset hashes and reports 199/199 source tests, full ESLint, and production-configuration build passing. All six served runtime asset hashes were independently recalculated and matched that identity.

## Isolation and request guard

- Fresh Playwright browser contexts were used for desktop (`1280×800`) and mobile viewport (`390×844`). The visible Amari profile selector and ordinary world/game controls opened Letter Trace.
- `**/api/voice**` and `**/api/story**` routes were installed and confirmed before the first app navigation in each context. Sound was turned off through the visible control. Each request inventory contained only 13 static requests, with no voice/story/provider request. Both console inventories had zero errors and zero warnings.
- All tracing used ordinary visible pointer gestures. No seed, answer, game progress, local storage, or hidden guide data was read or injected. Mobile input was emulated pointer input at a 390×844 viewport, not physical-device touch.

## Shared-start `D` result

Each fresh ordinary Starter run exposed `D` at round 8. On desktop and mobile, the initial guide visibly placed green `1` at the top-left shared start. After a real pointer trace of stroke 1 and lift, the UI retained 14% progress and displayed green `2` at the same point for stroke 2. The initial green `1` remained legible above the guide path in the initial screenshots, and the subsequent green `2` remained legible after stroke 1.

At both sizes the second stroke reached 100%, and Check shape displayed “You followed the letter. Great tracing!” with the explanation held and one final action (“Finish chapter” for round 8). Desktop needed a corrected second-stroke path after one visible “Nice try” response; mobile completed `D` without that mis-trace. This does not affect the marker-drawing result, but the desktop `D` is not evidence of a first-try mastery event.

Screenshots:

- Desktop: [initial green 1](desktop/D-initial-green1.png), [stroke 1 complete, green 2](desktop/D-stroke1-complete-green2.png), [held success](desktop/D-held-success.png), [Starter 8/8 badge](desktop/starter-8of8-badge.png).
- Mobile: [initial green 1](mobile/D-initial-green1.png), [stroke 1 complete, green 2](mobile/D-stroke1-complete-green2.png), [held success](mobile/D-held-success.png), [Starter 8/8 badge](mobile/starter-8of8-badge.png).

The D marker overlap seen on 5219 is absent in these rendered 5223 screenshots. A second two-stroke letter, `P`, appeared in each ordinary Starter queue. Its initial green `1` was at bottom-left and future gray `2` at top-left; after the first vertical pointer stroke, green `2` was prominent at the top-left shared point. See [desktop P initial](desktop/P-initial-markers.png), [desktop P stroke 1](desktop/P-stroke1-complete-green2.png), [mobile P initial](mobile/P-initial-markers.png), and [mobile P stroke 1](mobile/P-stroke1-complete-green2.png). Letters `B` and `R` did not appear in either eight-round queue, so they were not tested.

## Starter progression and replay

The complete fresh desktop Starter queue was `G, M, N, C, A, I, P, D`; the complete fresh mobile queue was `A, P, G, M, I, N, T, D`. Each round was completed through visible pointer tracing and Check shape. Both contexts reached the ordinary “Chapter complete!” screen confirming eight rounds and a saved Follow the path badge. The map reported `1 chapters earned · 2 letters independently mastered` on desktop and `1 chapters earned · 1 letters independently mastered` on mobile. These visible counts reflect the app’s own criteria; no broader mastery claim is made.

On desktop, the visible Replay chapter control began a second Starter run at round 1 with `M` (also present in the first Starter run). Pointer tracing reached 100%, and Check shape again held the success explanation; screenshot: [Starter replay M held success](desktop/starter-replay-M-held-success.png). This is one same-band replay. The replay was not advanced beyond its first round.

## Mobile layout

The mobile viewport remained 390 CSS pixels wide and `document.documentElement.scrollWidth` stayed at 390. During active A tracing, the canvas measured 332×397 at x=29 and fit inside its wrapper. Check shape and the lower action row require vertical scrolling; the completion screen’s final action is below the initial fold but reachable via ordinary scrolling/visible locator click. The rendered page had no horizontal overflow. Minimum action-button heights measured 48px in the sampled A screen. No physical touch hardware was available in this browser emulation.

## Bounds

This is local evidence for the 5223 candidate and the marker repair. It is not production evidence or overall product acceptance. It covers the complete Starter chapter at both widths, one same-band Starter replay through its first round, and the shared-start D/P marker sequence. Growing and Challenge remain outside this report. The separate 5219 full-scope request remains incomplete; its partial observations are recorded in its own folder and must not be treated as full acceptance.
