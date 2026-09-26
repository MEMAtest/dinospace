import { useEffect, useRef, useState } from 'react';
import { Rocket as RocketIcon } from 'lucide-react';
import LittleGameShell from '../LittleGameShell.jsx';
import DragItem from '../DragItem.jsx';
import HandHint from '../HandHint.jsx';
import { FuelCan, FuelUpIcon, Rocket } from '../VehicleArt.jsx';
import { useRoundHint } from '../useRoundHint.js';
import { pointInRect, seededShuffle } from '../littleKit.js';
import { LITTLE_LINES, fuelPrompt } from '../../../data/littleGames.js';

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
    const timer = setTimeout(() => latest.current.complete({ praise: false, delay: 200, art: <Rocket colour="#f97316" className="mx-auto h-56 w-auto" /> }), 2100);
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
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-4 px-3 pb-5">
      <button type="button" onClick={() => speak?.(prompt)} className="flex items-center gap-3 rounded-[1.6rem] bg-white/85 px-5 py-2 shadow-lg" aria-label={`Hear again: put ${target} in the rocket`}>
        <span className="text-6xl font-black text-indigo-700 sm:text-7xl">{target}</span>
        <span className="grid max-w-[11rem] grid-cols-5 gap-1.5" aria-hidden="true">
          {Array.from({ length: target }, (_, index) => <span key={index} className={`h-6 w-6 rounded-full border-2 border-indigo-700 transition ${index < filled ? 'bg-amber-400' : 'bg-white'}`} />)}
        </span>
      </button>

      <div className="flex w-full flex-1 flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-center">
        <div className="flex flex-col items-center gap-3">
          <div ref={rocketRef} className={`relative flex items-end gap-3 rounded-[2rem] bg-indigo-950/80 px-6 pb-3 pt-6 shadow-2xl ${wrong ? 'animate-shake' : ''}`}>
            <div className={`w-28 transition-transform ease-in sm:w-36 ${launched ? '-translate-y-[120vh] duration-[1800ms]' : 'duration-300'}`}>
              <Rocket colour="#f97316" flameOn={launched} className="w-full" title="Rocket waiting for fuel" />
            </div>
            <div className="flex h-56 w-12 flex-col-reverse gap-1 rounded-2xl border-4 border-white bg-slate-700 p-1 sm:h-64" role="progressbar" aria-label="Fuel tank" aria-valuemin={0} aria-valuemax={size} aria-valuenow={filled}>
              {Array.from({ length: size }, (_, index) => (
                <span key={index} className={`flex-1 rounded-md transition-all duration-300 ${index < filled ? 'bg-gradient-to-r from-lime-300 to-green-500 animate-pop-in' : 'bg-slate-600'}`} />
              ))}
            </div>
          </div>
          {!exact && (
            <button
              ref={launchRef}
              type="button"
              onClick={tryLaunch}
              disabled={filled === 0 || launched}
              aria-label="Launch the rocket"
              className="grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-gradient-to-b from-orange-400 to-red-600 text-white shadow-[0_6px_0_#991b1b] transition active:translate-y-1 active:shadow-none disabled:opacity-40"
            >
              <RocketIcon size={40} strokeWidth={2.5} />
            </button>
          )}
        </div>

        <div ref={cansRef} className="grid w-full max-w-sm grid-cols-5 gap-2 rounded-[1.6rem] bg-white/50 p-3 shadow-inner">
          {cans.map((canId) => (
            <DragItem
              key={canId}
              label="Fuel can"
              data={{ can: canId }}
              disabled={launched || used.includes(canId)}
              onTap={() => addFuel(canId)}
              onDrop={(point) => addFuel(canId, point)}
              className={`aspect-[6/7] rounded-xl p-1 ${used.includes(canId) ? 'invisible' : 'bg-white/80 shadow-md'}`}
            >
              <FuelCan />
            </DragItem>
          ))}
        </div>
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
      startArt={<FuelUpIcon className="mx-auto h-64 w-auto" />}
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
