import { Volume2, VolumeX } from 'lucide-react';
import { AskiaBuddy } from '../little/VehicleArt.jsx';
import { RewardSticker } from '../shared/StickerArt.jsx';

// Askia's home: no reading needed. Every game is a big picture tile, the
// name is spoken when a game starts, and there are only three other buttons
// (who is playing, stickers, sound).
const LittleHome = ({ player, points, games, onLaunch, onOpenPage, onSwitchPlayer, soundOn, onToggleSound }) => (
  <div className="relative flex min-h-[100dvh] w-full flex-col items-center gap-4 overflow-hidden bg-gradient-to-b from-amber-200 via-orange-100 to-sky-200 p-3 pb-8 sm:p-6">
    <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-yellow-300/70 blur-2xl" />
    <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-sky-300/60 blur-3xl" />

    <header className="relative z-10 flex w-full max-w-6xl items-center gap-3">
      <button
        type="button"
        onClick={onSwitchPlayer}
        aria-label={`${player.name} is playing. Tap to change player`}
        className="flex min-w-0 items-center gap-2 rounded-full bg-white/85 py-1 pl-1 pr-4 shadow-lg"
      >
        <AskiaBuddy className="h-14 w-14" title={`${player.name}’s buddy`} />
        <span className="hidden text-2xl font-black text-orange-600 min-[400px]:inline">{player.name}</span>
      </button>
      <span className="ml-auto flex items-center gap-1 whitespace-nowrap rounded-full bg-white/85 px-4 py-2 text-2xl font-black text-amber-600 shadow-lg" aria-label={`${points} stars`}>
        ⭐ {points}
      </span>
      <button
        type="button"
        onClick={() => onOpenPage('stickers')}
        aria-label="My stickers"
        className="grid h-16 w-16 place-items-center rounded-full bg-white/85 shadow-lg"
      >
        <RewardSticker rewardId="dino" size={46} locked={false} />
      </button>
      <button
        type="button"
        onClick={onToggleSound}
        aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
        className="grid h-16 w-16 place-items-center rounded-full bg-white/85 text-slate-700 shadow-lg"
      >
        {soundOn ? <Volume2 size={30} /> : <VolumeX size={30} />}
      </button>
    </header>

    <main className="relative z-10 grid w-full max-w-6xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {games.map((game) => (
        <button
          key={game.id}
          type="button"
          onClick={() => onLaunch(game.id, 'launch')}
          aria-label={game.title}
          className={`group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white/80 ${game.color} p-2 shadow-[0_8px_0_rgba(15,23,42,.15),0_16px_30px_rgba(15,23,42,.14)] transition hover:-translate-y-1 active:translate-y-2 active:shadow-none`}
        >
          <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/25" />
          <span className="relative flex flex-1 items-center justify-center transition group-hover:scale-110 [&_.kid-pop-icon]:h-[7.5rem] [&_.kid-pop-icon]:w-[8.5rem] sm:[&_.kid-pop-icon]:h-36 sm:[&_.kid-pop-icon]:w-40">{game.icon}</span>
          <span className="relative w-full truncate rounded-full bg-black/15 px-2 py-1 text-center text-base font-black text-white sm:text-lg">{game.title}</span>
        </button>
      ))}
    </main>
  </div>
);

export default LittleHome;
