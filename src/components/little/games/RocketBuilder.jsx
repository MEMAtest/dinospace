import { useEffect, useRef, useState } from 'react';
import LittleGameShell from '../LittleGameShell.jsx';
import DragItem from '../DragItem.jsx';
import HandHint from '../HandHint.jsx';
import { Rocket, RocketPart, RocketPartIcon, ROCKET_PARTS } from '../VehicleArt.jsx';
import { useRoundHint } from '../useRoundHint.js';
import { shuffled } from '../littleKit.js';
import { LITTLE_LINES, ROCKET_COLOURS, rocketColourPrompt } from '../../../data/littleGames.js';

// Rocket canvas units (see ROCKET_PARTS boxes). A part is accepted when it is
// dropped on or near its own outline.
const SNAP_UNITS = 34;
const landsOnOwnSpot = (partId, point, svg) => {
  if (!svg || !point) return false;
  const rect = svg.getBoundingClientRect();
  const x = ((point.x - rect.left) / rect.width) * 200;
  const y = ((point.y - rect.top) / rect.height) * 300;
  const [bx, by, bw, bh] = ROCKET_PARTS.find((part) => part.id === partId).box;
  return x >= bx - SNAP_UNITS && x <= bx + bw + SNAP_UNITS && y >= by - SNAP_UNITS && y <= by + bh + SNAP_UNITS;
};

const Stars = () => (
  <div className="pointer-events-none absolute inset-0 opacity-80" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.9) 1px, transparent 1.6px)', backgroundSize: '46px 46px' }} />
);

const BuildRound = ({ missing, colour, complete, mistake, speak, playSfx, firstRound }) => {
  const [placed, setPlaced] = useState(() => ROCKET_PARTS.map((p) => p.id).filter((id) => !missing.includes(id)));
  const [tray] = useState(() => shuffled(missing));
  const [selected, setSelected] = useState(null);
  const [wrong, setWrong] = useState(false);
  const [count, setCount] = useState(null);
  const [launched, setLaunched] = useState(false);
  const boardRef = useRef(null);
  const svgRef = useRef(null);
  const trayRef = useRef(null);
  const timers = useRef([]);
  const hint = useRoundHint({ demo: firstRound });
  const done = missing.every((id) => placed.includes(id));

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    speak?.(firstRound ? LITTLE_LINES.rocketIntro : rocketColourPrompt(colour));
  }, [colour, firstRound, speak]);

  // The countdown must run exactly once, so it reads the latest callbacks
  // from a ref instead of re-running whenever a parent re-renders.
  const latest = useRef({ complete, speak, playSfx });
  useEffect(() => { latest.current = { complete, speak, playSfx }; });

  useEffect(() => {
    if (!done) return;
    const steps = LITTLE_LINES.countdown;
    steps.forEach((line, index) => {
      timers.current.push(setTimeout(() => {
        setCount(index);
        latest.current.speak?.(line);
        latest.current.playSfx?.(index === steps.length - 1 ? 'launch' : 'countdown');
        if (index === steps.length - 1) setLaunched(true);
      }, 700 + index * 1000));
    });
    timers.current.push(setTimeout(() => latest.current.complete({ praise: false, delay: 300, art: <Rocket colour={colour.hex} className="mx-auto h-56 w-auto" /> }), 700 + steps.length * 1000 + 900));
  }, [colour.hex, done]);

  // A part must land on its own outline: nose on top, fins at the bottom.
  const place = (partId, point) => {
    if (placed.includes(partId)) return true;
    if (!landsOnOwnSpot(partId, point, svgRef.current)) {
      setWrong(true);
      playSfx?.('oops');
      hint.mistake();
      mistake();
      setTimeout(() => setWrong(false), 450);
      return false;
    }
    playSfx?.('pop');
    hint.touch();
    setPlaced((current) => [...current, partId]);
    setSelected(null);
    return true;
  };

  const nextPart = tray.find((id) => !placed.includes(id));
  const ghostOf = (partId) => svgRef.current?.querySelector(`[data-ghost="${partId}"]`);

  const countdownText = count == null ? null : ['3', '2', '1', 'Blast off!'][count];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-3 px-3 pb-5 sm:flex-row sm:items-stretch sm:justify-center">
      <div
        ref={boardRef}
        onClick={(event) => { if (selected) place(selected, { x: event.clientX, y: event.clientY }); }}
        role="presentation"
        className={`relative flex w-full max-w-xs flex-1 items-end justify-center overflow-hidden rounded-[2rem] border-4 border-white/60 bg-gradient-to-b from-indigo-950 via-indigo-800 to-sky-700 p-4 shadow-2xl ${wrong ? 'animate-shake' : ''}`}
        style={{ minHeight: '46vh' }}
      >
        <Stars />
        <div className={`relative z-10 w-48 transition-transform ease-in sm:w-56 ${launched ? '-translate-y-[120vh] duration-[1800ms]' : 'duration-300'}`}>
          <svg ref={svgRef} viewBox="0 0 200 300" className="w-full overflow-visible" aria-label="Your rocket">
            {ROCKET_PARTS.map((part) => (placed.includes(part.id)
              ? <g key={part.id} className="animate-pop-in" style={{ transformOrigin: 'center', transformBox: 'fill-box' }}><RocketPart part={part.id} colour={colour.hex} /></g>
              : (
                <g key={part.id} data-ghost={part.id} className={hint.strongHint && part.id === (selected || nextPart) ? 'animate-cell-pulse' : ''}>
                  <RocketPart part={part.id} ghost />
                </g>
              )
            ))}
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-slate-500/80" />
        {countdownText && <div key={count} className={`absolute inset-0 z-20 grid place-items-center font-black text-amber-300 drop-shadow-[0_4px_0_rgba(0,0,0,.4)] animate-count-up ${count === 3 ? 'text-6xl' : 'text-8xl'}`}>{countdownText}</div>}
      </div>

      <div ref={trayRef} className="grid w-full max-w-xs grid-cols-3 gap-3 rounded-[1.6rem] bg-white/50 p-3 shadow-inner sm:w-40 sm:grid-cols-1">
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
            <RocketPartIcon part={id} colour={colour.hex} className="pointer-events-none h-full max-h-24 w-full" />
          </DragItem>
        ))}
        {done && <div className="col-span-3 grid place-items-center py-4 text-5xl sm:col-span-1" aria-hidden="true">✨</div>}
      </div>
      <HandHint
        show={hint.showHint && !done && Boolean(nextPart)}
        from={() => trayRef.current?.querySelector(`[data-part="${nextPart}"]`)}
        to={() => ghostOf(nextPart)}
        mode="drag"
      />
    </div>
  );
};

const RocketBuilder = (props) => {
  const { speak, playSfx } = props;
  const [colourOrder] = useState(() => shuffled(ROCKET_COLOURS.map((colour, index) => ({ ...colour, index }))));

  return (
    <LittleGameShell
      {...props}
      gameId="rocketbuilder"
      title="Rocket Builder"
      intro={LITTLE_LINES.rocketIntro}
      background="from-indigo-500 via-sky-400 to-cyan-200"
      startArt={<Rocket colour={ROCKET_COLOURS[0].hex} className="mx-auto h-64 w-auto -rotate-12" title="A rocket" />}
      renderUnlock={(config) => (config.unlock === 'colour'
        ? <Rocket colour={ROCKET_COLOURS[config.colours - 1].hex} className="mx-auto h-full w-auto" />
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
            speak={speak}
            playSfx={playSfx}
            firstRound={round === 0}
          />
        );
      }}
    </LittleGameShell>
  );
};

export default RocketBuilder;
