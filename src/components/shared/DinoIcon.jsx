const SPECIES = {
  trex: { name: 'Tyrannosaurus rex', primary: '#4dbd65', shade: '#177a46', belly: '#d9f2a5', kind: 'biped', feature: 'trex' },
  brachio: { name: 'Brachiosaurus', primary: '#43b9b1', shade: '#177d79', belly: '#c6f4df', kind: 'long-neck', feature: 'brachio' },
  trike: { name: 'Triceratops', primary: '#ef8b45', shade: '#b6492f', belly: '#ffd5a3', kind: 'quad', feature: 'trike' },
  stego: { name: 'Stegosaurus', primary: '#5d83e8', shade: '#304eaf', belly: '#bfd3ff', kind: 'quad', feature: 'stego' },
  raptor: { name: 'Velociraptor', primary: '#ea6661', shade: '#ad3e54', belly: '#ffd0bd', kind: 'biped', feature: 'raptor' },
  ankyl: { name: 'Ankylosaurus', primary: '#b87345', shade: '#754025', belly: '#f3ca93', kind: 'quad', feature: 'ankyl' },
  para: { name: 'Parasaurolophus', primary: '#a36ee5', shade: '#6239a9', belly: '#e3cbff', kind: 'long-neck', feature: 'para' },
  spino: { name: 'Spinosaurus', primary: '#4aa877', shade: '#176445', belly: '#c7ecb6', kind: 'biped', feature: 'spino' },
  ptero: { name: 'Pterodactyl, a flying reptile', primary: '#5bb8e4', shade: '#21689f', belly: '#c5ebff', kind: 'ptero', feature: 'ptero' },
  dillo: { name: 'Dilophosaurus', primary: '#94b94d', shade: '#53772c', belly: '#e5f4ae', kind: 'biped', feature: 'dillo' },
};

const Eyes = ({ x, y }) => (
  <>
    <circle cx={x} cy={y} r="4.4" fill="#fff" />
    <circle cx={x + 1.2} cy={y + 0.4} r="2" fill="#15233a" />
    <circle cx={x + 2.1} cy={y - 0.8} r="0.8" fill="#fff" stroke="none" />
  </>
);

const QuadDino = ({ dino }) => (
  <g stroke="#183b45" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5">
    <path d="M33 76 C20 74 12 68 8 62 C17 58 31 60 43 66 C47 55 62 48 87 49 C108 50 122 59 126 73 C123 85 104 91 75 91 C53 91 39 87 33 76Z" fill={dino.paint} />
    <path d="M43 77 C53 69 66 66 82 67 C100 68 111 73 115 81 C106 88 91 90 75 90 C58 90 47 86 43 77Z" fill={dino.belly} stroke="none" opacity="0.9" />
    <path d="M53 87 L51 105 L42 105 L44 87 M72 89 L73 106 L64 106 L63 88 M97 88 L100 105 L91 105 L88 87 M114 83 L122 102 L113 102 L105 87" fill={dino.primary} />
    <path d="M33 76 C19 78 10 75 5 70 C14 67 25 67 40 70" fill="none" stroke={dino.shade} strokeWidth="7" />
    {dino.feature === 'trike' && <TriceratopsDetails dino={dino} />}
    {dino.feature === 'stego' && <StegosaurusDetails dino={dino} />}
    {dino.feature === 'ankyl' && <AnkylosaurusDetails dino={dino} />}
  </g>
);

const TriceratopsDetails = ({ dino }) => (
  <>
    <path d="M104 61 C113 43 131 41 141 51 C145 57 141 67 131 71 L118 72Z" fill={dino.primary} />
    <path d="M117 56 L123 38 L126 57 M128 55 L139 45 L134 62 M132 62 L151 59 L137 68" fill="#fff5db" />
    <path d="M100 62 L111 48 L118 61" fill={dino.shade} />
    <Eyes x={126} y={57} />
  </>
);

const StegosaurusDetails = ({ dino }) => (
  <>
    {[50, 63, 76, 89, 101].map((x, index) => (
      <path key={x} d={`M${x - 6} 57 L${x} ${30 + (index % 2) * 5} L${x + 7} 59Z`} fill={index % 2 ? dino.belly : '#f7d65c'} />
    ))}
    <path d="M116 68 C129 64 139 67 145 73 C139 80 129 80 116 77Z" fill={dino.primary} />
    <Eyes x={132} y={72} />
    <path d="M25 74 L12 67 M22 78 L9 75 M27 81 L15 84" fill="none" stroke="#f7d65c" strokeWidth="4" />
  </>
);

const AnkylosaurusDetails = ({ dino }) => (
  <>
    {[56, 72, 88, 104].map((x, index) => <path key={x} d={`M${x - 8} 61 L${x} ${52 - (index % 2) * 4} L${x + 8} 64 L${x} 69Z`} fill={dino.shade} />)}
    <path d="M116 67 C128 62 139 66 143 74 C140 82 126 83 115 78Z" fill={dino.primary} />
    <Eyes x={132} y={72} />
    <path d="M23 73 C8 69 4 74 6 80 C9 86 19 84 29 80" fill="none" stroke={dino.shade} strokeWidth="8" />
    <circle cx="7" cy="80" r="8" fill={dino.shade} />
  </>
);

const LongNeckDino = ({ dino }) => (
  <g stroke="#183b45" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5">
    <path d="M31 77 C22 74 14 70 8 63 C19 58 33 62 45 67 C52 55 69 50 93 52 C114 54 125 65 126 76 C122 86 105 91 78 91 C54 91 39 87 31 77Z" fill={dino.paint} />
    <path d="M48 78 C58 69 75 67 93 69 C108 71 115 76 116 82 C106 88 92 90 77 90 C62 90 52 87 48 78Z" fill={dino.belly} stroke="none" opacity="0.9" />
    <path d="M51 86 L49 106 L39 106 L42 87 M71 89 L71 106 L61 106 L61 88 M99 88 L102 106 L92 106 L89 87 M115 83 L123 103 L113 103 L105 87" fill={dino.primary} />
    <path d="M38 70 C40 50 35 32 44 15 C50 4 68 5 75 16 C77 23 72 30 64 32 C57 31 57 24 61 20 C57 18 53 20 51 25 C46 40 52 57 60 66" fill={dino.paint} />
    <path d="M45 34 C47 48 51 59 58 67" fill="none" stroke={dino.belly} strokeWidth="8" opacity="0.8" />
    <path d="M31 77 C18 80 9 76 5 71 C15 68 26 68 41 72" fill="none" stroke={dino.shade} strokeWidth="7" />
    {dino.feature === 'para' && <path d="M57 16 C72 -2 89 0 93 10 C91 21 80 25 69 25" fill={dino.shade} />}
    <Eyes x={64} y={18} />
    {dino.feature === 'brachio' && <path d="M59 9 L64 4 M68 10 L73 6" fill="none" stroke={dino.shade} strokeWidth="3" />}
  </g>
);

const BipedDino = ({ dino }) => (
  <g stroke="#183b45" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5">
    <path d="M65 68 C47 74 26 74 7 60 C18 52 35 53 53 60 C53 48 66 39 84 41 C99 42 108 51 108 67 C106 82 96 89 80 89 C68 88 61 82 65 68Z" fill={dino.paint} />
    <path d="M64 69 C73 59 88 57 101 64 C100 78 92 84 81 84 C70 84 64 79 64 69Z" fill={dino.belly} stroke="none" opacity="0.92" />
    <path d="M61 70 C39 79 18 77 4 64 C17 59 32 61 54 65" fill="none" stroke={dino.shade} strokeWidth="10" />
    <path d="M73 85 L69 107 L57 107 L61 84 M88 85 L96 106 L84 106 L78 85" fill={dino.primary} />
    <path d="M59 106 L52 110 M69 106 L63 111 M92 105 L100 110 M96 105 L106 107" fill="none" stroke="#183b45" strokeWidth="2.5" />
    <path d="M86 61 L73 69 L67 65 L77 55 M91 65 L81 75 L75 71 L84 60" fill={dino.primary} />
    <path d="M92 55 C96 34 116 22 138 31 C151 36 153 50 144 59 C134 67 117 66 104 62Z" fill={dino.paint} />
    <path d="M111 57 C122 54 137 55 146 51 C143 63 130 69 106 63Z" fill={dino.belly} />
    <Eyes x={133} y={42} />
    <path d="M124 59 L129 64 L133 58 L138 63" fill="none" stroke="#fff5db" strokeWidth="2.5" />
    {dino.feature === 'trex' && <><path d="M108 34 C115 25 128 23 136 28" fill="none" stroke={dino.shade} strokeWidth="5" /><path d="M100 44 L109 39" fill="none" stroke={dino.shade} strokeWidth="4" /></>}
    {dino.feature === 'raptor' && <><path d="M94 48 L105 38" fill="none" stroke={dino.shade} strokeWidth="5" /><path d="M63 106 L58 112 M89 106 L85 112" fill="none" stroke="#f7d65c" strokeWidth="3" /></>}
    {dino.feature === 'spino' && <SpinosaurusDetails dino={dino} />}
    {dino.feature === 'dillo' && <><path d="M117 31 L119 13 L128 31 M129 32 L141 17 L138 39" fill={dino.shade} /><path d="M100 43 L110 35" fill="none" stroke={dino.shade} strokeWidth="4" /></>}
  </g>
);

const SpinosaurusDetails = ({ dino }) => (
  <>
    <path d="M61 49 L63 17 L70 37 L76 11 L83 37 L90 15 L96 44" fill={dino.shade} />
    <path d="M119 48 C130 42 145 42 153 48 L144 55 L120 58" fill={dino.primary} />
  </>
);

const Ptero = ({ dino }) => (
  <g stroke="#183b45" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5">
    <path d="M72 61 C47 47 26 36 6 44 C22 58 38 72 67 73Z" fill={dino.paint} />
    <path d="M83 61 C108 43 132 33 154 43 C137 58 116 72 88 73Z" fill={dino.paint} />
    <path d="M68 57 C73 47 85 45 92 55 C97 65 89 75 79 75 C69 73 65 65 68 57Z" fill={dino.primary} />
    <path d="M76 53 L59 38 L66 56" fill={dino.shade} />
    <path d="M61 39 L47 39 L59 45" fill={dino.belly} />
    <Eyes x={67} y={42} />
    <path d="M37 50 L23 38 M48 57 L32 42 M111 51 L128 38 M100 58 L118 44" fill="none" stroke={dino.shade} strokeWidth="2.5" />
    <path d="M75 73 L70 88 M85 73 L91 88" fill="none" stroke={dino.shade} strokeWidth="3" />
  </g>
);

const DinoIcon = ({ species = 'trex', size = 64, className = '' }) => {
  const dino = SPECIES[species] || SPECIES.trex;
  const label = dino.name;
  const gradientId = `dino-main-${species}`;
  const drawable = { ...dino, paint: `url(#${gradientId})` };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 120"
      className={className}
      role="img"
      aria-label={label}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={dino.primary} />
          <stop offset="1" stopColor={dino.shade} />
        </linearGradient>
        <filter id="dino-shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="5" stdDeviation="3" floodColor="#102d34" floodOpacity="0.28" />
        </filter>
      </defs>
      <g filter="url(#dino-shadow)">
        {dino.kind === 'quad' && <QuadDino dino={drawable} />}
        {dino.kind === 'long-neck' && <LongNeckDino dino={drawable} />}
        {dino.kind === 'biped' && <BipedDino dino={drawable} />}
        {dino.kind === 'ptero' && <Ptero dino={drawable} />}
      </g>
    </svg>
  );
};

export default DinoIcon;
