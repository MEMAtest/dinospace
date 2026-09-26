import { useEffect, useRef, useState } from 'react';
import LittleGameShell from '../LittleGameShell.jsx';
import DragItem from '../DragItem.jsx';
import HandHint from '../HandHint.jsx';
import { Dino, DINO_KINDS } from '../DinoArt.jsx';
import { useRoundHint } from '../useRoundHint.js';
import { pointInRect, shuffled } from '../littleKit.js';
import { DINO_NAMES, LITTLE_LINES, shadowFound } from '../../../data/littleGames.js';

const makeRound = (kinds, count, avoid) => {
  const target = shuffled(kinds.filter((kind) => kind !== avoid))[0] || kinds[0];
  const others = shuffled(kinds.filter((kind) => kind !== target)).slice(0, count - 1);
  return { target, shadows: shuffled([target, ...others]) };
};

const ShadowRound = ({ kinds, count, mirror, complete, mistake, speak, playSfx, firstRound, previous, onTarget }) => {
  const [{ target, shadows }] = useState(() => makeRound(kinds, count, previous));
  const [matched, setMatched] = useState(false);
  const [wrong, setWrong] = useState(null);
  const shadowRefs = useRef({});
  const dinoRef = useRef(null);
  const hint = useRoundHint({ demo: firstRound });

  useEffect(() => { onTarget(target); }, [onTarget, target]);

  useEffect(() => {
    speak?.(firstRound ? LITTLE_LINES.shadowIntro : DINO_NAMES[target]);
  }, [firstRound, speak, target]);

  const choose = (kind) => {
    if (matched) return false;
    if (kind !== target) {
      playSfx?.('oops');
      setWrong(kind);
      speak?.(LITTLE_LINES.shadowWrong);
      hint.mistake();
      mistake();
      setTimeout(() => setWrong(null), 450);
      return false;
    }
    setMatched(true);
    playSfx?.('roar');
    speak?.(shadowFound(target));
    complete({ praise: false, delay: 2000, art: <Dino kind={target} className="mx-auto w-4/5" /> });
    return true;
  };

  const shadowAt = (point) => shadows.find((kind) => pointInRect(point, shadowRefs.current[kind]?.getBoundingClientRect(), 12));

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-between gap-4 px-3 pb-6">
      <div className="flex min-h-[34vh] w-full items-center justify-center">
        {!matched && (
          <div ref={dinoRef}>
            <DragItem
              label={`${DINO_NAMES[target]} — drag to its shadow`}
              data={{ kind: target }}
              onPickUp={hint.touch}
              onTap={() => speak?.(DINO_NAMES[target])}
              onDrop={(point) => { const kind = shadowAt(point); return kind ? choose(kind) : false; }}
              className="w-56 max-w-[70vw] rounded-[2rem] bg-white/60 p-3 shadow-xl sm:w-72"
            >
              <Dino kind={target} className="pointer-events-none w-full" />
            </DragItem>
          </div>
        )}
        {matched && (
          <div className="flex flex-col items-center">
            <Dino kind={target} className="w-56 animate-dino-hop drop-shadow-2xl sm:w-72" />
            <p className="text-4xl font-black text-white drop-shadow-[0_3px_0_rgba(15,23,42,.35)] animate-pop-in sm:text-5xl">{DINO_NAMES[target]}!</p>
          </div>
        )}
      </div>
      <div className="grid w-full gap-3 sm:gap-5" style={{ gridTemplateColumns: `repeat(${shadows.length}, minmax(0, 1fr))` }}>
        {shadows.map((kind) => (
          <button
            key={kind}
            type="button"
            ref={(el) => { shadowRefs.current[kind] = el; }}
            data-kind={kind}
            onClick={() => choose(kind)}
            aria-label="A dinosaur shadow"
            className={`grid aspect-square place-items-center rounded-[1.6rem] border-4 bg-white/40 p-2 shadow-lg transition ${wrong === kind ? 'animate-shake bg-rose-200/70' : ''} ${matched && kind === target ? 'scale-110 border-amber-300 bg-amber-100' : hint.strongHint && kind === target ? 'animate-cell-pulse border-amber-300 bg-amber-100/80' : 'border-white/80'}`}
          >
            <Dino kind={kind} silhouette={!(matched && kind === target)} flip={mirror} className={`pointer-events-none w-full ${matched && kind === target ? 'animate-pop-in' : 'opacity-80'}`} />
          </button>
        ))}
      </div>
      <HandHint
        show={hint.showHint && !matched}
        from={() => dinoRef.current}
        to={() => shadowRefs.current[target]}
        mode="drag"
      />
    </div>
  );
};

const ShadowMatch = (props) => {
  const { speak, playSfx } = props;
  const previousRef = useRef(null);

  return (
    <LittleGameShell
      {...props}
      gameId="shadowmatch"
      title="Shadow Match"
      intro={LITTLE_LINES.shadowIntro}
      background="from-violet-400 via-indigo-300 to-sky-200"
      startArt={(
        <div className="flex items-center justify-center gap-2">
          <Dino kind="trike" className="w-1/2" />
          <Dino kind="trike" silhouette className="w-1/2 opacity-80" />
        </div>
      )}
      renderUnlock={(config) => (config.unlock === 'dino' ? <Dino kind={DINO_KINDS[config.kinds - 1]} className="h-full w-full" /> : null)}
    >
      {({ round, complete, mistake, playId, config }) => (
        <ShadowRound
          key={`${playId}-${round}`}
          kinds={DINO_KINDS.slice(0, config.kinds)}
          count={config.choices[round]}
          mirror={Boolean(config.mirror)}
          complete={complete}
          mistake={mistake}
          speak={speak}
          playSfx={playSfx}
          firstRound={round === 0}
          previous={previousRef.current}
          onTarget={(kind) => { previousRef.current = kind; }}
        />
      )}
    </LittleGameShell>
  );
};

export default ShadowMatch;
