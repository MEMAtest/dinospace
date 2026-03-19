import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Home } from 'lucide-react';
import { ACHIEVEMENTS, GAME_LABELS } from '../../data/index.js';
import { getRank } from '../../utils.js';

const ProgressDashboard = ({ points, gamesPlayed, streak, achievements, onBack, playSfx }) => {
  const unlockedAchievements = ACHIEVEMENTS.filter((a) => a.check(gamesPlayed, points, streak));
  const totalGames = Object.values(gamesPlayed).reduce((a, b) => a + b, 0);
  const favoriteGame = Object.entries(gamesPlayed).sort(([, a], [, b]) => b - a)[0];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-indigo-100 via-purple-100 to-indigo-200 flex flex-col items-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 right-8 w-48 h-48 bg-white/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-200/60 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between w-full max-w-4xl mb-6 z-10">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><Home /></button>
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
