# Batch 7 Memory Match Ocean art: independent browser review

Date: 2026-10-04  
Frozen candidate: `http://127.0.0.1:5298`  
Source: `3a2d3676369b413430417ec1ec0972b84f100cdc`  
Candidate identity: [candidate-identity.json](candidate-identity.json)

## Method and progression

I used fresh isolated Playwright profile `b7-ocean-art-3a2d367`. While it was on `about:blank`, I installed and verified route guards for `/api/voice` and `/api/story` before navigating to the frozen origin. Both guards remained active. The profile contained only synthetic game progress earned during this review. I selected Amari through the visible player screen, opened Thinking & Play > Memory Match, completed Forest Friends through actual card flips, then used the enabled Next Level control to unlock Ocean Splash. I matched the Ocean Splash cards at 390 × 844 CSS px, then replayed Level 2 through its visible level selector at 1280 × 800 CSS px. In both runs, card names were read only after the corresponding card had actually turned over. No progress or answers were injected, and no hidden card content was inspected.

Ocean Splash completed as 8 pairs from 16 cards in both runs. The mobile run showed the visible Next Level control after completion; the desktop replay also showed 8 matched pairs and the visible continuation control.

## Ocean art observations

All four new faces were revealed at both widths and remained visually distinct from one another and from the other Ocean Splash animals.

| Face | Mobile 390 × 844 | Desktop 1280 × 800 |
|---|---|---|
| Whale | Recognizable whale body, tail, and water spout; “Whale” label visible. [Completed board](screenshots/mobile-ocean-complete-settled.png) | Distinct whale cutout and label. [Completed board](screenshots/desktop-ocean-complete.png) |
| Dolphin | Jumping dolphin and spray remain distinct from whale and fish; “Dolphin” label does not collide with the art. [Completed board](screenshots/mobile-ocean-complete-settled.png) | Dolphin illustration and label are clearly separated. [Completed board](screenshots/desktop-ocean-complete.png) |
| Shark | Recognizable shark profile with fin, gills, and mouth; “Shark” label visible. [Completed board](screenshots/mobile-ocean-complete-settled.png) | Shark cutout and label are clear. [Completed board](screenshots/desktop-ocean-complete.png) |
| Turtle | Green sea turtle with shell and flippers; “Turtle” label visible. [Completed board](screenshots/mobile-ocean-complete-settled.png) | Turtle cutout and label are clear. [Completed board](screenshots/desktop-ocean-complete.png) |

At the face-down mobile state, all 16 cards showed the same themed backs and none of the four new animals was visible. Before the first Ocean card was flipped, I filtered the actual static request list for the four new asset names and got no matches. After actual card flips, the browser requested Whale, Dolphin, Shark, and Turtle assets; each returned HTTP 200. The matching labels appeared in the rendered accessibility names only after flip. See [mobile closed backs](screenshots/mobile-ocean-closed.png), [desktop closed backs](screenshots/desktop-ocean-closed.png), and [new art requests](new-art-asset-requests.txt).

## Layout and interaction findings

- At 390 × 844, document width equals the 390 px viewport. Memory cards measured 82 × 82 px. Back, sound, and memory-tip controls measured 48 × 48 px; all ten level selectors measured 53.5 × 48 px. The full Ocean board fits without horizontal scrolling or a persistent overlay.
- At 1280 × 800, document width equals the 1280 px viewport. Cards measured 231.25 × 231.25 px; Back, sound, and memory-tip controls measured 48 × 48 px.
- **Desktop target-size finding:** all ten level selectors measured 44 × 44 px at 1280 × 800, below the requested 48 px minimum. They remained pointer-operable during the visible Level 2 replay. Mobile selectors met the 48 px height threshold. The measurements are preserved in this report; the frozen candidate was not changed.
- A temporary “Great job! +3 stars” toast appeared over disabled Level 4–6 pills immediately after mobile completion. It disappeared after about four seconds and did not cover the enabled Level 3 selector or Next Level button. The immediate and settled states are captured in [mobile-ocean-complete.png](screenshots/mobile-ocean-complete.png) and [mobile-ocean-complete-settled.png](screenshots/mobile-ocean-complete-settled.png).
- Desktop content is vertically scrollable to reach the full board; there is no horizontal overflow. The closed-back desktop capture shows the visible viewport, while the completed-board capture includes the full board.

## Network and console

The four new asset URLs were served successfully, and the exact candidate identity records matching frozen hashes for HTML, JavaScript, CSS, and all new WebP files. See [candidate-identity.json](candidate-identity.json) and [asset-requests.txt](asset-requests.txt). Both provider route guards were active before application navigation; no `/api/voice` or `/api/story` requests occurred. The browser console reported zero errors and warnings. Logs are preserved in [provider-guards.txt](provider-guards.txt), [provider-requests.txt](provider-requests.txt), and [console.txt](console.txt).

## Scope limits

This is an independent Ocean Splash art, rendered-label, touch-target, and responsive-layout delta. It is not a full Memory Match matrix, human listening, audio acceptance, production verification, release decision, or 4.5 acceptance. No provider was contacted and no source or frozen files were changed. Broader human visual and gameplay acceptance remain pending.
