import { useEffect, useRef, useState } from 'react';
import LittleGameShell from '../LittleGameShell.jsx';
import DragItem from '../DragItem.jsx';
import { Dino, DINO_KINDS } from '../DinoArt.jsx';
import { pointInRect, shuffled } from '../littleKit.js';
import { DINO_NAMES, LITTLE_LINES, SHADOW_CHOICES, shadowFound } from '../../../data/littleGames.js';

const makeRound = (count, avoid) => {
  const target = shuffled(DINO_KINDS.filter((kind) => kind !== avoid))[0];
  const others = shuffled(DINO_KINDS.filter((kind) => kind !== target)).slice(0, count - 1);
  return { target, shadows: shuffled([target, ...others]) };
};

const ShadowRound = ({ count, complete, speak, playSfx, firstRound, previous, onTarget }) => {
  const [{ target, shadows }] = useState(() => makeRound(count, previous));
  const [matched, setMatched] = useState(false);
  const [wrong, setWrong] = useState(null);
  const shadowRefs = useRef([]);

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
      setTimeout(() => setWrong(null), 450);
      return false;
    }
    setMatched(true);
    playSfx?.('pop');
    speak?.(shadowFound(target));
    complete({ praise: false, delay: 1800 });
    return true;
  };

  const shadowAt = (point) => shadows.find((_, index) => pointInRect(point, shadowRefs.current[index]?.getBoundingClientRect(), 12));

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-between gap-4 px-3 pb-6">
      <div className="flex min-h-[34vh] w-full items-center justify-center">
        {!matched && (
          <DragItem
            label={`${DINO_NAMES[target]} — drag to its shadow`}
            data={{ kind: target }}
            onTap={() => speak?.(DINO_NAMES[target])}
            onDrop={(point) => { const kind = shadowAt(point); return kind ? choose(kind) : false; }}
            className="w-56 max-w-[70vw] rounded-[2rem] bg-white/60 p-3 shadow-xl sm:w-72"
          >
            <Dino kind={target} className="pointer-events-none w-full" />
          </DragItem>
        )}
        {matched && <p className="text-5xl font-black text-white drop-shadow-[0_3px_0_rgba(15,23,42,.35)] animate-pop-in sm:text-6xl">{DINO_NAMES[target]}!</p>}
      </div>
      <div className="grid w-full gap-3 sm:gap-5" style={{ gridTemplateColumns: `repeat(${shadows.length}, minmax(0, 1fr))` }}>
        {shadows.map((kind, index) => (
          <button
            key={kind}
            type="button"
            ref={(el) => { shadowRefs.current[index] = el; }}
            data-kind={kind}
            onClick={() => choose(kind)}
            aria-label="A dinosaur shadow"
            className={`grid aspect-square place-items-center rounded-[1.6rem] border-4 border-white/80 bg-white/40 p-2 shadow-lg transition ${wrong === kind ? 'animate-shake bg-rose-200/70' : ''} ${matched && kind === target ? 'scale-110 border-amber-300 bg-amber-100' : ''}`}
          >
            <Dino kind={kind} silhouette={!(matched && kind === target)} className={`pointer-events-none w-full ${matched && kind === target ? 'animate-pop-in' : 'opacity-80'}`} />
          </button>
        ))}
      </div>
    </div>
  );
};

const ShadowMatch = (props) => {
  const { bigKid, speak, playSfx } = props;
  const counts = SHADOW_CHOICES[bigKid ? 'big' : 'little'];
  const previousRef = useRef(null);

  return (
    <LittleGameShell
      {...props}
      gameId="shadowmatch"
      title="Shadow Match"
      intro={LITTLE_LINES.shadowIntro}
      rounds={counts.length}
      background="from-violet-400 via-indigo-300 to-sky-200"
      startArt={(
        <div className="flex items-center justify-center gap-2">
          <Dino kind="trike" className="w-1/2" />
          <Dino kind="trike" silhouette className="w-1/2 opacity-80" />
        </div>
      )}
    >
      {({ round, complete, playId }) => (
        <ShadowRound
          key={`${playId}-${round}`}
          count={counts[round]}
          complete={complete}
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
