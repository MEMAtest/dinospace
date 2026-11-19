import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Search, Volume2, VolumeX } from 'lucide-react';
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

const CreatureVisit = ({ creature, collected, collect, say, onReturn }) => {
  const [feature, setFeature] = useState(false);
  const [activity, setActivity] = useState(null);
  const [retry, setRetry] = useState(false);
  const [won, setWon] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const activityRef = useRef(null);
  const name = creature.spokenName || creature.name;
  const options = getActivityOptions(creature);
  const prompt = activity === 'food' ? `What did ${creature.name} eat?` : `Find the other picture of ${creature.name}.`;

  useEffect(() => {
    if (!activity) return;
    activityRef.current?.focus();
    activityRef.current?.scrollIntoView({ block: 'nearest' });
  }, [activity]);

  const reveal = () => {
    setFeature(true);
    say(creature.feature);
  };

  const start = kind => {
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

  return (
    <div className="dinosaur-discovery__visit">
      <div>
        <button type="button" className={`dinosaur-discovery__portrait${feature ? ' is-revealed' : ''}`} onClick={reveal} aria-label={`Look closer at ${creature.name}`}>
          <CreatureArt creature={creature} large />
          <span className="dinosaur-discovery__portrait-label"><Search size={18} aria-hidden="true" /> Look closer</span>
        </button>
        {feature && <p className="dinosaur-discovery__fact" role="status">{creature.feature}</p>}
        <div className="dinosaur-discovery__actions">
          <button type="button" onClick={() => say(name)}><Volume2 size={20} aria-hidden="true" /> Hear name</button>
          <button type="button" onClick={() => start('picture')}><span aria-hidden="true">🧩</span> Match picture</button>
          {creature.food && <button type="button" onClick={() => start('food')}><span aria-hidden="true">🍽️</span> Find food</button>}
        </div>
      </div>
      {activity && <section className="dinosaur-discovery__activity" ref={activityRef} tabIndex={-1} aria-label={prompt}>
        {won ? <div className="dinosaur-discovery__win" role="status">
          <strong><Check aria-hidden="true" /> Well done!</strong>
          {activity === 'food' && <p>{creature.name} ate {FOODS[creature.food].name.toLowerCase()}.</p>}
          {saveFailed ? <>
            <p>Your browser couldn’t save the sticker.</p>
            <button type="button" onClick={() => setSaveFailed(!collect(creature.id))}>Try saving again</button>
          </> : <p>★ {creature.name} is in your sticker book.</p>}
          <button type="button" onClick={onReturn}>Meet another <ArrowRight size={19} aria-hidden="true" /></button>
        </div> : <>
          <h3>{prompt}</h3>
          {activity === 'picture' && <CreatureArt creature={creature} />}
          <div className="dinosaur-discovery__grid">
            {activity === 'picture' ? options.pictures.map(option => <CreatureTile key={option.id} creature={option} onClick={() => choose(option === creature)} />)
              : options.foods.map(food => <button key={food} type="button" className="dinosaur-discovery__tile" onClick={() => choose(food === creature.food)}>
                <span className="dinosaur-discovery__food" aria-hidden="true">{FOODS[food].icon}</span>{FOODS[food].name}
              </button>)}
          </div>
          {retry && <p role="status">Try the other one.</p>}
        </>}
      </section>}
      {!activity && collected && <p className="dinosaur-discovery__fact">★ Sticker collected</p>}
    </div>
  );
};

function getAlbum(playerId) {
  try {
    return { stickers: readDiscoveryStickers(window.localStorage, playerId), unavailable: false };
  } catch {
    return { stickers: [], unavailable: true };
  }
}

export default function DinosaurDiscovery({ playerId, onBack, soundOn, onToggleSound, playSfx, cancelNarration }) {
  const [habitatId, setHabitatId] = useState('land');
  const [page, setPage] = useState(0);
  const [creature, setCreature] = useState(null);
  const [showAlbum, setShowAlbum] = useState(false);
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

  return (
    <div className="dinosaur-discovery" data-habitat={habitatId}>
      <div className="dinosaur-discovery__inner">
        <header className="dinosaur-discovery__header">
          <button type="button" onClick={onBack}><ArrowLeft aria-hidden="true" size={22} /> Back</button>
          <h1>Dinosaur Discovery World</h1>
          <button type="button" aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'} onClick={onToggleSound}>
            {soundOn ? <Volume2 aria-hidden="true" size={24} /> : <VolumeX aria-hidden="true" size={24} />}
          </button>
        </header>
        <main className="dinosaur-discovery__body">
          {creature || showAlbum ? <div className="dinosaur-discovery__toolbar">
            <button type="button" onClick={creature ? leaveVisit : returnToHabitats}><ArrowLeft size={20} aria-hidden="true" /> {creature && showAlbum ? 'Sticker book' : 'Habitats'}</button>
            {!showAlbum && <button type="button" onClick={showStickers}><BookOpen size={20} aria-hidden="true" /> Sticker book</button>}
          </div> : null}
          {creature ? <>
            <h2 tabIndex={-1} ref={titleRef}>{creature.name}</h2>
            <CreatureVisit key={creature.id} creature={creature} collected={album.stickers.includes(creature.id)} collect={collect} say={say} onReturn={leaveVisit} />
          </> : showAlbum ? <>
            <h2 tabIndex={-1} ref={titleRef}>My sticker book</h2>
            {album.unavailable ? <p role="status">This browser couldn’t read the sticker book.</p>
              : <><p role="status">{collected.length} of {DISCOVERY_CREATURES.length} stickers</p>
                {collected.length ? <div className="dinosaur-discovery__grid dinosaur-discovery__catalogue">
                  {collected.map(item => <CreatureTile key={item.id} creature={item} onClick={() => visit(item)} collected />)}
                </div> : <p>Match a creature’s picture to collect your first sticker.</p>}
              </>}
          </> : <>
            <h2 tabIndex={-1} ref={titleRef}>Where shall we explore?</h2>
            <div className="dinosaur-discovery__habitats" role="group" aria-label="Habitats">
              {DISCOVERY_HABITATS.map(item => <button key={item.id} type="button" data-habitat-choice={item.id} aria-pressed={habitatId === item.id} onClick={() => selectHabitat(item)}>
                <span aria-hidden="true">{item.icon}</span>{item.name}
              </button>)}
            </div>
            <div className="dinosaur-discovery__toolbar dinosaur-discovery__toolbar--catalogue">
              <h3>{habitat.group}</h3>
              <button type="button" onClick={showStickers}><BookOpen size={19} aria-hidden="true" /> Sticker book</button>
            </div>
            <div className="dinosaur-discovery__grid dinosaur-discovery__catalogue">
              {habitat.creatures.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(item => <CreatureTile key={item.id} creature={item} onClick={() => visit(item)} collected={album.stickers.includes(item.id)} />)}
            </div>
            {maxPage > 0 && <div className="dinosaur-discovery__pages">
              <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Previous creatures"><ArrowLeft aria-hidden="true" /></button>
              <span aria-live="polite">Page {page + 1} of {maxPage + 1}</span>
              <button type="button" disabled={page === maxPage} onClick={() => setPage(page + 1)} aria-label="More creatures"><ArrowRight aria-hidden="true" /></button>
            </div>}
            <details className="dinosaur-discovery__credits">
              <summary>Facts and picture credits</summary>
              <p>Original Dino Space illustrations. Creature facts are based on museum references.</p>
              <ul>
                <li><a href="https://www.nhm.ac.uk/discover/dino-directory.html" target="_blank" rel="noreferrer">Natural History Museum dinosaur directory</a></li>
                <li><a href="https://www.nhm.ac.uk/discover/what-is-a-plesiosaur.html" target="_blank" rel="noreferrer">Natural History Museum guide to plesiosaurs</a></li>
                <li><a href="https://www.nhm.ac.uk/discover/what-is-an-ichthyosaur.html" target="_blank" rel="noreferrer">Natural History Museum guide to ichthyosaurs</a></li>
                <li><a href="https://www.amnh.org/explore/ology/ology-cards/358-pteranodon-longiceps" target="_blank" rel="noreferrer">American Museum of Natural History Pteranodon card</a></li>
              </ul>
            </details>
          </>}
        </main>
      </div>
    </div>
  );
}
