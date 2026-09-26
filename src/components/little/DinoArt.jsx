import { useId } from 'react';
import { artUrl } from './littleArt.js';

// Cartoon dinosaurs drawn as layered SVG. Every dino is described once as a
// list of shapes; the shapes are painted twice — first as a thick outline
// layer, then as the fill layer — which gives the chunky sticker outline
// without seams where body parts overlap.

const OUTLINE = '#1e293b';
const SILHOUETTE = '#1e293b';

const Eye = ({ cx, cy, r = 7 }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={OUTLINE} strokeWidth="3" />
    <circle cx={cx + r * 0.25} cy={cy + r * 0.05} r={r * 0.5} fill={OUTLINE} />
    <circle cx={cx + r * 0.45} cy={cy - r * 0.2} r={r * 0.18} fill="#fff" />
  </g>
);

const DINO_SHAPES = {
  trex: ({ body, belly, accent }) => ({
    shapes: [
      <path key="tail" d="M78 96 Q42 94 6 66 Q24 104 84 124 Z" fill={body} />,
      <ellipse key="leg-back" cx="84" cy="122" rx="20" ry="24" fill={accent} />,
      <rect key="foot-back" x="70" y="134" width="30" height="14" rx="7" fill={accent} />,
      <ellipse key="body" cx="102" cy="104" rx="42" ry="31" fill={body} />,
      <rect key="leg-front" x="110" y="116" width="18" height="30" rx="8" fill={body} />,
      <rect key="foot-front" x="106" y="136" width="28" height="12" rx="6" fill={body} />,
      <ellipse key="neck" cx="130" cy="76" rx="19" ry="26" fill={body} />,
      <path key="head" d="M116 44 Q148 24 180 40 Q192 52 184 66 Q162 80 130 74 Q112 62 116 44 Z" fill={body} />,
      <path key="arm" d="M128 98 Q146 98 148 112 Q140 110 132 108 Z" fill={body} />,
    ],
    details: (
      <g>
        <ellipse cx="110" cy="112" rx="26" ry="16" fill={belly} />
        <circle cx="84" cy="92" r="5" fill={accent} opacity=".8" />
        <circle cx="98" cy="84" r="4" fill={accent} opacity=".8" />
        <circle cx="70" cy="100" r="3.5" fill={accent} opacity=".8" />
        <path d="M148 64 Q166 68 182 60" fill="none" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
        <path d="M160 64 l3 6 l3 -6 M170 62 l3 6 l3 -6" fill="#fff" stroke={OUTLINE} strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="178" cy="46" r="2" fill={OUTLINE} />
        <Eye cx={148} cy={46} />
      </g>
    ),
  }),
  trike: ({ body, belly, accent }) => ({
    shapes: [
      <path key="tail" d="M58 96 Q28 98 6 86 Q26 114 64 114 Z" fill={body} />,
      <rect key="leg-bl" x="60" y="108" width="20" height="38" rx="9" fill={accent} />,
      <rect key="leg-fl" x="116" y="108" width="20" height="38" rx="9" fill={accent} />,
      <ellipse key="body" cx="94" cy="98" rx="50" ry="31" fill={body} />,
      <rect key="leg-br" x="78" y="112" width="20" height="36" rx="9" fill={body} />,
      <rect key="leg-fr" x="132" y="112" width="20" height="36" rx="9" fill={body} />,
      <circle key="frill" cx="140" cy="76" r="31" fill={accent} />,
      <ellipse key="head" cx="160" cy="92" rx="27" ry="21" fill={body} />,
      <path key="beak" d="M180 88 L198 98 L180 108 Z" fill={belly} />,
      <path key="horn-1" d="M146 72 L160 40 L162 74 Z" fill="#fef3c7" />,
      <path key="horn-2" d="M164 74 L184 48 L176 80 Z" fill="#fef3c7" />,
      <path key="horn-nose" d="M178 84 L186 70 L186 88 Z" fill="#fef3c7" />,
    ],
    details: (
      <g>
        {[[116, 56], [124, 46], [138, 42], [152, 46], [112, 70]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" fill={belly} />)}
        <ellipse cx="96" cy="108" rx="30" ry="14" fill={belly} opacity=".9" />
        <path d="M168 104 Q176 108 182 104" fill="none" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
        <Eye cx={160} cy={88} />
      </g>
    ),
  }),
  stego: ({ body, belly, accent }) => ({
    shapes: [
      <path key="plate-1" d="M52 84 L60 52 L76 80 Z" fill={accent} />,
      <path key="plate-2" d="M70 76 L84 38 L98 74 Z" fill={accent} />,
      <path key="plate-3" d="M92 72 L108 32 L122 72 Z" fill={accent} />,
      <path key="plate-4" d="M116 76 L130 44 L140 80 Z" fill={accent} />,
      <path key="tail" d="M56 100 Q28 98 6 78 Q22 112 60 118 Z" fill={body} />,
      <path key="spike-1" d="M16 82 L4 66 L22 78 Z" fill="#fef3c7" />,
      <path key="spike-2" d="M24 90 L14 72 L30 86 Z" fill="#fef3c7" />,
      <rect key="leg-bl" x="62" y="108" width="20" height="38" rx="9" fill={accent} />,
      <rect key="leg-fl" x="118" y="110" width="18" height="36" rx="8" fill={accent} />,
      <ellipse key="body" cx="98" cy="100" rx="50" ry="28" fill={body} />,
      <rect key="leg-br" x="80" y="112" width="20" height="36" rx="9" fill={body} />,
      <rect key="leg-fr" x="132" y="112" width="18" height="36" rx="8" fill={body} />,
      <path key="neck" d="M136 92 Q156 96 166 104 L160 118 Q146 112 132 112 Z" fill={body} />,
      <ellipse key="head" cx="170" cy="112" rx="20" ry="13" fill={body} />,
    ],
    details: (
      <g>
        <ellipse cx="100" cy="110" rx="32" ry="12" fill={belly} />
        <path d="M176 118 Q182 120 188 116" fill="none" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
        <Eye cx={172} cy={108} r={6} />
      </g>
    ),
  }),
  bronto: ({ body, belly, accent }) => ({
    shapes: [
      <path key="tail" d="M44 108 Q18 108 2 94 Q14 128 52 126 Z" fill={body} />,
      <rect key="leg-bl" x="40" y="116" width="20" height="32" rx="9" fill={accent} />,
      <rect key="leg-fl" x="92" y="116" width="20" height="32" rx="9" fill={accent} />,
      <ellipse key="body" cx="76" cy="108" rx="46" ry="28" fill={body} />,
      <rect key="leg-br" x="56" y="118" width="20" height="30" rx="9" fill={body} />,
      <rect key="leg-fr" x="106" y="118" width="20" height="30" rx="9" fill={body} />,
      <path key="neck" d="M96 96 Q118 40 142 18 L162 30 Q138 58 124 104 Z" fill={body} />,
      <ellipse key="head" cx="160" cy="22" rx="22" ry="14" fill={body} />,
    ],
    details: (
      <g>
        <ellipse cx="78" cy="118" rx="28" ry="10" fill={belly} />
        {[[60, 94], [76, 88], [92, 92], [118, 62], [128, 46]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4.5" fill={accent} opacity=".85" />)}
        <path d="M166 30 Q174 32 180 26" fill="none" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
        <Eye cx={160} cy={17} r={6} />
      </g>
    ),
  }),
  ptero: ({ body, belly, accent }) => ({
    shapes: [
      <path key="wing-back" d="M96 76 Q70 30 10 34 Q40 60 60 96 Z" fill={accent} />,
      <path key="wing-front" d="M104 78 Q134 26 192 38 Q162 62 138 100 Z" fill={accent} />,
      <ellipse key="body" cx="100" cy="92" rx="18" ry="30" fill={body} />,
      <path key="crest" d="M96 54 L70 38 L98 46 Z" fill={accent} />,
      <ellipse key="head" cx="106" cy="54" rx="16" ry="13" fill={body} />,
      <path key="beak" d="M118 50 L150 58 L118 64 Z" fill="#fde68a" />,
      <path key="foot-l" d="M92 118 L86 134 L96 130 Z" fill={body} />,
      <path key="foot-r" d="M106 118 L112 134 L102 130 Z" fill={body} />,
    ],
    details: (
      <g>
        <ellipse cx="100" cy="98" rx="10" ry="18" fill={belly} />
        <path d="M40 44 Q60 60 70 84 M160 44 Q142 62 130 88" fill="none" stroke={OUTLINE} strokeWidth="2" opacity=".35" />
        <Eye cx={108} cy={51} r={6} />
      </g>
    ),
  }),
  ankylo: ({ body, belly, accent }) => ({
    shapes: [
      <path key="tail" d="M50 108 Q26 108 16 100 L18 112 Q30 120 52 120 Z" fill={body} />,
      <ellipse key="club" cx="14" cy="104" rx="14" ry="11" fill={accent} />,
      <rect key="leg-bl" x="54" y="112" width="20" height="32" rx="9" fill={accent} />,
      <rect key="leg-fl" x="124" y="112" width="20" height="32" rx="9" fill={accent} />,
      <path key="body" d="M42 116 Q44 64 100 62 Q156 64 160 116 Z" fill={body} />,
      <rect key="leg-br" x="72" y="114" width="20" height="32" rx="9" fill={body} />,
      <rect key="leg-fr" x="140" y="114" width="20" height="32" rx="9" fill={body} />,
      <ellipse key="head" cx="170" cy="108" rx="22" ry="16" fill={body} />,
    ],
    details: (
      <g>
        {[[66, 88], [86, 76], [108, 72], [130, 78], [148, 94], [80, 100], [104, 94], [128, 100]].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="7" fill={accent} stroke={OUTLINE} strokeWidth="2" />
        ))}
        <path d="M60 116 L148 116" stroke={belly} strokeWidth="6" strokeLinecap="round" />
        <path d="M178 116 Q184 118 190 112" fill="none" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
        <Eye cx={172} cy={103} r={6} />
      </g>
    ),
  }),
};

export const DINO_KINDS = Object.freeze(Object.keys(DINO_SHAPES));

const DEFAULT_COLOURS = {
  trex: { body: '#4ade80', belly: '#d9f99d', accent: '#16a34a' },
  trike: { body: '#fb923c', belly: '#fed7aa', accent: '#c2410c' },
  stego: { body: '#a78bfa', belly: '#ede9fe', accent: '#f472b6' },
  bronto: { body: '#38bdf8', belly: '#e0f2fe', accent: '#0369a1' },
  ptero: { body: '#f87171', belly: '#fecaca', accent: '#fbbf24' },
  ankylo: { body: '#facc15', belly: '#fef9c3', accent: '#a16207' },
};

export const Dino = ({
  kind = 'trex', colours, silhouette = false, className = '', title, flip = false, x, y, width, height,
}) => {
  const raster = artUrl(`dino-${kind}`);
  if (raster) {
    return (
      <svg viewBox="0 0 200 160" className={className} x={x} y={y} width={width} height={height} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} overflow="visible">
        <image
          href={raster}
          width="200"
          height="160"
          preserveAspectRatio="xMidYMid meet"
          transform={flip ? 'translate(200 0) scale(-1 1)' : undefined}
          style={silhouette ? { filter: 'brightness(0)', opacity: 0.82 } : undefined}
        />
      </svg>
    );
  }
  const palette = { ...DEFAULT_COLOURS[kind], ...colours };
  const { shapes, details } = (DINO_SHAPES[kind] || DINO_SHAPES.trex)(palette);
  const outlineShapes = shapes.map((shape) => ({ ...shape, props: { ...shape.props, fill: silhouette ? SILHOUETTE : OUTLINE } }));
  return (
    <svg
      viewBox="0 0 200 160"
      className={className}
      x={x}
      y={y}
      width={width}
      height={height}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      overflow="visible"
    >
      <g transform={flip ? 'translate(200 0) scale(-1 1)' : undefined}>
        <g stroke={silhouette ? SILHOUETTE : OUTLINE} strokeWidth="9" strokeLinejoin="round">{outlineShapes}</g>
        {!silhouette && <g>{shapes}</g>}
        {!silhouette && details}
      </g>
    </svg>
  );
};

const Palm = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M0 0 Q6 -40 2 -80" stroke="#92400e" strokeWidth="9" fill="none" strokeLinecap="round" />
    {[-60, -20, 20, 60, 100].map((angle) => (
      <ellipse key={angle} cx="2" cy="-80" rx="30" ry="8" fill="#16a34a" transform={`rotate(${angle} 2 -80) translate(22 0)`} />
    ))}
  </g>
);

const Cloud = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} fill="#fff">
    <ellipse cx="0" cy="0" rx="26" ry="14" />
    <ellipse cx="22" cy="-8" rx="20" ry="16" />
    <ellipse cx="44" cy="2" rx="22" ry="12" />
  </g>
);

// Full scenes used by Dino Jigsaw. They share a 400×300 (4:3) canvas so the
// jigsaw can cut any scene into the same grids.
const SCENES = {
  volcano: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fdba74" /><stop offset="1" stopColor="#fef3c7" /></linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-sky)`} />
      <path d="M200 60 Q180 30 196 10 Q214 28 234 12 Q244 40 222 60 Z" fill="#94a3b8" opacity=".8" />
      <path d="M120 220 L190 70 L240 70 L320 220 Z" fill="#7c2d12" />
      <path d="M190 70 L240 70 L232 92 Q214 84 198 94 Z" fill="#f97316" />
      <path d="M204 92 Q210 130 196 160 Q214 130 222 92 Z" fill="#fb923c" />
      <ellipse cx="200" cy="300" rx="260" ry="90" fill="#65a30d" />
      <Palm x={48} y={236} />
      <Palm x={362} y={240} scale={0.9} />
      <Dino kind="trex" x={110} y={128} width={200} height={160} />
    </>
  ),
  lake: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#7dd3fc" /><stop offset="1" stopColor="#e0f2fe" /></linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-sky)`} />
      <circle cx="340" cy="56" r="30" fill="#fde047" />
      <Cloud x={60} y={52} />
      <Cloud x={220} y={36} scale={0.8} />
      <path d="M0 180 Q100 150 200 176 Q300 150 400 180 L400 300 L0 300 Z" fill="#4ade80" />
      <ellipse cx="120" cy="250" rx="130" ry="36" fill="#38bdf8" />
      <ellipse cx="100" cy="246" rx="60" ry="10" fill="#bae6fd" />
      <Palm x={360} y={236} />
      <Dino kind="bronto" x={180} y={96} width={200} height={160} />
    </>
  ),
  meadow: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#a5f3fc" /><stop offset="1" stopColor="#f0fdf4" /></linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-sky)`} />
      <circle cx="60" cy="60" r="32" fill="#fde047" />
      <Cloud x={250} y={60} />
      <path d="M0 190 Q140 160 260 190 Q340 170 400 186 L400 300 L0 300 Z" fill="#86efac" />
      {[[40, 250, '#f472b6'], [80, 270, '#facc15'], [330, 262, '#f472b6'], [360, 280, '#a78bfa'], [300, 286, '#facc15']].map(([cx, cy, c]) => (
        <g key={`${cx}-${cy}`}><circle cx={cx} cy={cy} r="8" fill={c} /><circle cx={cx} cy={cy} r="3" fill="#fff" /></g>
      ))}
      <Dino kind="trike" x={96} y={130} width={210} height={168} />
    </>
  ),
  sky: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#c4b5fd" /><stop offset="1" stopColor="#fbcfe8" /></linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-sky)`} />
      <circle cx="320" cy="70" r="36" fill="#fef08a" />
      <Cloud x={40} y={200} scale={1.2} />
      <Cloud x={290} y={220} />
      <path d="M0 262 L60 220 L110 250 L170 206 L240 256 L300 214 L360 250 L400 230 L400 300 L0 300 Z" fill="#7c3aed" opacity=".55" />
      <Dino kind="ptero" x={90} y={30} width={220} height={176} />
    </>
  ),
  forest: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#bbf7d0" /><stop offset="1" stopColor="#fefce8" /></linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-sky)`} />
      {[30, 110, 300, 370].map((x) => (
        <g key={x}><rect x={x - 8} y="120" width="16" height="120" fill="#92400e" /><circle cx={x} cy="110" r="40" fill="#15803d" /><circle cx={x - 18} cy="126" r="26" fill="#16a34a" /></g>
      ))}
      <rect y="230" width="400" height="70" fill="#65a30d" />
      <Dino kind="stego" x={96} y={128} width={210} height={168} />
    </>
  ),
  eggs: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fed7aa" /><stop offset="1" stopColor="#fff7ed" /></linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-sky)`} />
      <circle cx="80" cy="70" r="34" fill="#fb923c" opacity=".8" />
      <path d="M0 200 Q200 170 400 200 L400 300 L0 300 Z" fill="#d6d3d1" />
      <ellipse cx="300" cy="258" rx="80" ry="24" fill="#a8a29e" />
      {[[270, 240, '#fde68a'], [304, 236, '#bae6fd'], [336, 244, '#fbcfe8']].map(([cx, cy, c]) => (
        <g key={cx}><ellipse cx={cx} cy={cy} rx="16" ry="22" fill={c} stroke={OUTLINE} strokeWidth="3" /><circle cx={cx - 4} cy={cy - 6} r="3" fill="#fff" /></g>
      ))}
      <Dino kind="ankylo" x={30} y={136} width={200} height={160} />
    </>
  ),
};

export const SCENE_IDS = Object.freeze(Object.keys(SCENES));

export const DinoScene = ({ scene = 'volcano', viewBox = '0 0 400 300', className = '', title, preserveAspectRatio }) => {
  const id = useId().replace(/:/g, '');
  const raster = artUrl(`scene-${scene}`);
  return (
    <svg
      viewBox={viewBox}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      preserveAspectRatio={preserveAspectRatio}
    >
      {raster
        ? <image href={raster} width="400" height="300" preserveAspectRatio="xMidYMid slice" />
        : (SCENES[scene] || SCENES.volcano)(id)}
    </svg>
  );
};
