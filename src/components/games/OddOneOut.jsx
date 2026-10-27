import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Home, Lightbulb, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { SoundToggle } from '../shared/index.jsx';
import { getOfflineVoiceClip } from '../../data/offlineVoice.js';
import {
  ODD_ONE_OUT_CHAPTERS, ODD_ONE_OUT_ROUNDS_BY_CHAPTER,
  seededOddOneOutRun,
} from '../../data/oddOneOutAdventure.js';
import {
  readOddOneOutProgress, recentOddOneOutRoundIds, recordOddOneOutRound,
} from '../../data/oddOneOutProgress.js';

const INK = '#253b46';
const createRunSeed = () => Math.floor(Math.random() * 0x7fffffff) + 1;

function PictureArt({ entry }) {
  const { art, color, count = 3, text, size } = entry;
  const fill = color === 'red' ? '#df6558' : color === 'blue' ? '#4c91c6' : '#f0b85b';
  const scale = size === 'small' ? 0.65 : size === 'medium' ? 0.82 : 1;
  const dotPoints = [[42, 35], [70, 35], [98, 35], [42, 65], [70, 65], [98, 65]];
  let image;
  if (art === 'circle') image = <circle cx="70" cy="50" r="29" fill="#f5c967" stroke={INK} strokeWidth="4"/>;
  else if (art === 'oval') image = <ellipse cx="70" cy="50" rx="38" ry="24" fill="#8cc7d0" stroke={INK} strokeWidth="4"/>;
  else if (art === 'triangle') image = <path d="M70 18 112 82H28z" fill="#e88669" stroke={INK} strokeWidth="4" strokeLinejoin="round"/>;
  else if (art === 'square') image = <rect x="39" y="19" width="62" height="62" rx="4" fill="#76b88c" stroke={INK} strokeWidth="4"/>;
  else if (art === 'rectangle') image = <rect x="27" y="29" width="86" height="42" rx="4" fill="#76b88c" stroke={INK} strokeWidth="4"/>;
  else if (art === 'pentagon') image = <path d="m70 17 42 31-16 49H44L28 48z" fill="#88a7d6" stroke={INK} strokeWidth="4" strokeLinejoin="round"/>;
  else if (art === 'rhombus') image = <path d="m70 16 35 34-35 34-35-34z" fill="#88a7d6" stroke={INK} strokeWidth="4" strokeLinejoin="round"/>;
  else if (art === 'hexagon') image = <path d="m42 20h56l28 30-28 30H42L14 50z" fill="#c59ad4" stroke={INK} strokeWidth="4" strokeLinejoin="round"/>;
  else if (art === 'dots') image = <>{dotPoints.slice(0, count).map(([cx, cy], index) => <circle key={index} cx={cx} cy={cy} r="9" fill="#527d9f" stroke={INK} strokeWidth="2"/>)}</>;
  else if (art === 'word') image = <><rect x="18" y="23" width="104" height="54" rx="12" fill="#fff3cd" stroke="#d5a844" strokeWidth="3"/><text x="70" y="59" textAnchor="middle" fontSize="24" fontWeight="900" fill={INK}>{text}</text></>;
  else if (art === 'number') image = <text x="70" y="76" textAnchor="middle" fontSize="72" fontWeight="900" fill="#537aa4">{entry.value}</text>;
  else if (art === 'star') image = <polygon points="70,12 81,39 111,41 88,60 95,89 70,73 45,89 52,60 29,41 59,39" fill="#f4c558" stroke={INK} strokeWidth="4" strokeLinejoin="round" transform={`translate(${70 - 70 * scale} ${50 - 50 * scale}) scale(${scale})`}/>;
  else if (art === 'moon') image = <path d="M93 21a37 37 0 1 0 18 56A39 39 0 0 1 93 21z" fill="#f4d477" stroke={INK} strokeWidth="4"/>;
  else if (art === 'sun') image = <><circle cx="70" cy="50" r="22" fill="#f5bd53" stroke={INK} strokeWidth="3"/>{Array.from({ length: 8 }, (_, i) => <path key={i} d="M70 12v10" stroke="#e89e47" strokeWidth="5" strokeLinecap="round" transform={`rotate(${i * 45} 70 50)`}/>)}</>;
  else if (art === 'cloud' || art === 'rain') image = <><path d="M30 65a17 17 0 0 1 5-34 25 25 0 0 1 47-4 21 21 0 0 1 18 38z" fill="#a9d3df" stroke={INK} strokeWidth="4"/>{art === 'rain' && <path d="m48 73-5 12m25-12-5 12m25-12-5 12" stroke="#589ac0" strokeWidth="5" strokeLinecap="round"/>}</>;
  else if (art === 'snow') image = <><path d="M27 76a43 43 0 0 1 86 0" fill="#eef8fc" stroke="#8fb4c8" strokeWidth="3"/><path d="M34 76h72" stroke="#8fb4c8" strokeWidth="3"/>{[[40,31],[70,20],[99,38],[56,48],[87,57]].map(([cx,cy],i)=><g key={i} stroke="#75a9c5" strokeWidth="3" strokeLinecap="round"><path d={`M${cx-6} ${cy}h12m-6-6v12m-4-10 8 8m0-8-8 8`}/></g>)}</>;
  else if (art === 'rainbow') image = <><path d="M25 78a45 45 0 0 1 90 0" fill="none" stroke="#e66b59" strokeWidth="10"/><path d="M38 78a32 32 0 0 1 64 0" fill="none" stroke="#edbe50" strokeWidth="9"/><path d="M51 78a19 19 0 0 1 38 0" fill="none" stroke="#68a882" strokeWidth="8"/></>;
  else if (art === 'carrot') image = <><path d="m68 34 37 11-38 43-14-43z" fill="#ec914e" stroke={INK} strokeWidth="4"/><path d="M68 38q-2-20-19-25m21 25q8-21 24-22m-23 23q23-10 33-2" fill="none" stroke="#5a9c6a" strokeWidth="6" strokeLinecap="round"/></>;
  else if (['apple', 'pear', 'plum'].includes(art)) image = art === 'plum'
    ? <><ellipse cx="70" cy="55" rx="27" ry="30" fill="#8d68a8" stroke={INK} strokeWidth="4"/><path d="M70 28q0-14 11-19" fill="none" stroke="#76563c" strokeWidth="5"/><path d="M78 20q17-12 25-2-11 13-25 2" fill="#69a56b"/></>
    : <><path d={art === 'apple' ? 'M70 34C36 18 25 48 38 74c11 23 26 22 32 12 7 10 22 11 32-12 13-26 2-56-32-40z' : 'M60 29q10-18 20 0c0 14 18 26 13 47-5 19-38 19-45 0-8-21 12-33 12-47z'} fill={art === 'apple' ? '#dc6657' : '#85b96c'} stroke={INK} strokeWidth="4"/><path d="M70 34q0-14 12-19" fill="none" stroke="#76563c" strokeWidth="5"/><path d="M79 20q16-10 24 0-12 12-24 0" fill="#69a56b"/></>;
  else if (art === 'tulip') image = <><path d="M70 39v44m0-23q-22-18-31 1 17 20 31 8m0-7q21-19 31 0-12 19-31 9" fill="none" stroke="#559363" strokeWidth="7" strokeLinecap="round"/><path d="M47 39q-3-25 14-17 9-21 19-2 17-5 13 19-21 21-46 0" fill="#df7588" stroke={INK} strokeWidth="3"/></>;
  else if (art === 'car') image = <><path d="M27 58 36 38q4-8 15-8h36q10 0 16 11l9 17v19H27z" fill="#df6558" stroke={INK} strokeWidth="4" strokeLinejoin="round"/><path d="m45 38-7 18h27V38zm27 0v18h28l-7-14q-2-4-8-4z" fill="#d9f0f2" stroke={INK} strokeWidth="3"/><path d="M28 62h83" stroke="#f5bf64" strokeWidth="5"/><circle cx="46" cy="77" r="11" fill="#354b53"/><circle cx="46" cy="77" r="4" fill="#dce5e2"/><circle cx="92" cy="77" r="11" fill="#354b53"/><circle cx="92" cy="77" r="4" fill="#dce5e2"/></>;
  else if (art === 'boot') image = <><path d="M48 18h32v37q0 10 13 15l23 8q9 3 7 12-2 7-12 7H38q-10 0-10-9 0-8 8-13l12-8z" fill="#926548" stroke={INK} strokeWidth="4" strokeLinejoin="round"/><path d="M49 31h30m-30 12h30m-30 12h30" stroke="#d9c7a0" strokeWidth="4" strokeLinecap="round"/><path d="M31 89h82" stroke="#4e5c61" strokeWidth="7" strokeLinecap="round"/></>;
  else if (art === 'bus' || art === 'train' || art === 'boat') image = art === 'boat'
    ? <><path d="M26 59h88l-15 22H43z" fill="#55a4c4" stroke={INK} strokeWidth="4"/><path d="M48 57V34h37v23m-23-23v23" fill="#fff1cb" stroke={INK} strokeWidth="3"/><path d="M28 88q15-8 29 0t29 0 29 0" fill="none" stroke="#5fa9cc" strokeWidth="5"/></>
    : <><rect x="25" y="30" width="90" height="43" rx="9" fill={art === 'bus' ? '#e3bd53' : '#7ea5c7'} stroke={INK} strokeWidth="4"/><path d="M35 38h20v16H35zm28 0h20v16H63zm28 0h15v16H91z" fill="#fff4d9" stroke={INK} strokeWidth="2"/><circle cx="46" cy="76" r="9" fill="#435c66"/><circle cx="94" cy="76" r="9" fill="#435c66"/>{art === 'train' && <path d="M28 88h84" stroke="#607680" strokeWidth="4"/>}</>;
  else if (art === 'hat' || art === 'plate' || art === 'ball') image = art === 'hat'
    ? <><path d="M40 61q2-36 30-36t30 36" fill="#6586b5" stroke={INK} strokeWidth="4"/><path d="M25 61q45-17 90 0-4 13-45 13T25 61" fill="#6586b5" stroke={INK} strokeWidth="4"/></>
    : art === 'plate' ? <><ellipse cx="70" cy="53" rx="47" ry="33" fill="#fffdf3" stroke="#78949b" strokeWidth="4"/><ellipse cx="70" cy="53" rx="29" ry="18" fill="none" stroke="#b8c8c7" strokeWidth="3"/></> : <circle cx="70" cy="50" r="34" fill="#e57667" stroke={INK} strokeWidth="4"/>;
  else if (art === 'sock' || art === 'coat' || art === 'sandwich') image = art === 'sandwich'
    ? <><path d="m34 67 36-44 36 44z" fill="#e7c16a" stroke={INK} strokeWidth="4"/><path d="m43 65 27-32 27 32z" fill="#6da674"/><path d="m34 68 72 0-8 11H42z" fill="#d78a57" stroke={INK} strokeWidth="3"/></>
    : art === 'sock' ? <path d="M48 20h40v43q0 10 15 12 12 2 11 13-2 10-17 10H48q-8-6 0-17z" fill="#76b6c1" stroke={INK} strokeWidth="4"/> : <><path d="M49 25h42l22 23-12 42H39L27 48z" fill="#d56e61" stroke={INK} strokeWidth="4"/><path d="M70 26v62m-22-59 22 18 22-18" fill="none" stroke="#f3c1a2" strokeWidth="4"/></>;
  else if (art === 'hammer' || art === 'saw' || art === 'spanner') image = art === 'hammer'
    ? <><path d="M66 48 55 88" stroke="#9b704f" strokeWidth="11" strokeLinecap="round"/><path d="m35 28 42 10-6 16-41-10z" fill="#8498a1" stroke={INK} strokeWidth="4"/></>
    : art === 'saw' ? <><path d="m35 35 62 30-29 26-42-41z" fill="#9caeb5" stroke={INK} strokeWidth="4"/><path d="m27 49 9-7m1 17 9-7m2 17 9-7" stroke="#fff" strokeWidth="3"/></> : <><path d="M53 23q-9 11 0 22l-16 17-9-9-11 11 13 13 12-11-7-7 17-16q11 9 22 0l-6-10 15-15-10-10-15 15z" fill="#8fa4ac" stroke={INK} strokeWidth="4"/></>;
  else if (art === 'balloon') image = <><ellipse cx="70" cy="43" rx="27" ry="33" fill="#df7a91" stroke={INK} strokeWidth="4"/><path d="m64 75 6 8 6-8m-6 8q-3 17 6 21" fill="none" stroke={INK} strokeWidth="3"/></>;
  else if (art === 'dolphin' || art === 'fish' || art === 'octopus' || art === 'turtle' || art === 'rabbit' || art === 'bird' || art === 'tiger' || art === 'zebra' || art === 'bee' || art === 'ladybird') image = <AnimalArt type={art} fill={fill}/>;
  else if (art === 'kite') image = <><path d="m70 18 36 32-36 36-36-36z" fill={fill} stroke={INK} strokeWidth="4"/><path d="m70 18v68m-36-36h72" stroke="#fff2ce" strokeWidth="3"/><path d="M70 86q-18 9 0 17t0 17" fill="none" stroke="#5a83a0" strokeWidth="3"/></>;
  else if (art === 'bicycle' || art === 'pushchair') image = art === 'bicycle'
    ? <><circle cx="40" cy="67" r="21" fill="none" stroke="#507e94" strokeWidth="5"/><circle cx="101" cy="67" r="21" fill="none" stroke="#507e94" strokeWidth="5"/><path d="m40 67 23-31 18 31H40l14-22h26l21 22M60 36h-9m26 0h10" fill="none" stroke={INK} strokeWidth="4" strokeLinejoin="round"/></>
    : <><path d="M40 34h40q18 0 18 18v21H47z" fill="#96c2c6" stroke={INK} strokeWidth="4"/><path d="M38 35q-2-18 17-18h23" fill="none" stroke={INK} strokeWidth="5"/><circle cx="52" cy="79" r="9" fill="#526971"/><circle cx="95" cy="79" r="9" fill="#526971"/></>;
  else throw new Error(`Odd One Out has no illustration for art id: ${art}`);
  return <svg viewBox="0 0 140 100" aria-hidden="true" className="h-[92px] w-full max-w-[132px] sm:h-[110px]">
    <ellipse cx="70" cy="90" rx="42" ry="5" fill="#dce8df"/>{image}
  </svg>;
}

function AnimalArt({ type, fill }) {
  if (type === 'fish' || type === 'dolphin') return <><path d="M29 51q35-35 75 0-40 36-75 0z" fill={type === 'fish' ? fill : '#85bfd2'} stroke={INK} strokeWidth="4"/><path d="m103 51 21-17v34z" fill={type === 'fish' ? fill : '#85bfd2'} stroke={INK} strokeWidth="3"/><circle cx="48" cy="46" r="3" fill={INK}/>{type === 'dolphin' && <path d="M62 34q18-22 35-9l-13 15" fill="#85bfd2" stroke={INK} strokeWidth="3"/>}</>;
  if (type === 'octopus') return <><circle cx="70" cy="45" r="25" fill="#ad83bd" stroke={INK} strokeWidth="4"/><path d="M49 63q-13 21-21 7m30-3q-6 25-18 20m29-21q2 23 15 20m1-23q13 21 21 6" fill="none" stroke="#ad83bd" strokeWidth="8" strokeLinecap="round"/><circle cx="62" cy="44" r="3" fill={INK}/><circle cx="79" cy="44" r="3" fill={INK}/></>;
  if (type === 'turtle') return <><ellipse cx="70" cy="54" rx="30" ry="23" fill="#66a678" stroke={INK} strokeWidth="4"/><circle cx="104" cy="48" r="12" fill="#83b886" stroke={INK} strokeWidth="3"/><path d="m46 69-9 12m51-13 8 12m-44-48-7-10m43 10 8-10" stroke="#548965" strokeWidth="9" strokeLinecap="round"/></>;
  if (type === 'rabbit') return <><ellipse cx="70" cy="58" rx="28" ry="25" fill="#f2ede3" stroke={INK} strokeWidth="4"/><ellipse cx="56" cy="25" rx="10" ry="25" fill="#f2ede3" stroke={INK} strokeWidth="4" transform="rotate(-10 56 25)"/><ellipse cx="82" cy="25" rx="10" ry="25" fill="#f2ede3" stroke={INK} strokeWidth="4" transform="rotate(10 82 25)"/><circle cx="62" cy="53" r="3" fill={INK}/><circle cx="79" cy="53" r="3" fill={INK}/><circle cx="70" cy="62" r="4" fill="#dd897f"/></>;
  if (type === 'zebra') return <><ellipse cx="58" cy="55" rx="34" ry="22" fill="#fffdf6" stroke={INK} strokeWidth="4"/><path d="M43 37 31 58m27-24L44 76m28-39L58 78m27-39L72 75m29-28-15 27" stroke="#34434a" strokeWidth="8" strokeLinecap="round"/><path d="M79 42q8-20 25-14l12 10-7 16-20 2" fill="#fffdf6" stroke={INK} strokeWidth="4"/><path d="M88 37 83 54m12-23-7 25m14-19-5 16" stroke="#34434a" strokeWidth="6" strokeLinecap="round"/><circle cx="104" cy="38" r="2.5" fill={INK}/><path d="m39 72-4 16m23-12-2 15m22-14 3 13m13-16 7 15M27 48q-16 0-13-14" fill="none" stroke="#fffdf6" strokeWidth="7" strokeLinecap="round"/><path d="M30 49q-12 0-14-15" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round"/></>;
  if (type === 'bird') return <><ellipse cx="68" cy="55" rx="28" ry="22" fill={fill} stroke={INK} strokeWidth="4"/><circle cx="87" cy="37" r="16" fill={fill} stroke={INK} strokeWidth="4"/><path d="m102 37 19 7-19 5z" fill="#e5a753" stroke={INK} strokeWidth="3"/><path d="M52 52q19-19 34 6-17 18-34-6m-3 20-9 11m31-10 2 11" fill="#e6f2eb" stroke={INK} strokeWidth="3"/><circle cx="91" cy="34" r="3" fill={INK}/></>;
  if (type === 'ladybird' || type === 'bee') return type === 'bee'
    ? <><ellipse cx="70" cy="53" rx="27" ry="19" fill="#f1c851" stroke={INK} strokeWidth="4"/><path d="M59 36v34m18-37v39" stroke="#344a50" strokeWidth="8"/><ellipse cx="58" cy="30" rx="12" ry="8" fill="#e4f3ef"/><ellipse cx="82" cy="30" rx="12" ry="8" fill="#e4f3ef"/><circle cx="99" cy="53" r="10" fill="#f1c851" stroke={INK} strokeWidth="3"/></>
    : <><circle cx="70" cy="53" r="32" fill="#db6457" stroke={INK} strokeWidth="4"/><path d="M70 22v62" stroke={INK} strokeWidth="4"/><circle cx="55" cy="44" r="5" fill="#293c44"/><circle cx="83" cy="46" r="5" fill="#293c44"/><circle cx="57" cy="64" r="5" fill="#293c44"/><circle cx="82" cy="66" r="5" fill="#293c44"/><circle cx="70" cy="23" r="12" fill="#344952"/></>;
  return <><ellipse cx="70" cy="52" rx="30" ry="23" fill="#d5845b" stroke={INK} strokeWidth="4"/><path d="M43 40 34 20l20 10m39 10 10-20-21 10" fill="#d5845b" stroke={INK} strokeWidth="4"/><path d="M47 54h45" stroke="#263b43" strokeWidth="8" strokeDasharray="8 7"/><circle cx="60" cy="46" r="3" fill={INK}/><circle cx="80" cy="46" r="3" fill={INK}/></>;
}

export default function OddOneOut({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent, onReviewComplete, onPhaseChange, cancelNarration, playerId = 'default' }) {
  const initialProgress = useMemo(() => readOddOneOutProgress(playerId), [playerId]);
  const [progress, setProgress] = useState(initialProgress);
  const rewardedChapters = useRef(new Set(initialProgress.completedChapterIds));
  const [phase, setPhase] = useState('intro');
  const [chapterId, setChapterId] = useState(ODD_ONE_OUT_CHAPTERS[0].id);
  const [run, setRun] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [step, setStep] = useState('pick');
  const [selectedId, setSelectedId] = useState('');
  const [wrong, setWrong] = useState(false);
  const [hadMistake, setHadMistake] = useState(false);
  const [clueUsed, setClueUsed] = useState(false);
  const [clueVisible, setClueVisible] = useState(false);
  const [answerSaved, setAnswerSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [roundHadSaveError, setRoundHadSaveError] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const runSerial = useRef(0);
  const runSeed = useRef(0);
  const chapter = ODD_ONE_OUT_CHAPTERS.find((entry) => entry.id === chapterId) || ODD_ONE_OUT_CHAPTERS[0];
  const round = run[roundIndex];
  const hasRuleAudio = Boolean(round && getOfflineVoiceClip(round.prompt));
  const hasExplanationAudio = Boolean(round && getOfflineVoiceClip(round.explanation));
  const completedInChapter = (progress.completedRoundIds || []).filter((id) => ODD_ONE_OUT_ROUNDS_BY_CHAPTER[chapterId].some((entry) => entry.id === id)).length;
  const isFinalChapter = ODD_ONE_OUT_CHAPTERS.at(-1).id === chapterId;
  const allAdventureComplete = ODD_ONE_OUT_CHAPTERS.every(({ id }) => progress.completedChapterIds.includes(id));

  useEffect(() => { onPhaseChange?.(phase); }, [phase, onPhaseChange]);
  useEffect(() => () => cancelNarration?.(), [cancelNarration]);
  useEffect(() => { if (!soundOn) cancelNarration?.(); }, [soundOn, cancelNarration]);
  useEffect(() => {
    if (phase !== 'play' || !round || !soundOn || !getOfflineVoiceClip(round.prompt)) return;
    cancelNarration?.();
    speak?.(round.prompt, { premium: false, segments: [round.prompt] });
  }, [phase, round, soundOn, speak, cancelNarration]);
  useEffect(() => {
    if (phase !== 'play' || !round) return;
    const level = ODD_ONE_OUT_CHAPTERS.findIndex(({ id }) => id === chapterId);
    onGameEvent?.('oddoneout', 'scene', { level, round: roundIndex, seed: runSeed.current, item: round.id });
  }, [phase, round, chapterId, roundIndex, onGameEvent]);

  const speakLine = (line) => {
    cancelNarration?.();
    if (soundOn && getOfflineVoiceClip(line)) speak?.(line, { premium: false, segments: [line] });
  };
  const clearRound = () => {
    setStep('pick'); setSelectedId(''); setWrong(false); setHadMistake(false); setClueUsed(false); setClueVisible(false);
    setAnswerSaved(false); setSaveError(''); setRoundHadSaveError(false); setResultMessage('');
  };
  const startChapter = (id = chapterId, replay = false) => {
    const selectedChapter = ODD_ONE_OUT_CHAPTERS.find((entry) => entry.id === id);
    if (!selectedChapter) return;
    const unlockedIndex = ODD_ONE_OUT_CHAPTERS.findIndex(({ id: candidate }) => candidate === progress.unlockedChapter);
    if (ODD_ONE_OUT_CHAPTERS.findIndex(({ id: candidate }) => candidate === id) > unlockedIndex) return;
    cancelNarration?.();
    const recent = recentOddOneOutRoundIds(id, playerId).slice(-3);
    runSerial.current += 1;
    const seed = createRunSeed() + runSerial.current;
    runSeed.current = seed;
    const frozenRun = seededOddOneOutRun(id, seed, recent);
    setChapterId(id); setRun(frozenRun); setRoundIndex(0); clearRound(); setPhase('play');
    const level = ODD_ONE_OUT_CHAPTERS.findIndex(({ id: chapterKey }) => chapterKey === id);
    onGameEvent?.('oddoneout', replay ? 'replay' : 'start', { level, round: 0, seed });
  };
  const leave = () => {
    cancelNarration?.();
    const level = ODD_ONE_OUT_CHAPTERS.findIndex(({ id }) => id === chapterId);
    onGameEvent?.('oddoneout', 'leave', { level, round: roundIndex, seed: runSeed.current });
    onBack?.();
  };
  const recordCorrectAnswer = () => {
    if (!round || answerSaved) return;
    const independent = !hadMistake && !clueUsed;
    const updated = recordOddOneOutRound(playerId, chapterId, round.id, undefined, { independent });
    if (!updated.persisted) {
      setRoundHadSaveError(true);
      setSaveError('This answer is right, but progress could not be saved. Try saving again before moving on.');
      return;
    }
    setProgress(updated); setAnswerSaved(true); setSaveError(''); setWrong(false);
    const phrase = 'You found the rule!';
    setResultMessage(`${phrase} ${round.explanation}`);
    playSfx?.('success');
    speakLine(round.explanation);
    if (updated.newlyCompletedChapter && !rewardedChapters.current.has(chapterId)) {
      rewardedChapters.current.add(chapterId);
      onCelebrate?.(`${chapter.title} complete!`, 4, 0, 'oddoneout', { quiet: true });
    }
    if (updated.newlyCompletedChapter) {
      const level = ODD_ONE_OUT_CHAPTERS.findIndex(({ id }) => id === chapterId);
      onGameEvent?.('oddoneout', 'level_complete', { level, round: 6, seed: runSeed.current, firstAttempt: independent, independent, hints: clueUsed ? 1 : 0 });
      const allDone = ODD_ONE_OUT_CHAPTERS.every(({ id }) => updated.completedChapterIds.includes(id));
      if (allDone) {
        onGameEvent?.('oddoneout', 'complete', { level, round: 6, seed: runSeed.current });
      }
    }
    onGameEvent?.('oddoneout', 'answer_correct', {
      skill: chapterId, item: round.id, response: selectedId, expected: round.oddItemId,
      correct: true, firstAttempt: !hadMistake && !clueUsed, independent: !hadMistake && !clueUsed,
      hints: clueUsed ? 1 : 0, deferFinish: true,
    });
  };
  const chooseItem = (entry) => {
    if (!round || step !== 'pick' || answerSaved) return;
    cancelNarration?.();
    if (entry.id !== round.oddItemId) {
      setWrong(true); setHadMistake(true); playSfx?.('wrong');
      onGameEvent?.('oddoneout', 'answer_wrong', { skill: chapterId, item: round.id, response: entry.id, expected: round.oddItemId, correct: false });
      return;
    }
    setWrong(false); setSelectedId(entry.id); setStep('reason'); playSfx?.('sparkle');
  };
  const chooseReason = (choice) => {
    if (step !== 'reason' || answerSaved) return;
    cancelNarration?.();
    if (!choice.correct) {
      setWrong(true); setHadMistake(true); playSfx?.('wrong'); return;
    }
    setWrong(false); recordCorrectAnswer();
  };
  const showClue = () => {
    if (!round || clueUsed || answerSaved) return;
    setClueUsed(true); setClueVisible(true); speakLine(round.clue);
    const level = ODD_ONE_OUT_CHAPTERS.findIndex(({ id }) => id === chapterId);
    onGameEvent?.('oddoneout', 'hint', { level, round: roundIndex, seed: runSeed.current, hints: 1, hintType: 'clue' });
  };
  const nextRound = () => {
    cancelNarration?.();
    if (roundIndex >= run.length - 1) { cancelNarration?.(); setPhase('chapter-results'); return; }
    setRoundIndex((current) => current + 1); clearRound();
  };
  const replayChapter = () => startChapter(chapterId, true);
  const finish = () => { cancelNarration?.(); if (onReviewComplete) onReviewComplete(); else onBack?.(); };
  const toggleSound = () => { cancelNarration?.(); onToggleSound?.(); };

  const buttonBase = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-3 font-extrabold transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#243f4b] disabled:cursor-not-allowed disabled:opacity-50';
  return <main className="min-h-screen bg-[#f5f4ed] text-[#253b46]">
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-7">
      <button type="button" onClick={leave} aria-label="Back to home" className="grid min-h-12 min-w-12 place-items-center rounded-2xl bg-white text-[#304b59] shadow-sm ring-1 ring-[#d8e2df]"><Home size={22}/></button>
      <div className="text-center"><p className="text-[11px] font-black uppercase tracking-[.2em] text-[#6b8279]">Discovery HQ · Sorting trail</p><h1 className="text-xl font-black sm:text-3xl">Odd One Out</h1></div>
      <SoundToggle soundOn={soundOn} onToggle={toggleSound}/>
    </header>
    <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-7">
      {phase === 'intro' && <section className="rounded-[28px] border border-[#e0e6dd] bg-white p-5 shadow-sm sm:p-9">
        <p className="text-xs font-black uppercase tracking-[.18em] text-[#577c70]">Three sorting chapters</p>
        <h2 className="mt-2 text-2xl font-black sm:text-4xl">Spot the rule. Find what does not fit.</h2>
        <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-[#63777b]">Read the rule first, compare all four picture cards, then choose the one that does not belong. After that, choose a “because” reason to show what you noticed.</p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {ODD_ONE_OUT_CHAPTERS.map((entry, index) => {
            const currentIndex = ODD_ONE_OUT_CHAPTERS.findIndex(({ id }) => id === progress.unlockedChapter);
            const unlocked = index <= currentIndex;
            const done = progress.completedChapterIds.includes(entry.id);
            return <button key={entry.id} type="button" disabled={!unlocked} onClick={() => { setChapterId(entry.id); startChapter(entry.id); }} className={`min-h-36 rounded-3xl border-2 p-4 text-left transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-45 ${done ? 'bg-[#f1f8f2]' : 'bg-[#fffefa]'}`} style={{ borderColor: done ? '#9ec7aa' : `${entry.accent}55` }}>
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: entry.accent }}>Chapter {index + 1} · Six rounds</span>
              <span className="mt-1 block text-xl font-black">{entry.title}</span>
              <span className="mt-2 block text-sm font-semibold leading-5 text-[#667a7d]">{entry.shortLesson}</span>
              <span className="mt-3 block text-xs font-black text-[#55796c]">{done ? 'Completed · replay' : unlocked ? 'Ready to explore →' : 'Complete the chapter before this one'}</span>
            </button>;
          })}
        </div>
        <button type="button" onClick={() => startChapter(progress.unlockedChapter)} className={`${buttonBase} mt-6 bg-[#2f776c] text-white sm:px-7 sm:text-lg`}>Start {ODD_ONE_OUT_CHAPTERS.find(({ id }) => id === progress.unlockedChapter)?.title}<ArrowRight size={20}/></button>
      </section>}

      {phase === 'play' && round && <section data-odd-round={round.id} className="overflow-hidden rounded-[28px] border border-[#e0e6dd] bg-white shadow-[0_14px_40px_rgba(39,67,73,.08)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#edf0eb] px-4 py-4 sm:px-7">
          <div><p className="text-xs font-black uppercase tracking-[.18em]" style={{ color: chapter.accent }}>{chapter.title} · Round {roundIndex + 1} of 6</p><h2 className="mt-1 text-xl font-black sm:text-2xl">{round.title}</h2></div>
          <div className="rounded-full bg-[#f2f6f2] px-3 py-2 text-xs font-extrabold text-[#526a70]">{completedInChapter} of 6 saved</div>
        </div>
        <div className="p-4 sm:p-7">
          {!answerSaved && <>
          <div className="rounded-2xl bg-[#f7f5e9] px-4 py-4 sm:px-6">
            <p className="text-xs font-black uppercase tracking-[.16em] text-[#768477]">The rule</p>
            <p className="mt-1 text-lg font-black leading-7 sm:text-2xl">{round.property}</p>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-base font-bold text-[#586c73]">{step === 'reason' ? 'Now choose the reason that fits.' : 'Compare all four. Which one does not fit?'}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => speakLine(round.prompt)} disabled={!soundOn || !hasRuleAudio} title={!soundOn ? 'Sound is off.' : !hasRuleAudio ? 'No packaged recording is available for this rule yet.' : undefined} className={`${buttonBase} border-2 border-[#dce6df] bg-white text-[#49666b]`}><Volume2 size={19}/>Hear the rule</button>
              {!clueVisible && <button type="button" onClick={showClue} disabled={clueUsed || answerSaved} className={`${buttonBase} border-2 border-[#e4c982] bg-[#fff9e8] text-[#705b2b]`}><Lightbulb size={19}/>Use a clue</button>}
            </div>
          </div>
          {!soundOn && <p className="mt-2 text-sm font-semibold text-[#718084]">Sound is off. Read the rule and clue on screen.</p>}
          {clueVisible && <p className="mt-3 rounded-2xl border border-[#e9d699] bg-[#fff9e8] p-3 font-bold text-[#6c5b31]" role="note"><Lightbulb className="mr-2 inline" size={18}/>{round.clue}</p>}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {round.options.map((entry, index) => {
              const selected = selectedId === entry.id;
              const color = entry.color === 'red' ? '#df6558' : entry.color === 'blue' ? '#4c91c6' : '#739c82';
              return <button key={`${entry.id}-${index}`} type="button" onClick={() => chooseItem(entry)} disabled={step !== 'pick' || answerSaved} aria-label={`Choose ${entry.label}`} aria-pressed={selected} className={`flex min-h-[142px] flex-col items-center justify-center rounded-3xl border-2 px-2 py-2 text-center shadow-sm transition hover:-translate-y-1 active:translate-y-0 sm:min-h-[168px] ${selected ? 'border-[#43846f] bg-[#edf7ef]' : wrong && step === 'pick' ? 'border-[#efd2c5] bg-[#fff9f5]' : 'border-[#e4e9df] bg-[#fffefa]'}`}>
                <span className="grid h-[92px] w-full place-items-center sm:h-[112px]"><PictureArt entry={entry}/></span>
                <span className="mt-1 text-sm font-black sm:text-base" style={{ color: entry.color ? color : '#314d56' }}>{entry.label}</span>
              </button>;
            })}
          </div>
          {step === 'reason' && !answerSaved && <div className="mt-5 rounded-3xl border border-[#dde7df] bg-[#f8faf6] p-4 sm:p-5">
            <p className="font-black">{round.items.find(({ id }) => id === selectedId)?.label} does not fit. Why?</p>
            <div className="mt-3 grid gap-2 md:grid-cols-3" aria-label="Choose why this item does not belong">
              {round.choices.map((choice) => <button key={choice.id} type="button" aria-label={choice.text} onClick={() => chooseReason(choice)} className={`${buttonBase} min-h-14 border-2 border-[#dce6df] bg-white text-left leading-5 text-[#36515a] hover:border-[#7aa58e]`}><span>{choice.text}</span></button>)}
            </div>
          </div>}
          {wrong && !answerSaved && <p role="status" className="mt-4 rounded-2xl bg-[#fff1e9] px-4 py-3 font-extrabold text-[#965b49]">{step === 'reason' ? 'That reason does not match the rule. Look again and try a different reason.' : 'Good try. Check the rule again, then compare the cards and try once more.'}</p>}
          </>}
          {saveError && <div role="alert" className="mt-4 rounded-2xl border border-[#e6b7a9] bg-[#fff3ee] p-4 font-bold text-[#8e4e3e]">{saveError}<button type="button" onClick={recordCorrectAnswer} className={`${buttonBase} ml-2 mt-2 bg-[#8d5547] text-white`}>Retry save</button></div>}
          {answerSaved && <div role="status" className="mt-5 rounded-3xl border border-[#cce2ce] bg-[#eff8ef] p-4 sm:p-5">
            <div className="mx-auto mb-3 max-w-44 rounded-2xl bg-white p-3 text-center"><PictureArt entry={round.items.find(({ id }) => id === round.oddItemId)} /><strong className="block">{round.items.find(({ id }) => id === round.oddItemId)?.label}</strong></div>
            <p className="flex items-center gap-2 text-lg font-black text-[#3d795d]"><Check size={22}/>That is it!</p>
            <p className="mt-2 text-base font-bold leading-7 text-[#344e56]">{resultMessage}</p>
            <p className="mt-2 text-sm font-extrabold text-[#607978]">{roundHadSaveError ? 'Saved after a retry.' : clueUsed ? 'Clue used · this round is saved as assisted practice.' : hadMistake ? 'You tried again · this round is saved.' : 'Independent answer · this round is saved.'}</p>
            <button type="button" onClick={() => speakLine(round.explanation)} disabled={!soundOn || !hasExplanationAudio} title={!soundOn ? 'Sound is off.' : !hasExplanationAudio ? 'No packaged recording is available for this explanation yet.' : undefined} className={`${buttonBase} mt-3 border-2 border-[#dce6df] bg-white text-[#49666b]`}><Volume2 size={19}/>Hear explanation again</button>
            {!hasExplanationAudio && <p className="mt-2 text-sm font-semibold text-[#718084]">No recorded explanation is available; read the explanation above.</p>}
            <button type="button" onClick={nextRound} className={`${buttonBase} mt-4 bg-[#337d72] text-white sm:px-7`}>{roundIndex === run.length - 1 ? 'See chapter results' : 'Next round'}<ArrowRight size={20}/></button>
          </div>}
        </div>
      </section>}

      {phase === 'chapter-results' && <section className="rounded-[28px] border border-[#e0e6dd] bg-white p-5 shadow-sm sm:p-9">
        <p className="text-xs font-black uppercase tracking-[.18em] text-[#53826d]">Chapter complete · 6 rounds saved</p>
        <h2 className="mt-2 text-2xl font-black sm:text-4xl">{chapter.title} sorted!</h2>
        <p className="mt-3 max-w-2xl font-semibold leading-7 text-[#63777b]">You practised {chapter.shortLesson.toLowerCase()} Your completed rounds are saved for this player.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {!isFinalChapter && progress.unlockedChapter !== chapterId && <button type="button" onClick={() => { setPhase('intro'); setChapterId(progress.unlockedChapter); }} className={`${buttonBase} bg-[#337d72] text-white`}>Continue to {ODD_ONE_OUT_CHAPTERS[ODD_ONE_OUT_CHAPTERS.findIndex(({ id }) => id === chapterId) + 1]?.title}<ArrowRight size={20}/></button>}
          {isFinalChapter && allAdventureComplete && <button type="button" onClick={() => setPhase('finish')} className={`${buttonBase} bg-[#337d72] text-white`}>Adventure complete <Sparkles size={19}/></button>}
          <button type="button" onClick={() => setPhase('intro')} className={`${buttonBase} border-2 border-[#dce6df] bg-white`}><ArrowLeft size={18}/>Chapter map</button>
          <button type="button" onClick={replayChapter} className={`${buttonBase} border-2 border-[#dce6df] bg-white`}><RotateCcw size={18}/>Replay chapter</button>
        </div>
      </section>}

      {phase === 'finish' && <section className="rounded-[28px] border border-[#e0e6dd] bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#edf5e8] text-[#5d8c68]"><Sparkles size={38}/></div>
        <p className="mt-4 text-xs font-black uppercase tracking-[.18em] text-[#53826d]">Sorting adventure complete</p>
        <h2 className="mt-2 text-3xl font-black">Three chapters. Eighteen rules.</h2>
        <p className="mx-auto mt-3 max-w-xl font-semibold leading-7 text-[#63777b]">You sorted by meaning, picture features, and simple rules. Your chapter progress is saved.</p>
        <button type="button" onClick={finish} className={`${buttonBase} mt-6 bg-[#337d72] px-8 text-white`}><Home size={19}/>Finish</button>
        <button type="button" onClick={() => setPhase('intro')} className={`${buttonBase} mt-6 border-2 border-[#dce6df] bg-white`}><ArrowLeft size={18}/>Back to chapter map</button>
      </section>}
      <p className="sr-only" aria-live="polite">{phase === 'play' ? `${chapter.title}, round ${roundIndex + 1} of 6` : ''}</p>
    </div>
  </main>;
}
