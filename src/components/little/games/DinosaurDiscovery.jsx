import { useEffect, useRef, useState } from 'react';
import { FocusMenu } from '../../shared/FocusMenu.jsx';
import { collectDiscoverySticker, DISCOVERY_CREATURES, DISCOVERY_HABITATS, readDiscoveryStickers } from '../../../data/dinosaurDiscovery.js';
import { DinoSticker } from '../../shared/StickerArt.jsx';
import ShadowDino from '../ShadowDino.jsx';
import './dinosaurDiscovery.css';

const PAGE_SIZE = 4;
const FOODS = {
  fish: { name: 'Fish', icon: '🐟' },
  plants: { name: 'Plants', icon: '🌿' },
  meat: { name: 'Meat', icon: '🍖' },
};

const CreatureArt = ({ creature, large = false }) => (
  <span className={`dinosaur-discovery__art${large ? ' dinosaur-discovery__art--large' : ''}`} aria-hidden="true">
    {creature.shadow ? <ShadowDino kind={creature.shadow} />
      : creature.image ? <img src={creature.image} alt="" draggable={false} />
        : <DinoSticker species={creature.id} size={large ? 250 : 105} />}
  </span>
);

const CreatureTile = ({ creature, onClick, collected }) => (
  <button type="button" className="dinosaur-discovery__tile" onClick={onClick} data-creature={creature.id}>
    <CreatureArt creature={creature} />
    <span>{creature.name}</span>
    {collected && <span className="dinosaur-discovery__stamp"><span className="sr-only">Sticker collected</span>★</span>}
  </button>
);

function getActivityOptions(creature) {
  const habitat = DISCOVERY_HABITATS.find(item => item.creatures.includes(creature));
  const index = habitat.creatures.indexOf(creature);
  const other = habitat.creatures[(index + 1) % habitat.creatures.length];
  return {
    pictures: index % 2 ? [creature, other] : [other, creature],
    foods: creature.food === 'plants' ? ['plants', 'fish'] : ['plants', creature.food],
  };
}

const CreatureVisit = ({ creature, collected, collect, say, onReturn, returnLabel, showStickers, onBack, backLabel, soundOn, toggleSound }) => {
  const [feature, setFeature] = useState(false);
  const [activity, setActivity] = useState(null);
  const [retry, setRetry] = useState(false);
  const [won, setWon] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const activityRef = useRef(null);
  const name = creature.spokenName || creature.name;
  const options = getActivityOptions(creature);
  const prompt = activity === 'food' ? `What did ${creature.name} eat?` : `Find the other picture of ${creature.name}.`;

  useEffect(() => {
    if (!activity || optionsOpen) return;
    activityRef.current?.focus();
    activityRef.current?.scrollIntoView({ block: 'nearest' });
  }, [activity, optionsOpen]);

  const reveal = () => {
    setFeature(true);
    say(creature.feature);
  };

  const start = kind => {
    setOptionsOpen(false);
    setRetry(false);
    setWon(false);
    setActivity(kind);
    say(kind === 'food' ? `What did ${name} eat?` : `Find the other picture of ${name}.`);
  };

  const choose = correct => {
    if (!correct) {
      setRetry(true);
      say('Try the other one.');
      return;
    }
    setWon(true);
    setRetry(false);
    const saved = collect(creature.id);
    setSaveFailed(!saved);
    say(saved ? `You found ${name}! There is a sticker in your book.` : `You found ${name}!`);
  };

  const closeOptions = () => setOptionsOpen(false);
  const optionsMenu = [
    ...(soundOn ? [{ label: 'Hear the name', action: () => { closeOptions(); say(name); } }] : []),
    ...(creature.food && activity !== 'food' && !saveFailed ? [{ label: 'Find food', action: () => start('food') }] : []),
    ...(activity && !saveFailed ? [{
      label: 'Back to the portrait', action: () => { setActivity(null); setWon(false); closeOptions(); },
    }] : []),
    { label: returnLabel, disabled: saveFailed, action: onReturn },
    { label: 'My sticker book', disabled: saveFailed, action: showStickers },
    { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { toggleSound?.(); closeOptions(); } },
    { label: backLabel, action: onBack },
  ];

  if (optionsOpen) return <FocusMenu choices={optionsMenu} onBack={closeOptions} />;

  return <div className="discovery-focus-visit">
    {!activity ? <>
      <div className="dinosaur-discovery__portrait discovery-focus-portrait">
        <CreatureArt creature={creature} large />
      </div>
      {feature && <p className="pattern-focus-explanation" role="status">{creature.feature}</p>}
      {collected && <p className="focus-game-message">★ Sticker collected</p>}
      <div className="focus-game-actions mt-3">
        <button type="button" className="focus-game-button is-primary" onClick={() => start('picture')}>Match picture</button>
        <button type="button" className="focus-game-button" onClick={reveal}>Look closer</button>
        <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
      </div>
    </> : <section ref={activityRef} tabIndex={-1} aria-label={prompt}>
      {won ? <>
        <h2 className="text-xl font-extrabold">You found {creature.name}!</h2>
        {activity === 'food' && <p className="focus-game-message">{creature.name} ate {FOODS[creature.food].name.toLowerCase()}.</p>}
        <p className="focus-game-message" role={saveFailed ? 'alert' : 'status'}>{saveFailed ? 'This sticker has not saved yet.' : `★ ${creature.name} is in your sticker book.`}</p>
        <div className="focus-game-actions">
          {saveFailed
            ? <button type="button" className="focus-game-button is-primary" onClick={() => setSaveFailed(!collect(creature.id))}>Retry save</button>
            : <button type="button" className="focus-game-button is-primary" onClick={onReturn}>Meet another</button>}
          <button type="button" className="focus-game-button" onClick={() => setOptionsOpen(true)}>Options</button>
        </div>
      </> : <>
        <h2 className="text-xl font-extrabold">{prompt}</h2>
        {activity === 'picture' && <div className="discovery-focus-reference"><CreatureArt creature={creature} large /></div>}
        <div className="dinosaur-discovery__grid" aria-label="Creature activity choices">
          {activity === 'picture' ? options.pictures.map(option => <CreatureTile key={option.id} creature={option} onClick={() => choose(option === creature)} />)
            : options.foods.map(food => <button key={food} type="button" className="dinosaur-discovery__tile" onClick={() => choose(food === creature.food)}>
              <span className="dinosaur-discovery__food" aria-hidden="true">{FOODS[food].icon}</span>{FOODS[food].name}
            </button>)}
        </div>
        {retry && <p className="focus-game-message" role="status">Try the other one.</p>}
        <button type="button" className="focus-game-button mt-3" onClick={() => setOptionsOpen(true)}>Options</button>
      </>}
    </section>}
  </div>;

};

function getAlbum(playerId) {
  try {
    return { stickers: readDiscoveryStickers(window.localStorage, playerId), unavailable: false };
  } catch {
    return { stickers: [], unavailable: true };
  }
}

export default function DinosaurDiscovery({ playerId, bigKid, onBack, soundOn, onToggleSound, playSfx, cancelNarration }) {
  const [habitatId, setHabitatId] = useState('land');
  const [page, setPage] = useState(0);
  const [creature, setCreature] = useState(null);
  const [showAlbum, setShowAlbum] = useState(false);
  const [panel, setPanel] = useState(null);
  const [album, setAlbum] = useState(() => getAlbum(playerId));
  const titleRef = useRef(null);
  const moveFocus = useRef(false);
  const habitat = DISCOVERY_HABITATS.find(item => item.id === habitatId);
  const maxPage = Math.ceil(habitat.creatures.length / PAGE_SIZE) - 1;
  const collected = DISCOVERY_CREATURES.filter(item => album.stickers.includes(item.id));
  const speech = typeof window !== 'undefined' ? window.speechSynthesis : undefined;

  useEffect(() => () => speech?.cancel(), [speech]);
  useEffect(() => {
    if (!soundOn) speech?.cancel();
  }, [soundOn, speech]);
  useEffect(() => {
    if (moveFocus.current) {
      moveFocus.current = false;
      titleRef.current?.focus({ preventScroll: true });
      titleRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [creature, showAlbum]);

  const say = line => {
    if (!soundOn || !speech || typeof SpeechSynthesisUtterance === 'undefined') return;
    cancelNarration?.();
    speech.cancel();
    const utterance = new SpeechSynthesisUtterance(line);
    utterance.lang = 'en-GB';
    utterance.rate = 0.88;
    speech.speak(utterance);
  };

  const selectHabitat = item => {
    setHabitatId(item.id);
    setPage(0);
    say(item.name);
  };

  const visit = item => {
    moveFocus.current = true;
    setCreature(item);
    say(`Meet ${item.spokenName || item.name}.`);
  };

  const showStickers = () => {
    moveFocus.current = true;
    setAlbum(getAlbum(playerId));
    setCreature(null);
    setShowAlbum(true);
    setPanel(null);
    say('Your sticker book.');
  };

  const leaveVisit = () => {
    moveFocus.current = true;
    speech?.cancel();
    setCreature(null);
  };

  const collect = id => {
    try {
      const stickers = collectDiscoverySticker(window.localStorage, playerId, id);
      setAlbum({ stickers, unavailable: false });
      playSfx?.('success');
      return true;
    } catch {
      return false;
    }
  };

  const returnToHabitats = () => {
    moveFocus.current = true;
    speech?.cancel();
    setShowAlbum(false);
    setCreature(null);
  };

  const leave = () => { speech?.cancel(); onBack?.(); };
  const backLabel = bigKid ? 'Back to Explore & Languages' : 'Go home';
  const shelfOptions = [
    ...(showAlbum ? [{ label: 'Back to habitats', action: () => { setPanel(null); returnToHabitats(); } }]
      : [{ label: 'My sticker book', action: showStickers }]),
    { label: 'Facts and picture credits', action: () => setPanel('credits') },
    { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { onToggleSound?.(); setPanel(null); } },
    { label: backLabel, action: leave },
  ];

  return <div className="focus-game dinosaur-discovery discovery-focus" data-board-focus="" data-habitat={habitatId}>
    <main className={`focus-game-body${panel ? ' is-menu' : ''}`}>
      <header className="focus-game-heading">
        {creature && <p>Dinosaur Discovery World · {habitat.name}</p>}
        <h1 tabIndex={-1} ref={titleRef}>{creature ? creature.name : panel === 'credits' ? 'Facts and picture credits' : showAlbum ? 'My sticker book' : 'Dinosaur Discovery World'}</h1>
      </header>
      {creature ? <CreatureVisit key={creature.id} creature={creature} collected={album.stickers.includes(creature.id)} collect={collect} say={say} onReturn={leaveVisit}
        returnLabel={showAlbum ? 'Back to stickers' : 'Back to habitats'} showStickers={showStickers} onBack={leave} backLabel={backLabel} soundOn={soundOn} toggleSound={onToggleSound} />
      : panel === 'options' ? <FocusMenu choices={shelfOptions} onBack={() => setPanel(null)} /> : panel === 'credits' ? <>
        <p className="focus-game-message">Original Dino Space illustrations. Creature facts are based on museum references.</p>
        <ul className="space-y-2 underline">
          <li><a href="https://www.nhm.ac.uk/discover/dino-directory.html" target="_blank" rel="noreferrer">Natural History Museum dinosaur directory</a></li>
          <li><a href="https://www.nhm.ac.uk/discover/what-is-a-plesiosaur.html" target="_blank" rel="noreferrer">Natural History Museum guide to plesiosaurs</a></li>
          <li><a href="https://www.nhm.ac.uk/discover/what-is-an-ichthyosaur.html" target="_blank" rel="noreferrer">Natural History Museum guide to ichthyosaurs</a></li>
          <li><a href="https://www.amnh.org/explore/ology/ology-cards/358-pteranodon-longiceps" target="_blank" rel="noreferrer">American Museum of Natural History Pteranodon card</a></li>
        </ul>
        <button type="button" className="focus-game-button mt-3" onClick={() => setPanel(null)}>Back to discovery</button>
      </> : <>
        {showAlbum ? <>
          <p className="focus-game-message" role="status">{album.unavailable ? 'This browser could not read your sticker book.' : `${collected.length} of ${DISCOVERY_CREATURES.length} stickers`}</p>
          {collected.length > 0 && <div className="dinosaur-discovery__grid dinosaur-discovery__catalogue" aria-label="Collected creatures">
            {collected.map(item => <CreatureTile key={item.id} creature={item} onClick={() => visit(item)} collected />)}
          </div>}
        </> : <>
          <label className="focus-game-menu mb-3">Choose a habitat
            <select value={habitatId} onChange={event => selectHabitat(DISCOVERY_HABITATS.find(item => item.id === event.target.value))}>
              {DISCOVERY_HABITATS.map(item => <option key={item.id} value={item.id}>{item.icon} {item.name} · {item.group}</option>)}
            </select>
          </label>
          <p className="focus-game-message">Choose a creature to meet.</p>
          <div className="dinosaur-discovery__grid dinosaur-discovery__catalogue" aria-label="Creatures in this habitat">
            {habitat.creatures.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(item => <CreatureTile key={item.id} creature={item} onClick={() => visit(item)} collected={album.stickers.includes(item.id)} />)}
          </div>
          {maxPage > 0 && <label className="focus-game-menu mt-3">More creatures
            <select value={page} onChange={event => setPage(Number(event.target.value))}>
              {Array.from({ length: maxPage + 1 }, (_, index) => <option key={index} value={index}>{habitat.creatures.slice(index * PAGE_SIZE, (index + 1) * PAGE_SIZE).map(item => item.name).join(' · ')}</option>)}
            </select>
          </label>}
        </>}
        <div className="focus-game-actions mt-3">
          <button type="button" className="focus-game-button" onClick={() => setPanel('options')}>Options</button>
          <button type="button" className="focus-game-button" onClick={showAlbum ? returnToHabitats : leave}>{showAlbum ? 'Back to habitats' : 'Back'}</button>
        </div>
      </>}
    </main>
  </div>;
}
