import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Cloud, Home, Palette, Volume2, VolumeX } from 'lucide-react';

const THEME = {
  bg: 'bg-gradient-to-b from-sky-100 via-blue-100 to-blue-200',
  card: 'bg-orange-50',
  primary: 'bg-blue-500',
  secondary: 'bg-orange-400',
  accent: 'bg-green-400',
  text: 'text-slate-700',
  font: 'font-sans',
  button:
    'shadow-[0_6px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-1 transition-all rounded-3xl',
};

const DINOS = [
  {
    id: 't-rex',
    name: 'T-Rex',
    emoji: '🦖',
    fact: 'I have tiny arms but a huge bite! ROAR!',
    x: 18,
    y: 42,
  },
  {
    id: 'stego',
    name: 'Stegosaurus',
    emoji: '🦕',
    fact: 'My back plates work like solar panels to warm me up!',
    x: 68,
    y: 58,
  },
  {
    id: 'trike',
    name: 'Triceratops',
    emoji: '🦏',
    fact: 'I have three horns to protect my nose!',
    x: 42,
    y: 76,
  },
  {
    id: 'ptero',
    name: 'Pterodactyl',
    emoji: '🦅',
    fact: "I'm not a dinosaur, I'm a flying reptile!",
    x: 82,
    y: 26,
  },
  {
    id: 'brachio',
    name: 'Brachiosaurus',
    emoji: '🦒',
    fact: 'I eat leaves from the very top of trees!',
    x: 8,
    y: 70,
  },
];

const PLANETS = [
  {
    name: 'Mercury',
    color: 'bg-gray-400',
    subtitle: 'The speedy little planet',
    facts: [
      'Smallest planet in our solar system.',
      'So close to the Sun that it zooms around quickly.',
      'No air to breathe, so it is very quiet!',
    ],
    stats: [
      { label: 'Order', value: '1st from Sun', emoji: '☀️' },
      { label: 'Day', value: '59 Earth days', emoji: '🕒' },
      { label: 'Year', value: '88 Earth days', emoji: '🗓️' },
      { label: 'Moons', value: '0', emoji: '🌙' },
    ],
  },
  {
    name: 'Venus',
    color: 'bg-yellow-600',
    subtitle: 'The hottest planet',
    facts: [
      'Spins backwards compared to most planets.',
      'Covered in thick, cloudy skies.',
      'The clouds trap heat like a warm blanket.',
    ],
    stats: [
      { label: 'Order', value: '2nd from Sun', emoji: '☀️' },
      { label: 'Day', value: '243 Earth days', emoji: '🕒' },
      { label: 'Year', value: '225 Earth days', emoji: '🗓️' },
      { label: 'Moons', value: '0', emoji: '🌙' },
    ],
  },
  {
    name: 'Earth',
    color: 'bg-blue-500',
    subtitle: 'Our bright blue home',
    facts: [
      'Lots of water and air to breathe.',
      'Only planet we know with life.',
      'One big Moon lights up our night sky.',
    ],
    stats: [
      { label: 'Order', value: '3rd from Sun', emoji: '☀️' },
      { label: 'Day', value: '24 hours', emoji: '🕒' },
      { label: 'Year', value: '365 days', emoji: '🗓️' },
      { label: 'Moons', value: '1', emoji: '🌙' },
    ],
  },
  {
    name: 'Mars',
    color: 'bg-red-500',
    subtitle: 'The red explorer',
    facts: [
      'Dusty and rocky with huge volcanoes.',
      'Robots explore Mars for us!',
      'Home to the biggest volcano: Olympus Mons.',
    ],
    stats: [
      { label: 'Order', value: '4th from Sun', emoji: '☀️' },
      { label: 'Day', value: '24.6 hours', emoji: '🕒' },
      { label: 'Year', value: '687 days', emoji: '🗓️' },
      { label: 'Moons', value: '2', emoji: '🌙' },
    ],
  },
  {
    name: 'Jupiter',
    color: 'bg-orange-300',
    subtitle: 'The giant gas planet',
    facts: [
      'Bigger than all the other planets put together.',
      'Has a giant storm called the Great Red Spot.',
      'Made of gas, so there is no solid ground.',
    ],
    stats: [
      { label: 'Order', value: '5th from Sun', emoji: '☀️' },
      { label: 'Day', value: '10 hours', emoji: '🕒' },
      { label: 'Year', value: '12 Earth years', emoji: '🗓️' },
      { label: 'Moons', value: '95', emoji: '🌙' },
    ],
  },
  {
    name: 'Saturn',
    color: 'bg-yellow-200',
    subtitle: 'The ringed planet',
    facts: [
      'Rings are made of ice and rock chunks.',
      'Has dozens of moons to discover.',
      'Could float in water because it is so light!',
    ],
    stats: [
      { label: 'Order', value: '6th from Sun', emoji: '☀️' },
      { label: 'Day', value: '10.7 hours', emoji: '🕒' },
      { label: 'Year', value: '29 Earth years', emoji: '🗓️' },
      { label: 'Moons', value: '145', emoji: '🌙' },
    ],
  },
];

const GERMAN_COLORS = [
  { name: 'Rot', color: 'red', hex: '#ef4444' },
  { name: 'Blau', color: 'blue', hex: '#3b82f6' },
  { name: 'Grün', color: 'green', hex: '#22c55e' },
  { name: 'Gelb', color: 'yellow', hex: '#eab308' },
  { name: 'Orange', color: 'orange', hex: '#fb923c' },
  { name: 'Lila', color: 'purple', hex: '#a855f7' },
  { name: 'Rosa', color: 'pink', hex: '#ec4899' },
  { name: 'Braun', color: 'brown', hex: '#a16207' },
  { name: 'Schwarz', color: 'black', hex: '#111827' },
  { name: 'Weiß', color: 'white', hex: '#f8fafc' },
];

const buildDinos = () => DINOS.map((dino) => ({ ...dino, hidden: true }));
const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];
const shuffle = (list) => list.slice().sort(() => Math.random() - 0.5);

const useSfx = (enabled) => {
  const ctxRef = useRef(null);

  const playTone = (ctx, { freq, duration, start = 0, type = 'sine', gain = 0.18 }) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.value = 0.0001;

    osc.connect(amp);
    amp.connect(ctx.destination);

    const startAt = now + start;
    osc.start(startAt);
    amp.gain.exponentialRampToValueAtTime(gain, startAt + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.stop(startAt + duration + 0.02);
  };

  const playSweep = (ctx, { from, to, duration, start = 0, type = 'triangle', gain = 0.14 }) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(from, now + start);
    osc.frequency.exponentialRampToValueAtTime(to, now + start + duration);

    amp.gain.value = 0.0001;
    osc.connect(amp);
    amp.connect(ctx.destination);

    const startAt = now + start;
    osc.start(startAt);
    amp.gain.exponentialRampToValueAtTime(gain, startAt + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.stop(startAt + duration + 0.02);
  };

  return (name) => {
    if (!enabled) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }

    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    if (name === 'click') {
      playTone(ctx, { freq: 520, duration: 0.12, gain: 0.12, type: 'triangle' });
    }

    if (name === 'pop') {
      playTone(ctx, { freq: 880, duration: 0.12, gain: 0.18, type: 'square' });
      playTone(ctx, { freq: 660, duration: 0.08, gain: 0.12, start: 0.04, type: 'square' });
    }

    if (name === 'chime') {
      playTone(ctx, { freq: 784, duration: 0.18, gain: 0.16 });
      playTone(ctx, { freq: 1046, duration: 0.18, gain: 0.14, start: 0.12 });
    }

    if (name === 'success') {
      playTone(ctx, { freq: 523, duration: 0.12, gain: 0.16 });
      playTone(ctx, { freq: 659, duration: 0.12, gain: 0.16, start: 0.12 });
      playTone(ctx, { freq: 784, duration: 0.16, gain: 0.16, start: 0.24 });
    }

    if (name === 'oops') {
      playTone(ctx, { freq: 220, duration: 0.18, gain: 0.12, type: 'sine' });
    }

    if (name === 'swish') {
      playSweep(ctx, { from: 900, to: 320, duration: 0.25, gain: 0.14 });
    }
  };
};

const SoundToggle = ({ soundOn, onToggle, className = '' }) => (
  <button
    onClick={onToggle}
    className={`bg-white/90 text-slate-700 p-2 rounded-full shadow-lg hover:scale-105 transition ${className}`}
    aria-label={soundOn ? 'Sound on' : 'Sound off'}
  >
    {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
  </button>
);

const SolarSystem = ({ onBack, playSfx, soundOn, onToggleSound }) => {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const stars = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() > 0.85 ? 3 : 2,
      })),
    [],
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white p-4 relative overflow-hidden">
      <div className="flex justify-between items-center mb-4 z-10">
        <button
          onClick={onBack}
          className="bg-white/20 p-2 rounded-full hover:bg-white/40 transition"
        >
          <Home />
        </button>
        <h2 className="text-2xl font-bold text-yellow-300 font-comic">Space Explorer</h2>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} className="bg-white/20 text-white" />
      </div>

      <div className="absolute inset-0 opacity-50 pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size * 2}px`,
              height: `${star.size * 2}px`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 right-[-20%] w-96 h-96 bg-indigo-500/30 blur-3xl rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-400/30 blur-3xl rounded-full" />
      </div>

      <div className="flex-1 overflow-x-auto flex items-center gap-6 px-8 no-scrollbar z-10 pb-8">
        <div className="flex-shrink-0 w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold shadow-[0_0_80px_rgba(250,204,21,0.9)]">
          SUN
        </div>
        {PLANETS.map((planet) => (
          <button
            key={planet.name}
            onClick={() => {
              playSfx('chime');
              setSelectedPlanet(planet);
            }}
            className="flex flex-col items-center gap-2 group flex-shrink-0 focus:outline-none"
          >
            <div
              className={`w-20 h-20 ${planet.color} rounded-full shadow-lg group-hover:scale-110 transition-transform relative`}
            >
              {planet.name === 'Saturn' && (
                <div className="absolute inset-[-10px] border-4 border-white/50 rounded-full skew-x-12 scale-x-150" />
              )}
            </div>
            <span className="font-bold">{planet.name}</span>
          </button>
        ))}
      </div>

      {selectedPlanet && (
        <div className="absolute bottom-0 left-0 right-0 bg-white text-slate-900 p-6 rounded-t-3xl shadow-2xl animate-bounce-up z-20">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-indigo-600 mb-1">{selectedPlanet.name}</h3>
            <p className="text-slate-500 font-semibold mb-4">{selectedPlanet.subtitle}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {selectedPlanet.stats.map((stat) => (
              <div key={stat.label} className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
                <div className="text-xl">{stat.emoji}</div>
                <div className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</div>
                <div className="font-bold text-slate-700">{stat.value}</div>
              </div>
            ))}
          </div>
          <div className="bg-indigo-50 rounded-2xl p-4 mb-5">
            <ul className="text-slate-700 font-medium space-y-2">
              {selectedPlanet.facts.map((fact) => (
                <li key={fact}>• {fact}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => setSelectedPlanet(null)}
            className={`${THEME.primary} text-white w-full py-3 rounded-full font-bold text-xl ${THEME.button} hover:bg-blue-600`}
          >
            Awesome!
          </button>
        </div>
      )}
    </div>
  );
};

const DinoDetective = ({ onBack, playSfx, soundOn, onToggleSound }) => {
  const [dinos, setDinos] = useState(buildDinos);
  const [foundDino, setFoundDino] = useState(null);
  const foundCount = dinos.filter((dino) => !dino.hidden).length;

  const handleFind = (index) => {
    setDinos((prev) => {
      if (!prev[index].hidden) return prev;
      const next = prev.map((dino, i) => (i === index ? { ...dino, hidden: false } : dino));
      setFoundDino(next[index]);
      playSfx('pop');
      if (next.every((dino) => !dino.hidden)) {
        setTimeout(() => playSfx('success'), 250);
      }
      return next;
    });
  };

  const allFound = dinos.every((dino) => !dino.hidden);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-200 via-green-200 to-green-300 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8 w-24 h-24 bg-yellow-200 rounded-full blur-xl opacity-70" />
        <div className="absolute top-0 right-0 w-52 h-40 bg-white/60 rounded-[50%] blur-2xl" />
        <div className="absolute top-16 left-1/2 w-40 h-28 bg-white/40 rounded-[50%] blur-xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-black text-green-900 drop-shadow-sm">Dino Hide & Seek!</h2>
          <p className="text-green-900/80 font-semibold">Found {foundCount} / {dinos.length}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="z-10 text-center mt-2 px-4">
        <p className="text-green-900 font-medium">Tap the shaking bushes to find friends!</p>
      </div>

      <div className="flex-1 relative z-10">
        <div className="absolute bottom-0 w-full h-28 bg-emerald-700" />
        <div className="absolute bottom-12 left-[-10%] w-64 h-32 bg-emerald-600 rounded-full opacity-90" />
        <div className="absolute bottom-16 right-[-5%] w-72 h-36 bg-emerald-800 rounded-full opacity-90" />
        <div className="absolute bottom-8 left-1/3 w-52 h-24 bg-emerald-700 rounded-full opacity-90" />

        {dinos.map((dino, i) => (
          <button
            key={dino.id}
            onClick={() => handleFind(i)}
            className="absolute transition-all duration-500 focus:outline-none"
            style={{ left: `${dino.x}%`, top: `${dino.y}%` }}
          >
            {dino.hidden ? (
              <div className="relative w-28 h-24 animate-wiggle">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-16 bg-emerald-700 rounded-full shadow-lg" />
                <div className="absolute bottom-6 left-1 w-14 h-12 bg-emerald-600 rounded-full" />
                <div className="absolute bottom-5 right-1 w-16 h-12 bg-emerald-500 rounded-full" />
                <div className="absolute bottom-2 left-8 w-10 h-10 bg-emerald-600 rounded-full" />
                <span className="absolute inset-0 flex items-center justify-center text-3xl opacity-40">🌿</span>
              </div>
            ) : (
              <div className="text-6xl animate-pop-in drop-shadow-2xl transform hover:scale-110 transition-transform">
                {dino.emoji}
              </div>
            )}
          </button>
        ))}
      </div>

      {foundDino && (
        <div className="absolute inset-0 bg-black/40 z-30 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-orange-50 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border-4 border-orange-200 animate-scale-in">
            <div className="text-8xl mb-4">{foundDino.emoji}</div>
            <h3 className="text-3xl font-black text-orange-500 mb-2">{foundDino.name}</h3>
            <div className="bg-white p-4 rounded-xl border-2 border-orange-100 mb-6">
              <p className="text-lg text-slate-700 font-medium">"{foundDino.fact}"</p>
            </div>
            <button
              onClick={() => setFoundDino(null)}
              className="bg-blue-500 text-white w-full py-4 rounded-2xl text-xl font-bold shadow-lg hover:bg-blue-600"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {allFound && !foundDino && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 p-8 rounded-3xl text-center shadow-xl animate-bounce pointer-events-auto">
            <div className="text-6xl mb-2">🏆</div>
            <h2 className="text-3xl font-bold text-green-600">You found everyone!</h2>
            <button
              onClick={() => setDinos(buildDinos())}
              className="mt-4 text-blue-500 font-bold underline"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const JetSkyShapes = ({ onBack, playSfx, soundOn, onToggleSound }) => {
  const canvasRef = useRef(null);
  const [shape, setShape] = useState('Circle');
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let hue = 0;

    const drawSky = () => {
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 10;
      ctx.setLineDash([20, 15]);
      ctx.beginPath();
      if (shape === 'Circle') ctx.arc(canvas.width / 2, canvas.height / 2, 110, 0, Math.PI * 2);
      if (shape === 'Square') ctx.rect(canvas.width / 2 - 110, canvas.height / 2 - 110, 220, 220);
      if (shape === 'Triangle') {
        ctx.moveTo(canvas.width / 2, canvas.height / 2 - 130);
        ctx.lineTo(canvas.width / 2 + 130, canvas.height / 2 + 90);
        ctx.lineTo(canvas.width / 2 - 130, canvas.height / 2 + 90);
        ctx.closePath();
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight - 100;
      drawSky();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = (event) => {
      if (!isDrawing) return;
      event.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = `hsl(${hue}, 100%, 55%)`;
      ctx.lineWidth = 22;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      [lastX, lastY] = [x, y];
      hue += 1;
    };

    const startDrawing = (event) => {
      isDrawing = true;
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      [lastX, lastY] = [clientX - rect.left, clientY - rect.top];
    };

    const stopDrawing = () => {
      isDrawing = false;
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [shape, cleared]);

  return (
    <div className="min-h-screen flex flex-col bg-sky-100">
      <div className="p-4 bg-sky-200 flex justify-between items-center shadow-md z-10">
        <button onClick={onBack} className="bg-white p-2 rounded-full hover:bg-white/80">
          <Home />
        </button>
        <div className="flex gap-2">
          {['Circle', 'Square', 'Triangle'].map((option) => (
            <button
              key={option}
              onClick={() => {
                setShape(option);
                setCleared((prev) => !prev);
                playSfx('swish');
              }}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${
                shape === option ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCleared((prev) => !prev);
              playSfx('swish');
            }}
            className="bg-red-400 text-white p-2 rounded-full hover:bg-red-500"
          >
            <Cloud />
          </button>
          <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute top-4 left-0 w-full text-center text-sky-700 font-bold opacity-70 pointer-events-none">
          Trace the shape with your finger!
        </div>
        <div className="absolute top-16 left-4 w-32 h-16 bg-white/70 rounded-full blur-lg animate-drift-left" />
        <div className="absolute top-24 right-10 w-40 h-20 bg-white/70 rounded-full blur-lg animate-drift-right" />
        <div className="absolute bottom-10 left-12 text-4xl animate-bounce-slow">✈️</div>
        <canvas ref={canvasRef} className="touch-none cursor-crosshair" />
      </div>
    </div>
  );
};

const GermanGarage = ({ onBack, playSfx, soundOn, onToggleSound }) => {
  const [mode, setMode] = useState('paint');
  const [targetColor, setTargetColor] = useState(() => pickRandom(GERMAN_COLORS));
  const [painted, setPainted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [parkRound, setParkRound] = useState(() => {
    const target = pickRandom(GERMAN_COLORS);
    let other = pickRandom(GERMAN_COLORS);
    while (other.name === target.name) other = pickRandom(GERMAN_COLORS);
    return { target, options: shuffle([target, other]) };
  });
  const [parkFeedback, setParkFeedback] = useState('');

  const nextPaint = () => {
    const next = pickRandom(GERMAN_COLORS);
    setTargetColor(next);
    setPainted(false);
    setFeedback('');
  };

  const nextPark = () => {
    const target = pickRandom(GERMAN_COLORS);
    let other = pickRandom(GERMAN_COLORS);
    while (other.name === target.name) other = pickRandom(GERMAN_COLORS);
    setParkRound({ target, options: shuffle([target, other]) });
    setParkFeedback('');
  };

  const handlePaint = (colorObj) => {
    if (colorObj.name === targetColor.name) {
      setPainted(true);
      setFeedback('Sehr gut!');
      playSfx('success');
      setTimeout(nextPaint, 1600);
    } else {
      setFeedback('Try again!');
      playSfx('oops');
    }
  };

  const handlePark = (colorObj) => {
    if (colorObj.name === parkRound.target.name) {
      setParkFeedback('Geparkt!');
      playSfx('success');
      setTimeout(nextPark, 1500);
    } else {
      setParkFeedback('Nope, try the other garage!');
      playSfx('oops');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 via-slate-100 to-orange-100 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 right-10 w-52 h-52 bg-orange-200/60 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-0 w-60 h-60 bg-blue-200/40 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="flex gap-2 bg-white/80 p-1 rounded-full shadow-sm">
          <button
            onClick={() => {
              setMode('paint');
              nextPaint();
              playSfx('click');
            }}
            className={`px-4 py-2 rounded-full text-sm font-bold ${
              mode === 'paint' ? 'bg-blue-500 text-white' : 'text-slate-600'
            }`}
          >
            Paint
          </button>
          <button
            onClick={() => {
              setMode('park');
              nextPark();
              playSfx('click');
            }}
            className={`px-4 py-2 rounded-full text-sm font-bold ${
              mode === 'park' ? 'bg-blue-500 text-white' : 'text-slate-600'
            }`}
          >
            Park
          </button>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-slate-200 text-center mb-8 w-full max-w-md">
          <p className="text-slate-500 mb-2 font-bold uppercase tracking-wider">
            {mode === 'paint' ? 'Mechanic Mission' : 'Garage Mission'}
          </p>
          <h2 className="text-3xl font-black text-slate-800 mb-2">
            {mode === 'paint' ? 'Paint the Car...' : 'Park the Car...'}
          </h2>
          <div className="text-5xl font-black text-blue-600 mb-2">
            {mode === 'paint' ? targetColor.name : parkRound.target.name}
          </div>
          {mode === 'paint' && feedback && (
            <div className="text-xl font-bold text-green-500 animate-bounce">{feedback}</div>
          )}
          {mode === 'park' && parkFeedback && (
            <div className="text-xl font-bold text-green-500 animate-bounce">{parkFeedback}</div>
          )}
        </div>

        {mode === 'paint' && (
          <>
            <div className="relative w-72 h-36 mb-10">
              <div className="absolute inset-0 bg-slate-200 rounded-3xl border-4 border-slate-300 shadow-inner" />
              <div
                className="absolute bottom-4 left-6 right-6 h-20 rounded-2xl shadow-lg transition-colors duration-500"
                style={{ backgroundColor: painted ? targetColor.hex : '#cbd5e1' }}
              />
              <div
                className="absolute bottom-20 left-16 right-16 h-16 rounded-t-full transition-colors duration-500"
                style={{ backgroundColor: painted ? targetColor.hex : '#cbd5e1' }}
              />
              <div className="absolute -bottom-4 left-12 w-12 h-12 bg-slate-800 rounded-full border-4 border-slate-300" />
              <div className="absolute -bottom-4 right-12 w-12 h-12 bg-slate-800 rounded-full border-4 border-slate-300" />
              <div className="absolute bottom-16 left-12 text-4xl animate-bounce-slow">🐯</div>
            </div>

            <div className="grid grid-cols-5 gap-3 w-full max-w-xl">
              {GERMAN_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handlePaint(color)}
                  className="flex flex-col items-center gap-2 group focus:outline-none"
                >
                  <div
                    className="w-14 h-20 rounded-xl shadow-md border-b-4 border-black/10 group-active:scale-95 transition-transform relative overflow-hidden group-hover:brightness-110"
                    style={{ backgroundColor: color.hex }}
                  >
                    <div className="absolute top-0 w-full h-4 bg-white/20" />
                    <div className="absolute bottom-2 right-2 text-white/50">
                      <Palette size={14} />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{color.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {mode === 'park' && (
          <div className="w-full max-w-3xl flex flex-col items-center gap-6">
            <div className="text-6xl">🚗</div>
            <div
              className="w-60 h-20 rounded-3xl shadow-lg border-4 border-white"
              style={{ backgroundColor: parkRound.target.hex }}
            />
            <div className="grid grid-cols-2 gap-6 w-full">
              {parkRound.options.map((option) => (
                <button
                  key={option.name}
                  onClick={() => handlePark(option)}
                  className="group relative bg-white rounded-3xl p-4 shadow-lg border-4 border-slate-200 hover:-translate-y-1 transition"
                >
                  <div className="text-sm font-bold text-slate-500 mb-2">Garage</div>
                  <div className="text-2xl font-black text-slate-700 mb-3">{option.name}</div>
                  <div className="h-24 rounded-2xl border-4 border-slate-200 overflow-hidden relative">
                    <div className="absolute inset-0" style={{ backgroundColor: option.hex }} />
                    <div className="absolute inset-x-4 top-4 h-2 bg-white/30 rounded-full" />
                    <div className="absolute inset-x-4 top-10 h-2 bg-white/30 rounded-full" />
                    <div className="absolute inset-x-4 top-16 h-2 bg-white/30 rounded-full" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MonsterMath = ({ onBack, playSfx, soundOn, onToggleSound }) => {
  const [problem, setProblem] = useState({ a: 2, b: 2, ans: 4 });
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [streak, setStreak] = useState(0);

  const newProblem = () => {
    setSuccess(false);
    const a = Math.ceil(Math.random() * 5);
    const b = Math.ceil(Math.random() * 3);
    setProblem({ a, b, ans: a * b });
  };

  const options = useMemo(() => {
    const optionsSet = new Set([problem.ans]);
    while (optionsSet.size < 3) {
      const delta = Math.ceil(Math.random() * 3);
      const sign = Math.random() > 0.5 ? 1 : -1;
      const candidate = Math.max(1, problem.ans + sign * delta);
      optionsSet.add(candidate);
    }
    return shuffle(Array.from(optionsSet));
  }, [problem.ans]);

  const check = (answer) => {
    if (answer === problem.ans) {
      setSuccess(true);
      setStreak((prev) => prev + 1);
      playSfx('success');
      setTimeout(newProblem, 2000);
    } else {
      setShake(true);
      playSfx('oops');
      setTimeout(() => setShake(false), 450);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-100 via-amber-100 to-orange-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-300/40 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-3 rounded-full shadow-lg z-20 hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-orange-700">Stunt Jump Math</h2>
          <p className="text-orange-700/70 font-semibold">Streak: {streak}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="mt-12 text-center z-10 px-4">
        <div
          className={`inline-flex items-center gap-4 text-6xl font-black text-slate-800 mb-10 ${
            shake ? 'animate-shake' : ''
          }`}
        >
          <div className="bg-white p-4 rounded-2xl shadow-lg border-b-8 border-slate-200">
            {problem.a}
          </div>
          <div className="text-orange-400">×</div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border-b-8 border-slate-200">
            {problem.b}
          </div>
          <div>=</div>
          <div className="w-24 h-24 border-4 border-dashed border-slate-400 rounded-2xl flex items-center justify-center text-slate-400">
            ?
          </div>
        </div>

        <div className="flex justify-center gap-6 flex-wrap">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => check(option)}
              className="w-20 h-20 bg-blue-500 text-white text-3xl font-bold rounded-2xl shadow-[0_6px_0_rgb(29,78,216)] active:shadow-none active:translate-y-2 transition-all hover:bg-blue-600"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`absolute bottom-14 left-10 text-[80px] transition-transform duration-1000 ${
          success ? 'translate-x-[500px] -translate-y-[200px] rotate-[360deg]' : 'translate-x-0'
        }`}
      >
        🛻
      </div>
      <div className="absolute bottom-0 w-full h-14 bg-orange-900/20" />

      {success && (
        <div className="absolute top-1/2 left-0 right-0 text-center text-5xl font-black text-green-500 animate-bounce">
          WACKADOO!
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [screen, setScreen] = useState('menu');
  const [soundOn, setSoundOn] = useState(true);
  const playSfx = useSfx(soundOn);

  if (screen !== 'menu') {
    if (screen === 'solar') {
      return (
        <SolarSystem
          onBack={() => setScreen('menu')}
          playSfx={playSfx}
          soundOn={soundOn}
          onToggleSound={() => setSoundOn((prev) => !prev)}
        />
      );
    }
    if (screen === 'dino') {
      return (
        <DinoDetective
          onBack={() => setScreen('menu')}
          playSfx={playSfx}
          soundOn={soundOn}
          onToggleSound={() => setSoundOn((prev) => !prev)}
        />
      );
    }
    if (screen === 'jet') {
      return (
        <JetSkyShapes
          onBack={() => setScreen('menu')}
          playSfx={playSfx}
          soundOn={soundOn}
          onToggleSound={() => setSoundOn((prev) => !prev)}
        />
      );
    }
    if (screen === 'german') {
      return (
        <GermanGarage
          onBack={() => setScreen('menu')}
          playSfx={playSfx}
          soundOn={soundOn}
          onToggleSound={() => setSoundOn((prev) => !prev)}
        />
      );
    }
    if (screen === 'math') {
      return (
        <MonsterMath
          onBack={() => setScreen('menu')}
          playSfx={playSfx}
          soundOn={soundOn}
          onToggleSound={() => setSoundOn((prev) => !prev)}
        />
      );
    }
  }

  return (
    <div
      className={`min-h-screen w-full ${THEME.bg} ${THEME.font} flex flex-col items-center p-6 relative overflow-hidden`}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/50 blur-3xl" />
        <div className="absolute top-32 right-8 h-40 w-40 rounded-full bg-orange-200/60 blur-2xl" />
        <div className="absolute bottom-16 left-10 h-52 w-52 rounded-full bg-green-200/60 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-blue-200/70 blur-3xl" />
      </div>

      <div className="absolute top-6 right-6 z-20">
        <SoundToggle soundOn={soundOn} onToggle={() => setSoundOn((prev) => !prev)} />
      </div>

      <div className="text-center mt-8 mb-12 animate-fade-in-down relative z-10">
        <div className="flex justify-center gap-4 text-5xl mb-4 animate-bounce-slow">
          <span>🐯</span>
          <span>🔧</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-800 tracking-tight drop-shadow-sm">
          Galaxy <span className="text-blue-500">Garage</span>
        </h1>
        <p className="text-slate-600 font-bold text-xl mt-2 bg-white/60 inline-block px-6 py-2 rounded-full">
          Academy for Kids
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl relative z-10">
        <MenuCard
          icon="🦕"
          title="Dino Detective"
          desc="Find hidden dinosaurs!"
          color="bg-green-400"
          onClick={() => {
            playSfx('click');
            setScreen('dino');
          }}
        />

        <MenuCard
          icon="✈️"
          title="Sky Shapes"
          desc="Draw with a Jet!"
          color="bg-sky-400"
          onClick={() => {
            playSfx('click');
            setScreen('jet');
          }}
        />

        <MenuCard
          icon="🪐"
          title="Solar System"
          desc="Visit the planets"
          color="bg-indigo-400"
          onClick={() => {
            playSfx('click');
            setScreen('solar');
          }}
        />

        <MenuCard
          icon="🎨"
          title="German Garage"
          desc="Learn colors in German"
          color="bg-red-400"
          onClick={() => {
            playSfx('click');
            setScreen('german');
          }}
        />

        <MenuCard
          icon="🛻"
          title="Monster Math"
          desc="Stunt Jump Counting"
          color="bg-orange-400"
          onClick={() => {
            playSfx('click');
            setScreen('math');
          }}
          span="md:col-span-2 lg:col-span-1"
        />
      </div>

      <div className="mt-12 text-slate-500 font-medium text-sm flex gap-2 items-center relative z-10">
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        Playful Learning Active
      </div>
    </div>
  );
}

const MenuCard = ({ icon, title, desc, color, onClick, span = '' }) => (
  <button
    onClick={onClick}
    className={`
      ${span} relative group overflow-hidden rounded-[2.5rem] p-8 text-left transition-all duration-300
      ${color} shadow-[0_10px_0_rgba(0,0,0,0.1)] hover:shadow-[0_15px_0_rgba(0,0,0,0.1)]
      hover:-translate-y-1 active:translate-y-2 active:shadow-none tap-highlight-none
    `}
  >
    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="text-6xl mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 origin-left">
        {icon}
      </div>
      <div>
        <h2 className="text-3xl font-black text-white leading-tight mb-1 drop-shadow-md">{title}</h2>
        <p className="text-white/90 font-bold text-lg">{desc}</p>
      </div>
      <div className="absolute bottom-8 right-8 bg-white/30 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="text-white" />
      </div>
    </div>
  </button>
);
