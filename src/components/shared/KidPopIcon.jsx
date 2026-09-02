import { createElement } from 'react';

/* One clear, colourful SVG badge per game.  Keeping the art in SVG avoids
   platform-dependent emoji and stops thin UI glyphs being layered with a
   second, unrelated symbol. */
const PALETTES = {
  'world-read-write': ['#fff1f7', '#ec4899', '#9d174d'], 'world-maths': ['#fff7d6', '#f97316', '#c2410c'],
  'world-explore': ['#eef2ff', '#6366f1', '#3730a3'], 'world-creative': ['#f5f3ff', '#8b5cf6', '#6d28d9'],
  'world-thinking': ['#e7fffb', '#14b8a6', '#0f766e'], tictactoe: ['#e0faff', '#06b6d4', '#155e75'],
  hangman: ['#f3e8ff', '#a855f7', '#6b21a8'], dino: ['#ecfccb', '#22c55e', '#166534'], jet: ['#e0f2fe', '#0ea5e9', '#075985'],
  solar: ['#fff7d6', '#f59e0b', '#92400e'], german: ['#fff1f2', '#ef4444', '#991b1b'], math: ['#ffedd5', '#f97316', '#9a3412'],
  letters: ['#ccfbf1', '#14b8a6', '#115e59'], memory: ['#ffe4ef', '#e11d48', '#9f1239'], pattern: ['#fff7d6', '#f59e0b', '#92400e'],
  spot: ['#e0e7ff', '#6366f1', '#3730a3'], puzzle: ['#fef9c3', '#eab308', '#854d0e'], trace: ['#dbeafe', '#3b82f6', '#1e40af'],
  phonics: ['#dcfce7', '#22c55e', '#166534'], addition: ['#ccfbf1', '#14b8a6', '#115e59'], subtraction: ['#ede9fe', '#8b5cf6', '#5b21b6'],
  astronaut: ['#e0e7ff', '#8b5cf6', '#4338ca'], counting: ['#dbeafe', '#3b82f6', '#1e3a8a'], words: ['#ffe4ef', '#ec4899', '#9d174d'],
  storybooks: ['#e0e7ff', '#6366f1', '#4338ca'], colormix: ['#fae8ff', '#d946ef', '#86198f'], oddoneout: ['#cffafe', '#06b6d4', '#155e75'],
  timeteller: ['#ecfccb', '#84cc16', '#3f6212'], numberline: ['#d1fae5', '#10b981', '#065f46'], chess: ['#fef3c7', '#d97706', '#92400e'],
  default: ['#e0e7ff', '#6366f1', '#4338ca'],
};

const ART = {
  'world-read-write': 'book', 'world-maths': 'math', 'world-explore': 'orbit', 'world-creative': 'palette', 'world-thinking': 'brain',
  tictactoe: 'grid', hangman: 'star', dino: 'dino', jet: 'plane', solar: 'orbit', german: 'garage', math: 'truck', letters: 'letter',
  memory: 'cards', pattern: 'pattern', spot: 'magnify', puzzle: 'puzzle', trace: 'pencil', phonics: 'sound', addition: 'plus',
  subtraction: 'minus', astronaut: 'helmet', counting: 'count', words: 'abc', storybooks: 'book', colormix: 'palette', oddoneout: 'odd',
  timeteller: 'clock', numberline: 'hop', chess: 'chess', default: 'spark',
};

const Spark = ({ x, y, fill }) => <path d={`M${x} ${y - 6}L${x + 2} ${y - 2}L${x + 6} ${y}L${x + 2} ${y + 2}L${x} ${y + 6}L${x - 2} ${y + 2}L${x - 6} ${y}L${x - 2} ${y - 2}Z`} fill={fill} />;
const Line = ({ d, stroke, width = 4, fill = 'none' }) => <path d={d} fill={fill} stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />;
const faint = (accent) => `${accent}33`;

const Glyph = ({ type, accent, dark }) => {
  switch (type) {
    case 'book': return <g><path d="M26 25Q44 18 56 27Q68 18 86 25V66Q68 59 56 68Q44 59 26 66Z" fill="#fff" stroke={dark} strokeWidth="3" /><Line d="M56 27V67" stroke={accent} width="3" /><path d="M34 35h13M34 43h13M64 35h13M64 43h13" stroke={accent} strokeWidth="3" strokeLinecap="round" /></g>;
    case 'math': return <g><rect x="28" y="27" width="56" height="38" rx="9" fill="#fff" stroke={dark} strokeWidth="3" /><text x="56" y="54" textAnchor="middle" fill={accent} fontSize="25" fontWeight="900">×</text><circle cx="35" cy="70" r="5" fill={accent} /><circle cx="77" cy="70" r="5" fill={accent} /></g>;
    case 'orbit': return <g><circle cx="56" cy="44" r="14" fill="#ffd34d" stroke={dark} strokeWidth="3" /><ellipse cx="56" cy="44" rx="38" ry="15" fill="none" stroke={accent} strokeWidth="4" transform="rotate(-20 56 44)" /><circle cx="83" cy="31" r="5" fill={accent} /></g>;
    case 'palette': return <g><path d="M25 47C22 29 40 21 58 22c18 1 31 12 28 26-2 10-12 7-17 10-6 4-1 10-13 10-12 0-29-8-31-21Z" fill="#fff" stroke={dark} strokeWidth="3" /><circle cx="39" cy="38" r="5" fill="#ef4444" /><circle cx="51" cy="31" r="5" fill="#f59e0b" /><circle cx="65" cy="34" r="5" fill="#22c55e" /><circle cx="73" cy="46" r="5" fill="#3b82f6" /></g>;
    case 'brain': return <g><path d="M45 66c-9 0-14-7-11-14-8-7-3-19 6-19 2-11 16-13 22-5 7-8 21-5 22 6 9 0 13 12 6 18 3 8-3 14-12 14Z" fill="#fff" stroke={dark} strokeWidth="3" /><Line d="M56 29v36M43 38q8 3 8 11M69 38q-8 3-8 11M42 54q8-3 10 5M70 54q-8-3-10 5" stroke={accent} width="3" /></g>;
    case 'grid': return <g>{[0, 1, 2].map((row) => [0, 1, 2].map((col) => <rect key={`${row}-${col}`} x={28 + col * 18} y={25 + row * 18} width="13" height="13" rx="3" fill={row === col ? '#fff' : faint(accent)} stroke={dark} strokeWidth="2" />))}<text x="56" y="64" textAnchor="middle" fill={accent} fontSize="13" fontWeight="900">× ○</text></g>;
    case 'garage': return <g><path d="M25 43 56 25 87 43v27H25Z" fill="#fff" stroke={dark} strokeWidth="3" /><path d="M34 48h44v22H34z" fill={accent} stroke={dark} strokeWidth="3" /><Line d="M34 55h44M34 62h44" stroke="#fff" width="2" /><path d="M48 35h16v10H48z" fill="#facc15" stroke={dark} strokeWidth="2" /></g>;
    case 'truck': return <g><path d="M23 43h43V57H23zM66 47h14l9 10v9H66z" fill="#fff" stroke={dark} strokeWidth="3" /><circle cx="39" cy="68" r="7" fill={accent} stroke={dark} strokeWidth="3" /><circle cx="75" cy="68" r="7" fill={accent} stroke={dark} strokeWidth="3" /></g>;
    case 'letter': return <g><rect x="25" y="27" width="62" height="39" rx="10" fill="#fff" stroke={dark} strokeWidth="3" /><text x="56" y="56" textAnchor="middle" fill={accent} fontSize="31" fontWeight="900">A</text><path d="M78 23l8 8-17 17-8 2 2-8Z" fill="#f59e0b" stroke={dark} strokeWidth="2" /></g>;
    case 'cards': return <g><rect x="27" y="28" width="29" height="37" rx="6" fill="#fff" stroke={dark} strokeWidth="3" transform="rotate(-8 42 46)" /><rect x="56" y="28" width="29" height="37" rx="6" fill="#fff" stroke={dark} strokeWidth="3" transform="rotate(8 70 46)" /><path d="M41 47l4 4 7-9M64 47l4 4 7-9" stroke={accent} strokeWidth="3" fill="none" /></g>;
    case 'pattern': return <g><circle cx="34" cy="46" r="10" fill={accent} /><rect x="48" y="36" width="20" height="20" rx="4" fill="#fff" stroke={dark} strokeWidth="3" /><path d="m78 36 10 18H68Z" fill="#facc15" stroke={dark} strokeWidth="3" /></g>;
    case 'magnify': return <g><circle cx="49" cy="42" r="18" fill="#fff" stroke={dark} strokeWidth="4" /><Line d="m63 56 17 15" stroke={dark} width="7" /><circle cx="43" cy="39" r="3" fill={accent} /><circle cx="55" cy="39" r="3" fill={accent} /><path d="M43 48q6 6 12 0" stroke={accent} strokeWidth="3" fill="none" /></g>;
    case 'puzzle': return <g><path d="M25 34h18c-2-8 10-10 10-2 0 2-1 3-2 4h19v18c8-2 10 10 2 10-2 0-3-1-4-2v5H50v-9c-8 3-11-9-3-10 2 0 3 1 4 2V34Z" fill="#fff" stroke={dark} strokeWidth="3" /><path d="M25 54h20v11H25z" fill={accent} opacity=".8" /></g>;
    case 'pencil': return <g><path d="m34 63-5 2 2-6 31-31 9 9Z" fill="#facc15" stroke={dark} strokeWidth="3" /><path d="m62 28 6-6 9 9-6 6Z" fill="#f97316" stroke={dark} strokeWidth="3" /><Line d="M40 55 60 35" stroke="#fff" width="3" /></g>;
    case 'sound': return <g><path d="M28 42h11l14-12v28L39 46H28Z" fill="#fff" stroke={dark} strokeWidth="3" /><path d="M62 37q10 7 0 14M70 31q17 13 0 26" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" /></g>;
    case 'plus': case 'minus': return <g><circle cx="56" cy="45" r="24" fill="#fff" stroke={dark} strokeWidth="3" /><text x="56" y="55" textAnchor="middle" fill={accent} fontSize="36" fontWeight="900">{type === 'plus' ? '+' : '−'}</text><circle cx="31" cy="68" r="6" fill={accent} /><circle cx="81" cy="68" r="6" fill={accent} /></g>;
    case 'helmet': return <g><path d="M31 58V45c0-18 11-27 25-27s25 9 25 27v13Z" fill="#fff" stroke={dark} strokeWidth="3" /><rect x="37" y="34" width="38" height="16" rx="8" fill="#1e293b" stroke={accent} strokeWidth="3" /><circle cx="45" cy="42" r="3" fill="#67e8f9" /><circle cx="65" cy="42" r="3" fill="#67e8f9" /></g>;
    case 'count': return <g><circle cx="56" cy="45" r="25" fill="#fff" stroke={dark} strokeWidth="3" /><text x="56" y="55" textAnchor="middle" fill={accent} fontSize="22" fontWeight="900">123</text><path d="M30 73h52" stroke={accent} strokeWidth="4" strokeLinecap="round" /></g>;
    case 'abc': return <g>{['A', 'B', 'C'].map((letter, i) => <g key={letter}><rect x={24 + i * 22} y="31" width="20" height="27" rx="4" fill={i === 1 ? accent : '#fff'} stroke={dark} strokeWidth="2" /><text x={34 + i * 22} y="51" textAnchor="middle" fill={i === 1 ? '#fff' : accent} fontSize="15" fontWeight="900">{letter}</text></g>)}</g>;
    case 'odd': return <g><circle cx="39" cy="45" r="13" fill="#fff" stroke={dark} strokeWidth="3" /><circle cx="73" cy="45" r="13" fill={accent} stroke={dark} strokeWidth="3" /><path d="m35 66 8 8 34-34" stroke={dark} strokeWidth="4" fill="none" strokeLinecap="round" /></g>;
    case 'clock': return <g><circle cx="56" cy="45" r="25" fill="#fff" stroke={dark} strokeWidth="3" /><Line d="M56 31v15l11 7" stroke={accent} width="4" /><circle cx="56" cy="45" r="4" fill={dark} /></g>;
    case 'hop': return <g><path d="M26 64h60" stroke={dark} strokeWidth="4" strokeLinecap="round" /><path d="M36 58v12M51 54v16M66 58v12M81 54v16" stroke={accent} strokeWidth="3" /><path d="m42 39 10-10 10 10" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /><circle cx="52" cy="27" r="4" fill={accent} /></g>;
    case 'chess': return <g><path d="M43 64h27M47 58h19l-4-15 8-8H59l-3-10-4 10H41l8 8Z" fill="#fff" stroke={dark} strokeWidth="3" /><path d="M39 69h34" stroke={accent} strokeWidth="4" strokeLinecap="round" /></g>;
    case 'dino': return <g><path d="M32 60c-8-12 1-30 17-30 7-8 23-5 27 5 11 0 14 15 5 22H45l-6 8Z" fill="#fff" stroke={dark} strokeWidth="3" /><circle cx="68" cy="39" r="3" fill={dark} /><path d="M75 53h10M32 59l-8 8" stroke={accent} strokeWidth="4" strokeLinecap="round" /></g>;
    case 'plane': return <g><path d="m27 52 60-26-26 60-10-24Z" fill="#fff" stroke={dark} strokeWidth="3" /><path d="m51 62 10 24M37 50l22 7" stroke={accent} strokeWidth="4" /></g>;
    case 'star': return <g><path d="m56 22 7 15 17 2-13 11 4 17-15-9-15 9 4-17-13-11 17-2Z" fill="#ffd34d" stroke={dark} strokeWidth="3" /><circle cx="49" cy="45" r="2.5" fill={dark} /><circle cx="63" cy="45" r="2.5" fill={dark} /></g>;
    case 'spark': default: return <g><Spark x="56" y="44" fill="#fff" /><circle cx="56" cy="44" r="17" fill="none" stroke={accent} strokeWidth="4" /></g>;
  }
};

const KidPopIcon = ({ Icon: IconComponent, image, label, kind = 'default', compact = false, world = false }) => {
  const [paleTone, accent, dark] = PALETTES[kind] || PALETTES.default;
  const type = ART[kind] || ART.default;
  const gradientId = `kid-pop-${kind.replace(/[^a-z0-9]/gi, '-')}-${compact ? 'compact' : 'full'}`;
  return (
    <span className={`kid-pop-icon ${compact ? 'kid-pop-icon--compact' : ''} ${world ? 'kid-pop-icon--world' : ''}`} role="img" aria-label={label}>
      <svg viewBox="0 0 112 88" aria-hidden="true" focusable="false">
        <defs><linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" /><stop offset=".45" stopColor={paleTone} /><stop offset="1" stopColor={accent} /></linearGradient><filter id={`${gradientId}-shadow`} x="-25%" y="-25%" width="150%" height="170%"><feDropShadow dx="0" dy="4" stdDeviation="2.5" floodColor="#0f172a" floodOpacity=".22" /></filter></defs>
        <path d="M18 24C20 10 39 4 56 10 74 3 98 13 96 31c12 12 2 35-16 37-10 14-37 15-48 1C12 68 7 43 18 24Z" fill={`url(#${gradientId})`} stroke="#fff" strokeWidth="4" filter={`url(#${gradientId}-shadow)`} />
        <Spark x={18} y={17} fill="#fff" /><Spark x={94} y={20} fill="#facc15" />
        {image ? <image href={image} x="8" y="1" width="96" height="84" preserveAspectRatio="xMidYMid meet" /> : <><circle cx="56" cy="45" r="29" fill="#fff" fillOpacity=".58" stroke="#fff" strokeWidth="2" />{ART[kind] ? <Glyph type={type} accent={accent} dark={dark} /> : IconComponent && createElement(IconComponent, { x: 32, y: 21, width: 48, height: 48, size: 48, strokeWidth: 3.8, color: dark, 'aria-hidden': true })}</>}
      </svg>
    </span>
  );
};

export default KidPopIcon;
