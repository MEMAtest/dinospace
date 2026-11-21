import { useEffect, useRef, useState } from 'react';
import './discoveryVisuals.css';

const WorldPage = ({ world, games, favouriteGames, onLaunch, onToggleFavourite, onBack }) => {
  const [selectedId, setSelectedId] = useState(() => games[0]?.id ?? '');
  const heading = useRef(null);
  const game = games.find(item => item.id === selectedId);
  const favourite = game && favouriteGames.includes(game.id);

  useEffect(() => { heading.current?.focus(); }, []);

  const play = () => {
    const next = selectedId === 'surprise' ? games[Math.floor(Math.random() * games.length)] : game;
    if (next) onLaunch(next.id, 'launch');
  };

  return <main className="explorer-simple">
    <div className="explorer-simple-body">
      <h1 tabIndex={-1} ref={heading}>{world.title}</h1>
      {games.length ? <>
        <label><span id="explorer-game-label">Choose a game</span>
          <select aria-labelledby="explorer-game-label" value={selectedId} onChange={event => setSelectedId(event.target.value)}>
            {games.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
            <option value="surprise">Surprise me</option>
          </select>
        </label>
        <p>{game ? game.desc : 'We’ll pick a game from this world.'}</p>
      </> : <p>There are no games in this world yet.</p>}
      <div className="explorer-simple-actions">
        {games.length > 0 && <button type="button" className="explorer-primary" onClick={play}>{game ? `Play ${game.title}` : 'Play a surprise game'}</button>}
        {game && <button type="button" onClick={() => onToggleFavourite(game.id)} aria-pressed={favourite}>{favourite ? 'Remove from favourites' : 'Add to favourites'}</button>}
        <button type="button" onClick={onBack}>Back to home</button>
      </div>
    </div>
  </main>;
};

export default WorldPage;
