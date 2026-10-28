import amariCrew from '../assets/landing/amari-astronaut-robot.png';
import { useEffect, useRef, useState } from 'react';
import RoverArt from './RoverArt.jsx';
import { Volume2, VolumeX } from 'lucide-react';
import { BLOCKS, BOARD_SIZE, CHAPTERS, MAX_PROGRAM_BLOCKS, MISSION_BY_ID, MISSION_ORDER, MISSIONS, advanceRover, expandProgram, judgeRover, startRover, validateProgram } from './rover.js';
import { codeAttemptAttribution, completeCodeMission, isCodeMissionUnlocked, readCodeProgress, saveCodeDraft } from './codeProgress.js';
import { nextGuidedMissionInstruction } from './codeCadetsFlow.js';
import { loadProject, saveProject } from './storage.js';
import { getOfflineVoiceClip } from '../data/offlineVoice.js';
import './codeCadets.css';

const GLYPHS = { forward: '↑', left: '↶', right: '↷', repeat3: '⟳', collect: '◆' };
const legacyMission = (legacyIndex) => [MISSION_BY_ID['first-route'], MISSION_BY_ID['debug-turn'], MISSION_BY_ID['repeat-rescue']][legacyIndex] || null;
const safeInitialMission = (progress) => isCodeMissionUnlocked(progress, progress.currentMissionId) ? progress.currentMissionId : MISSION_ORDER[Math.min(progress.unlockedMissionIndex, MISSION_ORDER.length - 1)];

export default function CodeCadets({ player: playerProp, playerId = 'amari', registerDirty = () => {}, onCelebrate = () => {}, onGameEvent, onPhaseChange, playSfx = () => {}, soundOn = true, onToggleSound, cancelNarration = () => {} }) {
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
  const [message, setMessage] = useState('Pip is ready. Read the goal, then choose your blocks.');
  const [status, setStatus] = useState('Your mission draft saves automatically.');
  const [draftFailed, setDraftFailed] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [helpTip, setHelpTip] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [missionsOpen, setMissionsOpen] = useState(false);
  const [sound, setSound] = useState(soundOn);
  const [legacySaved, setLegacySaved] = useState(() => loadProject(player, 'code'));
  const [legacyUnranked, setLegacyUnranked] = useState(false);
  const timer = useRef(null);
  const audio = useRef(null);
  const cancelNarrationRef = useRef(cancelNarration);
  cancelNarrationRef.current = cancelNarration;
  const attemptCounter = useRef(0);
  const currentAttemptId = useRef('');
  const successRef = useRef(null);
  const execution = useRef({ step: 0, state: startRover(mission) });
  const instructions = expandProgram(program);
  const missionOrderIndex = MISSION_ORDER.indexOf(missionId);
  const chapter = CHAPTERS.find((item) => item.id === mission.chapterId);
  const missionIndexInChapter = chapter.missionIds.indexOf(missionId);
  const phase = !started ? 'intro' : won ? 'finish' : 'play';
  const guided = Array.isArray(mission.guidedBlocks);
  const nextGuidedBlock = guided ? nextGuidedMissionInstruction(program, mission.guidedBlocks) : null;
  const hasPromptRecording = Boolean(getOfflineVoiceClip(mission.prompt, 'en-US'));
  const wallAt = (x, y) => mission.walls?.some((wall) => wall.x === x && wall.y === y);

  useEffect(() => { onPhaseChange?.(phase); }, [phase, onPhaseChange]);
  useEffect(() => { if (pendingCompletion) { const retry = document.querySelector('.cc-retry-save'); retry?.focus(); retry?.scrollIntoView({ block: 'center' }); } }, [pendingCompletion]);
  useEffect(() => { if (won) { successRef.current?.focus(); successRef.current?.scrollIntoView?.({ block: 'nearest' }); } }, [won]);
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
    setLegacySaved(loadProject(player, 'code')); setLegacyUnranked(false); setStarted(false); setRunning(false); setWon(false); setPendingCompletion(false); setHistory([]); setActive(-1); setHelpTip(false); setToolsOpen(false); setMissionsOpen(false); setDirty(false); setDraftFailed(false);
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
  const edit = (nextProgram, feedback = 'Code changed. Run it to test your program.', usedGuided = guidedUsed) => {
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
    setMissionsOpen(false);
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
    setActive(-1); setWon(false); setPendingCompletion(false); setMessage(nextMission.prompt); setHelpTip(false); setStarted(true); setToolsOpen(false);
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
    setPendingCompletion(false); setDraftFailed(false); setDirty(false); setToolsOpen(false); setStatus('Mission and draft saved.'); setWon(true);
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
    if (!program.length) { setMessage('Add an instruction first. The Run button stays here after you add a block.'); return; }
    stop(); stopAudio(); setToolsOpen(false); setWon(false); setPendingCompletion(false);
    attemptCounter.current += 1; currentAttemptId.current = `cc-${missionId}-${attemptCounter.current}`;
    execution.current = { step: 0, state: startRover(mission) }; setRover(execution.current.state); setActive(-1);
    setRunning(true); setMessage('Run started at the base. Pip follows the same blocks shown in the code list.');
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
    edit(next, `Added ${BLOCKS[nextGuidedBlock]}. Read the next goal step or edit the code yourself.`, true);
  };
  const toggleHelp = () => {
    if (helpUsed) return;
    setHelpUsed(true); setHelpTip(true); writeDraft(program, title, true);
    setMessage(`${mission.tip} Help was used for this mission.`);
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

  if (!started) return <section className="activity-welcome code-cadets-welcome" aria-labelledby="cc-welcome-title">
    <div className="welcome-scene"><RoverArt/><span className="orbit-dot" aria-hidden="true">⚑</span></div>
    <p className="eyebrow">Your first coding adventure</p><h1 id="cc-welcome-title">Meet Pip, your Mars rover!</h1>
    <p>A program is a list of instructions. Build, test, and improve it. The three chapters move from sequences to debugging and Repeat blocks.</p>
    <div className="mini-demo"><span>Forward</span><span aria-hidden="true">→</span><span>Move one square</span></div>
    <button className="primary start-button" onClick={() => { setStarted(true); setToolsOpen(false); }}>Start {chapter.title} · {mission.title} →</button>
    {legacySaved && <button className="cc-open-saved" onClick={openLegacySlot}>Open original saved program</button>}
    <p className="quiet">No typing needed. Add blocks, then Run or Step through them. Each child's mission drafts save separately.</p>
  </section>;

  return <section className="code-cadets" aria-labelledby="cc-heading" data-code-mission={missionId} data-code-running={running ? 'true' : 'false'} data-code-saved={progress.completedMissionIds.includes(missionId) ? 'true' : 'false'} data-code-phase={phase}>
    <header className="cc-header"><img src={amariCrew} alt="Amari the astronaut"/><div><p className="eyebrow">Think · Build · Test · Improve</p><h1 id="cc-heading">Code Cadets</h1><div className="cc-progress" aria-label={`${chapter.title}, mission ${missionIndexInChapter + 1} of 4`}>{chapter.title} · {missionIndexInChapter + 1}/4</div></div>
      {typeof onToggleSound === 'function' && <button type="button" aria-label={sound ? 'Turn sound off' : 'Turn sound on'} onClick={() => { stopAudio(); onToggleSound(); }} className="cc-sound">{sound ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}</button>}
    </header>
    <details className="cc-mission-picker" open={missionsOpen} onToggle={(event) => setMissionsOpen(event.currentTarget.open)}>
      <summary>Choose a mission · {chapter.title} {missionIndexInChapter + 1} of 4</summary>
      <nav className="cc-mission-nav" aria-label="Coding missions">{CHAPTERS.map((group) => <section key={group.id} className="cc-chapter-nav"><h2>{group.title}<span>{progress.completedChapterIds.includes(group.id) ? ' · Badge earned' : ''}</span></h2><div>{group.missionIds.map((id) => { const item = MISSION_BY_ID[id]; const completed = progress.completedMissionIds.includes(id); const unlocked = isCodeMissionUnlocked(progress, id) || completed; return <button key={id} aria-current={missionId === id ? 'step' : undefined} disabled={running || !unlocked} onClick={() => chooseMission(id)}>{completed ? '✓ ' : ''}{item.title}</button>; })}</div></section>)}</nav>
    </details>
    <div className={`cc-coach ${won ? 'is-success' : ''}`}><RoverArt/><div><p className="eyebrow">{won ? 'Saved mission complete' : `${mission.skill} · ${chapter.title}`}</p><h2>{mission.title}</h2><p>{mission.prompt}</p></div></div>

    {helpTip && <p className="cc-tip" role="note">{mission.tip} Help was used and is saved with this mission draft.</p>}

    <div className="cc-game">
      <div className="cc-card cc-board-card">
        <div className="cc-card-heading"><span className="cc-step-number">1</span><div><h2>Look at Pip’s map</h2><p>{BOARD_SIZE} by {BOARD_SIZE} rover grid · row 1 is at the top</p></div></div>
        <p className="cc-board-goal">{pendingCompletion ? 'Pip reached the goal. Retry saving before you continue.' : 'Run starts at the base. Step follows one action.'}</p>
        <div className="cc-main-actions" aria-label="Run the rover program">
          {guided && nextGuidedBlock && <button className="cc-primary" onClick={addGuidedBlock} disabled={running}>Add {BLOCKS[nextGuidedBlock]} · {program.length + 1}/{mission.guidedBlocks.length}</button>}
          <button className="cc-primary" onClick={runProgram} disabled={running}>{running ? 'Pip is running…' : '▶ Run Pip'}</button>
          {running ? <button className="cc-stop" onClick={() => stop('Stopped. Pip is safe here. Your code is still available; Run restarts from the base.')}>Stop Pip</button> : <button onClick={stepOnce} disabled={!program.length}>Step once</button>}
          {!won && <button onClick={() => setToolsOpen((open) => !open)} aria-expanded={toolsOpen}>Edit code · {program.length} blocks</button>}
        </div>
        <div className="cc-grid" role="img" aria-label={`Pip at column ${rover.x + 1}, row ${rover.y + 1}, facing ${['north','east','south','west'][rover.direction]}. Flag at column ${mission.goal.x + 1}, row ${mission.goal.y + 1}.${mission.sample ? ` Rock sample at column ${mission.sample.x + 1}, row ${mission.sample.y + 1}.` : ''} Rock walls are blocked cells.`}>
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
            const x = index % BOARD_SIZE, y = Math.floor(index / BOARD_SIZE), here = rover.x === x && rover.y === y;
            const goal = mission.goal.x === x && mission.goal.y === y, sample = mission.sample?.x === x && mission.sample?.y === y;
            const isWall = wallAt(x, y), startSquare = mission.start.x === x && mission.start.y === y;
            return <div key={`${x}-${y}`} className={`cc-square ${rover.trail.includes(`${x},${y}`) ? 'visited' : ''} ${isWall ? 'is-wall' : ''}`} data-rover-coordinate={`${String.fromCharCode(65 + x)}${BOARD_SIZE - y}`} aria-hidden="true">
              <span className="cc-coordinate">{String.fromCharCode(65 + x)}{BOARD_SIZE - y}</span>
              {startSquare && <span className="cc-tile-label">Start</span>}{goal && <span className="cc-flag">⚑</span>}{sample && !rover.collected && <span className="cc-sample">◆</span>}
              {isWall && <span className="cc-wall-label">ROCK</span>}{here && <RoverArt className="rover-art" direction={rover.direction}/>}
            </div>;
          })}
        </div>
        <p className="cc-map-key"><span>Green = Pip’s travelled path</span><span>⚑ Flag</span>{mission.sample && <span>◆ Rock sample</span>}{mission.walls.length > 0 && <span>▩ Wall (blocked)</span>}</p>
        <p className="cc-facing"><strong>{['↑','→','↓','←'][rover.direction]} Pip faces {['North','East','South','West'][rover.direction]}.</strong> Forward moves one square in this direction.</p>
        <p className="cc-feedback" role="status" aria-live="polite">{message}</p>
        {pendingCompletion && <button className="cc-primary cc-retry-save" onClick={retryCompletion}>Retry save mission</button>}
        {draftFailed && <button className="cc-retry-save" onClick={retryDraft}>Retry draft save</button>}
        {won && <div className="cc-success" role="status" tabIndex="-1" ref={successRef}><strong>{mission.title} saved.</strong>{progress.completedChapterIds.includes(mission.chapterId) && <span>{chapter.title} badge earned.</span>}{nextMission && isCodeMissionUnlocked(progress, nextMission) && <button className="cc-primary" onClick={() => chooseMission(nextMission)}>Next mission →</button>}{!nextMission && <span>All three chapters are complete. Replay any unlocked mission from Choose a mission.</span>}</div>}
        <p className="cc-save-status" role="status">{status}{dirty && ' · Unsaved write needs retry'}</p>
        {hasPromptRecording ? <button className="cc-clue" onClick={playPrompt} disabled={!sound}>Replay recorded mission prompt</button> : <p className="cc-readable-only">Read the goal, follow Pip’s arrow, then test your blocks.</p>}
      </div>

      <div className="cc-card cc-code-card">
        <div className="cc-card-heading"><span className="cc-step-number">2</span><div><h2>Pip’s code</h2><p>Run and Step follow these same blocks from top to bottom.</p></div></div>
        {program.length ? <ol className="cc-code-list" aria-label="Pip's instruction sequence">{program.map((op, index) => <li key={`${index}-${op}`} data-code-block={index + 1} className={active === index ? 'is-active' : ''}><span className={`cc-code-glyph op-${op}`} aria-hidden="true">{GLYPHS[op]}</span><span><strong>{index + 1}. {BLOCKS[op]}</strong>{op === 'forward' && <small>Move ahead one square</small>}{op === 'repeat3' && <small>Do Forward 3 times · one block</small>}{op === 'right' && <small>Turn Pip to the right</small>}{op === 'left' && <small>Turn Pip to the left</small>}{op === 'collect' && <small>Collect only on the diamond square</small>}</span></li>)}</ol> : <div className="cc-empty-code"><span aria-hidden="true">＋</span><p>Your first instruction will appear here. Use the guided action or open the code editor.</p></div>}
        {instructions.length > program.length && <p className="cc-facing">Expanded actions: {instructions.length}. Repeat instructions point back to their single highlighted block.</p>}
      </div>
    </div>

    <details className="cc-tools" open={toolsOpen} onToggle={(event) => setToolsOpen(event.currentTarget.open)}>
      <summary>Block editor and original saved-program slot</summary>
      <div className="cc-tools-content">
        <section aria-labelledby="cc-edit-heading"><h2 id="cc-edit-heading">Edit the code yourself</h2><p>Add, move, or remove a block. The board and code remain visible while you edit.</p>
          <div className="cc-tool-buttons"><button onClick={() => reset()} disabled={running}>Reset Pip</button><button onClick={undo} disabled={running || !history.length}>Undo edit</button><button onClick={toggleHelp} disabled={helpUsed || won}>{helpUsed ? 'One clue used' : 'Use one clue'}</button>{draftFailed && <button onClick={retryDraft}>Retry draft save</button>}</div>
          <div className="cc-palette">{mission.allowedBlocks.map((op) => <button key={op} className={`cc-block op-${op}`} onClick={() => edit([...program, op])} disabled={running || program.length >= MAX_PROGRAM_BLOCKS}><span aria-hidden="true">{GLYPHS[op]}</span>Add {BLOCKS[op]}</button>)}</div>
          <div className="cc-edit-list">{program.map((op, index) => <div key={`${index}-${op}`}><strong>Block {index + 1}: {BLOCKS[op]}</strong><span><button aria-label={`Move block ${index + 1} earlier`} disabled={running || index === 0} onClick={() => { const next = [...program]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; edit(next); }}>Move earlier</button><button aria-label={`Move block ${index + 1} later`} disabled={running || index === program.length - 1} onClick={() => { const next = [...program]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; edit(next); }}>Move later</button><button aria-label={`Remove block ${index + 1}`} disabled={running} onClick={() => edit(program.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></span></div>)}</div>
          <div className="cc-tool-buttons"><button onClick={() => edit([])} disabled={running || !program.length}>Clear all code</button><button onClick={() => { setTitle('My rover mission'); writeDraft(program, 'My rover mission'); }}>Reset program name</button></div>
        </section>
        <section aria-labelledby="cc-save-heading"><h2 id="cc-save-heading">Program name and original slot</h2><label className="cc-title-field">Program name<input value={title} maxLength={60} onChange={(event) => { setTitle(event.target.value); writeDraft(program, event.target.value); }}/></label>
          <div className="cc-tool-buttons"><button onClick={saveLegacySlot}>Save to original slot</button><button onClick={openLegacySlot}>Open original saved program</button></div><p className="cc-save-status" role="status">Mission drafts are per-child and save automatically. The original slot changes only when you choose Save to original slot.</p>
        </section>
      </div>
    </details>
  </section>;
}
