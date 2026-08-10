import dinoCharacterSheet from '../../assets/dino-character-stickers.png';
import moreDinoCharacterSheet from '../../assets/more-dino-character-stickers-transparent.png';
import rewardStickerSheet from '../../assets/reward-stickers.png';

// These are deliberately crops of Amari's supplied character sheet, rather
// than generated substitutes. The source has transparent space around each
// character, so the stickers keep their hand-drawn outline on every backdrop.
const DINO_CROPS = {
  trex: { name: 'Rex the T-Rex', x: 0.0, y: 0.055, width: 0.18, height: 0.15, sheet: dinoCharacterSheet },
  brachio: { name: 'Benny the Brontosaurus', x: 0.18, y: 0.015, width: 0.19, height: 0.19, sheet: dinoCharacterSheet },
  trike: { name: 'Trix the Triceratops', x: 0.44, y: 0.035, width: 0.25, height: 0.18, sheet: dinoCharacterSheet },
  stego: { name: 'Stego the Stegosaurus', x: 0.7, y: 0.055, width: 0.29, height: 0.15, sheet: dinoCharacterSheet },
  raptor: { name: 'Zippy the Velociraptor', x: 0.0, y: 0.27, width: 0.21, height: 0.15, sheet: dinoCharacterSheet },
  ptero: { name: 'Sky the Pterodactyl', x: 0.2, y: 0.25, width: 0.27, height: 0.17, sheet: dinoCharacterSheet },
  ankyl: { name: 'Rocky the Ankylosaurus', x: 0.46, y: 0.27, width: 0.26, height: 0.15, sheet: dinoCharacterSheet },
  spino: { name: 'Spike the Spinosaurus', x: 0.7, y: 0.24, width: 0.3, height: 0.18, sheet: dinoCharacterSheet },
  para: { name: 'Sunny the Parasaurolophus', x: 0.0, y: 0.075, width: 0.18, height: 0.205, sheet: moreDinoCharacterSheet },
  allo: { name: 'Chomp the Allosaurus', x: 0.19, y: 0.075, width: 0.21, height: 0.205, sheet: moreDinoCharacterSheet, blend: true },
  pachy: { name: 'Pebble the Pachycephalosaurus', x: 0.4, y: 0.09, width: 0.2, height: 0.19, sheet: moreDinoCharacterSheet, blend: true },
  iguano: { name: 'Nibbles the Iguanodon', x: 0.59, y: 0.08, width: 0.2, height: 0.2, sheet: moreDinoCharacterSheet, blend: true },
  galli: { name: 'Turbo the Gallimimus', x: 0.79, y: 0.07, width: 0.21, height: 0.21, sheet: moreDinoCharacterSheet, blend: true },
  carno: { name: 'Rumble the Carnotaurus', x: 0.0, y: 0.37, width: 0.23, height: 0.2, sheet: moreDinoCharacterSheet, blend: true },
  compy: { name: 'Tiny the Compsognathus', x: 0.25, y: 0.4, width: 0.25, height: 0.17, sheet: moreDinoCharacterSheet, blend: true },
  dillo: { name: 'Pogo the Dilophosaurus', x: 0.49, y: 0.39, width: 0.22, height: 0.2, sheet: moreDinoCharacterSheet, blend: true },
  theri: { name: 'Mango the Therizinosaurus', x: 0.7, y: 0.36, width: 0.29, height: 0.22, sheet: moreDinoCharacterSheet, blend: true },
  elasmo: { name: 'Bubbles the Elasmosaurus', x: 0.0, y: 0.66, width: 0.22, height: 0.22, sheet: moreDinoCharacterSheet, blend: true },
  mosa: { name: 'Snap the Mosasaurus', x: 0.2, y: 0.68, width: 0.18, height: 0.2, sheet: moreDinoCharacterSheet, blend: true },
  cory: { name: 'Patches the Corythosaurus', x: 0.39, y: 0.65, width: 0.22, height: 0.22, sheet: moreDinoCharacterSheet, blend: true },
  sauro: { name: 'Tank the Sauropelta', x: 0.56, y: 0.7, width: 0.25, height: 0.18, sheet: moreDinoCharacterSheet, blend: true },
  ovira: { name: 'Dash the Oviraptor', x: 0.78, y: 0.68, width: 0.22, height: 0.22, sheet: moreDinoCharacterSheet, blend: true },
};

const REWARD_CROPS = {
  rocket: { label: 'Rocket Star', x: 0.235, y: 0.35, width: 0.16, height: 0.2 },
  dino: { label: 'Dino Egg Prize', x: 0.02, y: 0.56, width: 0.19, height: 0.2 },
  star: { label: 'Super Star', x: 0.6, y: 0.08, width: 0.16, height: 0.2 },
  truck: { label: 'Confetti Burst', x: 0.4, y: 0.56, width: 0.2, height: 0.2 },
  heart: { label: 'Heart of Awesome', x: 0.61, y: 0.56, width: 0.18, height: 0.2 },
  planet: { label: 'Rainbow Gem', x: 0.39, y: 0.35, width: 0.19, height: 0.2 },
  hero: { label: 'Brave and Strong Shield', x: 0.61, y: 0.35, width: 0.17, height: 0.2 },
  trophy: { label: 'Gold Winner Trophy', x: 0.02, y: 0.08, width: 0.18, height: 0.2 },
  diamond: { label: 'Rainbow Gem', x: 0.39, y: 0.35, width: 0.19, height: 0.2 },
  crown: { label: 'Crown of Greatness', x: 0.02, y: 0.35, width: 0.18, height: 0.2 },
  legend: { label: 'Awesome Medal', x: 0.21, y: 0.08, width: 0.18, height: 0.2 },
  galaxy: { label: 'Magic Maker', x: 0.21, y: 0.56, width: 0.18, height: 0.2 },
};

const spriteStyle = (sheet, crop) => ({
  backgroundImage: `url(${sheet})`,
  backgroundPosition: `${(crop.x / (1 - crop.width)) * 100}% ${(crop.y / (1 - crop.height)) * 100}%`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: `${(1 / crop.width) * 100}% ${(1 / crop.height) * 100}%`,
});

export const DinoSticker = ({ species = 'trex', size = 64, className = '' }) => {
  const crop = DINO_CROPS[species] || DINO_CROPS.trex;

  return (
    <span
      aria-label={crop.name}
      className={`inline-block shrink-0 ${className}`}
      role="img"
      style={{ ...spriteStyle(crop.sheet, crop), height: size * (crop.height / crop.width), width: size }}
    />
  );
};

export const RewardSticker = ({ rewardId, size = 52, locked = false, className = '' }) => {
  const crop = REWARD_CROPS[rewardId] || REWARD_CROPS.star;

  return (
    <span
      aria-label={crop.label}
      className={`inline-block shrink-0 mix-blend-multiply transition ${locked ? 'grayscale opacity-30' : ''} ${className}`}
      role="img"
      style={{ ...spriteStyle(rewardStickerSheet, crop), height: size, width: size }}
    />
  );
};
