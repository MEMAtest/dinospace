import { Lock, Play } from 'lucide-react';
import { SoundToggle } from '../shared/index.jsx';
import { MiniIcon } from '../shared/Navigation.jsx';
import WorldIcon from '../shared/WorldIcon.jsx';
import astronautCrew from '../../assets/landing/amari-astronaut-robot.png';
import { LEARNING_WORLDS } from '../../data/learningWorlds.js';
import { getNextRank, getRank } from '../../utils.js';

const PlayerChip = ({ player, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`${player.name} is playing. Tap to change player`}
    className="flex min-w-0 items-center gap-2 rounded-full bg-gradient-to-r from-sky-100 to-indigo-100 py-1 pl-1 pr-4 shadow-inner transition hover:brightness-105"
  >
    <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-sky-400 to-indigo-600">
      <img src={astronautCrew} alt="" className="h-11 w-11 object-cover object-top" />
    </span>
    <span className="truncate text-lg font-black text-slate-800">{player.name}</span>
  </button>
);

// Amari's home: everything a child needs on one short screen — today's
// mission, a quick way back into recent games, and the five worlds. Progress,
// settings and stickers live on their own pages.
const ExplorerHome = ({
  player, points, streak, challenge, challengeProgress, challengeCompleted, practiceGames, quickGames,
  favouriteGames, onLaunch, onOpenWorld, onOpenPage, onSwitchPlayer, soundOn, onToggleSound,
}) => {
  const rank = getRank(points);
  const nextRank = getNextRank(points);
  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col items-center gap-5 overflow-hidden bg-gradient-to-b from-[#dff3ff] via-[#eef8ff] to-[#f8fbff] p-3 pb-28 sm:p-6 sm:pb-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-32 right-8 h-40 w-40 rounded-full bg-orange-200/60 blur-2xl" />
        <div className="absolute bottom-16 left-10 h-52 w-52 rounded-full bg-green-200/60 blur-3xl" />
      </div>

      <header className="relative z-20 flex w-full max-w-7xl items-center justify-between gap-2 rounded-[1.7rem] border border-white/80 bg-white/80 px-2 py-2 shadow-[0_12px_34px_rgba(30,105,175,.12)] backdrop-blur-xl sm:px-4">
        <PlayerChip player={player} onClick={onSwitchPlayer} />
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-50 px-3 py-2 text-sm font-black text-amber-700 sm:text-base">⭐ {points}</span>
          <span className="hidden rounded-full bg-orange-50 px-3 py-2 text-sm font-black text-orange-700 sm:block">🔥 {streak} day{streak === 1 ? '' : 's'}</span>
          <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
        </div>
      </header>

      <section className="relative z-10 grid w-full max-w-7xl items-center gap-4 overflow-hidden rounded-[2.2rem] border-2 border-white/90 bg-gradient-to-br from-sky-100 via-white/80 to-indigo-100 p-4 shadow-[0_22px_60px_rgba(38,104,171,.17)] sm:grid-cols-[auto_1fr] sm:p-6">
        <img src={astronautCrew} alt="Amari the astronaut with a friendly learning robot" className="mx-auto h-32 w-auto object-contain drop-shadow-[0_18px_22px_rgba(30,64,175,.22)] sm:h-48" />
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">Hi {player.name}!</h2>
          <p className="mt-1 font-bold text-slate-600">
            {rank.emoji} {rank.title}{nextRank ? ` · ${nextRank.minPoints - points} stars to ${nextRank.title}` : ''}
          </p>
          <div className={`mt-4 flex items-center gap-3 rounded-2xl border-2 p-3 text-left ${challengeCompleted ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <span className="text-3xl" aria-hidden="true">{challengeCompleted ? '🏆' : challenge.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-wide text-amber-700">Daily challenge</p>
              <p className="truncate font-black text-slate-800">{challenge.desc}</p>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white" role="progressbar" aria-label="Daily challenge progress" aria-valuemin={0} aria-valuemax={challenge.target} aria-valuenow={Math.min(challengeProgress, challenge.target)}>
                <div className={`h-full rounded-full ${challengeCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (challengeProgress / challenge.target) * 100)}%` }} />
              </div>
            </div>
            {!challengeCompleted && (
              <button type="button" onClick={() => onLaunch(challenge.game, 'launch')} aria-label={`Play the daily challenge: ${challenge.desc}`} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber-500 text-white shadow-md active:translate-y-0.5">
                <Play size={24} fill="currentColor" className="ml-0.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="relative z-10 w-full max-w-7xl" aria-labelledby="worlds-heading">
        <h2 id="worlds-heading" className="mb-3 text-left text-2xl font-black text-slate-900 sm:text-3xl">Choose a world</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {LEARNING_WORLDS.map((world) => (
            <button
              key={world.id}
              type="button"
              onClick={() => onOpenWorld(world.id)}
              className={`group relative flex min-h-44 flex-col overflow-hidden rounded-[1.8rem] bg-gradient-to-br ${world.color} p-4 text-left text-white shadow-[0_8px_0_rgba(15,23,42,.13),0_16px_30px_rgba(30,64,175,.16)] transition hover:-translate-y-1 active:translate-y-1 active:shadow-none last:col-span-2 lg:last:col-span-1`}
            >
              <span className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/20" />
              <span className="relative -ml-2 origin-left scale-75 transition group-hover:scale-90"><WorldIcon world={world} /></span>
              <strong className="relative mt-auto block text-lg font-black leading-tight sm:text-xl">{world.title}</strong>
              <span className="relative mt-1 inline-flex w-max rounded-full bg-white/20 px-3 py-1 text-xs font-black backdrop-blur">{world.gameIds.length} games →</span>
            </button>
          ))}
        </div>
      </section>

      <section className="relative z-10 w-full max-w-7xl rounded-[2rem] border border-white/90 bg-white/75 p-4 shadow-[0_14px_40px_rgba(30,105,175,.12)] backdrop-blur-xl sm:p-5" aria-labelledby="practice-heading">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 id="practice-heading" className="text-xl font-black text-slate-900 sm:text-2xl">Today’s practice</h2>
            <p className="text-sm font-bold text-slate-500">Three quick games · about 8 minutes</p>
          </div>
          <button type="button" onClick={() => onLaunch(practiceGames[0].id, 'launch')} className="shrink-0 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-3 font-black text-white shadow-lg transition hover:-translate-y-0.5 active:translate-y-0">
            ▶ Start
          </button>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3 sm:gap-3">
          {practiceGames.map((game, index) => (
            <button key={game.id} type="button" onClick={() => onLaunch(game.id)} className="flex min-h-16 items-center gap-3 rounded-2xl border border-slate-100 bg-white p-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0">
              <MiniIcon icon={game.icon} />
              <span className="min-w-0"><span className="block text-xs font-black uppercase tracking-wide text-orange-500">Step {index + 1}</span><strong className="block truncate text-base text-slate-900">{game.title}</strong></span>
            </button>
          ))}
        </div>
      </section>

      {quickGames.length > 0 && (
        <section className="relative z-10 w-full max-w-7xl" aria-labelledby="quick-heading">
          <h2 id="quick-heading" className="mb-2 text-left text-xl font-black text-slate-900">Play again</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {quickGames.map((game) => (
              <button key={game.id} type="button" onClick={() => onLaunch(game.id)} className="flex min-w-52 items-center gap-3 rounded-2xl border border-white bg-white/85 p-2 text-left shadow-md transition hover:-translate-y-0.5 active:translate-y-0">
                <MiniIcon icon={game.icon} className="h-12 w-12 bg-indigo-50" />
                <span className="min-w-0"><strong className="block truncate text-sm text-slate-900">{game.title}</strong><span className="text-xs font-bold text-slate-500">{favouriteGames.includes(game.id) ? '★ Favourite' : '↺ Recent'}</span></span>
              </button>
            ))}
          </div>
        </section>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center gap-3 border-t border-white/80 bg-white/85 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(30,105,175,.12)] backdrop-blur-xl" aria-label="More">
        <button type="button" onClick={() => onOpenPage('stickers')} className="flex min-h-14 flex-1 max-w-xs items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 font-black text-white shadow-md active:translate-y-0.5">
          <span className="text-2xl" aria-hidden="true">🏅</span> Stickers
        </button>
        <button type="button" onClick={() => onOpenPage('grownups')} className="flex min-h-14 flex-1 max-w-xs items-center justify-center gap-2 rounded-2xl bg-slate-800 px-4 font-black text-white shadow-md active:translate-y-0.5">
          <Lock size={20} aria-hidden="true" /> Grown-ups
        </button>
      </nav>
    </div>
  );
};

export default ExplorerHome;
