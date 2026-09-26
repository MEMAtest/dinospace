import { useEffect, useRef, useState } from 'react';
import LittleGameShell from '../LittleGameShell.jsx';
import { FireTruck } from '../VehicleArt.jsx';
import { shuffled } from '../littleKit.js';
import {
  LADDER_FLOORS, LITTLE_LINES, RESCUE_ANIMALS, rescueDone, rescueFloorPrompt, rescuePrompt,
} from '../../../data/littleGames.js';

const LadderRound = ({ floors, byFloorNumber, complete, speak, playSfx, firstRound }) => {
  // animals[0] lives on floor 1 (the bottom).
  const [animals] = useState(() => shuffled(RESCUE_ANIMALS).slice(0, floors));
  const [targetFloor] = useState(() => 1 + Math.floor(Math.random() * floors));
  const [wrongFloor, setWrongFloor] = useState(null);
  const [ladderFloor, setLadderFloor] = useState(0);
  const [rescued, setRescued] = useState(false);
  const timers = useRef([]);
  const target = animals[targetFloor - 1];
  const prompt = byFloorNumber ? rescueFloorPrompt(targetFloor) : rescuePrompt(target);

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

  const tapFloor = (floor) => {
    if (ladderFloor) return;
    if (floor !== targetFloor) {
      playSfx?.('oops');
      setWrongFloor(floor);
      speak?.(LITTLE_LINES.ladderWrong);
      timers.current.push(setTimeout(() => setWrongFloor(null), 450));
      timers.current.push(setTimeout(() => speak?.(prompt), 1600));
      return;
    }
    playSfx?.('whoosh');
    setLadderFloor(floor);
    timers.current.push(setTimeout(() => {
      setRescued(true);
      playSfx?.('pop');
      speak?.(rescueDone(target));
    }, 1100));
    timers.current.push(setTimeout(() => complete({ praise: false, delay: 1500 }), 1600));
  };

  const floorHeight = 100 / floors;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-3 pb-4">
      <button
        type="button"
        onClick={() => speak?.(prompt)}
        className="mx-auto mb-3 flex items-center gap-3 rounded-full bg-white/85 px-5 py-2 text-2xl font-black text-slate-800 shadow-lg"
        aria-label={`Hear again: ${prompt}`}
      >
        <span aria-hidden="true">🔊</span>
        {byFloorNumber ? <span className="text-4xl text-rose-600">{targetFloor}</span> : <span className="text-5xl">{target.emoji}</span>}
      </button>

      <div className="relative w-full flex-1 overflow-hidden rounded-[2rem] border-[6px] border-white bg-gradient-to-b from-sky-300 to-sky-100 shadow-2xl" style={{ minHeight: '60vh' }}>
        <div className="absolute inset-x-0 bottom-0 h-[12%] bg-gradient-to-b from-slate-400 to-slate-600" />
        {/* The building: floor 1 at the bottom. */}
        <div className="absolute bottom-[12%] right-[6%] top-[5%] w-[46%] rounded-t-xl border-4 border-slate-800 bg-orange-300">
          {animals.map((animal, index) => {
            const floor = index + 1;
            const gone = rescued && floor === targetFloor;
            return (
              <button
                key={animal.id}
                type="button"
                onClick={() => tapFloor(floor)}
                aria-label={byFloorNumber ? `Floor ${floor}` : `The ${animal.name}`}
                className={`absolute left-[6%] right-[6%] flex items-center gap-2 transition ${wrongFloor === floor ? 'animate-shake' : ''}`}
                style={{ bottom: `${index * floorHeight + floorHeight * 0.1}%`, height: `${floorHeight * 0.8}%` }}
              >
                <span className="grid h-full w-8 place-items-center rounded-lg bg-slate-800 text-lg font-black text-white sm:w-10 sm:text-2xl">{floor}</span>
                <span className="grid h-full flex-1 place-items-center rounded-xl border-4 border-slate-800 bg-sky-100 text-4xl shadow-inner sm:text-6xl">
                  <span className={gone ? 'opacity-0 transition-opacity' : 'animate-wiggle'}>{animal.emoji}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Ladder rising from the truck to the chosen floor. */}
        <div
          className="pointer-events-none absolute left-[40%] w-[9%] origin-bottom transition-[height] duration-1000 ease-out"
          style={{ bottom: '22%', height: ladderFloor ? `${Math.max(4, (ladderFloor - 0.5) * (83 / floors) - 10)}%` : '0%' }}
          aria-hidden="true"
        >
          <div className="h-full w-full rounded-md border-x-[6px] border-slate-700" style={{ backgroundImage: 'repeating-linear-gradient(to top, transparent 0 14px, #475569 14px 20px)' }} />
        </div>

        <div className="pointer-events-none absolute bottom-[4%] left-[2%] w-[48%]">
          <FireTruck className="w-full" title="Fire truck" showLadder={false} />
          {rescued && <span className="absolute left-[30%] top-[18%] text-4xl animate-bounce-up sm:text-6xl" aria-hidden="true">{target.emoji}</span>}
        </div>
      </div>
    </div>
  );
};

const LadderRescue = (props) => {
  const { bigKid, speak, playSfx } = props;
  const floors = LADDER_FLOORS[bigKid ? 'big' : 'little'];

  return (
    <LittleGameShell
      {...props}
      gameId="ladder"
      title="Ladder Rescue"
      intro={LITTLE_LINES.ladderIntro}
      rounds={5}
      background="from-red-400 via-rose-300 to-sky-200"
      startArt={<div className="relative mx-auto max-w-sm"><FireTruck className="w-full" title="Fire truck" /><span className="absolute -top-10 right-6 text-6xl animate-wiggle" aria-hidden="true">🐱</span></div>}
    >
      {({ round, complete, playId }) => (
        <LadderRound
          key={`${playId}-${round}`}
          floors={floors}
          byFloorNumber={Boolean(bigKid) && round % 2 === 1}
          complete={complete}
          speak={speak}
          playSfx={playSfx}
          firstRound={round === 0}
        />
      )}
    </LittleGameShell>
  );
};

export default LadderRescue;
