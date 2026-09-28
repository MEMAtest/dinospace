import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { STICKERS } from '../../data/index.js';
import { RewardSticker } from '../shared/StickerArt.jsx';
import { artUrl } from '../little/littleArt.js';

const Sticker = ({ sticker, locked, size }) => {
  const url = artUrl(`sticker-${sticker.id}`);
  if (!url) return <RewardSticker rewardId={sticker.id} size={size} locked={locked} />;
  return (
    <img
      src={url}
      alt=""
      draggable={false}
      style={{ width: size, height: size }}
      className={`object-contain ${locked ? 'opacity-40 grayscale brightness-0 contrast-50' : ''}`}
    />
  );
};

// Askia's sticker album: pictures only. Earned stickers are bright and bounce
// when tapped; the next sticker to earn shows a star bar filling up.
const LittleStickerAlbum = ({ points, earnedStickerIds = [], onBack, playSfx }) => {
  const [popped, setPopped] = useState(null);
  const next = STICKERS.find((sticker) => points < sticker.points);
  const previousThreshold = [...STICKERS].reverse().find((sticker) => points >= sticker.points)?.points || 0;
  const progress = next ? (points - previousThreshold) / (next.points - previousThreshold) : 1;

  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center gap-4 bg-gradient-to-b from-amber-200 via-orange-100 to-sky-200 p-3 sm:p-6">
      <header className="flex w-full max-w-4xl items-center gap-3">
        <button type="button" onClick={onBack} aria-label="Back to home" className="grid h-16 w-16 place-items-center rounded-full border-4 border-white bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow-[0_6px_0_#1e3a8a] active:translate-y-1 active:shadow-none">
          <ArrowLeft size={34} strokeWidth={3} />
        </button>
        <span className="ml-auto whitespace-nowrap rounded-full bg-white/85 px-4 py-2 text-2xl font-black text-amber-600 shadow-lg" aria-label={`${points} stars`}>⭐ {points}</span>
      </header>

      {next && (
        <div className="flex w-full max-w-md items-center gap-3 rounded-[2rem] bg-white/85 p-3 shadow-lg" aria-label="Stars until the next sticker">
          <div className="h-8 flex-1 overflow-hidden rounded-full bg-amber-100">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400 transition-all" style={{ width: `${Math.max(6, progress * 100)}%` }} />
          </div>
          <Sticker sticker={next} locked size={64} />
        </div>
      )}

      <main className="grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {STICKERS.map((sticker) => {
          const locked = !earnedStickerIds.includes(sticker.id) && points < sticker.points;
          return (
            <button
              key={sticker.id}
              type="button"
              disabled={locked}
              onClick={() => { playSfx?.('sparkle'); setPopped(sticker.id); }}
              aria-label={locked ? 'A sticker still to earn' : sticker.name}
              className={`grid aspect-square place-items-center rounded-[2rem] border-4 shadow-lg transition ${locked ? 'border-white/60 bg-white/40' : 'border-amber-200 bg-white active:scale-95'}`}
            >
              <span key={popped === sticker.id ? `${sticker.id}-pop` : sticker.id} className={popped === sticker.id ? 'animate-piece-bounce' : ''}>
                <Sticker sticker={sticker} locked={locked} size={120} />
              </span>
            </button>
          );
        })}
      </main>
    </div>
  );
};

export default LittleStickerAlbum;
