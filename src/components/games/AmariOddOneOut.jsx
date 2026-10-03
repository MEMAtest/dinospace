import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Lightbulb, RotateCcw, Volume2 } from 'lucide-react';
import { makeOddRun, markOddAnswer, ODD_CHAPTERS, ODD_RULES } from '../../data/batch5Reasoning.js';
import { completeReasoningRun, getReasoningProgress } from '../../data/batch5ReasoningProgress.js';
import { SoundToggle } from '../shared/index.jsx';
import { batch5AttemptMetrics } from './batch5AttemptMetrics.js';
import './batch5ReasoningGames.css';

const noop = () => {};
const randomSeed = () => globalThis.crypto?.getRandomValues ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0] || 1 : Math.floor(Math.random() * 0xffffffff) || 1;

const CATEGORY_COLOURS = { fruit: '#ed6a58', animal: '#5eab75', vehicle: '#4386c5', instrument: '#b78645', clothing: '#9875c7', plant: '#4b9b69', tool: '#72869e', tableware: '#4e9db5' };
function NumberArt({ item }) {
  return <svg viewBox="0 0 112 112" className="reasoning-thing-art" role="img" aria-label={`Number ${item.number}`}><circle cx="56" cy="56" r="47" fill="#f1f7ff" stroke="#345779" strokeWidth="5" /><path d="M21 82h70" stroke="#bfcee0" strokeWidth="3" strokeDasharray="4 5" /><text x="56" y="72" textAnchor="middle" fontSize="53" fontWeight="900" fill="#173d68">{item.number}</text></svg>;
}
function ShapeArt({ item }) {
  const fill = ({ red: '#ef3340', blue: '#2675eb', green: '#34a853', yellow: '#ffd43b' })[item.colour];
  const shape = item.shape === 'circle' ? <circle cx="56" cy="56" r="34" fill={fill} />
    : item.shape === 'square' ? <rect x="23" y="23" width="66" height="66" rx="4" fill={fill} />
      : item.shape === 'triangle' ? <path d="M56 18 94 87H18z" fill={fill} />
        : <path d="m56 12 12 29 32 2-25 20 9 31-28-17-28 17 9-31-25-20 32-2z" fill={fill} />;
  return <svg viewBox="0 0 112 112" className="reasoning-thing-art" role="img" aria-label={`${item.colour} ${item.shape}`}><circle cx="56" cy="56" r="49" fill="#fff" stroke="#dae5ee" strokeWidth="3" />{shape}</svg>;
}
function CategoryArt({ item }) {
  const category = item.category;
  const slug = item.id.split(':').at(-1);
  const fruit = category === 'fruit'; const animal = category === 'animal'; const vehicle = category === 'vehicle';
  const instrument = category === 'instrument'; const clothing = category === 'clothing'; const plant = category === 'plant';
  const tool = category === 'tool';
  let illustration;
  if (fruit) {
    if (slug === 'banana') illustration = <path d="M24 30q16 54 63 40 7-2 12-9-22 5-39-3-18-8-25-36-5-9-11 8z" fill="#f6c846" stroke="#6a5730" strokeWidth="5" strokeLinejoin="round" />;
    else if (slug === 'grapes') illustration = <g fill="#8458bd" stroke="#503878" strokeWidth="2"><circle cx="43" cy="52" r="15"/><circle cx="66" cy="50" r="15"/><circle cx="54" cy="71" r="15"/><circle cx="78" cy="70" r="14"/><circle cx="42" cy="84" r="12"/><path d="M56 35q5-19 22-17" fill="none" stroke="#4d9054" strokeWidth="7"/></g>;
    else if (slug === 'strawberry') illustration = <><path d="M29 43q27-29 54 0-1 37-27 55-25-20-27-55z" fill="#ea5361" stroke="#8b3547" strokeWidth="4"/><path d="M41 40q15-18 30 0" fill="#4f9a58" stroke="#326f43" strokeWidth="4"/>{[0,1,2,3,4].map((i)=><ellipse key={i} cx={40+i*8} cy={55+(i%2)*13} rx="2" ry="4" fill="#ffe9a1" />)}</>;
    else illustration = <><circle cx="56" cy="59" r="33" fill={slug === 'banana' ? '#f3c640' : slug === 'pear' ? '#8db85a' : slug === 'orange' ? '#f59a38' : '#df5965'} stroke="#724a48" strokeWidth="4"/><path d="M56 25q0-13 10-15m-10 15q16-13 25-3-11 12-25 3" fill="#5c9d55" stroke="#3d6e45" strokeWidth="3"/>{slug === 'apple' && <path d="M56 35q-17-15-27 1-9 14 2 37 9 18 25 5 16 13 25-5 11-23 2-37-10-16-27-1z" fill="#e24f57" stroke="#913e47" strokeWidth="4"/>}</>;
  } else if (animal) {
    if (slug === 'fish') illustration = <><path d="M22 56 41 38q31-21 56 18-25 39-56 18z" fill="#50b4c7" stroke="#286b7b" strokeWidth="4"/><path d="m91 56 15-15v30z" fill="#f0bd55" stroke="#795b37" strokeWidth="3"/><circle cx="47" cy="51" r="4" fill="#18304d"/></>;
    else if (slug === 'duck') illustration = <><ellipse cx="53" cy="66" rx="34" ry="23" fill="#f5d151" stroke="#846f35" strokeWidth="4"/><circle cx="70" cy="39" r="19" fill="#f5d151" stroke="#846f35" strokeWidth="4"/><path d="m86 39 19 7-19 7" fill="#e98948" stroke="#795242" strokeWidth="3"/><circle cx="75" cy="35" r="3" fill="#19314c"/></>;
    else illustration = <><ellipse cx="55" cy="66" rx="33" ry="23" fill={slug === 'cat' ? '#e5aa66' : slug === 'rabbit' ? '#e8eaf0' : '#a97753'} stroke="#645344" strokeWidth="4"/><circle cx="73" cy="42" r="20" fill={slug === 'horse' ? '#946648' : '#d9ae7f'} stroke="#645344" strokeWidth="4"/>{slug === 'rabbit' ? <><path d="M66 24q-13-32 0-32 12 1 8 33m4 0q-2-30 11-27 12 4-1 32" fill="#e9dce0" stroke="#645344" strokeWidth="4" transform="translate(0 18)"/></> : slug === 'dog' || slug === 'cat' ? <path d="M59 35q-25-24-20 5m38-7q24-23 19 8" fill="#bb8263" stroke="#645344" strokeWidth="4"/> : null}<circle cx="79" cy="40" r="3" fill="#19314c"/><path d="M91 50h10" stroke="#e49b64" strokeWidth="7" strokeLinecap="round"/></>;
  } else if (vehicle) {
    if (slug === 'rocket') illustration = <><path d="M56 15q27 18 24 53l-24 22-24-22Q29 33 56 15z" fill="#e94e56" stroke="#77374b" strokeWidth="4"/><circle cx="56" cy="49" r="10" fill="#b8edfa" stroke="#315a72" strokeWidth="3"/><path d="m34 61-17 19 17 2m44-21 17 19-17 2" fill="#477ac0" stroke="#31527b" strokeWidth="4"/><path d="M49 88q-9 14-4 18l11-8 11 8q5-4-4-18" fill="#f2aa3b"/></>;
    else illustration = <><path d="M19 59h18l10-22h31l15 22h7q6 0 6 8v14H18V67q0-8 1-8z" fill={slug === 'bus' ? '#e8bd42' : '#4d8fbc'} stroke="#35536f" strokeWidth="4"/><circle cx="37" cy="82" r="10" fill="#283a50"/><circle cx="82" cy="82" r="10" fill="#283a50"/><path d="M53 43h21v15H46z" fill="#dbf4fb" stroke="#35536f" strokeWidth="3"/>{slug === 'train' && <path d="M26 47q-1-18 13-18h8" fill="none" stroke="#35536f" strokeWidth="5"/>}</>;
  } else if (instrument) {
    if (slug === 'drum') illustration = <><ellipse cx="56" cy="36" rx="33" ry="14" fill="#f4f1df" stroke="#604c53" strokeWidth="4"/><path d="M23 36v40q2 18 33 18t33-18V36" fill="#d85a5d" stroke="#604c53" strokeWidth="4"/><ellipse cx="56" cy="76" rx="32" ry="13" fill="#c7424d" stroke="#604c53" strokeWidth="4"/><path d="m28 25 55 58m2-57L29 84" stroke="#825f48" strokeWidth="5" strokeLinecap="round"/></>;
    else illustration = <><path d="M56 19v46q-15-14-27-1-14 14 0 27 16 12 29-3 7-9 7-23V31q18 11 25-2-18-1-34-10z" fill="#e9b866" stroke="#704d32" strokeWidth="4"/><circle cx="55" cy="65" r="4" fill="#574234"/><path d="M57 22v43m-4-39v36m8-35v36m-12-33v30m16-28v28" stroke="#775b42" strokeWidth="1.5"/></>;
  } else if (clothing) {
    illustration = slug === 'sock' ? <path d="M42 17h31v41q0 10 16 15 17 6 11 22-23 11-46-5-11-7-2-23V17z" fill="#5ba3ce" stroke="#395c77" strokeWidth="5" />
      : slug === 'hat' ? <><path d="M32 62q0-35 24-42 25 7 25 42z" fill="#e6a348" stroke="#69523a" strokeWidth="5"/><path d="M20 62h72v16H20z" fill="#d18243" stroke="#69523a" strokeWidth="5"/></>
        : <><path d="m31 28 16-11h18l16 11 15 20-15 11-9-9v44H30V50l-9 9-15-11 15-20z" fill="#62a6ce" stroke="#3a5e78" strokeWidth="5"/><path d="M47 18q9 15 18 0" fill="none" stroke="#fff" strokeWidth="4"/></>;
  } else if (plant) {
    if (slug === 'cactus') illustration = <><path d="M47 93V40q0-15 12-15t12 15v14h9V40q0-10 9-10t10 10v22q0 10-10 10H71v21z" fill="#56a96b" stroke="#326c4a" strokeWidth="5"/><path d="M23 94h70" stroke="#9a714c" strokeWidth="7" strokeLinecap="round"/></>;
    else if (slug === 'sunflower' || slug === 'rose') illustration = <><path d="M56 59v42m0-15q-26-18-31 1 13 14 31-1m0-7q24-20 33-1-10 14-33 1" fill="#5c9d58" stroke="#3f7048" strokeWidth="4"/><circle cx="56" cy="38" r="15" fill="#a35772" stroke="#71394f" strokeWidth="3"/>{Array.from({length:8},(_,i)=><ellipse key={i} cx={56+Math.cos(i*Math.PI/4)*20} cy={38+Math.sin(i*Math.PI/4)*20} rx="9" ry="13" fill={slug==='sunflower'?'#f1c242':'#e67b91'} stroke="#784858" strokeWidth="2" transform={`rotate(${i*45} ${56+Math.cos(i*Math.PI/4)*20} ${38+Math.sin(i*Math.PI/4)*20})`}/>)}</>;
    else illustration = <><path d="M56 98V45m0 18Q27 52 28 34q27-3 28 29zm0-14q24-28 36-12-6 25-36 30z" fill="#65aa6d" stroke="#3f7048" strokeWidth="4"/><path d="M31 98h52" stroke="#91674a" strokeWidth="7" strokeLinecap="round"/></>;
  } else if (tool) {
    if (slug === 'wrench') illustration = <path d="M72 22q18-11 28 5l-22 18-2 27-38 24-13-13 24-38 27-2 18-21q-12-7-22 0z" fill="#91a5b8" stroke="#45596d" strokeWidth="5" strokeLinejoin="round" />;
    else if (slug === 'spade') illustration = <><path d="M54 15h9v55h-9z" fill="#986e4c"/><path d="M58 66q-34 5-28 29 28 17 57 0-1-24-29-29z" fill="#8299aa" stroke="#4b6174" strokeWidth="5"/></>;
    else illustration = <><path d="M52 28h10v52H52z" fill="#a8784f"/><path d="M43 18h28v13H43z" fill="#bd7f48" stroke="#6c5139" strokeWidth="4"/><path d="M55 79h8l-4 22z" fill="#9eabb8" stroke="#536579" strokeWidth="3"/></>;
  } else {
    illustration = slug === 'spoon' ? <><ellipse cx="56" cy="34" rx="21" ry="27" fill="#d4e6ec" stroke="#57717b" strokeWidth="5"/><path d="M52 56h8v45h-8z" fill="#b8d0d8" stroke="#57717b" strokeWidth="3"/></>
      : slug === 'fork' ? <><path d="M49 18v25m8-25v25m8-25v25m8-25v25q0 12-12 12v43h-7V60q-12 0-12-12V18" fill="#c7dce3" stroke="#57717b" strokeWidth="4" strokeLinejoin="round"/></>
        : slug === 'cup' || slug === 'jug' ? <><path d="M29 30h48v62H38q-9-3-9-15z" fill="#8cc7dc" stroke="#4a7382" strokeWidth="5"/><path d="M77 43h10q18 0 15 20-3 17-25 15" fill="none" stroke="#4a7382" strokeWidth="6"/></>
          : <><ellipse cx="56" cy="48" rx="37" ry="19" fill="#f7fafc" stroke="#5e7882" strokeWidth="5"/><path d="M19 48v17q6 25 37 25t37-25V48q-5 20-37 20T19 48z" fill="#a8d3df" stroke="#5e7882" strokeWidth="5"/></>;
  }
  return <svg viewBox="0 0 112 112" className="reasoning-thing-art" role="img" aria-label={item.label}><circle cx="56" cy="56" r="51" fill="#fff" stroke="#dfe9f0" strokeWidth="3" /><circle cx="56" cy="56" r="48" fill={CATEGORY_COLOURS[category] || '#687c96'} fillOpacity=".1" />{illustration}<title>{item.label}</title></svg>;
}
function ThingArt({ item }) { return item.kind === 'number' ? <NumberArt item={item} /> : item.kind === 'shape' ? <ShapeArt item={item} /> : <CategoryArt item={item} />; }

export default function AmariOddOneOut({ onBack = noop, playSfx = noop, soundOn = true, onToggleSound = noop, speak = noop, cancelNarration = noop, onCelebrate = noop, onGameEvent = noop, playerId = 'amari' }) {
  const [progress, setProgress] = useState(() => getReasoningProgress('oddoneout', playerId));
  const [chapter, setChapter] = useState(() => getReasoningProgress('oddoneout', playerId).unlocked);
  const [stage, setStage] = useState('map');
  const [run, setRun] = useState(null);
  const [seed, setSeed] = useState(0);
  const [cursor, setCursor] = useState(0);
  const [phase, setPhase] = useState('item');
  const [selectedId, setSelectedId] = useState('');
  const [results, setResults] = useState([]);
  const [itemMissed, setItemMissed] = useState(false);
  const [reasonMissed, setReasonMissed] = useState(false);
  const [hinted, setHinted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState('');
  const cancelRef = useRef(cancelNarration);
  useEffect(() => { cancelRef.current = cancelNarration; }, [cancelNarration]);
  const stopNarration = useCallback(() => cancelRef.current?.(), []);
  const mission = run?.missions[cursor];
  const selectedItem = mission?.choices.find((item) => item.id === selectedId);
  const speakLine = useCallback((line, segments = [line]) => speak?.(line, { premium: false, segments }), [speak]);
  useEffect(() => () => stopNarration(), [stopNarration]);
  useEffect(() => { if (stage === 'play' && mission) onGameEvent?.('oddoneout', 'question', { level: chapter, round: cursor, seed }); }, [stage, mission, chapter, cursor, seed, onGameEvent]);

  const beginRun = (chapterIndex = chapter, replay = false) => {
    stopNarration();
    const nextSeed = randomSeed(); const latest = getReasoningProgress('oddoneout', playerId);
    const nextRun = makeOddRun({ chapter: chapterIndex, seed: nextSeed, recentRuleIds: latest.recentIds[chapterIndex] || [] });
    if (!nextRun?.missions || nextRun.missions.length !== 6) { setFeedback(nextRun?.error || 'This chapter needs six clear rule challenges. Ask your grown-up to check the activity.'); return; }
    setChapter(chapterIndex); setSeed(nextSeed); setRun(nextRun); setCursor(0); setResults([]); setPhase('item'); setSelectedId(''); setItemMissed(false); setReasonMissed(false); setHinted(false); setLocked(false); setFeedback(''); setStage('play');
    onGameEvent?.('oddoneout', replay ? 'replay' : 'start', { level: chapterIndex, seed: nextSeed }); playSfx('click');
  };
  const toMap = (index = chapter) => { stopNarration(); setStage('map'); setRun(null); setChapter(index); setFeedback(''); };
  const hint = () => { if (hinted || locked) return; setHinted(true); setFeedback(mission.explanation); onGameEvent?.('oddoneout', 'hint', { level: chapter, round: cursor, seed, hints: 1, hintType: 'clue' }); };
  const chooseItem = (item) => {
    if (locked || phase !== 'item') return;
    if (item.id !== mission.answerId) { const attempt = batch5AttemptMetrics(itemMissed || reasonMissed, Number(hinted)); setItemMissed(true); setFeedback('Not that one. Read the named rule again and look at all four pictures.'); playSfx('wrong'); onGameEvent?.('oddoneout', 'answer_wrong', { level: chapter, round: cursor, seed, skill: 'rule-classification', item: mission.ruleId, response: 'incorrect-item', expected: 'one-outside-rule', correct: false, ...attempt, hints: Number(hinted) }); return; }
    const answer = markOddAnswer(mission, item.id, 0);
    if (answer.invalid) return;
    setSelectedId(item.id); setPhase('reason'); setFeedback('You found the one that does not fit. Now choose why.'); playSfx('tap');
  };
  const chooseReason = (reason) => {
    if (locked || phase !== 'reason') return;
    const answer = markOddAnswer(mission, selectedId, reason.id);
    if (answer.invalid) return;
    if (!answer.correct) { const attempt = batch5AttemptMetrics(itemMissed || reasonMissed, Number(hinted)); setReasonMissed(true); setFeedback('Try another reason. Use the exact property named at the top.'); playSfx('wrong'); onGameEvent?.('oddoneout', 'answer_wrong', { level: chapter, round: cursor, seed, skill: 'rule-classification', item: mission.ruleId, response: 'incorrect-reason', expected: 'reason-for-outlier', correct: false, ...attempt, hints: Number(hinted) }); return; }
    const { firstAttempt: firstTry } = batch5AttemptMetrics(itemMissed || reasonMissed, Number(hinted));
    setLocked(true); setFeedback(`${mission.explanation} ${reason.text}`);
    setResults((previous) => [...previous, { id: mission.id, correct: true, firstTry, hints: Number(hinted) }]);
    onGameEvent?.('oddoneout', 'answer_correct', { level: chapter, round: cursor, seed, skill: 'rule-classification', item: mission.ruleId, response: mission.answerId, expected: mission.reasonId, correct: true, ...batch5AttemptMetrics(itemMissed || reasonMissed, Number(hinted)), hints: Number(hinted) }); playSfx('success');
  };
  const next = () => {
    if (!locked) return;
    stopNarration();
    if (cursor < 5) { setCursor((value) => value + 1); setPhase('item'); setSelectedId(''); setItemMissed(false); setReasonMissed(false); setHinted(false); setLocked(false); setFeedback(''); return; }
    const completion = completeReasoningRun({ game: 'oddoneout', run, results, playerId });
    if (completion) { setProgress(completion.progress); if (completion.awardedStars > 0) onCelebrate('Odd One Out chapter badge!', completion.awardedStars * 4, 150, 'oddoneout'); }
    setStage('finish'); onGameEvent?.('oddoneout', 'level_complete', { level: chapter, seed, stars: completion?.stars || 0 });
  };

  if (playerId !== 'amari') return null;
  if (stage === 'map' || stage === 'finish') return <div className="amari-scene reasoning-scene reasoning-scene--odd flex flex-col" aria-label="Amari Odd One Out">
    <header className="amari-scene-header relative z-20"><button type="button" onClick={onBack} className="game-icon-button" aria-label="Back to Thinking and Play"><ArrowLeft /></button><div className="amari-scene-title"><h1 className="text-lg font-black sm:text-2xl">Odd One Out</h1><p className="text-xs text-sky-100">Name the rule · find the item · explain why</p></div><SoundToggle soundOn={soundOn} onToggle={onToggleSound} /></header>
    <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 py-5 text-center"><p className="amari-scene-card max-w-2xl p-4 font-bold">Read the rule before choosing. Then tell us why the picture does not fit. Each chapter has six new challenges.</p>
      <div className="mt-4 grid w-full gap-3 sm:grid-cols-3">{ODD_CHAPTERS.map((item, index) => <button key={item.id} type="button" disabled={index > progress.unlocked} onClick={() => { stopNarration(); setChapter(index); setFeedback(''); }} aria-pressed={chapter === index} className={`min-h-20 rounded-2xl border-2 p-3 text-left font-black disabled:opacity-40 ${chapter === index ? 'border-cyan-700 bg-cyan-100' : 'border-white bg-white/90'}`}><span className="block text-xs uppercase">Chapter {index + 1} {progress.completed.includes(index) ? '· Badge earned' : index > progress.unlocked ? '· Locked' : ''}</span>{item.title}<span className="mt-1 block text-xs font-semibold">{item.skill}</span>{progress.bestStars[index] ? <span className="block text-xs">Best: {'★'.repeat(progress.bestStars[index])}</span> : null}</button>)}</div>
      {stage === 'finish' ? <section className="amari-scene-card mt-5 w-full p-5"><h2 className="text-2xl font-black">Chapter complete!</h2><p className="mt-2 font-semibold">You used the named rule and explained your choices.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => beginRun(chapter, true)} className="min-h-12 rounded-xl bg-cyan-700 px-5 font-black text-white"><RotateCcw className="mr-2 inline" size={18} />Replay with new puzzles</button>{chapter < 2 && progress.unlocked > chapter && <button type="button" onClick={() => toMap(progress.unlocked)} className="min-h-12 rounded-xl bg-white px-5 font-black">Choose next chapter</button>}</div></section> : <button type="button" onClick={() => beginRun(chapter)} className="mt-5 min-h-14 w-full max-w-lg rounded-2xl bg-cyan-800 text-lg font-black text-white">Start {ODD_CHAPTERS[chapter]?.title}</button>}
      {feedback && stage === 'map' && <p role="status" className="mt-3 rounded-xl bg-amber-100 p-3 font-bold">{feedback}</p>}
    </main></div>;

  return <div className="amari-scene reasoning-scene reasoning-scene--odd flex flex-col" aria-label="Amari Odd One Out">
    <header className="amari-scene-header relative z-20"><button type="button" onClick={onBack} className="game-icon-button" aria-label="Back to Thinking and Play"><ArrowLeft /></button><div className="amari-scene-title"><p className="text-xs font-black uppercase">Chapter {chapter + 1} · Puzzle {cursor + 1} of 6</p><h1 className="text-lg font-black sm:text-2xl">{ODD_CHAPTERS[chapter].title}</h1></div><SoundToggle soundOn={soundOn} onToggle={onToggleSound} /></header>
    <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-3 py-3 text-center sm:px-4 sm:py-5">
      <section className="amari-scene-card w-full p-3 sm:p-5"><p className="text-lg font-black sm:text-xl">{mission.property}</p><button type="button" onClick={() => speakLine(mission.property)} className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-xl bg-blue-700 px-4 font-black text-white"><Volume2 size={18} />Hear the rule</button><p className="mt-2 text-sm font-bold">{phase === 'item' ? 'Choose one picture. Then choose a reason.' : 'You chose this picture. Now choose the reason that follows the rule.'}</p></section>
      <div className="mt-3 grid w-full grid-cols-2 gap-3" role="group" aria-label={phase === 'item' ? 'Choose the item that does not follow the named rule' : 'Choose why the selected item does not follow the rule'}>
        {mission.choices.map((item) => <button key={item.id} type="button" disabled={phase !== 'item' || locked} onClick={() => chooseItem(item)} aria-pressed={selectedId === item.id} className={`reasoning-odd-choice ${selectedId === item.id ? 'is-selected' : ''}`}><ThingArt item={item} /><span className="reasoning-odd-choice__label">{item.label}</span></button>)}
      </div>
      {phase === 'reason' && !locked && <section className="amari-scene-card mt-3 w-full p-3"><h2 className="font-black">Because…</h2><p className="text-sm font-semibold">Which reason tells why {selectedItem?.label} does not fit?</p><div className="mt-2 grid gap-2">{mission.reasons.map((reason) => <button key={reason.id} type="button" onClick={() => chooseReason(reason)} className="min-h-12 rounded-xl border-2 border-cyan-300 bg-white px-3 py-2 text-left font-bold hover:bg-cyan-50">{reason.text}</button>)}</div></section>}
      {!locked && <div className="mt-3 flex flex-wrap justify-center gap-3"><button type="button" onClick={hint} disabled={hinted} className="min-h-12 rounded-xl border-2 border-amber-500 bg-white px-4 font-black disabled:opacity-50"><Lightbulb className="mr-2 inline" size={18} />Use one hint</button>{hinted && <p className="max-w-xl rounded-xl bg-amber-50 p-3 text-sm font-bold">{mission.explanation}</p>}</div>}
      {feedback && <p role="status" className={`mt-3 w-full rounded-xl p-3 font-bold ${locked ? 'bg-emerald-100' : 'bg-amber-100'}`}>{feedback}{locked && <button type="button" onClick={() => speakLine(feedback, [mission.explanation, mission.reasons.find((reason) => reason.id === mission.reasonId)?.text])} className="ml-2 mt-2 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-3"><Volume2 size={18} />Hear why</button>}</p>}
      {locked && <button type="button" onClick={next} className="mt-3 min-h-14 w-full rounded-2xl bg-cyan-800 text-lg font-black text-white">{cursor === 5 ? 'Finish chapter' : 'Next puzzle'}</button>}
    </main></div>;
}
