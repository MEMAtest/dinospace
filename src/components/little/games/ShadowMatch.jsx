import { useEffect, useRef, useState } from 'react';
import LittleGameShell from '../LittleGameShell.jsx';
import DragItem from '../DragItem.jsx';
import HandHint from '../HandHint.jsx';
import Dino from '../ShadowDino.jsx';
import { useRoundHint } from '../useRoundHint.js';
import { pointInRect } from '../littleKit.js';
import { LITTLE_LINES } from '../../../data/littleGames.js';
import { SHADOW_DINO_KINDS, SHADOW_DINO_NAMES, SHADOW_FACTS, SHADOW_FEATURES, createShadowTargetQueue, makeShadowChoices, shadowSpokenLine } from '../../../data/shadowMatchProgression.js';

const ShadowRound = ({ target, kinds, count, mirror, similar, complete, mistake, speak, playSfx, firstRound, onTarget }) => {
  const [shadows] = useState(() => makeShadowChoices(target, kinds, count, similar));
  const [matched, setMatched] = useState(false);
  const [wrong, setWrong] = useState(null);
  const [manualHint, setManualHint] = useState(false);
  const shadowRefs = useRef({});
  const dinoRef = useRef(null);
  const wrongTimer = useRef(null);
  const hint = useRoundHint({ demo: firstRound && !similar });
  const sayCreature = () => speak?.(shadowSpokenLine(target), { segments: [shadowSpokenLine(target)] });

  useEffect(() => { onTarget(target); }, [onTarget, target]);
  useEffect(() => () => clearTimeout(wrongTimer.current), []);
  useEffect(() => {
    const line = firstRound && !similar ? LITTLE_LINES.shadowIntro : shadowSpokenLine(target);
    speak?.(line, { segments: [line] });
  }, [firstRound, similar, speak, target]);

  const choose = (kind) => {
    if (matched) return false;
    hint.touch();
    if (kind !== target) {
      playSfx?.('oops');
      setWrong(kind);
      speak?.(LITTLE_LINES.shadowWrong, { segments: [LITTLE_LINES.shadowWrong] });
      hint.mistake();
      mistake();
      clearTimeout(wrongTimer.current);
      wrongTimer.current = setTimeout(() => setWrong(null), 450);
      return false;
    }
    setMatched(true);
    playSfx?.('roar');
    sayCreature();
    return true;
  };
  const next = () => complete({ praise: false, delay: 0, firstAttempt: hint.mistakes === 0 && !manualHint, independent: hint.mistakes === 0 && !manualHint, hints: manualHint || hint.strongHint ? 1 : 0, art: <Dino kind={target} className="mx-auto w-4/5" /> });
  const shadowAt = point => shadows.find(kind => pointInRect(point, shadowRefs.current[kind]?.getBoundingClientRect(), 0));

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-3 px-3 pb-6">
      <p className="mt-2 rounded-full bg-white/80 px-4 py-2 text-center text-sm font-black text-indigo-950">{kinds.length} creatures · {count} choices{mirror ? ' · mirrored shadows' : ''}</p>
      {!matched ? <>
        <p className="text-center font-black text-indigo-950">Match the shape. {SHADOW_FEATURES[target]}</p>
        <div ref={dinoRef}>
          <DragItem label={`${SHADOW_DINO_NAMES[target]} — drag to its shadow`} data={{ kind: target }} onPickUp={hint.touch} onTap={sayCreature} onDrop={point => { const kind = shadowAt(point); return kind ? choose(kind) : false; }} className="w-48 max-w-[60vw] rounded-[2rem] bg-white/60 p-3 shadow-xl sm:w-64">
            <Dino kind={target} className="pointer-events-none w-full" />
          </DragItem>
        </div>
        <p className="text-center font-black text-indigo-950">{SHADOW_DINO_NAMES[target]}{target === 'ptero' ? ' · flying reptile' : ''}</p>
        <p className="min-h-6 text-center text-sm font-bold text-indigo-950" role="status">{wrong ? 'Not this one yet. Compare the head and tail, then try again.' : 'Tap the matching shadow, or drag the creature to it.'}</p>
        <div className={`grid w-full gap-3 sm:gap-5 ${count >= 5 ? 'grid-cols-3' : count === 4 ? 'grid-cols-2 sm:grid-cols-4' : count === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {shadows.map((kind, index) => <button key={kind} type="button" ref={el => { shadowRefs.current[kind] = el; }} data-kind={kind} onClick={() => choose(kind)} aria-label={`Shadow option ${index + 1}`} className={`grid aspect-[5/4] min-h-12 min-w-12 place-items-center rounded-[1.3rem] border-4 bg-white/40 p-1 shadow-lg transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-indigo-800 ${wrong === kind ? 'animate-shake bg-rose-200/70' : hint.strongHint && kind === target ? 'animate-cell-pulse border-amber-300 bg-amber-100/80' : 'border-white/80'}`}>
            <Dino kind={kind} silhouette flip={mirror} className="pointer-events-none w-full" />
          </button>)}
        </div>
        <button type="button" onClick={() => { setManualHint(true); hint.touch(); }} className="min-h-12 rounded-full border-2 border-white bg-white/80 px-5 font-black text-indigo-950">Show me a clue</button>
        <HandHint show={(hint.showHint && (!similar || hint.mistakes >= 2) || manualHint) && !matched} from={() => dinoRef.current} to={() => shadowRefs.current[target]} mode="drag" />
      </> : <section className="flex w-full max-w-xl flex-col items-center gap-3 rounded-3xl border-4 border-white bg-white/90 p-4 text-center" aria-live="polite">
        <Dino kind={target} className="w-48 animate-dino-hop sm:w-64" />
        <h2 className="text-2xl font-black text-indigo-950">{SHADOW_DINO_NAMES[target]}!</h2>
        <p className="font-bold leading-relaxed text-indigo-950">{SHADOW_FACTS[target]}</p>
        <button type="button" onClick={sayCreature} className="min-h-12 rounded-full bg-sky-100 px-5 font-black text-sky-950">{target === 'ptero' ? 'Hear the name again' : 'Hear the fact again'}</button>
        <button type="button" onClick={next} className="min-h-14 rounded-full bg-indigo-700 px-7 text-lg font-black text-white">Next match →</button>
      </section>}
    </div>
  );
};

const ShadowRun = ({ config, previous, round, ...props }) => {
  const [targets] = useState(() => createShadowTargetQueue(config, previous));
  return <ShadowRound key={round} {...props} target={targets[round]} kinds={SHADOW_DINO_KINDS.slice(0, config.kinds)} count={config.choices[round]} mirror={Boolean(config.mirror)} similar={Boolean(config.similar)} firstRound={round === 0} />;
};

const ShadowMatch = props => {
  const previousRef = useRef(null);
  return <LittleGameShell {...props} gameId="shadowmatch" title="Shadow Match" intro={LITTLE_LINES.shadowIntro} background="from-violet-400 via-indigo-300 to-sky-200" startArt={<div className="flex items-center justify-center gap-2"><Dino kind="trike" className="w-1/2" /><Dino kind="trike" silhouette className="w-1/2 opacity-80" /></div>} renderUnlock={config => config.unlock === 'dino' ? <Dino kind={SHADOW_DINO_KINDS[config.kinds - 1]} className="h-full w-full" /> : null}>
    {({ round, complete, mistake, playId, config }) => <ShadowRun key={`${playId}-${config.kinds}`} config={config} previous={previousRef.current} round={round} complete={complete} mistake={mistake} speak={props.speak} playSfx={props.playSfx} onTarget={kind => { previousRef.current = kind; }} />}
  </LittleGameShell>;
};
export default ShadowMatch;
