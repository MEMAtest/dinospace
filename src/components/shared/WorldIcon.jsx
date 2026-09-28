import '../home/discoveryVisuals.css';

const WorldArtwork = ({ id, uid }) => {
  if (id === 'read-write') return (
    <g className="world-artwork">
      <ellipse cx="110" cy="145" rx="76" ry="10" fill="#1e224f" opacity=".17" />
      <path d="M35 48c24-11 48-7 75 8v73c-26-15-52-20-76-8V49Z" fill={`url(#${uid}-cover)`} stroke="#8f2443" strokeWidth="4" strokeLinejoin="round" />
      <path d="M185 48c-24-11-48-7-75 8v73c26-15 52-20 76-8V49Z" fill={`url(#${uid}-cover)`} stroke="#8f2443" strokeWidth="4" strokeLinejoin="round" />
      <path d="M45 54c20-7 40-3 59 8v54c-19-10-39-14-59-8V54Zm130 0c-20-7-40-3-59 8v54c19-10 39-14 59-8V54Z" fill={`url(#${uid}-paper)`} stroke="#fff8e9" strokeWidth="3" strokeLinejoin="round" />
      <path d="M110 57v72" stroke="#9d3154" strokeWidth="6" strokeLinecap="round" />
      <path d="M58 71h34m-34 12h34m-34 12h27m37-24h34m-34 12h34m-34 12h27" stroke="#f1a8a6" strokeWidth="4" strokeLinecap="round" />
      <path d="m103 42 11 12 11-12v31l-11-7-11 7V42Z" fill={`url(#${uid}-gold)`} stroke="#bd7b18" strokeWidth="3" strokeLinejoin="round" />
      <path d="M48 55c18-6 34-4 50 4" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" />
    </g>
  );

  if (id === 'maths') return (
    <g className="world-artwork">
      <ellipse cx="110" cy="145" rx="74" ry="10" fill="#1e224f" opacity=".17" />
      <g transform="rotate(-9 72 87)"><rect x="34" y="42" width="62" height="78" rx="15" fill="#c45319" /><rect x="34" y="34" width="62" height="76" rx="15" fill={`url(#${uid}-orange)`} stroke="#a74418" strokeWidth="4" /><path d="M44 45h39" stroke="#fff" strokeOpacity=".45" strokeWidth="5" strokeLinecap="round" /><text x="65" y="91" textAnchor="middle" fill="#fff8dd" fontSize="48" fontWeight="900">2</text></g>
      <g transform="rotate(8 139 88)"><rect x="112" y="54" width="67" height="76" rx="16" fill="#185d90" /><rect x="112" y="45" width="67" height="76" rx="16" fill={`url(#${uid}-blue)`} stroke="#164c7d" strokeWidth="4" /><path d="M122 57h42" stroke="#fff" strokeOpacity=".45" strokeWidth="5" strokeLinecap="round" /><text x="145" y="101" textAnchor="middle" fill="#f5fbff" fontSize="46" fontWeight="900">5</text></g>
      <circle cx="112" cy="31" r="16" fill={`url(#${uid}-gold)`} stroke="#bd7b18" strokeWidth="3" /><text x="112" y="38" textAnchor="middle" fill="#70410d" fontSize="20" fontWeight="900">+</text>
    </g>
  );

  if (id === 'explore') return (
    <g className="world-artwork">
      <ellipse cx="110" cy="146" rx="70" ry="10" fill="#1e224f" opacity=".17" />
      <path d="M41 95c4-39 36-64 74-60 36 4 61 34 57 69-4 35-35 58-72 54-36-4-63-29-59-63Z" fill={`url(#${uid}-ocean)`} stroke="#0b4d87" strokeWidth="5" />
      <path d="M72 57c10-9 23-8 28-1l-7 11-13 3-2 13-13 4-8-8 5-14Zm56 17 11 3 8 11-8 8-4 19-10 5-7-13-1-18-8-9 8-9Zm-33 39 14 3 8 12-5 17-12 4-11-9 1-15Z" fill={`url(#${uid}-land)`} stroke="#55964f" strokeWidth="2" strokeLinejoin="round" />
      <path d="M46 91c42 15 78 16 120 3M75 43c-15 31-15 76 2 111m61-105c15 31 15 66-2 94" fill="none" stroke="#d9f7ff" strokeOpacity=".65" strokeWidth="3" />
      <path d="M69 139c28 12 57 13 84 0" fill="none" stroke="#e8fbff" strokeWidth="7" strokeLinecap="round" />
      <path d="M112 147v9m-25 0h50" stroke="#6f4b36" strokeWidth="7" strokeLinecap="round" />
      <path d="M39 51c17-24 42-37 73-40" fill="none" stroke="#ffd95b" strokeWidth="4" strokeDasharray="2 9" strokeLinecap="round" />
      <path d="m39 31 4 9 10 1-7 6 2 10-9-5-8 5 2-10-8-6 10-1Z" fill={`url(#${uid}-gold)`} stroke="#d38b23" strokeWidth="2" />
    </g>
  );

  if (id === 'creative') return (
    <g className="world-artwork">
      <ellipse cx="109" cy="145" rx="76" ry="10" fill="#1e224f" opacity=".17" />
      <path d="M42 90c-8-24 5-54 34-65 30-12 77-3 94 20 15 21 0 38-22 39-15 1-22 4-23 16-1 15-13 24-31 25-24 1-44-13-52-35Z" fill={`url(#${uid}-palette)`} stroke="#67319a" strokeWidth="5" />
      <circle cx="75" cy="49" r="10" fill={`url(#${uid}-gold)`} stroke="#c47a21" strokeWidth="2" />
      <circle cx="106" cy="37" r="10" fill="#61d9eb" stroke="#2786a4" strokeWidth="2" />
      <circle cx="137" cy="49" r="10" fill="#fd718d" stroke="#bd3d68" strokeWidth="2" />
      <circle cx="155" cy="75" r="10" fill="#f8d658" stroke="#c38b19" strokeWidth="2" />
      <ellipse cx="106" cy="89" rx="12" ry="9" fill="#50287e" stroke="#3e2064" strokeWidth="3" />
      <g transform="rotate(31 153 42)"><rect x="147" y="5" width="16" height="77" rx="7" fill={`url(#${uid}-brush)`} stroke="#863147" strokeWidth="3" /><path d="M147 16h16" stroke="#fff" strokeOpacity=".48" strokeWidth="4" /><path d="m147 6 8-12 8 12Z" fill="#f4d6b0" stroke="#9f6b42" strokeWidth="3" /></g>
      <path d="m42 31 4 8 9 1-7 6 2 9-8-5-8 5 2-9-8-6 10-1Z" fill="#fff5a9" />
    </g>
  );

  return (
    <g className="world-artwork">
      <ellipse cx="110" cy="145" rx="74" ry="10" fill="#1e224f" opacity=".17" />
      <path d="M79 34c-17-6-30 6-27 21-16 8-14 29 1 35-5 16 8 30 24 27 8 15 31 15 39 0 16 4 30-11 24-26 16-10 11-32-6-37 2-17-15-29-30-20-7-12-24-12-31 0Z" fill={`url(#${uid}-brain)`} stroke="#592d91" strokeWidth="5" />
      <path d="M107 28v91M70 48c13 2 20 10 20 22m30-21c-11 2-17 10-17 21M65 86c13-3 23 2 26 14m36-17c-13-1-20 5-23 16" fill="none" stroke="#e9d8ff" strokeWidth="6" strokeLinecap="round" />
      <path d="M62 65h17c-4-10 10-15 15-6 2 3 1 5-1 7h17v17c10-4 15 10 6 15-3 2-5 1-7-1v17H91V98c-10 4-15-10-6-15 3-2 5-1 7 1V66Z" fill={`url(#${uid}-piece)`} stroke="#4f287f" strokeWidth="3" strokeLinejoin="round" />
      <path d="m160 36 4 9 10 1-7 6 2 10-9-5-8 5 2-10-8-6 10-1Z" fill={`url(#${uid}-gold)`} stroke="#bb7d18" strokeWidth="2" />
      <circle cx="48" cy="46" r="5" fill="#fff" /><circle cx="166" cy="98" r="4" fill="#fff" />
    </g>
  );
};

const WorldIcon = ({ world, compact = false }) => {
  const uid = `learning-world-${world.id.replace(/[^a-z0-9]/gi, '-')}`;
  return (
    <span className={`discovery-world-icon ${compact ? 'discovery-world-icon--compact' : ''}`} role="img" aria-label={`${world.title} icon`}>
      <svg viewBox="0 0 220 160" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${uid}-cover`} x1="0" y1="0" x2=".9" y2="1"><stop stopColor="#ff91a8" /><stop offset="1" stopColor="#df3975" /></linearGradient>
          <linearGradient id={`${uid}-paper`} x1="0" y1="0" x2=".9" y2="1"><stop stopColor="#fffef5" /><stop offset="1" stopColor="#ffe6c7" /></linearGradient>
          <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#fff293" /><stop offset="1" stopColor="#ffad32" /></linearGradient>
          <linearGradient id={`${uid}-orange`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#ffc766" /><stop offset="1" stopColor="#f47727" /></linearGradient>
          <linearGradient id={`${uid}-blue`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#68d9ff" /><stop offset="1" stopColor="#2478d4" /></linearGradient>
          <linearGradient id={`${uid}-ocean`} x1="0" y1="0" x2=".9" y2="1"><stop stopColor="#70e5ff" /><stop offset=".55" stopColor="#248bd6" /><stop offset="1" stopColor="#1656ac" /></linearGradient>
          <linearGradient id={`${uid}-land`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#cbef73" /><stop offset="1" stopColor="#57ad62" /></linearGradient>
          <linearGradient id={`${uid}-palette`} x1="0" y1="0" x2=".9" y2="1"><stop stopColor="#e9a2ff" /><stop offset="1" stopColor="#873fd0" /></linearGradient>
          <linearGradient id={`${uid}-brush`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#ffbc60" /><stop offset="1" stopColor="#ec5277" /></linearGradient>
          <linearGradient id={`${uid}-brain`} x1="0" y1="0" x2=".9" y2="1"><stop stopColor="#d5a6ff" /><stop offset="1" stopColor="#8548d2" /></linearGradient>
          <linearGradient id={`${uid}-piece`} x1="0" y1="0" x2=".9" y2="1"><stop stopColor="#ffe578" /><stop offset="1" stopColor="#ff9d42" /></linearGradient>
        </defs>
        <WorldArtwork id={world.id} uid={uid} />
      </svg>
    </span>
  );
};

export default WorldIcon;
