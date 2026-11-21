import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { STICKERS } from '../../data/index.js';
import { DISCOVERY_CREATURES, readDiscoveryStickers } from '../../data/dinosaurDiscovery.js';
import { PageHeader } from '../shared/Navigation.jsx';
import { DinoSticker, RewardSticker } from '../shared/StickerArt.jsx';
import ShadowDino from '../little/ShadowDino.jsx';
import { artUrl } from '../little/littleArt.js';
import './stickerAlbum.css';

const STICKER_NOTES = {
  rocket: 'Your first launch into Dino Space.',
  dino: 'A curious dino friend for your exploring crew.',
  star: 'A gold star for all those things you’ve worked out.',
  truck: 'A rescue truck ready to roll.',
  heart: 'A big heart for trying again and helping out.',
  planet: 'A planet of your own for your space collection.',
  hero: 'A shield for brave exploring.',
  trophy: 'A trophy for sticking with your missions.',
  diamond: 'A sparkling diamond for careful thinking.',
  crown: 'A crown for the leader of your learning crew.',
  legend: 'A legendary medal for an experienced explorer.',
  galaxy: 'A whole galaxy for a superstar explorer.',
};

const StarStickerArt = ({ sticker, little, size, locked = false }) => {
  const picture = little && artUrl(`sticker-${sticker.id}`);
  return picture
    ? <img src={picture} alt="" draggable={false} width={size} height={size} className={locked ? 'sticker-art-silhouette' : ''} />
    : <RewardSticker rewardId={sticker.id} size={size} locked={locked} />;
};

const CreatureArt = ({ creature, size }) => (
  <span className="sticker-creature-art" style={{ width: size, height: size }} aria-hidden="true">
    {creature.shadow ? <ShadowDino kind={creature.shadow} />
      : creature.image ? <img src={creature.image} alt="" draggable={false} />
        : <DinoSticker species={creature.id} size={size} />}
  </span>
);

export function StickerReward({ sticker, little }) {
  return <div className="sticker-reward" role="status" aria-live="polite">
    <span className="sticker-reward-placement" aria-hidden="true">
      <StarStickerArt sticker={sticker} little={little} size={76} />
    </span>
    <div><strong>{sticker.name} earned!</strong><p>Stuck in your sticker album.</p></div>
  </div>;
}

export default function StickerAlbum({ player, little, points, earnedStickerIds, onBack, playSfx, onExplore, soundOn, onToggleSound, children }) {
  const [selected, setSelected] = useState(null);
  const details = useRef(null);
  useLayoutEffect(() => { if (selected && !details.current?.open) details.current?.showModal(); }, [selected]);
  const earned = new Set(earnedStickerIds);
  const owns = sticker => earned.has(sticker.id) || points >= sticker.points;
  const collected = STICKERS.filter(owns);
  const next = STICKERS.find(sticker => !owns(sticker));
  let creatureIds;
  try { creatureIds = readDiscoveryStickers(window.localStorage, player.id); }
  catch { creatureIds = null; }
  const creatures = DISCOVERY_CREATURES.filter(creature => creatureIds?.includes(creature.id));
  const showSticker = (sticker, creature = false) => {
    setSelected({ sticker, creature });
    if (creature || owns(sticker)) playSfx?.('sparkle');
  };
  const selectedEarned = selected && (selected.creature || owns(selected.sticker));

  return <main className={`sticker-album${little ? ' sticker-album--little' : ''}`}>
    <PageHeader title={`${player.name}’s sticker album`} subtitle={`${points} stars`} onBack={onBack} backLabel="Back to home" soundOn={soundOn} onToggleSound={onToggleSound} />
    <section className="sticker-album-page" aria-labelledby="album-title">
      <header className="sticker-album-title">
        <div><h2 id="album-title">My stickers</h2><p>{collected.length} of {STICKERS.length} collected</p></div>
        {next && <div className="sticker-album-next">
          <span aria-hidden="true"><StarStickerArt sticker={next} little={little} size={48} locked /></span>
          <div><strong>{Math.max(0, next.points - points)} stars to go</strong><p>Next up · {next.name}</p></div>
        </div>}
      </header>
      <div className="sticker-album-grid">
        {STICKERS.map(sticker => <button key={sticker.id} type="button" className="sticker-album-slot"
          data-earned={owns(sticker)} onClick={() => showSticker(sticker)} aria-haspopup="dialog"
          aria-label={`${sticker.name}, ${owns(sticker) ? 'collected' : `unlocks at ${sticker.points} stars`}`}>
          <span className="sticker-slot-picture" aria-hidden="true"><StarStickerArt sticker={sticker} little={little} size={92} locked={!owns(sticker)} /></span>
          <strong>{sticker.name}</strong>
          <small>{owns(sticker) ? 'Collected' : `${sticker.points} stars`}</small>
        </button>)}
      </div>
    </section>

    <section className="sticker-album-page" aria-labelledby="creature-stickers-title">
      <header className="sticker-album-title">
        <div><h2 id="creature-stickers-title">Dinosaur Discovery stickers</h2>
          <p>{creatureIds === null ? 'Your creature stickers could not be read.' : `${creatures.length} of ${DISCOVERY_CREATURES.length} collected`}</p>
        </div>
        <button type="button" className="sticker-album-explore" onClick={onExplore}>Meet a creature <ArrowRight size={18} aria-hidden="true" /></button>
      </header>
      {creatures.length > 0 ? <div className="sticker-album-grid">
        {creatures.map(creature => <button key={creature.id} type="button" className="sticker-album-slot"
          data-earned="true" onClick={() => showSticker(creature, true)} aria-haspopup="dialog" aria-label={`${creature.name}, collected`}>
          <span className="sticker-slot-picture"><CreatureArt creature={creature} size={92} /></span>
          <strong>{creature.name}</strong><small>Collected</small>
        </button>)}
      </div> : creatureIds !== null && <p className="sticker-album-help">Match a creature’s picture or food to collect its sticker.</p>}
    </section>

    <details className="sticker-album-extra">
      <summary>Game badges</summary>
      <div>{children}</div>
    </details>

    <dialog ref={details} className="sticker-album-detail" aria-labelledby="sticker-detail-title" onClose={() => setSelected(null)}
      onClick={event => { if (event.target === event.currentTarget) details.current?.close(); }}>
      {selected && <article>
        <button type="button" onClick={() => details.current?.close()} aria-label="Close sticker details"><X size={22} /></button>
        <div className="sticker-detail-art" data-earned={selectedEarned} aria-hidden="true">
          {selected.creature ? <CreatureArt creature={selected.sticker} size={164} />
            : <StarStickerArt sticker={selected.sticker} little={little} size={164} locked={!selectedEarned} />}
        </div>
        <h2 id="sticker-detail-title">{selected.sticker.name}</h2>
        <p>{selected.creature ? selected.sticker.feature : STICKER_NOTES[selected.sticker.id]}</p>
        <strong>{selectedEarned ? 'Stuck in your album' : `Earn ${selected.sticker.points - points} more stars to collect it`}</strong>
      </article>}
    </dialog>
  </main>;
}
