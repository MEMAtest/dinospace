import KidPopIcon from './KidPopIcon.jsx';

export const GameIcon = ({ Icon: IconComponent, image, alt, label, kind = 'default' }) => (
  <KidPopIcon Icon={IconComponent} image={image} alt={alt} label={label} kind={kind} />
);

// Wraps the little-explorer SVG art in the same sticker-sized frame as the
// catalogue icons.
export const ArtIcon = ({ children, label }) => (
  <span className="kid-pop-icon relative" role="img" aria-label={label}>
    <span className="absolute inset-0 flex items-center justify-center [&>*]:max-h-full [&>svg]:h-full [&>svg]:w-full">{children}</span>
  </span>
);
