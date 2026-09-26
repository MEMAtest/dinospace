import { useEffect, useRef, useState } from 'react';
import LittleGameShell from '../LittleGameShell.jsx';
import HandHint from '../HandHint.jsx';
import { FireTruck } from '../VehicleArt.jsx';
import { artUrl } from '../littleArt.js';
import { useRoundHint } from '../useRoundHint.js';
import { shuffled } from '../littleKit.js';
import {
  LITTLE_LINES, RESCUE_ANIMALS, rescueDone, rescueFloorPrompt, rescuePrompt,
} from '../../../data/littleGames.js';

const Animal = ({ animal, className = '' }) => {
  const url = artUrl(`animal-${animal.id}`);
  return url
    ? <img src={url} alt="" className={`h-[85%] w-auto object-contain ${className}`} draggable={false} />
    : <span className={className}>{animal.emoji}</span>;
};

// Scene coordinates in percent. The building sits on the right; the truck
// parks on the left and its ladder swings up from the truck roof.
const BUILDING = { left: 48, right: 94, top: 5, bottom: 88 };
const LADDER_BASE = { x: 30, y: 78 };

const LadderRound = ({ floors, byFloorNumber, complete, mistake, speak, playSfx, firstRound }) => {
  // animals[0] lives on floor 1 (the bottom).
  const [animals] = useState(() => shuffled(RESCUE_ANIMALS).slice(0, floors));
  const [targetFloor] = useState(() => 1 + Math.floor(Math.random() * floors));
  const [wrongFloor, setWrongFloor] = useState(null);
  const [ladder, setLadder] = useState(0);
  const [rescued, setRescued] = useState(false);
  const windowRefs = useRef({});
  const timers = useRef([]);
  const hint = useRoundHint({ demo: firstRound });
  const target = animals[targetFloor - 1];
  const prompt = byFloorNumber ? rescueFloorPrompt(targetFloor) : rescuePrompt(target);
  const floorHeight = (BUILDING.bottom - BUILDING.top) / floors;
  const windowY = BUILDING.bottom - (targetFloor - 0.5) * floorHeight;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (!firstRound) {
      speak?.(prompt);
      return undefined;
    }
    speak?.(LITTLE_LINES.ladderIntro);
    const timer = setTimeout(() => speak?.(prompt), 3200);
    return () => clearTimeout(timer);
  }, [firstRound, prompt, speak]);

  // Extend the ladder smoothly from the truck to the window.
  const raiseLadder = () => {
    const started = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - started) / 1000);
      setLadder(1 - (1 - progress) ** 3);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const tapFloor = (floor) => {
    if (ladder) return;
    if (floor !== targetFloor) {
      playSfx?.('oops');
      setWrongFloor(floor);
      speak?.(LITTLE_LINES.ladderWrong);
      hint.mistake();
      mistake();
      timers.current.push(setTimeout(() => setWrongFloor(null), 450));
      timers.current.push(setTimeout(() => speak?.(prompt), 1600));
      return;
    }
    playSfx?.('whoosh');
    hint.touch();
    raiseLadder();
    timers.current.push(setTimeout(() => {
      setRescued(true);
      playSfx?.('pop');
      speak?.(rescueDone(target));
    }, 1200));
    timers.current.push(setTimeout(() => complete({
      praise: false,
      delay: 1500,
      art: <div className="relative mx-auto max-w-xs"><FireTruck className="w-full" /><Animal animal={target} className="absolute -top-8 right-10 text-6xl" /></div>,
    }), 1700));
  };

  const top = { x: BUILDING.left - 1, y: windowY };
  const end = { x: LADDER_BASE.x + (top.x - LADDER_BASE.x) * ladder, y: LADDER_BASE.y + (top.y - LADDER_BASE.y) * ladder };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-3 pb-4">
      <button
        type="button"
        onClick={() => speak?.(prompt)}
        className="mx-auto mb-3 flex h-20 items-center gap-3 rounded-full bg-white/85 px-5 py-2 text-2xl font-black text-slate-800 shadow-lg"
        aria-label={`Hear again: ${prompt}`}
      >
        <span aria-hidden="true">🔊</span>
        {byFloorNumber ? <span className="text-5xl text-rose-600">{targetFloor}</span> : <Animal animal={target} className="text-5xl" />}
      </button>

      <div className="relative mx-auto w-full overflow-hidden rounded-[2rem] border-[6px] border-white bg-gradient-to-b from-sky-300 to-sky-100 shadow-2xl" style={{ aspectRatio: '4 / 5', maxWidth: 'calc((100dvh - 12rem) * 0.8)' }}>
        <div className="absolute inset-x-0 bottom-0 h-[12%] bg-gradient-to-b from-slate-400 to-slate-600" />
        <div
          className="absolute rounded-t-xl border-4 border-slate-800 bg-orange-300"
          style={{ left: `${BUILDING.left}%`, right: `${100 - BUILDING.right}%`, top: `${BUILDING.top}%`, bottom: `${100 - BUILDING.bottom}%`, backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 18px, rgba(154,52,18,.18) 18px 20px)' }}
        >
          {animals.map((animal, index) => {
            const floor = index + 1;
            const gone = rescued && floor === targetFloor;
            const glow = hint.strongHint && floor === targetFloor;
            return (
              <button
                key={animal.id}
                type="button"
                ref={(el) => { windowRefs.current[floor] = el; }}
                onClick={() => tapFloor(floor)}
                aria-label={byFloorNumber ? `Floor ${floor}` : `The ${animal.name}`}
                className={`absolute left-[6%] right-[6%] flex items-center gap-2 ${wrongFloor === floor ? 'animate-shake' : ''}`}
                style={{ bottom: `${index * (100 / floors) + (100 / floors) * 0.1}%`, height: `${(100 / floors) * 0.8}%` }}
              >
                <span className="grid h-full w-8 place-items-center rounded-lg bg-slate-800 text-lg font-black text-white sm:w-10 sm:text-2xl">{floor}</span>
                <span className={`grid h-full flex-1 place-items-center rounded-xl border-4 bg-sky-100 text-4xl shadow-inner sm:text-6xl ${glow ? 'animate-cell-pulse border-amber-400 bg-amber-100' : 'border-slate-800'}`}>
                  <span className={`grid h-full place-items-center ${gone ? 'opacity-0 transition-opacity' : 'animate-wiggle'}`}><Animal animal={animal} /></span>
                </span>
              </button>
            );
          })}
        </div>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          {ladder > 0 && (
            <g>
              <line x1={LADDER_BASE.x - 1.5} y1={LADDER_BASE.y} x2={end.x - 1.5} y2={end.y} stroke="#475569" strokeWidth="1.6" strokeLinecap="round" />
              <line x1={LADDER_BASE.x + 1.5} y1={LADDER_BASE.y + 1} x2={end.x + 1.5} y2={end.y + 1} stroke="#475569" strokeWidth="1.6" strokeLinecap="round" />
              {Array.from({ length: 14 }, (_, index) => {
                const t = (index + 1) / 15;
                if (t > ladder) return null;
                const x = LADDER_BASE.x + (top.x - LADDER_BASE.x) * t;
                const y = LADDER_BASE.y + (top.y - LADDER_BASE.y) * t;
                return <line key={index} x1={x - 1.5} y1={y} x2={x + 1.5} y2={y + 1} stroke="#94a3b8" strokeWidth="1" />;
              })}
            </g>
          )}
        </svg>

        <div className="pointer-events-none absolute bottom-[4%] left-[1%] w-[50%]">
          <FireTruck className="w-full" title="Fire truck" showLadder={false} />
          {rescued && <span className="absolute left-[30%] top-[-10%] grid h-16 place-items-center text-4xl animate-bounce-up sm:text-6xl" aria-hidden="true"><Animal animal={target} /></span>}
        </div>
      </div>
      <HandHint show={hint.showHint && !ladder} from={() => windowRefs.current[targetFloor]} mode="tap" />
    </div>
  );
};

const LadderRescue = (props) => {
  const { speak, playSfx } = props;

  return (
    <LittleGameShell
      {...props}
      gameId="ladder"
      title="Ladder Rescue"
      intro={LITTLE_LINES.ladderIntro}
      background="from-red-400 via-rose-300 to-sky-200"
      startArt={<div className="relative mx-auto max-w-sm"><FireTruck className="w-full" title="Fire truck" /><span className="absolute -top-10 right-6 text-6xl animate-wiggle" aria-hidden="true"><Animal animal={RESCUE_ANIMALS[0]} /></span></div>}
      renderUnlock={(config) => (
        <div className="grid h-full w-full place-items-center rounded-xl bg-orange-200 text-3xl font-black text-slate-800">
          {config.unlock === 'numbers' ? '1 2 3' : `${config.floors} 🏢`}
        </div>
      )}
    >
      {({ round, complete, mistake, playId, config }) => (
        <LadderRound
          key={`${playId}-${round}`}
          floors={config.floors}
          byFloorNumber={Boolean(config.numbers) && round % 2 === 1}
          complete={complete}
          mistake={mistake}
          speak={speak}
          playSfx={playSfx}
          firstRound={round === 0}
        />
      )}
    </LittleGameShell>
  );
};

export default LadderRescue;
