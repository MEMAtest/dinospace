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

const Glyph = ({ type, accent, dark }) => {
  const cream = '#fff8e7';
  const ink = '#172554';
  const pink = '#fb7185';
  const blue = '#38bdf8';
  const green = '#84cc16';
  const yellow = '#facc15';
  switch (type) {
    case 'book': return <g><path d="M23 28Q40 19 56 29Q72 19 89 28V68Q72 59 56 69Q40 59 23 68Z" fill={pink} stroke={dark} strokeWidth="3" /><path d="M28 31Q42 26 54 34V62Q41 55 28 61ZM58 34Q70 26 84 31V61Q70 55 58 62Z" fill={cream} stroke={dark} strokeWidth="2" /><path d="M56 30v38M34 39h13M34 47h13M64 39h13M64 47h13" stroke={accent} strokeWidth="3" strokeLinecap="round" /><path d="m55 23 7 7-7 4Z" fill={yellow} stroke={dark} strokeWidth="2" /></g>;
    case 'math': return <g><rect x="25" y="25" width="62" height="40" rx="11" fill={blue} stroke={dark} strokeWidth="3" /><rect x="31" y="30" width="50" height="15" rx="5" fill={cream} /><text x="56" y="42" textAnchor="middle" fill={dark} fontSize="15" fontWeight="900">2 × 3</text><circle cx="37" cy="56" r="5" fill={yellow} /><circle cx="56" cy="56" r="5" fill={pink} /><circle cx="75" cy="56" r="5" fill={green} /><path d="M34 72h44" stroke={dark} strokeWidth="4" strokeLinecap="round" /></g>;
    case 'orbit': return <g><ellipse cx="56" cy="46" rx="39" ry="17" fill="none" stroke={cream} strokeWidth="5" transform="rotate(-18 56 46)" /><circle cx="56" cy="46" r="17" fill={yellow} stroke={dark} strokeWidth="3" /><circle cx="50" cy="42" r="3" fill={ink} /><circle cx="62" cy="42" r="3" fill={ink} /><path d="M49 50q7 7 14 0" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" /><circle cx="86" cy="29" r="7" fill={blue} stroke={dark} strokeWidth="2" /><path d="M84 27h4" stroke={cream} strokeWidth="2" strokeLinecap="round" /></g>;
    case 'palette': return <g><path d="M24 49C21 29 39 20 59 22c18 1 31 12 27 26-2 8-11 7-17 9-7 3-3 11-13 11-13 0-30-7-32-19Z" fill={pink} stroke={dark} strokeWidth="3" /><circle cx="39" cy="38" r="5" fill={yellow} /><circle cx="52" cy="31" r="5" fill={blue} /><circle cx="66" cy="35" r="5" fill={green} /><circle cx="74" cy="47" r="5" fill={cream} /><circle cx="46" cy="51" r="4" fill={dark} /><path d="M28 55q16 13 31 9" stroke={cream} strokeWidth="3" fill="none" strokeLinecap="round" /></g>;
    case 'brain': return <g><path d="M45 67c-9 0-14-7-11-14-8-7-3-19 6-19 2-11 16-13 22-5 7-8 21-5 22 6 9 0 13 12 6 18 3 8-3 14-12 14Z" fill={pink} stroke={dark} strokeWidth="3" /><Line d="M56 29v36M43 38q8 3 8 11M69 38q-8 3-8 11M42 54q8-3 10 5M70 54q-8-3-10 5" stroke={cream} width="3" /><circle cx="42" cy="28" r="3" fill={yellow} /><circle cx="73" cy="26" r="3" fill={blue} /></g>;
    case 'grid': return <g><rect x="25" y="23" width="62" height="49" rx="10" fill={blue} stroke={dark} strokeWidth="3" />{[0, 1, 2].map((row) => [0, 1, 2].map((col) => <rect key={`${row}-${col}`} x={31 + col * 17} y={29 + row * 14} width="12" height="10" rx="3" fill={(row + col) % 2 ? pink : cream} stroke={dark} strokeWidth="1.5" />))}<path d="M36 34l3 3 5-6M70 48a4 4 0 1 0 0 8 4 4 0 1 0 0-8" fill="none" stroke={dark} strokeWidth="2.5" strokeLinecap="round" /></g>;
    case 'garage': return <g><path d="M23 44 56 23 89 44v28H23Z" fill={pink} stroke={dark} strokeWidth="3" /><path d="M32 47h48v25H32z" fill={blue} stroke={dark} strokeWidth="3" /><path d="M38 53h36v15H38z" fill={ink} stroke={cream} strokeWidth="2" /><path d="M45 64h22" stroke={blue} strokeWidth="3" strokeLinecap="round" /><path d="M47 36h18v9H47z" fill={yellow} stroke={dark} strokeWidth="2" /><circle cx="41" cy="69" r="3" fill={cream} /><circle cx="71" cy="69" r="3" fill={cream} /></g>;
    case 'truck': return <g><path d="M21 42h45v19H21zM66 47h14l10 10v12H66z" fill={blue} stroke={dark} strokeWidth="3" /><path d="M69 51h9l6 7H69z" fill={cream} stroke={dark} strokeWidth="2" /><path d="M25 46h32" stroke={pink} strokeWidth="5" strokeLinecap="round" /><circle cx="39" cy="71" r="8" fill={ink} stroke={cream} strokeWidth="3" /><circle cx="76" cy="71" r="8" fill={ink} stroke={cream} strokeWidth="3" /><circle cx="39" cy="71" r="3" fill={yellow} /><circle cx="76" cy="71" r="3" fill={yellow} /></g>;
    case 'letter': return <g><rect x="23" y="26" width="63" height="43" rx="11" fill={blue} stroke={dark} strokeWidth="3" /><rect x="30" y="32" width="37" height="30" rx="6" fill={cream} stroke={dark} strokeWidth="2" /><text x="48" y="55" textAnchor="middle" fill={accent} fontSize="27" fontWeight="900">A</text><path d="M70 59 61 50l20-20 9 9Z" fill={yellow} stroke={dark} strokeWidth="2" /><path d="m79 29 9 9" stroke={pink} strokeWidth="3" /></g>;
    case 'cards': return <g><rect x="25" y="28" width="31" height="40" rx="7" fill={blue} stroke={dark} strokeWidth="3" transform="rotate(-9 40 48)" /><rect x="56" y="28" width="31" height="40" rx="7" fill={pink} stroke={dark} strokeWidth="3" transform="rotate(9 71 48)" /><path d="M40 47c-5-6-12 2 0 10 12-8 5-16 0-10ZM70 42l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill={cream} stroke={dark} strokeWidth="2" /></g>;
    case 'pattern': return <g><circle cx="34" cy="47" r="12" fill={green} stroke={dark} strokeWidth="3" /><rect x="46" y="34" width="23" height="23" rx="5" fill={blue} stroke={dark} strokeWidth="3" /><path d="m80 34 11 21H69Z" fill={yellow} stroke={dark} strokeWidth="3" /><circle cx="34" cy="47" r="4" fill={cream} /><path d="M52 40h11M52 48h11" stroke={cream} strokeWidth="2" strokeLinecap="round" /></g>;
    case 'magnify': return <g><circle cx="48" cy="41" r="20" fill={blue} stroke={dark} strokeWidth="4" /><circle cx="48" cy="41" r="13" fill={cream} /><circle cx="43" cy="39" r="3" fill={ink} /><circle cx="54" cy="39" r="3" fill={ink} /><path d="M43 48q6 5 11 0" fill="none" stroke={pink} strokeWidth="3" strokeLinecap="round" /><Line d="m63 56 18 16" stroke={yellow} width="8" /></g>;
    case 'puzzle': return <g><path d="M25 33h17c-3-9 11-12 12-3 0 2-1 3-2 4h20v16c9-3 12 11 3 12-2 0-3-1-4-2v9H53v-10c-9 3-12-10-3-11 2 0 3 1 4 2V33Z" fill={yellow} stroke={dark} strokeWidth="3" /><path d="M25 54h20v15H25z" fill={pink} stroke={dark} strokeWidth="2" /><path d="M53 33h17" stroke={blue} strokeWidth="4" strokeLinecap="round" /><circle cx="78" cy="59" r="4" fill={blue} /></g>;
    case 'pencil': return <g><path d="m31 64-5 3 3-8 32-32 10 10Z" fill={yellow} stroke={dark} strokeWidth="3" /><path d="m61 27 7-7 10 10-7 7Z" fill={pink} stroke={dark} strokeWidth="2" /><path d="m27 67 7-3-4-4Z" fill={cream} stroke={dark} strokeWidth="2" /><Line d="M40 55 60 35" stroke={blue} width="3" /></g>;
    case 'sound': return <g><path d="M25 41h13l16-14v35L38 49H25Z" fill={yellow} stroke={dark} strokeWidth="3" /><circle cx="34" cy="45" r="4" fill={pink} /><path d="M62 36q10 9 0 18M71 29q18 16 0 32" fill="none" stroke={blue} strokeWidth="5" strokeLinecap="round" /></g>;
    case 'plus': case 'minus': return <g><circle cx="56" cy="45" r="25" fill={green} stroke={dark} strokeWidth="3" /><circle cx="56" cy="45" r="18" fill={cream} /><text x="56" y="57" textAnchor="middle" fill={accent} fontSize="37" fontWeight="900">{type === 'plus' ? '+' : '−'}</text><circle cx="30" cy="69" r="6" fill={pink} stroke={dark} strokeWidth="2" /><circle cx="82" cy="69" r="6" fill={blue} stroke={dark} strokeWidth="2" /></g>;
    case 'helmet': return <g><path d="M29 61V45c0-19 12-29 27-29s27 10 27 29v16Z" fill={pink} stroke={dark} strokeWidth="3" /><rect x="35" y="33" width="42" height="19" rx="9" fill={ink} stroke={blue} strokeWidth="3" /><circle cx="45" cy="42" r="4" fill={blue} /><circle cx="66" cy="42" r="4" fill={blue} /><path d="M42 59h28" stroke={yellow} strokeWidth="4" strokeLinecap="round" /></g>;
    case 'count': return <g><circle cx="56" cy="45" r="26" fill={blue} stroke={dark} strokeWidth="3" /><circle cx="56" cy="45" r="19" fill={cream} /><text x="56" y="54" textAnchor="middle" fill={accent} fontSize="22" fontWeight="900">123</text><path d="M31 73h50" stroke={yellow} strokeWidth="5" strokeLinecap="round" /><circle cx="37" cy="30" r="3" fill={pink} /><circle cx="76" cy="31" r="3" fill={green} /></g>;
    case 'abc': return <g>{['A', 'B', 'C'].map((letter, i) => <g key={letter}><rect x={23 + i * 23} y="30" width="22" height="30" rx="5" fill={[pink, blue, yellow][i]} stroke={dark} strokeWidth="2" /><text x={34 + i * 23} y="51" textAnchor="middle" fill={i === 2 ? dark : cream} fontSize="17" fontWeight="900">{letter}</text></g>)}<path d="M29 67h54" stroke={accent} strokeWidth="4" strokeLinecap="round" /></g>;
    case 'odd': return <g><circle cx="36" cy="43" r="13" fill={blue} stroke={dark} strokeWidth="3" /><rect x="49" y="30" width="26" height="26" rx="5" fill={green} stroke={dark} strokeWidth="3" /><circle cx="78" cy="43" r="13" fill={pink} stroke={dark} strokeWidth="3" /><path d="m36 68 8 7 31-30" stroke={cream} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>;
    case 'clock': return <g><circle cx="56" cy="45" r="26" fill={yellow} stroke={dark} strokeWidth="3" /><circle cx="56" cy="45" r="19" fill={cream} /><path d="M56 31v14l12 7" stroke={accent} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="56" cy="45" r="4" fill={dark} /><circle cx="42" cy="29" r="3" fill={pink} /><circle cx="73" cy="65" r="3" fill={blue} /></g>;
    case 'hop': return <g><path d="M23 68h66" stroke={dark} strokeWidth="4" strokeLinecap="round" /><circle cx="34" cy="61" r="7" fill={green} stroke={dark} strokeWidth="2" /><circle cx="52" cy="52" r="7" fill={blue} stroke={dark} strokeWidth="2" /><circle cx="70" cy="61" r="7" fill={pink} stroke={dark} strokeWidth="2" /><path d="m43 40 11-11 11 11" fill="none" stroke={yellow} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="54" cy="27" r="4" fill={green} /></g>;
    case 'chess': return <g><path d="M42 64h29M46 58h21l-4-15 8-8H59l-3-11-4 11H41l8 8Z" fill={yellow} stroke={dark} strokeWidth="3" /><path d="M38 70h36" stroke={blue} strokeWidth="5" strokeLinecap="round" /><circle cx="56" cy="24" r="3" fill={pink} /></g>;
    case 'dino': return <g><path d="M31 60c-8-13 1-30 17-30 7-8 23-5 27 5 11 0 14 15 5 22H45l-6 8Z" fill={green} stroke={dark} strokeWidth="3" /><circle cx="68" cy="39" r="4" fill={cream} stroke={dark} strokeWidth="2" /><circle cx="68" cy="39" r="1.5" fill={ink} /><path d="M71 51q7 6 13 0M32 58l-8 9" stroke={pink} strokeWidth="4" strokeLinecap="round" /><path d="M45 31l4-7 5 6 6-7 4 8" fill="none" stroke={yellow} strokeWidth="4" strokeLinecap="round" /></g>;
    case 'plane': return <g><path d="m26 51 62-28-26 62-11-25Z" fill={blue} stroke={dark} strokeWidth="3" /><path d="m51 61 11 24M37 49l22 7" stroke={yellow} strokeWidth="5" strokeLinecap="round" /><circle cx="58" cy="44" r="6" fill={cream} stroke={dark} strokeWidth="2" /><path d="M31 59 22 68" stroke={pink} strokeWidth="5" strokeLinecap="round" /></g>;
    case 'star': return <g><path d="m56 21 8 16 18 2-14 12 4 18-16-9-16 9 4-18-14-12 18-2Z" fill={yellow} stroke={dark} strokeWidth="3" /><circle cx="49" cy="45" r="3" fill={ink} /><circle cx="63" cy="45" r="3" fill={ink} /><path d="M49 53q7 6 14 0" fill="none" stroke={pink} strokeWidth="3" strokeLinecap="round" /><circle cx="39" cy="30" r="3" fill={blue} /><circle cx="74" cy="29" r="3" fill={pink} /></g>;
    case 'spark': default: return <g><Spark x="56" y="44" fill="#fff" /><circle cx="56" cy="44" r="17" fill="none" stroke={accent} strokeWidth="4" /></g>;
  }
};

const KidPopIcon = ({ image, label, kind = 'default', compact = false, world = false }) => {
  const [paleTone, accent, dark] = PALETTES[kind] || PALETTES.default;
  const type = ART[kind] || ART.default;
  const gradientId = `kid-pop-${kind.replace(/[^a-z0-9]/gi, '-')}-${compact ? 'compact' : 'full'}`;
  return (
    <span className={`kid-pop-icon ${compact ? 'kid-pop-icon--compact' : ''} ${world ? 'kid-pop-icon--world' : ''}`} role="img" aria-label={label} data-icon-kind={kind}>
      <svg viewBox="0 0 112 88" aria-hidden="true" focusable="false">
        <defs><linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" /><stop offset=".45" stopColor={paleTone} /><stop offset="1" stopColor={accent} /></linearGradient><filter id={`${gradientId}-shadow`} x="-25%" y="-25%" width="150%" height="170%"><feDropShadow dx="0" dy="4" stdDeviation="2.5" floodColor="#0f172a" floodOpacity=".22" /></filter></defs>
        <path d="M18 24C20 10 39 4 56 10 74 3 98 13 96 31c12 12 2 35-16 37-10 14-37 15-48 1C12 68 7 43 18 24Z" fill={`url(#${gradientId})`} stroke="#fff" strokeWidth="4" filter={`url(#${gradientId}-shadow)`} />
        <Spark x={18} y={17} fill="#fff" /><Spark x={94} y={20} fill="#facc15" />
        {image ? <image href={image} x="8" y="1" width="96" height="84" preserveAspectRatio="xMidYMid meet" /> : <><circle cx="56" cy="45" r="29" fill={paleTone} fillOpacity=".62" stroke="#fff" strokeWidth="2" /><Glyph type={type} accent={accent} dark={dark} /></>}
      </svg>
    </span>
  );
};

export default KidPopIcon;
