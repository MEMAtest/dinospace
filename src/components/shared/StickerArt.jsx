import dinoCharacterSheet from '../../assets/dino-character-stickers.png';
import rewardStickerSheet from '../../assets/reward-stickers.png';

// These are deliberately crops of Amari's supplied character sheet, rather
// than generated substitutes. The source has transparent space around each
// character, so the stickers keep their hand-drawn outline on every backdrop.
const DINO_CROPS = {
  trex: { name: 'Rex the T-Rex', x: 0.0, y: 0.055, width: 0.18, height: 0.15 },
  brachio: { name: 'Benny the Brontosaurus', x: 0.18, y: 0.015, width: 0.19, height: 0.19 },
  trike: { name: 'Trix the Triceratops', x: 0.44, y: 0.035, width: 0.25, height: 0.18 },
  stego: { name: 'Stego the Stegosaurus', x: 0.7, y: 0.055, width: 0.29, height: 0.15 },
  raptor: { name: 'Zippy the Velociraptor', x: 0.0, y: 0.27, width: 0.21, height: 0.15 },
  ptero: { name: 'Sky the Pterodactyl', x: 0.2, y: 0.25, width: 0.27, height: 0.17 },
  ankyl: { name: 'Rocky the Ankylosaurus', x: 0.46, y: 0.27, width: 0.26, height: 0.15 },
  spino: { name: 'Spike the Spinosaurus', x: 0.7, y: 0.24, width: 0.3, height: 0.18 },
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
      style={{ ...spriteStyle(dinoCharacterSheet, crop), height: size * (crop.height / crop.width), width: size }}
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
