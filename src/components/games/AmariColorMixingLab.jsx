import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Lightbulb, RotateCcw, Volume2 } from 'lucide-react';
import { COLOUR_CHAPTERS, COLOUR_RECIPES, COLOUR_SWATCHES, COLOUR_MODEL, colourChoiceLabel, makeColourRun, markColourAnswer } from '../../data/batch5Colour.js';
import { completeReasoningRun, getReasoningProgress } from '../../data/batch5ReasoningProgress.js';
import { SoundToggle } from '../shared/index.jsx';
import { batch5AttemptMetrics } from './batch5AttemptMetrics.js';
import './batch5ReasoningGames.css';

const noop = () => {};
const randomSeed = () => globalThis.crypto?.getRandomValues ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0] || 1 : Math.floor(Math.random() * 0xffffffff) || 1;
const COLOUR_LABELS = Object.freeze({ darkRed: 'Dark red', darkBlue: 'Dark blue', darkGreen: 'Dark green' });
const swatchLabel = (id) => COLOUR_LABELS[id] || COLOUR_SWATCHES[id]?.label || id;

function PaintPot({ colour, label, small = false }) {
  const swatch = COLOUR_SWATCHES[colour];
  if (!swatch) return null;
  return <span className={`reasoning-paint-pot ${small ? 'reasoning-paint-pot--small' : ''}`} role="img" aria-label={label || swatchLabel(colour)}>
    <span className="reasoning-paint-pot__liquid" style={{ '--paint-colour': swatch.hex }} />
  </span>;
}

function Beaker({ colour, label = 'mixed paint', active = false }) {
  const swatch = COLOUR_SWATCHES[colour];
  return <div className={`reasoning-beaker ${active ? 'reasoning-beaker--active' : ''}`} aria-label={label} role="img">
    <svg viewBox="0 0 96 112" aria-hidden="true" className="h-full w-full overflow-visible">
      <path d="M31 8h34v8H58v22l22 47c5 11-2 19-14 19H30c-12 0-19-8-14-19l22-47V16h-7z" fill="#f8fbff" fillOpacity=".83" stroke="#315178" strokeWidth="4" strokeLinejoin="round" />
      {swatch && <path d="M29 68h38l11 21c2 5-1 9-8 9H27c-7 0-10-4-8-9z" fill={swatch.hex} stroke="#315178" strokeWidth="2" className="reasoning-beaker__fill" />}
      {!swatch && <path d="M34 73h28" stroke="#95a6ba" strokeWidth="4" strokeDasharray="5 5" />}
      <path d="M38 26h20" stroke="#6f829a" strokeWidth="3" strokeLinecap="round" />
      {active && <path d="M46 2v17" stroke="#6f829a" strokeWidth="3" strokeLinecap="round" className="reasoning-pour-stream" />}
    </svg>
  </div>;
}

function DesignArt({ object, colour }) {
  const fill = COLOUR_SWATCHES[colour]?.hex || '#8aa3bd';
  return <svg viewBox="0 0 160 112" className="reasoning-design-art" role="img" aria-label={`${object} colour design`}>
    {object === 'sunset' && <><circle cx="80" cy="41" r="24" fill={fill} /><path d="M8 100 50 53l23 27 21-20 58 40z" fill="#426a78" /><path d="M8 101h144" stroke="#173c58" strokeWidth="5" /></>}
    {object === 'leaf' && <><path d="M30 90Q28 23 129 19 122 91 51 91Z" fill={fill} stroke="#255c3f" strokeWidth="5" /><path d="M35 92 112 32M67 67 54 42m28 3 18 17" fill="none" stroke="#255c3f" strokeWidth="4" strokeLinecap="round" /></>}
    {object === 'kite' && <><path d="m80 8 45 42-45 48-45-48z" fill={fill} stroke="#42365c" strokeWidth="5" /><path d="m80 8 0 90m-45-48h90m-45 48q-7 11 4 15t-1 14" fill="none" stroke="#42365c" strokeWidth="3" /><path d="m67 32 13 11 13-11M66 69l14 12 14-12" fill="none" stroke="#fff" strokeWidth="4" /></>}
    {object === 'flower' && <><path d="M80 62v43m0-18q-31-20-37 3 17 15 37-3m0-7q26-21 38-1-9 17-38 1" fill="#4e9660" stroke="#2f6841" strokeWidth="4" /><circle cx="80" cy="39" r="13" fill="#f3b632" />{Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={80 + Math.cos(i * Math.PI / 3) * 23} cy={39 + Math.sin(i * Math.PI / 3) * 23} rx="12" ry="17" fill={fill} stroke="#7d3f69" strokeWidth="3" transform={`rotate(${i * 60} ${80 + Math.cos(i * Math.PI / 3) * 23} ${39 + Math.sin(i * Math.PI / 3) * 23})`} />)}</>}
    {object === 'sky mural' && <><rect x="19" y="12" width="122" height="85" rx="8" fill="#f4f7fb" stroke="#53667e" strokeWidth="5" /><path d="M25 75q15-18 29-2 16-24 33-4 15-16 48 6v17H25z" fill={fill} /><circle cx="111" cy="36" r="11" fill="#ffd658" /><path d="M25 101h112" stroke="#53667e" strokeWidth="5" /></>}
    {object === 'garden gate' && <><path d="M25 98V31q0-13 12-13t12 13v67m19 0V31q0-13 12-13t12 13v67m20 0V31q0-13 12-13t12 13v67M18 50h124M18 86h124" fill={fill} stroke="#47556b" strokeWidth="5" strokeLinejoin="round" /><path d="M15 101h130" stroke="#47556b" strokeWidth="6" /></>}
    {object === 'night boat' && <><path d="M29 66h102l-17 26H50z" fill={fill} stroke="#263955" strokeWidth="5" /><path d="M78 18v48H42q25-32 36-48zm8 6v42h37Q101 37 86 24z" fill="#fff3b0" stroke="#263955" strokeWidth="4" /><path d="M17 101q16-8 32 0t32 0 32 0 32 0" fill="none" stroke="#447ba2" strokeWidth="5" strokeLinecap="round" /></>}
    {object === 'forest sign' && <><path d="M74 58h14v48H74z" fill="#79533b" /><path d="M24 68q4-32 28-33 3-27 31-24 28-1 30 28 22 6 20 31-13 18-41 5-25 18-45 0-15 4-23-7z" fill={fill} stroke="#315d45" strokeWidth="5" /><path d="M57 52h47M81 34v37" stroke="#e9f5e8" strokeWidth="4" /></>}
  </svg>;
}

function PaletteDots({ ids }) {
  return <div className="flex flex-wrap justify-center gap-2" aria-label="Saved palette">{ids.map((id) => <span key={id} className="reasoning-palette-dot" style={{ backgroundColor: COLOUR_SWATCHES[id]?.hex }} title={swatchLabel(id)} aria-label={swatchLabel(id)} />)}</div>;
}

const recipeForResult = (result) => COLOUR_RECIPES.find((entry) => entry.result === result);

export default function AmariColorMixingLab({ onBack = noop, playSfx = noop, soundOn = true, onToggleSound = noop, speak = noop, cancelNarration = noop, onCelebrate = noop, onGameEvent = noop, playerId = 'amari' }) {
  const [progress, setProgress] = useState(() => getReasoningProgress('colormix', playerId));
  const [chapter, setChapter] = useState(() => getReasoningProgress('colormix', playerId).unlocked);
  const [stage, setStage] = useState('map');
  const [run, setRun] = useState(null);
  const [seed, setSeed] = useState(0);
  const [cursor, setCursor] = useState(0);
  const [results, setResults] = useState([]);
  const [locked, setLocked] = useState(false);
  const [missed, setMissed] = useState(false);
  const [hinted, setHinted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const cancelRef = useRef(cancelNarration);
  useEffect(() => { cancelRef.current = cancelNarration; }, [cancelNarration]);
  const stopNarration = useCallback(() => cancelRef.current?.(), []);
  const mission = run?.missions[cursor];
  const speakLine = useCallback((line, segments = [line]) => speak?.(line, { premium: false, segments }), [speak]);
  useEffect(() => () => stopNarration(), [stopNarration]);
  useEffect(() => { if (stage === 'play' && mission) onGameEvent?.('colormix', 'question', { level: chapter, round: cursor, seed }); }, [stage, mission, chapter, cursor, seed, onGameEvent]);

  const beginRun = (chapterIndex = chapter, replay = false) => {
    stopNarration();
    const nextSeed = randomSeed();
    const latest = getReasoningProgress('colormix', playerId);
    const nextRun = makeColourRun({ chapter: chapterIndex, seed: nextSeed, recentTaskIds: latest.recentIds[chapterIndex] || [] });
    if (!nextRun || nextRun.missions.length !== 6) { setFeedback('This colour lab needs six recipes. Ask your grown-up to check the activity.'); return; }
    setChapter(chapterIndex); setSeed(nextSeed); setRun(nextRun); setCursor(0); setResults([]); setLocked(false); setMissed(false); setHinted(false); setFeedback(''); setStage('play');
    onGameEvent?.('colormix', replay ? 'replay' : 'start', { level: chapterIndex, seed: nextSeed }); playSfx('click');
  };
  const returnToMap = (index = chapter) => { stopNarration(); setStage('map'); setRun(null); setFeedback(''); setChapter(Math.min(index, progress.unlocked)); };
  const hint = () => { if (hinted || locked) return; setHinted(true); setFeedback(COLOUR_MODEL.note); onGameEvent?.('colormix', 'hint', { level: chapter, round: cursor, seed, hints: 1, hintType: 'clue' }); };
  const choose = (choice) => {
    if (!mission || locked) return;
    const checked = markColourAnswer(mission, choice);
    if (!checked.valid) return;
    if (!checked.correct) { const attempt = batch5AttemptMetrics(missed, Number(hinted)); setMissed(true); setFeedback('Try again. Use the colour names and compare the recipe.'); playSfx('wrong'); onGameEvent?.('colormix', 'answer_wrong', { level: chapter, round: cursor, seed, skill: 'colour-recipe', item: mission.id, response: choice, expected: mission.answer, correct: false, ...attempt, hints: Number(hinted) }); return; }
    const { firstAttempt: firstTry } = batch5AttemptMetrics(missed, Number(hinted));
    setLocked(true); setFeedback(mission.fact); setResults((previous) => [...previous, { id: mission.id, correct: true, firstTry, hints: Number(hinted) }]);
    onGameEvent?.('colormix', 'answer_correct', { level: chapter, round: cursor, seed, skill: 'colour-recipe', item: mission.id, response: choice, expected: mission.answer, correct: true, ...batch5AttemptMetrics(missed, Number(hinted)), hints: Number(hinted) }); playSfx('success');
  };
  const next = () => {
    if (!locked) return;
    stopNarration();
    if (cursor < 5) { setCursor((value) => value + 1); setLocked(false); setMissed(false); setHinted(false); setFeedback(''); return; }
    const completion = completeReasoningRun({ game: 'colormix', run, results, playerId });
    if (completion) {
      setProgress(completion.progress);
      if (completion.awardedStars > 0) onCelebrate('Colour Lab chapter badge!', completion.awardedStars * 4, 150, 'colormix');
    }
    setStage('finish'); onGameEvent?.('colormix', 'level_complete', { level: chapter, seed, stars: completion?.stars || 0 });
  };

  if (playerId !== 'amari') return null;
  if (stage === 'map' || stage === 'finish') return <div className="amari-scene reasoning-scene reasoning-scene--colour flex flex-col" aria-label="Amari Colour Mixing Lab">
    <header className="amari-scene-header relative z-20"><button type="button" onClick={onBack} className="game-icon-button" aria-label="Back to Creative Lab"><ArrowLeft /></button><div className="amari-scene-title"><h1 className="text-lg font-black sm:text-2xl">Colour Mixing Lab</h1><p className="text-xs text-sky-100">Three recipe chapters · {progress.completed.length} badges</p></div><SoundToggle soundOn={soundOn} onToggle={onToggleSound} /></header>
    <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 py-5 text-center"><p className="amari-scene-card max-w-2xl p-4 font-bold">Our colour lab uses a simple classroom paint model: one part of each named colour. Real paints can vary. You can read or hear every recipe.</p>
      {progress.palettes.length > 0 && <section className="amari-scene-card mt-4 w-full p-4"><h2 className="font-black">Your saved palette</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{progress.palettes.map((id) => { const savedRecipe = recipeForResult(id); return <div key={id} className="rounded-xl bg-white/80 p-3"><div className="flex items-center justify-center gap-2"><PaintPot colour={id} /><strong>{swatchLabel(id)}</strong></div>{savedRecipe && <><p className="mt-2 text-sm font-bold">{swatchLabel(savedRecipe.first)} + {swatchLabel(savedRecipe.second)} makes {swatchLabel(id)}.</p><p className="text-xs">{savedRecipe.fact}</p></>}</div>; })}</div></section>}
      <div className="mt-4 grid w-full gap-3 sm:grid-cols-3">{COLOUR_CHAPTERS.map((item, index) => <button key={item.id} type="button" disabled={index > progress.unlocked} onClick={() => { stopNarration(); setChapter(index); setFeedback(''); }} aria-pressed={chapter === index} className={`min-h-20 rounded-2xl border-2 p-3 text-left font-black disabled:opacity-40 ${chapter === index ? 'border-fuchsia-700 bg-fuchsia-100' : 'border-white bg-white/90'}`}><span className="block text-xs uppercase">Chapter {index + 1} {progress.completed.includes(index) ? '· Badge earned' : index > progress.unlocked ? '· Locked' : ''}</span>{item.title}<span className="mt-1 block text-xs font-semibold">{item.skill}</span>{progress.bestStars[index] ? <span className="block text-xs">Best: {'★'.repeat(progress.bestStars[index])}</span> : null}</button>)}</div>
      {stage === 'finish' ? <section className="amari-scene-card mt-5 w-full p-5"><h2 className="text-2xl font-black">Chapter complete!</h2><p className="mt-2 font-semibold">Your mixed colours and their classroom recipes stay in the saved palette.</p><PaletteDots ids={progress.palettes} /><div className="mt-4 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => beginRun(chapter, true)} className="min-h-12 rounded-xl bg-fuchsia-700 px-5 font-black text-white"><RotateCcw className="mr-2 inline" size={18} />Replay with new recipes</button>{chapter < 2 && progress.unlocked > chapter && <button type="button" onClick={() => returnToMap(progress.unlocked)} className="min-h-12 rounded-xl bg-white px-5 font-black">Choose next chapter</button>}</div></section> : <><div className="amari-scene-card mt-4 flex w-full max-w-lg flex-wrap items-center justify-center gap-3 p-4"><p className="w-full font-black">{COLOUR_MODEL.note}</p>{Object.keys(COLOUR_SWATCHES).slice(0, chapter === 0 ? 3 : 8).map((id) => <div className="flex min-w-16 flex-col items-center gap-1" key={id}><PaintPot colour={id} small /><span className="text-xs font-bold">{swatchLabel(id)}</span></div>)}</div><button type="button" onClick={() => beginRun(chapter)} className="mt-5 min-h-14 w-full max-w-lg rounded-2xl bg-fuchsia-800 text-lg font-black text-white">Start {COLOUR_CHAPTERS[chapter]?.title}</button></>}
      {feedback && stage === 'map' && <p role="status" className="mt-3 rounded-xl bg-amber-100 p-3 font-bold">{feedback}</p>}
    </main></div>;

  const displayedMixResult = mission?.mixResult || (chapter === 2 ? mission?.target : null);
  const recipe = mission ? (chapter === 2 ? COLOUR_RECIPES.find((item) => item.id === mission.answer) : recipeForResult(displayedMixResult)) : null;
  const designObject = mission?.id.startsWith('design:') ? mission.id.slice('design:'.length) : null;
  const instruction = chapter === 2 ? 'Choose the recipe that matches the design brief.' : 'Use the named colours. The recipe uses one part of each.';
  return <div className="amari-scene reasoning-scene reasoning-scene--colour flex flex-col" aria-label="Amari Colour Mixing Lab">
    <header className="amari-scene-header relative z-20"><button type="button" onClick={onBack} className="game-icon-button" aria-label="Back to Creative Lab"><ArrowLeft /></button><div className="amari-scene-title"><p className="text-xs font-black uppercase">Chapter {chapter + 1} · Recipe {cursor + 1} of 6</p><h1 className="text-lg font-black sm:text-2xl">{COLOUR_CHAPTERS[chapter].title}</h1></div><SoundToggle soundOn={soundOn} onToggle={onToggleSound} /></header>
    <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 py-4 text-center">
      <section className="amari-scene-card w-full p-4 sm:p-5"><p className="text-lg font-black">{mission.prompt}</p><button type="button" onClick={() => speakLine(mission.prompt)} className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-xl bg-blue-700 px-4 font-black text-white"><Volume2 size={18} /> Hear the brief</button><p className="mt-2 text-sm font-bold">{instruction}</p>
        {designObject && <div className="mx-auto mt-2 w-40"><DesignArt object={designObject} colour={mission.target} /></div>}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3" aria-label="Named colour recipe inputs">
          {mission.first && <div className="flex items-center gap-2 rounded-xl bg-fuchsia-50 px-3 py-2"><PaintPot colour={mission.first} /><span className="font-black">{swatchLabel(mission.first)}</span></div>}
          {mission.first && <span className="text-2xl font-black text-fuchsia-700">+</span>}
          {mission.second ? <div className="flex items-center gap-2 rounded-xl bg-fuchsia-50 px-3 py-2"><PaintPot colour={mission.second} /><span className="font-black">{swatchLabel(mission.second)}</span></div> : mission.first && !locked && <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-fuchsia-300 px-3 py-2"><span aria-hidden="true" className="text-2xl">?</span><span className="font-black">Choose an addition</span></div>}
          {locked && !mission.second && recipe && <div className="flex items-center gap-2 rounded-xl bg-fuchsia-50 px-3 py-2"><PaintPot colour={recipe.second} /><span className="font-black">Added {swatchLabel(recipe.second)}</span></div>}
          {chapter === 2 && locked && recipe && <div className="flex items-center gap-2 rounded-xl bg-fuchsia-50 px-3 py-2"><PaintPot colour={recipe.first} /><span className="font-black">{swatchLabel(recipe.first)} + {swatchLabel(recipe.second)}</span><PaintPot colour={recipe.second} /></div>}
        </div>
        {displayedMixResult && <div className={`reasoning-mix-stage mt-3 ${locked ? 'is-mixed' : ''}`} aria-label={locked ? `Mixed ${swatchLabel(displayedMixResult)}` : 'Empty mixing beaker'}><Beaker colour={locked ? displayedMixResult : null} active={locked} label={locked ? `${swatchLabel(displayedMixResult)} mixed paint` : 'Empty beaker'} /><span className="font-black">{locked ? swatchLabel(displayedMixResult) : '1 part + 1 part'}</span></div>}
      </section>
      <div className={`mt-4 grid w-full gap-3 ${chapter === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`} role="group" aria-label={chapter === 2 ? 'Choose a recipe' : 'Choose a colour'}>
        {mission.choices.map((choice) => {
          const isRecipe = chapter === 2;
          const result = isRecipe ? COLOUR_RECIPES.find((entry) => entry.id === choice)?.result : choice;
          const label = colourChoiceLabel(mission, choice);
          return <button key={choice} type="button" disabled={locked} onClick={() => choose(choice)} className={`reasoning-colour-choice ${locked && choice === mission.answer ? 'is-correct' : ''}`} aria-label={`Choose ${label}`}>
            {isRecipe ? <div className="flex items-center justify-center gap-1"><PaintPot colour={COLOUR_RECIPES.find((entry) => entry.id === choice)?.first} small /><span className="font-black">+</span><PaintPot colour={COLOUR_RECIPES.find((entry) => entry.id === choice)?.second} small /></div> : <PaintPot colour={choice} />}
            <span>{label}</span>{locked && choice === mission.answer && <span className="reasoning-colour-choice__result">Makes {swatchLabel(result)}</span>}
          </button>;
        })}
      </div>
      <div className="mt-3 flex w-full flex-wrap justify-center gap-3">{!locked && <button type="button" onClick={hint} disabled={hinted} className="min-h-12 rounded-xl border-2 border-amber-500 bg-white px-4 font-black disabled:opacity-50"><Lightbulb className="mr-2 inline" size={18} />Use one hint</button>}{locked && <button type="button" onClick={() => speakLine(mission.fact)} className="min-h-12 rounded-xl bg-cyan-100 px-4 font-black"><Volume2 className="mr-2 inline" size={18} />Hear the colour fact</button>}</div>
      {feedback && <p role="status" className={`mt-3 w-full rounded-xl p-3 font-bold ${locked ? 'bg-emerald-100' : 'bg-amber-100'}`}>{feedback}</p>}
      {hinted && !locked && <p role="note" className="mt-2 rounded-xl bg-white/90 p-3 text-sm font-bold">{mission.clue}</p>}
      {locked && <button type="button" onClick={next} className="mt-4 min-h-14 w-full rounded-2xl bg-fuchsia-800 text-lg font-black text-white">{cursor === 5 ? 'Finish chapter' : 'Next recipe'}</button>}
    </main></div>;
}
