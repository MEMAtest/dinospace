import { useEffect, useRef, useState } from 'react';
import { Rocket as RocketIcon } from 'lucide-react';
import LittleGameShell from '../LittleGameShell.jsx';
import DragItem from '../DragItem.jsx';
import HandHint from '../HandHint.jsx';
import { FuelCan } from '../VehicleArt.jsx';
import { useRoundHint } from '../useRoundHint.js';
import { pointInRect, seededShuffle } from '../littleKit.js';
import { LITTLE_LINES, fuelPrompt } from '../../../data/littleGames.js';
import { artUrl } from '../littleArt.js';

const ROCKET_ART = artUrl('fuel-rocket');

// Levels 1–2: the tank has exactly the right number of spaces and launches
// by itself when full. From level 3 the tank is bigger than the number, so
// the child must count and stop, then press the launch button.
const FuelRound = ({ target, exact, tankSize, complete, mistake, speak, playSfx, firstRound }) => {
  const [filled, setFilled] = useState(0);
  const [launched, setLaunched] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [cans] = useState(() => Array.from({ length: Math.min(10, tankSize + 2) }, (_, index) => index));
  const [used, setUsed] = useState([]);
  const rocketRef = useRef(null);
  const cansRef = useRef(null);
  const launchRef = useRef(null);
  const hint = useRoundHint({ demo: firstRound });
  const size = exact ? target : tankSize;
  const prompt = fuelPrompt(target);

  useEffect(() => { speak?.(prompt); }, [prompt, speak]);

  const latest = useRef({ complete, speak, playSfx });
  useEffect(() => { latest.current = { complete, speak, playSfx }; });

  useEffect(() => {
    if (!launched) return undefined;
    latest.current.speak?.(LITTLE_LINES.fuelFull);
    latest.current.playSfx?.('launch');
    const timer = setTimeout(() => latest.current.complete({ praise: false, delay: 200, art: <img src={ROCKET_ART} alt="Launched rocket" className="mx-auto h-56 w-auto object-contain" /> }), 2100);
    return () => clearTimeout(timer);
  }, [launched]);

  const addFuel = (canId, point) => {
    if (launched || used.includes(canId) || filled >= size) return true;
    if (point && !pointInRect(point, rocketRef.current?.getBoundingClientRect(), 30)) return false;
    const next = filled + 1;
    hint.touch();
    setFilled(next);
    setUsed((current) => [...current, canId]);
    playSfx?.('pop');
    speak?.(String(next));
    if (exact && next >= target) setTimeout(() => setLaunched(true), 800);
    return true;
  };

  const tryLaunch = () => {
    if (launched) return;
    if (filled === target) {
      setLaunched(true);
      return;
    }
    // Wrong amount: the tank empties and the child counts again.
    playSfx?.('oops');
    speak?.(LITTLE_LINES.fuelRecount);
    hint.mistake();
    mistake();
    setWrong(true);
    setTimeout(() => { setWrong(false); setFilled(0); setUsed([]); }, 700);
  };

  const nextCan = cans.find((id) => !used.includes(id));
  const hintOnLaunch = !exact && filled === target;

  return (
    <div className="absolute inset-0 overflow-hidden text-center text-white">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-transparent to-indigo-950/50" />
      <button type="button" onClick={() => speak?.(prompt)} className="absolute left-1/2 top-[11%] z-20 flex w-max max-w-[90%] -translate-x-1/2 items-center gap-3 rounded-[1.6rem] border-4 border-white bg-white/95 px-4 py-2 text-indigo-950 shadow-xl sm:top-[12%]" aria-label={`Hear again: put ${target} in the rocket`}>
        <span className="text-4xl font-black sm:text-5xl">{target}</span>
        <span className="grid max-w-[11rem] grid-cols-5 gap-1" aria-hidden="true">
          {Array.from({ length: target }, (_, index) => <span key={index} className={`h-5 w-5 rounded-full border-2 border-indigo-700 transition sm:h-6 sm:w-6 ${index < filled ? 'bg-amber-400' : 'bg-white'}`} />)}
        </span>
        <span className="text-xl" aria-hidden="true">🔊</span>
      </button>

      <div ref={rocketRef} className={`absolute left-1/2 top-[25%] z-10 h-[45%] w-[55%] max-w-64 -translate-x-1/2 ${wrong ? 'animate-shake' : ''}`}>
        <img src={ROCKET_ART} alt="Rocket waiting for fuel" className={`h-full w-full object-contain drop-shadow-[0_16px_18px_rgba(0,0,0,.45)] transition-transform ease-in ${launched ? '-translate-y-[120vh] duration-[1800ms]' : 'duration-300'}`} draggable={false} />
        {launched && <div className="pointer-events-none absolute bottom-[-3%] left-1/2 h-[30%] w-[23%] -translate-x-1/2 rounded-b-full bg-gradient-to-b from-yellow-200 via-orange-400 to-transparent blur-sm animate-pulse" />}
        <div className="absolute right-[-20%] top-[20%] flex h-[65%] w-9 flex-col-reverse gap-1 rounded-full border-[3px] border-sky-200 bg-slate-900/80 p-1 shadow-[0_0_18px_rgba(125,211,252,.8)] sm:w-12" role="progressbar" aria-label="Fuel tank" aria-valuemin={0} aria-valuemax={size} aria-valuenow={filled}>
          {Array.from({ length: size }, (_, index) => <span key={index} className={`flex-1 rounded-full transition-all duration-300 ${index < filled ? 'bg-gradient-to-r from-lime-300 to-green-500 animate-pop-in' : 'bg-slate-600'}`} />)}
        </div>
      </div>

      {!exact && (
        <button ref={launchRef} type="button" onClick={tryLaunch} disabled={filled === 0 || launched} aria-label="Launch the rocket" className="absolute bottom-[28%] right-[3%] z-20 flex h-16 items-center gap-1 rounded-full border-4 border-white bg-gradient-to-b from-amber-300 to-orange-500 px-3 font-black text-indigo-950 shadow-[0_6px_0_#9a3412] transition active:translate-y-1 active:shadow-none disabled:opacity-50 sm:h-20 sm:px-5">
          <RocketIcon size={32} strokeWidth={2.5} /> Launch!
        </button>
      )}

      <div ref={cansRef} className="absolute bottom-[3%] left-1/2 z-20 grid w-[94%] max-w-md -translate-x-1/2 grid-cols-5 gap-1.5 rounded-[1.6rem] border-4 border-sky-200/80 bg-sky-800/80 p-2 shadow-[0_12px_30px_rgba(0,0,0,.45)] backdrop-blur-sm sm:gap-2 sm:p-3">
        {cans.map((canId) => (
          <DragItem key={canId} label="Fuel can" data={{ can: canId }} disabled={launched || used.includes(canId)} onTap={() => addFuel(canId)} onDrop={(point) => addFuel(canId, point)} className={`aspect-[6/7] rounded-xl p-1 ${used.includes(canId) ? 'invisible' : 'bg-white/90 shadow-md'}`}>
            <FuelCan />
          </DragItem>
        ))}
      </div>
      <HandHint
        show={hint.showHint && !launched && (hintOnLaunch || nextCan != null)}
        from={() => (hintOnLaunch ? launchRef.current : cansRef.current?.querySelector(`[data-can="${nextCan}"]`))}
        mode="tap"
      />
    </div>
  );
};

const FuelUp = (props) => {
  const { speak, playSfx } = props;
  const [seed] = useState(() => Math.floor(Math.random() * 100000));

  return (
    <LittleGameShell
      {...props}
      gameId="fuelup"
      title="Fuel Up"
      intro={LITTLE_LINES.fuelIntro}
      background="from-sky-500 via-indigo-300 to-violet-200"
      playFullBleed
      startArt={<img src={ROCKET_ART} alt="Rocket" className="mx-auto h-64 w-auto object-contain drop-shadow-2xl" />}
      renderUnlock={(config) => (
        <div className="grid h-full w-full place-items-center rounded-xl bg-indigo-100 text-5xl font-black text-indigo-700">{Math.max(...config.numbers)}</div>
      )}
    >
      {({ round, complete, mistake, playId, config, level }) => {
        const order = seededShuffle(config.numbers, seed + playId);
        const target = order[round % order.length];
        const tankSize = Math.max(...config.numbers) <= 5 ? 5 : 10;
        return (
          <FuelRound
            key={`${playId}-${round}`}
            target={target}
            exact={level < 2}
            tankSize={tankSize}
            complete={complete}
            mistake={mistake}
            speak={speak}
            playSfx={playSfx}
            firstRound={round === 0}
          />
        );
      }}
    </LittleGameShell>
  );
};

export default FuelUp;
