import { useCallback, useEffect, useRef, useState } from 'react';
import LittleGameShell from '../LittleGameShell.jsx';
import HandHint from '../HandHint.jsx';
import { Smoke } from '../VehicleArt.jsx';
import { artUrl } from '../littleArt.js';
import { useRoundHint } from '../useRoundHint.js';
import { LITTLE_LINES } from '../../../data/littleGames.js';
import { getOfflineVoiceClip } from '../../../data/offlineVoice.js';
import { pairRoundAttribution } from './pairAttemptAttribution.js';
import { bindRescuePauseCancellation, buildFireMissionTargets, exactRescueSegments } from './rescueMissionLogic.js';

// Positions are percentages of the authored scene. The house stays on the
// right and the truck stays on the left, so the hose sprays across the scene.
const FIRE_SPOTS = [
  { x: 52, y: 44 }, { x: 70, y: 44 }, { x: 88, y: 44 },
  { x: 52, y: 66 }, { x: 88, y: 66 }, { x: 70, y: 24 },
];
const NOZZLE = { x: 28, y: 83 };
const HOUSE_COLOURS = ['#fca5a5', '#fde68a', '#bfdbfe', '#c4b5fd', '#bbf7d0'];
const HIT_RADIUS = 11;
const SPRAY_MS = 1200;
const EMPTY_AIM_GUIDANCE_MS = 650;
const RESCUE_TRUCK = artUrl('rescue-firetruck');
const RESCUE_FLAME = artUrl('rescue-flame');

const RescueTruck = ({ className = '' }) => <img src={RESCUE_TRUCK} alt="Fire truck" className={`object-contain ${className}`} draggable={false} />;
const RescueFlame = ({ className = '', style }) => <img src={RESCUE_FLAME} alt="" className={`object-contain ${className}`} style={style} draggable={false} />;

const FireRound = ({ count, targetSpots, houseColour, complete, speak, playSfx, firstRound, playId, round }) => {
  const hint = useRoundHint({ demo: firstRound });
  const [initialFires] = useState(() => targetSpots.map((spot, id) => ({ ...spot, id, health: 1 })));
  const [fires, setFires] = useState(initialFires);
  // The RAF loop owns the current health values; React state is its render mirror.
  const firesRef = useRef(initialFires);
  const [aim, setAim] = useState(null);
  const [guidance, setGuidance] = useState('Hold the water on a flame to put it out.');
  const sceneRef = useRef(null);
  const aimRef = useRef(null);
  const holdingRef = useRef(false);
  const emptyAimSinceRef = useRef(null);
  const outCountRef = useRef(0);
  const hintExposedRef = useRef(false);
  const emptyAimGuidanceRef = useRef(false);
  const completedRef = useRef(false);
  const latest = useRef({ complete, speak, playSfx });
  useEffect(() => { latest.current = { complete, speak, playSfx }; });

  const allOut = fires.length > 0 && fires.every((fire) => fire.health <= 0);
  const firesLeft = fires.filter((fire) => fire.health > 0).length;

  const stopSpray = useCallback(() => {
    holdingRef.current = false;
    emptyAimSinceRef.current = null;
    aimRef.current = null;
    setAim(null);
  }, []);

  const exposeGuidance = useCallback(() => {
    if (emptyAimGuidanceRef.current) return;
    emptyAimGuidanceRef.current = true;
    hintExposedRef.current = true;
    setGuidance('Keep the water on the flame. Hold to spray.');
  }, []);

  useEffect(() => {
    speak?.(firstRound ? LITTLE_LINES.fireIntro : LITTLE_LINES.fireStart);
  }, [firstRound, speak]);

  useEffect(() => {
    const unbind = bindRescuePauseCancellation(document, window, stopSpray);
    return () => { unbind(); stopSpray(); };
  }, [stopSpray]);

  useEffect(() => {
    if (!allOut || completedRef.current) return undefined;
    const timer = setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      latest.current.speak?.(`${count} ${LITTLE_LINES.fireDone}`, {
        premium: false,
        segments: [String(count), LITTLE_LINES.fireDone],
      });
      latest.current.complete({
        praise: false,
        delay: 1800,
        art: <RescueTruck className="mx-auto w-full max-w-xs" />,
        ...pairRoundAttribution({ mistakes: hint.mistakes, hintExposed: hintExposedRef.current }),
        review: (
          <div className="mx-auto max-w-sm rounded-2xl border-2 border-orange-200 bg-orange-50 p-3 text-orange-950">
            <p className="text-lg font-black">You put out all {count} {count === 1 ? 'fire' : 'fires'}.</p>
            <p className="mt-1 font-bold">You held the water on each flame until it went out.</p>
          </div>
        ),
      });
    }, 450);
    return () => clearTimeout(timer);
  }, [allOut, count, hint.mistakes]);

  useEffect(() => {
    let frame;
    let last = performance.now();
    const tick = (now) => {
      // A suspended tab must not count its entire hidden interval as spray.
      const dt = Math.min(50, Math.max(0, now - last));
      last = now;
      const target = aimRef.current;
      if (holdingRef.current && target) {
        let foundFire = false;
        let changed = false;
        const next = firesRef.current.map((fire) => {
          if (fire.health <= 0 || Math.hypot(fire.x - target.x, fire.y - target.y) > HIT_RADIUS) return fire;
          foundFire = true;
          changed = true;
          const health = Math.max(0, fire.health - dt / SPRAY_MS);
          if (health === 0) {
            outCountRef.current += 1;
            latest.current.playSfx?.('splash');
            if (outCountRef.current < count) latest.current.speak?.(String(outCountRef.current));
          }
          return { ...fire, health };
        });
        if (foundFire) {
          emptyAimSinceRef.current = null;
          setGuidance('Keep holding the water on the flame.');
        } else {
          if (emptyAimSinceRef.current == null) emptyAimSinceRef.current = now;
          if (now - emptyAimSinceRef.current >= EMPTY_AIM_GUIDANCE_MS) exposeGuidance();
        }
        if (changed) {
          firesRef.current = next;
          setFires(next);
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [count, exposeGuidance]);

  const toScene = (event) => {
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect?.width || !rect?.height) return null;
    return { x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 };
  };

  const beginSpray = (point) => {
    if (!point || allOut) return;
    holdingRef.current = true;
    hint.touch();
    aimRef.current = point;
    setAim(point);
    playSfx?.('swish');
  };

  const startPointerSpray = (event) => {
    if (event.button != null && event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    beginSpray(toScene(event));
  };

  const moveSpray = (event) => {
    if (!holdingRef.current) return;
    const point = toScene(event);
    if (!point) return;
    aimRef.current = point;
    setAim(point);
  };

  const startKeyboardSpray = (event, fire) => {
    if (![' ', 'Enter'].includes(event.key) || event.repeat) return;
    event.preventDefault();
    event.stopPropagation();
    beginSpray({ x: fire.x, y: fire.y });
  };

  const stopKeyboardSpray = (event) => {
    if (![' ', 'Enter'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    stopSpray();
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        ref={sceneRef}
        onPointerDown={startPointerSpray}
        onPointerMove={moveSpray}
        onPointerLeave={stopSpray}
        onPointerUp={stopSpray}
        onPointerCancel={stopSpray}
        onLostPointerCapture={stopSpray}
        onContextMenu={(event) => event.preventDefault()}
        role="application"
        aria-label="Hold and aim water at the flames. Keyboard users can focus a flame and hold Space or Enter."
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
          {[{ x: 52, y: 44 }, { x: 70, y: 44 }, { x: 88, y: 44 }, { x: 52, y: 66 }, { x: 88, y: 66 }].map((window) => (
            <div key={`${window.x}-${window.y}`} className="absolute h-[13%] w-[11%] -translate-x-1/2 -translate-y-1/2 rounded-md border-4 border-slate-800 bg-sky-200" style={{ left: `${window.x}%`, top: `${window.y}%` }} />
          ))}
        </>
        )}

        <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => speak?.(LITTLE_LINES.fireStart)} className="absolute left-[3%] top-[11%] z-20 rounded-[1.4rem] border-4 border-white bg-white/95 px-4 py-2 text-lg font-black text-blue-950 shadow-xl sm:text-xl" aria-label="Hear again: spray the fire">
          Spray the fire! 🔊
        </button>
        <div className="pointer-events-none absolute right-[3%] top-[11%] z-20 rounded-full border-4 border-white bg-white/95 px-3 py-2 text-lg font-black text-orange-600 shadow-xl" role="status" aria-label={`${firesLeft} ${firesLeft === 1 ? 'fire' : 'fires'} left`}>
          🔥 {firesLeft}
        </div>
        <div role="status" aria-live="polite" className="pointer-events-none absolute left-[3%] top-[18%] z-20 w-[min(34%,13rem)] rounded-xl border-2 border-sky-900/20 bg-white/95 px-3 py-2 text-center text-sm font-black text-slate-900 shadow-lg sm:text-base">
          {guidance}
        </div>

        {fires.map((fire) => (
          <div key={`${playId}-${round}-${fire.id}`} data-fire={fire.health > 0 ? 'burning' : 'out'} className="pointer-events-none absolute -translate-x-1/2 -translate-y-[70%]" style={{ left: `${fire.x}%`, top: `${fire.y}%`, width: '19%' }}>
            {fire.health > 0
              ? <RescueFlame className="w-full animate-flicker" style={{ transform: `scale(${0.35 + fire.health * 0.65})`, transformOrigin: '50% 90%' }} />
              : <Smoke className="w-full animate-float-up" />}
            <div className="mx-auto mt-[-4%] h-2 w-4/5 overflow-hidden rounded-full border border-slate-900 bg-white/90 shadow" role="progressbar" aria-label={`Fire ${fire.id + 1} spray progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((1 - fire.health) * 100)}>
              <div className="h-full bg-sky-500 transition-[width]" style={{ width: `${Math.round((1 - fire.health) * 100)}%` }} />
            </div>
          </div>
        ))}

        {fires.filter((fire) => fire.health > 0).map((fire) => (
          <button
            key={`keyboard-target-${playId}-${round}-${fire.id}`}
            type="button"
            aria-label={`Hold Space or Enter to spray fire ${fire.id + 1}`}
            onKeyDown={(event) => startKeyboardSpray(event, fire)}
            onKeyUp={stopKeyboardSpray}
            onBlur={stopSpray}
            className="absolute z-10 h-[13%] w-[15%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-950"
            style={{ left: `${fire.x}%`, top: `${fire.y}%` }}
          />
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
        onShown={() => { hintExposedRef.current = true; }}
        from={() => sceneRef.current?.querySelector('[data-fire="burning"]')}
        mode="hold"
      />
    </div>
  );
};

const FireRescue = (props) => {
  const { speak, playSfx, soundOn } = props;
  const speechRef = useRef({ speak, soundOn });
  useEffect(() => { speechRef.current = { speak, soundOn }; }, [soundOn, speak]);
  const speakPackaged = useCallback((text, options = {}) => {
    const current = speechRef.current;
    const segments = exactRescueSegments(text, options, (segment) => Boolean(getOfflineVoiceClip(segment)));
    if (current.soundOn === false || !segments) return;
    current.speak?.(text, { ...options, premium: false, segments });
  }, []);

  return (
    <LittleGameShell
      {...props}
      gameId="firerescue"
      title="Fire Truck Rescue"
      pairSafeProgress
      compactStart
      manualNext
      manualNextPrompt="Ready for the next rescue?"
      manualNextReviewLabel="Fire rescue review"
      intro={LITTLE_LINES.fireIntro}
      background="from-rose-400 via-orange-300 to-amber-200"
      backgroundArtName="fire-house"
      playFullBleed
      speak={speakPackaged}
      startArt={<RescueTruck className="mx-auto h-full w-full max-w-sm" />}
      renderUnlock={(config) => (
        <div className="flex h-full w-full items-end justify-center">
          {Array.from({ length: Math.max(...config.fires) }, (_, index) => <RescueFlame key={index} className="h-10 w-6" />)}
        </div>
      )}
    >
      {({ round, complete, playId, playOrdinal, config }) => {
        const missions = buildFireMissionTargets(FIRE_SPOTS, config.fires, playOrdinal);
        const targetSpots = missions[round] || [];
        return (
          <FireRound
            key={`${playId}-${round}`}
            count={config.fires[round]}
            targetSpots={targetSpots}
            houseColour={HOUSE_COLOURS[round % HOUSE_COLOURS.length]}
            complete={complete}
            speak={speakPackaged}
            playSfx={playSfx}
            firstRound={round === 0}
            playId={playId}
            round={round}
          />
        );
      }}
    </LittleGameShell>
  );
};

export default FireRescue;
