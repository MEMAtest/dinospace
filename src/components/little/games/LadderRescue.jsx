import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LittleGameShell from '../LittleGameShell.jsx';
import HandHint from '../HandHint.jsx';
import { FireTruck } from '../VehicleArt.jsx';
import { useRoundHint } from '../useRoundHint.js';
import {
  LITTLE_LINES, RESCUE_ANIMALS, rescueDone, rescueFloorPrompt, rescuePrompt,
} from '../../../data/littleGames.js';
import { getOfflineVoiceClip } from '../../../data/offlineVoice.js';
import { pairRoundAttribution } from './pairAttemptAttribution.js';
import { buildLadderMissionTargets } from './rescueMissionLogic.js';

// Public sprites are intentionally lazy and local to this game. If an image is
// unavailable, the original emoji/SVG scene remains complete and playable.
const Animal = ({ animal, className = '', fixed = false }) => {
  const [failed, setFailed] = useState(false);
  const src = animal?.id ? `/art/rescue-animals-v2/animal-${animal.id}.webp` : '';
  return src && !failed
    ? <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} className={`object-contain ${fixed ? (className || 'h-full w-full') : `h-[85%] w-auto ${className}`}`} draggable={false} />
    : <span className={className} aria-hidden="true">{animal?.emoji || '🐾'}</span>;
};

const LadderTruckArt = ({ className = '', title }) => {
  const [failed, setFailed] = useState(false);
  return !failed
    ? <img src="/art/rescue-animals-v2/ladder-truck.webp" alt={title || ''} loading="lazy" decoding="async" onError={() => setFailed(true)} className={`object-contain ${className}`} draggable={false} />
    : <FireTruck className={className} title={title} showLadder={false} />;
};

// Scene coordinates in percent. The building sits on the right; the truck
// parks on the left and its ladder swings up from the truck roof.
const BUILDING = { left: 48, right: 94, top: 5, bottom: 88 };
const LADDER_BASE = { x: 30, y: 78 };

const LadderRound = ({ animals, targetFloor, byFloorNumber, complete, mistake, speak, cancelNarration, playSfx, firstRound }) => {
  const [wrongFloor, setWrongFloor] = useState(null);
  const [ladder, setLadder] = useState(0);
  const [rescued, setRescued] = useState(false);
  const [rescueStarted, setRescueStarted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const windowRefs = useRef({});
  const timersRef = useRef(new Set());
  const rafRef = useRef(null);
  const rescueStartedRef = useRef(false);
  const mountedRef = useRef(true);
  const wrongAttemptsRef = useRef(0);
  const hintExposedRef = useRef(false);
  const hint = useRoundHint({ demo: firstRound });
  const target = animals[targetFloor - 1];
  const prompt = byFloorNumber ? rescueFloorPrompt(targetFloor) : rescuePrompt(target);
  const floorHeight = (BUILDING.bottom - BUILDING.top) / animals.length;
  const windowY = BUILDING.bottom - (targetFloor - 0.5) * floorHeight;

  const schedule = useCallback((callback, delay) => {
    const timer = setTimeout(() => {
      timersRef.current.delete(timer);
      if (mountedRef.current) callback();
    }, delay);
    timersRef.current.add(timer);
    return timer;
  }, []);
  const clearScheduled = useCallback((timer) => {
    if (timer == null) return;
    clearTimeout(timer);
    timersRef.current.delete(timer);
  }, []);
  const introTimerRef = useRef(null);
  const wrongReplayTimerRef = useRef(null);
  const wrongResetTimerRef = useRef(null);
  const completionTimerRef = useRef(null);
  const successSpeechTimerRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    if (firstRound) {
      cancelNarration?.();
      speak?.(LITTLE_LINES.ladderIntro);
      introTimerRef.current = schedule(() => {
        if (!rescueStartedRef.current) speak?.(prompt);
      }, 3200);
    } else {
      cancelNarration?.();
      speak?.(prompt);
    }
    const activeTimers = timersRef.current;
    return () => {
      mountedRef.current = false;
      for (const timer of activeTimers) clearTimeout(timer);
      activeTimers.clear();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [cancelNarration, firstRound, prompt, schedule, speak]);

  const raiseLadder = useCallback(() => {
    const startedAt = performance.now();
    const step = (now) => {
      if (!mountedRef.current || !rescueStartedRef.current) return;
      const progress = Math.min(1, (now - startedAt) / 1000);
      setLadder(1 - (1 - progress) ** 3);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
      else rafRef.current = null;
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  const tapFloor = useCallback((floor) => {
    if (rescueStartedRef.current) return;
    clearScheduled(introTimerRef.current);
    hint.touch();
    if (floor !== targetFloor) {
      wrongAttemptsRef.current += 1;
      mistake?.();
      hint.mistake();
      clearScheduled(wrongReplayTimerRef.current);
      clearScheduled(wrongResetTimerRef.current);
      cancelNarration?.();
      playSfx?.('oops');
      setWrongFloor(floor);
      setFeedback(byFloorNumber
        ? `That is floor ${floor}. Listen for floor ${targetFloor}, then try again.`
        : `That is floor ${floor}. Find the ${target.name}, then try again.`);
      speak?.(LITTLE_LINES.ladderWrong);
      wrongResetTimerRef.current = schedule(() => setWrongFloor(null), 450);
      wrongReplayTimerRef.current = schedule(() => {
        if (!rescueStartedRef.current) speak?.(prompt);
      }, 1450);
      return;
    }

    // Lock synchronously before any state update or animation frame can run.
    rescueStartedRef.current = true;
    setRescueStarted(true);
    clearScheduled(introTimerRef.current);
    clearScheduled(wrongReplayTimerRef.current);
    clearScheduled(wrongResetTimerRef.current);
    setWrongFloor(null);
    setFeedback(`The ${target.name} is on the ladder. Bringing them down safely.`);
    cancelNarration?.();
    hint.touch();
    playSfx?.('whoosh');
    raiseLadder();
    successSpeechTimerRef.current = schedule(() => {
      if (!mountedRef.current || !rescueStartedRef.current) return;
      setRescued(true);
      playSfx?.('pop');
      speak?.(rescueDone(target));
    }, 1100);
    completionTimerRef.current = schedule(() => {
      if (!mountedRef.current || !rescueStartedRef.current) return;
      complete?.({
        praise: false,
        delay: 0,
        art: <div className="relative mx-auto max-w-xs"><LadderTruckArt className="w-full" /><Animal animal={target} fixed className="absolute -top-8 right-10 h-20 w-20" /></div>,
        review: (
          <div className="mx-auto max-w-sm rounded-2xl border-2 border-orange-200 bg-orange-50 p-3 text-orange-950">
            <p className="text-lg font-black">You rescued the {target.name} from floor {targetFloor}.</p>
            <p className="mt-1 font-bold">You matched the clue to the right window.</p>
          </div>
        ),
        ...pairRoundAttribution({ mistakes: wrongAttemptsRef.current, hintExposed: hintExposedRef.current }),
      });
    }, 2300);
  }, [byFloorNumber, cancelNarration, clearScheduled, complete, hint, mistake, playSfx, prompt, raiseLadder, schedule, speak, target, targetFloor]);

  const top = { x: BUILDING.left - 1, y: windowY };
  const end = { x: LADDER_BASE.x + (top.x - LADDER_BASE.x) * ladder, y: LADDER_BASE.y + (top.y - LADDER_BASE.y) * ladder };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-3 pb-4">
      <button
        type="button"
        onClick={() => {
          if (!rescueStartedRef.current) {
            clearScheduled(introTimerRef.current);
            cancelNarration?.();
            speak?.(prompt);
          }
        }}
        className="mx-auto mb-2 flex min-h-16 items-center gap-3 rounded-full bg-white/90 px-5 py-2 text-xl font-black text-slate-800 shadow-lg sm:text-2xl"
        aria-label={`Hear again: ${prompt}`}
        disabled={rescueStarted}
      >
        <span aria-hidden="true">🔊</span>
        {byFloorNumber ? <span className="text-4xl text-rose-600">{targetFloor}</span> : <Animal animal={target} fixed className="h-12 w-12" />}
      </button>
      {feedback && (
        <p role={rescueStarted ? 'status' : 'alert'} aria-live="polite" className="mx-auto mb-2 max-w-2xl rounded-xl border-2 border-amber-700 bg-amber-50 px-4 py-2 text-center font-black text-amber-950 shadow">
          {feedback}
        </p>
      )}

      <div className="relative mx-auto w-full overflow-hidden rounded-[2rem] border-[6px] border-white bg-gradient-to-b from-sky-300 to-sky-100 shadow-2xl" style={{ aspectRatio: '4 / 5', maxWidth: 'calc((100dvh - 11rem) * 0.8)' }}>
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
                aria-label={byFloorNumber ? `Floor ${floor}` : `Floor ${floor}, the ${animal.name}`}
                disabled={rescueStarted}
                className={`absolute left-[6%] right-[6%] flex items-center gap-2 disabled:cursor-default ${wrongFloor === floor ? 'animate-shake' : ''}`}
                style={{ bottom: `${index * (100 / animals.length) + (100 / animals.length) * 0.1}%`, height: `${(100 / animals.length) * 0.8}%` }}
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
          <LadderTruckArt className="w-full" title="Fire truck" />
          {rescued && <span className="absolute left-[30%] top-[-10%] grid h-16 w-16 place-items-center animate-bounce-up" aria-hidden="true"><Animal animal={target} fixed /></span>}
        </div>
      </div>
      <HandHint
        show={hint.showHint && !rescueStarted}
        onShown={() => { hintExposedRef.current = true; }}
        from={() => windowRefs.current[targetFloor]}
        mode="tap"
      />
    </div>
  );
};

const LadderRun = ({ config, round, complete, mistake, speak, cancelNarration, playSfx, firstRound, playOrdinal, playId }) => {
  const missions = useMemo(
    () => buildLadderMissionTargets(RESCUE_ANIMALS, config.floors, config.rounds, playOrdinal),
    [config.floors, config.rounds, playOrdinal],
  );
  const mission = missions[round];
  if (!mission) return null;
  return (
    <LadderRound
      key={`${playId}-${round}`}
      animals={mission.animals}
      targetFloor={mission.targetFloor}
      byFloorNumber={Boolean(config.numbers) && round % 2 === 1}
      complete={complete}
      mistake={mistake}
      speak={speak}
      cancelNarration={cancelNarration}
      playSfx={playSfx}
      firstRound={firstRound}
    />
  );
};

const LadderRescue = (props) => {
  const { speak, playSfx, soundOn, cancelNarration, onToggleSound } = props;
  const speechRef = useRef({ speak, soundOn, cancelNarration });
  useEffect(() => { speechRef.current = { speak, soundOn, cancelNarration }; }, [cancelNarration, soundOn, speak]);
  const speakPackaged = useCallback((text) => {
    const current = speechRef.current;
    if (current.soundOn === false || !getOfflineVoiceClip(text, 'en-US')) return false;
    current.speak?.(text, { premium: false, segments: [text] });
    return true;
  }, []);
  const toggleSound = useCallback(() => {
    speechRef.current.cancelNarration?.();
    onToggleSound?.();
  }, [onToggleSound]);

  return (
    <LittleGameShell
      {...props}
      gameId="ladder"
      title="Ladder Rescue"
      pairSafeProgress
      manualNext
      manualNextPrompt="The animal is safe. Ready for the next rescue?"
      manualNextReviewLabel="Ladder rescue review"
      intro={LITTLE_LINES.ladderIntro}
      background="from-red-400 via-rose-300 to-sky-200"
      speak={speakPackaged}
      onToggleSound={toggleSound}
      startArt={<div className="relative mx-auto max-w-sm"><LadderTruckArt className="w-full" title="Fire truck" /><span className="absolute -top-10 right-6 h-20 w-20 animate-wiggle" aria-hidden="true"><Animal animal={RESCUE_ANIMALS[0]} fixed /></span></div>}
      renderUnlock={(config) => (
        <div className="grid h-full w-full place-items-center rounded-xl bg-orange-200 text-3xl font-black text-slate-800">
          {config.unlock === 'numbers' ? '1 2 3' : `${config.floors} 🏢`}
        </div>
      )}
    >
      {({ round, complete, mistake, playId, playOrdinal, config, firstRound }) => (
        <LadderRun
          round={round}
          complete={complete}
          mistake={mistake}
          playId={playId}
          playOrdinal={playOrdinal}
          config={config}
          firstRound={firstRound}
          speak={speakPackaged}
          cancelNarration={cancelNarration}
          playSfx={playSfx}
        />
      )}
    </LittleGameShell>
  );
};

export default LadderRescue;
