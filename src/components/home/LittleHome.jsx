import { ArrowRight, Home, Lock, Star, Volume2, VolumeX } from 'lucide-react';
import { RewardSticker } from '../shared/StickerArt.jsx';
import { artUrl } from '../little/littleArt.js';
import memoryScene from '../../assets/game-scenes/askia-memory-treehouse.webp';
import jungleScene from '../../assets/little/bg-dino.webp';
import rocketScene from '../../assets/little/bg-fuelup.webp';
import fireScene from '../../assets/little/fire-house.webp';
import './discoveryVisuals.css';

const WORLDS = [
  { id: 'dino', title: 'Dino World', gameIds: ['dinojigsaw', 'shadowmatch', 'dino'], scene: jungleScene, art: 'detective-trike', tone: 'green' },
  { id: 'rocket', title: 'Rocket World', gameIds: ['rocketbuilder', 'fuelup', 'counting'], scene: rocketScene, art: 'fuel-rocket', tone: 'blue' },
  { id: 'rescue', title: 'Rescue World', gameIds: ['firerescue', 'ladder'], scene: fireScene, art: 'rescue-firetruck', tone: 'red' },
  { id: 'thinkers', title: 'Little Thinkers', gameIds: ['memory', 'pattern'], scene: memoryScene, art: 'detective-ankylo', tone: 'purple' },
];
const TODAY_GAMES = ['fuelup', 'dino', 'memory'];

const LittleHome = ({ player, points, games, onLaunch, onOpenPage, onSwitchPlayer, soundOn, onToggleSound }) => {
  const gameById = Object.fromEntries(games.map((game) => [game.id, game]));
  const launch = (id) => onLaunch(id, 'launch');

  return <div id="askia-home" className="askia-home relative min-h-[100dvh] overflow-hidden bg-gradient-to-b from-[#a7deff] via-[#fff3bb] to-[#d5ed8a] px-3 pb-28 pt-3 sm:px-6 sm:pt-5">
    <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center gap-2 sm:gap-3">
      <button type="button" onClick={onSwitchPlayer} aria-label={`${player.name} is playing. Change player`} className="flex min-w-0 items-center gap-1 rounded-full border-2 border-white bg-white/90 py-1 pl-1 pr-3 shadow-lg sm:gap-2 sm:pr-5">
        <img src={artUrl('askia-detective')} alt="" className="h-10 w-10 object-contain sm:h-14 sm:w-14" />
        <span className="text-lg font-black text-orange-600 sm:text-2xl">{player.name}</span>
      </button>
      <span className="ml-auto whitespace-nowrap rounded-full border border-white bg-white/90 px-3 py-2 text-lg font-black text-amber-700 shadow-lg sm:px-5 sm:text-2xl" aria-label={`${points} stars`}>⭐ {points}</span>
      <button type="button" onClick={() => onOpenPage('stickers')} aria-label="My stickers" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white bg-white/90 shadow-lg sm:h-16 sm:w-16"><RewardSticker rewardId="dino" size={36} /></button>
      <button type="button" onClick={onToggleSound} aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white bg-white/90 text-slate-700 shadow-lg sm:h-16 sm:w-16">{soundOn ? <Volume2 size={26} /> : <VolumeX size={26} />}</button>
    </header>

    <section className="askia-hero relative mx-auto mt-4 flex w-full max-w-7xl items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white/80 px-4 py-4 shadow-xl sm:min-h-48 sm:px-8">
      <img src={artUrl('askia-detective')} alt="Askia the young explorer" className="askia-hero__character h-36 w-36 shrink-0 object-contain sm:h-44 sm:w-44" />
      <div className="relative z-10 min-w-0 pl-1 sm:pl-5"><h1 className="text-3xl font-black leading-none text-orange-600 drop-shadow-[0_2px_0_white] sm:text-6xl">Hi Askia!</h1><p className="mt-2 rounded-full bg-white/80 px-3 py-2 text-sm font-black text-blue-900 sm:text-2xl">What shall we play today?</p></div>
    </section>

    <main id="askia-worlds" className="relative z-10 mx-auto mt-5 w-full max-w-7xl">
      <h2 className="sr-only">Choose a world</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {WORLDS.map((world) => <section key={world.id} className={`askia-world askia-world--${world.tone} overflow-hidden rounded-[2rem] border-4 border-white/90 shadow-xl`} aria-labelledby={`${world.id}-title`}>
          <div className="askia-world__scene relative h-44 overflow-hidden sm:h-52">
            <img src={world.scene} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
            <img src={artUrl(world.art)} alt="" className="askia-world__art absolute bottom-0 left-[9%] h-[92%] w-[82%] object-contain drop-shadow-[0_12px_9px_#18332999]" />
          </div>
          <div className="relative px-3 pb-4 pt-2 sm:px-4">
            <h3 id={`${world.id}-title`} className="text-center text-2xl font-black text-white drop-shadow-[0_3px_1px_#15314766] sm:text-3xl">{world.title}</h3>
            <div className="mt-3 grid gap-2">
              {world.gameIds.map((id) => <button key={id} type="button" onClick={() => launch(id)} className="askia-world__game flex min-h-12 items-center justify-between gap-2 rounded-full border-2 border-white/70 bg-white/90 px-3 text-left font-black text-slate-800 shadow-sm transition hover:scale-[1.02] active:scale-[.98] sm:min-h-14" aria-label={`Play ${gameById[id]?.title || id}`}>
                <span className="truncate">{gameById[id]?.title || id}</span><ArrowRight size={20} className="shrink-0" />
              </button>)}
            </div>
          </div>
        </section>)}
      </div>

      <section className="mt-6 rounded-[2rem] border-2 border-white/80 bg-white/65 p-4 shadow-lg" aria-labelledby="askia-today-title">
        <h2 id="askia-today-title" className="text-2xl font-black text-amber-900">☀️ Today’s Fun</h2><p className="font-semibold text-slate-600">A few special games for you!</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">{TODAY_GAMES.map((id) => <button key={id} type="button" onClick={() => launch(id)} className={`askia-today askia-today--${id} flex min-h-24 items-center gap-3 rounded-[1.4rem] border-2 border-white/70 px-3 text-left text-white shadow-md transition hover:-translate-y-1 active:translate-y-1`}>
          <img src={artUrl(id === 'fuelup' ? 'fuel-rocket' : id === 'dino' ? 'askia-detective' : 'detective-trex')} alt="" className="h-16 w-16 shrink-0 object-contain" /><span className="min-w-0 flex-1 text-lg font-black">{gameById[id]?.title}</span><ArrowRight className="shrink-0" />
        </button>)}</div>
      </section>
    </main>

    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-3xl items-center justify-around gap-1 rounded-t-[1.5rem] border border-white bg-white/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_#39515433] sm:bottom-3 sm:rounded-full" aria-label="Askia navigation">
      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-current="page" className="askia-nav-item text-orange-600"><Home size={22} />Home</button>
      <button type="button" onClick={() => document.getElementById('askia-worlds')?.scrollIntoView({ behavior: 'smooth' })} className="askia-nav-item text-blue-900"><span aria-hidden="true">🌍</span>Worlds</button>
      <button type="button" onClick={() => onOpenPage('stickers')} className="askia-nav-item text-blue-900"><Star size={22} />Stickers</button>
      <button type="button" onClick={() => onOpenPage('grownups')} className="askia-nav-item text-blue-900"><Lock size={20} />Grown-ups</button>
    </nav>
  </div>;
};

export default LittleHome;
