import { useCallback, useEffect, useRef, useState } from 'react';
import { COLOUR_LABS, COLOUR_LAB_MISSIONS, COLOUR_PAINTS, COLOUR_MAKE_RECIPE_CHOICES, seededColourMissionOrder, colourRecipeMatches } from '../../data/colourLabAdventure.js';
import {
  completeColourMissionStrict, getColourLabPendingRewardsStrict, markColourMissionReceiptClaimedStrict,
  readColourLabProgressStrict,
} from '../../data/colourLabProgress.js';
import { rewardClaimToken } from '../../data/playerRewards.js';
import { shuffle, getPraise } from '../../utils.js';
import { mixPaintScoops } from '../../data/paintMix.js';
import CreativeCanvas from './CreativeCanvas.jsx';
import { FocusMenu } from '../shared/FocusMenu.jsx';

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
  const [freePaint, setFreePaint] = useState(true);
  const [progressState, setProgressState] = useState(() => readColourLabProgressStrict(playerId));
  const progress = progressState.ok ? progressState.progress : { version: 1, completed: [], chapters: [], recentMissionIds: [], rewardReceipts: {} };
  const [rewardDrainBusy, setRewardDrainBusy] = useState(true);
  const [rewardClaimError, setRewardClaimError] = useState(false);
  const [pendingReceipt, setPendingReceipt] = useState(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [activeLab, setActiveLab] = useState(() => COLOUR_LABS.find(({ id }) => !progress.chapters.includes(id))?.id || COLOUR_LABS.at(-1).id);
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
  const [panel, setPanel] = useState('lesson');
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
  const completeRecipe = activeLab === 'make'
    ? Boolean(selectedRecipeCard) && Object.keys(COLOUR_PAINTS).every((name) => (added[name] || 0) === (selectedRecipeCard.scoops[name] || 0))
    : colourRecipeMatches(mission, added);
  const labInfo = COLOUR_LABS.find((lab) => lab.id === activeLab);
  const labPosition = COLOUR_LABS.findIndex((lab) => lab.id === activeLab);
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
    const shuffled = seededColourMissionOrder(labId, Date.now(), loaded.progress.recentMissionIds);
    const completed = new Set(loaded.progress.completed);
    const remaining = shuffled.filter(({ id }) => !completed.has(id));
    const resume = remaining.length > 0 && remaining.length < shuffled.length;
    const order = resume ? [...shuffled.filter(({ id }) => completed.has(id)), ...remaining] : shuffled;
    const startIndex = resume ? shuffled.length - remaining.length : 0;
    setPanel('lesson');
    setProgressState(loaded); setSaveError(''); pendingResultRef.current = null;
    setActiveLab(labId); setMissionOrder(order.map((item) => item.id)); setMissionIndex(startIndex); setAdded({}); setMixed(false); setAnswer(''); setSelectedRecipe(''); setWrong(false); setHadMistake(false); setRecipeWrong(false); setClueUsed(false); setClue(''); setPraise(''); setOptions(shuffle([...order[startIndex].options])); setPhase('play');
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
  const revealClue = () => { if (clueUsed || answer) return; setClueUsed(true); setClue(mission.clue); speakFixed(mission.clue);  };
  const nextMission = () => {
    if (!answer || saveError || saveBusy || rewardDrainBusy || pendingReceipt || rewardClaimError) return;
    if (missionIndex >= labMissions.length - 1) { cancelNarration?.(); setPhase('chapter-results'); return; }
    const next = missionIndex + 1;
    const nextMissionData = COLOUR_LAB_MISSIONS.find((item) => item.id === missionOrder[next]);
    setMissionIndex(next);
    pendingResultRef.current = null;
    setAdded({}); setMixed(false); setAnswer(''); setSelectedRecipe(''); setWrong(false); setHadMistake(false); setRecipeWrong(false); setClueUsed(false); setClue(''); setPraise(''); setSaveError(''); setOptions(shuffle([...nextMissionData.options]));
  };
  const finish = () => { cancelNarration?.(); if (onReviewComplete) onReviewComplete(); else onBack?.(); };

  const closeOptions = () => setPanel('lesson');
  const goCanvas = () => { closeOptions(); cancelNarration?.(); setFreePaint(true); };
  const leave = () => { cancelNarration?.(); onBack?.(); };
  const empty = () => { closeOptions(); setAdded({}); setMixed(false); setWrong(false); setRecipeWrong(false); };
  const retrySave = () => pendingResultRef.current
    ? void completeMission(pendingResultRef.current.result)
    : void drainPendingRewards().then(ok => { if (ok) setSaveError(''); });
  const retryProgress = () => {
    const loaded = refreshProgress();
    if (loaded.ok) void drainPendingRewards();
  };

  if (freePaint) return <CreativeCanvas playerId={playerId} mixing onLessons={() => setFreePaint(false)} onBack={leave} />;

  const inPlay = phase === 'play';
  const nextLab = COLOUR_LABS[labPosition + 1];
  const mixedColour = mixPaintScoops(added);
  const startLabel = labMissions.some(({ id }) => progress.completed.includes(id)) && !progress.chapters.includes(activeLab) ? 'Continue' : 'Start';
  const menuOptions = [
    ...(!inPlay ? [
      ...COLOUR_LABS.map(lab => ({ label: lab.title, description: lab.subtitle, button: 'Start lab', disabled: !canStartLab || !labUnlocked(lab.id), action: () => startLab(lab.id) })),
      { label: 'Saved palette', action: () => setPanel('palette') },
      { label: 'Paint canvas', action: goCanvas },
    ] : []),
    ...(inPlay && !answer ? [
      ...(!clueUsed ? [{ label: 'Show a clue', action: () => { closeOptions(); revealClue(); } }] : []),
      ...(totalAdded ? [{ label: 'Empty bowl', action: empty }] : []),
      ...(soundOn ? [{ label: 'Hear the recipe', action: () => { closeOptions(); speakFixed(mission.prompt); } }] : []),
    ] : []),
    ...(inPlay && answer && soundOn ? [{ label: 'Hear the explanation', action: () => { closeOptions(); speakFixed(mission.explanation); } }] : []),
    ...(inPlay ? [{ label: 'About these recipes', description: `${labInfo.lesson} Actual paint results can vary.`, button: 'Back to the recipe', action: closeOptions }] : []),
    { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { closeOptions(); cancelNarration?.(); onToggleSound?.(); } },
    { label: 'Back to Creative Lab', action: leave },
  ];

  return <div className="focus-game colour-lessons-focus" data-board-focus="">
    <main className={`focus-game-body${inPlay && panel === 'lesson' ? '' : ' is-menu'}`} data-colour-mission={inPlay ? mission.id : undefined}>
      <header className="focus-game-heading">
        {inPlay && panel === 'lesson' && <p>{labInfo.title} · Mix {missionIndex + 1} of {labMissions.length}</p>}
        <h1>{panel === 'palette' ? 'Saved palette' : inPlay && panel === 'lesson' ? mission.title : 'Colour Mixing Lab'}</h1>
      </header>
      {panel === 'options' ? <FocusMenu choices={menuOptions} onBack={closeOptions} /> : panel === 'palette' ? <>
        <p className="focus-game-message">{progress.completed.length} of {COLOUR_LAB_MISSIONS.length} blends saved.</p>
        <ul className="colour-focus-palette">{COLOUR_LAB_MISSIONS.filter(item => progress.completed.includes(item.id)).map(item => <li key={item.id}><span style={{ backgroundColor: colourFor(item.resultColor) }} />{item.resultColor}</li>)}</ul>
        <button type="button" className="focus-game-button" onClick={closeOptions}>Back to lessons</button>
      </> : <>
        {phase === 'intro' && <>
          <p className="focus-game-message">Add paint to the bowl and see what colour it makes.</p>
          {!progressState.ok && <p className="focus-game-message" role="alert">Saved paints could not be read.</p>}
          {rewardClaimError && <p className="focus-game-message" role="alert">A saved paint star still needs confirmation.</p>}
          {saveError && <p className="focus-game-message" role="alert">{saveError}</p>}
          <div className="focus-game-actions">
            {!progressState.ok || rewardClaimError
              ? <button type="button" className="focus-game-button is-primary" onClick={retryProgress} disabled={rewardDrainBusy}>Retry saved progress</button>
              : <button type="button" data-colour-lab-start className="focus-game-button is-primary" disabled={!canStartLab || !labUnlocked(activeLab)} onClick={() => startLab()}>{startLabel}: {labInfo.title}</button>}
            <button type="button" className="focus-game-button" onClick={goCanvas}>Paint canvas</button>
            <button type="button" className="focus-game-button" onClick={() => setPanel('options')}>Options</button>
          </div>
        </>}
        {phase === 'chapter-results' && <>
          <p className="focus-game-message">{labInfo.title} finished. All six recipes are saved in your palette.</p>
          <div className="focus-game-actions">
            {nextLab && <button type="button" className="focus-game-button is-primary" onClick={() => startLab(nextLab.id)}>Next: {nextLab.title}</button>}
            <button type="button" className="focus-game-button" onClick={() => setPanel('options')}>Options</button>
            <button type="button" className="focus-game-button" onClick={finish}>Finish</button>
          </div>
        </>}
        {inPlay && <>
          {!answer && !mixed && <p className="focus-game-message">{activeLab === 'make' ? `Choose a recipe to make ${mission.resultColor.toLowerCase()}.` : `Add ${mission.proportions.join(' and ')}.`}</p>}
          {activeLab === 'make' && !answer && <label className="focus-game-menu">Recipe
            <select value={selectedRecipe} onChange={event => { empty(); setSelectedRecipe(event.target.value); }}>
              <option value="">Choose a recipe</option>
              {recipeChoices.map(card => <option key={card.id} value={card.id}>{Object.entries(card.scoops).map(([name,count]) => `${count} ${name}`).join(' + ')}</option>)}
            </select>
          </label>}
          <div className="colour-focus-stage">
            <div className="colour-focus-bowl" aria-label="Paints in mixing bowl" style={mixed ? { backgroundColor: mixedColour } : undefined}>
              {mixed ? <span>Mixed paint</span> : Object.entries(added).filter(([, count]) => count).flatMap(([name,count]) => Array.from({length:count},(_,index) => <span key={`${name}-${index}`} className="colour-scoop" style={{ backgroundColor: colourFor(name) }} aria-label={`${name} scoop`} />))}
              {!mixed && !totalAdded && <span>Empty bowl</span>}
            </div>
            <div className="colour-focus-object"><ObjectArt type={mission.object} color={answer || activeLab === 'make' ? colourFor(mission.resultColor) : '#a8c8b7'}/></div>
          </div>
          {saveError && <p role="alert" className="focus-game-message">{saveError}</p>}
          {!answer && !mixed && (activeLab !== 'make' || selectedRecipeCard) && <div className="colour-focus-pots" role="group" aria-label="Paint pots">
            {required.map(({ name,count }) => <button key={name} type="button" className="focus-game-button" onClick={() => addScoop(name)} disabled={totalAdded >= totalNeeded || (added[name] || 0) >= count} aria-label={`Add ${name} paint`}>
              <span style={{ backgroundColor: colourFor(name) }} />{name} · {added[name] || 0}/{count}
            </button>)}
          </div>}
          {clue && !answer && <p role="status" className="focus-game-message">{clue}</p>}
          {wrong && <p role="status" className="focus-game-message">{recipeWrong ? 'That recipe missed the target. Empty the bowl or choose another recipe.' : 'Try another answer.'}</p>}
          {mixed && !answer && activeLab !== 'make' && !saveError && <>
            <p className="focus-game-message">{activeLab === 'light' ? 'Is the paint lighter or darker?' : 'What colour did you make?'}</p>
            <div className="colour-focus-pots" role="group" aria-label="Choose the result">
              {options.map(choice => <button key={choice} type="button" className="focus-game-button" onClick={() => choose(choice)} aria-label={`Choose ${choice}`}>
                {activeLab !== 'light' && <span style={{ backgroundColor: colourFor(choice) }} />}{choice}
              </button>)}
            </div>
          </>}
          {answer && <div className="pattern-focus-explanation" role="status"><strong>{praise}</strong><p>{mission.explanation}</p></div>}
          <div className="focus-game-actions mt-3">
            {saveError
              ? <button type="button" className="focus-game-button is-primary" data-colour-save-retry disabled={saveBusy || rewardDrainBusy} onClick={retrySave}>Retry saving this mix</button>
              : answer
                ? <button type="button" className="focus-game-button is-primary" disabled={saveBusy || rewardDrainBusy || Boolean(pendingReceipt) || rewardClaimError} onClick={nextMission}>{missionIndex < labMissions.length - 1 ? 'Next mix' : 'Finish chapter'}</button>
                : !mixed && totalNeeded > 0 && <button type="button" className="focus-game-button is-primary" disabled={totalAdded !== totalNeeded} onClick={mixPaint}>Mix paint</button>}
            {!saveError && <button type="button" className="focus-game-button" onClick={() => setPanel('options')}>Options</button>}
          </div>
        </>}
      </>}
    </main>
  </div>;
}
