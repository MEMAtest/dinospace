# Spot the Difference — Robin physical-pair review (5356)

**Date:** 2026-10-04  
**Frozen candidate:** source `b7b9f10b06db9cffb4aa96e718bcb49fedbec7ae`, served locally at `http://127.0.0.1:5356`, distribution `tmp/spot-robin-physical/dist`.  
**Identity:** [`candidate-identity.json`](candidate-identity.json). It records 15 served file identities; independent fetch/hash comparison reported 15/15 matches. The local source and frozen distribution were not edited.

## Scope and lineage

This is an independent narrow check of the new Robin’s Woodland Challenge pair at desktop 1280×800 and mobile 390×844. It is not a rerun or replacement for the prior Spot baseline. Nature Lab and World Explorer on 5355 have their own report and screenshots; this review covers the newly authored Robin pair only. The earlier Robin badge/leaf-shape observations on 5351/5353 are retained separately; this physical-pair result does not retroactively certify those candidates.

The 5356 identity describes seven depicted-object changes: flower color, watering-can color, canopy-leaf shape, fallen-leaf shape, daisy detail, ladybird detail/count, and worm shape. All seven were distinguishable in the side-by-side rendered pair at both widths. I saw no floating answer badges, obvious unregistered picture changes, rectangular mask seams, or color spill into the adjacent pot/soil. The watering can’s body, spout, and handle read as one blue can while the nearby terracotta pot and surrounding leaves remain their original colors. The worm appears in its new curved shape without an obvious remnant of the former body. These are visual judgments from the rendered screenshots, not a pixel-difference claim.

## Actual UI checks

Each profile was fresh and isolated. Before the first app navigation, I opened `about:blank`, registered `**/api/voice**` and `**/api/story**` routes to return 204, then navigated to the frozen local origin. Route-list output confirmed both guards remained installed after navigation. I muted using the visible “Turn sound off” control. No provider request was made.

At desktop, normal UI play earned the first two chapters and unlocked Super Spotters. In Robin’s Woodland, I recorded a blank Picture B miss (“Not that spot yet”), used Hear clue and both magnifier hints, then tapped each of the seven pictured changes directly in Picture B. Progress reached 7/7; the fact card was held before Next. Next advanced to the following picture. Back to learning world prompted “Leave the game?” and the explicit “Back to world” action returned to Thinking & Play. The visible Spot card showed “Played 2” after the desktop run and remained after reload.

At mobile, I used the visible first-run controls to unlock both preceding chapters and Challenge in ordinary UI. Challenge replay gave History Hall, Nature Lab, then Robin’s Woodland; preceding Challenge pictures were cleared through their visible in-picture target controls only to reach Robin. At 390×844, the Robin image pair stacked vertically, all seven target controls remained reachable by scrolling, and document width was 390 CSS px with no horizontal overflow. I used hints, then direct mouse taps on the actual Robin Picture B image; visible progress reached 7/7 and displayed the Robin fact. The mobile Challenge completion and all three chapter counts survived reload (4/4 each), and the visible game card showed “Played 4” after leaving to the parent world.

The first exploratory mobile coordinate set used a stale viewport position and did not score; I discarded it. A fresh replay located the rendered Picture B bounds and used image-relative coordinates tied to the visible object regions. The final 7/7 was obtained with direct image taps, not the generic “Check … detail” buttons. Screenshots preserve the before-interaction pair and held-completion state.

## Evidence

- [Desktop Robin pair before interaction](screenshots/robin-desktop-current.png)
- [Desktop held 7/7 fact](screenshots/robin-desktop-held-7of7.png)
- [Mobile stacked pair before interaction](screenshots/robin-mobile-before.png)
- [Mobile Robin pair at 390 px](screenshots/robin-mobile-390.png)
- [Mobile held 7/7 fact](screenshots/robin-mobile-held-7of7.png)

Both browser sessions reported zero console errors or warnings. All requested static app assets shown by the browser loaded with HTTP 200. The audio/story guards remained installed throughout; all activity was muted. No human listening, narration readiness, production behavior, or 4.5 acceptance is claimed by this local narrow review. Broader Spot content/editorial, audio, and release gates remain governed by their own evidence.
