import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bird, Brain, Bug, Calendar, CalendarDays, Car,
  Cat, Check, CircleHelp, Dog, Ear, Eye, Fish, Footprints, Globe2, Hand,
  Heart, Magnet, Moon, Orbit, PawPrint, PersonStanding, Rabbit,
  Rocket, Shapes, Shield, Sun, TreePine,
  UserRound, Waves,
} from 'lucide-react';
import { ASTRONAUT_CATEGORIES, ASTRONAUT_PROFILES } from '../../data/index.js';
import { getPraise } from '../../utils.js';
import { FocusMenu } from '../shared/FocusMenu.jsx';
import { useGameDifficulty } from '../../hooks/useGameDifficulty.js';
import { readAstronautProgress, saveAstronautRun, recordAstronautResult, completeAstronautChapter } from '../../data/astronautProgress.js';
import { getOfflineVoiceClip } from '../../data/offlineVoice.js';
import { buildAstronautMissions, createAstronautOptions, createAstronautRun, createSeededRandom, createAstronautSeed } from './astronautMissions.js';
import dolphinCard from '../../assets/memory-match/dolphin-v1-card.webp';
import './astronautAcademy.css';

const MISSIONS = buildAstronautMissions(ASTRONAUT_CATEGORIES);

const DINO_LABELS = new Set(['t-rex', 'stegosaurus', 'triceratops', 'brachiosaurus', 'pterodactyl', 'raptor']);

const ShapeGlyph = ({ label }) => {
  const shape = label.toLowerCase();
  const solid = { fill: 'currentColor', stroke: 'currentColor', strokeWidth: 2.5, strokeLinejoin: 'round' };
  return (
    <svg viewBox="0 0 56 56" aria-hidden="true" className="astro-visual-svg">
      {shape === 'circle' && <circle cx="28" cy="28" r="17" {...solid} />}
      {shape === 'triangle' && <path d="M28 9 48 45H8L28 9Z" {...solid} />}
      {shape === 'square' && <rect x="10" y="10" width="36" height="36" rx="2" {...solid} />}
      {shape === 'rectangle' && <rect x="7" y="16" width="42" height="24" rx="2" {...solid} />}
      {shape === 'star' && <path d="m28 7 6 13 14 2-10 10 2 14-12-7-13 7 3-14L7 22l14-2 7-13Z" {...solid} />}
      {shape === 'diamond' && <path d="M28 7 48 28 28 49 8 28 28 7Z" {...solid} />}
      {shape === 'oval' && <ellipse cx="28" cy="28" rx="21" ry="14" {...solid} />}
      {shape === 'sphere' && <><circle cx="28" cy="28" r="18" {...solid} /><path d="M11 28h34M28 10c7 6 7 30 0 36M28 10c-7 6-7 30 0 36" fill="none" stroke="white" strokeWidth="2" /></>}
      {shape === 'cube' && <><path d="m28 7 19 10v22L28 49 9 39V17L28 7Z" {...solid} /><path d="m9 17 19 11 19-11M28 28v21" fill="none" stroke="white" strokeWidth="2" /></>}
      {shape === 'pyramid' && <><path d="m28 8 21 37H7L28 8Z" {...solid} /><path d="m28 8 3 37M7 45l24-5 18 5" fill="none" stroke="white" strokeWidth="2" /></>}
      {shape === 'cylinder' && <><path d="M10 16v24c0 5 8 9 18 9s18-4 18-9V16" {...solid} /><ellipse cx="28" cy="16" rx="18" ry="8" {...solid} /><path d="M10 40c0 5 8 9 18 9s18-4 18-9" fill="none" stroke="white" strokeWidth="2" /></>}
      {shape === 'cone' && <><path d="M28 8 9 44h38L28 8Z" {...solid} /><ellipse cx="28" cy="44" rx="19" ry="6" fill="none" stroke="currentColor" strokeWidth="2.5" /></>}
    </svg>
  );
};

const DinosaurGlyph = ({ label }) => {
  const type = label.toLowerCase();
  return (
    <svg viewBox="0 0 72 52" aria-hidden="true" className="astro-dinosaur-svg">
      {type === 'pterodactyl' ? <path d="M7 28 29 9l-2 13 16-9-7 14 25-7-17 14-15-5-11 12-2-15L7 28Z" />
        : type === 'triceratops' ? <><path d="M12 30c7-9 17-13 29-10l10 8 12 2-5 9H23l-9-4-5 1 3-6Z" /><path d="m47 20 4-12 4 12m3 8 9-5-2 11m-20-5-5-9-3 9" /></>
          : type === 'stegosaurus' ? <><path d="M8 34c10-10 25-14 39-9l10 8 9 2-5 8H22l-9-5-6 1Z" /><path d="m22 26 5-12 6 10 6-14 6 13 6-9 4 14" /></>
            : <><path d="M8 34c9-11 24-15 37-10l9 8 10 2-5 8H24l-9-5-7 1Z" /><path d="m47 25 5-13 12 3 5 7-10 6m-32 9-2 8m17-8-1 8" /></>}
    </svg>
  );
};

const AnimalGlyph = ({ label }) => {
  const name = label.toLowerCase();
  if (DINO_LABELS.has(name)) return <DinosaurGlyph label={label} />;
  if (name === 'elephant') return <svg viewBox="0 0 56 56" aria-hidden="true" className="astro-animal-svg"><path d="M13 31c0-12 7-20 18-20 9 0 15 6 15 15v6c0 4-2 7-6 8v5h-7v-7H24v7h-7v-7c-3-1-4-4-4-7Z"/><path d="M15 20c-7-1-8 13-1 17m22-18c4 3 5 7 5 12 0 3-2 5-5 5v5"/><path d="m33 30 3 2"/></svg>;
  if (name === 'giraffe') return <svg viewBox="0 0 56 56" aria-hidden="true" className="astro-animal-svg"><path d="M19 47V29l7-6V13l-3-5h13l-2 5v11l7 6v17M18 34h26M25 18h9M24 36l3 2m8-3 3 3m-12 5 3 2m7-1 3 2"/><circle cx="27" cy="11" r="1.5"/><circle cx="34" cy="11" r="1.5"/></svg>;
  if (name === 'cow') return <svg viewBox="0 0 56 56" aria-hidden="true" className="astro-animal-svg"><path d="m17 19-5-8 12 4m15 4 5-8-12 4M14 24c0-6 6-9 14-9s14 3 14 9v13c0 5-6 9-14 9s-14-4-14-9V24Z"/><path d="M14 27c4 0 5 4 9 4 3 0 4-3 8-3 3 0 4 3 11 2M22 38c0 3 3 6 6 6s6-3 6-6-3-5-6-5-6 2-6 5Z"/><circle cx="21" cy="24" r="1.5"/><circle cx="35" cy="24" r="1.5"/></svg>;
  if (name === 'dolphin') return <img src={dolphinCard} alt="" className="astro-animal-raster" />;
  if (name === 'snake') return <svg viewBox="0 0 56 56" aria-hidden="true" className="astro-animal-svg"><path d="M11 41c8 0 8-12 17-12h7c6 0 8-5 8-10 0-5-3-8-8-8s-8 3-8 7 3 6 7 6h4M11 41c-3 0-5-2-5-5"/><circle cx="36" cy="16" r="1"/></svg>;
  if (name === 'bear') return <svg viewBox="0 0 56 56" aria-hidden="true" className="astro-animal-svg"><circle cx="16" cy="16" r="7"/><circle cx="40" cy="16" r="7"/><path d="M10 30c0-11 8-18 18-18s18 7 18 18v6c0 8-7 13-18 13s-18-5-18-13v-6Z"/><ellipse cx="28" cy="35" rx="9" ry="7"/><circle cx="28" cy="32" r="2"/></svg>;
  if (name === 'wolf') return <svg viewBox="0 0 56 56" aria-hidden="true" className="astro-animal-svg"><path d="m11 9 14 9h7l13-9-2 25-9 12H22l-9-12-2-25Z"/><path d="m19 29 9-4 9 4-9 11-9-11Zm9 11v5"/><circle cx="20" cy="25" r="1"/><circle cx="36" cy="25" r="1"/></svg>;
  if (name === 'hippo') return <svg viewBox="0 0 56 56" aria-hidden="true" className="astro-animal-svg"><path d="M9 25c0-9 8-15 19-15s19 6 19 15v7c0 4-4 7-8 7H17c-4 0-8-3-8-7v-7Z"/><ellipse cx="28" cy="34" rx="17" ry="9"/><circle cx="21" cy="30" r="1"/><circle cx="35" cy="30" r="1"/><path d="M22 39v3m12-3v3"/></svg>;
  if (name === 'rhino') return <svg viewBox="0 0 56 56" aria-hidden="true" className="astro-animal-svg"><path d="M9 29c0-10 8-16 20-16h11l5 10-6 8v12h-7v-8H19v8h-7V32l-3-3Z"/><path d="m39 20 11-8-4 14m-22 2v1"/><circle cx="35" cy="23" r="1"/></svg>;
  if (name === 'camel') return <svg viewBox="0 0 56 56" aria-hidden="true" className="astro-animal-svg"><path d="M8 33c3-9 8-11 12-4 4-15 12-16 16-2 7-8 12-6 13 5l-2 7h-6l-1-7-7 1-1 7h-7l-1-7-9 1-1 6h-6l-1-7Z"/><path d="m45 26 2-9 5-2m-2 26v5m-32-5v5"/></svg>;
  if (name === 'sheep') return <svg viewBox="0 0 56 56" aria-hidden="true" className="astro-animal-svg"><path d="M15 24c-6-8 5-14 10-8 5-8 15-5 15 2 8 1 9 11 3 14 2 7-6 12-12 8-5 5-15 2-15-4-8-1-8-10-1-12Z"/><path d="M18 38v7m21-7v7m-12-8h7"/><circle cx="35" cy="28" r="1"/></svg>;
  if (name === 'frog') return <svg viewBox="0 0 56 56" aria-hidden="true" className="astro-animal-svg"><path d="M12 27c0-7 7-12 16-12s16 5 16 12v7c0 8-7 12-16 12s-16-4-16-12v-7Z"/><circle cx="19" cy="16" r="6"/><circle cx="37" cy="16" r="6"/><circle cx="19" cy="16" r="1"/><circle cx="37" cy="16" r="1"/><path d="M20 34c4 4 12 4 16 0"/></svg>;
  const icons = { lion: Cat, tiger: Cat, dog: Dog, cat: Cat, fish: Fish, eagle: Bird, bird: Bird, parrot: Bird, rabbit: Rabbit, cheetah: Cat, horse: PersonStanding, monkey: PawPrint };
  const Icon = icons[name] ?? PawPrint;
  return <Icon aria-hidden="true" className="astro-visual-lucide" strokeWidth={2} />;
};

const ANSWER_ICONS = {
  'the sun': Sun, sun: Sun, 'the moon': Moon, moon: Moon, earth: Globe2, mars: Orbit,
  saturn: Orbit, jupiter: Orbit, venus: Orbit, mercury: Orbit, neptune: Orbit,
  gravity: Magnet, wind: Waves, magnets: Magnet, rain: Waves, heart: Heart,
  brain: Brain, lungs: Waves, liver: Heart, kidneys: Heart, skin: Hand,
  teeth: CircleHelp, ears: Ear, eyes: Eye, hair: PersonStanding, nails: Hand,
  muscles: PersonStanding, bones: Shield, tongue: CircleHelp, lips: CircleHelp,
  nose: CircleHelp, stomach: CircleHelp, 'space suit': Shield, raincoat: Shield,
  swimsuit: Waves, armour: Shield, eggs: CircleHelp, rocks: Shapes,
  trees: TreePine, clouds: Waves, eight: Globe2,
};

const GearGlyph = ({ label }) => {
  const suit = label === 'space suit';
  const rain = label === 'raincoat';
  const swim = label === 'swimsuit';
  const fill = suit ? '#f4f7fc' : rain ? '#f1c74b' : swim ? '#52a3b2' : '#a5b0bf';
  return <svg viewBox="0 0 80 88" aria-hidden="true" className="astro-gear-svg">
    {!swim && <><path d="M23 30V18a17 17 0 0 1 34 0v12" fill={fill} stroke="#3c536c" strokeWidth="3"/><path d="M28 18h24v15H28z" fill={suit ? '#85cde2' : rain ? '#f8e4b1' : '#5a6b80'} stroke="#3c536c" strokeWidth="2"/></>}
    <path d={swim ? 'M27 18h9v10h8V18h9l6 46-10 14H31L21 64z' : 'M26 35h28l17 17-8 11-10-9v27H27V54l-10 9-8-11z'} fill={fill} stroke="#3c536c" strokeWidth="3" strokeLinejoin="round"/>
    {suit ? <><rect x="31" y="43" width="18" height="17" rx="3" fill="#89b6cf" stroke="#3c536c" strokeWidth="2"/><circle cx="36" cy="49" r="2" fill="#df6d61"/><path d="M27 69h26M39 60v21" stroke="#3c536c" strokeWidth="3"/></> : rain ? <><path d="M40 36v44m-10-24h7m6 0h7" stroke="#8b6a30" strokeWidth="3"/><circle cx="44" cy="45" r="1.5" fill="#8b6a30"/></> : !swim && <path d="M28 45h24m-24 10h24m-24 10h24m-12-29v44" stroke="#5a6b80" strokeWidth="3"/>}
  </svg>;
};

const AnswerVisual = ({ category, label }) => {
  if (['space suit', 'raincoat', 'swimsuit', 'armour'].includes(label.toLowerCase())) return <GearGlyph label={label.toLowerCase()} />;
  if (category.id === 'numbers') return <span className="astro-answer-number" aria-hidden="true">{label}</span>;
  if (category.id === 'shapes') return <ShapeGlyph label={label} />;
  if (category.id === 'animals' || category.id === 'dinosaurs') return <AnimalGlyph label={label} />;
  if (category.id === 'heroes' && label.toLowerCase() === 'laika') return <Dog aria-hidden="true" className="astro-visual-lucide" />;
  const Icon = ANSWER_ICONS[label.toLowerCase()] ?? (category.id === 'body' ? PersonStanding : category.id === 'space' ? Orbit : UserRound);
  return <Icon aria-hidden="true" className="astro-visual-lucide" strokeWidth={2} />;
};

const HeroPortrait = ({ profile }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <span className="astro-hero-portrait-wrap">
      <span className="astro-hero-fallback" aria-hidden="true"><UserRound size={32} /><b>{profile.name.split(' ').map((part) => part[0]).join('')}</b></span>
      {!imageFailed && <img className={`astro-hero-portrait ${imageLoaded ? 'is-loaded' : ''}`} src={profile.imageUrl} alt={profile.name} loading="lazy" onLoad={() => setImageLoaded(true)} onError={() => setImageFailed(true)} />}
    </span>
  );
};

const QuestionVisual = ({ question, category }) => {
  if (question.astronaut) {
    const person = ASTRONAUT_PROFILES.find((candidate) => candidate.id === question.astronaut);
    if (person) return <HeroPortrait key={person.id} profile={person} />;
  }
  if (category.id === 'numbers') {
    const text = question.q;
    const Icon = text.includes('fingers') ? Hand : text.includes('week') ? CalendarDays : text.includes('spider') ? Bug : text.includes('wheels') ? Car : text.includes('months') ? Calendar : Eye;
    return <Icon className="astro-visual-lucide" aria-hidden="true" strokeWidth={1.7} />;
  }
  if (category.id === 'shapes') return <Shapes className="astro-visual-lucide" aria-hidden="true" strokeWidth={1.7} />;
  if (category.id === 'animals') return <PawPrint className="astro-visual-lucide" aria-hidden="true" strokeWidth={1.7} />;
  if (category.id === 'body') {
    const Icon = ANSWER_ICONS[question.answer.toLowerCase()] ?? PersonStanding;
    return <Icon className="astro-visual-lucide" aria-hidden="true" strokeWidth={1.7} />;
  }
  if (category.id === 'space') {
    const Icon = ANSWER_ICONS[question.answer.toLowerCase()] ?? Orbit;
    return <Icon className="astro-visual-lucide" aria-hidden="true" strokeWidth={1.7} />;
  }
  return <DinosaurGlyph label="dinosaur" />;
};

const AstronautAcademy = ({ onBack, playSfx = () => {}, soundOn, onToggleSound, speak = () => {}, cancelNarration = () => {}, onCelebrate = () => {}, onGameEvent, onPhaseChange, playerId = 'amari' }) => {
  const difficulty = useGameDifficulty('astronaut');
  // A recommendation may change after a correct answer. Apply it to the
  // next mission so choices never move or multiply during feedback.
  const [runDifficulty, setRunDifficulty] = useState(difficulty);
  const [mission, setMission] = useState(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [hadMistake, setHadMistake] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [progress, setProgress] = useState(() => readAstronautProgress(playerId));
  const [seed, setSeed] = useState(0);
  const [saveError, setSaveError] = useState(false);
  const [rewardGranted, setRewardGranted] = useState(false);
  const [chapterSaved, setChapterSaved] = useState(false);
  const [projectSelection, setProjectSelection] = useState(null);
  const feedbackActionRef = useRef(null);
  const firstAnswerRef = useRef(null);
  const retrySaveRef = useRef(null);

  const question = mission?.questions[qIndex] ?? null;
  const category = question?.sourceCategory ?? null;
  const isHeroQuestion = Boolean(question?.astronaut);
  const profile = useMemo(
    () => (isHeroQuestion ? ASTRONAUT_PROFILES.find((person) => person.id === question.astronaut) : null),
    [isHeroQuestion, question],
  );
  const questionOptions = question?.runOptions ?? [];
  const complete = Boolean(mission && qIndex >= mission.questions.length);

  const say = useCallback((text) => {
    if (!soundOn || !text) return;
    if (getOfflineVoiceClip(text)) { cancelNarration(); speak(text, { premium: false, segments: [text] }); }
  }, [cancelNarration, soundOn, speak]);
  useEffect(() => { onPhaseChange?.(mission ? (complete ? 'finish' : feedback ? 'feedback' : 'play') : 'intro'); }, [complete, feedback, mission, onPhaseChange]);
  useEffect(() => { if (!soundOn) cancelNarration(); }, [soundOn, cancelNarration]);
  useEffect(() => () => cancelNarration(), [cancelNarration]);
  useEffect(() => { setProgress(readAstronautProgress(playerId)); }, [playerId]);
  useEffect(() => {
    if (!question) return;
    const target = saveError ? retrySaveRef.current : feedback ? feedbackActionRef.current : firstAnswerRef.current;
    target?.focus();
  }, [feedback, qIndex, saveError, question]);

  useEffect(() => {
    if (question && !feedback) say(question.q);
  }, [question, feedback, say]);

  const startMission = (nextMission) => {
    const canonicalMission = MISSIONS.find((item) => item.id === nextMission?.id);
    if (!canonicalMission) return;
    const latest = readAstronautProgress(playerId);
    const index = MISSIONS.findIndex((item) => item.id === canonicalMission.id);
    if (index > latest.unlockedChapterIndex && !latest.completedChapterIds.includes(nextMission.id)) return;
    cancelNarration();
    setRunDifficulty(difficulty);
    const runSeed = createAstronautSeed();
    const runQuestions = createAstronautRun(canonicalMission, latest.recentQuestionIdsByChapter[canonicalMission.id] ?? [], createSeededRandom(runSeed), latest.missedConceptIdsByChapter[canonicalMission.id] ?? []).map((item, itemIndex) => ({ ...item, runOptions: createAstronautOptions(item, difficulty, createSeededRandom(runSeed ^ ((itemIndex + 1) * 0x9e3779b9))) }));
    setMission({ ...canonicalMission, questions: runQuestions });
    setSeed(runSeed);
    setProgress(saveAstronautRun(playerId, canonicalMission.id, runQuestions.map((item) => item.questionId)));
    setQIndex(0);
    setFeedback(null);
    setHadMistake(false);
    setScore(0);
    setCombo(0);
    setSaveError(false);
    setRewardGranted(false);
    setChapterSaved(false);
    setProjectSelection(null);
    playSfx('launch');
  };

  const returnToMissions = () => {
    cancelNarration();
    setMission(null);
    setQIndex(0);
    setFeedback(null);
    setHadMistake(false);
    setScore(0);
    setCombo(0);
  };

  const handlePick = (option) => {
    if (!question || feedback) return;

    if (option.text === question.answer) {
      const praise = getPraise();
      const nextCombo = combo + 1;
      setFeedback({ kind: 'correct', message: praise, fact: profile?.funFact ?? question.learningFact });
      setProgress(recordAstronautResult(playerId, mission.id, question.conceptId, !hadMistake));
      setScore((value) => value + 1);
      setCombo(nextCombo);
      playSfx('success');
      onGameEvent?.('astronaut', 'answer_correct', {
        skill: `astronaut-${category.id}`,
        item: question.q,
        response: option.text,
        expected: question.answer,
        correct: true,
        firstAttempt: !hadMistake,
        independent: !hadMistake,
        difficulty: runDifficulty,
        seed,
        level: MISSIONS.findIndex((item) => item.id === mission.id),
        round: qIndex + 1,
        taskType: question.transferProject ? 'transfer-project' : 'question',
        projectId: question.transferProject?.id,
        projectAction: question.transferProject?.actionLabel,
      });
      if (nextCombo >= 3) playSfx('combo');
      say(`The answer is ${question.answer}!`);
      if (qIndex === mission.questions.length - 1) saveFinalChapter();
      return;
    }

    setHadMistake(true);
    setProgress(recordAstronautResult(playerId, mission.id, question.conceptId, false));
    setCombo(0);
    setFeedback({ kind: 'retry', message: 'Good try. Have another look!', fact: null });
    playSfx('wrong');
    onGameEvent?.('astronaut', 'answer_incorrect', { skill: `astronaut-${category.id}`, item: question.q, response: option.text, expected: question.answer, correct: false, firstAttempt: !hadMistake, independent: false, difficulty: runDifficulty, seed, level: MISSIONS.findIndex((item) => item.id === mission.id), round: qIndex + 1, taskType: question.transferProject ? 'transfer-project' : 'question', projectId: question.transferProject?.id, projectAction: question.transferProject?.actionLabel });
    say('Try again.');
  };

  const saveFinalChapter = () => {
    const saved = completeAstronautChapter(playerId, mission.id);
    setProgress(saved);
    setChapterSaved(Boolean(saved.persisted));
    if (!saved.persisted) { setSaveError(true); return; }
    setSaveError(false);
    if (saved.newlyEarnedReward) { onCelebrate('Mission badge earned!', 4, 0, 'astronaut', { quiet: true }); setRewardGranted(true); }
  };

  const finishMission = () => {
    if (!chapterSaved) return;
    cancelNarration();
    setQIndex(mission.questions.length);
  };
  const leaveAcademy = () => { cancelNarration(); onBack?.(); };

  const advance = () => {
    if (!mission || !feedback) return;
    cancelNarration();
    if (feedback.kind === 'retry') {
      setFeedback(null);
      return;
    }
    setFeedback(null);
    setHadMistake(false);
    setProjectSelection(null);
    if (qIndex + 1 < mission.questions.length) {
      setQIndex((value) => value + 1);
      return;
    }
    setQIndex(mission.questions.length);
    playSfx('levelup-big');
  };

  const closeOptions = () => setOptionsOpen(false);
  const soundChoice = { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { onToggleSound?.(); closeOptions(); } };
  const startSelected = item => { closeOptions(); startMission(item); };
  const canStart = (item, index) => index <= progress.unlockedChapterIndex || progress.completedChapterIds.includes(item.id);
  const currentMissionIndex = Math.min(progress.unlockedChapterIndex, MISSIONS.length - 1);
  const nextMission = mission ? MISSIONS[MISSIONS.findIndex(item => item.id === mission.id) + 1] : MISSIONS[currentMissionIndex];
  const audioChoice = (label, line) => ({ label, action: () => { closeOptions(); say(line); } });
  const options = [
    ...(!mission || complete ? MISSIONS.map((item, index) => ({
      label: item.title, description: progress.completedChapterIds.includes(item.id) ? 'Badge earned. Replay for practice.' : item.description,
      disabled: !canStart(item, index), button: 'Start mission', action: () => startSelected(item),
    })) : []),
    ...(mission && !complete ? [
      ...(soundOn && getOfflineVoiceClip(question.q) ? [audioChoice('Hear the question', question.q)] : []),
      ...(soundOn && feedback?.kind === 'correct' && getOfflineVoiceClip(`The answer is ${question.answer}!`) ? [audioChoice('Hear the answer', `The answer is ${question.answer}!`)] : []),
      ...(soundOn && feedback?.fact && getOfflineVoiceClip(feedback.fact) ? [audioChoice('Hear this fact', feedback.fact)] : []),
      { label: 'Back to missions', action: () => { closeOptions(); returnToMissions(); } },
    ] : []),
    soundChoice, { label: 'Back to Explore & Languages', action: leaveAcademy },
  ];

  if (optionsOpen || !mission || complete) return <div className="focus-game astronaut-focus" data-board-focus="">
    <main className="focus-game-body is-menu">
      <header className="focus-game-heading"><h1>{complete && !optionsOpen ? `${mission.title} complete!` : 'Astronaut Academy'}</h1></header>
      {optionsOpen ? <FocusMenu choices={options} onBack={closeOptions} /> : <>
        <p className="focus-game-message">{complete ? `${score} of ${mission.questions.length} discoveries made. ${rewardGranted ? 'Your mission badge is saved.' : 'Your saved badge is ready to review.'}` : 'Look closely at each picture to find the answer.'}</p>
        <div className="focus-game-actions">
          {nextMission && <button type="button" className="focus-game-button is-primary" onClick={() => startSelected(nextMission)}>{complete ? 'Next' : 'Start'}: {nextMission.title}</button>}
          <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
          <button type="button" className="focus-game-button" onClick={leaveAcademy}>{complete ? 'Finish' : 'Back'}</button>
        </div>
      </>}
    </main>
  </div>;

  const answerLocked = Boolean(feedback);
  const lastQuestion = qIndex === mission.questions.length - 1;
  const project = question.transferProject ?? null;

  return <div className="focus-game astronaut-focus" data-board-focus="">
    <main className="focus-game-body">
      <header className="focus-game-heading">
        <p>Astronaut Academy · {mission.title} · {qIndex + 1} of {mission.questions.length}</p>
        <h1>{question.q}</h1>
      </header>
        <section className="astro-question-stage" aria-live="polite">
          <div className={`astro-question-card ${feedback?.kind === 'correct' ? 'is-solved' : ''}`} data-astro-question={question.questionId} data-astro-mission={mission.id} data-run-seed={seed}>
            {feedback?.kind !== 'correct' && <div className="astro-question-illustration"><QuestionVisual question={question} category={category} /></div>}
            {feedback?.kind !== 'correct' && <p className="astro-prompt">{project ? project.prompt : 'Choose an answer.'}</p>}

            {project && <section className="astro-transfer-project" data-project={project.id} aria-label={project.name}>
              <div><span className="astro-project-context" aria-hidden="true">{project.id === 'rocket-window' ? <Rocket size={38} /> : project.id === 'sea-research-map' ? <Waves size={38} /> : <UserRound size={38} />}</span><span className="astro-project-eyebrow">YOUR PROJECT</span><strong>{project.name}</strong><span>{project.slotLabel}</span></div>
              <div className="astro-project-slot" data-placement={feedback?.kind || 'preview'} role="status" aria-live="polite">
                {projectSelection ? <><AnswerVisual category={category} label={projectSelection} /><strong>{projectSelection}<small>{feedback?.kind === 'correct' ? 'Placed!' : 'Ready to place'}</small></strong></> : <span>Choose an item below to fill this slot</span>}
              </div>
            </section>}

            {feedback?.kind === 'correct' ? !project && <div className="astro-solved-answer"><AnswerVisual category={category} label={question.answer} /><strong>{question.answer}</strong></div> : <div className="astro-answer-grid">
              {questionOptions.map((option, index) => (
                <button
                  key={option.text}
                  ref={index === 0 ? firstAnswerRef : undefined}
                  className={`astro-answer ${feedback?.kind === 'correct' && option.text === question.answer ? 'is-right' : ''}`}
                  aria-pressed={project ? projectSelection === option.text : undefined}
                  onClick={() => { playSfx('tap'); if (project) setProjectSelection(option.text); else handlePick(option); }}
                  disabled={answerLocked}
                >
                  <span className="astro-answer-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="astro-answer-visual"><AnswerVisual category={category} label={option.text} /></span>
                  <span>{option.text}</span>
                </button>
              ))}
            </div>}

            {project && projectSelection && !feedback && <button type="button" className="astro-primary-button astro-project-place" disabled={!projectSelection || answerLocked} onClick={() => handlePick(questionOptions.find((option) => option.text === projectSelection))}>{project.actionLabel}</button>}

            {feedback && (
              <div className={`astro-feedback ${feedback.kind === 'correct' ? 'is-correct' : 'is-retry'}`} role="status">
                <div className="astro-feedback-copy">
                  <span className="astro-feedback-icon">{feedback.kind === 'correct' ? <Check size={18} /> : <CircleHelp size={18} />}</span>
                  <div><strong>{feedback.message}</strong>
                    {feedback.fact && <p>{feedback.fact}</p>}
                    {feedback.kind === 'retry' && <p>Take your time, then choose another answer.</p>}
                  </div>
                </div>
                {!saveError && <button ref={feedbackActionRef} className={feedback.kind === 'correct' ? 'astro-primary-button' : 'astro-retry-button'} onClick={feedback.kind === 'correct' && lastQuestion ? finishMission : advance} disabled={feedback.kind === 'correct' && lastQuestion && !chapterSaved}>
                  {feedback.kind === 'correct' ? (lastQuestion ? 'Finish mission' : 'Next question') : 'Try again'}
                </button>}
              </div>
            )}
          </div>
        {saveError && <div className="astro-feedback is-retry" role="alert"><div><strong>Badge not saved yet.</strong><p>Your solved answer and explanation are still here. Retry saving, then Finish.</p></div><button ref={retrySaveRef} className="astro-retry-button" onClick={saveFinalChapter}>Retry save</button></div>}
        <button type="button" className="focus-game-button w-full mt-3" onClick={() => setOptionsOpen(true)}>Options</button>
      </section>
    </main>
  </div>;
};

export default AstronautAcademy;
