import { useEffect, useRef, useState } from 'react';
import LittleGameShell from '../LittleGameShell.jsx';
import HandHint from '../HandHint.jsx';
import { Smoke } from '../VehicleArt.jsx';
import { artUrl } from '../littleArt.js';
import { useRoundHint } from '../useRoundHint.js';
import { shuffled } from '../littleKit.js';
import { LITTLE_LINES } from '../../../data/littleGames.js';

// Positions are percentages of the scene. The house sits on the right and
// the truck on the left, so the hose sprays across the scene.
const FIRE_SPOTS = [
  { x: 52, y: 44 }, { x: 70, y: 44 }, { x: 88, y: 44 },
  { x: 52, y: 66 }, { x: 88, y: 66 }, { x: 70, y: 24 },
];
const NOZZLE = { x: 28, y: 83 };
const HOUSE_COLOURS = ['#fca5a5', '#fde68a', '#bfdbfe', '#c4b5fd', '#bbf7d0'];
const HIT_RADIUS = 11;
// Holding the water on a fire for this long puts it out; a quick tap only
// sprays briefly, so the child learns to press and hold.
const SPRAY_MS = 1200;
const TAP_SPRAY_MS = 350;
const RESCUE_TRUCK = artUrl('rescue-firetruck');
const RESCUE_FLAME = artUrl('rescue-flame');

const RescueTruck = ({ className = '' }) => <img src={RESCUE_TRUCK} alt="Fire truck" className={`object-contain ${className}`} draggable={false} />;
const RescueFlame = ({ className = '', style }) => <img src={RESCUE_FLAME} alt="" className={`object-contain ${className}`} style={style} draggable={false} />;

const FireRound = ({ count, houseColour, complete, speak, playSfx, firstRound }) => {
  const hint = useRoundHint({ demo: firstRound });
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
  const firesLeft = fires.filter((fire) => fire.health > 0).length;

  useEffect(() => {
    speak?.(firstRound ? LITTLE_LINES.fireIntro : LITTLE_LINES.fireStart);
  }, [firstRound, speak]);

  useEffect(() => {
    if (!allOut) return undefined;
    const timer = setTimeout(() => {
      latest.current.speak?.(LITTLE_LINES.fireDone);
      latest.current.complete({ praise: false, delay: 1800, art: <RescueTruck className="mx-auto w-full max-w-xs" /> });
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
            latest.current.playSfx?.('splash');
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
    hint.touch();
    sprayUntilRef.current = performance.now() + TAP_SPRAY_MS;
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
    <div className="absolute inset-0 overflow-hidden">
      <div
        ref={sceneRef}
        onPointerDown={startSpray}
        onPointerMove={moveSpray}
        onPointerUp={stopSpray}
        onPointerCancel={stopSpray}
        role="application"
        aria-label="Tap and hold on the fires to spray water"
        className="relative mx-auto h-full touch-none overflow-hidden bg-gradient-to-b from-sky-300 to-sky-100 shadow-2xl"
        style={{ width: 'min(100vw, 56.25dvh)' }}
      >
        {artUrl('fire-house') ? (
          <img src={artUrl('fire-house')} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-fill" draggable={false} />
        ) : (
        <>
        <div className="absolute inset-x-0 bottom-0 h-[16%] bg-gradient-to-b from-lime-400 to-green-600" />
        <div className="absolute bottom-[16%] left-[42%] right-[3%] h-[62%] rounded-t-lg border-4 border-slate-800" style={{ background: houseColour }}>
          <div className="absolute bottom-0 left-[38%] h-[36%] w-[24%] rounded-t-full border-4 border-b-0 border-slate-800 bg-amber-700" />
        </div>
        <div className="absolute left-[39%] right-0 top-[4%] h-[20%] border-slate-800 bg-rose-700" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} />
        {[{ x: 52, y: 44 }, { x: 70, y: 44 }, { x: 88, y: 44 }, { x: 52, y: 66 }, { x: 88, y: 66 }].map((w) => (
          <div key={`${w.x}-${w.y}`} className="absolute h-[13%] w-[11%] -translate-x-1/2 -translate-y-1/2 rounded-md border-4 border-slate-800 bg-sky-200" style={{ left: `${w.x}%`, top: `${w.y}%` }} />
        ))}
        </>
        )}

        <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => speak?.(LITTLE_LINES.fireStart)} className="absolute left-[3%] top-[11%] z-20 rounded-[1.4rem] border-4 border-white bg-white/95 px-4 py-2 text-lg font-black text-blue-950 shadow-xl sm:text-xl" aria-label="Hear again: spray the fire">
          Spray the fire! 🔊
        </button>
        <div className="pointer-events-none absolute right-[3%] top-[11%] z-20 rounded-full border-4 border-white bg-white/95 px-3 py-2 text-lg font-black text-orange-600 shadow-xl" role="status" aria-label={`${firesLeft} ${firesLeft === 1 ? 'fire' : 'fires'} left`}>
          🔥 {firesLeft}
        </div>

        {fires.map((fire) => (
          <div key={fire.id} data-fire={fire.health > 0 ? 'burning' : 'out'} className="pointer-events-none absolute -translate-x-1/2 -translate-y-[70%]" style={{ left: `${fire.x}%`, top: `${fire.y}%`, width: '19%' }}>
            {fire.health > 0
              ? <RescueFlame className="w-full animate-flicker" style={{ transform: `scale(${0.35 + fire.health * 0.65})`, transformOrigin: '50% 90%' }} />
              : <Smoke className="w-full animate-float-up" />}
          </div>
        ))}

        <div className="pointer-events-none absolute bottom-[3%] left-[1%] w-[50%]">
          <RescueTruck className="w-full" />
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
      <HandHint
        show={hint.showHint && !allOut}
        from={() => sceneRef.current?.querySelector('[data-fire="burning"]')}
        mode="hold"
      />
    </div>
  );
};

const FireRescue = (props) => {
  const { speak, playSfx } = props;

  return (
    <LittleGameShell
      {...props}
      gameId="firerescue"
      title="Fire Truck Rescue"
      intro={LITTLE_LINES.fireIntro}
      background="from-rose-400 via-orange-300 to-amber-200"
      backgroundArtName="fire-house"
      playFullBleed
      startArt={<RescueTruck className="mx-auto w-full max-w-sm" />}
      renderUnlock={(config) => (
        <div className="flex h-full w-full items-end justify-center">
          {Array.from({ length: Math.max(...config.fires) }, (_, index) => <RescueFlame key={index} className="h-10 w-6" />)}
        </div>
      )}
    >
      {({ round, complete, playId, config }) => (
        <FireRound
          key={`${playId}-${round}`}
          count={config.fires[round]}
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
