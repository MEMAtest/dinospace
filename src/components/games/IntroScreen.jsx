import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { SoundToggle } from '../shared/index.jsx';

const IntroScreen = ({ onStart, playSfx, soundOn, onToggleSound, speak }) => {
  useEffect(() => {
    speak('Welcome Amari! Ready to play?');
    playSfx('sparkle');
  }, [playSfx, speak]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-200 via-blue-100 to-indigo-100 flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 left-10 w-56 h-56 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute top-20 right-8 w-48 h-48 bg-blue-200/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-200/60 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-6 right-6 z-20">
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        <div className="flex items-center justify-center gap-4 text-6xl animate-bounce-slow">
          <span>🐯</span>
          <span>🚀</span>
          <span>🌟</span>
        </div>
        <h1 className="mt-6 text-5xl md:text-6xl font-black text-slate-800 drop-shadow-sm">
          Welcome Amari!
        </h1>
        <p className="mt-4 text-xl text-slate-600 font-semibold">
          Amari Discovery is ready. Tap start and let’s play!
        </p>
        <button
          onClick={() => {
            playSfx('launch');
            onStart();
          }}
          className="mt-8 bg-blue-500 text-white text-2xl font-black px-10 py-4 rounded-full shadow-[0_8px_0_rgba(29,78,216,0.4)] hover:bg-blue-600 active:translate-y-1 active:shadow-none transition"
        >
          Start Adventure
        </button>
        <button
          onClick={() => speak('Welcome Amari! Ready to play?')}
          className="mt-4 text-blue-600 font-semibold"
        >
          🔊 Hear the welcome
        </button>
      </div>

      <div className="absolute bottom-8 left-8 text-4xl animate-bounce-slow">🪐</div>
      <div className="absolute bottom-8 right-8 text-4xl animate-bounce-slow">✨</div>
    </div>
  );
};

export default IntroScreen;
