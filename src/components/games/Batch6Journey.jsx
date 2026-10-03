/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Volume2, Sparkles } from 'lucide-react';
import { BATCH6_BANDS, BATCH6_QUESTION_COUNTS, makeSeed, makeFreshQueue, readBatch6Progress, saveBatch6Run, seededRandom, seededShuffle } from '../../data/batch6Games.js';

export const useBatch6Journey = ({ gameId, playerId, onGameEvent, onCelebrate, speak, cancelNarration, onBack, onPhaseChange }) => {
  const [progress, setProgress] = useState(() => readBatch6Progress(gameId, playerId));
  const [chapter, setChapter] = useState(null);
  const [run, setRun] = useState(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [independentCount, setIndependentCount] = useState(0);
  const active = Boolean(run);
  useEffect(() => { onPhaseChange?.(!run ? 'start' : run.feedback?.complete ? 'done' : 'play'); }, [onPhaseChange, run]);
  useEffect(() => () => cancelNarration?.(), [cancelNarration]);
  const start = useCallback((chapterId, missions, count) => {
    if (!BATCH6_BANDS.some((band) => band.id === chapterId) || !missions || missions.length < count || count !== BATCH6_QUESTION_COUNTS[gameId]) return false;
    cancelNarration?.();
    const seed = makeSeed();
    const random = seededRandom(seed ^ 0x9e3779b9);
    const queue = makeFreshQueue(gameId, playerId, missions, count, seed, (mission) => mission.signature || mission.id).map((mission) => ({
      ...mission,
      options: Array.isArray(mission.options) ? seededShuffle(mission.options, random) : mission.options,
      letters: Array.isArray(mission.letters) ? seededShuffle(mission.letters, random) : mission.letters,
    }));
    const next = { seed, queue, index: 0, feedback: null, mistakes: new Set(), hints: 0, firstTry: 0, missed: [], resolved: [] };
    setChapter(chapterId); setRun(next); setIndependentCount(0); setLeaveOpen(false);
    onGameEvent?.(gameId, 'start', { level: BATCH6_BANDS.findIndex((item) => item.id === chapterId), seed });
    onGameEvent?.(gameId, 'scene', { level: BATCH6_BANDS.findIndex((item) => item.id === chapterId), seed });
    return true;
  }, [cancelNarration, gameId, onGameEvent, playerId]);
  const markAttempt = useCallback((mission, correct) => {
    if (!run || run.feedback) return;
    const firstAttempt = !run.mistakes.has(mission.id);
    const independent = correct && firstAttempt && run.hints === 0;
    const event = correct ? 'answer_correct' : 'answer_wrong';
    const safeMetadata = { level: BATCH6_BANDS.findIndex((item) => item.id === chapter), round: run.index, seed: run.seed, hints: run.hints, correct, firstAttempt, independent, diagnosticOnly: true };
    onGameEvent?.(gameId, event, safeMetadata);
    onGameEvent?.(gameId, 'learning_attempt', { correct, skill: gameId, item: mission.id, firstAttempt, independent, hints: run.hints, difficulty: chapter });
    if (!correct) setRun((current) => ({ ...current, mistakes: new Set([...current.mistakes, mission.id]) }));
    if (correct) {
      if (independent) setIndependentCount((value) => value + 1);
    }
  }, [chapter, gameId, onGameEvent, run]);
  const reveal = useCallback((mission, correct, explanation, fact, response) => {
    if (!run) return;
    setRun((current) => ({ ...current, feedback: { correct, explanation, fact, mission, response } }));
  }, [run]);
  const hint = useCallback((type = 'clue') => {
    if (!run || run.feedback) return;
    setRun((current) => ({ ...current, hints: current.hints + 1 }));
    onGameEvent?.(gameId, 'hint', { level: BATCH6_BANDS.findIndex((item) => item.id === chapter), round: run.index, seed: run.seed, hints: run.hints + 1, hintType: type });
  }, [chapter, gameId, onGameEvent, run]);
  const next = useCallback(() => {
    if (!run?.feedback || run.feedback.complete) return;
    cancelNarration?.();
    const nextIndex = run.index + 1;
    if (nextIndex < run.queue.length) {
      setRun((current) => ({ ...current, index: nextIndex, feedback: null, hints: 0 }));
      onGameEvent?.(gameId, 'scene', { level: BATCH6_BANDS.findIndex((item) => item.id === chapter), round: nextIndex, seed: run.seed });
      return;
    }
    const stars = independentCount === run.queue.length ? 3 : independentCount >= Math.ceil(run.queue.length / 2) ? 2 : 1;
    const facts = run.queue.map((item) => item.fact).filter(Boolean);
    const saved = saveBatch6Run(gameId, playerId, chapter, stars, facts, run.missed, run.resolved, { queueLength: run.queue.length, completedCount: run.index + 1, itemIds: run.queue.map((item) => item.id) });
    if (!saved.saved) {
      setRun((current) => ({ ...current, feedback: { ...current.feedback, saveFailed: true } }));
      return;
    }
    const delta = saved.delta;
    setProgress(readBatch6Progress(gameId, playerId));
    onGameEvent?.(gameId, 'level_complete', { level: BATCH6_BANDS.findIndex((item) => item.id === chapter), round: run.queue.length - 1, seed: run.seed });
    if (delta > 0) onCelebrate?.(`${BATCH6_BANDS.find((item) => item.id === chapter).badge}!`, delta * 4);
    setRun((current) => ({ ...current, feedback: { complete: true, stars, facts } }));
  }, [cancelNarration, chapter, gameId, independentCount, onCelebrate, onGameEvent, playerId, run]);
  const addMissed = useCallback((id) => setRun((current) => current ? { ...current, missed: [...new Set([...current.missed, id])] } : current), []);
  const resolveMissed = useCallback((id) => setRun((current) => current ? { ...current, resolved: [...new Set([...current.resolved, id])] } : current), []);
  const back = useCallback(() => {
    if (run && !run.feedback?.complete) { cancelNarration?.(); setLeaveOpen(true); }
    else if (run?.feedback?.complete) { cancelNarration?.(); setRun(null); setChapter(null); }
    else { cancelNarration?.(); onGameEvent?.(gameId, 'leave', { level: chapter ? BATCH6_BANDS.findIndex((item) => item.id === chapter) : 0, seed: run?.seed || 0 }); onBack?.(); }
  }, [cancelNarration, chapter, gameId, onBack, onGameEvent, run]);
  const leave = useCallback(() => { cancelNarration?.(); setLeaveOpen(false); setRun(null); setChapter(null); onGameEvent?.(gameId, 'leave', { level: BATCH6_BANDS.findIndex((item) => item.id === chapter), seed: run?.seed || 0 }); onBack?.(); }, [cancelNarration, chapter, gameId, onBack, onGameEvent, run]);
  const keep = useCallback(() => setLeaveOpen(false), []);
  const toMap = useCallback(() => {
    if (run && !run.feedback?.complete) { cancelNarration?.(); setLeaveOpen(true); return; }
    cancelNarration?.(); setRun(null); setChapter(null);
  }, [cancelNarration, run]);
  const band = useMemo(() => BATCH6_BANDS.find((item) => item.id === chapter), [chapter]);
  return { progress, chapter, band, run, active, leaveOpen, start, markAttempt, reveal, hint, next, addMissed, resolveMissed, back, leave, keep, toMap, speak };
};

export const Batch6Chrome = ({ title, subtitle, onBack, children, leaveOpen, onLeave, onKeep, soundOn, onToggleSound, progress, onMap, illustration, onReplay, saveFailed }) => (
  <main className="batch6-shell">
    <header className="batch6-header">
      <button className="batch6-icon-button" onClick={onBack} aria-label="Back"><ArrowLeft size={24} /></button>
      <div className="min-w-0 text-center"><h1>{title}</h1><p>{subtitle}</p></div>
      <button className="batch6-icon-button" onClick={onToggleSound} aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}><Volume2 size={22} aria-hidden="true" /></button>
    </header>
    {illustration && <div className="batch6-illustration" aria-hidden="true">{illustration}</div>}
    {onReplay && <button className="batch6-secondary mx-auto min-h-12 px-5" onClick={onReplay}>🔊 Hear the prompt again</button>}
    {progress && <div className="batch6-progress" aria-label={`Question ${progress.current} of ${progress.total}`}><div style={{ width: `${(progress.current / progress.total) * 100}%` }} /></div>}
    {saveFailed && <p className="batch6-feedback text-amber-800" role="status">We could not save this chapter yet. Your answer is still here; press Next to try again.</p>}
    {onMap && <button className="batch6-map-link" onClick={onMap}>Chapter map</button>}
    {children}
    {leaveOpen && <div className="batch6-dialog-backdrop" role="presentation"><section className="batch6-dialog" role="dialog" aria-modal="true" aria-labelledby="batch6-leave-title"><h2 id="batch6-leave-title">Pause this adventure?</h2><p>Your answers so far will stay here while you decide.</p><div className="batch6-actions"><button className="batch6-secondary" onClick={onKeep}>Keep playing</button><button className="batch6-primary" onClick={onLeave}>Leave game</button></div></section></div>}
  </main>
);

export const ChapterMap = ({ title, chapters, completed = [], bestStars = {}, onStart, onBack, disabled = {} }) => (
  <section className="batch6-map"><h2>{title}</h2><p>Choose a chapter. Finish each one to open the next.</p><div className="batch6-chapter-list">{chapters.map((chapter,index) => {
    const unlocked = index === 0 || completed.includes(chapters[index - 1].id);
    const locked = !unlocked || disabled[chapter.id];
    return <button key={chapter.id} disabled={locked} className={`batch6-chapter ${completed.includes(chapter.id) ? 'is-complete' : ''}`} onClick={() => onStart(chapter.id)}><span className="batch6-chapter-icon">{completed.includes(chapter.id) ? '🏅' : ['🌱','🧩','🌟'][index]}</span><span className="batch6-chapter-copy"><strong>{chapter.name}</strong><small>{disabled[chapter.id] || (locked ? 'Finish the chapter before this one' : chapter.subtitle)}</small></span><span className="batch6-stars">{'★'.repeat(bestStars[chapter.id] || 0)}{'☆'.repeat(3-(bestStars[chapter.id] || 0))}</span></button>;
  })}</div>{onBack && <button className="batch6-secondary mt-5" onClick={onBack}>Back to games</button>}</section>
);

export const FactPanel = ({ fact, explanation, source }) => <aside className="batch6-fact"><strong><Sparkles size={18} /> Why it works</strong><p>{explanation}</p>{fact && <p className="batch6-fact-card">{fact}</p>}{source && <a href={source} target="_blank" rel="noreferrer">Science source</a>}</aside>;

export const Batch6BaseCss = () => <><style>{`.batch6-shell{min-height:100svh;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:clamp(12px,3vw,28px);color:#172554;background:radial-gradient(circle at 85% 12%,#dbeafe 0,transparent 28%),linear-gradient(155deg,#f8fafc,#e0f2fe 50%,#ede9fe);font-family:inherit}.batch6-header{display:grid;grid-template-columns:48px 1fr 48px;align-items:center;gap:12px;z-index:2}.batch6-header h1{font-size:clamp(1.2rem,4vw,1.8rem);font-weight:900;line-height:1.1}.batch6-header p{font-size:.85rem;color:#475569;margin-top:4px}.batch6-icon-button{width:48px;height:48px;display:grid;place-items:center;border-radius:16px;background:#fff;color:#3730a3;box-shadow:0 4px 16px #312e811a}.batch6-illustration{font-size:clamp(2rem,7vw,4rem);text-align:center;line-height:1;margin:10px 0}.batch6-hero-art{display:block;max-width:min(240px,64vw);max-height:110px;width:auto;height:auto;object-fit:contain;margin:auto}.batch6-map-link{align-self:center;min-height:48px;padding:0 18px;text-decoration:underline;color:#4338ca;font-weight:800}.batch6-progress{height:10px;border-radius:99px;background:#c7d2fe;max-width:640px;width:100%;margin:14px auto}.batch6-progress>div{height:100%;border-radius:inherit;background:linear-gradient(90deg,#8b5cf6,#06b6d4);transition:width .25s ease}.batch6-map{width:min(720px,100%);margin:auto;z-index:1}.batch6-map h2{font-size:clamp(1.5rem,5vw,2.2rem);font-weight:900;text-align:center}.batch6-map>p{text-align:center;margin:6px 0 20px;color:#475569}.batch6-chapter-list{display:grid;gap:12px}.batch6-chapter{min-height:82px;display:grid;grid-template-columns:48px 1fr auto;align-items:center;gap:12px;padding:12px;background:#fff;border:2px solid #c7d2fe;border-radius:22px;text-align:left;box-shadow:0 8px 20px #312e8110}.batch6-chapter:disabled{opacity:.52}.batch6-chapter.is-complete{border-color:#34d399}.batch6-chapter-icon{font-size:32px}.batch6-chapter-copy{display:grid;gap:4px}.batch6-chapter-copy strong{font-size:1.05rem}.batch6-chapter-copy small{color:#64748b}.batch6-stars{white-space:nowrap;color:#d97706;font-size:1.15rem}.batch6-card{width:min(760px,100%);margin:auto;z-index:1;padding:clamp(16px,4vw,30px);background:#ffffffed;border:2px solid #dbeafe;border-radius:28px;box-shadow:0 18px 45px #1e3a8a18}.batch6-question{font-size:clamp(1.2rem,4.8vw,1.7rem);font-weight:900;text-align:center;margin:12px auto 20px;max-width:620px}.batch6-options{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(140px,100%),1fr));gap:12px;max-width:650px;margin:0 auto}.batch6-primary,.batch6-secondary,.batch6-option{min-height:52px;border-radius:17px;padding:10px 16px;font-weight:850;touch-action:manipulation}.batch6-option{background:#eef2ff;border:2px solid #c7d2fe;color:#312e81;font-size:1.1rem}.batch6-option[disabled]{opacity:.7}.batch6-option:hover:not(:disabled),.batch6-primary:hover,.batch6-secondary:hover{filter:brightness(.97)}.batch6-primary{background:#4f46e5;color:#fff;box-shadow:0 5px 0 #3730a3}.batch6-secondary{background:#fff;color:#3730a3;border:2px solid #c7d2fe}.batch6-actions{display:flex;justify-content:center;flex-wrap:wrap;gap:12px;margin-top:18px}.batch6-fact{margin:18px auto 0;max-width:650px;padding:15px 18px;border-radius:19px;background:#fef3c7;color:#713f12}.batch6-fact strong{display:flex;gap:8px;align-items:center}.batch6-fact p{margin-top:7px;line-height:1.45}.batch6-fact-card{background:#fff9e9;padding:10px 12px;border-radius:12px}.batch6-fact a{font-size:.8rem;text-decoration:underline;font-weight:800}.batch6-dialog-backdrop{position:fixed;inset:0;z-index:20;background:#0f172acc;display:grid;place-items:center;padding:18px}.batch6-dialog{width:min(420px,100%);background:white;border-radius:26px;padding:24px;text-align:center;box-shadow:0 25px 60px #02061766}.batch6-dialog h2{font-weight:900;font-size:1.5rem}.batch6-dialog p{color:#475569;margin-top:8px}.batch6-board{display:grid;width:min(420px,90vw);aspect-ratio:1;margin:16px auto;border:5px solid #713f12;border-radius:10px;overflow:hidden;grid-template-columns:repeat(5,1fr)}.batch6-square{aspect-ratio:1;display:grid;place-items:center;font-size:clamp(1.6rem,8vw,3rem);position:relative}.batch6-square.light{background:#fef3c7}.batch6-square.dark{background:#c08457}.batch6-square.legal{box-shadow:inset 0 0 0 5px #22c55e}.batch6-square.selected{box-shadow:inset 0 0 0 5px #3b82f6}.batch6-goal-marker{position:absolute;top:1px;right:3px;color:#fff;font-size:14px;line-height:1;text-shadow:0 1px 3px #000}.batch6-hangword{display:flex;justify-content:center;gap:8px;margin:18px auto;font-size:clamp(1.6rem,7vw,2.7rem);font-weight:900;letter-spacing:.1em}.batch6-letter-grid{display:grid;grid-template-columns:repeat(7,minmax(38px,1fr));gap:7px;max-width:560px;margin:16px auto}.batch6-letter{min-height:48px;border-radius:13px;background:#fff;border:2px solid #c7d2fe;font-weight:900;font-size:1.1rem}.batch6-letter:disabled{opacity:.45}.batch6-feedback{text-align:center;margin-top:16px;font-size:1.05rem;font-weight:800;color:#166534}.batch6-retry{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:14px}.batch6-mission-icon{text-align:center;font-size:clamp(3rem,12vw,6rem)}@media(max-width:420px){.batch6-shell{padding:10px}.batch6-card{padding:15px;border-radius:22px}.batch6-options{grid-template-columns:repeat(2,minmax(0,1fr))}.batch6-chapter{grid-template-columns:42px 1fr auto;gap:8px;padding:10px}.batch6-chapter-copy small{font-size:.75rem}.batch6-letter-grid{grid-template-columns:repeat(7,minmax(34px,1fr));gap:5px}.batch6-letter{min-height:48px;padding:0}}@media(prefers-reduced-motion:reduce){.batch6-shell *, .batch6-shell *::before,.batch6-shell *::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}`}</style></>;
