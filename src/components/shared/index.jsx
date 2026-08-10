import { ArrowRight, Download, Headphones, Home, Pause, Play, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { STICKERS, GAME_LABELS } from '../../data/index.js';

export const SoundToggle = ({ soundOn, onToggle, className = '' }) => (
  <button
    onClick={onToggle}
    className={`bg-white/90 text-slate-700 p-2 rounded-full shadow-lg hover:scale-105 transition ${className}`}
    aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
  >
    {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
  </button>
);

export const CelebrationOverlay = ({ celebration }) => {
  if (!celebration) return null;

  const isBig = celebration.points >= 8;

  if (!isBig) {
    return (
      <div
        className="fixed right-3 top-20 z-50 pointer-events-none animate-quick-reward"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 rounded-2xl border-2 border-yellow-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur">
          <span className="text-2xl">⭐</span>
          <div>
            <div className="font-black leading-tight text-amber-600">{celebration.message}</div>
            <div className="text-sm font-bold text-slate-500">+{celebration.points} stars · {celebration.total} total</div>
          </div>
        </div>
      </div>
    );
  }

  const confetti = (celebration.confetti || []).slice(0, 12);
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {!reducedMotion && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-yellow-300/60 animate-ring-expand" />
        </div>
      )}
      {(celebration.bursts || []).slice(0, 7).map((burst) => (
        <span
          key={burst.id}
          className={`absolute ${burst.size} animate-float-up`}
          style={{ left: `${burst.left}%`, top: `${burst.top}%`, animationDelay: `${burst.delay}s` }}
        >
          {burst.emoji}
        </span>
      ))}
      {!reducedMotion && confetti.map((c) => (
        <div
          key={c.id}
          className={`absolute top-0 ${c.drift}`}
          style={{
            left: `${c.left}%`,
            width: c.width,
            height: c.height,
            backgroundColor: c.color,
            borderRadius: 2,
            animationDelay: `${c.delay}s`,
            transform: `rotate(${c.rotation}deg)`,
          }}
        />
      ))}
      <div className="relative z-10 flex items-center gap-4 rounded-3xl border-4 border-yellow-200 bg-white/95 px-7 py-5 text-left shadow-2xl animate-milestone-reward">
        <div className="text-5xl">🏆</div>
        <div>
          <div className="text-2xl font-black text-amber-600">{celebration.message}</div>
          <div className="font-bold text-slate-600">+{celebration.points} stars · {celebration.total} total</div>
        </div>
      </div>
    </div>
  );
};

export const RewardsShelf = ({ points }) => {
  return (
    <div className="mt-6 w-full max-w-5xl bg-white/70 rounded-3xl p-4 border-4 border-white shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-black text-slate-700">Sticker Shelf</h3>
        <span className="text-sm font-semibold text-slate-500">Unlock more by earning stars!</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {STICKERS.map((sticker) => {
          const unlocked = points >= sticker.points;
          return (
            <div
              key={sticker.id}
              className={`rounded-2xl p-3 text-center border-2 transition ${
                unlocked ? 'bg-amber-50 border-amber-200' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <div className={`text-3xl ${unlocked ? '' : 'opacity-30'}`}>{sticker.emoji}</div>
              <div className="text-sm font-bold text-slate-600 mt-1">{sticker.name}</div>
              <div className="text-xs text-slate-400">{sticker.points}⭐</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const InstallAppPrompt = ({ canInstall, isAppleMobile, isInstalled, isInstalling, onInstall }) => {
  if (isInstalled) return null;

  return (
    <section className="mt-6 w-full max-w-5xl rounded-3xl border-4 border-indigo-100 bg-white/80 p-5 shadow-xl backdrop-blur relative z-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-100 text-indigo-700">
            <Download size={24} />
          </div>
          <div>
            <h3 className="font-black text-slate-800">Install Amari Discovery</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Play full-screen from this device and keep your games ready for offline adventures.
            </p>
            {!canInstall && isAppleMobile && (
              <p className="mt-2 text-sm font-bold text-indigo-700">On iPhone or iPad: tap Share, then Add to Home Screen.</p>
            )}
            {!canInstall && !isAppleMobile && (
              <p className="mt-2 text-sm font-bold text-indigo-700">Look for Install app or Add to Home screen in your browser menu.</p>
            )}
          </div>
        </div>
        {canInstall && (
          <button
            onClick={onInstall}
            disabled={isInstalling}
            className="shrink-0 rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-700 active:translate-y-0 disabled:opacity-60"
          >
            {isInstalling ? 'Opening install…' : 'Install app'}
          </button>
        )}
      </div>
    </section>
  );
};

export const VoiceSettings = ({ voiceMode, onVoiceModeChange, premiumEnabled, premiumStatus, onPreview }) => {
  const statusText = premiumStatus === 'ready'
    ? 'Premium narrator connected'
    : premiumStatus === 'unavailable'
      ? 'Using this device voice for now'
      : premiumEnabled
        ? 'Premium narrator ready to try'
        : 'Premium narrator is off until connected';

  return (
    <section className="mt-6 w-full max-w-5xl rounded-3xl border-4 border-fuchsia-100 bg-white/80 p-5 shadow-xl backdrop-blur relative z-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-fuchsia-100 text-fuchsia-700">
            <Headphones size={24} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-black text-slate-800">Narrator voice</h3>
              <span className={`rounded-full px-2.5 py-1 text-xs font-black ${premiumStatus === 'ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-fuchsia-100 text-fuchsia-700'}`}>
                <Sparkles className="mr-1 inline" size={13} /> {statusText}
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-500">Premium uses the ElevenLabs narrator. Smart tries it first, then uses this device voice only if the service is unavailable.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex rounded-2xl bg-slate-100 p-1" role="radiogroup" aria-label="Narrator voice preference">
            {[
              ['smart', 'Smart'],
              ['premium', 'Premium'],
              ['device', 'Device'],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => onVoiceModeChange(value)}
                disabled={value === 'premium' && !premiumEnabled}
                className={`rounded-xl px-3 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${voiceMode === value ? 'bg-white text-fuchsia-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                role="radio"
                aria-checked={voiceMode === value}
                aria-label={value === 'premium' && !premiumEnabled ? 'Premium narrator needs connection first' : undefined}
              >
                {label}
              </button>
            ))}
          </div>
          <button onClick={onPreview} className="rounded-2xl border-2 border-fuchsia-200 px-4 py-2 text-sm font-black text-fuchsia-700 transition hover:bg-fuchsia-50">
            <Volume2 className="mr-1 inline" size={16} /> Hear it
          </button>
        </div>
      </div>
    </section>
  );
};

export const PointsSummaryScreen = ({ summary, totalPoints, onDone }) => {
  const unlockedNow = STICKERS.filter(
    (sticker) => totalPoints >= sticker.points && totalPoints - summary.points < sticker.points,
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-yellow-100 via-amber-100 to-yellow-200 flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-6 right-6 w-40 h-40 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-200/60 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 bg-white/90 rounded-3xl p-8 shadow-2xl border-4 border-amber-200 text-center max-w-lg w-full">
        <div className="text-5xl mb-2">🎉</div>
        <h2 className="text-3xl font-black text-amber-700">Brilliant work!</h2>
        <p className="text-slate-600 font-semibold mt-2">{GAME_LABELS[summary.gameId]}</p>
        <div className="mt-4 text-2xl font-black text-amber-600">+{summary.points} stars</div>
        <div className="text-slate-500 font-semibold">Total: {totalPoints}</div>

        {unlockedNow.length > 0 && (
          <div className="mt-6">
            <div className="text-sm font-bold text-amber-700">New Stickers!</div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {unlockedNow.map((sticker) => (
                <div
                  key={sticker.id}
                  className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-2"
                >
                  <div className="text-3xl">{sticker.emoji}</div>
                  <div className="text-xs font-bold text-slate-600">{sticker.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onDone}
          className="mt-6 bg-blue-500 text-white text-lg font-bold px-6 py-3 rounded-full shadow-lg hover:bg-blue-600"
        >
          Back to all games
        </button>
      </div>
    </div>
  );
};

export const PauseOverlay = ({ onResume }) => (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
    <div className="bg-white rounded-3xl p-10 text-center shadow-2xl max-w-sm">
      <div className="text-6xl mb-4">⏸️</div>
      <h2 className="text-3xl font-black text-slate-800 mb-2">Game Paused</h2>
      <p className="text-slate-500 font-semibold mb-6">Take a break if you need one!</p>
      <button onClick={onResume} className="bg-blue-500 text-white text-xl font-bold px-8 py-4 rounded-full shadow-lg hover:bg-blue-600 active:translate-y-1 transition-all flex items-center gap-2 mx-auto">
        <Play size={24} /> Resume
      </button>
    </div>
  </div>
);

export const BreakReminder = ({ onDismiss, onTakeBreak }) => (
  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center">
    <div className="bg-white rounded-3xl p-10 text-center shadow-2xl max-w-sm">
      <div className="text-6xl mb-4">🌙</div>
      <h2 className="text-3xl font-black text-slate-800 mb-2">Break Time!</h2>
      <p className="text-slate-500 font-semibold mb-2">You have been playing for 30 minutes.</p>
      <p className="text-slate-500 font-semibold mb-6">How about a little rest?</p>
      <div className="flex gap-4 justify-center">
        <button onClick={onTakeBreak} className="bg-indigo-500 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:bg-indigo-600 transition">Take a Break</button>
        <button onClick={onDismiss} className="bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-full shadow-lg hover:bg-slate-300 transition">5 More Minutes</button>
      </div>
    </div>
  </div>
);

export const DailyChallengeBanner = ({ challenge, progress, onGo, completed }) => (
  <div className={`w-full max-w-6xl mx-auto mb-6 rounded-3xl p-5 border-4 relative z-10 ${completed ? 'bg-green-100 border-green-300' : 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-300'}`}>
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="text-4xl">{challenge.emoji}</div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-amber-700 uppercase">Daily Challenge</span>
            {completed && <span className="text-green-600 font-black">DONE!</span>}
          </div>
          <p className="text-slate-700 font-bold text-lg">{challenge.desc}</p>
          <p className={`mt-1 text-sm font-black ${completed ? 'text-emerald-700' : 'text-amber-700'}`} aria-live="polite">
            {completed ? 'Mission complete — brilliant work!' : `${Math.min(progress, challenge.target)} of ${challenge.target} done`}
          </p>
        </div>
      </div>
      {!completed && (
        <button onClick={onGo} className="bg-amber-500 text-white font-bold px-5 py-2 rounded-full shadow-md hover:bg-amber-600 active:translate-y-1 transition-all whitespace-nowrap">
          Let's Go!
        </button>
      )}
      {completed && <div className="text-4xl">🏆</div>}
    </div>
    {!completed && (
      <div className="mt-3 bg-white/60 rounded-full h-3 overflow-hidden" role="progressbar" aria-label="Today's mission progress" aria-valuemin="0" aria-valuemax={challenge.target} aria-valuenow={Math.min(progress, challenge.target)}>
        <div className="bg-amber-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (progress / challenge.target) * 100)}%` }} />
      </div>
    )}
  </div>
);

export const DailyChallengeTracker = ({ challenge, progress, completed, active, onGo }) => {
  const percentage = Math.min(100, (progress / challenge.target) * 100);
  return (
    <div
      className={`fixed bottom-3 left-1/2 z-40 w-[min(92vw,380px)] -translate-x-1/2 pointer-events-auto transition-all ${
        completed ? 'animate-challenge-complete' : ''
      }`}
    >
      <div className={`rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
        completed
          ? 'border-emerald-300 bg-emerald-950/90 text-white'
          : active
            ? 'border-amber-300/70 bg-slate-950/90 text-white'
            : 'border-white/40 bg-white/90 text-slate-700'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{completed ? '🏆' : challenge.emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 text-xs font-black uppercase tracking-wide">
              <span role="status" aria-live="polite">{completed ? 'Daily mission complete' : active ? 'Mission in progress' : 'Today’s mission'}</span>
              <span key={progress} className="animate-count-up">{Math.min(progress, challenge.target)}/{challenge.target}</span>
            </div>
            <p className={`truncate text-sm font-bold ${active || completed ? 'text-white/75' : 'text-slate-500'}`}>
              {challenge.desc}
            </p>
          </div>
          {!completed && onGo && (
            <button
              type="button"
              onClick={onGo}
              className="flex shrink-0 items-center gap-1 rounded-xl bg-amber-400 px-2.5 py-2 text-xs font-black text-slate-950 shadow-md transition hover:bg-amber-300 active:translate-y-0.5"
              aria-label={`${active ? 'Restart' : 'Play'} today’s mission: ${challenge.desc}`}
            >
              {active ? 'Play' : 'Go'} <ArrowRight size={14} strokeWidth={3} />
            </button>
          )}
        </div>
        <div className={`mt-2 h-2 overflow-hidden rounded-full ${active || completed ? 'bg-white/15' : 'bg-slate-200'}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${completed ? 'bg-emerald-400' : 'bg-amber-400'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export const StreakBanner = ({ streak, bonusStars }) => {
  if (streak < 2) return null;
  return (
    <div className="w-full max-w-6xl mx-auto mb-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl p-3 text-center relative z-10">
      <span className="text-white font-black text-lg">🔥 {streak} Day Streak! +{bonusStars} bonus stars</span>
    </div>
  );
};

export const MenuCard = ({
  icon, title, desc, color, onClick, span = '', badge, category, playedCount = 0,
}) => (
  <button
    onClick={onClick}
    className={`
      ${span} relative group min-h-[250px] overflow-hidden rounded-[2.25rem] border-2 border-white/40 p-7 text-left transition-all duration-300
      ${color} shadow-[0_9px_0_rgba(15,23,42,0.14),0_18px_35px_rgba(15,23,42,0.12)] hover:shadow-[0_13px_0_rgba(15,23,42,0.13),0_24px_44px_rgba(15,23,42,0.18)]
      hover:-translate-y-1 active:translate-y-2 active:shadow-none tap-highlight-none
    `}
  >
    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-white/25 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
    <div className="absolute -bottom-14 -left-10 h-28 w-28 rounded-full border-[18px] border-white/10 transition-transform duration-500 group-hover:scale-125" />
    <div className="absolute left-6 top-5 flex items-center gap-2">
      {badge && <span className="rounded-full bg-yellow-300 px-3 py-1 text-xs font-black tracking-wide text-slate-900 shadow-md">{badge}</span>}
      {playedCount > 0 && <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-bold text-white backdrop-blur">✓ Played {playedCount}</span>}
    </div>
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="mt-7 text-6xl mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 origin-left">
        {icon}
      </div>
      <div>
        <div className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-white/65">{category}</div>
        <h2 className="text-2xl font-black text-white leading-tight mb-1 drop-shadow-md">{title}</h2>
        <p className="text-white/90 font-bold">{desc}</p>
      </div>
      <div className="absolute bottom-7 right-7 bg-white/25 p-2 rounded-full opacity-70 transition-all group-hover:translate-x-1 group-hover:bg-white/35 group-hover:opacity-100">
        <ArrowRight className="text-white" />
      </div>
    </div>
  </button>
);
