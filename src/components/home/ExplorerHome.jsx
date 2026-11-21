import { useEffect, useRef, useState } from 'react';
import { LEARNING_WORLDS } from '../../data/learningWorlds.js';
import './discoveryVisuals.css';

const ExplorerHome = ({
  player, points, challenge, challengeProgress, challengeCompleted, practiceGames, quickGames,
  favouriteGames, onLaunch, onOpenWorld, onOpenPage, onSwitchPlayer, soundOn, onToggleSound,
}) => {
  const [view, setView] = useState('home');
  const [worldId, setWorldId] = useState(LEARNING_WORLDS[0].id);
  const [option, setOption] = useState('stickers');
  const heading = useRef(null);
  const world = LEARNING_WORLDS.find(item => item.id === worldId);
  const featured = quickGames[0];
  const dailyOption = { id: 'daily', label: 'Play today’s challenge', action: () => onLaunch(challenge.game, 'launch') };
  const general = [
    { id: 'stickers', label: 'Stickers', action: () => onOpenPage('stickers') },
    { id: 'grownups', label: 'Grown-ups', action: () => onOpenPage('grownups') },
    { id: 'switch', label: 'Switch player', action: onSwitchPlayer },
    { id: 'sound', label: soundOn ? 'Turn sound off' : 'Turn sound on', action: onToggleSound },
    dailyOption,
  ];
  const practice = practiceGames.map(game => ({ id: `practice-${game.id}`, label: game.title, action: () => onLaunch(game.id) }));
  const recent = quickGames.map(game => ({ id: `again-${game.id}`, label: game.title + (favouriteGames.includes(game.id) ? ' ★' : ''), action: () => onLaunch(game.id) }));
  const chosen = [...general, ...practice, ...recent].find(item => item.id === option);

  useEffect(() => { heading.current?.focus(); }, [view]);

  return <main className="explorer-simple">
    <div className="explorer-simple-body">
      {view === 'home' && <>
        <p className="explorer-simple-meta">{points} stars</p>
        <h1 tabIndex={-1} ref={heading}>Hi {player.name}!</h1>
        <p>Choose a world to find a game.</p>
        <div className="explorer-simple-actions">
          <button type="button" className="explorer-primary" onClick={() => setView('worlds')}>Choose a world</button>
          <button type="button" onClick={featured ? () => onLaunch(featured.id) : dailyOption.action}>{featured ? `Play ${featured.title} again` : dailyOption.label}</button>
          <button type="button" onClick={() => setView('more')}>More options</button>
        </div>
      </>}
      {view === 'worlds' && <>
        <h1 tabIndex={-1} ref={heading}>Choose a world</h1>
        <label><span id="explorer-world-label">Learning world</span>
          <select aria-labelledby="explorer-world-label" value={worldId} onChange={event => setWorldId(event.target.value)}>
            {LEARNING_WORLDS.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
        <p>{world.desc}</p>
        <div className="explorer-simple-actions">
          <button type="button" className="explorer-primary" onClick={() => onOpenWorld(worldId)}>Open {world.title}</button>
          <button type="button" onClick={() => setView('home')}>Back to home</button>
        </div>
      </>}
      {view === 'more' && <>
        <h1 tabIndex={-1} ref={heading}>More options</h1>
        <label><span id="explorer-more-label">What would you like to do?</span>
          <select aria-labelledby="explorer-more-label" value={option} onChange={event => setOption(event.target.value)}>
            {general.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            {practice.length > 0 && <optgroup label="Today’s practice">{practice.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</optgroup>}
            {recent.length > 0 && <optgroup label="Play again">{recent.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</optgroup>}
          </select>
        </label>
        {option === 'daily' && <p>{challenge.desc} · {challengeCompleted ? 'Complete' : `${Math.min(challengeProgress, challenge.target)} of ${challenge.target}`}</p>}
        <div className="explorer-simple-actions">
          <button type="button" className="explorer-primary" disabled={!chosen} onClick={chosen?.action}>{chosen?.label ?? 'Continue'}</button>
          <button type="button" onClick={() => setView('home')}>Back to home</button>
        </div>
      </>}
    </div>
  </main>;
};

export default ExplorerHome;
