# Pair11 QA protocol: Letter Launch + Fact Finder

**Purpose:** prepare the source-bound route, interaction, protection and visual checks for Pair11. This document records an audit plan and asset inspection only. No browser, compiled build, hosted acceptance, or runtime verification was performed here.

## Route and profile boundary

- Exercise Amari through ordinary catalogue navigation: **Read & Write → Letter Launch**, and **Explore & Languages → Fact Finder** (Fact Finder route ID: `factfinder`). Confirm each parent on Back and each Fact Finder Explore action uses its ordinary game destination.
- The current normal Askia catalogue does not expose either activity. Do not deep-link or manufacture a hidden Askia route. Compare/preserve Askia storage and existing earned records as sibling-profile protection only.
- Bind later driver reports to the exact compiled entry, runtime SHA and production origin. Native/local, hosted UI, storage/reward persistence and human-listening evidence remain separate gates.

## Fact Finder: required route and interaction cases

1. Open from Explore & Languages using the visible card. Check that search, category filters, result count and empty-state work together; cover each category (Everything, Animals, Dinosaurs, Space, Nature), case/diacritic normalization, representative aliases, partial query, and a no-result query. Clearing search/category returns the list without a stale selected article.
2. Select representative records from each category, including an animal, dinosaur, planet, nature entry and an alias search result. Confirm the chosen title/fact/art/caption/source remain paired. Article title receives focus on open; **Back to topics** returns focus to that topic; parent Back returns to Explore & Languages.
3. Exercise one normal **Explore in …** action for each destination class (`worldmap`, `dino`, `solar`) and confirm the actual destination is the right ordinary catalogue activity. Return through its normal parent path.
4. Test packaged-audio presence and absence from visible controls: only exact clips expose a Hear action; each playback is exact and local, a second clip cancels the first, mute immediately pauses/resets, and leaving the article/page cancels playback. Observe media-element identity and time/end/pause events; do not infer playback from a button click. No device speech or provider fallback.
5. Compare storage and rewards around two distinct phases. Searching, filtering, opening/closing articles, audio and mute are read-only and must not change storage. The three explicit Explore route launches may naturally update only app navigation/recent-game or curriculum-selection diagnostics; compare them separately and require no reward, game-count, badge, completion, or learning-progress changes. Preserve every unrelated key and IndexedDB record. Askia has no ordinary route for either activity, so use sibling-profile protection rather than a hidden-route run.

## Letter Launch: required route and persistence cases

- Use the four ordinary chapters and the final source's declared target counts (currently documented as **6 / 6 / 7 / 8** for Amari). Cover each chapter's actual visible learning task, wrong-answer retry on the same prompt, held feedback, explicit Next, final held answer, and clear Finish/result navigation. Verify learned-grapheme eligibility and displayed mastery claims against the actual visible task; do not call multi-letter graphemes simple single-phoneme mastery.
- Verify prompt/tiles/clue and primary controls fit and center-hit at **390×740** and **1440×844** before any auto-scroll. Check exact packaged narration only, visible sound toggle, serial playback, mute/leave cancellation, and readable guidance when a needed clip is absent.
- Fault attempts are conditional on the normal chapter card showing **Start chapter**. The bounded driver arms at most one local, badge, and parent readback fault on three successive fresh chapters, then requires the same held result and transaction to remain available for **Retry save**. If a chapter is already complete or legacy-unlocked, it records the ineligible branch and does not alter stored progress to create eligibility. A replay earns zero; do not reset data.
- Confirm chapter progress and earned badges belong to Amari and remain protected alongside Askia and all unrelated paired-game claims/points. Preserve legacy `game_levels_v1` and badge metadata; no write may silently treat blocked or malformed storage as empty. Capture the original sound preference after normal profile selection and restore it on every driver exit.

## Animal art inspection (viewed in place; no edits or copies)

The 16 entries map to these existing portrait files. Review was visual for subject identity and teaching-relevant visible features, not a scientific validation of the artwork.

| Entry | Existing file | Visual review |
|---|---|---|
| Ant | `src/assets/memory-match/garden-ant-v1-card.webp` | Recognizable ant; segmented body and insect legs/antennae read clearly. |
| Bee | `src/assets/memory-match/garden-bee-v1-card.webp` | Recognizable bee; stripes, wings and six legs are visible. |
| Butterfly | `src/assets/memory-match/garden-butterfly-v1-card.webp` | Clear butterfly silhouette and paired patterned wings. |
| Ladybird | `src/assets/memory-match/garden-ladybird-v1-card.webp` | Clear red spotted wing covers and insect legs. |
| Frog | `src/assets/memory-match/isolated-frog-v1-card.webp` | Clear frog body and broad toes; suitable for the general frog entry. |
| Monkey | `src/assets/memory-match/isolated-monkey-v1-card.webp` | Recognizable monkey with a visible curled tail; does not imply every monkey has a gripping tail. |
| Dolphin | `src/assets/memory-match/dolphin-v1-card.webp` | Clear dolphin body and flippers; not a fish-like generic silhouette. |
| Jellyfish | `src/assets/memory-match/jellyfish-v1-card.webp` | Clear bell and tentacles; simplified illustration. |
| Sea turtle | `src/assets/memory-match/turtle-v1-card.webp` | Shell and long flippers support the sea-turtle identity. |
| Blue whale | `src/assets/memory-match/whale-v1-card.webp` | Baleen-like throat pleats and whale body are visible. |
| Shark | `src/assets/memory-match/shark-v1-card.webp` | Recognizable shark with gill slits; generic shark rather than a named species. |
| Spider | `src/assets/memory-match/garden-spider-v1-card.webp` | Eight legs are visible; recognizable spider. |
| Garden snail | `src/assets/memory-match/garden-snail-v1-card.webp` | Shell and eye stalks are clear. |
| Earthworm | `src/assets/memory-match/garden-earthworm-v1-card.webp` | **Mismatch:** anthropomorphic raised worm has prominent eyes/face and is not shown in soil, while entry alt says “in soil.” Avoid using it as morphology evidence for earthworm anatomy; consider a grounded, clearly segmented worm image if this is to teach body form. |
| Duck | `src/assets/memory-match/duck-v1-card.webp` | Clear duck bill, wings and webbed feet. |
| Fox | `src/assets/memory-match/fox-v1.webp` | Clear generic fox; it is not specifically a bat-eared fox, matching the entry's broad “fox” presentation. |

## Reused dinosaur art inspection

Fact Finder uses five existing files from `public/art/shadow-match-v1/`; no copies were made. `ankylo.webp` shows armour and a tail club; `bronto.webp` shows a long-neck sauropod used for Brachiosaurus; `trex.webp` shows the large head and tiny forearms; `trike.webp` shows a frill and three horns; `stego.webp` shows plates and tail spikes. These are recognizable playful dinosaur depictions. `ptero.webp` also exists in that folder but is not mapped to a Fact Finder entry; it reads as a winged pterosaur, not as a dinosaur body-plan portrait.

## Evidence status

This is a protocol and source/art inventory only. Pair11 owners are still implementing, so selectors, progress schemas, exact controls, compiled identity and acceptance results must be refreshed from their frozen source before a driver is authored or run. No scores or new acceptance are claimed.
