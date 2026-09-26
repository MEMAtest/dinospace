# Image brief: little-explorer games (Askia's games)

Save each image into **`src/assets/little/`** with the exact file name below (`.png`, `.webp` or `.jpg`). The app picks it up automatically and it replaces the built-in drawing. Nothing else needs changing. Any image you don't supply keeps using the current drawing, so you can add them a few at a time.

## Style for every image

- **Match the app's existing art.** Use bright, friendly, glossy 3D-cartoon illustrations like `src/assets/puzzle-pop/dino-park.jpg`, the astronaut on the welcome screen and the German Garage scenes.
- **Keep it friendly for ages 3–5.** Characters should be cute and smiling, with big eyes and soft rounded shapes. No teeth-bared scary dinosaurs and no real danger (a fire is just flames coming out of a window).
- **No text, letters or numbers inside any image.** The app adds these itself.
- **Use a transparent background** (PNG) for anything marked *transparent*. Leave a little empty margin around the subject and don't crop it at the edges.
- **Draw one consistent set.** The same dinosaur should look the same in its character image and in its jigsaw scene.
- The sizes are minimums. Bigger is fine if the proportions (the width:height ratio) stay the same.

---

## 1. Dinosaurs (most important)

These appear in Shadow Match, pop out when a jigsaw is finished, and appear on game tiles. **The shadows in Shadow Match are made automatically from these images**, so the outline of each dino must be clear and distinct: full body, side view, **facing right**, and no background or ground shadow.

| File | What to draw | Size | Background |
|---|---|---|---|
| `dino-trex` | Green T-rex, standing | 1000 × 800 | transparent |
| `dino-trike` | Orange Triceratops, three horns and frill clearly visible | 1000 × 800 | transparent |
| `dino-stego` | Purple Stegosaurus, pink back plates and tail spikes | 1000 × 800 | transparent |
| `dino-bronto` | Blue Brachiosaurus (long neck), whole neck in frame | 1000 × 800 | transparent |
| `dino-ptero` | Red/yellow Pterodactyl flying, wings spread wide | 1000 × 800 | transparent |
| `dino-ankylo` | Yellow Ankylosaurus, armoured back and club tail | 1000 × 800 | transparent |

## 2. Jigsaw pictures (most important)

These are the pictures that get cut into 2–12 jigsaw pieces. Use a **4:3 landscape** shape at **1600 × 1200**. Make each corner of the picture look different: sky, sun, trees, water, ground. Similar-looking corners make the pieces hard to tell apart. Put the dinosaur big in the middle.

| File | Scene |
|---|---|
| `scene-volcano` | The T-rex in front of a smoking volcano with palm trees |
| `scene-lake` | The Brachiosaurus drinking from a blue lake, sun and clouds |
| `scene-meadow` | The Triceratops in a flower meadow, big sun top-left |
| `scene-sky` | The Pterodactyl flying over purple mountains at sunset |
| `scene-forest` | The Stegosaurus in a green forest |
| `scene-eggs` | The Ankylosaurus next to a nest of three colourful dino eggs |

## 3. Fire trucks and Fire Truck Rescue

| File | What to draw | Size | Background |
|---|---|---|---|
| `firetruck` | Red fire truck, side view facing right, ladder on the roof, flashing light | 1600 × 850 | transparent |
| `firetruck-no-ladder` | The same truck with **no** roof ladder (Ladder Rescue draws its own ladder) | 1600 × 850 | transparent |
| `fire` | One cartoon flame, orange and yellow, not scary | 500 × 600 | transparent |
| `smoke` | A soft grey puff of smoke | 500 × 300 | transparent |
| `fire-house` | The Fire Rescue backdrop: sky, grass and a tall friendly house on the right. **Follow `docs/image-templates/fire-house-layout.png`**: windows must sit exactly on the marked spots, because the fires appear there. Leave the bottom-left corner clear for the truck. No fire in this image. | 1200 × 1500 (4:5) | none |

## 4. Ladder Rescue animals

Each animal peeks out of a window, so draw it head and shoulders, smiling and waving.

| File | Animal | Size | Background |
|---|---|---|---|
| `animal-kitten` | Kitten | 600 × 600 | transparent |
| `animal-puppy` | Puppy | 600 × 600 | transparent |
| `animal-bunny` | Bunny | 600 × 600 | transparent |
| `animal-chick` | Chick | 600 × 600 | transparent |
| `animal-panda` | Panda | 600 × 600 | transparent |

## 5. Rockets (Rocket Builder and Fuel Up)

The child drags these five parts onto the rocket, so each part is a **separate transparent image**. Draw the nose and fins in **red**; the app recolours them for the other rockets. Use `docs/image-templates/rocket-parts-layout.png` as the guide for shapes and proportions.

| File | Part | Size |
|---|---|---|
| `rocket-nose` | Pointed nose cone (red) | 960 × 840 |
| `rocket-body` | White/silver rocket body with a red stripe near the bottom, **no window** | 960 × 1360 |
| `rocket-window` | Round porthole window (blue glass, grey rim) | 600 × 600 |
| `rocket-fins` | The two side fins (red) in one image, with a gap in the middle the width of the body | 1640 × 840 |
| `rocket-flame` | Engine nozzle with an orange/yellow flame underneath | 680 × 840 |
| `fuel-can` | Green fuel can with a yellow lightning bolt | 600 × 700 |

## 6. Askia's avatar, the helper hand and home tiles

| File | What to draw | Size | Background |
|---|---|---|---|
| `askia-buddy` | Askia's buddy: a cute baby T-rex wearing a red firefighter helmet | 800 × 800 | transparent |
| `hand-pointer` | A cartoon hand with the index finger pointing **up**. The fingertip should be near the top-left of the image, because that's the spot it "taps". | 400 × 450 | transparent |
| `tile-dinojigsaw` | Picture for the Dino Jigsaw button (e.g. a dino with jigsaw pieces) | 800 × 800 | transparent |
| `tile-shadowmatch` | A dino next to its dark shadow | 800 × 800 | transparent |
| `tile-rocketbuilder` | A rocket being built, some parts floating in | 800 × 800 | transparent |
| `tile-fuelup` | A rocket with a fuel can | 800 × 800 | transparent |
| `tile-firerescue` | A fire truck spraying water | 800 × 800 | transparent |
| `tile-ladder` | A fire truck ladder reaching a kitten in a window | 800 × 800 | transparent |
| `tile-dino` | A dinosaur peeking from behind leaves (Dino Detective) | 800 × 800 | transparent |
| `tile-memory` | Two matching picture cards (Memory Match) | 800 × 800 | transparent |
| `tile-counting` | Stars being counted (Count the Stars) | 800 × 800 | transparent |
| `tile-pattern` | Coloured shapes in a row (Pattern Parade) | 800 × 800 | transparent |

## 7. Nice to have

| File | What to draw | Size |
|---|---|---|
| `bg-dinojigsaw`, `bg-shadowmatch`, `bg-rocketbuilder`, `bg-fuelup`, `bg-firerescue`, `bg-ladder` | A soft, simple full-screen background for each game (jungle, night sky, town street…). Keep the middle plain; the game sits on top. | 1080 × 1920 portrait |
| `sticker-rocket`, `sticker-dino`, `sticker-star`, `sticker-truck`, `sticker-heart`, `sticker-planet`, `sticker-hero`, `sticker-trophy`, `sticker-diamond`, `sticker-crown`, `sticker-legend`, `sticker-galaxy` | Sticker-album stickers: shiny, with a white sticker border | 512 × 512, transparent |

---

## Suggested order

1. The six `dino-…` images and the six `scene-…` images. These make the biggest visual difference.
2. `firetruck`, `firetruck-no-ladder`, `fire`, `smoke`, the five `animal-…` images and `fire-house`.
3. The rocket parts and `fuel-can`.
4. `askia-buddy`, `hand-pointer` and the `tile-…` images.
5. Backgrounds and stickers.

## After adding images

Run `npm run build` (or `npm run android:debug` for the phone app). The images are bundled into the app, so they also work offline.
