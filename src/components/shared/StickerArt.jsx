import { useEffect, useState } from 'react';
import dinoCharacterSheet from '../../assets/dino-character-stickers.png';
import moreDinoCharacterSheet from '../../assets/more-dino-character-stickers-transparent.png';
import rewardStickerSheet from '../../assets/reward-stickers.png';
import rescueTruck from '../../assets/little/rescue-firetruck.webp';

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

// Crop just the original illustrations. The caption below each sticker comes
// from the saved reward catalogue and stays readable at every size.
const rewardCrop = (label, left, top, right, bottom) => ({
  label, x: left / 1254, y: top / 1254, width: (right - left) / 1254, height: (bottom - top) / 1254,
});
const REWARD_CROPS = {
  rocket: rewardCrop('Rocket Star', 269, 442, 475, 665),
  dino: rewardCrop('Dino Egg Prize', 43, 722, 228, 941),
  star: rewardCrop('Super Star', 750, 135, 986, 384),
  heart: rewardCrop('Heart of Awesome', 751, 727, 976, 939),
  hero: rewardCrop('Brave and Strong Shield', 758, 445, 985, 669),
  trophy: rewardCrop('Gold Winner Trophy', 15, 134, 273, 384),
  diamond: rewardCrop('Rainbow Gem', 491, 453, 749, 665),
  crown: rewardCrop('Crown of Greatness', 17, 452, 267, 663),
  legend: rewardCrop('Awesome Medal', 290, 135, 481, 384),
};

const spriteStyle = (sheet, crop) => ({
  backgroundImage: `url(${sheet})`,
  backgroundPosition: `${(crop.x / (1 - crop.width)) * 100}% ${(crop.y / (1 - crop.height)) * 100}%`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: `${(1 / crop.width) * 100}% ${(1 / crop.height) * 100}%`,
});

export const DinoSticker = ({ species = 'trex', size = 64, className = '' }) => {
  const crop = DINO_CROPS[species] || DINO_CROPS.trex;
  const [sheetReady, setSheetReady] = useState(true);

  useEffect(() => {
    const asset = new Image();
    asset.onload = () => setSheetReady(true);
    asset.onerror = () => setSheetReady(false);
    asset.src = crop.sheet;
    return () => { asset.onload = null; asset.onerror = null; };
  }, [crop.sheet]);

  if (!sheetReady) return (
    <span role="img" aria-label={crop.name} className={`inline-grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-lime-200 to-emerald-400 ${className}`} style={{ width: size, height: size, fontSize: size * .65 }}>
      {species === 'trex' || species === 'raptor' ? '🦖' : '🦕'}
    </span>
  );

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
  if (rewardId === 'truck') return <img src={rescueTruck} alt="Rescue Truck" draggable={false} width={size} height={size} className={`inline-block shrink-0 object-contain transition ${locked ? 'grayscale opacity-30' : ''} ${className}`} />;
  if (rewardId === 'planet' || rewardId === 'galaxy') return <span role="img" aria-label={rewardId === 'planet' ? 'Planet Master' : 'Galaxy King'} className={`inline-grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-100 to-blue-200 text-center shadow-inner transition ${locked ? 'grayscale opacity-30' : ''} ${className}`} style={{ width: size, height: size, fontSize: size * .68 }}>{rewardId === 'planet' ? '🪐' : '🌌'}</span>;
  const crop = REWARD_CROPS[rewardId] || REWARD_CROPS.star;
  const ratio = crop.width / crop.height;

  return (
    <span
      aria-label={crop.label}
      className={`inline-block shrink-0 mix-blend-multiply transition ${locked ? 'grayscale opacity-30' : ''} ${className}`}
      role="img"
      style={{ ...spriteStyle(rewardStickerSheet, crop), height: size * Math.min(1, 1 / ratio), width: size * Math.min(1, ratio) }}
    />
  );
};
