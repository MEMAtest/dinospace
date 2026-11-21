import { useEffect, useRef, useState } from 'react';
import RoverArt from './RoverArt.jsx';
import { BLOCKS, BOARD_SIZE, CHAPTERS, MAX_PROGRAM_BLOCKS, MISSION_BY_ID, MISSION_ORDER, MISSIONS, advanceRover, expandProgram, judgeRover, startRover, validateProgram } from './rover.js';
import { codeAttemptAttribution, completeCodeMission, isCodeMissionUnlocked, readCodeProgress, saveCodeDraft } from './codeProgress.js';
import { nextGuidedMissionInstruction } from './codeCadetsFlow.js';
import { loadProject, saveProject } from './storage.js';
import { getOfflineVoiceClip } from '../data/offlineVoice.js';
import './codeCadets.css';

const COMMAND_NAMES = { forward: 'Forward', left: 'Turn left', right: 'Turn right', repeat3: 'Repeat Forward 3 times', collect: 'Collect' };
const DIRECTIONS = ['north', 'east', 'south', 'west'];
const legacyMission = (legacyIndex) => [MISSION_BY_ID['first-route'], MISSION_BY_ID['debug-turn'], MISSION_BY_ID['repeat-rescue']][legacyIndex] || null;
const safeInitialMission = (progress) => isCodeMissionUnlocked(progress, progress.currentMissionId) ? progress.currentMissionId : MISSION_ORDER[Math.min(progress.unlockedMissionIndex, MISSION_ORDER.length - 1)];

export default function CodeCadets({ player: playerProp, playerId = 'amari', registerDirty = () => {}, onCelebrate = () => {}, onGameEvent, onPhaseChange, playSfx = () => {}, soundOn = true, onToggleSound, onBack, cancelNarration = () => {} }) {
  const player = playerProp ?? playerId;
  const [profile, setProfile] = useState(() => ({ player, progress: readCodeProgress(player) }));
  const progress = profile.player === player ? profile.progress : readCodeProgress(player);
  const [missionId, setMissionId] = useState(() => safeInitialMission(progress));
  const mission = MISSION_BY_ID[missionId];
  const initialDraft = progress.missionDrafts[missionId];
  const [program, setProgram] = useState(() => [...(initialDraft?.program || mission.initial)]);
  const [title, setTitle] = useState(() => initialDraft?.title || 'My rover mission');
  const [helpUsed, setHelpUsed] = useState(() => initialDraft?.helpUsed === true);
  const [guidedUsed, setGuidedUsed] = useState(() => initialDraft?.guidedUsed === true);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [pendingCompletion, setPendingCompletion] = useState(false);
  const [history, setHistory] = useState([]);
  const [rover, setRover] = useState(() => startRover(mission));
  const [running, setRunning] = useState(false);
  const [active, setActive] = useState(-1);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('Your mission draft saves automatically.');
  const [draftFailed, setDraftFailed] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [view, setView] = useState('rover');
  const [option, setOption] = useState('missions');
  const [selectedMission, setSelectedMission] = useState(missionId);
  const [selectedCommand, setSelectedCommand] = useState('');
  const [selectedBlock, setSelectedBlock] = useState(0);
  const [blockChange, setBlockChange] = useState('remove');
  const [sound, setSound] = useState(soundOn);
  const [legacySaved, setLegacySaved] = useState(() => loadProject(player, 'code'));
  const [legacyUnranked, setLegacyUnranked] = useState(false);
  const timer = useRef(null);
  const audio = useRef(null);
  const cancelNarrationRef = useRef(cancelNarration);
  cancelNarrationRef.current = cancelNarration;
  const attemptCounter = useRef(0);
  const currentAttemptId = useRef('');
  const headingRef = useRef(null);
  const retryRef = useRef(null);
  const execution = useRef({ step: 0, state: startRover(mission) });
  const missionOrderIndex = MISSION_ORDER.indexOf(missionId);
  const chapter = CHAPTERS.find((item) => item.id === mission.chapterId);
  const phase = !started ? 'intro' : won ? 'finish' : 'play';
  const nextGuidedBlock = nextGuidedMissionInstruction(program, mission.guidedBlocks);
  const hasPromptRecording = Boolean(getOfflineVoiceClip(mission.prompt, 'en-US'));
  const wallAt = (x, y) => mission.walls?.some((wall) => wall.x === x && wall.y === y);

  useEffect(() => { onPhaseChange?.(phase); }, [phase, onPhaseChange]);
  useEffect(() => { headingRef.current?.focus(); }, [view, phase, missionId]);
  useEffect(() => { if (pendingCompletion || draftFailed) retryRef.current?.focus(); }, [pendingCompletion, draftFailed, view]);
  useEffect(() => { setSound(soundOn); if (!soundOn) { audio.current?.pause?.(); audio.current = null; cancelNarrationRef.current(); } }, [soundOn]);
  useEffect(() => {
    clearTimeout(timer.current); timer.current = null;
    audio.current?.pause?.(); audio.current = null; cancelNarrationRef.current(); currentAttemptId.current = '';
    const nextProgress = readCodeProgress(player);
    const nextId = safeInitialMission(nextProgress);
    const nextMission = MISSION_BY_ID[nextId];
    const draft = nextProgress.missionDrafts[nextId];
    setProfile({ player, progress: nextProgress });
    setMissionId(nextId); setProgram([...(draft?.program || nextMission.initial)]); setTitle(draft?.title || 'My rover mission');
    setHelpUsed(draft?.helpUsed === true); setGuidedUsed(draft?.guidedUsed === true); setRover(startRover(nextMission));
    execution.current = { step: 0, state: startRover(nextMission) };
    setLegacySaved(loadProject(player, 'code')); setLegacyUnranked(false); setStarted(false); setRunning(false); setWon(false); setPendingCompletion(false); setHistory([]); setActive(-1); setView('rover'); setMessage(''); setDirty(false); setDraftFailed(false);
  // The wrapper keys this activity by player; this also handles an in-place player switch.
  }, [player]);
  useEffect(() => { registerDirty(() => dirty || running || draftFailed || pendingCompletion); return () => registerDirty(null); }, [dirty, running, draftFailed, pendingCompletion, registerDirty]);
  useEffect(() => {
    const beforeUnload = (event) => { if (!dirty && !draftFailed && !pendingCompletion) return; event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty, draftFailed, pendingCompletion]);
  useEffect(() => () => { clearTimeout(timer.current); audio.current?.pause?.(); cancelNarrationRef.current(); }, []);

  const stopAudio = () => { audio.current?.pause?.(); audio.current = null; cancelNarrationRef.current(); };
  const playPrompt = () => {
    stopAudio();
    const clip = getOfflineVoiceClip(mission.prompt, 'en-US');
    if (!sound || !clip) return;
    const playerAudio = new Audio(clip); audio.current = playerAudio; playerAudio.play().catch(() => {});
  };
  const stop = (feedback = '') => {
    clearTimeout(timer.current); timer.current = null; setRunning(false);
    if (feedback) setMessage(feedback);
  };
  const reset = (feedback = 'Pip is back at the start. Your code is unchanged.') => {
    stop(); currentAttemptId.current = ''; execution.current = { step: 0, state: startRover(mission) };
    setRover(execution.current.state); setActive(-1); setWon(false); setPendingCompletion(false); setMessage(feedback);
  };
  const writeDraft = (nextProgram = program, nextTitle = title, assisted = helpUsed, id = missionId, allowLocked = legacyUnranked && id === missionId, usedGuided = guidedUsed) => {
    const result = saveCodeDraft(player, id, nextProgram, nextTitle, assisted, undefined, { allowLocked, guidedUsed: usedGuided });
    setProfile({ player, progress: result });
    setDirty(!result.persisted); setDraftFailed(!result.persisted);
    setStatus(result.persisted ? 'Mission draft saved automatically.' : 'Draft save failed. Your code is still here; retry before leaving this mission.');
    return result.persisted;
  };
  const edit = (nextProgram, feedback = 'Run Pip to test your changes.', usedGuided = guidedUsed) => {
    if (!validateProgram(nextProgram) || nextProgram.length > MAX_PROGRAM_BLOCKS) return;
    currentAttemptId.current = '';
    stop(); execution.current = { step: 0, state: startRover(mission) };
    setRover(execution.current.state); setActive(-1); setHistory((items) => [...items.slice(-49), program]); setProgram(nextProgram);
    setWon(false); setPendingCompletion(false); setMessage(feedback); setGuidedUsed(usedGuided); writeDraft(nextProgram, title, helpUsed, missionId, legacyUnranked, usedGuided);
  };
  const chooseMission = (nextId, overrides = {}) => {
    if (running || (!overrides.allowLocked && !isCodeMissionUnlocked(progress, nextId) && !progress.completedMissionIds.includes(nextId))) return;
    if (draftFailed && !writeDraft()) { setMessage('Retry the draft save before changing missions.'); return; }
    const nextMission = MISSION_BY_ID[nextId];
    if (!nextMission) return;
    stop(); stopAudio();
    currentAttemptId.current = '';
    setView('rover');
    const draft = progress.missionDrafts[nextId];
    const nextProgram = [...(overrides.program || draft?.program || nextMission.initial)];
    const nextTitle = overrides.title ?? draft?.title ?? 'My rover mission';
    const nextHelpUsed = overrides.helpUsed ?? draft?.helpUsed === true;
    const nextGuidedUsed = overrides.guidedUsed ?? draft?.guidedUsed === true;
    const isLockedImport = overrides.allowLocked === true && !isCodeMissionUnlocked(progress, nextId) && !progress.completedMissionIds.includes(nextId);
    setLegacyUnranked(isLockedImport);
    setMissionId(nextId); setProgram(nextProgram); setTitle(nextTitle); setHelpUsed(nextHelpUsed); setGuidedUsed(nextGuidedUsed);
    setHistory([]); setRover(startRover(nextMission));
    execution.current = { step: 0, state: startRover(nextMission) };
    setActive(-1); setWon(false); setPendingCompletion(false); setMessage(''); setStarted(true);
    writeDraft(nextProgram, nextTitle, nextHelpUsed, nextId, isLockedImport, nextGuidedUsed);
  };
  const completeMission = () => {
    const result = completeCodeMission(player, missionId, program, title, helpUsed, undefined, { guidedUsed });
    setProfile({ player, progress: result });
    if (!result.valid) {
      currentAttemptId.current = '';
      setPendingCompletion(false); setWon(false); setDirty(false);
      setMessage(result.message || 'This program does not meet the mission goal yet. Edit it and try again.');
      return false;
    }
    if (!result.persisted) { setPendingCompletion(true); setWon(false); setDirty(true); setMessage('Pip reached the goal, but progress could not be saved. Retry the save before moving on.'); return false; }
    setPendingCompletion(false); setDraftFailed(false); setDirty(false); setView('rover'); setStatus('Mission and draft saved.'); setWon(true);
    setMessage(judgeRover(execution.current.state, mission, program).message);
    if (result.newlyCompletedChapterId) onCelebrate('Code Cadets chapter badge earned!', 4, 0, 'codecadets', { quiet: true });
    onGameEvent?.('codecadets', 'mission_complete', { missionId, chapterId: mission.chapterId, attemptId: currentAttemptId.current, blockCount: program.length, expandedActionCount: expandProgram(program).length, ...codeAttemptAttribution({ helpUsed, guidedUsed }), mastery: false });
    currentAttemptId.current = '';
    return true;
  };
  const finishRun = (state) => {
    const outcome = judgeRover(state, mission, program);
    setRunning(false);
    if (!currentAttemptId.current) { attemptCounter.current += 1; currentAttemptId.current = `cc-${missionId}-${attemptCounter.current}`; }
    const attemptId = currentAttemptId.current;
    const facts = { missionId, chapterId: mission.chapterId, attemptId, blockCount: program.length, expandedActionCount: expandProgram(program).length, ...codeAttemptAttribution({ helpUsed, guidedUsed }) };
    if (!outcome.complete) { setWon(false); setMessage(outcome.message); onGameEvent?.('codecadets', 'program_incomplete', { ...facts, completed: false }); currentAttemptId.current = ''; return; }
    if (sound) playSfx('success');
    if (missionOrderIndex > progress.unlockedMissionIndex) { setWon(false); setMessage('This saved program reaches its goal. Finish the earlier missions to unlock its badge.'); currentAttemptId.current = ''; return; }
    completeMission();
  };
  const executeOne = () => {
    const list = expandProgram(program), cursor = execution.current;
    if (cursor.step >= list.length) { finishRun(cursor.state); return true; }
    const instruction = list[cursor.step];
    const result = advanceRover(cursor.state, instruction, mission);
    setActive(instruction.block);
    if (result.error) {
      if (sound) playSfx('wrong');
      setMessage(result.error); setRunning(false); clearTimeout(timer.current);
      const attemptId = currentAttemptId.current || `cc-${missionId}-${++attemptCounter.current}`;
      onGameEvent?.('codecadets', 'program_blocked', { missionId, chapterId: mission.chapterId, attemptId, blockIndex: instruction.block + 1, ...codeAttemptAttribution({ helpUsed, guidedUsed }) });
      currentAttemptId.current = '';
      return true;
    }
    execution.current = { step: cursor.step + 1, state: result.state };
    if (sound) playSfx('click');
    setRover(result.state);
    if (execution.current.step >= list.length) { finishRun(result.state); return true; }
    setMessage(`Pip followed block ${instruction.block + 1}: ${BLOCKS[program[instruction.block]]}.`);
    return false;
  };
  const runProgram = () => {
    if (!program.length) { setMessage('Add a command first.'); return; }
    stop(); stopAudio(); setView('rover'); setWon(false); setPendingCompletion(false);
    attemptCounter.current += 1; currentAttemptId.current = `cc-${missionId}-${attemptCounter.current}`;
    execution.current = { step: 0, state: startRover(mission) }; setRover(execution.current.state); setActive(-1);
    setRunning(true); setMessage('Pip is following your code.');
    const tick = () => { if (!executeOne()) timer.current = setTimeout(tick, 550); };
    timer.current = setTimeout(tick, 100);
  };
  const stepOnce = () => {
    if (running || won) return;
    if (!program.length) { setMessage('Add an instruction before stepping.'); return; }
    if (!currentAttemptId.current) { attemptCounter.current += 1; currentAttemptId.current = `cc-${missionId}-${attemptCounter.current}`; }
    if (execution.current.step >= expandProgram(program).length) { setMessage('The program has reached its last block. Reset Pip to step through again.'); return; }
    executeOne();
  };
  const undo = () => {
    if (!history.length || running) return;
    currentAttemptId.current = '';
    const previous = history.at(-1); setHistory((items) => items.slice(0, -1)); setProgram(previous);
    execution.current = { step: 0, state: startRover(mission) }; setRover(execution.current.state); setActive(-1); setWon(false); setPendingCompletion(false); setMessage('Last code edit undone.'); writeDraft(previous, title);
  };
  const addGuidedBlock = () => {
    if (!nextGuidedBlock) return;
    const next = [...program, nextGuidedBlock];
    edit(next, `Added ${COMMAND_NAMES[nextGuidedBlock]}.`, true);
  };
  const toggleHelp = () => {
    if (helpUsed) return;
    setHelpUsed(true); writeDraft(program, title, true);
    setMessage(`${mission.tip}`);
  };
  const retryCompletion = () => completeMission();
  const retryDraft = () => writeDraft();
  const nextMission = MISSION_ORDER[missionOrderIndex + 1];
  const saveLegacySlot = () => {
    const ok = saveProject(player, 'code', { title, missionIndex: MISSIONS.findIndex((item) => item.id === missionId), program });
    setLegacySaved(ok ? { title, missionIndex: MISSIONS.findIndex((item) => item.id === missionId), program: [...program], version: 1 } : legacySaved);
    setStatus(ok ? 'Program saved to the original Code Cadets slot.' : 'Could not save to the original program slot. Your mission draft is separate.');
  };
  const openLegacySlot = () => {
    const saved = loadProject(player, 'code');
    if (!saved) { setStatus('No saved program is available in the original slot.'); return; }
    const target = saved.missionIndex >= 0 && saved.missionIndex <= 2 ? legacyMission(saved.missionIndex) : MISSIONS[saved.missionIndex] || null;
    if (!target || !validateProgram(saved.program) || typeof saved.title !== 'string' || saved.title.length > 60) { setStatus('The saved program has an unknown mission or invalid blocks. The saved slot was left unchanged.'); return; }
    chooseMission(target.id, { program: saved.program, title: saved.title, allowLocked: true });
    setStatus('Original saved program opened. The original slot was not changed.');
  };

  const showMissions = () => { setSelectedMission(missionId); setView('missions'); };
  const showOptions = () => { setOption('missions'); setView('options'); };
  const showEditor = () => { setSelectedCommand(mission.allowedBlocks[0]); setView('editor'); };
  const showBlockEditor = () => { setSelectedBlock(0); setBlockChange('remove'); setView('block'); };
  const backToRover = () => setView('rover');
  const available = (id) => isCodeMissionUnlocked(progress, id) || progress.completedMissionIds.includes(id);
  const options = [
    { id: 'missions', label: 'Choose a mission', action: showMissions },
    { id: 'saved', label: 'Saved programs', action: () => setView('saved') },
    ...(started && !won ? [
      { id: 'edit', label: 'Edit code', action: showEditor },
      { id: 'clue', label: 'Get a clue', action: () => { backToRover(); toggleHelp(); }, disabled: helpUsed },
      { id: 'step', label: 'Run one step', action: () => { backToRover(); stepOnce(); }, disabled: !program.length },
      { id: 'reset', label: 'Reset Pip', action: () => { backToRover(); reset(); } },
      { id: 'undo', label: 'Undo last change', action: () => { backToRover(); undo(); }, disabled: !history.length },
    ] : []),
    ...(hasPromptRecording && sound ? [{ id: 'hear', label: 'Hear the goal', action: () => { backToRover(); playPrompt(); } }] : []),
    ...(onToggleSound ? [{ id: 'sound', label: sound ? 'Turn sound off' : 'Turn sound on', action: () => { stopAudio(); onToggleSound(); backToRover(); } }] : []),
    ...(onBack ? [{ id: 'world', label: 'Back to Creative Lab', action: onBack }] : []),
  ];
  const chosenOption = options.find(item => item.id === option);
  const titleText = mission.title.replace(/^\d+ · /, '');
  const nextTitle = nextMission && MISSION_BY_ID[nextMission].title.replace(/^\d+ · /, '');
  const heading = {
    rover: !started ? 'Code Cadets' : won ? 'Mission complete!' : titleText,
    options: 'Options',
    missions: 'Choose a mission',
    editor: 'Edit code',
    block: 'Change a command',
    saved: 'Saved programs',
  }[view];

  const programList = program.length > 0 && <ol className="cc-command-list" aria-label="Pip’s commands">
    {program.map((op, index) => <li key={`${index}-${op}`} data-code-block={index + 1} aria-current={active === index ? 'step' : undefined}>{COMMAND_NAMES[op]}</li>)}
  </ol>;

  const nextActions = () => {
    if (!started) return <>
      <button type="button" className="cc-primary" onClick={() => setStarted(true)}>Start: {titleText}</button>
      <button type="button" onClick={showOptions}>Options</button>
      {onBack && <button type="button" onClick={onBack}>Back to Creative Lab</button>}
    </>;
    if (pendingCompletion || draftFailed) return <button type="button" className="cc-primary" ref={retryRef} onClick={pendingCompletion ? retryCompletion : retryDraft}>{pendingCompletion ? 'Retry saving mission' : 'Retry saving code'}</button>;
    if (running) return <button type="button" onClick={() => stop('Pip stopped. Run Pip to start again.')}>Stop Pip</button>;
    if (won) return <>
      {nextMission && available(nextMission)
        ? <button type="button" className="cc-primary" onClick={() => chooseMission(nextMission)}>Next: {nextTitle}</button>
        : <button type="button" className="cc-primary" onClick={showMissions}>Choose a mission</button>}
      <button type="button" onClick={showOptions}>Options</button>
    </>;
    return <>
      {nextGuidedBlock
        ? <button type="button" className="cc-primary" onClick={addGuidedBlock}>Add {COMMAND_NAMES[nextGuidedBlock]}</button>
        : program.length
          ? <button type="button" className="cc-primary" onClick={runProgram}>Run Pip</button>
          : <button type="button" className="cc-primary" onClick={showEditor}>Add a command</button>}
      {!nextGuidedBlock && program.length > 0 && <button type="button" onClick={showEditor}>Edit code</button>}
      <button type="button" onClick={showOptions}>Options</button>
    </>;
  };

  const missionBoard = <div className="cc-grid" role="img" aria-label={`Pip at column ${rover.x + 1}, row ${rover.y + 1}, facing ${DIRECTIONS[rover.direction]}. Flag at column ${mission.goal.x + 1}, row ${mission.goal.y + 1}.${mission.sample ? ` Rock sample at column ${mission.sample.x + 1}, row ${mission.sample.y + 1}.` : ''}${mission.walls.length ? ' Rock walls are blocked cells.' : ''}`}>
    {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
      const x = index % BOARD_SIZE, y = Math.floor(index / BOARD_SIZE), here = rover.x === x && rover.y === y;
      const goal = mission.goal.x === x && mission.goal.y === y, sample = mission.sample?.x === x && mission.sample?.y === y;
      const isWall = wallAt(x, y), startSquare = mission.start.x === x && mission.start.y === y;
      return <div key={index} className={`cc-square ${rover.trail.includes(`${x},${y}`) ? 'visited' : ''} ${isWall ? 'is-wall' : ''}`} data-rover-coordinate={`${String.fromCharCode(65 + x)}${BOARD_SIZE - y}`} aria-hidden="true">
        {startSquare && <span className="cc-tile-label">Start</span>}
        {goal && <span className="cc-flag">⚑</span>}
        {sample && !rover.collected && <span className="cc-sample">◆</span>}
        {isWall && <span className="cc-wall-label">Rock</span>}
        {here && <RoverArt className="rover-art" direction={rover.direction}/>}
      </div>;
    })}
  </div>;

  const applyBlockChange = () => {
    const next = [...program];
    const offset = blockChange === 'earlier' ? -1 : 1;
    if (blockChange === 'remove') next.splice(selectedBlock, 1);
    else [next[selectedBlock], next[selectedBlock + offset]] = [next[selectedBlock + offset], next[selectedBlock]];
    edit(next);
    backToRover();
  };

  return <section className="code-cadets" aria-labelledby="cc-heading" data-code-mission={missionId} data-code-running={running} data-code-saved={progress.completedMissionIds.includes(missionId)} data-code-phase={phase} data-code-view={view}>
    <header className="cc-heading">
      {started && view === 'rover' && <p>Code Cadets · Mission {missionOrderIndex + 1} of {MISSION_ORDER.length}</p>}
      <h1 id="cc-heading" ref={headingRef} tabIndex={-1}>{heading}</h1>
    </header>

    {view === 'rover' && (!started ? <div className="cc-intro">
      <RoverArt className="cc-intro-art"/>
      <p>Give Pip commands to reach the flag.</p>
      <div className="cc-actions">{nextActions()}</div>
    </div> : <div className="cc-play">
      <div className="cc-next">
        <p className="cc-goal">{won ? `${titleText} saved.` : mission.prompt}</p>
        <div className="cc-actions" aria-label="What to do next">{nextActions()}</div>
        {pendingCompletion || draftFailed
          ? <p className="cc-feedback" role="alert">{pendingCompletion ? message : status}</p>
          : <p className="cc-feedback" role="status">{won ? nextMission ? '' : 'All missions complete. Choose a mission to play it again.' : message || (missionId === 'first-route' ? 'Forward moves Pip one square in the direction of its arrow.' : '')}</p>}
        {won && progress.completedChapterIds.includes(mission.chapterId) && <p className="cc-feedback">{chapter.title} badge earned.</p>}
      </div>
      {missionBoard}
      <div className="cc-program">
        <h2>Pip’s commands</h2>
        {programList || <p>No commands yet.</p>}
      </div>
    </div>)}

    {view === 'options' && <div className="cc-form">
      <label><span id="cc-option-label">What would you like to do?</span>
        <select aria-labelledby="cc-option-label" value={option} onChange={event => setOption(event.target.value)}>{options.map(item => <option key={item.id} value={item.id} disabled={item.disabled}>{item.label}</option>)}</select>
      </label>
      <div className="cc-actions"><button type="button" className="cc-primary" onClick={chosenOption?.action} disabled={!chosenOption || chosenOption.disabled}>{chosenOption?.label || 'Continue'}</button><button type="button" onClick={backToRover}>Back</button></div>
    </div>}

    {view === 'missions' && <div className="cc-form">
      <label><span id="cc-mission-label">Mission</span>
        <select aria-labelledby="cc-mission-label" value={selectedMission} onChange={event => setSelectedMission(event.target.value)}>
          {CHAPTERS.map(group => <optgroup key={group.id} label={group.title}>
            {group.missionIds.map(id => <option key={id} value={id} disabled={!available(id)}>{MISSION_BY_ID[id].title}{progress.completedMissionIds.includes(id) ? ' · Complete' : available(id) ? '' : ' · Locked'}</option>)}
          </optgroup>)}
        </select>
      </label>
      <div className="cc-actions"><button type="button" className="cc-primary" disabled={!available(selectedMission)} onClick={() => chooseMission(selectedMission)}>Play mission</button><button type="button" onClick={backToRover}>Back</button></div>
    </div>}

    {view === 'editor' && <div className="cc-form">
      {programList}
      {program.length < MAX_PROGRAM_BLOCKS && <label><span id="cc-command-label">Choose a command</span>
        <select aria-labelledby="cc-command-label" value={selectedCommand} onChange={event => setSelectedCommand(event.target.value)}>{mission.allowedBlocks.map(op => <option key={op} value={op}>{COMMAND_NAMES[op]}</option>)}</select>
      </label>}
      <div className="cc-actions">
        {program.length < MAX_PROGRAM_BLOCKS && <button type="button" className="cc-primary" onClick={() => { edit([...program, selectedCommand], `Added ${COMMAND_NAMES[selectedCommand]}.`); if (program.length + 1 === MAX_PROGRAM_BLOCKS) backToRover(); }}>Add {COMMAND_NAMES[selectedCommand]}</button>}
        {program.length > 0 && <button type="button" onClick={showBlockEditor}>Change a command</button>}
        <button type="button" onClick={backToRover}>Back to map</button>
      </div>
      <p className="cc-feedback" role={draftFailed ? 'alert' : 'status'}>{draftFailed ? status : message}</p>
    </div>}

    {view === 'block' && <div className="cc-form">
      <label><span id="cc-block-label">Command</span>
        <select aria-labelledby="cc-block-label" value={selectedBlock} onChange={event => { setSelectedBlock(Number(event.target.value)); setBlockChange('remove'); }}>
          {program.map((op, index) => <option key={index} value={index}>{index + 1}. {COMMAND_NAMES[op]}</option>)}
        </select>
      </label>
      <label><span id="cc-change-label">Change</span>
        <select aria-labelledby="cc-change-label" value={blockChange} onChange={event => setBlockChange(event.target.value)}>
          <option value="remove">Remove</option>
          {selectedBlock > 0 && <option value="earlier">Move earlier</option>}
          {selectedBlock < program.length - 1 && <option value="later">Move later</option>}
        </select>
      </label>
      <div className="cc-actions"><button type="button" className="cc-primary" onClick={applyBlockChange}>Apply change</button><button type="button" onClick={showEditor}>Back to code</button></div>
    </div>}

    {view === 'saved' && <div className="cc-form">
      <p>Your mission draft saves automatically. Save a copy to keep this program in the original slot.</p>
      <label>Program name<input value={title} maxLength={60} onChange={event => { setTitle(event.target.value); writeDraft(program, event.target.value); }}/></label>
      <div className="cc-actions">
        {draftFailed ? <button type="button" className="cc-primary" ref={retryRef} onClick={retryDraft}>Retry saving code</button> : <>
          <button type="button" className="cc-primary" onClick={saveLegacySlot}>Save a copy</button>
          {legacySaved && <button type="button" onClick={openLegacySlot}>Open original saved program</button>}
        </>}
        <button type="button" onClick={backToRover}>Back</button>
      </div>
      <p className="cc-feedback" role="status">{status}</p>
    </div>}
  </section>;
}
