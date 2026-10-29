import { useCallback, useEffect, useRef, useState } from 'react';
import { Home, RotateCcw, HelpCircle, Beaker, Sparkles, ArrowRight, LockKeyhole } from 'lucide-react';
import { COLOUR_LABS, COLOUR_LAB_MISSIONS, COLOUR_PAINTS, COLOUR_MAKE_RECIPE_CHOICES, seededColourMissionOrder, colourRecipeMatches } from '../../data/colourLabAdventure.js';
import {
  completeColourMissionStrict, getColourLabPendingRewardsStrict, markColourMissionReceiptClaimedStrict,
  readColourLabProgressStrict,
} from '../../data/colourLabProgress.js';
import { rewardClaimToken } from '../../data/playerRewards.js';
import { shuffle, getPraise } from '../../utils.js';
import { SoundToggle } from '../shared/index.jsx';

const colourFor = (name) => ({ ...COLOUR_PAINTS, Orange: '#ef8a3a', Green: '#4caa71', Purple: '#8959b5', Teal: '#278f91', Lime: '#a6c943', Pink: '#ec9ab5', 'Sky Blue': '#90c9eb', 'Pale Grey': '#ccd3d8', 'Dark Red': '#923d47', Navy: '#3f527a', Grey: '#9aa3aa', Coral: '#ee8e75', Peach: '#f4bd91', 'Dark Grey': '#68717d', Brown: '#956448' }[name] || '#cbd5e1');
const SVG = ({ children, compact = false }) => <svg viewBox="0 0 140 100" className={compact ? 'h-14 w-20 sm:h-24 sm:w-32' : 'h-20 w-28 sm:h-24 sm:w-32'} aria-hidden="true">{children}</svg>;
function ObjectArt({ type, color, compact = false }) {
  const common = { fill: color, stroke: '#254153', strokeWidth: 3, strokeLinejoin: 'round' };
  const shapes = {
    sun: <><circle cx="70" cy="50" r="24" {...common}/><path d="M70 7v13M70 80v13M27 50h13M100 50h13M40 20l9 10m42 40 9 10M100 20 91 30M49 70l-9 10" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"/></>,
    leaf: <><path d="M27 74C27 28 69 15 112 18 110 58 88 89 44 84" {...common}/><path d="M35 79 96 31M62 59l-2-21m18 8 18 1" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></>,
    berry: <><circle cx="48" cy="52" r="24" {...common}/><circle cx="82" cy="53" r="24" {...common}/><path d="M64 34c-3-14 8-21 18-20-1 10-6 17-18 20m-2 0c-3-12-15-16-23-12 4 9 11 13 23 12" fill="#62a96b" stroke="#254153" strokeWidth="3"/></>,
    wave: <><path d="M12 59c17-24 33 24 51 0s35 24 53 0M12 78c17-24 33 24 51 0s35 24 53 0" fill="none" stroke={color} strokeWidth="13" strokeLinecap="round"/><path d="M17 59c15-20 27 18 43 0s29 18 43 0" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></>,
    acorn: <><path d="M43 43c0-18 8-25 27-25s27 7 27 25l9 31c2 8-5 14-13 14H47c-8 0-15-6-13-14z" {...common}/><path d="M39 44c0-18 13-28 31-28s31 10 31 28z" fill="#8b6049" stroke="#254153" strokeWidth="3"/><path d="M55 53v24m17-24v24m17-24v24" stroke="#fff" strokeWidth="3" opacity=".55"/></>,
    sprout: <><path d="M69 80V42" stroke="#498d58" strokeWidth="8" strokeLinecap="round"/><path d="M68 50C39 50 30 32 34 20c24-1 37 11 34 30m2-8c3-20 20-29 37-24 0 19-12 31-37 31" {...common}/><path d="M46 82h47" stroke="#8b6049" strokeWidth="8" strokeLinecap="round"/></>,
    flower: <><circle cx="70" cy="47" r="12" fill="#f2c94c" stroke="#254153" strokeWidth="3"/>{[0,1,2,3,4].map((n)=><ellipse key={n} cx="70" cy="25" rx="12" ry="18" fill={color} stroke="#254153" strokeWidth="3" transform={`rotate(${n*72} 70 47)`}/>)}<path d="M70 59v31m0-13c-16-15-26-3-25 5 13 4 22 3 25-5" fill="none" stroke="#498d58" strokeWidth="6" strokeLinecap="round"/></>,
    cloud: <><path d="M35 76a18 18 0 0 1-2-36 28 28 0 0 1 54-7 22 22 0 0 1 18 43z" {...common}/><path d="M41 59h57" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".65"/></>,
    moon: <><path d="M91 17c-27 7-39 40-24 62 9 13 26 19 42 14C82 113 38 99 34 62 30 28 60 9 91 17z" {...common}/></>,
    shell: <><path d="M24 75c5-40 24-57 46-57s41 17 46 57c-31 19-61 19-92 0z" {...common}/><path d="M70 26v56M49 31l14 52m28-52L77 83m-40-37 29 38m45-38L82 82" fill="none" stroke="#fff" strokeWidth="3" opacity=".7"/></>,
    peach: <><path d="M70 31c-26-27-55 0-43 30 9 24 31 31 43 19 12 12 34 5 43-19 12-30-17-57-43-30z" {...common}/><path d="M70 32c-5 14-5 34 0 48" fill="none" stroke="#fff" strokeWidth="4"/><path d="M70 28c4-15 17-18 28-13-3 12-12 18-28 13" fill="#62a96b" stroke="#254153" strokeWidth="3"/></>,
    stone: <><path d="M29 70 43 36l28-18 30 13 13 36-20 18H49z" {...common}/><path d="m48 39 22-11m4 50 13-34" fill="none" stroke="#fff" strokeWidth="4" opacity=".6"/></>,
  };
  return <SVG compact={compact}>{shapes[type] || shapes.sun}</SVG>;
}

export const COLOUR_LAB_ROUND_DATA = COLOUR_LAB_MISSIONS.map((mission) => Object.freeze({
  ...mission,
  recipeChoices: COLOUR_MAKE_RECIPE_CHOICES[mission.id] || Object.freeze([]),
}));

export default function ColorMixingLab({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent, onReviewComplete, onPhaseChange, cancelNarration, playerId = 'default' }) {
  const [progressState, setProgressState] = useState(() => readColourLabProgressStrict(playerId));
  const progress = progressState.ok ? progressState.progress : { version: 1, completed: [], chapters: [], recentMissionIds: [], rewardReceipts: {} };
  const [rewardDrainBusy, setRewardDrainBusy] = useState(true);
  const [rewardClaimError, setRewardClaimError] = useState(false);
  const [pendingReceipt, setPendingReceipt] = useState(null);
  const [progressRetryBusy, setProgressRetryBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [activeLab, setActiveLab] = useState('mix');
  const [phase, setPhase] = useState('intro');
  const [missionOrder, setMissionOrder] = useState([]);
  const [recipeWrong, setRecipeWrong] = useState(false);
  const [hadMistake, setHadMistake] = useState(false);
  const [missionIndex, setMissionIndex] = useState(0);
  const labMissions = COLOUR_LAB_MISSIONS.filter((mission) => mission.lab === activeLab);
  const mission = missionOrder.length ? COLOUR_LAB_MISSIONS.find((item) => item.id === missionOrder[missionIndex]) : labMissions[0];
  const [added, setAdded] = useState({});
  const [mixed, setMixed] = useState(false);
  const [answer, setAnswer] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [wrong, setWrong] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [clueUsed, setClueUsed] = useState(false);
  const [clue, setClue] = useState('');
  const [praise, setPraise] = useState('');
  const [explanationReplay, setExplanationReplay] = useState(0);
  const [options, setOptions] = useState(() => shuffle([...labMissions[0].options]));
  const pendingResultRef = useRef(null);
  const saveBusyRef = useRef(false);
  const receiptClaimsRef = useRef(new Map());
  const receiptDrainRef = useRef(null);
  const recipeChoices = activeLab === 'make' ? COLOUR_MAKE_RECIPE_CHOICES[mission.id] || [] : [];
  const selectedRecipeCard = recipeChoices.find(({ id }) => id === selectedRecipe);
  const required = activeLab === 'make' ? Object.entries(selectedRecipeCard?.scoops || {}).map(([name, count]) => ({ name, count })) : mission.ingredients.map((name, index) => ({ name, count: Number(mission.proportions[index].match(/(\d+)/)?.[1] || 1) }));
  const totalNeeded = required.reduce((sum, item) => sum + item.count, 0);
  const totalAdded = Object.values(added).reduce((sum, count) => sum + count, 0);
  const availablePaints = activeLab === 'make'
    ? Object.keys(selectedRecipeCard?.scoops || {})
    : mission.ingredients;
  const completeRecipe = activeLab === 'make'
    ? Boolean(selectedRecipeCard) && Object.keys(COLOUR_PAINTS).every((name) => (added[name] || 0) === (selectedRecipeCard.scoops[name] || 0))
    : colourRecipeMatches(mission, added);
  const labInfo = COLOUR_LABS.find((lab) => lab.id === activeLab);
  const labPosition = COLOUR_LABS.findIndex((lab) => lab.id === activeLab);
  const targetPanelClass = activeLab === 'make'
    ? 'order-first flex-row gap-2 min-h-16 p-1.5 text-left xl:order-none xl:flex-col xl:min-h-[340px] xl:gap-0 xl:p-7 xl:text-center'
    : 'flex-col min-h-20 p-1.5 text-center sm:min-h-[340px] sm:p-7';
  const labUnlocked = (id) => id === 'mix' || (id === 'light' && progress.chapters.includes('mix')) || (id === 'make' && progress.chapters.includes('mix') && progress.chapters.includes('light'));

  const refreshProgress = useCallback(() => {
    const loaded = readColourLabProgressStrict(playerId);
    setProgressState(loaded);
    return loaded;
  }, [playerId]);
  const claimReceipt = useCallback(async (receipt) => {
    if (!receipt?.id || receipt.claimed) return true;
    const claimKey = `${playerId}:${receipt.id}`;
    const active = receiptClaimsRef.current.get(claimKey);
    if (active) return active;
    const operation = Promise.resolve().then(async () => {
      setPendingReceipt(receipt);
      let parent;
      try {
        parent = await onCelebrate?.(`${receipt.chapterId} paint saved!`, receipt.rewardDelta * 4, 0, 'colormix', {
          quiet: true, rewardToken: rewardClaimToken('colormix', receipt.id),
        });
      } catch { parent = null; }
      if (parent?.persisted !== true) { setRewardClaimError(true); return false; }
      const marked = markColourMissionReceiptClaimedStrict(playerId, receipt.id);
      if (!marked.ok) { setProgressState(marked); setRewardClaimError(true); return false; }
      setProgressState({ ...marked, ok: true });
      setPendingReceipt(null);
      setRewardClaimError(false);
      return true;
    });
    receiptClaimsRef.current.set(claimKey, operation);
    try { return await operation; }
    finally { if (receiptClaimsRef.current.get(claimKey) === operation) receiptClaimsRef.current.delete(claimKey); }
  }, [onCelebrate, playerId]);
  const drainPendingRewards = useCallback(async () => {
    if (receiptDrainRef.current) return receiptDrainRef.current;
    const operation = (async () => {
      setRewardDrainBusy(true);
      setRewardClaimError(false);
      const loaded = getColourLabPendingRewardsStrict(playerId);
      if (!loaded.ok) { setProgressState(loaded); setRewardClaimError(true); return false; }
      setProgressState(loaded);
      for (const receipt of loaded.receipts) {
        if (!await claimReceipt(receipt)) { setRewardClaimError(true); return false; }
      }
      const latest = readColourLabProgressStrict(playerId);
      if (!latest.ok || Object.values(latest.progress.rewardReceipts).some(({ claimed }) => !claimed)) {
        setProgressState(latest);
        setRewardClaimError(true);
        return false;
      }
      setProgressState(latest);
      setPendingReceipt(null);
      setRewardClaimError(false);
      setSaveError('');
      return true;
    })();
    receiptDrainRef.current = operation;
    try { return await operation; }
    finally { if (receiptDrainRef.current === operation) receiptDrainRef.current = null; setRewardDrainBusy(false); }
  }, [claimReceipt, playerId]);
  const canStartLab = progressState.ok && !rewardDrainBusy && !rewardClaimError && !pendingReceipt;
  useEffect(() => { onPhaseChange?.(phase); }, [phase, onPhaseChange]);
  useEffect(() => { if (phase !== 'play') return; cancelNarration?.(); speak?.(mission.prompt, { premium: false, segments: [mission.prompt] }); }, [phase, mission.id, mission.prompt, speak, cancelNarration]);
  useEffect(() => { if (phase !== 'intro') return undefined; const timer = window.setTimeout(() => { void drainPendingRewards(); }, 0); return () => window.clearTimeout(timer); }, [phase, drainPendingRewards]);
  const speakFixed = (line) => { cancelNarration?.(); speak?.(line, { premium: false, segments: [line] }); };
  const startLab = (labId = activeLab) => {
    cancelNarration?.();
    const loaded = refreshProgress();
    const pending = getColourLabPendingRewardsStrict(playerId);
    if (!loaded.ok || !pending.ok) { setSaveError('Saved progress needs a check before you start.'); return; }
    if (pending.receipts.length || rewardDrainBusy || rewardClaimError || pendingReceipt) { setSaveError('Confirm your saved star before starting.'); void drainPendingRewards(); return; }
    if (!labUnlocked(labId)) return;
    const order = seededColourMissionOrder(labId, Date.now(), loaded.progress.recentMissionIds);
    setProgressState(loaded); setSaveError(''); pendingResultRef.current = null;
    setActiveLab(labId); setMissionOrder(order.map((item) => item.id)); setMissionIndex(0); setAdded({}); setMixed(false); setAnswer(''); setSelectedRecipe(''); setWrong(false); setHadMistake(false); setRecipeWrong(false); setClueUsed(false); setClue(''); setPraise(''); setOptions(shuffle([...order[0].options])); setPhase('play');
  };

  const setLab = (labId) => {
    if (phase === 'play') return;
    if (!labUnlocked(labId)) return; cancelNarration?.(); setPhase('intro'); setMissionOrder([]);
    pendingResultRef.current = null;
    setActiveLab(labId); setMissionIndex(0); setAdded({}); setMixed(false); setAnswer(''); setSelectedRecipe(''); setWrong(false); setHadMistake(false); setRecipeWrong(false); setClueUsed(false); setClue(''); setPraise(''); setSaveError(''); setExplanationReplay(0);
    const first = COLOUR_LAB_MISSIONS.find((item) => item.lab === labId); setOptions(shuffle([...first.options]));
  };
  const addScoop = (name) => {
    if (mixed) return;
    if (mixed || totalAdded >= totalNeeded) return;
    const target = required.find((entry) => entry.name === name)?.count || 0;
    setAdded((current) => ({ ...current, [name]: Math.min((current[name] || 0) + 1, target) })); setRecipeWrong(false);
  };
  const completeMission = async (result = pendingResultRef.current?.result) => {
    if (!result || saveBusyRef.current) return false;
    const draft = pendingResultRef.current?.missionId === mission.id
      ? pendingResultRef.current
      : { missionId: mission.id, labId: activeLab, result, hadMistake, clueUsed, praise: getPraise(), eventSent: false, newlyCompleted: !progress.completed.includes(mission.id) };
    pendingResultRef.current = draft;
    saveBusyRef.current = true;
    setAnswer(draft.result); setPraise(draft.praise); setSaveBusy(true);
    const saved = completeColourMissionStrict(playerId, draft.missionId, draft.labId, labMissions.map((item) => item.id));
    if (!saved.ok) { setSaveError('Your blend is ready. Retry saving this result.'); setSaveBusy(false); saveBusyRef.current = false; return false; }
    draft.newlyCompleted = Boolean(draft.newlyCompleted || saved.newlyCompleted);
    setProgressState({ ...saved, ok: true });
    const stableReceipt = saved.receipt || pendingReceipt;
    if (stableReceipt && !await claimReceipt(stableReceipt)) {
      setSaveError('Your blend is saved. Retry confirming its star.'); setSaveBusy(false); saveBusyRef.current = false; return false;
    }
    const latest = readColourLabProgressStrict(playerId);
    if (!latest.ok || Object.values(latest.progress.rewardReceipts).some(({ claimed }) => !claimed)) {
      setProgressState(latest); setSaveError('Your saved star needs another check. Retry this result.'); setSaveBusy(false); saveBusyRef.current = false; return false;
    }
    setProgressState(latest); setSaveError(''); setSaveBusy(false); saveBusyRef.current = false; setAnswer(draft.result); setPraise(draft.praise); setPendingReceipt(null);
    if (!draft.eventSent && draft.newlyCompleted) {
      draft.eventSent = true;
      onGameEvent?.('colormix', 'answer_correct', { skill: 'colormix', item: draft.missionId, response: draft.result, expected: mission.answer, correct: true, firstAttempt: !draft.hadMistake && !draft.clueUsed, independent: !draft.hadMistake && !draft.clueUsed, hints: draft.clueUsed ? 1 : 0, deferFinish: true });
      playSfx?.('success'); speakFixed(mission.explanation);
    }
    return true;
  };
  const mixPaint = () => {
    if (totalAdded !== totalNeeded || mixed || (activeLab === 'make' && !selectedRecipeCard)) return;
    if (!completeRecipe) {
      setRecipeWrong(true); setWrong(true); setHadMistake(true); playSfx?.('wrong');
      onGameEvent?.('colormix', 'answer_wrong', { skill: 'colormix', item: mission.id, response: 'recipe', expected: mission.answer, correct: false });
      return;
    }
    setRecipeWrong(false); setMixed(true); playSfx?.('success');
    if (activeLab === 'make' && selectedRecipeCard?.color === mission.answer) completeMission(mission.answer);
    else if (activeLab === 'make') {
      setRecipeWrong(true); setWrong(true); setHadMistake(true); playSfx?.('wrong');
      onGameEvent?.('colormix', 'answer_wrong', { skill: 'colormix', item: mission.id, response: selectedRecipeCard?.color, expected: mission.answer, correct: false });
    }
  };
  const choose = (choice) => {
    if (!mixed || answer) return;
    if (choice === mission.answer) { setWrong(false); completeMission(choice); }
    else {
      setWrong(true); setHadMistake(true); playSfx?.('wrong');
      onGameEvent?.('colormix', 'answer_wrong', { skill: 'colormix', item: mission.id, response: choice, expected: mission.answer, correct: false });
    }
  };
  const useClue = () => { if (clueUsed || answer) return; setClueUsed(true); setClue(mission.clue); speakFixed(mission.clue);  };
  const nextMission = () => {
    if (!answer || saveError || saveBusy || rewardDrainBusy || pendingReceipt || rewardClaimError) return;
    if (missionIndex >= labMissions.length - 1) { cancelNarration?.(); setPhase('chapter-results'); return; }
    const next = missionIndex + 1;
    const nextMissionData = COLOUR_LAB_MISSIONS.find((item) => item.id === missionOrder[next]);
    setMissionIndex(next);
    pendingResultRef.current = null;
    setAdded({}); setMixed(false); setAnswer(''); setSelectedRecipe(''); setWrong(false); setHadMistake(false); setRecipeWrong(false); setClueUsed(false); setClue(''); setPraise(''); setSaveError(''); setExplanationReplay(0); setOptions(shuffle([...nextMissionData.options]));
  };
  const finish = () => { cancelNarration?.(); if (onReviewComplete) onReviewComplete(); else onBack?.(); };

  return <main className="min-h-screen bg-[#f8f4ee] text-[#203847]">
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-7 sm:py-4">
      <button type="button" onClick={onBack} disabled={phase === 'play' && (saveBusy || Boolean(answer && saveError))} aria-label="Back to home" className="grid min-h-12 min-w-12 place-items-center rounded-2xl bg-white text-[#304b59] shadow-sm ring-1 ring-[#d8e2df] disabled:opacity-50"><Home size={22}/></button>
      <div className="text-center"><div className="text-xs font-black uppercase tracking-[.2em] text-[#ab6685]">Your paint studio</div><h1 className="text-xl font-black sm:text-3xl">Colour Mixing Lab</h1></div>
      <SoundToggle soundOn={soundOn} onToggle={onToggleSound}/>
    </header>
    <div className="mx-auto grid max-w-7xl gap-3 px-3 pb-8 sm:gap-5 sm:px-7 lg:grid-cols-[minmax(0,1fr)_310px]">
      <section className="min-w-0">
        {phase === 'intro' && <>
          {!progressState.ok && <section role="alert" className="mb-3 rounded-2xl border-2 border-rose-400 bg-white p-3 font-bold"><p>Saved paint progress could not be checked. Your paints stay locked until it can be read.</p><button type="button" onClick={() => { setProgressRetryBusy(true); const loaded = refreshProgress(); setProgressRetryBusy(false); if (loaded.ok) void drainPendingRewards(); }} disabled={progressRetryBusy} className="mt-2 min-h-12 rounded-xl bg-rose-700 px-4 text-white">{progressRetryBusy ? 'Checking…' : 'Retry saved progress'}</button></section>}
          {rewardDrainBusy && <p role="status" className="mb-3 rounded-xl bg-white p-2 text-center text-sm font-semibold">Checking saved paint rewards…</p>}
          {rewardClaimError && <section role="alert" className="mb-3 rounded-2xl border-2 border-amber-500 bg-white p-3 font-bold"><p>A saved paint star still needs confirmation.</p><button type="button" onClick={() => void drainPendingRewards()} disabled={rewardDrainBusy} className="mt-2 min-h-12 rounded-xl bg-amber-700 px-4 text-white">Retry saved stars</button></section>}
          {saveError && <p role="alert" className="mb-3 rounded-xl border-2 border-rose-400 bg-white p-3 font-bold">{saveError}</p>}
          <section className="rounded-[28px] border border-[#e2e7df] bg-white p-4 text-center shadow-sm sm:p-10" aria-label="Selected paint lab">
            <p className="text-xs font-black uppercase tracking-widest" style={{color:labInfo.accent}}>Selected · Lab {labPosition + 1} of 3</p><h2 className="mt-1 text-2xl font-black sm:mt-2 sm:text-3xl">{labInfo.title}</h2>
            <p className="mt-1 font-extrabold">Six paint missions</p>
            <button type="button" data-colour-lab-start disabled={!canStartLab || !labUnlocked(activeLab)} onClick={() => startLab()} className="mt-3 min-h-14 w-full max-w-md rounded-2xl px-6 text-lg font-black text-white shadow disabled:opacity-50" style={{backgroundColor:labInfo.accent}}>Start {labInfo.title}<ArrowRight className="ml-2 inline" size={20}/></button>
            <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-5 text-[#647677]">{labInfo.lesson}</p>
          </section>
          <details className="mt-3 rounded-2xl border border-[#e2e7df] bg-white p-3 shadow-sm"><summary className="min-h-12 cursor-pointer font-black">Choose another lab</summary><nav aria-label="Colour labs" className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">{COLOUR_LABS.map((lab) => <button key={lab.id} type="button" onClick={() => setLab(lab.id)} disabled={!labUnlocked(lab.id) || !progressState.ok || rewardDrainBusy || Boolean(pendingReceipt)} aria-pressed={activeLab === lab.id} className="min-h-14 rounded-2xl border-2 px-3 py-2 text-left text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-45 sm:text-base" style={{ borderColor: activeLab === lab.id ? lab.accent : '#e4e9e5', background: activeLab === lab.id ? `${lab.accent}18` : 'white', color: activeLab === lab.id ? lab.accent : '#50616a' }}>{!labUnlocked(lab.id) && <LockKeyhole className="mr-1 inline" size={14}/>} {lab.title}<span className="block text-xs font-semibold">{lab.subtitle}</span></button>)}</nav></details>
        </>}
        {phase === 'chapter-results' && <section className="rounded-[28px] border border-[#e2e7df] bg-white p-6 shadow-sm sm:p-10"><p className="text-xs font-black uppercase tracking-widest text-[#47866d]">Chapter complete</p><h2 className="mt-2 text-3xl font-black">{labInfo.title} finished</h2><p className="mt-3 font-semibold">All six recipes are saved in this player's palette.</p><div className="mt-5 flex flex-wrap gap-3">{labPosition < COLOUR_LABS.length - 1 ? <button type="button" onClick={() => setLab(COLOUR_LABS[labPosition + 1].id)} className="min-h-14 rounded-2xl px-6 font-black text-white" style={{backgroundColor:COLOUR_LABS[labPosition+1].accent}}>Start {COLOUR_LABS[labPosition+1].title}</button> : <button type="button" onClick={finish} className="min-h-14 rounded-2xl bg-[#214e45] px-6 font-black text-white">Finish adventure</button>}<button type="button" onClick={() => setLab(activeLab)} className="min-h-14 rounded-2xl border px-5 font-black">Replay this chapter</button></div></section>}
        {phase === 'play' && <article data-colour-mission={mission.id} aria-label="Paint mission" className="overflow-hidden rounded-[28px] border border-[#e2e7df] bg-white shadow-[0_14px_40px_rgba(39,67,73,.08)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#edf0eb] px-3 py-2 sm:px-7 sm:py-4"><div><div className="text-[10px] font-black uppercase tracking-wide sm:text-xs sm:tracking-[.17em]" style={{ color: labInfo.accent }}>{labInfo.title} · Mission {missionIndex + 1} of {labMissions.length}</div><h2 className="mt-0.5 text-lg font-black sm:mt-1 sm:text-2xl">{mission.title}</h2></div><span className="rounded-full bg-[#f3f7f4] px-2 py-1.5 text-[10px] font-extrabold text-[#526a70] sm:px-3 sm:py-2 sm:text-xs">{progress.completed.length} mixes saved</span></div>
          <div className="grid gap-1 p-1 sm:gap-3 sm:p-4 xl:grid-cols-[1.03fr_.97fr]">
            <div className="flex min-w-0 flex-col gap-1 sm:gap-2">
              {!answer && <p className="text-sm font-bold leading-tight sm:text-lg sm:leading-6">{mission.prompt}</p>}
              {saveError && <div className="rounded-2xl border border-[#edc8a6] bg-[#fff4e9] p-2 text-sm font-bold text-[#8e4a23]" role="alert"><p>{saveError}</p><button type="button" data-colour-save-retry onClick={() => pendingResultRef.current ? void completeMission(pendingResultRef.current.result) : void drainPendingRewards().then((ok) => { if (ok) setSaveError(''); })} disabled={saveBusy || rewardDrainBusy} className="mt-2 min-h-12 rounded-xl bg-white px-4 font-black disabled:opacity-50">{saveBusy ? 'Saving…' : pendingReceipt || rewardClaimError ? 'Retry saved stars' : 'Retry saving this result'}</button></div>}
              {activeLab === 'make' && !answer && <div className="rounded-2xl border border-[#dbe7dc] bg-[#f8fbf7] p-1.5 sm:p-3"><p className="text-xs font-black text-[#446358] sm:text-sm">{selectedRecipeCard ? `This recipe uses ${totalNeeded} scoops` : 'Choose a recipe to see its scoops'}</p><div className="mt-1 grid grid-cols-3 gap-1 sm:mt-2 sm:gap-2">{recipeChoices.map((card) => { const recipeLabel = Object.entries(card.scoops).map(([name, count]) => `${count} ${name}`).join(' + '); return <button key={card.id} type="button" onClick={() => { setSelectedRecipe(card.id); setAdded({}); setMixed(false); setWrong(false); setRecipeWrong(false); }} disabled={Boolean(answer)} aria-label={`Recipe: ${recipeLabel}`} aria-pressed={selectedRecipe === card.id} className={`flex min-h-12 items-center justify-center rounded-xl border-2 bg-white px-1 py-1 text-center text-[10px] font-extrabold leading-tight disabled:opacity-60 sm:gap-2 sm:px-3 sm:py-2 sm:text-xs ${selectedRecipe === card.id ? 'border-[#4a9b78] ring-2 ring-[#4a9b78]/20' : 'border-[#e3e9e3]'}`}>{recipeLabel}</button>; })}</div></div>}
              {!answer && activeLab !== 'make' && <div aria-label="Recipe proportions">
                <p className="text-xs font-extrabold leading-5 text-[#654f41] sm:hidden">Recipe: {mission.proportions.map((part) => { const [, count, paint] = part.match(/^(\d+)\s+scoops?\s+(.+)$/i) || []; return `${count} ${Number(count) === 1 ? 'scoop' : 'scoops'} ${paint}`; }).join(' · ')}</p>
                <div className="hidden flex-wrap gap-2 sm:flex">{mission.proportions.map((part) => <span key={part} className="rounded-full bg-[#f6f2e9] px-3 py-2 text-sm font-extrabold text-[#654f41]">{part}</span>)}</div>
              </div>}
              {!answer && (activeLab !== 'make' || selectedRecipeCard) && <div className={`rounded-3xl bg-[#f3f7f3] p-2.5 sm:p-5 ${mixed ? 'hidden' : ''}`}>
                <div className="mb-1.5 flex items-center justify-between sm:mb-3"><h3 className="text-sm font-black sm:text-base">Add your paint</h3><span className="text-[10px] font-bold text-[#63777a] sm:text-xs">{Object.values(added).reduce((sum, value) => sum + value, 0)} scoops added</span></div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">{availablePaints.map((name) => { const count = required.find((entry) => entry.name === name)?.count || 0; return ({ name, count }); }).map(({ name, count }) => <button key={name} type="button" onClick={() => addScoop(name)} disabled={Boolean(answer) || mixed || totalAdded >= totalNeeded || (added[name] || 0) >= count} aria-label={`Add ${name} paint`} className="flex min-h-12 items-center gap-1.5 rounded-2xl border border-[#dfe7e0] bg-white px-2 text-xs font-extrabold shadow-sm disabled:opacity-55 sm:min-h-14 sm:gap-2 sm:px-4 sm:text-base"><span className="h-5 w-5 rounded-full border border-black/10 shadow-inner sm:h-6 sm:w-6" style={{ backgroundColor: colourFor(name) }}/>{name}<span className="rounded-full bg-[#edf3ef] px-1.5 py-1 text-[10px] sm:px-2 sm:text-xs">{added[name] || 0}/{count}</span></button>)}</div>
                <div className="mt-2 flex items-center gap-1.5 sm:mt-4 sm:gap-3"><div className="flex min-h-14 min-w-0 flex-1 flex-wrap items-center gap-1.5 rounded-2xl border-2 border-dashed border-[#d5e0d8] bg-white/80 p-2 sm:min-h-[72px] sm:gap-2 sm:p-3" aria-label="Paints in mixing bowl">{Object.keys(COLOUR_PAINTS).flatMap((name, i) => Array.from({length: added[name] || 0}, (_, j) => <span key={`${i}-${j}`} className="h-6 w-6 rounded-full border border-black/10 shadow-inner sm:h-7 sm:w-7" style={{ backgroundColor: colourFor(name) }} aria-label={`${name} scoop`}/>))}{!Object.values(added).some(Boolean) && <span className="text-xs font-semibold text-[#7c8d8c] sm:text-sm">Your mixing bowl</span>}</div><button type="button" onClick={mixPaint} disabled={totalAdded !== totalNeeded || mixed || (activeLab === 'make' && !selectedRecipeCard)} className="min-h-12 shrink-0 rounded-2xl px-2 text-xs font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-45 sm:min-h-14 sm:px-6 sm:text-base" style={{ backgroundColor: labInfo.accent }}><Beaker className="mr-1 inline" size={16}/>{mixed ? 'Mixed' : 'Mix'}</button><button type="button" onClick={() => {setAdded({});setMixed(false);setWrong(false);setRecipeWrong(false);}} disabled={Boolean(answer)} className="inline-flex min-h-12 shrink-0 items-center gap-1 rounded-xl bg-white px-2 text-xs font-bold text-[#61767b] hover:bg-white disabled:opacity-50 sm:hidden"><RotateCcw size={16}/>Empty bowl</button></div>
                <button type="button" onClick={() => {setAdded({});setMixed(false);setWrong(false);setRecipeWrong(false);}} disabled={Boolean(answer)} className="mt-3 hidden min-h-12 items-center gap-2 rounded-xl px-3 text-sm font-bold text-[#61767b] hover:bg-white disabled:opacity-50 sm:inline-flex"><RotateCcw size={16}/>Empty bowl</button>
              </div>}
              {!answer && mixed && <div className="flex min-h-12 items-center justify-between gap-2 rounded-2xl bg-[#f3f7f3] px-2 sm:min-h-14 sm:px-3" aria-label="Measured scoops">
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 text-xs font-extrabold text-[#526a70] sm:text-sm">{Object.entries(added).filter(([, count]) => count > 0).map(([name, count]) => <span key={name} className="inline-flex items-center gap-1"><span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: colourFor(name) }} aria-hidden="true"/>{count} {name}</span>)}</div>
                <button type="button" onClick={() => { setAdded({}); setMixed(false); setWrong(false); setRecipeWrong(false); }} className="min-h-12 shrink-0 rounded-xl bg-white px-2 text-xs font-black text-[#61767b]">Empty bowl</button>
              </div>}
              {mixed && <div className="rounded-3xl border border-[#e2e7df] bg-[#fffdfa] p-4" aria-live="polite"><div className="flex items-center gap-4"><div className={`mix-result h-16 w-16 shrink-0 rounded-[48%_52%_60%_40%] border-4 border-white shadow-[inset_-7px_-7px_12px_#0002,0_5px_12px_#0002] ${answer ? 'mix-result-done' : ''}`} style={{ backgroundColor: colourFor(activeLab === 'make' ? selectedRecipeCard?.color : mission.resultColor) }}/><div><div className="text-xs font-black uppercase tracking-widest text-[#78888a]">Mixing bowl</div><p className="font-extrabold">{answer ? `Your blend is ${mission.resultColor}.` : 'Look at your mixed paint.'}</p></div></div></div>}
              <div className="flex flex-wrap items-center gap-2">{!clueUsed && !answer && <button type="button" onClick={useClue} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-[#e8d9af] bg-[#fff9e9] px-4 font-bold text-[#725d30]"><HelpCircle size={18}/>One clue</button>}{clue && !answer && <p className="rounded-2xl bg-[#fff9e9] px-4 py-3 text-sm font-bold text-[#725d30]" role="status">{clue}</p>}{wrong && <p className="rounded-2xl bg-[#fff1e7] px-4 py-3 font-bold text-[#9c542d]" role="status">{recipeWrong ? 'That paint recipe missed the target. Empty the bowl and try again.' : 'Not quite. Check the recipe and try another colour.'}</p>}</div>
              {mixed && !answer && activeLab !== 'make' && <p className="font-black">{activeLab === 'light' ? 'Did adding white or black make the paint lighter or darker?' : 'What colour did your recipe make?'}</p>}
              {mixed && !answer && activeLab !== 'make' && <div className="grid grid-cols-3 gap-1.5 sm:gap-2">{options.map((choice) => <button key={choice} type="button" onClick={() => choose(choice)} className="flex min-h-12 items-center justify-center gap-1 rounded-2xl border-2 border-[#e5ebe5] bg-white px-1 text-center text-xs font-black shadow-sm hover:border-[#9ebcaa] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 sm:min-h-14 sm:gap-3 sm:px-4 sm:text-base" aria-label={`Choose ${choice}`}>{activeLab !== 'light' && <span className="h-6 w-6 shrink-0 rounded-full border border-black/10 shadow-inner sm:h-8 sm:w-8" style={{ backgroundColor: colourFor(choice) }}/>} {choice}</button>)}</div>}
              {answer && <div className="rounded-3xl bg-[#ecf7ee] p-3 text-[#286246] sm:p-4" role="status"><div className="flex items-center gap-2 font-black"><Sparkles size={19}/>{praise}</div><p className="mt-2 font-bold leading-6">{mission.explanation}</p>{explanationReplay > 0 && <p className="sr-only" aria-live="polite">{mission.explanation}</p>}<div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => { setExplanationReplay((value) => value + 1); speakFixed(mission.explanation); }} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-4 font-bold"><RotateCcw size={17}/>Hear explanation again</button><button type="button" onClick={nextMission} disabled={Boolean(saveError) || saveBusy || rewardDrainBusy || Boolean(pendingReceipt) || rewardClaimError} className="inline-flex min-h-12 items-center gap-2 rounded-xl px-5 font-black text-white disabled:cursor-not-allowed disabled:opacity-50" style={{ backgroundColor: labInfo.accent }}>{missionIndex < labMissions.length - 1 ? 'Next mix' : 'Finish chapter'}<ArrowRight size={18}/></button></div></div>}
            </div>
            <div className={`flex ${targetPanelClass} items-center justify-center rounded-[26px] bg-[radial-gradient(ellipse_at_50%_38%,#fff_0%,#f7f6ef_67%,#eef2eb_100%)]`}>
              <div className="mb-1 hidden rounded-full bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-[#738282] xl:block">Picture application</div><ObjectArt compact={activeLab === 'make'} type={mission.object} color={answer || activeLab === 'make' ? colourFor(mission.resultColor) : '#a8c8b7'}/><div className={activeLab === 'make' ? 'min-w-0' : ''}><h3 className={`font-black ${activeLab === 'make' ? 'text-sm xl:mt-2 xl:text-xl' : 'mt-0.5 text-sm sm:mt-2 sm:text-xl'}`}>{answer ? `${mission.resultColor} ${mission.object === 'sun' ? 'sun' : mission.object}` : mission.object === 'sun' ? 'Sun badge' : `${mission.object[0].toUpperCase()}${mission.object.slice(1)} picture`}</h3><p className={`${activeLab === 'make' ? 'mt-1 text-xs font-bold xl:mt-2 xl:text-sm' : 'hidden'} max-w-sm text-[#677a7b] xl:block xl:font-semibold xl:leading-6`}>{activeLab === 'make' ? `Target colour: ${mission.resultColor}.` : answer ? `Now the picture shows your ${mission.resultColor.toLowerCase()} paint.` : 'Mix the recipe, then choose the name of your new paint blend.'}</p></div>
              <div className="mt-5 hidden items-end gap-2 sm:flex" aria-label="Paint pots">{Object.keys(COLOUR_PAINTS).map((name) => <div key={name} className="flex flex-col items-center gap-1"><div className="relative h-12 w-11 overflow-hidden rounded-b-xl border-2 border-white shadow" style={{ background: `linear-gradient(to top, ${colourFor(name)} 70%, #fff 70%)` }}><div className="absolute inset-x-0 top-1 h-2 rounded-full bg-white/70"/></div><span className="text-[11px] font-extrabold text-[#607478]">{name}</span></div>)}</div>
            </div>
          </div>
          <details className="border-t border-[#edf0eb] bg-[#fcfcf9] px-5 text-sm font-semibold leading-6 text-[#647677] sm:px-7"><summary className="flex min-h-12 cursor-pointer items-center font-bold">About these paint recipes</summary><p className="pb-3">{labInfo.lesson} Proportions are activity scoops; actual paint results can vary.</p></details>
        </article>}
      </section>
      <details className="self-start rounded-[26px] border border-[#e2e7df] bg-white p-5 shadow-sm"><summary className="min-h-12 cursor-pointer font-black text-[#446358]">Open saved palette and progress</summary><div className="pt-3"><h2 className="mt-1 text-xl font-black">Saved blends</h2><p className="mt-1 text-sm font-semibold text-[#718082]">Completed recipes stay with this player.</p><div className="mt-4 grid grid-cols-2 gap-2">{COLOUR_LAB_MISSIONS.filter((item) => progress.completed.includes(item.id)).map((item) => <div key={item.id} className="flex min-h-12 items-center gap-2 rounded-xl bg-[#f4f7f3] px-3 text-sm font-extrabold"><span className="h-6 w-6 rounded-full border border-black/10" style={{backgroundColor:colourFor(item.resultColor)}}/>{item.resultColor}</div>)}</div>{progress.completed.length === 0 && <div className="mt-4 rounded-2xl border-2 border-dashed border-[#dfe7e0] p-4 text-center text-sm font-bold text-[#81908e]">Your first mix will appear here.</div>}<div className="mt-5 flex flex-col gap-2">{COLOUR_LABS.map((lab) => { const count = COLOUR_LAB_MISSIONS.filter((item) => item.lab === lab.id && progress.completed.includes(item.id)).length; return <div key={lab.id} className="flex items-center justify-between rounded-xl bg-[#fafbf8] px-3 py-2"><span className="font-bold">{lab.title}</span><span className="text-xs font-black text-[#788a85]">{count}/6</span></div>; })}</div><button type="button" onClick={() => { setActiveLab('mix'); setMissionIndex(0); setAdded({});setMixed(false);setAnswer('');setWrong(false); }} className="mt-5 min-h-12 w-full rounded-2xl border border-[#dce6df] bg-white font-extrabold text-[#446358]">Replay from Paint Mixer</button></div></details>
    </div>
    <style>{`@keyframes paint-swish{0%{transform:scale(.65) rotate(-20deg);filter:saturate(.6)}70%{transform:scale(1.13) rotate(9deg)}100%{transform:scale(1) rotate(0);filter:saturate(1)}}.mix-result-done{animation:paint-swish .65s cubic-bezier(.2,.8,.2,1) both}@media(prefers-reduced-motion:reduce){.mix-result-done{animation:none!important}}`}</style>
  </main>;
}
