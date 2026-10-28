import { useCallback, useEffect, useRef, useState } from 'react';
import LittleGameShell from '../LittleGameShell.jsx';
import DragItem from '../DragItem.jsx';
import HandHint from '../HandHint.jsx';
import { Rocket, RocketPart, RocketPartIcon, ROCKET_PARTS } from '../VehicleArt.jsx';
import { useRoundHint } from '../useRoundHint.js';
import { shuffled } from '../littleKit.js';
import { LITTLE_LINES, ROCKET_COLOURS, rocketColourPrompt } from '../../../data/littleGames.js';
import { getOfflineVoiceClip } from '../../../data/offlineVoice.js';
import { pairRoundAttribution } from './pairAttemptAttribution.js';
import { ROCKET_DROP_ZONES, rocketPartAcceptsPoint, rocketPartCenter, rocketPartPlacementFeedback, rocketTargetMatchesPart, speakPackagedOnly } from './rocketBuilderLogic.js';

// Pointer targets are deliberately narrower than the overlapping illustration
// boxes, so dropping one piece over another cannot count as a correct placement.
const landsOnOwnSpot = (partId, point, svg) => svg && rocketPartAcceptsPoint(partId, point, svg.getBoundingClientRect());

const Stars = () => (
  <div className="pointer-events-none absolute inset-0 opacity-80" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.9) 1px, transparent 1.6px)', backgroundSize: '46px 46px' }} />
);

const BuildRound = ({ missing, colour, complete, mistake, speak, playSfx, firstRound }) => {
  const [placed, setPlaced] = useState(() => ROCKET_PARTS.map((p) => p.id).filter((id) => !missing.includes(id)));
  const [tray] = useState(() => shuffled(missing));
  const [selected, setSelected] = useState(null);
  const [wrong, setWrong] = useState(false);
  const [feedback, setFeedback] = useState({ kind: 'instruction', text: 'Drag a rocket part to its matching outline, or select a part and tap its outline.' });
  const [count, setCount] = useState(null);
  const [launched, setLaunched] = useState(false);
  const boardRef = useRef(null);
  const svgRef = useRef(null);
  const trayRef = useRef(null);
  const timers = useRef([]);
  const hintExposedRef = useRef(false);
  const markHintShown = useCallback(() => { hintExposedRef.current = true; }, []);
  const hint = useRoundHint({ demo: firstRound });
  const done = missing.every((id) => placed.includes(id));

  const schedule = useCallback((callback, delay) => {
    const timer = setTimeout(() => {
      timers.current = timers.current.filter((current) => current !== timer);
      callback();
    }, delay);
    timers.current.push(timer);
    return timer;
  }, []);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => {
    speak?.(firstRound ? LITTLE_LINES.rocketIntro : rocketColourPrompt(colour));
  }, [colour, firstRound, speak]);

  // The countdown must run exactly once, so it reads the latest callbacks
  // from a ref instead of re-running whenever a parent re-renders.
  const latest = useRef({ complete, speak, playSfx, mistakes: hint.mistakes });
  useEffect(() => { latest.current = { complete, speak, playSfx, mistakes: hint.mistakes }; });

  useEffect(() => {
    if (!done) return;
    const steps = LITTLE_LINES.countdown;
    steps.forEach((line, index) => {
      schedule(() => {
        setCount(index);
        latest.current.speak?.(line);
        latest.current.playSfx?.(index === steps.length - 1 ? 'launch' : 'countdown');
        if (index === steps.length - 1) setLaunched(true);
      }, 700 + index * 1000);
    });
    schedule(() => latest.current.complete({
      praise: false,
      delay: 300,
      art: <Rocket colour={colour.hex} illustrated className="mx-auto h-56 w-auto" />,
      ...pairRoundAttribution({ mistakes: latest.current.mistakes, hintExposed: hintExposedRef.current }),
    }), 700 + steps.length * 1000 + 900);
  }, [colour.hex, done, schedule]);

  // A part must land on its own outline: nose on top, fins at the bottom.
  const place = (partId, point, targetId = null) => {
    if (placed.includes(partId)) return true;
    if ((targetId && !rocketTargetMatchesPart(partId, targetId)) || !landsOnOwnSpot(partId, point, svgRef.current)) {
      setWrong(true);
      setFeedback({ kind: 'wrong', text: rocketPartPlacementFeedback(partId, ROCKET_PARTS.find((part) => part.id === partId).label) });
      playSfx?.('oops');
      hint.mistake();
      mistake();
      schedule(() => setWrong(false), 450);
      return false;
    }
    playSfx?.('pop');
    hint.touch();
    setPlaced((current) => [...current, partId]);
    setSelected(null);
    const label = ROCKET_PARTS.find((part) => part.id === partId).label;
    const completesBuild = missing.every((id) => placed.includes(id) || id === partId);
    setFeedback({
      kind: 'correct',
      text: completesBuild ? `${label} is in place. All parts are ready for the launch countdown!` : `${label} is in its outline. Keep adding the remaining parts.`,
    });
    return true;
  };

  const nextPart = tray.find((id) => !placed.includes(id));
  const selectedLabel = selected ? ROCKET_PARTS.find((part) => part.id === selected)?.label : null;
  const targetControls = Object.entries(ROCKET_DROP_ZONES).flatMap(([targetId, zones]) => zones.map((zone, zoneIndex) => {
    const part = ROCKET_PARTS.find((item) => item.id === targetId);
    const name = targetId === 'fins' ? `${zoneIndex === 0 ? 'left' : 'right'} fin` : part.label;
    return { targetId, zone, key: `${targetId}-${zoneIndex}`, name };
  }));
  const ghostOf = (partId) => svgRef.current?.querySelector(`[data-ghost="${partId}"]`);

  const countdownText = count == null ? null : ['3', '2', '1', 'Blast off!'][count];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-3 px-3 pb-5 sm:flex-row sm:items-start sm:justify-center">
      <div
        ref={boardRef}
        onClick={(event) => { if (selected) place(selected, { x: event.clientX, y: event.clientY }); }}
        role="presentation"
        className={`relative flex w-[72vw] max-w-xs flex-none aspect-[2/3] items-end justify-center overflow-hidden rounded-[2rem] border-4 border-white/60 bg-gradient-to-b from-indigo-950 via-indigo-800 to-sky-700 p-4 shadow-2xl ${wrong ? 'animate-shake' : ''}`}
      >
        <Stars />
        <p role={feedback.kind === 'wrong' ? 'alert' : 'status'} aria-live="polite" className={`absolute left-3 right-3 top-3 z-30 rounded-xl border-2 px-3 py-2 text-center text-xs font-black leading-tight shadow sm:text-sm ${feedback.kind === 'wrong' ? 'border-rose-200 bg-rose-50/95 text-rose-900' : 'border-white/80 bg-white/95 text-indigo-950'}`}>
          {feedback.text}
        </p>
        <div className={`relative z-10 w-48 transition-transform ease-in sm:w-56 ${launched ? '-translate-y-[120vh] duration-[1800ms]' : 'duration-300'}`}>
          <svg ref={svgRef} viewBox="0 0 200 300" className="w-full overflow-visible" role="img" aria-label="Your rocket assembly outline">
            {ROCKET_PARTS.map((part) => (placed.includes(part.id)
              ? <g key={part.id} className="animate-pop-in" style={{ transformOrigin: 'center', transformBox: 'fill-box' }}><RocketPart part={part.id} colour={colour.hex} illustrated /></g>
              : (
                <g key={part.id} data-ghost={part.id} className={hint.strongHint && part.id === (selected || nextPart) ? 'animate-cell-pulse' : ''}>
                  <RocketPart part={part.id} ghost illustrated />
                </g>
              )
            ))}
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-slate-500/80" />
        {countdownText && <div key={count} className={`absolute inset-0 z-20 grid place-items-center font-black text-amber-300 drop-shadow-[0_4px_0_rgba(0,0,0,.4)] animate-count-up ${count === 3 ? 'text-6xl' : 'text-8xl'}`}>{countdownText}</div>}
      </div>

      <div ref={trayRef} className="grid max-h-[36dvh] w-full max-w-xs grid-cols-3 gap-3 overflow-y-auto rounded-[1.6rem] bg-white/50 p-3 shadow-inner sm:max-h-[72dvh] sm:w-80 sm:grid-cols-2">
        {tray.filter((id) => !placed.includes(id)).map((id) => (
          <DragItem
            key={id}
            label={`Rocket ${ROCKET_PARTS.find((p) => p.id === id).label}`}
            selected={selected === id}
            data={{ part: id }}
            onPickUp={hint.touch}
            onTap={() => { playSfx?.('tap'); setSelected(id); }}
            onDrop={(point) => place(id, point)}
            className={`grid aspect-square place-items-center rounded-2xl border-4 bg-white p-2 shadow-lg ${selected === id ? 'border-amber-400 ring-4 ring-amber-300' : 'border-white'}`}
          >
            <RocketPartIcon part={id} colour={colour.hex} illustrated className="pointer-events-none h-full max-h-24 w-full" />
          </DragItem>
        ))}
        {done && <div className="col-span-3 grid place-items-center py-4 text-5xl sm:col-span-1" aria-hidden="true">✨</div>}
        {!done && <details className="col-span-3 rounded-xl border-2 border-indigo-300 bg-white/75 p-2 sm:col-span-2">
          <summary className="min-h-11 cursor-pointer px-2 py-2 text-center font-black text-indigo-950">Choose an outline target</summary>
          <div role="group" aria-label="Rocket outline targets" className="grid grid-cols-2 gap-2">
            {targetControls.map(({ targetId, zone, key, name }) => (
              <button
                key={key}
                type="button"
                disabled={!selected}
                aria-label={selected ? `Place ${selectedLabel} on the ${name} target` : `Target: ${name}; select a rocket part first`}
                onClick={() => {
                  const point = rocketPartCenter(zone, svgRef.current?.getBoundingClientRect());
                  if (selected && point) place(selected, point, targetId);
                }}
                className="min-h-12 rounded-xl border-2 border-indigo-800 bg-white px-2 py-2 text-sm font-black text-indigo-950 shadow disabled:border-slate-400 disabled:bg-slate-100 disabled:text-slate-500"
              >
                Try the {name} target
              </button>
            ))}
          </div>
        </details>}
        <p className="col-span-3 text-center text-sm font-bold text-indigo-950 sm:col-span-2">
          Drag a part, or select one and try a matching outline.
        </p>
      </div>
      <HandHint
        show={hint.showHint && !done && Boolean(nextPart)}
        onShown={markHintShown}
        from={() => trayRef.current?.querySelector(`[data-part="${nextPart}"]`)}
        to={() => ghostOf(nextPart)}
        mode="drag"
      />
    </div>
  );
};

const RocketBuilder = (props) => {
  const { speak, playSfx } = props;
  const speakExact = useCallback((text) => speakPackagedOnly(speak, text, (line) => Boolean(getOfflineVoiceClip(line, 'en-US'))), [speak]);
  const [colourOrder] = useState(() => shuffled(ROCKET_COLOURS.map((colour, index) => ({ ...colour, index }))));

  return (
    <LittleGameShell
      {...props}
      gameId="rocketbuilder"
      title="Rocket Builder"
      pairSafeProgress
      speak={speakExact}
      intro={LITTLE_LINES.rocketIntro}
      background="from-indigo-500 via-sky-400 to-cyan-200"
      startArt={<Rocket colour={ROCKET_COLOURS[0].hex} illustrated className="mx-auto h-64 w-auto -rotate-12" title="A rocket" />}
      renderUnlock={(config) => (config.unlock === 'colour'
        ? <Rocket colour={ROCKET_COLOURS[config.colours - 1].hex} illustrated className="mx-auto h-full w-auto" />
        : null)}
    >
      {({ round, complete, mistake, playId, config }) => {
        // Colours unlock with levels; the newest colour is built first.
        const unlocked = colourOrder.filter((colour) => colour.index < config.colours);
        const newest = ROCKET_COLOURS[config.colours - 1];
        const pool = [newest, ...unlocked.filter((colour) => colour.id !== newest.id)];
        return (
          <BuildRound
            key={`${playId}-${round}`}
            missing={config.rounds[round]}
            colour={pool[(round + playId - 1) % pool.length]}
            complete={complete}
            mistake={mistake}
            speak={speakExact}
            playSfx={playSfx}
            firstRound={round === 0}
          />
        );
      }}
    </LittleGameShell>
  );
};

export default RocketBuilder;
