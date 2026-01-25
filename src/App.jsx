import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Cloud, Home, Palette } from 'lucide-react';

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
    x: 20,
    y: 40,
  },
  {
    id: 'stego',
    name: 'Stegosaurus',
    emoji: '🦕',
    fact: 'My back plates work like solar panels to warm me up!',
    x: 70,
    y: 60,
  },
  {
    id: 'trike',
    name: 'Triceratops',
    emoji: '🦏',
    fact: 'I have three horns to protect my nose!',
    x: 40,
    y: 80,
  },
  {
    id: 'ptero',
    name: 'Pterodactyl',
    emoji: '🦅',
    fact: "I'm not a dinosaur, I'm a flying reptile!",
    x: 80,
    y: 20,
  },
  {
    id: 'brachio',
    name: 'Brachiosaurus',
    emoji: '🦒',
    fact: 'I eat leaves from the very top of trees!',
    x: 10,
    y: 70,
  },
];

const GERMAN_COLORS = [
  { name: 'Rot', color: 'red', hex: '#ef4444' },
  { name: 'Blau', color: 'blue', hex: '#3b82f6' },
  { name: 'Grün', color: 'green', hex: '#22c55e' },
  { name: 'Gelb', color: 'yellow', hex: '#eab308' },
];

const buildDinos = () => DINOS.map((dino) => ({ ...dino, hidden: true }));

const SolarSystem = ({ onBack }) => {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const stars = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() > 0.85 ? 2 : 1,
      })),
    [],
  );

  const planets = [
    { name: 'Mercury', color: 'bg-gray-400', fact: 'I am super hot in the day and freezing at night!' },
    { name: 'Venus', color: 'bg-yellow-600', fact: 'I spin backwards! Wheee!' },
    { name: 'Earth', color: 'bg-blue-500', fact: 'Hello! This is where you and I live.' },
    { name: 'Mars', color: 'bg-red-500', fact: 'I have the biggest volcano in the solar system.' },
    { name: 'Jupiter', color: 'bg-orange-300', fact: 'I am a giant ball of gas with a big red spot.' },
    { name: 'Saturn', color: 'bg-yellow-200', fact: 'I am famous for my hula hoops (rings)!' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white p-4 relative overflow-hidden">
      <div className="flex justify-between items-center mb-4 z-10">
        <button
          onClick={onBack}
          className="bg-white/20 p-2 rounded-full hover:bg-white/40 transition"
        >
          <Home />
        </button>
        <h2 className="text-2xl font-bold text-yellow-300 font-comic">Space Explorer</h2>
        <div className="w-8" />
      </div>

      <div className="absolute inset-0 opacity-50 pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size * 4}px`,
              height: `${star.size * 4}px`,
            }}
          />
        ))}
      </div>

      <div className="flex-1 overflow-x-auto flex items-center gap-6 px-8 no-scrollbar z-10 pb-8">
        <div className="flex-shrink-0 w-32 h-32 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold shadow-[0_0_60px_orange]">
          SUN
        </div>
        {planets.map((planet) => (
          <button
            key={planet.name}
            onClick={() => setSelectedPlanet(planet)}
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
        <div className="absolute bottom-0 left-0 right-0 bg-white text-slate-900 p-6 rounded-t-3xl shadow-2xl animate-bounce-up z-20 text-center">
          <h3 className="text-3xl font-bold text-indigo-600 mb-2">{selectedPlanet.name}</h3>
          <p className="text-lg mb-4 text-slate-600">"{selectedPlanet.fact}"</p>
          <button
            onClick={() => setSelectedPlanet(null)}
            className={`${THEME.primary} text-white px-8 py-3 rounded-full font-bold text-xl ${THEME.button} hover:bg-blue-600`}
          >
            Awesome!
          </button>
        </div>
      )}
    </div>
  );
};

const DinoDetective = ({ onBack }) => {
  const [dinos, setDinos] = useState(buildDinos);
  const [foundDino, setFoundDino] = useState(null);

  const handleFind = (index) => {
    setDinos((prev) => {
      if (!prev[index].hidden) return prev;
      const next = prev.map((dino, i) => (i === index ? { ...dino, hidden: false } : dino));
      setFoundDino(next[index]);
      return next;
    });
  };

  const allFound = dinos.every((dino) => !dino.hidden);

  return (
    <div className="flex flex-col h-full bg-green-200 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Home />
        </button>
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-0 w-full h-32 bg-green-600" />
        <div className="absolute -left-10 bottom-20 w-40 h-40 bg-green-500 rounded-full opacity-80" />
        <div className="absolute right-20 bottom-24 w-60 h-60 bg-green-700 rounded-full opacity-90" />
        <div className="absolute top-20 left-1/4 w-32 h-32 bg-green-300 rounded-full opacity-50 blur-xl" />
      </div>

      <div className="z-10 text-center mt-4">
        <h2 className="text-3xl font-bold text-green-800 drop-shadow-sm">Dino Hide & Seek!</h2>
        <p className="text-green-900 font-medium">Tap the shaking bushes to find friends!</p>
      </div>

      <div className="flex-1 relative z-10">
        {dinos.map((dino, i) => (
          <button
            key={dino.id}
            onClick={() => handleFind(i)}
            className="absolute transition-all duration-500 focus:outline-none"
            style={{ left: `${dino.x}%`, top: `${dino.y}%` }}
          >
            {dino.hidden ? (
              <div className="w-24 h-24 bg-green-800 rounded-full flex items-center justify-center animate-wiggle shadow-lg cursor-pointer hover:scale-110">
                <span className="text-4xl opacity-50">🌿</span>
              </div>
            ) : (
              <div className="text-6xl animate-pop-in drop-shadow-2xl transform hover:scale-125 transition-transform">
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

const JetSkyShapes = ({ onBack }) => {
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
      if (shape === 'Circle') ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, Math.PI * 2);
      if (shape === 'Square') ctx.rect(canvas.width / 2 - 100, canvas.height / 2 - 100, 200, 200);
      if (shape === 'Triangle') {
        ctx.moveTo(canvas.width / 2, canvas.height / 2 - 120);
        ctx.lineTo(canvas.width / 2 + 120, canvas.height / 2 + 80);
        ctx.lineTo(canvas.width / 2 - 120, canvas.height / 2 + 80);
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
      ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.lineWidth = 20;
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
    <div className="h-full flex flex-col bg-sky-100">
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
              }}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${
                shape === option ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCleared((prev) => !prev)}
          className="bg-red-400 text-white p-2 rounded-full hover:bg-red-500"
        >
          <Cloud />
        </button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute top-4 left-0 w-full text-center text-sky-700 font-bold opacity-50 pointer-events-none">
          Trace the shape with your finger!
        </div>
        <canvas ref={canvasRef} className="touch-none cursor-crosshair" />
      </div>
    </div>
  );
};

const GermanGarage = ({ onBack }) => {
  const [targetColor, setTargetColor] = useState(GERMAN_COLORS[0]);
  const [painted, setPainted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const nextColor = () => {
    const random = GERMAN_COLORS[Math.floor(Math.random() * GERMAN_COLORS.length)];
    setTargetColor(random);
    setPainted(false);
    setFeedback('');
  };

  const handlePaint = (colorObj) => {
    if (colorObj.name === targetColor.name) {
      setPainted(true);
      setFeedback('Sehr Gut! (Very Good!)');
      setTimeout(nextColor, 2000);
    } else {
      setFeedback('Try again!');
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 relative">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-lg z-20 hover:scale-110 transition-transform"
      >
        <Home />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-slate-200 text-center mb-8 w-full max-w-md">
          <p className="text-slate-500 mb-2 font-bold uppercase tracking-wider">Mechanic Mission</p>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Paint the Car...</h2>
          <div className="text-5xl font-black text-blue-600 mb-4">{targetColor.name}</div>
          {feedback && <div className="text-xl font-bold text-green-500 animate-bounce">{feedback}</div>}
        </div>

        <div className="relative w-64 h-32 mb-12 transition-colors duration-500">
          <div
            className="absolute bottom-0 w-full h-20 rounded-2xl shadow-lg transition-colors duration-500"
            style={{ backgroundColor: painted ? targetColor.hex : '#cbd5e1' }}
          />
          <div
            className="absolute bottom-20 left-8 w-40 h-16 rounded-t-full transition-colors duration-500"
            style={{ backgroundColor: painted ? targetColor.hex : '#cbd5e1' }}
          />
          <div className="absolute -bottom-4 left-8 w-12 h-12 bg-slate-800 rounded-full border-4 border-slate-300" />
          <div className="absolute -bottom-4 right-8 w-12 h-12 bg-slate-800 rounded-full border-4 border-slate-300" />
          <div className="absolute bottom-16 left-12 text-4xl animate-bounce-slow">🐯</div>
        </div>

        <div className="grid grid-cols-4 gap-4 w-full max-w-md">
          {GERMAN_COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => handlePaint(color)}
              className="flex flex-col items-center gap-2 group focus:outline-none"
            >
              <div
                className="w-16 h-20 rounded-xl shadow-md border-b-4 border-black/10 group-active:scale-95 transition-transform relative overflow-hidden group-hover:brightness-110"
                style={{ backgroundColor: color.hex }}
              >
                <div className="absolute top-0 w-full h-4 bg-white/20" />
                <div className="absolute bottom-2 right-2 text-white/50">
                  <Palette size={16} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const MonsterMath = ({ onBack }) => {
  const [problem, setProblem] = useState({ a: 2, b: 2, ans: 4 });
  const [success, setSuccess] = useState(false);

  const newProblem = () => {
    setSuccess(false);
    const a = Math.ceil(Math.random() * 5);
    const b = Math.ceil(Math.random() * 3);
    setProblem({ a, b, ans: a * b });
  };

  const check = (answer) => {
    if (answer === problem.ans) {
      setSuccess(true);
      setTimeout(newProblem, 2000);
    }
  };

  return (
    <div className="h-full flex flex-col bg-orange-100 relative overflow-hidden">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-lg z-20 hover:scale-110 transition-transform"
      >
        <Home />
      </button>

      <div className="mt-20 text-center z-10 px-4">
        <h2 className="text-3xl font-black text-orange-600 mb-8">Stunt Jump Math</h2>

        <div className="flex justify-center items-center gap-4 text-6xl font-black text-slate-800 mb-12">
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

        <div className="flex justify-center gap-6">
          {[problem.ans, problem.ans + 1, Math.max(1, problem.ans - 2)]
            .sort(() => Math.random() - 0.5)
            .map((option) => (
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
        className={`absolute bottom-10 left-10 text-[80px] transition-transform duration-1000 ${
          success ? 'translate-x-[500px] -translate-y-[200px] rotate-[360deg]' : 'translate-x-0'
        }`}
      >
        🛻
      </div>
      <div className="absolute bottom-0 w-full h-10 bg-orange-800/20" />

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

  if (screen !== 'menu') {
    if (screen === 'solar') return <SolarSystem onBack={() => setScreen('menu')} />;
    if (screen === 'dino') return <DinoDetective onBack={() => setScreen('menu')} />;
    if (screen === 'jet') return <JetSkyShapes onBack={() => setScreen('menu')} />;
    if (screen === 'german') return <GermanGarage onBack={() => setScreen('menu')} />;
    if (screen === 'math') return <MonsterMath onBack={() => setScreen('menu')} />;
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
          onClick={() => setScreen('dino')}
        />

        <MenuCard
          icon="✈️"
          title="Sky Shapes"
          desc="Draw with a Jet!"
          color="bg-sky-400"
          onClick={() => setScreen('jet')}
        />

        <MenuCard
          icon="🪐"
          title="Solar System"
          desc="Visit the planets"
          color="bg-indigo-400"
          onClick={() => setScreen('solar')}
        />

        <MenuCard
          icon="🎨"
          title="German Garage"
          desc="Learn colors in German"
          color="bg-red-400"
          onClick={() => setScreen('german')}
        />

        <MenuCard
          icon="🛻"
          title="Monster Math"
          desc="Stunt Jump Counting"
          color="bg-orange-400"
          onClick={() => setScreen('math')}
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
