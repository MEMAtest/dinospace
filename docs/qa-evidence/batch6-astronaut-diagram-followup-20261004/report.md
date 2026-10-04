# Astronaut Academy conditional-diagram follow-up

Date: 4 October 2026  
Tester: independent Playwright UI review  
Candidate: frozen localhost build `http://127.0.0.1:5363/`, source `60f362368d5eedb3b43dedc4fa95eb3097672d7e`  
Scope: ordinary UI review of the Earth day/night diagram in Mission engineering and the Venus rotation diagram in Review missions. This is a narrow supplement to the retained Batch 6 gameplay and editorial reports, not a new full mechanics matrix or release/4.5 acceptance.

## Identity and setup

Candidate identity is recorded in [`identity.json`](../batch6-editorial-copy-20261004/identity.json): the frozen dist served 5,610 files and all 5,610 matched the recorded hashes. I rechecked the runtime JS (`assets/index-C42-a2Zu.js`, SHA-256 `3aa0eb4a25efd0b7c6e6c5a142374954d57aa98b256b3a23f54f00283a0aafc7`) and CSS (`assets/index-CZIXwkmD.css`, SHA-256 `c057757199ab545e7594e3b53abd89e1ce8ada62cb531f0f0fafbcb8a2d869b3`) against that frozen dist.

I resumed an existing synthetic Amari browser profile that was already on the frozen app before this narrow follow-up. Before subsequent reloads and app navigation/interactions, I installed and checked Playwright route guards for `/api/voice` and `/api/story`; no provider/story request was observed in the tested actions. This is not a claim that guards preceded the pre-existing page load. I did not invoke Hear or request generated content. The visible sound control initially showed “Turn sound on” (sound off). The profile had a visible Break Time overlay; I dismissed it through “5 More Minutes”, then used the ordinary Back/Leave game controls. Progress was earned through visible prompts/options only; no local storage, seeds, hidden answers, or progress injection was used. After guarded reload the profile’s sound control showed “Turn sound off” (sound on); this candidate-specific preference reset is a regression observation, not evidence of audible output.

Console checks after the guarded interactions reported zero errors and zero warnings. No audio was played or human-listened to.

## Earth day/night diagram — Mission engineering

I completed the ordinary Starter Space science questions to unlock Mission engineering, then played one normal Mission engineering run. At 390×844, Q3 asked “What makes day and night on Earth?” with the visible choices Earth spinning, the Moon changing shape, and Mars moving. Before selecting the clue, the diagram was absent. Selecting the visible Mission clue revealed the text “Use a globe and lamp to explore which side is lit as the globe moves” and an accessible image description: “A lamp shines on a globe. One side is bright and one side is dark; an arrow curves around the globe.” The rendered diagram showed a lamp, a globe with one lit and one dark half, and a curved direction arrow. It was legible and had no horizontal page overflow. The image was below the initial mobile viewport; an ordinary scroll brought the full diagram into view (x=67, y=697, 256×119 px). At 1280×800 the same question and diagram were visible after scroll at x=512, y=620, 256×119 px.

I chose the visibly wrong Moon option first. The UI showed retry feedback, retained the clue/diagram, and did not show a fact/source card. Choosing the visible correct “Earth spinning” answer then showed the held fact: “Earth spins once about every 24 hours. The side facing the Sun has day; the side turned away has night.” The NASA source appeared with the fact. The fact and Next action were present in the DOM; I used Next and observed the fact clear before continuing. The mobile held-fact screenshot records the panel; the Next visibility was checked in the rendered DOM after scroll.

Evidence: [mobile diagram](screenshots/earth-mobile-diagram-after-clue.png), [desktop diagram](screenshots/earth-desktop-diagram-after-clue.png), [wrong-answer retry](screenshots/earth-mobile-wrong-retry.png), [held fact](screenshots/earth-mobile-held-fact.png).

## Venus rotation diagram — Review missions

I completed the normal Mission engineering run (2/3 stars), which unlocked Review missions, then played one normal Review missions run. At 390×844, Q4 asked how Venus spins compared with most planets. Before the clue, no diagram was shown. Selecting Mission clue revealed “Compare the arrows showing how Venus and most planets turn” and the accessible image description “Two labeled planets with curved arrows to compare their turning directions.” The diagram visibly showed two labeled planets with arrows curving in opposite directions. It was clear at both viewport sizes, with no horizontal overflow. At mobile, after ordinary scroll it occupied x=51, y=697, 288×119 px; at desktop, x=496, y=620, 288×119 px.

Choosing the visible wrong option “It does not spin” produced retry feedback without a fact card and left the clue/diagram available. Choosing “The opposite direction” showed the held fact “Venus rotates in the opposite direction to most planets” with its NASA source. At both widths, Next was visible and usable; the held fact cleared after I selected Next. The chapter completed through the ordinary sequence at 2/3 stars.

Evidence: [mobile diagram](screenshots/venus-mobile-diagram-after-clue.png), [desktop diagram](screenshots/venus-desktop-diagram-after-clue.png), [desktop held fact and Next](screenshots/venus-desktop-held-fact-next.png), [mobile held fact and Next](screenshots/venus-mobile-held-fact-next.png).

## Progress and limits

After reload, the map retained Space science 3/3, Mission engineering 2/3 and Review missions 2/3; the visible Discovery Passport reported 24 facts. The sound preference did not persist: sound had been off before reload and the visible control indicated sound on afterwards. No audio activity was tested or inferred.

Both target missions appeared in the first ordinary run of their respective bands, so I stopped after one run per band (within the two-run cap). Other Challenge/Review clue diagrams and other mission variants were not exercised here. Existing full mechanics and other clue-copy evidence remain in their source-specific reports; they are not relabeled as new runs on this candidate. The diagrams reviewed here appeared only after requesting the clue, gave a useful visual model, and remained available through wrong-answer retry. This does not close the broader Astronaut teaching review, narration readiness/listening, or any overall 4.5 gate. The frozen candidate’s narration inventory is incomplete; no clip readiness or playback acceptance is claimed.
