import { useCallback, useEffect, useRef, useState } from 'react';
import { Rocket as RocketIcon } from 'lucide-react';
import LittleGameShell from '../LittleGameShell.jsx';
import DragItem from '../DragItem.jsx';
import HandHint from '../HandHint.jsx';
import { FuelCan } from '../VehicleArt.jsx';
import { useRoundHint } from '../useRoundHint.js';
import { pointInRect } from '../littleKit.js';
import { LITTLE_LINES, fuelPrompt } from '../../../data/littleGames.js';
import { getOfflineVoiceClip } from '../../../data/offlineVoice.js';
import { artUrl } from '../littleArt.js';
import { buildFuelTargetOrder } from './fuelUpLogic.js';
import { pairRoundAttribution } from './pairAttemptAttribution.js';

const ROCKET_ART = artUrl('fuel-rocket');

// Levels 1–2: the tank has exactly the right number of spaces and launches
// by itself when full. From level 3 the tank is bigger than the number, so
// the child must count and stop, then press the launch button.
const FuelRound = ({ target, exact, tankSize, complete, mistake, speak, playSfx, firstRound }) => {
  const [filled, setFilled] = useState(0);
  const [launched, setLaunched] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [cans] = useState(() => Array.from({ length: Math.min(10, tankSize + 2) }, (_, index) => index));
  const [used, setUsed] = useState([]);
  const rocketRef = useRef(null);
  const cansRef = useRef(null);
  const launchRef = useRef(null);
  const autoLaunchTimer = useRef(null);
  const wrongAnimationTimer = useRef(null);
  const launchTimer = useRef(null);
  const hintExposedRef = useRef(false);
  const markHintShown = useCallback(() => { hintExposedRef.current = true; }, []);
  const hint = useRoundHint({ demo: firstRound });
  const size = exact ? target : tankSize;
  const prompt = fuelPrompt(target);

  useEffect(() => { speak?.(prompt); }, [prompt, speak]);

  useEffect(() => () => {
    clearTimeout(autoLaunchTimer.current);
    clearTimeout(wrongAnimationTimer.current);
    clearTimeout(launchTimer.current);
  }, []);

  const latest = useRef({ complete, speak, playSfx, mistakes: hint.mistakes });
  useEffect(() => { latest.current = { complete, speak, playSfx, mistakes: hint.mistakes }; });

  useEffect(() => {
    if (!launched) return undefined;
    latest.current.speak?.(filled === size ? LITTLE_LINES.fuelFull : LITTLE_LINES.countdown[3]);
    latest.current.playSfx?.('launch');
    launchTimer.current = setTimeout(() => {
      launchTimer.current = null;
      latest.current.complete({
        praise: false,
        delay: 200,
        art: <img src={ROCKET_ART} alt="Launched rocket" className="mx-auto h-56 w-auto object-contain" />,
        ...pairRoundAttribution({ mistakes: latest.current.mistakes, hintExposed: hintExposedRef.current }),
        review: (
          <div className="mx-auto max-w-xs rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-3 text-indigo-950">
            <p className="text-lg font-black">Target: {target} fuel {target === 1 ? 'can' : 'cans'}</p>
            <div className="my-2 flex flex-wrap justify-center gap-1" aria-hidden="true">
              {used.map((canId) => <FuelCan key={canId} className="h-10 w-9" />)}
            </div>
            <p className="font-bold">You counted {filled}. The rocket needed {target}.</p>
            {getOfflineVoiceClip(String(filled)) && (
              <button type="button" onClick={() => latest.current.speak?.(String(filled))} aria-label={`Hear the number ${filled} again`} className="mt-2 min-h-12 rounded-full border-2 border-indigo-700 bg-white px-4 font-black text-indigo-950">
                🔊 Hear the number {filled}
              </button>
            )}
          </div>
        ),
      });
    }, 2100);
    return () => clearTimeout(launchTimer.current);
  }, [filled, launched, size, target, used]);

  const addFuel = (canId, point) => {
    if (launched || used.includes(canId) || filled >= size) return true;
    if (point && !pointInRect(point, rocketRef.current?.getBoundingClientRect(), 30)) return false;
    clearTimeout(autoLaunchTimer.current);
    autoLaunchTimer.current = null;
    const next = filled + 1;
    hint.touch();
    setFilled(next);
    setUsed((current) => [...current, canId]);
    setFeedback('');
    playSfx?.('pop');
    speak?.(String(next));
    if (exact && next >= target) {
      autoLaunchTimer.current = setTimeout(() => {
        autoLaunchTimer.current = null;
        setLaunched(true);
      }, 800);
    }
    return true;
  };

  const undoLastCan = () => {
    if (launched || used.length === 0) return;
    clearTimeout(autoLaunchTimer.current);
    autoLaunchTimer.current = null;
    const nextUsed = used.slice(0, -1);
    const nextFilled = Math.max(0, filled - 1);
    setUsed(nextUsed);
    setFilled(nextFilled);
    setFeedback('');
    setWrong(false);
    hint.touch();
    speak?.(String(nextFilled));
  };

  const tryLaunch = () => {
    if (launched) return;
    if (filled === target) {
      setLaunched(true);
      return;
    }
    // Keep the child's count visible and let them correct one can at a time.
    playSfx?.('oops');
    speak?.(LITTLE_LINES.fuelRecount);
    hint.mistake();
    mistake();
    setWrong(true);
    clearTimeout(wrongAnimationTimer.current);
    wrongAnimationTimer.current = setTimeout(() => {
      wrongAnimationTimer.current = null;
      setWrong(false);
    }, 450);
    const difference = target - filled;
    setFeedback(difference > 0
      ? `You have ${filled} fuel ${filled === 1 ? 'can' : 'cans'}. The rocket needs ${target}; add ${difference} more or undo the last can to count again.`
      : `You have ${filled} fuel cans, but the rocket needs ${target}. Undo ${Math.abs(difference)} ${Math.abs(difference) === 1 ? 'can' : 'cans'} to count again.`);
  };

  const nextCan = cans.find((id) => !used.includes(id));
  const hintOnLaunch = !exact && filled === target;

  return (
    <div className="absolute inset-0 overflow-hidden text-center text-white">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-transparent to-indigo-950/50" />
      <button type="button" onClick={() => speak?.(prompt)} className="absolute left-1/2 top-[11%] z-20 flex w-max max-w-[90%] -translate-x-1/2 items-center gap-3 rounded-[1.6rem] border-4 border-white bg-white/95 px-4 py-2 text-indigo-950 shadow-xl sm:top-[12%]" aria-label={`Hear again: put ${target} in the rocket`}>
        <span className="flex min-w-16 flex-col text-left">
          <span className="text-4xl font-black sm:text-5xl">{target}</span>
          <span className="text-xs font-extrabold leading-tight sm:text-sm">Put {target} fuel {target === 1 ? 'can' : 'cans'} in the rocket</span>
        </span>
        <span className="grid max-w-[11rem] grid-cols-5 gap-1" aria-hidden="true">
          {Array.from({ length: target }, (_, index) => <span key={index} className={`h-5 w-5 rounded-full border-2 border-indigo-700 transition sm:h-6 sm:w-6 ${index < filled ? 'bg-amber-400' : 'bg-white'}`} />)}
        </span>
        {getOfflineVoiceClip(prompt) && <span className="text-xl" aria-hidden="true">🔊</span>}
      </button>
      {feedback && <p role="alert" aria-live="assertive" className="absolute left-1/2 top-[20%] z-30 w-max max-w-[92%] -translate-x-1/2 rounded-xl border-2 border-amber-200 bg-white/95 px-3 py-2 text-sm font-black text-indigo-950 shadow-lg sm:text-base">{feedback}</p>}

      <div ref={rocketRef} className={`absolute left-1/2 top-[25%] z-10 h-[45%] w-[55%] max-w-64 -translate-x-1/2 ${wrong ? 'animate-shake' : ''}`}>
        <img src={ROCKET_ART} alt="Rocket waiting for fuel" className={`h-full w-full object-contain drop-shadow-[0_16px_18px_rgba(0,0,0,.45)] transition-transform ease-in ${launched ? '-translate-y-[120vh] duration-[1800ms]' : 'duration-300'}`} draggable={false} />
        {launched && <div className="pointer-events-none absolute bottom-[-3%] left-1/2 h-[30%] w-[23%] -translate-x-1/2 rounded-b-full bg-gradient-to-b from-yellow-200 via-orange-400 to-transparent blur-sm animate-pulse" />}
        <div className="absolute right-[-20%] top-[20%] flex h-[65%] w-9 flex-col-reverse gap-1 rounded-full border-[3px] border-sky-200 bg-slate-900/80 p-1 shadow-[0_0_18px_rgba(125,211,252,.8)] sm:w-12" role="progressbar" aria-label="Fuel tank" aria-valuemin={0} aria-valuemax={size} aria-valuenow={filled}>
          {Array.from({ length: size }, (_, index) => <span key={index} className={`flex-1 rounded-full transition-all duration-300 ${index < filled ? 'bg-gradient-to-r from-lime-300 to-green-500 animate-pop-in' : 'bg-slate-600'}`} />)}
        </div>
      </div>

      <div ref={cansRef} className="absolute bottom-[3%] left-1/2 z-20 w-[94%] max-w-md -translate-x-1/2 rounded-[1.6rem] border-4 border-sky-200/80 bg-sky-800/80 p-2 shadow-[0_12px_30px_rgba(0,0,0,.45)] backdrop-blur-sm sm:p-3">
        <div className="mb-2 grid grid-cols-[1fr_auto_auto] items-center gap-1.5 sm:gap-2">
          <p className="whitespace-nowrap rounded-lg bg-white/95 px-2 py-1 text-xs font-black text-indigo-950 sm:text-sm" aria-live="polite">Count: {filled} of {target}</p>
          <button type="button" onClick={undoLastCan} disabled={launched || used.length === 0} aria-label="Undo last fuel can" className="min-h-11 rounded-full border-2 border-white bg-amber-300 px-2 text-xs font-black text-indigo-950 shadow disabled:opacity-50 sm:px-4 sm:text-sm">Undo last can</button>
          {!exact && <button ref={launchRef} type="button" onClick={tryLaunch} disabled={filled === 0 || launched} aria-label="Launch the rocket" className="flex min-h-11 items-center gap-1 rounded-full border-2 border-white bg-gradient-to-b from-amber-300 to-orange-500 px-2 text-xs font-black text-indigo-950 shadow-[0_4px_0_#9a3412] transition active:translate-y-1 active:shadow-none disabled:opacity-50 sm:px-4 sm:text-sm">
            <RocketIcon size={20} strokeWidth={2.5} /> Launch!
          </button>}
        </div>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {cans.map((canId) => (
            <DragItem key={canId} label={`Fuel can ${canId + 1}`} data={{ can: canId }} disabled={launched || used.includes(canId)} onTap={() => addFuel(canId)} onDrop={(point) => addFuel(canId, point)} className={`aspect-[6/7] rounded-xl p-1 ${used.includes(canId) ? 'invisible' : 'bg-white/90 shadow-md'}`}>
              <FuelCan />
            </DragItem>
          ))}
        </div>
      </div>
      <HandHint
        show={hint.showHint && !launched && (hintOnLaunch || nextCan != null)}
        onShown={markHintShown}
        from={() => (hintOnLaunch ? launchRef.current : cansRef.current?.querySelector(`[data-can="${nextCan}"]`))}
        mode="tap"
      />
    </div>
  );
};

const FuelUp = (props) => {
  const { speak, playSfx, soundOn } = props;
  const [seed] = useState(() => Math.floor(Math.random() * 100000));
  const speechRef = useRef({ speak, soundOn });
  useEffect(() => { speechRef.current = { speak, soundOn }; }, [soundOn, speak]);
  const speakPackaged = useCallback((text) => {
    const current = speechRef.current;
    if (current.soundOn === false || !getOfflineVoiceClip(text)) return;
    current.speak?.(text, { premium: false, segments: [text] });
  }, []);

  return (
    <LittleGameShell
      {...props}
      gameId="fuelup"
      title="Fuel Up"
      pairSafeProgress
      intro={LITTLE_LINES.fuelIntro}
      background="from-sky-500 via-indigo-300 to-violet-200"
      playFullBleed
      manualNext
      speak={speakPackaged}
      startArt={<img src={ROCKET_ART} alt="Rocket" className="mx-auto h-64 w-auto object-contain drop-shadow-2xl" />}
      renderUnlock={(config) => (
        <div className="grid h-full w-full place-items-center rounded-xl bg-indigo-100 text-5xl font-black text-indigo-700">{Math.max(...config.numbers)}</div>
      )}
    >
      {({ round, complete, mistake, playId, playOrdinal, config, level }) => {
        const order = buildFuelTargetOrder(config.numbers, config.rounds, playOrdinal, seed);
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
            speak={speakPackaged}
            playSfx={playSfx}
            firstRound={round === 0}
          />
        );
      }}
    </LittleGameShell>
  );
};

export default FuelUp;
