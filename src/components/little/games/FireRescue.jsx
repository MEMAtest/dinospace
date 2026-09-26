import { useEffect, useRef, useState } from 'react';
import LittleGameShell from '../LittleGameShell.jsx';
import { FireTruck, Flame, Smoke } from '../VehicleArt.jsx';
import { shuffled } from '../littleKit.js';
import { FIRE_COUNTS, LITTLE_LINES } from '../../../data/littleGames.js';

// Positions are percentages of the scene. The house sits on the right and
// the truck on the left, so the hose sprays across the scene.
const FIRE_SPOTS = [
  { x: 52, y: 44 }, { x: 70, y: 44 }, { x: 88, y: 44 },
  { x: 52, y: 66 }, { x: 88, y: 66 }, { x: 70, y: 17 },
];
const NOZZLE = { x: 27, y: 74 };
const HOUSE_COLOURS = ['#fca5a5', '#fde68a', '#bfdbfe', '#c4b5fd', '#bbf7d0'];
const HIT_RADIUS = 11;
const SPRAY_MS = 750;

const FireRound = ({ count, houseColour, complete, speak, playSfx, firstRound }) => {
  const [initialFires] = useState(() => shuffled(FIRE_SPOTS).slice(0, count).map((spot, id) => ({ ...spot, id, health: 1 })));
  const [fires, setFires] = useState(initialFires);
  // The animation loop owns the fire list; state mirrors it for rendering.
  const firesRef = useRef(initialFires);
  const [aim, setAim] = useState(null);
  const sceneRef = useRef(null);
  const aimRef = useRef(null);
  const holdingRef = useRef(false);
  const sprayUntilRef = useRef(0);
  const outCountRef = useRef(0);
  const latest = useRef({ complete, speak, playSfx });
  useEffect(() => { latest.current = { complete, speak, playSfx }; });

  const allOut = fires.every((fire) => fire.health <= 0);

  useEffect(() => {
    speak?.(firstRound ? LITTLE_LINES.fireIntro : LITTLE_LINES.fireStart);
  }, [firstRound, speak]);

  useEffect(() => {
    if (!allOut) return undefined;
    const timer = setTimeout(() => {
      latest.current.speak?.(LITTLE_LINES.fireDone);
      latest.current.complete({ praise: false, delay: 1800 });
    }, 500);
    return () => clearTimeout(timer);
  }, [allOut]);

  useEffect(() => {
    let frame;
    let last = performance.now();
    const tick = (now) => {
      const dt = now - last;
      last = now;
      const spraying = holdingRef.current || now < sprayUntilRef.current;
      const target = aimRef.current;
      if (spraying && target) {
        let changed = false;
        const next = firesRef.current.map((fire) => {
          if (fire.health <= 0 || Math.hypot(fire.x - target.x, fire.y - target.y) > HIT_RADIUS) return fire;
          changed = true;
          const health = Math.max(0, fire.health - dt / SPRAY_MS);
          if (health === 0) {
            outCountRef.current += 1;
            latest.current.playSfx?.('pop');
            latest.current.speak?.(String(outCountRef.current));
          }
          return { ...fire, health };
        });
        if (changed) {
          firesRef.current = next;
          setFires(next);
        }
      }
      if (!spraying && aimRef.current) {
        aimRef.current = null;
        setAim(null);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const toScene = (event) => {
    const rect = sceneRef.current.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 };
  };

  const startSpray = (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    holdingRef.current = true;
    sprayUntilRef.current = performance.now() + SPRAY_MS + 100;
    const point = toScene(event);
    aimRef.current = point;
    setAim(point);
    playSfx?.('swish');
  };

  const moveSpray = (event) => {
    if (!holdingRef.current) return;
    const point = toScene(event);
    aimRef.current = point;
    setAim(point);
  };

  const stopSpray = () => { holdingRef.current = false; };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-3 pb-4">
      <div
        ref={sceneRef}
        onPointerDown={startSpray}
        onPointerMove={moveSpray}
        onPointerUp={stopSpray}
        onPointerCancel={stopSpray}
        role="application"
        aria-label="Tap and hold on the fires to spray water"
        className="relative mx-auto w-full touch-none overflow-hidden rounded-[2rem] border-[6px] border-white bg-gradient-to-b from-sky-300 to-sky-100 shadow-2xl"
        style={{ aspectRatio: '4 / 5', maxWidth: 'calc((100dvh - 7.5rem) * 0.8)' }}
      >
        <div className="absolute inset-x-0 bottom-0 h-[16%] bg-gradient-to-b from-lime-400 to-green-600" />
        <div className="absolute bottom-[16%] left-[42%] right-[3%] h-[62%] rounded-t-lg border-4 border-slate-800" style={{ background: houseColour }}>
          <div className="absolute bottom-0 left-[38%] h-[36%] w-[24%] rounded-t-full border-4 border-b-0 border-slate-800 bg-amber-700" />
        </div>
        <div className="absolute left-[39%] right-0 top-[4%] h-[20%] border-slate-800 bg-rose-700" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} />
        {[{ x: 52, y: 44 }, { x: 70, y: 44 }, { x: 88, y: 44 }, { x: 52, y: 66 }, { x: 88, y: 66 }].map((w) => (
          <div key={`${w.x}-${w.y}`} className="absolute h-[13%] w-[11%] -translate-x-1/2 -translate-y-1/2 rounded-md border-4 border-slate-800 bg-sky-200" style={{ left: `${w.x}%`, top: `${w.y}%` }} />
        ))}

        {fires.map((fire) => (
          <div key={fire.id} data-fire={fire.health > 0 ? 'burning' : 'out'} className="pointer-events-none absolute -translate-x-1/2 -translate-y-[70%]" style={{ left: `${fire.x}%`, top: `${fire.y}%`, width: '19%' }}>
            {fire.health > 0
              ? <Flame className="w-full animate-flicker" style={{ transform: `scale(${0.35 + fire.health * 0.65})`, transformOrigin: '50% 90%' }} />
              : <Smoke className="w-full animate-float-up" />}
          </div>
        ))}

        <div className="pointer-events-none absolute bottom-[3%] left-[1%] w-[44%]">
          <FireTruck className="w-full" title="Fire truck" />
        </div>

        {aim && (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            <path
              d={`M${NOZZLE.x} ${NOZZLE.y} Q${(NOZZLE.x + aim.x) / 2} ${Math.min(NOZZLE.y, aim.y) - 12} ${aim.x} ${aim.y}`}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeDasharray="3 2"
              className="animate-water"
              opacity=".9"
            />
            <circle cx={aim.x} cy={aim.y} r="3.2" fill="#bae6fd" opacity=".85" />
          </svg>
        )}
      </div>
    </div>
  );
};

const FireRescue = (props) => {
  const { bigKid, speak, playSfx } = props;
  const counts = FIRE_COUNTS[bigKid ? 'big' : 'little'];

  return (
    <LittleGameShell
      {...props}
      gameId="firerescue"
      title="Fire Truck Rescue"
      intro={LITTLE_LINES.fireIntro}
      rounds={counts.length}
      background="from-rose-400 via-orange-300 to-amber-200"
      startArt={<FireTruck className="mx-auto w-full max-w-sm" title="Fire truck" />}
    >
      {({ round, complete, playId }) => (
        <FireRound
          key={`${playId}-${round}`}
          count={counts[round]}
          houseColour={HOUSE_COLOURS[round % HOUSE_COLOURS.length]}
          complete={complete}
          speak={speak}
          playSfx={playSfx}
          firstRound={round === 0}
        />
      )}
    </LittleGameShell>
  );
};

export default FireRescue;
