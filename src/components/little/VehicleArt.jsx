// Rockets, fire trucks and flames for the little-explorer games. Each piece
// can be replaced by a drop-in image (see littleArt.js).
import { artUrl, hueFilterFor } from './littleArt.js';

const OUTLINE = '#1e293b';

// Rocket parts share one 200×300 canvas so Rocket Builder can snap each part
// to the same spot it occupies in the finished rocket.
export const ROCKET_PARTS = Object.freeze([
  { id: 'body', label: 'rocket body', box: [52, 84, 96, 136] },
  { id: 'nose', label: 'nose cone', box: [52, 12, 96, 84] },
  { id: 'window', label: 'window', box: [72, 108, 56, 56] },
  { id: 'fins', label: 'fins', box: [18, 160, 164, 84] },
  { id: 'flame', label: 'engine flame', box: [66, 214, 68, 84] },
]);

const RasterPart = ({ part, url, colour, ghost }) => {
  const [x, y, w, h] = ROCKET_PARTS.find((p) => p.id === part).box;
  const tint = part === 'nose' || part === 'fins' ? hueFilterFor(colour) : '';
  const style = ghost ? { filter: 'grayscale(1) brightness(1.7)', opacity: 0.4 } : tint ? { filter: tint } : undefined;
  return <image href={url} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid meet" style={style} />;
};

export const RocketPart = ({ part, colour = '#ef4444', ghost = false }) => {
  const raster = artUrl(`rocket-${part}`);
  if (raster) return <RasterPart part={part} url={raster} colour={colour} ghost={ghost} />;
  const stroke = ghost ? '#94a3b8' : OUTLINE;
  const dash = ghost ? '8 7' : undefined;
  const fill = (value) => (ghost ? 'rgba(255,255,255,.35)' : value);
  const common = { stroke, strokeWidth: 5, strokeDasharray: dash, strokeLinejoin: 'round' };
  switch (part) {
    case 'nose':
      return <path d="M100 16 Q144 50 144 88 L56 88 Q56 50 100 16 Z" fill={fill(colour)} {...common} />;
    case 'body':
      return (
        <g>
          <rect x="56" y="88" width="88" height="128" rx="12" fill={fill('#f8fafc')} {...common} />
          {!ghost && <rect x="56" y="190" width="88" height="14" fill={colour} opacity=".85" />}
        </g>
      );
    case 'window':
      return (
        <g>
          <circle cx="100" cy="136" r="24" fill={fill('#94a3b8')} {...common} />
          {!ghost && <circle cx="100" cy="136" r="15" fill="#38bdf8" stroke={OUTLINE} strokeWidth="3" />}
          {!ghost && <circle cx="94" cy="130" r="5" fill="#e0f2fe" />}
        </g>
      );
    case 'fins':
      return (
        <g>
          <path d="M56 168 L22 232 Q22 240 30 238 L56 216 Z" fill={fill(colour)} {...common} />
          <path d="M144 168 L178 232 Q178 240 170 238 L144 216 Z" fill={fill(colour)} {...common} />
        </g>
      );
    case 'flame':
      return (
        <g>
          <rect x="72" y="216" width="56" height="16" rx="4" fill={fill('#64748b')} {...common} />
          <path d="M76 234 Q100 310 124 234 Z" fill={fill('#fb923c')} {...common} />
          {!ghost && <path d="M88 236 Q100 280 112 236 Z" fill="#fde047" />}
        </g>
      );
    default:
      return null;
  }
};

export const Rocket = ({ colour = '#ef4444', parts = ROCKET_PARTS.map((p) => p.id), className = '', title, flameOn = true }) => (
  <svg viewBox="0 0 200 300" className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} overflow="visible">
    {ROCKET_PARTS.filter((p) => parts.includes(p.id) && (flameOn || p.id !== 'flame')).map((p) => <RocketPart key={p.id} part={p.id} colour={colour} />)}
  </svg>
);

export const RocketPartIcon = ({ part, colour, className = '' }) => {
  const info = ROCKET_PARTS.find((p) => p.id === part);
  const [x, y, w, h] = info.box;
  return (
    <svg viewBox={`${x - 6} ${y - 6} ${w + 12} ${h + 12}`} className={className} aria-hidden="true">
      {part === 'fins' && <RocketPart part="body" ghost />}
      <RocketPart part={part} colour={colour} />
    </svg>
  );
};

// A half-built rocket: the icon for Rocket Builder.
export const RocketBlueprint = ({ colour = '#ef4444', className = '' }) => (
  <svg viewBox="0 0 200 300" className={className} aria-hidden="true" overflow="visible">
    <RocketPart part="fins" ghost />
    <RocketPart part="flame" ghost />
    <RocketPart part="body" colour={colour} />
    <RocketPart part="window" colour={colour} />
    <RocketPart part="nose" colour={colour} />
  </svg>
);

const FuelCanShape = () => (
  <g>
    <g stroke="#1e293b" strokeWidth="4" strokeLinejoin="round">
      <rect x="10" y="16" width="40" height="50" rx="8" fill="#22c55e" />
      <rect x="20" y="6" width="16" height="12" rx="3" fill="#94a3b8" />
    </g>
    <path d="M30 30 L22 44 L30 44 L26 58 L40 38 L32 38 L36 30 Z" fill="#fde047" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
  </g>
);

const FuelCanArt = () => {
  const raster = artUrl('fuel-can');
  return raster ? <image href={raster} width="60" height="70" preserveAspectRatio="xMidYMid meet" /> : <FuelCanShape />;
};

export const FuelCan = ({ className = 'pointer-events-none h-full w-full' }) => (
  <svg viewBox="0 0 60 70" className={className} aria-hidden="true"><FuelCanArt /></svg>
);

// Icon for Fuel Up: a rocket with a fuel can beside it.
export const FuelUpIcon = ({ className = '' }) => (
  <svg viewBox="0 0 300 310" className={className} aria-hidden="true" overflow="visible">
    {ROCKET_PARTS.map((part) => <RocketPart key={part.id} part={part.id} colour="#f97316" />)}
    <g transform="translate(196 176) scale(1.7)"><FuelCanArt /></g>
  </svg>
);

const RasterImg = ({ url, className, style, title }) => (
  <img src={url} alt={title || ''} aria-hidden={title ? undefined : true} className={`object-contain ${className}`} style={style} draggable={false} />
);

export const Flame = ({ className = '', style }) => (artUrl('fire') ? <RasterImg url={artUrl('fire')} className={className} style={style} /> : (
  <svg viewBox="0 0 100 120" className={className} style={style} aria-hidden="true">
    <path d="M50 4 Q20 40 14 70 Q10 112 50 116 Q90 112 86 70 Q84 50 70 34 Q68 54 58 58 Q64 30 50 4 Z" fill="#f97316" stroke="#9a3412" strokeWidth="5" strokeLinejoin="round" />
    <path d="M50 44 Q30 70 32 88 Q34 108 50 108 Q68 108 68 88 Q68 72 56 60 Q56 74 48 76 Q52 60 50 44 Z" fill="#fde047" />
  </svg>
));

export const Smoke = ({ className = '' }) => (artUrl('smoke') ? <RasterImg url={artUrl('smoke')} className={className} /> : (
  <svg viewBox="0 0 100 60" className={className} aria-hidden="true">
    <g fill="#cbd5e1" opacity=".85">
      <circle cx="26" cy="36" r="18" /><circle cx="50" cy="26" r="22" /><circle cx="74" cy="36" r="18" />
    </g>
  </svg>
));

// A side-on fire truck facing right. `ladderAngle` tilts the roof ladder.
export const FireTruck = ({ className = '', title, lightsOn = true, showLadder = true }) => (artUrl(showLadder ? 'firetruck' : 'firetruck-no-ladder') || artUrl('firetruck')
  ? <RasterImg url={artUrl(showLadder ? 'firetruck' : 'firetruck-no-ladder') || artUrl('firetruck')} className={className} title={title} />
  : (
  <svg viewBox="0 0 320 170" className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} overflow="visible">
    <g stroke={OUTLINE} strokeWidth="5" strokeLinejoin="round">
      <rect x="10" y="56" width="206" height="80" rx="10" fill="#ef4444" />
      <path d="M216 136 L216 40 Q216 30 226 30 L270 30 Q280 30 286 40 L308 84 Q312 92 312 100 L312 136 Z" fill="#ef4444" />
      <path d="M232 44 L268 44 Q274 44 278 50 L294 84 L232 84 Z" fill="#bae6fd" />
      <rect x="252" y="16" width="30" height="14" rx="6" fill={lightsOn ? '#3b82f6' : '#1e3a8a'} />
      {showLadder && (
        <g>
          <rect x="22" y="36" width="190" height="16" rx="4" fill="#e2e8f0" />
          {[40, 64, 88, 112, 136, 160, 184].map((x) => <line key={x} x1={x} y1="36" x2={x} y2="52" />)}
        </g>
      )}
      <rect x="28" y="72" width="54" height="40" rx="6" fill="#fca5a5" />
      <rect x="96" y="72" width="54" height="40" rx="6" fill="#fca5a5" />
      <circle cx="184" cy="92" r="16" fill="#fde047" />
      <rect x="298" y="112" width="18" height="12" rx="3" fill="#fef08a" />
    </g>
    <rect x="12" y="118" width="298" height="10" fill="#fbbf24" opacity=".9" />
    <circle cx="184" cy="92" r="6" fill={OUTLINE} />
    {[[66, 140], [262, 140]].map(([cx, cy]) => (
      <g key={cx}>
        <circle cx={cx} cy={cy} r="26" fill={OUTLINE} />
        <circle cx={cx} cy={cy} r="12" fill="#cbd5e1" />
        <circle cx={cx} cy={cy} r="4" fill={OUTLINE} />
      </g>
    ))}
    {lightsOn && <circle cx="267" cy="18" r="16" fill="#60a5fa" opacity=".35" className="animate-siren" />}
  </svg>
));

// Askia's buddy avatar: a baby T-rex wearing a firefighter helmet.
export const AskiaBuddy = ({ className = '', title = 'Askia’s dino buddy in a fire helmet' }) => (artUrl('askia-buddy') ? <RasterImg url={artUrl('askia-buddy')} className={className} title={title} /> : (
  <svg viewBox="0 0 200 200" className={className} role="img" aria-label={title}>
    <g stroke={OUTLINE} strokeWidth="6" strokeLinejoin="round">
      <path d="M62 150 Q24 150 12 124 Q40 138 70 132 Z" fill="#4ade80" />
      <ellipse cx="96" cy="146" rx="44" ry="38" fill="#4ade80" />
      <ellipse cx="104" cy="92" rx="50" ry="42" fill="#4ade80" />
      <rect x="66" y="172" width="22" height="20" rx="8" fill="#16a34a" />
      <rect x="104" y="172" width="22" height="20" rx="8" fill="#16a34a" />
      <path d="M52 64 Q56 18 108 16 Q160 18 162 64 Z" fill="#ef4444" />
      <path d="M40 66 L176 66 Q182 76 172 80 L44 80 Q34 76 40 66 Z" fill="#dc2626" />
      <path d="M92 28 L124 28 L120 58 L96 58 Z" fill="#fde047" />
    </g>
    <ellipse cx="100" cy="152" rx="26" ry="20" fill="#d9f99d" />
    <circle cx="108" cy="43" r="7" fill="#dc2626" />
    <g>
      <circle cx="86" cy="98" r="12" fill="#fff" stroke={OUTLINE} strokeWidth="4" />
      <circle cx="90" cy="99" r="6" fill={OUTLINE} />
      <circle cx="126" cy="98" r="12" fill="#fff" stroke={OUTLINE} strokeWidth="4" />
      <circle cx="130" cy="99" r="6" fill={OUTLINE} />
      <circle cx="92" cy="96" r="2" fill="#fff" />
      <circle cx="132" cy="96" r="2" fill="#fff" />
    </g>
    <path d="M92 118 Q108 132 124 118" fill="none" stroke={OUTLINE} strokeWidth="5" strokeLinecap="round" />
    <circle cx="72" cy="114" r="7" fill="#fda4af" opacity=".8" />
    <circle cx="142" cy="114" r="7" fill="#fda4af" opacity=".8" />
  </svg>
));
