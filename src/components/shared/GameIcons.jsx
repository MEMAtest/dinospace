import KidPopIcon from './KidPopIcon.jsx';
import { artUrl } from '../little/littleArt.js';

export const GameIcon = ({ Icon: IconComponent, image, alt, label, kind = 'default' }) => (
  <KidPopIcon Icon={IconComponent} image={image} alt={alt} label={label} kind={kind} />
);

// Wraps the little-explorer SVG art in the same sticker-sized frame as the
// catalogue icons.
// A drop-in `tile-<gameId>` image replaces the drawn icon.
export const ArtIcon = ({ children, label, gameId }) => {
  const tile = gameId ? artUrl(`tile-${gameId}`) : null;
  return (
    <span className="kid-pop-icon relative" role="img" aria-label={label}>
      <span className="absolute inset-0 flex items-center justify-center [&>*]:max-h-full [&>svg]:h-full [&>svg]:w-full">
        {tile ? <img src={tile} alt="" className="h-full w-full object-contain" draggable={false} /> : children}
      </span>
    </span>
  );
};
