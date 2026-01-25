import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const FRIENDLY_VOICE_NAMES = [
  'Samantha',
  'Victoria',
  'Ava',
  'Allison',
  'Google US English',
  'Google UK English Female',
  'Karen',
  'Moira',
  'Zoe',
];

const BURST_EMOJIS = ['✨', '⭐️', '🎆', '🎇', '🌟'];

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

const LETTERS = [
  { letter: 'A', word: 'Apple', emoji: '🍎' },
  { letter: 'B', word: 'Ball', emoji: '⚽️' },
  { letter: 'C', word: 'Cat', emoji: '🐱' },
  { letter: 'D', word: 'Dog', emoji: '🐶' },
  { letter: 'E', word: 'Elephant', emoji: '🐘' },
  { letter: 'F', word: 'Fish', emoji: '🐠' },
  { letter: 'G', word: 'Giraffe', emoji: '🦒' },
  { letter: 'H', word: 'Hat', emoji: '🎩' },
  { letter: 'L', word: 'Lion', emoji: '🦁' },
  { letter: 'M', word: 'Moon', emoji: '🌙' },
];

const TRACE_LETTERS = LETTERS.slice(0, 6);

const PHONICS_ITEMS = [
  { letter: 'A', word: 'Apple', emoji: '🍎', sound: 'ah' },
  { letter: 'B', word: 'Ball', emoji: '⚽️', sound: 'buh' },
  { letter: 'C', word: 'Cat', emoji: '🐱', sound: 'kuh' },
  { letter: 'D', word: 'Dog', emoji: '🐶', sound: 'duh' },
  { letter: 'F', word: 'Fish', emoji: '🐠', sound: 'fff' },
  { letter: 'G', word: 'Goat', emoji: '🐐', sound: 'guh' },
  { letter: 'L', word: 'Lion', emoji: '🦁', sound: 'lll' },
  { letter: 'M', word: 'Moon', emoji: '🌙', sound: 'mmm' },
  { letter: 'P', word: 'Pizza', emoji: '🍕', sound: 'puh' },
  { letter: 'S', word: 'Sun', emoji: '☀️', sound: 'sss' },
];

const MEMORY_EMOJIS = ['🐶', '🦊', '🐸', '🐵', '🦄', '🐙'];

const PATTERN_TOKENS = ['🔴', '🔵', '🟡', '🟢', '⭐️', '🌙', '🟣', '🟠', '☀️'];

const PATTERN_ROUNDS = [
  { sequence: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', label: 'Red, Blue pattern' },
  { sequence: ['🟡', '🟡', '🔵', '🟡', '🟡'], answer: '🔵', label: 'Yellow, Yellow, Blue' },
  { sequence: ['⭐️', '🌙', '☀️', '⭐️', '🌙'], answer: '☀️', label: 'Star, Moon, Sun' },
  { sequence: ['🟢', '🟣', '🟢', '🟣', '🟢'], answer: '🟣', label: 'Green, Purple' },
  { sequence: ['🟠', '🟠', '🔵', '🟠'], answer: '🟠', label: 'Orange, Orange, Blue' },
  { sequence: ['🔵', '🟢', '🟡', '🔵', '🟢'], answer: '🟡', label: 'Blue, Green, Yellow' },
  { sequence: ['🌙', '🌙', '⭐️', '🌙', '🌙'], answer: '⭐️', label: 'Moon, Moon, Star' },
  { sequence: ['🟣', '🟣', '🟣', '🟢'], answer: '🟢', label: 'Purple then Green' },
];

const buildDinos = () => DINOS.map((dino) => ({ ...dino, hidden: true }));
const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];
const shuffle = (list) => list.slice().sort(() => Math.random() - 0.5);

const createBursts = () =>
  Array.from({ length: 14 }, (_, i) => ({
    id: `${Date.now()}-${i}`,
    emoji: pickRandom(BURST_EMOJIS),
    left: Math.random() * 90 + 5,
    top: Math.random() * 70 + 10,
    delay: Math.random() * 0.3,
    size: Math.random() > 0.7 ? 'text-4xl' : 'text-3xl',
  }));

const buildLetterRound = () => {
  const target = pickRandom(LETTERS);
  const options = shuffle([
    target,
    ...shuffle(LETTERS.filter((item) => item.letter !== target.letter)).slice(0, 3),
  ]);
  return { target, options };
};

const buildMemoryDeck = () =>
  shuffle(
    MEMORY_EMOJIS.flatMap((emoji, index) => [
      { id: `${emoji}-${index}-a`, emoji, flipped: false, matched: false },
      { id: `${emoji}-${index}-b`, emoji, flipped: false, matched: false },
    ]),
  );

const buildParkRound = () => {
  const target = pickRandom(GERMAN_COLORS);
  let other = pickRandom(GERMAN_COLORS);
  while (other.name === target.name) other = pickRandom(GERMAN_COLORS);
  return { target, options: shuffle([target, other]) };
};

const buildPatternRound = () => {
  const round = pickRandom(PATTERN_ROUNDS);
  const decoys = shuffle(PATTERN_TOKENS.filter((token) => token !== round.answer)).slice(0, 2);
  return { ...round, options: shuffle([round.answer, ...decoys]) };
};

const buildPhonicsRound = () => {
  const target = pickRandom(PHONICS_ITEMS);
  const options = shuffle([
    target,
    ...shuffle(PHONICS_ITEMS.filter((item) => item.letter !== target.letter)).slice(0, 2),
  ]);
  return { target, options };
};

const pickFriendlyVoice = (voices, lang) => {
  if (!voices || voices.length === 0) return null;
  const langPrefix = lang?.split('-')[0]?.toLowerCase();
  const matching = langPrefix ? voices.filter((voice) => voice.lang?.toLowerCase().startsWith(langPrefix)) : voices;
  const pool = matching.length ? matching : voices;
  const friendly = pool.find((voice) =>
    FRIENDLY_VOICE_NAMES.some((name) => voice.name.toLowerCase().includes(name.toLowerCase())),
  );
  const gentle = pool.find((voice) => /female|child|junior/i.test(voice.name));
  return friendly || gentle || pool[0];
};

const useSfx = (enabled) => {
  const ctxRef = useRef(null);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const playTone = useCallback((ctx, { freq, duration, start = 0, type = 'sine', gain = 0.18 }) => {
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
  }, []);

  const playSweep = useCallback((ctx, { from, to, duration, start = 0, type = 'triangle', gain = 0.14 }) => {
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
  }, []);

  return useCallback(
    (name) => {
      if (!enabledRef.current) return;
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

      if (name === 'flip') {
        playTone(ctx, { freq: 620, duration: 0.08, gain: 0.12, type: 'triangle' });
      }

      if (name === 'sparkle') {
        playTone(ctx, { freq: 880, duration: 0.12, gain: 0.15, type: 'sine' });
        playTone(ctx, { freq: 1320, duration: 0.16, gain: 0.12, start: 0.08, type: 'triangle' });
      }

      if (name === 'launch') {
        playSweep(ctx, { from: 300, to: 1200, duration: 0.4, gain: 0.2, type: 'sawtooth' });
        playTone(ctx, { freq: 960, duration: 0.08, gain: 0.1, start: 0.2, type: 'square' });
      }
    },
    [playSweep, playTone],
  );
};

const useVoice = (enabled) => {
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  return useCallback((text, { lang = 'en-US', rate = 0.92, pitch = 1.18 } = {}) => {
    if (!enabledRef.current) return;
    if (!text) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    const preferred = pickFriendlyVoice(voices, lang);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1;
    if (preferred) utterance.voice = preferred;

    synth.cancel();
    synth.speak(utterance);
  }, []);
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

const CelebrationOverlay = ({ celebration }) => {
  if (!celebration) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
      {celebration.bursts.map((burst) => (
        <span
          key={burst.id}
          className={`absolute ${burst.size} animate-float-up`}
          style={{ left: `${burst.left}%`, top: `${burst.top}%`, animationDelay: `${burst.delay}s` }}
        >
          {burst.emoji}
        </span>
      ))}
      <div className="relative z-10 bg-white/95 rounded-3xl px-10 py-8 text-center shadow-2xl border-4 border-yellow-200 animate-pop-in">
        <div className="text-5xl mb-2">🎉</div>
        <div className="text-3xl font-black text-amber-600">{celebration.message}</div>
        <div className="mt-2 text-lg font-semibold text-slate-700">+{celebration.points} stars</div>
        <div className="text-slate-500 font-bold">Total: {celebration.total}</div>
      </div>
    </div>
  );
};

const SolarSystem = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
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

  useEffect(() => {
    if (!selectedPlanet) return;
    speak(
      `${selectedPlanet.name}. ${selectedPlanet.subtitle}. ${selectedPlanet.facts[0]} ${selectedPlanet.facts[1]}`,
    );
  }, [selectedPlanet, speak]);

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
            onClick={() => speak(`${selectedPlanet.name}. ${selectedPlanet.facts.join(' ')}`)}
            className="mb-3 text-blue-600 font-semibold"
          >
            🔊 Hear it again
          </button>
          <button
            onClick={() => {
              onCelebrate('Space explorer!', 4);
              setSelectedPlanet(null);
            }}
            className={`${THEME.primary} text-white w-full py-3 rounded-full font-bold text-xl ${THEME.button} hover:bg-blue-600`}
          >
            Awesome!
          </button>
        </div>
      )}
    </div>
  );
};

const DinoDetective = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [dinos, setDinos] = useState(buildDinos);
  const [foundDino, setFoundDino] = useState(null);
  const foundCount = dinos.filter((dino) => !dino.hidden).length;

  const handleFind = (index) => {
    setDinos((prev) => {
      if (!prev[index].hidden) return prev;
      const next = prev.map((dino, i) => (i === index ? { ...dino, hidden: false } : dino));
      setFoundDino(next[index]);
      playSfx('pop');
      onCelebrate('Nice find!', 4);
      if (next.every((dino) => !dino.hidden)) {
        setTimeout(() => playSfx('success'), 250);
        setTimeout(() => onCelebrate('Dino champ!', 12), 350);
      }
      return next;
    });
  };

  const allFound = dinos.every((dino) => !dino.hidden);

  useEffect(() => {
    if (foundDino) {
      speak(`You found ${foundDino.name}. ${foundDino.fact}`);
    }
  }, [foundDino, speak]);

  useEffect(() => {
    if (allFound && !foundDino) {
      speak('You found everyone! Great searching!');
    }
  }, [allFound, foundDino, speak]);

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
          <p className="text-green-900/80 font-semibold">
            Found {foundCount} / {dinos.length}
          </p>
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

const JetSkyShapes = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const canvasRef = useRef(null);
  const [shape, setShape] = useState('Circle');
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    speak(`Trace the ${shape}.`);
  }, [shape, speak]);

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
          <button
            onClick={() => {
              onCelebrate('Well traced!', 6);
              playSfx('sparkle');
              speak('Well done!');
            }}
            className="bg-white text-sky-700 px-3 py-2 rounded-full font-bold shadow-lg"
          >
            Done!
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

const GermanGarage = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [mode, setMode] = useState('paint');
  const [targetColor, setTargetColor] = useState(() => pickRandom(GERMAN_COLORS));
  const [painted, setPainted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [parkRound, setParkRound] = useState(buildParkRound);
  const [parkFeedback, setParkFeedback] = useState('');

  useEffect(() => {
    if (mode === 'paint') {
      speak(`Finde ${targetColor.name}`, { lang: 'de-DE', rate: 0.85, pitch: 1.05 });
    } else {
      speak(`Parke in ${parkRound.target.name}`, { lang: 'de-DE', rate: 0.85, pitch: 1.05 });
    }
  }, [mode, targetColor.name, parkRound.target.name, speak]);

  const nextPaint = () => {
    const next = pickRandom(GERMAN_COLORS);
    setTargetColor(next);
    setPainted(false);
    setFeedback('');
  };

  const nextPark = () => {
    setParkRound(buildParkRound());
    setParkFeedback('');
  };

  const handlePaint = (colorObj) => {
    if (colorObj.name === targetColor.name) {
      setPainted(true);
      setFeedback('Sehr gut!');
      playSfx('success');
      onCelebrate('Great color!', 5);
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
      onCelebrate('Perfect parking!', 6);
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

const MonsterMath = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
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

  useEffect(() => {
    speak(`What is ${problem.a} times ${problem.b}?`);
  }, [problem.a, problem.b, speak]);

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
      onCelebrate('Well done!', 6);
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

const LetterLaunch = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [round, setRound] = useState(buildLetterRound);
  const [launching, setLaunching] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [stars, setStars] = useState(0);

  const promptText = `${round.target.letter}. ${round.target.letter} is for ${round.target.word}.`;

  const sayPrompt = useCallback(() => {
    speak(`Find the letter ${promptText}`);
  }, [promptText, speak]);

  useEffect(() => {
    sayPrompt();
  }, [sayPrompt]);

  const nextRound = () => {
    setRound(buildLetterRound());
    setLaunching(false);
    setFeedback('');
  };

  const handlePick = (option) => {
    if (option.letter === round.target.letter) {
      setLaunching(true);
      setFeedback('Blast off!');
      setStars((prev) => prev + 1);
      playSfx('launch');
      playSfx('success');
      onCelebrate('Letter found!', 6);
      setTimeout(nextRound, 1400);
    } else {
      setFeedback('Try again!');
      playSfx('oops');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-200 via-sky-100 to-indigo-100 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-44 h-24 bg-white/70 rounded-full blur-2xl animate-drift-left" />
        <div className="absolute top-24 right-6 w-52 h-28 bg-white/70 rounded-full blur-2xl animate-drift-right" />
        <div className="absolute bottom-20 left-6 w-64 h-32 bg-white/60 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-sky-700">Letter Launch</h2>
          <p className="text-sky-700/70 font-semibold">Stars: {stars}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        <div className="bg-white/90 p-6 rounded-3xl shadow-xl border-4 border-sky-200 text-center mb-6 w-full max-w-md">
          <p className="text-slate-500 mb-2 font-bold uppercase tracking-wider">Launch Mission</p>
          <div className="text-7xl font-black text-sky-700 mb-2">{round.target.letter}</div>
          <div className="text-2xl font-bold text-slate-700">
            {round.target.word} {round.target.emoji}
          </div>
          <button onClick={sayPrompt} className="mt-4 text-sky-600 font-semibold">
            🔊 Hear the letter
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {round.options.map((option) => (
            <button
              key={option.letter}
              onClick={() => handlePick(option)}
              className="bg-white text-slate-800 text-4xl font-black rounded-3xl py-6 shadow-lg border-4 border-sky-200 hover:-translate-y-1 transition"
            >
              {option.letter}
            </button>
          ))}
        </div>

        {feedback && <div className="mt-4 text-xl font-bold text-indigo-500 animate-bounce">{feedback}</div>}

        <div className="relative w-full max-w-md h-40 mt-6">
          <div className="absolute bottom-0 w-full h-10 bg-sky-300/70 rounded-full" />
          <div
            className="absolute bottom-6 left-6 text-6xl transition-transform duration-1000"
            style={{
              transform: launching ? 'translate(220px, -120px) rotate(-10deg)' : 'translate(0, 0)',
            }}
          >
            🚀
          </div>
          <div
            className={`absolute bottom-24 right-12 text-3xl transition-opacity duration-500 ${
              launching ? 'opacity-100' : 'opacity-0'
            }`}
          >
            ✨✨
          </div>
        </div>
      </div>
    </div>
  );
};

const MemoryMatch = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [deck, setDeck] = useState(buildMemoryDeck);
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [round, setRound] = useState(1);

  const matches = deck.filter((card) => card.matched).length / 2;

  const resetDeck = () => {
    setDeck(buildMemoryDeck());
    setFlipped([]);
    setMoves(0);
    setLocked(false);
    setRound((prev) => prev + 1);
  };

  useEffect(() => {
    speak('Find the matching pairs.');
  }, [round, speak]);

  useEffect(() => {
    if (matches === MEMORY_EMOJIS.length) {
      speak('You matched them all. Fantastic memory!');
      playSfx('success');
      onCelebrate('Memory master!', 12);
    }
  }, [matches, onCelebrate, playSfx, speak]);

  const handleFlip = (index) => {
    if (locked) return;
    setDeck((prev) => {
      if (prev[index].flipped || prev[index].matched) return prev;
      const next = prev.map((card, i) => (i === index ? { ...card, flipped: true } : card));
      return next;
    });
    setFlipped((prev) => (prev.includes(index) ? prev : [...prev, index]));
    playSfx('flip');
  };

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [first, second] = flipped;
    setLocked(true);
    setMoves((prev) => prev + 1);

    if (deck[first].emoji === deck[second].emoji) {
      setDeck((prev) =>
        prev.map((card, i) =>
          i === first || i === second ? { ...card, matched: true } : card,
        ),
      );
      setFlipped([]);
      setLocked(false);
      playSfx('sparkle');
      onCelebrate('Match!', 4);
    } else {
      setTimeout(() => {
        setDeck((prev) =>
          prev.map((card, i) =>
            i === first || i === second ? { ...card, flipped: false } : card,
          ),
        );
        setFlipped([]);
        setLocked(false);
        playSfx('oops');
      }, 700);
    }
  }, [deck, flipped, onCelebrate, playSfx]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-100 via-pink-100 to-rose-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 right-8 w-40 h-40 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200/60 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-rose-600">Memory Match</h2>
          <p className="text-rose-600/70 font-semibold">
            Matches: {matches} · Moves: {moves}
          </p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        <button onClick={() => speak('Find the matching pairs.')} className="mb-4 text-rose-600 font-semibold">
          🔊 Hear the mission
        </button>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 w-full max-w-md">
          {deck.map((card, index) => {
            const isFaceUp = card.flipped || card.matched;
            return (
              <div key={card.id} style={{ perspective: '900px' }}>
                <button
                  onClick={() => handleFlip(index)}
                  className="relative w-24 h-28 sm:w-24 sm:h-32"
                >
                  <div
                    className="absolute inset-0 transition-transform duration-500"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFaceUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    <div
                      className="absolute inset-0 bg-white rounded-2xl border-4 border-rose-200 shadow-lg flex items-center justify-center text-3xl"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      🌈
                    </div>
                    <div
                      className="absolute inset-0 bg-rose-500 rounded-2xl border-4 border-rose-200 shadow-lg flex items-center justify-center text-4xl"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      {card.emoji}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {matches === MEMORY_EMOJIS.length && (
          <div className="mt-6 bg-white/90 p-6 rounded-3xl shadow-xl text-center">
            <div className="text-5xl mb-2">🎉</div>
            <h3 className="text-2xl font-black text-rose-600">You did it!</h3>
            <button onClick={resetDeck} className="mt-3 text-rose-600 font-semibold">
              Play again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const PatternParade = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [round, setRound] = useState(buildPatternRound);
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [shake, setShake] = useState(false);

  const nextRound = () => {
    setRound(buildPatternRound());
    setFeedback('');
  };

  useEffect(() => {
    speak(`What comes next? ${round.label}`);
  }, [round.label, speak]);

  const handlePick = (option) => {
    if (option === round.answer) {
      setFeedback('Great pattern!');
      setStreak((prev) => prev + 1);
      playSfx('sparkle');
      onCelebrate('Pattern pro!', 6);
      setTimeout(nextRound, 1400);
    } else {
      setFeedback('Try again!');
      setShake(true);
      playSfx('oops');
      setTimeout(() => setShake(false), 450);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-100 via-yellow-100 to-amber-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-8 w-52 h-32 bg-white/60 rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-amber-300/40 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-amber-700">Pattern Parade</h2>
          <p className="text-amber-700/70 font-semibold">Streak: {streak}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        <button
          onClick={() => speak(`What comes next? ${round.label}`)}
          className="mb-4 text-amber-700 font-semibold"
        >
          🔊 Hear the pattern
        </button>

        <div
          className={`bg-white/90 rounded-3xl p-6 shadow-xl border-4 border-amber-200 mb-6 ${
            shake ? 'animate-shake' : ''
          }`}
        >
          <div className="flex items-center gap-4 text-4xl">
            {round.sequence.map((token, index) => (
              <div key={`${token}-${index}`} className="w-12 h-12 flex items-center justify-center">
                {token}
              </div>
            ))}
            <div className="w-12 h-12 rounded-2xl border-4 border-dashed border-amber-300 flex items-center justify-center text-2xl">
              ?
            </div>
          </div>
        </div>

        <div className="flex gap-6 flex-wrap justify-center">
          {round.options.map((option) => (
            <button
              key={option}
              onClick={() => handlePick(option)}
              className="w-20 h-20 bg-white text-4xl rounded-3xl shadow-lg border-4 border-amber-200 hover:-translate-y-1 transition"
            >
              {option}
            </button>
          ))}
        </div>

        {feedback && <div className="mt-4 text-xl font-bold text-amber-700 animate-bounce">{feedback}</div>}
      </div>
    </div>
  );
};

const LetterTrace = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const canvasRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cleared, setCleared] = useState(false);

  const current = TRACE_LETTERS[currentIndex];

  useEffect(() => {
    speak(`Trace the letter ${current.letter}. ${current.word}.`);
  }, [current.letter, current.word, speak]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const drawGuide = () => {
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 220px "Fredoka", "Baloo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
      ctx.lineWidth = 12;
      ctx.setLineDash([24, 16]);
      ctx.strokeText(current.letter, canvas.width / 2, canvas.height / 2 + 20);
      ctx.setLineDash([]);
    };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight - 160;
      drawGuide();
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
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      [lastX, lastY] = [x, y];
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
  }, [current.letter, cleared]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-sky-100 to-indigo-100">
      <div className="p-4 bg-white/70 flex justify-between items-center shadow-md z-10">
        <button onClick={onBack} className="bg-white p-2 rounded-full hover:bg-white/80">
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-blue-700">Letter Trace</h2>
          <p className="text-blue-700/70 font-semibold">{current.letter} is for {current.word}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="flex gap-2 mb-4">
          {TRACE_LETTERS.map((item, index) => (
            <button
              key={item.letter}
              onClick={() => {
                setCurrentIndex(index);
                setCleared((prev) => !prev);
                playSfx('swish');
              }}
              className={`w-12 h-12 rounded-2xl font-black text-xl shadow ${
                index === currentIndex ? 'bg-blue-500 text-white' : 'bg-white text-blue-600'
              }`}
            >
              {item.letter}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-3xl flex-1 bg-white/60 rounded-3xl shadow-inner border-4 border-blue-200 overflow-hidden">
          <canvas ref={canvasRef} className="touch-none cursor-crosshair w-full h-full" />
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => {
              setCleared((prev) => !prev);
              playSfx('swish');
            }}
            className="bg-white text-blue-600 font-bold px-5 py-2 rounded-full shadow"
          >
            Erase
          </button>
          <button
            onClick={() => {
              onCelebrate('Well traced!', 8);
              playSfx('sparkle');
              speak('Well done!');
            }}
            className="bg-blue-500 text-white font-bold px-6 py-2 rounded-full shadow"
          >
            I did it!
          </button>
          <button
            onClick={() => {
              setCurrentIndex((prev) => (prev + 1) % TRACE_LETTERS.length);
              setCleared((prev) => !prev);
              playSfx('click');
            }}
            className="bg-white text-blue-600 font-bold px-5 py-2 rounded-full shadow"
          >
            Next letter
          </button>
        </div>
      </div>
    </div>
  );
};

const SoundSafari = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [round, setRound] = useState(buildPhonicsRound);
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);

  const sayPrompt = useCallback(() => {
    speak(`Which one starts with ${round.target.letter}? ${round.target.letter} says ${round.target.sound}.`);
  }, [round.target.letter, round.target.sound, speak]);

  useEffect(() => {
    sayPrompt();
  }, [sayPrompt]);

  const nextRound = () => {
    setRound(buildPhonicsRound());
    setFeedback('');
  };

  const handlePick = (option) => {
    if (option.letter === round.target.letter) {
      setFeedback('You got it!');
      setScore((prev) => prev + 1);
      playSfx('success');
      onCelebrate('Great listening!', 6);
      setTimeout(nextRound, 1400);
    } else {
      setFeedback('Try again!');
      setShake(true);
      playSfx('oops');
      setTimeout(() => setShake(false), 450);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-100 via-lime-100 to-emerald-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-6 right-6 w-48 h-32 bg-white/70 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-lime-200/60 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-emerald-700">Sound Safari</h2>
          <p className="text-emerald-700/70 font-semibold">Score: {score}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        <div
          className={`bg-white/90 rounded-3xl p-6 shadow-xl border-4 border-emerald-200 mb-6 text-center ${
            shake ? 'animate-shake' : ''
          }`}
        >
          <div className="text-slate-500 uppercase tracking-wide text-xs font-bold">Listen</div>
          <div className="text-5xl font-black text-emerald-700 mt-2">{round.target.letter}</div>
          <div className="text-lg font-semibold text-slate-600">says "{round.target.sound}"</div>
          <button onClick={sayPrompt} className="mt-3 text-emerald-600 font-semibold">
            🔊 Hear the sound
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
          {round.options.map((option) => (
            <button
              key={option.word}
              onClick={() => handlePick(option)}
              className="bg-white rounded-3xl p-4 shadow-lg border-4 border-emerald-200 hover:-translate-y-1 transition"
            >
              <div className="text-4xl mb-2">{option.emoji}</div>
              <div className="text-lg font-black text-emerald-700">{option.word}</div>
            </button>
          ))}
        </div>

        {feedback && <div className="mt-4 text-xl font-bold text-emerald-700 animate-bounce">{feedback}</div>}
      </div>
    </div>
  );
};

const IntroScreen = ({ onStart, playSfx, soundOn, onToggleSound, speak }) => {
  useEffect(() => {
    speak('Welcome Amari! Ready to play?');
    playSfx('sparkle');
  }, [playSfx, speak]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-200 via-blue-100 to-indigo-100 flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 left-10 w-56 h-56 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute top-20 right-8 w-48 h-48 bg-blue-200/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-200/60 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-6 right-6 z-20">
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        <div className="flex items-center justify-center gap-4 text-6xl animate-bounce-slow">
          <span>🐯</span>
          <span>🚀</span>
          <span>🌟</span>
        </div>
        <h1 className="mt-6 text-5xl md:text-6xl font-black text-slate-800 drop-shadow-sm">
          Welcome Amari!
        </h1>
        <p className="mt-4 text-xl text-slate-600 font-semibold">
          Amari Discovery is ready. Tap start and let’s play!
        </p>
        <button
          onClick={() => {
            playSfx('launch');
            onStart();
          }}
          className="mt-8 bg-blue-500 text-white text-2xl font-black px-10 py-4 rounded-full shadow-[0_8px_0_rgba(29,78,216,0.4)] hover:bg-blue-600 active:translate-y-1 active:shadow-none transition"
        >
          Start Adventure
        </button>
        <button
          onClick={() => speak('Welcome Amari! Ready to play?')}
          className="mt-4 text-blue-600 font-semibold"
        >
          🔊 Hear the welcome
        </button>
      </div>

      <div className="absolute bottom-8 left-8 text-4xl animate-bounce-slow">🪐</div>
      <div className="absolute bottom-8 right-8 text-4xl animate-bounce-slow">✨</div>
    </div>
  );
};

export default function App() {
  const [screen, setScreen] = useState('intro');
  const [soundOn, setSoundOn] = useState(true);
  const [points, setPoints] = useState(0);
  const [celebration, setCelebration] = useState(null);
  const playSfx = useSfx(soundOn);
  const speak = useVoice(soundOn);

  useEffect(() => {
    document.title = 'Amari Discovery';
  }, []);

  const celebrate = useCallback((message = 'Well done!', pointsEarned = 5) => {
    setPoints((prev) => {
      const total = prev + pointsEarned;
      setCelebration({
        id: Date.now(),
        message,
        points: pointsEarned,
        total,
        bursts: createBursts(),
      });
      return total;
    });
  }, []);

  useEffect(() => {
    if (!celebration) return;
    const timer = setTimeout(() => setCelebration(null), 1600);
    return () => clearTimeout(timer);
  }, [celebration]);

  let content = null;

  if (screen === 'intro') {
    content = (
      <IntroScreen
        onStart={() => setScreen('menu')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
      />
    );
  } else if (screen === 'menu') {
    content = (
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

        <div className="text-center mt-8 mb-10 animate-fade-in-down relative z-10">
          <div className="flex justify-center gap-4 text-5xl mb-4 animate-bounce-slow">
            <span>🐯</span>
            <span>🔧</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-800 tracking-tight drop-shadow-sm">
            Amari <span className="text-blue-500">Discovery</span>
          </h1>
          <p className="text-slate-600 font-bold text-xl mt-2 bg-white/60 inline-block px-6 py-2 rounded-full">
            Academy for Kids
          </p>
          <div className="mt-4 text-slate-600 font-semibold">
            ⭐ Total Stars: {points}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl relative z-10">
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
          />

          <MenuCard
            icon="🚀"
            title="Letter Launch"
            desc="Letters and sounds"
            color="bg-teal-400"
            onClick={() => {
              playSfx('click');
              setScreen('letters');
            }}
          />

          <MenuCard
            icon="🧩"
            title="Memory Match"
            desc="Find the pairs"
            color="bg-rose-400"
            onClick={() => {
              playSfx('click');
              setScreen('memory');
            }}
          />

          <MenuCard
            icon="🔷"
            title="Pattern Parade"
            desc="Finish the pattern"
            color="bg-amber-400"
            onClick={() => {
              playSfx('click');
              setScreen('pattern');
            }}
          />

          <MenuCard
            icon="🖍️"
            title="Letter Trace"
            desc="Trace big letters"
            color="bg-blue-400"
            onClick={() => {
              playSfx('click');
              setScreen('trace');
            }}
          />

          <MenuCard
            icon="🦁"
            title="Sound Safari"
            desc="Match the sounds"
            color="bg-emerald-400"
            onClick={() => {
              playSfx('click');
              setScreen('phonics');
            }}
          />
        </div>

        <div className="mt-10 text-slate-500 font-medium text-sm flex gap-2 items-center relative z-10">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          Playful Learning Active
        </div>
      </div>
    );
  } else if (screen === 'solar') {
    content = (
      <SolarSystem
        onBack={() => setScreen('menu')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'dino') {
    content = (
      <DinoDetective
        onBack={() => setScreen('menu')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'jet') {
    content = (
      <JetSkyShapes
        onBack={() => setScreen('menu')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'german') {
    content = (
      <GermanGarage
        onBack={() => setScreen('menu')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'math') {
    content = (
      <MonsterMath
        onBack={() => setScreen('menu')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'letters') {
    content = (
      <LetterLaunch
        onBack={() => setScreen('menu')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'memory') {
    content = (
      <MemoryMatch
        onBack={() => setScreen('menu')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'pattern') {
    content = (
      <PatternParade
        onBack={() => setScreen('menu')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'trace') {
    content = (
      <LetterTrace
        onBack={() => setScreen('menu')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'phonics') {
    content = (
      <SoundSafari
        onBack={() => setScreen('menu')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  }

  return (
    <>
      {content}
      <CelebrationOverlay celebration={celebration} />
    </>
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
