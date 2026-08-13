import { Home, RotateCcw, Settings2 } from 'lucide-react';
import { ACHIEVEMENTS, GAME_LABELS } from '../../data/index.js';
import { BONUS_GAME_IDS, DIFFICULTY_BANDS, PHASE_SOUNDS } from '../../data/learningProgress.js';
import { WRITING_SAMPLES_KEY } from '../../data/literacy.js';
import { useLearningProgress } from '../../hooks/useLearningProgress.js';
import { getRank, loadSaved } from '../../utils.js';

const LEARNING_GAMES = Object.entries(GAME_LABELS).filter(([id]) => id !== 'progress' && !BONUS_GAME_IDS.includes(id));
const BAND_LABELS = { starter: 'Starter', growing: 'Growing', challenge: 'Challenge' };

const ProgressDashboard = ({ points, gamesPlayed, streak, onBack }) => {
  const { profile, mastery, outcomes, setPhase, toggleSound, setDifficulty } = useLearningProgress();
  const unlockedAchievements = ACHIEVEMENTS.filter((a) => a.check(gamesPlayed, points, streak));
  const totalGames = Object.values(gamesPlayed).reduce((a, b) => a + b, 0);
  const favoriteGame = Object.entries(gamesPlayed).sort(([, a], [, b]) => b - a)[0];
  const secureSkills = Object.values(mastery).filter((item) => item.status === 'secure').length;
  const practisingSkills = Object.values(mastery).filter((item) => item.status === 'practising').length;
  const writingSamples = loadSaved(WRITING_SAMPLES_KEY, []).slice(-3).reverse();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-indigo-100 via-purple-100 to-indigo-200 flex flex-col items-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 right-8 w-48 h-48 bg-white/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-200/60 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between w-full max-w-4xl mb-6 z-10">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform" aria-label="Back to all games"><Home /></button>
        <h2 className="text-3xl font-black text-indigo-700">My Progress</h2>
        <div />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mb-8 z-10">
        <div className="bg-white/90 rounded-2xl p-4 text-center shadow-lg border-2 border-indigo-200">
          <div className="text-3xl mb-1">⭐</div>
          <div className="text-2xl font-black text-indigo-700">{points}</div>
          <div className="text-sm text-slate-500 font-semibold">Total Stars</div>
        </div>
        <div className="bg-white/90 rounded-2xl p-4 text-center shadow-lg border-2 border-indigo-200">
          <div className="text-3xl mb-1">🎮</div>
          <div className="text-2xl font-black text-indigo-700">{totalGames}</div>
          <div className="text-sm text-slate-500 font-semibold">Games Played</div>
        </div>
        <div className="bg-white/90 rounded-2xl p-4 text-center shadow-lg border-2 border-indigo-200">
          <div className="text-3xl mb-1">🔥</div>
          <div className="text-2xl font-black text-indigo-700">{streak}</div>
          <div className="text-sm text-slate-500 font-semibold">Day Streak</div>
        </div>
        <div className="bg-white/90 rounded-2xl p-4 text-center shadow-lg border-2 border-indigo-200">
          <div className="text-3xl mb-1">{getRank(points).emoji}</div>
          <div className="text-lg font-black text-indigo-700">{getRank(points).title}</div>
          <div className="text-sm text-slate-500 font-semibold">Rank</div>
        </div>
      </div>
      {favoriteGame && (
        <div className="bg-white/80 rounded-2xl p-4 w-full max-w-4xl mb-6 z-10 text-center">
          <span className="text-slate-500 font-semibold">Favorite Game: </span>
          <span className="font-black text-indigo-700">{GAME_LABELS[favoriteGame[0]] || favoriteGame[0]} ({favoriteGame[1]} plays)</span>
        </div>
      )}
      <section className="mb-6 w-full max-w-4xl rounded-3xl border-2 border-emerald-200 bg-white/90 p-5 shadow-lg z-10" aria-labelledby="learning-outcomes-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 id="learning-outcomes-title" className="text-xl font-black text-emerald-800">🌱 What I am learning</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">Learning evidence is separate from stars and game plays.</p>
          </div>
          <div className="flex gap-2 text-center">
            <div className="rounded-xl bg-emerald-50 px-3 py-2"><strong className="block text-xl text-emerald-700">{secureSkills}</strong><span className="text-xs font-bold text-slate-500">Secure</span></div>
            <div className="rounded-xl bg-amber-50 px-3 py-2"><strong className="block text-xl text-amber-700">{practisingSkills}</strong><span className="text-xs font-bold text-slate-500">Practising</span></div>
          </div>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {outcomes.map((outcome) => <li key={outcome} className="rounded-xl bg-emerald-50/80 p-3 text-sm font-bold text-slate-700">{outcome}</li>)}
        </ul>
      </section>

      <details className="mb-7 w-full max-w-4xl rounded-3xl border-2 border-indigo-200 bg-white/90 shadow-lg z-10">
        <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-5 font-black text-indigo-800">
          <Settings2 aria-hidden="true" /> Grown-up learning settings
          <span className="ml-auto rounded-full bg-indigo-50 px-3 py-1 text-xs">Phase {profile.activePhase} · age {profile.ageBand}</span>
        </summary>
        <div className="border-t border-indigo-100 p-5">
          <h3 className="font-black text-slate-800">Sounds being taught</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">Choose only sounds introduced at school. Games remain freely available.</p>
          <div className="mt-3 flex gap-2" aria-label="Phonics phase">
            {[2, 3].map((phase) => (
              <button key={phase} type="button" onClick={() => setPhase(phase)} aria-pressed={profile.activePhase === phase} className={`min-h-11 rounded-xl px-5 font-black ${profile.activePhase === phase ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'}`}>Phase {phase}</button>
            ))}
          </div>
          {[2, 3].filter((phase) => phase <= profile.activePhase).map((phase) => (
            <div key={phase} className="mt-4">
              <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Phase {phase} sounds</p>
              <div className="flex flex-wrap gap-2">
                {PHASE_SOUNDS[phase].map((sound) => {
                  const selected = profile.selectedSounds.includes(sound);
                  return <button key={sound} type="button" onClick={() => toggleSound(sound)} aria-pressed={selected} className={`grid min-h-11 min-w-11 place-items-center rounded-xl border-2 px-3 text-lg font-black ${selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-500'}`}>{sound}</button>;
                })}
              </div>
            </div>
          ))}

          <div className="mt-6 border-t border-slate-100 pt-5">
            <h3 className="font-black text-slate-800">Game difficulty</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">Leave games on Auto, or choose a fixed band. This changes the game challenge, never access.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {LEARNING_GAMES.map(([gameId, label]) => (
                <label key={gameId} className="flex min-h-12 items-center gap-3 rounded-xl bg-indigo-50/70 px-3 text-sm font-bold text-slate-700">
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  <select value={profile.difficultyOverrides[gameId] || ''} onChange={(event) => setDifficulty(gameId, event.target.value || null)} className="rounded-lg border border-indigo-200 bg-white px-2 py-2 font-black text-indigo-700" aria-label={`${label} difficulty`}>
                    <option value="">Auto</option>
                    {DIFFICULTY_BANDS.map((band) => <option key={band} value={band}>{BAND_LABELS[band]}</option>)}
                  </select>
                </label>
              ))}
            </div>
            {Object.keys(profile.difficultyOverrides).length > 0 && (
              <button type="button" onClick={() => Object.keys(profile.difficultyOverrides).forEach((gameId) => setDifficulty(gameId, null))} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-100 px-4 font-black text-slate-700"><RotateCcw size={17} /> Reset to automatic</button>
            )}
          </div>
        </div>
      </details>
      {writingSamples.length > 0 && (
        <section className="mb-7 w-full max-w-4xl rounded-3xl border-2 border-cyan-200 bg-white/90 p-5 shadow-lg z-10" aria-labelledby="writing-samples-title">
          <h3 id="writing-samples-title" className="text-xl font-black text-cyan-800">📝 Recent writing samples</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">Saved for a grown-up to review. The app does not automatically grade handwriting.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {writingSamples.map((sample) => (
              <article key={`${sample.savedAt}-${sample.prompt}`} className="rounded-2xl bg-cyan-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-cyan-700">Prompt</p>
                <p className="mt-1 font-bold text-slate-600">{sample.prompt}</p>
                <p className="mt-3 text-xs font-black uppercase tracking-wide text-cyan-700">Amari wrote</p>
                <p className="mt-1 text-lg font-black text-slate-900">{sample.response}</p>
              </article>
            ))}
          </div>
        </section>
      )}
      <div className="w-full max-w-4xl z-10">
        <h3 className="text-xl font-black text-indigo-700 mb-4">🏆 Achievements ({unlockedAchievements.length}/{ACHIEVEMENTS.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = a.check(gamesPlayed, points, streak);
            return (
              <div key={a.id} className={`rounded-2xl p-4 border-2 transition flex items-center gap-3 ${unlocked ? 'bg-white border-indigo-200 shadow-md' : 'bg-slate-100 border-slate-200 opacity-60'}`}>
                <div className={`text-3xl ${unlocked ? '' : 'grayscale'}`}>{a.emoji}</div>
                <div>
                  <div className="font-black text-slate-700">{a.name}</div>
                  <div className="text-sm text-slate-500">{a.desc}</div>
                </div>
                {unlocked && <span className="ml-auto text-green-500 font-black">✓</span>}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-8 w-full max-w-4xl z-10">
        <h3 className="text-xl font-black text-indigo-700 mb-4">📊 Games Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(gamesPlayed).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a).map(([game, count]) => (
            <div key={game} className="bg-white/80 rounded-2xl p-3 text-center border-2 border-indigo-100">
              <div className="font-bold text-slate-700 text-sm">{GAME_LABELS[game] || game}</div>
              <div className="text-xl font-black text-indigo-600">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
