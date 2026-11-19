# Dino Detective expedition · 19 November 2026

Askia’s Dino Detective now has twelve creatures across Fern Forest, Waterfall River and Red Rock Canyon. The hunt still starts with two hiding places, with three places and subtler footprints in later levels. After finding a creature, children can hear its name, play Count Tracks or Spot the Feature, or continue the hunt. These optional games leave hunt scoring and existing reward records intact.

The production app source `4396b77f955654b7ec596be85b7b86d0d86d16b3` was pushed to GitHub main. The single public site at https://dinospace.netlify.app serves entry `/assets/arcade-CRtuP5MF.js` and service worker cache `amari-discovery-v81` through Netlify gateway `6aff65c7e49068677816ce23` and immutable backend `dpl_1uCsd2udUekWww5Ehr4uun7vzqkY`. Eight checked assets matched the compiled build, backend, gateway draft and public site.

All 764 tests passed. On the canonical site, both 390×740 and 1440×844 Chromium viewports completed all five levels and 29 hunts. Across the two runs, all 12 creatures appeared and their reveal art decoded. Each run played both optional games ten times, covered all six feature clues, verified wrong-answer retries, brighter trails, skip and next controls, narration starts, and saved level completion after reload. The phone-size run used touch input. The release update via Refresh games preserved all 118 synthetic localStorage records and the synthetic Storybook database. The final runs recorded zero failed HTTP responses, browser errors or paid provider attempts.

The rehearsal used the isolated test profile and browser-sized phone and desktop viewports. Physical handset and human pronunciation checks were outside its scope.

[Production summary](production-summary.json)
