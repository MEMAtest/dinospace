import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Home, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { STICKERS, GAME_LABELS } from '../../data/index.js';

export const SoundToggle = ({ soundOn, onToggle, className = '' }) => (
  <button
    onClick={onToggle}
    className={`bg-white/90 text-slate-700 p-2 rounded-full shadow-lg hover:scale-105 transition ${className}`}
    aria-label={soundOn ? 'Sound on' : 'Sound off'}
  >
    {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
  </button>
);

export const CelebrationOverlay = ({ celebration }) => {
  if (!celebration) return null;

  const confetti = celebration.confetti || [];
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Screen flash */}
      <div className="absolute inset-0 bg-white/30 animate-fade-out" />
      {/* Emoji bursts */}
      {celebration.bursts.map((burst) => (
        <span
          key={burst.id}
          className={`absolute ${burst.size} animate-float-up`}
          style={{ left: `${burst.left}%`, top: `${burst.top}%`, animationDelay: `${burst.delay}s` }}
        >
          {burst.emoji}
        </span>
      ))}
      {/* Confetti particles */}
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
      {/* Central message card */}
      <div className="relative z-10 bg-white/95 rounded-3xl px-10 py-8 text-center shadow-2xl border-4 border-yellow-200 animate-pop-in">
        <div className="text-5xl mb-2">🎉</div>
        <div className="text-3xl font-black text-amber-600">{celebration.message}</div>
        <div className="mt-2 text-lg font-semibold text-slate-700">+{celebration.points} Sterne</div>
        <div className="text-slate-500 font-bold">Gesamt: {celebration.total}</div>
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
        <h2 className="text-3xl font-black text-amber-700">Gut gemacht!</h2>
        <p className="text-slate-600 font-semibold mt-2">{GAME_LABELS[summary.gameId]}</p>
        <div className="mt-4 text-2xl font-black text-amber-600">+{summary.points} Sterne</div>
        <div className="text-slate-500 font-semibold">Gesamt: {totalPoints}</div>

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
          Zurueck zum Menu
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
      <div className="mt-3 bg-white/60 rounded-full h-3 overflow-hidden">
        <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (progress / challenge.target) * 100)}%` }} />
      </div>
    )}
  </div>
);

export const StreakBanner = ({ streak, bonusStars }) => {
  if (streak < 2) return null;
  return (
    <div className="w-full max-w-6xl mx-auto mb-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl p-3 text-center relative z-10">
      <span className="text-white font-black text-lg">🔥 {streak} Day Streak! +{bonusStars} bonus stars</span>
    </div>
  );
};

export const MenuCard = ({ icon, title, desc, color, onClick, span = '' }) => (
  <button
    onClick={onClick}
    className={`
      ${span} relative group overflow-hidden rounded-[2.5rem] p-8 text-left transition-all duration-300
      ${color} shadow-[0_10px_0_rgba(0,0,0,0.1)] hover:shadow-[0_15px_0_rgba(0,0,0,0.1)]
      hover:-translate-y-1 active:translate-y-2 active:shadow-none tap-highlight-none
    `}
  >
    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="text-6xl mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 origin-left">
        {icon}
      </div>
      <div>
        <h2 className="text-3xl font-black text-white leading-tight mb-1 drop-shadow-md">{title}</h2>
        <p className="text-white/90 font-bold text-lg">{desc}</p>
      </div>
      <div className="absolute bottom-8 right-8 bg-white/30 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="text-white" />
      </div>
    </div>
  </button>
);

