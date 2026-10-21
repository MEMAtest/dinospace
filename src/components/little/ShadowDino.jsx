import { SHADOW_DINO_ART } from '../../data/shadowMatchArt.js';

// The coloured dinosaur and shadow share one transparent image. Changing its
// colour never changes the outline; the final level can mirror that outline.
const ShadowDino = ({ kind = 'trex', silhouette = false, flip = false, className = '', title }) => (
  <img
    src={SHADOW_DINO_ART[kind]}
    alt={title || ''}
    aria-hidden={title ? undefined : true}
    data-shadow-species={kind}
    data-silhouette={silhouette ? 'true' : 'false'}
    width="800"
    height="640"
    draggable={false}
    className={className}
    style={{
      aspectRatio: '5 / 4',
      objectFit: 'contain',
      filter: silhouette ? 'brightness(0)' : undefined,
      opacity: silhouette ? 0.85 : 1,
      transform: flip ? 'scaleX(-1)' : undefined,
    }}
  />
);

export default ShadowDino;
