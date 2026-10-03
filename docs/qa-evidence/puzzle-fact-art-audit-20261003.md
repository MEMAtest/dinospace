# Puzzle Pop asset-to-fact audit

Date: 2026-10-03  
Scope: Static review of all 12 decoded images referenced by `PUZZLE_POP_CHAPTERS` in `src/data/puzzlePopBatch2.js`. I inspected each image at its source dimensions with the local image viewer and checked the literal title, alt text, and fact alongside it. Image hashes/dimensions are included to identify the exact reviewed assets.

This is an editorial content audit only. It is not gameplay, accessibility, visual-quality scoring, or a 4.5 acceptance assessment. The reviewed scene registry identity was Git HEAD `65c9ecc9a977492d55c3efdca7a29ec714acd7b6`; `src/data/puzzlePopBatch2.js` SHA-256 was `41566a2f0b52f20b0bf7295733c3e1d5108ce2d6f4322b83ec31f35a57d5814d`.

## Findings

| Scene | Decoded image evidence | Match assessment |
|---|---|---|
| **Dino Park Picnic** — `dino-park.jpg` | Two friendly dinosaurs stand in a sunny green landscape near water, rocks, flowers, and a volcano. The green dinosaur has visible teeth; there is no picnic table, food, or picnic activity. Fact: “Some dinosaurs ate plants, and some ate meat. Their teeth helped scientists learn what they ate.” | The dinosaurs and visible teeth thematically support the diet/teeth fact; the art need not depict the scientific inference itself. The title’s “Picnic” is unsupported. Alt (“dinosaurs enjoying a sunny park”) mostly fits the landscape, though no picnic is visible. |
| **River Valley** — `dino-river-3d.webp` | A river visibly winds past rocks and greenery, with a waterfall, trees, flowers, and a dinosaur. Fact: “Rivers carry fresh water across the land and create homes for plants and animals.” | Strong match: river, surrounding land, plants, and animal habitat are visible. Title and alt fit. |
| **Moon Camp** — `dino-moon-3d.webp` | A dinosaur in a spacesuit stands on a cratered lunar-looking surface beside a rocket, habitat, rover, Earth, stars, and the Sun. Fact: “The Moon shines because sunlight bounces off its rocky surface.” | Strong thematic match: the rocky Moon-like surface and Sun are both depicted. Title and alt fit. |
| **Robin’s Tree** — `robin.webp` | One large robin cutout on a transparent background; no tree, soil, insects, worms, or habitat. Fact: “Robins use their beaks to find small insects and worms in the soil.” | The fact subject (a robin, with its beak visible) is pictured and the fact is thematically relevant. The title’s tree and alt’s woodland/green habitat are absent, so title/alt do not describe this cutout. |
| **Hero City Helpers** — `superhero-city.webp` | Two costumed child superheroes, many buildings, a shopfront, street/road, trees, and a police car. Fact: “People in a community share places such as roads, parks, shops and homes.” | The visible street, shop, buildings, trees, and city helpers thematically support a community-places fact; not every example in the sentence needs to appear. Hero-city title and alt fit. |
| **Treehouse Robots** — `askia-memory-treehouse.webp` | Empty wooden treehouse interior with shelves, plants, rug, and an open view to a tropical landscape. No child, explorer, or robot appears. Fact: “A clear set of steps helps a robot know what to do next.” | Clear mismatch: neither the alt’s young explorer nor the fact’s robot/steps appears in the image. The treehouse setting alone matches the title’s first word. |
| **Sound Safari** — `sound-safari.webp` | Tropical waterfall path framed by foliage, flowers, rocks, and flowing water. No wildlife or sound symbols appear. Fact: “Listening carefully helps us tell the difference between sounds that are alike.” | A waterfall is a visible real-world sound source and gives the listening fact a thematic context. The alt’s wildlife claim is inaccurate. |
| **Pattern Festival** — `pattern-parade.webp` | Decorated street with repeating star motifs on banners and buildings, flags, balloons, confetti, and festival-like architecture. No parade participants are present. Fact: “A pattern repeats a rule. Finding the rule helps you know what comes next.” | Repeated star and banner motifs visibly support the repetition idea. No parade participants are shown, so “parade” in the title/alt is not literal. |
| **Time Observatory** — `time-observatory.webp` | Observatory-like room with a telescope, planets, stars, a small Earth globe, and a sunset horizon. No clocks are visible. Fact: “Earth spins once each day. That spin gives us day and night.” | The Earth globe, sunset, and stars are sufficient thematic support for a day/night fact; the art need not animate Earth’s rotation. Title fits; alt’s “clocks” is inaccurate. |
| **World Explorer** — `geography-world.webp` | Scenic landscape with lake, mountains, trees, hills, flowers, and sky. No map, symbols, labels, or map illustration is visible. Fact: “Maps use symbols and pictures to help us understand places.” | Clear mismatch: neither the alt’s map illustration nor the fact’s map-symbol topic is pictured. |
| **History Hall** — `history-world.webp` | Outdoor ancient-looking ruins, including pyramid-like and arena/Colosseum-like structures; books, a map, and compass are in the foreground. No indoor museum hall is visible. Fact: “Historians use objects, pictures and stories as clues about the past.” | Strong topical match: ancient structures plus books/map/compass give visible historical-clue cues. “Hall” and “museum scene” are not literal, but the history topic is supported. |
| **Nature Lab** — `nature-specimens.webp` | Three isolated animal cutouts on transparency: a blue jay, frog, and orange kitten. No leaves, seeds, plants, or sunlight. Fact: “Leaves can have different shapes, but they all help plants use sunlight.” | Clear mismatch: the alt’s leaves/seeds/nature specimens and the plant fact are unsupported by the actual animal cutouts. |

## Exact asset identity

SHA-256 and decoded pixel dimensions:

| File | Dimensions | SHA-256 |
|---|---:|---|
| `src/assets/puzzle-pop/dino-park.jpg` | 1448×1086 | `9cd2ce5eb1abbd0bcb28e2ed5f639b6f2590f4db173ef45d3d94a7702d4ec7a1` |
| `src/assets/puzzle-pop/dino-river-3d.webp` | 1448×1086 | `08322a708c526d8ffded7bd1d7a947dfef93e419a3f156aa13600b003df29ff8` |
| `src/assets/puzzle-pop/dino-moon-3d.webp` | 1448×1086 | `a8c15f541d45125fd165e6d126ffe1d67f2d61c78b38d148067c5a553f934c1e` |
| `src/assets/curriculum/robin.webp` | 1312×1199 | `c967a8c5a97727bc3e989e5a01d9aa3fd6853c87a9f3bbc7acc67adca9dc63a0` |
| `src/assets/spot-difference/superhero-city.webp` | 1448×1086 | `c9205d316ee832981f816af002cd57ea22d50b6a6a84231a646f639385634b22` |
| `src/assets/game-scenes/askia-memory-treehouse.webp` | 941×1672 | `c281caa6fb18d6670907e622f583352222147a5344333fd60a9d1e1d073af6a8` |
| `src/assets/game-scenes/sound-safari.webp` | 941×1672 | `6298ba430aed520ed44d22252ad5452a5e01746a68529b0f85093af0ac8056f0` |
| `src/assets/game-scenes/pattern-parade.webp` | 941×1672 | `3806f741aa6b39c2be05da6a908ced80afefba10c4ae0ae3bb2bdd623d049a00` |
| `src/assets/game-scenes/time-observatory.webp` | 941×1672 | `54f2db7d523a0e226edbe605e84df308e75799d4bb7878705b8d279b0281ff34` |
| `src/assets/curriculum/geography-world.webp` | 1672×941 | `7bac360632289260a8196127564faf12a74e51060a4d09f89ff4c1977976f38e` |
| `src/assets/curriculum/history-world.webp` | 1672×941 | `625fec4ac49c2dbfb24a2e9f28c5c0309f4395a249887c812d77b326419f2b4e` |
| `src/assets/curriculum/nature-specimens.webp` | 1944×809 | `6e1ff5fe28461e0aafad04a95ce5e2b9423341902dece559344135a4635e1da9` |

Three scenes lack the fact subject/topic in the current picture (Treehouse Robots, World Explorer, Nature Lab). Robin’s Tree has the fact subject (a robin) but lacks its named tree/habitat in both title/alt. Sound Safari has a visible waterfall sound source; its wildlife alt is wrong. Dino Park, Hero City, Pattern Festival, and Time Observatory have thematic fact support; their facts do not require every statement to be literally depicted. River Valley, Moon Camp, and History Hall have the clearest direct support.

## Follow-up scope recorded from root

At the time this audit note was revised, root reported commissioning four dedicated replacement images for Nature Lab (leaf-focused), Robin’s Tree, Treehouse Robots, and World Explorer. These new images were not available for this audit, so no claim is made about their content or identity. Planned alt-only corrections are Sound Safari (describe the waterfall/path, not wildlife), Time Observatory (telescope/globe/stars, not clocks), and History Hall (ancient ruins/books/maps, not an indoor museum). The other eight current assets should remain unchanged. Narration copy and corpus keys are out of scope.
