import { useEffect, useRef, useState } from 'react';
import LittleGameShell from '../LittleGameShell.jsx';
import DragItem from '../DragItem.jsx';
import { FuelCan, Rocket } from '../VehicleArt.jsx';
import { pointInRect, shuffled } from '../littleKit.js';
import { FUEL_NUMBERS, LITTLE_LINES, fuelPrompt } from '../../../data/littleGames.js';

const FuelRound = ({ target, complete, speak, playSfx, prompt }) => {
  const [filled, setFilled] = useState(0);
  const [launched, setLaunched] = useState(false);
  const [cans] = useState(() => Array.from({ length: Math.min(10, target + 3) }, (_, index) => index));
  const [used, setUsed] = useState([]);
  const rocketRef = useRef(null);
  const full = filled >= target;

  useEffect(() => { speak?.(prompt); }, [prompt, speak]);

  const latest = useRef({ complete, speak, playSfx });
  useEffect(() => { latest.current = { complete, speak, playSfx }; });

  useEffect(() => {
    if (!full) return undefined;
    const t1 = setTimeout(() => {
      latest.current.speak?.(LITTLE_LINES.fuelFull);
      latest.current.playSfx?.('launch');
      setLaunched(true);
    }, 900);
    const t2 = setTimeout(() => latest.current.complete({ praise: false, delay: 200 }), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [full]);

  const addFuel = (canId, point) => {
    if (full || used.includes(canId)) return true;
    if (point && !pointInRect(point, rocketRef.current?.getBoundingClientRect(), 30)) return false;
    const next = filled + 1;
    setFilled(next);
    setUsed((current) => [...current, canId]);
    playSfx?.('pop');
    speak?.(String(next));
    return true;
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-4 px-3 pb-5">
      <div className="flex items-center gap-3 rounded-[1.6rem] bg-white/80 px-5 py-2 shadow-lg" aria-label={`Put ${target} in the rocket`}>
        <span className="text-6xl font-black text-indigo-700 sm:text-7xl">{target}</span>
        <span className="grid max-w-[11rem] grid-cols-5 gap-1.5">
          {Array.from({ length: target }, (_, index) => <span key={index} className={`h-6 w-6 rounded-full border-2 border-indigo-700 transition ${index < filled ? 'bg-amber-400' : 'bg-white'}`} />)}
        </span>
      </div>

      <div className="flex w-full flex-1 flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-center">
        <div ref={rocketRef} className="relative flex items-end gap-3 rounded-[2rem] bg-indigo-950/80 px-6 pb-3 pt-6 shadow-2xl">
          <div className={`w-28 transition-transform ease-in sm:w-36 ${launched ? '-translate-y-[120vh] duration-[1800ms]' : 'duration-300'}`}>
            <Rocket colour="#f97316" flameOn={launched} className="w-full" title="Rocket waiting for fuel" />
          </div>
          <div className="flex h-56 w-12 flex-col-reverse gap-1 rounded-2xl border-4 border-white bg-slate-700 p-1 sm:h-64" role="progressbar" aria-label="Fuel tank" aria-valuemin={0} aria-valuemax={target} aria-valuenow={filled}>
            {Array.from({ length: target }, (_, index) => (
              <span key={index} className={`flex-1 rounded-lg transition-all duration-300 ${index < filled ? 'bg-gradient-to-r from-lime-300 to-green-500 animate-pop-in' : 'bg-slate-600'}`} />
            ))}
          </div>
        </div>

        <div className="grid w-full max-w-sm grid-cols-5 gap-2 rounded-[1.6rem] bg-white/50 p-3 shadow-inner">
          {cans.map((canId) => (
            <DragItem
              key={canId}
              label="Fuel can"
              disabled={full || used.includes(canId)}
              onTap={() => addFuel(canId)}
              onDrop={(point) => addFuel(canId, point)}
              className={`aspect-[6/7] rounded-xl p-1 ${used.includes(canId) ? 'invisible' : 'bg-white/80 shadow-md'}`}
            >
              <FuelCan />
            </DragItem>
          ))}
        </div>
      </div>
    </div>
  );
};

const FuelUp = (props) => {
  const { bigKid, speak, playSfx } = props;
  const pool = FUEL_NUMBERS[bigKid ? 'big' : 'little'];
  const [targets, setTargets] = useState(() => shuffled(pool).slice(0, 5));

  return (
    <LittleGameShell
      {...props}
      gameId="fuelup"
      title="Fuel Up"
      intro={LITTLE_LINES.fuelIntro}
      rounds={targets.length}
      background="from-sky-500 via-indigo-300 to-violet-200"
      startArt={<Rocket colour="#f97316" className="mx-auto h-64 w-auto rotate-12" title="A rocket" />}
    >
      {({ round, complete, playId }) => (
        <FuelRound
          key={`${playId}-${round}`}
          target={targets[round]}
          prompt={fuelPrompt(targets[round])}
          complete={(options) => { if (round + 1 >= targets.length) setTargets(shuffled(pool).slice(0, 5)); complete(options); }}
          speak={speak}
          playSfx={playSfx}
        />
      )}
    </LittleGameShell>
  );
};

export default FuelUp;
