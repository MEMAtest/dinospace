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
  const [targetKey, setTargetKey] = useState('');
  const [wrong, setWrong] = useState(false);
  const [feedback, setFeedback] = useState({ kind: 'instruction', text: 'Choose a rocket part, then tap or drag it to its outline.' });
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
    setTargetKey('');
    const label = ROCKET_PARTS.find((part) => part.id === partId).label;
    const completesBuild = missing.every((id) => placed.includes(id) || id === partId);
    setFeedback({
      kind: 'correct',
      text: completesBuild ? `${label} is in place. Get ready for launch!` : `${label} is in place. Choose the next part.`,
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
  const selectedTarget = targetControls.find(item => item.key === targetKey);
  const ghostOf = (partId) => svgRef.current?.querySelector(`[data-ghost="${partId}"]`);

  const countdownText = count == null ? null : ['3', '2', '1', 'Blast off!'][count];

  return (
    <div className="rocket-focus-stage">
      <div
        ref={boardRef}
        onClick={(event) => { if (selected) place(selected, { x: event.clientX, y: event.clientY }); }}
        role="presentation"
        data-rocket-board
        className={`relative flex items-end justify-center overflow-hidden rounded-2xl border-2 border-white/60 bg-gradient-to-b from-indigo-950 via-indigo-800 to-sky-700 p-2 shadow-xl ${wrong ? 'animate-shake' : ''}`}
      >
        <Stars />
        <div className={`rocket-focus-outline relative z-10 transition-transform ease-in ${launched ? '-translate-y-[120vh] duration-[1800ms]' : 'duration-300'}`}>
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

      <div ref={trayRef} className="rocket-focus-tray" aria-label="Rocket parts">
        {tray.filter((id) => !placed.includes(id)).map((id) => (
          <DragItem
            key={id}
            label={`Rocket ${ROCKET_PARTS.find((p) => p.id === id).label}`}
            selected={selected === id}
            data={{ part: id }}
            onPickUp={hint.touch}
            onTap={() => { playSfx?.('tap'); setSelected(id); setTargetKey(''); setFeedback({ kind: 'instruction', text: 'Tap this part’s outline on the rocket.' }); }}
            onDrop={(point) => place(id, point)}
            className={`grid aspect-square place-items-center rounded-2xl border-4 bg-white p-2 shadow-lg ${selected === id ? 'border-amber-400 ring-4 ring-amber-300' : 'border-white'}`}
          >
            <RocketPartIcon part={id} colour={colour.hex} illustrated className="pointer-events-none h-full max-h-24 w-full" />
          </DragItem>
        ))}
        {done && <p className="font-black text-indigo-950">{launched ? 'Rocket launched!' : 'Get ready for launch!'}</p>}
      </div>
      <div className="rocket-focus-feedback">
        <p role={feedback.kind === 'wrong' ? 'alert' : 'status'} aria-live="polite" className="font-bold text-indigo-950">{feedback.text}</p>
        {!done && selected && <div className="rocket-focus-targets" data-rocket-target-controls>
          <label htmlFor="rocket-outline-target">Choose an outline for the {selectedLabel}</label>
          <select id="rocket-outline-target" value={targetKey} onChange={event => setTargetKey(event.target.value)}>
            <option value="">Choose a target</option>
            {targetControls.map(({ key, name }) => <option key={key} value={key}>{name}</option>)}
          </select>
          <button type="button" className="focus-game-button" disabled={!selectedTarget} onClick={() => {
            if (!selectedTarget) return;
            const point = rocketPartCenter(selectedTarget.zone, svgRef.current?.getBoundingClientRect());
            if (point) place(selected, point, selectedTarget.targetId);
          }}>Try this outline</button>
        </div>}
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
      compactStart
      compactDone
      focusedControls
      manualNext
      manualNextPrompt="Rocket launched!"
      speak={speakExact}
      intro={LITTLE_LINES.rocketIntro}
      background="from-indigo-500 via-sky-400 to-cyan-200"
      startArt={<Rocket colour={ROCKET_COLOURS[0].hex} illustrated className="mx-auto h-full max-h-full w-auto -rotate-12" title="A rocket" />}
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
