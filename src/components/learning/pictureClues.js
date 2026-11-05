// Reuse the existing reviewed, offline-ready illustrations for matching words.
// Keep this UI-only map separate from Node-consumed teaching data.
import apple from '../../assets/memory-match/apple-v1-card.webp';
import chips from '../../assets/memory-match/chips-v1-card.webp';
import dog from '../../assets/memory-match/dog-v1.webp';
import fish from '../../assets/memory-match/pond-fish-v1-card.webp';
import frog from '../../assets/memory-match/isolated-frog-v1-card.webp';
import ladybird from '../../assets/memory-match/garden-ladybird-v1-card.webp';
import moon from '../../assets/memory-match/crescent-moon-v1-card.webp';
import plant from '../../assets/memory-match/seedling-v1-card.webp';
import rock from '../../assets/memory-match/moon-rock-v1-card.webp';
import sun from '../../assets/memory-match/sun-v1-card.webp';

const PICTURES = Object.freeze({
  APPLE: { src: apple, alt: 'A red apple.' },
  CHIP: { src: chips, alt: 'Golden potato chips.' },
  DOG: { src: dog, alt: 'A friendly dog.' },
  FISH: { src: fish, alt: 'A fish.' },
  FROG: { src: frog, alt: 'A green frog.' },
  INSECT: { src: ladybird, alt: 'A ladybird, a small insect.' },
  MOON: { src: moon, alt: 'The crescent moon.' },
  PLANT: { src: plant, alt: 'A young green plant.' },
  ROCK: { src: rock, alt: 'A piece of rock.' },
  SUN: { src: sun, alt: 'The sun.' },
});

export const learningPictureFor = (word) => PICTURES[String(word || '').toUpperCase()] || null;
