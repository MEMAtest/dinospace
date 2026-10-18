import amariCrew from '../assets/landing/amari-astronaut-robot.png';
import RoverArt from './RoverArt.jsx';
import { useEffect, useRef, useState } from 'react';
import { MISSIONS, BLOCKS, expandProgram, startRover, advanceRover, judgeRover } from './rover.js';
import { loadProject, saveProject } from './storage.js';
import { nextRepeatMissionInstruction, repeatMissionStage, replaceForwardTriple } from './codeCadetsFlow.js';
import './codeCadets.css';

const DIRECTIONS = ['North', 'East', 'South', 'West'];
const ARROWS = ['↑', '→', '↓', '←'];
const GLYPHS = { forward: '↑', left: '↶', right: '↷', repeat3: '⟳', collect: '◆' };

export default function CodeCadets({ player, registerDirty }) {
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [repeatUnlocked, setRepeatUnlocked] = useState(false);
  const [debugTried, setDebugTried] = useState(false);
  const saved = useRef(loadProject(player, 'code'));
  const [missionIndex, setMissionIndex] = useState(0);
  const mission = MISSIONS[missionIndex];
  const [program, setProgram] = useState(MISSIONS[0].initial);
  const [history, setHistory] = useState([]);
  const [rover, setRover] = useState(() => startRover(MISSIONS[0]));
  const [running, setRunning] = useState(false);
  const [active, setActive] = useState(-1);
  const [message, setMessage] = useState('Pip is ready at the starting square.');
  const [title, setTitle] = useState('My rover mission');
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState(saved.current ? 'A saved program is ready to open.' : 'Not saved yet.');
  const [tip, setTip] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const timer = useRef(null);
  const execution = useRef({ step: 0, state: startRover(mission) });

  const stop = () => {
    clearTimeout(timer.current);
    setRunning(false);
  };

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    registerDirty(() => dirty);
    return () => registerDirty(null);
  }, [dirty, registerDirty]);
  useEffect(() => {
    const onBeforeUnload = event => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const reset = () => {
    stop();
    const state = startRover(mission);
    execution.current = { step: 0, state };
    setRover(state);
    setActive(-1);
  };

  const edit = next => {
    reset();
    setHistory(items => [...items.slice(-49), program]);
    setProgram(next);
    setDirty(true);
    setWon(false);
    setMessage('Code changed. Run it to see what Pip does.');
  };

  const selectMission = (index, { keepDraft = false } = {}) => {
    if (index === missionIndex) return;
    if (dirty && !keepDraft && !window.confirm('Switch missions and discard the unsaved code?')) return;
    stop();
    const nextMission = MISSIONS[index];
    const state = startRover(nextMission);
    setMissionIndex(index);
    setProgram([...nextMission.initial]);
    setRover(state);
    execution.current = { step: 0, state };
    setActive(-1);
    setHistory([]);
    setDirty(false);
    setWon(false);
    setRepeatUnlocked(false);
    setDebugTried(false);
    setTip(false);
    setMessage(index === 0 ? 'Pip is ready at the starting square.' : 'Follow the mission steps to help Pip.');
    setToolsOpen(false);
  };

  const advanceMission = () => {
    const next = missionIndex + 1;
    if (next >= MISSIONS.length) return;
    selectMission(next, { keepDraft: true });
  };

  const finishRun = state => {
    const outcome = judgeRover(state, mission, program);
    if (mission.repeat && !program.includes('repeat3') && state.x === mission.goal.x && state.y === mission.goal.y && state.collected) setRepeatUnlocked(true);
    if (mission.id === 'debug-turn') setDebugTried(true);
    setWon(outcome.complete);
    setMessage(mission.id === 'debug-turn' && !outcome.complete
      ? 'Pip turned east before reaching the corner and stopped below the flag. Change block 2 to Forward, then put Turn Right at block 3.'
      : outcome.message);
    setRunning(false);
  };

  const executeOne = () => {
    const instructions = expandProgram(program);
    const current = execution.current;
    if (current.step >= instructions.length) return true;
    const instruction = instructions[current.step];
    setActive(instruction.block);
    const result = advanceRover(current.state, instruction, mission);
    execution.current = { step: current.step + 1, state: result.state };
    setRover(result.state);
    if (result.error) {
      setMessage(result.error);
      setRunning(false);
      return true;
    }
    if (execution.current.step === instructions.length) {
      finishRun(result.state);
      return true;
    }
    setMessage(`Pip is following block ${instruction.block + 1}: ${BLOCKS[program[instruction.block]]}.`);
    return false;
  };

  const run = () => {
    if (!program.length) {
      setMessage('Add an instruction first.');
      return;
    }
    reset();
    setWon(false);
    if (window.innerWidth < 800) document.querySelector('.cc-board-card')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    setRunning(true);
    const tick = () => {
      if (!executeOne()) timer.current = setTimeout(tick, 650);
    };
    timer.current = setTimeout(tick, 100);
  };

  const step = () => {
    if (!program.length) return;
    const instructionCount = expandProgram(program).length;
    if (execution.current.step >= instructionCount) {
      const state = startRover(mission);
      execution.current = { step: 0, state };
      setRover(state);
    }
    executeOne();
  };

  const save = () => {
    const ok = saveProject(player, 'code', { title, missionIndex, program });
    setStatus(ok ? 'Program saved on this device.' : 'Could not save. Keep this page open and try again.');
    if (ok) {
      saved.current = { title, missionIndex, program };
      setDirty(false);
    }
    return ok;
  };

  const open = () => {
    const value = loadProject(player, 'code');
    if (!value) {
      setStatus('No saved program for this explorer.');
      return;
    }
    if (dirty && !window.confirm('Open saved code and replace these unsaved changes?')) return;
    try {
      expandProgram(value.program);
      if (!MISSIONS[value.missionIndex]) throw Error('Unknown mission');
    } catch {
      setStatus('This saved program could not be opened.');
      return;
    }
    stop();
    const nextMission = MISSIONS[value.missionIndex];
    const state = startRover(nextMission);
    setTitle(value.title);
    setMissionIndex(value.missionIndex);
    setProgram(value.program);
    setHistory([]);
    execution.current = { step: 0, state };
    setRover(state);
    setActive(-1);
    setDirty(false);
    setStarted(true);
    setWon(false);
    setRepeatUnlocked(value.missionIndex === 2 && value.program.includes('repeat3'));
    setDebugTried(value.missionIndex === 1 && value.program[1] === 'forward');
    setMessage('Your saved code is ready to run.');
    setStatus('Saved program opened.');
    setToolsOpen(false);
  };

  const runFirstMission = () => {
    if (program.length < 3) {
      edit([...program, 'forward']);
      setMessage(`Forward added. ${Math.max(0, 2 - program.length)} more ${program.length === 1 ? 'move' : 'moves'} to go.`);
      return;
    }
    run();
  };

  const fixEarlyTurn = () => {
    const corrected = [...program];
    corrected[1] = 'forward';
    edit(corrected);
    setMessage('Block 2 now moves ahead. Pip still faces north.');
  };

  const addCornerTurn = () => {
    const corrected = [...program.slice(0, 2), 'right', ...program.slice(2)];
    edit(corrected);
    setMessage('Turn Right is now at the corner, after two Forward moves.');
  };

  const addMissionThreeStep = () => {
    const next = nextRepeatMissionInstruction(program);
    if (next) {
      edit([...program, next]);
      const words = { forward: 'Forward', right: 'Turn Right', collect: 'Collect' };
      setMessage(`${words[next]} added. Look at the code list to see the next step.`);
    }
  };

  const replaceFirstThreeWithRepeat = () => {
    const nextProgram = replaceForwardTriple(program);
    if (!nextProgram) return;
    edit(nextProgram);
    setMessage('Those three Forward moves are now one Repeat block. Replace the next three too, or run the shorter code.');
  };

  const undo = () => {
    if (!history.length) return;
    reset();
    setProgram(history.at(-1));
    setHistory(items => items.slice(0, -1));
    setDirty(true);
    setWon(false);
    setMessage('Last code change undone.');
  };

  const direction = DIRECTIONS[rover.direction];
  const availableBlocks = missionIndex === 0 ? ['forward'] : missionIndex === 1 ? ['forward', 'left', 'right'] : Object.keys(BLOCKS);
  const canSwap = missionIndex === 1 && program.length >= 4 && program[0] === 'forward';
  const missionTwoStep = canSwap
    ? !debugTried ? 'try' : program[1] !== 'forward' ? 'forward' : program[2] !== 'right' ? 'turn' : 'run'
    : 'run';
  const missionThreeStage = missionIndex === 2 ? repeatMissionStage(program, repeatUnlocked) : null;
  const missionThreeNeedsRepeat = missionThreeStage?.stage === 'replace';
  const missionThreeAction = missionThreeStage?.stage === 'build' ? missionThreeStage.next : null;
  const firstMissionReady = program.length >= 3;

  const guide = missionIndex === 0
    ? firstMissionReady ? program.length === 3 ? 'Your three instructions are ready to test.' : 'Your program is ready to test.' : 'Help Pip write three moves.'
    : missionIndex === 1
      ? missionTwoStep === 'try' ? 'Watch where Pip turns.' : missionTwoStep === 'forward' ? 'The turn is too early.' : missionTwoStep === 'turn' ? 'Pip has reached the corner.' : 'The corrected code is ready.'
      : missionThreeNeedsRepeat ? 'Can you shorten the code?' : missionThreeAction ? 'Build a path to the sample.' : 'Your path is ready to test.';

  if (!started) return <section className="activity-welcome code-cadets-welcome" aria-labelledby="cc-welcome-title">
    <div className="welcome-scene"><RoverArt/><span className="orbit-dot" aria-hidden="true">⚑</span></div>
    <p className="eyebrow">Your first coding adventure</p>
    <h1 id="cc-welcome-title">Meet Pip, your Mars rover!</h1>
    <p>A program is a list of instructions. You choose the instructions and Pip follows them.</p>
    <div className="mini-demo"><span>Forward</span><span aria-hidden="true">→</span><span>Move one square</span></div>
    <button className="primary start-button" onClick={() => setStarted(true)}>Start my first mission →</button>
    {saved.current && <button className="cc-open-saved" onClick={open}>Open saved program</button>}
    <p className="quiet">No typing needed. We’ll begin with one kind of block.</p>
  </section>;

  return <section className="code-cadets" aria-labelledby="cc-heading">
    <header className="cc-header">
      <img src={amariCrew} alt="Amari the astronaut"/>
      <div><p className="eyebrow">Think · Build · Test · Improve</p><h1 id="cc-heading">Code Cadets</h1></div>
      <div className="cc-progress" aria-label={`Mission ${missionIndex + 1} of ${MISSIONS.length}`}>Mission {missionIndex + 1} of {MISSIONS.length}</div>
    </header>

    <div className={`cc-coach ${won ? 'is-success' : ''}`}>
      <RoverArt/>
      <div><p className="eyebrow">{won ? 'Mission complete' : 'Pip’s next step'}</p><h2>{guide}</h2></div>
    </div>

    {!won && <div className="cc-next-action">
      <p className="eyebrow">{missionIndex === 0 && firstMissionReady || missionIndex === 1 && missionTwoStep === 'run' || missionIndex === 2 && !missionThreeAction && !missionThreeNeedsRepeat ? 'Ready to test' : 'Do this next'}</p>
      {missionIndex === 0 && <button className="cc-primary cc-main-action" onClick={runFirstMission} disabled={running}>
        {firstMissionReady ? `▶ Run ${program.length === 3 ? 'my first program' : 'my program'}` : `↑ Add Forward · ${program.length + 1} of 3`}
      </button>}
      {missionIndex === 1 && <>
        {missionTwoStep === 'try' && <><p>Run this supplied code and watch where Pip turns.</p><button className="cc-primary cc-main-action" onClick={run} disabled={running}>▶ Try the supplied code</button></>}
        {missionTwoStep === 'forward' && <><p>Block 2 turns Pip before the corner. Make it a Forward move first.</p><button className="cc-primary cc-main-action" disabled={running} onClick={fixEarlyTurn}>Change block 2 to Forward</button></>}
        {missionTwoStep === 'turn' && <><p>Now Pip has moved two squares north. Put the turn at block 3.</p><button className="cc-primary cc-main-action" disabled={running} onClick={addCornerTurn}>Add Turn Right at block 3</button></>}
        {missionTwoStep === 'run' && <><p>Forward keeps Pip moving north. Turning changes the arrow, not Pip’s square.</p><button className="cc-primary cc-main-action" onClick={run} disabled={running}>▶ Run corrected program</button></>}
      </>}
      {missionIndex === 2 && <>
        {missionThreeAction && <><p>{missionThreeAction === 'forward' ? 'Tap Forward for the next square.' : missionThreeAction === 'right' ? 'At the corner, turn Pip right.' : 'Pip is on the diamond. Collect the sample.'}</p><button className="cc-primary cc-main-action" onClick={addMissionThreeStep} disabled={running}>{missionThreeAction === 'forward' ? `↑ Add Forward · ${program.filter(op => op === 'forward').length + 1} of 6` : missionThreeAction === 'right' ? '↷ Add Turn Right' : '◆ Add Collect'}</button></>}
        {missionThreeNeedsRepeat && <><p>Three Forward blocks in a row can become one Repeat 3 × Forward block. Keep the same route.</p><button className="cc-primary cc-main-action" onClick={replaceFirstThreeWithRepeat} disabled={running}>Replace 3 Forward moves with Repeat</button></>}
        {!missionThreeAction && !missionThreeNeedsRepeat && <><p>Run the path. Pip will move, turn at the corner, and collect the diamond.</p><button className="cc-primary cc-main-action" onClick={run} disabled={running}>▶ Run my program</button></>}
      </>}
      {missionIndex === 2 && missionThreeNeedsRepeat && <button className="cc-secondary cc-run-shorter" onClick={run} disabled={running}>▶ Run my code again</button>}
      {running && <button className="cc-secondary cc-stop" onClick={() => { stop(); setMessage('Stopped. Your code is still here. Run again to restart at the base.'); }}>Stop Pip</button>}
    </div>}

    {won && <div className="cc-success" role="status"><strong>{missionIndex === 0 ? 'Pip reached the flag!' : missionIndex === 1 ? 'You fixed Pip’s route!' : 'Pip collected the sample!'}</strong>
      {missionIndex < MISSIONS.length - 1 && <button className="cc-primary" onClick={advanceMission}>Next mission →</button>}
      {missionIndex === MISSIONS.length - 1 && <><span>You finished all three missions!</span><button className="cc-primary" onClick={run}>Run this mission again</button></>}
    </div>}

    <div className="cc-game">
      <div className="cc-card cc-board-card">
        <div className="cc-card-heading"><span className="cc-step-number">1</span><div><h2>Look at Pip’s map</h2></div></div>
        <div className="cc-grid" role="img" aria-label={`Rover at column ${rover.x + 1}, row ${rover.y + 1}, facing ${direction}. Flag at column ${mission.goal.x + 1}, row ${mission.goal.y + 1}.`}>
          {Array.from({ length: 25 }, (_, i) => {
            const x = i % 5;
            const y = Math.floor(i / 5);
            const here = rover.x === x && rover.y === y;
            const goal = mission.goal.x === x && mission.goal.y === y;
            const sample = mission.sample?.x === x && mission.sample?.y === y;
            const route = missionIndex === 0 && y === 2 && x > 0 && x <= 3;
            return <div key={i} className={`cc-square ${rover.trail.includes(`${x},${y}`) ? 'visited' : ''} ${route ? 'route' : ''}`} aria-hidden="true">
              {goal && <span className="cc-flag">⚑</span>}{sample && !rover.collected && <span className="cc-sample">◆</span>}{here && <RoverArt className="rover-art" direction={rover.direction}/>}
            </div>;
          })}
        </div>
        <p className="cc-map-key"><span>⚑ Finish flag</span>{mission.sample && <span>◆ Rock sample</span>}</p>
        <p className="cc-facing"><strong>{ARROWS[rover.direction]} Pip faces {direction}.</strong> Forward moves one square in this direction.</p>
        <p className="cc-feedback" role="status" aria-live="polite">{message}</p>
        <button className="cc-clue" onClick={() => setTip(open => !open)} aria-expanded={tip}>{tip ? 'Hide clue' : 'Need a clue?'}</button>
        {tip && <p className="cc-tip">{mission.tip}</p>}
      </div>

      <div className="cc-card cc-code-card">
        <div className="cc-card-heading"><span className="cc-step-number">2</span><div><h2>Pip’s code</h2><p>Pip follows the blocks from top to bottom.</p></div></div>
        {program.length ? <ol className="cc-code-list" aria-label="Pip's instruction sequence">
          {program.map((op, i) => <li key={`${i}-${op}`} className={active === i ? 'is-active' : ''}>
            <span className={`cc-code-glyph ${`op-${op}`}`} aria-hidden="true">{GLYPHS[op]}</span>
            <span><strong>{i + 1}. {BLOCKS[op]}</strong>{op === 'forward' && <small>Move ahead one square</small>}{op === 'repeat3' && <small>Do Forward 3 times</small>}{op === 'right' && <small>Turn Pip to the right</small>}</span>
          </li>)}
        </ol> : <div className="cc-empty-code"><span aria-hidden="true">＋</span><p>Your first instruction will appear here.</p></div>}

      </div>
    </div>

    <details className="cc-tools" open={toolsOpen} onToggle={event => setToolsOpen(event.currentTarget.open)}>
      <summary>More tools, choose a mission, save or open code</summary>
      <div className="cc-tools-content">
        <section aria-labelledby="cc-edit-heading"><h2 id="cc-edit-heading">Edit the code yourself</h2><p>Add, move, or remove a block. These tools are here when you want them.</p>
          <div className="cc-palette">{availableBlocks.map(op => <button key={op} className={`cc-block op-${op}`} onClick={() => edit([...program, op])} disabled={running || program.length >= 24}><span aria-hidden="true">{GLYPHS[op]}</span>Add {BLOCKS[op]}</button>)}</div>
          <div className="cc-edit-list">{program.map((op, i) => <div key={`${i}-${op}`}><strong>Block {i + 1}: {BLOCKS[op]}</strong><span>
            <button aria-label={`Move block ${i + 1} earlier`} disabled={running || i === 0} onClick={() => { const next = [...program]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; edit(next); }}>Move earlier</button>
            <button aria-label={`Move block ${i + 1} later`} disabled={running || i === program.length - 1} onClick={() => { const next = [...program]; [next[i + 1], next[i]] = [next[i], next[i + 1]]; edit(next); }}>Move later</button>
            <button aria-label={`Remove block ${i + 1}`} disabled={running} onClick={() => edit(program.filter((_, j) => j !== i))}>Remove</button>
          </span></div>)}</div>
          <div className="cc-tool-buttons"><button onClick={undo} disabled={running || !history.length}>Undo edit</button><button onClick={() => edit([])} disabled={running || !program.length}>Clear all code</button><button onClick={step} disabled={running || !program.length}>Step once</button><button onClick={() => { reset(); setMessage('Pip is back at the start. Your code is unchanged.'); }}>Reset Pip</button></div>
        </section>
        <section aria-labelledby="cc-choose-heading"><h2 id="cc-choose-heading">Choose a mission</h2><div className="cc-mission-choices">{MISSIONS.map((item, i) => <button key={item.id} aria-current={missionIndex === i ? 'step' : undefined} onClick={() => selectMission(i)}>{item.title}</button>)}</div></section>
        <section aria-labelledby="cc-save-heading"><h2 id="cc-save-heading">Save or open your code</h2><label className="cc-title-field">Program name<input value={title} maxLength={60} onChange={event => { setTitle(event.target.value); setDirty(true); }}/></label>
          <div className="cc-tool-buttons"><button onClick={save}>Save program</button><button onClick={open}>Open saved program</button></div><p className="cc-save-status" role="status">{status}{dirty ? ' · Unsaved changes' : ''}</p>
        </section>
      </div>
    </details>
  </section>;
}
