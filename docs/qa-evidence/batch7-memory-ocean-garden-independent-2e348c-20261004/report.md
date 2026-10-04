# Independent Ocean remainder and Garden fish art delta — 2026-10-04

## Candidate and setup

- Frozen local candidate: source `2e348c04933243c81d95414365ba631880163293`, served at `http://127.0.0.1:5306` from `tmp/batch7-memory-ocean-completion-final/dist`.
- Candidate identity: `docs/qa-evidence/batch7-memory-ocean-completion-identity-20261004.json`; all seven frozen/served SHA-256 entries match.
- Fresh isolated Playwright session `ocean-fish-2e348c`; chose Amari from the visible profile chooser, turned sound off, and added `/api/voice` and `/api/story` route guards before visiting the app. Guards remained active. Static request records include the jellyfish, crab, squid, ocean fish, and pond fish assets returning HTTP 200; no voice/story calls were made.
- Ordinary level progression only: completed Forest Friends with visible card flips, followed its enabled Next level control, completed Ocean Splash, and followed each next-level control through Space Sparkle, Party & Treats, Dinosaur Discovery, All Kinds of Vehicles, Yummy Feast, Astronaut Mission, and Garden & Pond Life. Then replayed the already-earned Ocean and Garden levels through their visible level controls. The helper read names only after each card visibly flipped face up.

## Results

- **Ocean Splash, desktop 1280×800:** 16 cards / 8 pairs completed. The new cards visibly showed matching art and authored accessible names: clownfish picture labelled “Fish”, Jellyfish, Crab, and Squid. Their mapped WebPs loaded at natural dimensions 512×512, 506×512, 512×430, and 512×512 respectively. Existing Shark, Whale, Dolphin, and Turtle pairs remained distinct. Full board screenshot: `ocean-level2-desktop-completed.png`.
- **Ocean Splash, mobile 390×844:** replayed all 16 cards / 8 pairs. The same new four pictures and labels appeared; cards measured 82×82px and document scroll width equalled 390px. Captured board: `ocean-level2-mobile-completed.png`.
- **Garden & Pond Life, desktop 1280×800:** completed 34 cards / 17 pairs. Both authored “Pond Fish” cards displayed the same orange goldfish image, loaded at 512×512. Screenshot: `garden-level9-desktop-completed.png`.
- **Garden & Pond Life, mobile 390×844:** replayed 34 cards / 17 pairs. Both Pond Fish cards again showed the goldfish, with 82×82px cards and no horizontal overflow. Screenshot: `garden-level9-mobile-completed.png`.
- **Face-down/reveal behavior:** at mobile and desktop widths, Ocean Splash showed 16 face-down cards and zero `<img>` front images. After clicking a card through the UI, the visible label became “Jellyfish card” and its mapped WebP loaded successfully at 506×512. Captures: `ocean-level2-mobile-facedown.png`, `ocean-level2-desktop-facedown.png`.
- Browser console: 0 errors and 0 warnings. No broken new art asset requests were observed. All rendered boards fit their viewport width.

## Separate out-of-scope observation

The existing Frog card image on Garden & Pond Life appears as a very narrow vertical strip in the captured desktop and mobile boards. This is not one of the new assets in this candidate delta and did not affect the Pond Fish cards. It is reported for separate triage, not treated as a failure of the Ocean/Garden fish art delta.

## Scope and limits

This report independently checks the four new Ocean cards and Garden-context goldfish mapping, board labels, face-down image suppression, face-up asset loading, and layouts at desktop/mobile sizes on this frozen local candidate. It does not certify remaining Memory illustrations, listening or narration, production behavior, or a 4.5 score. Human listening and broader art review remain separate gates.
