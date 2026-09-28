import { MenuCard } from '../shared/index.jsx';
import { PageHeader } from '../shared/Navigation.jsx';
import WorldIcon from '../shared/WorldIcon.jsx';
import './discoveryVisuals.css';

// One learning world on its own page, so opening a world never leaves the
// games hidden below the fold.
const WorldPage = ({
  world, games, bonusGameIds, favouriteGames, gamesPlayed, onLaunch, onToggleFavourite, onBack, soundOn, onToggleSound,
}) => (
  <div className={`discovery-world-page relative flex min-h-[100dvh] w-full flex-col items-center gap-5 bg-gradient-to-b ${world.color} p-3 pb-10 sm:p-6`}>
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-white/60 to-white/90" />
    <PageHeader
      title={world.title}
      subtitle={world.desc}
      onBack={onBack}
      backLabel="Back to home"
      soundOn={soundOn}
      onToggleSound={onToggleSound}
      right={<span className="hidden origin-right scale-[.6] sm:block"><WorldIcon world={world} compact /></span>}
    />
    <div className="relative z-10 flex w-full max-w-7xl justify-end">
      <button
        type="button"
        onClick={() => onLaunch(games[Math.floor(Math.random() * games.length)].id, 'launch')}
        className="rounded-2xl bg-slate-900 px-5 py-3 font-black text-white shadow-lg transition hover:-translate-y-0.5 active:translate-y-0"
      >
        🎲 Surprise me
      </button>
    </div>
    <div className="relative z-10 grid w-full max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {games.map((game) => {
        const favourite = favouriteGames.includes(game.id);
        const bonus = bonusGameIds.has(game.id);
        return (
          <div key={game.id} className="discovery-world-page-card relative">
            <MenuCard
              span="w-full"
              icon={game.icon}
              title={game.title}
              desc={game.desc}
              color={game.color}
              badge={bonus ? 'PRACTICE' : game.little ? 'NEW' : game.badge}
              category={bonus ? 'Bonus play' : game.category}
              playedCount={gamesPlayed[game.id] || 0}
              onClick={() => onLaunch(game.id)}
            />
            <button
              type="button"
              onClick={() => onToggleFavourite(game.id)}
              className={`absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/50 text-xl shadow-md backdrop-blur transition hover:scale-105 active:scale-95 ${favourite ? 'bg-amber-300 text-amber-900' : 'bg-white/25 text-white'}`}
              aria-label={`${favourite ? 'Remove' : 'Add'} ${game.title} ${favourite ? 'from' : 'to'} favourites`}
              aria-pressed={favourite}
            >
              {favourite ? '★' : '☆'}
            </button>
          </div>
        );
      })}
    </div>
  </div>
);

export default WorldPage;
