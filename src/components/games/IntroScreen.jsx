import { ShieldCheck, Sparkles, Star, Trophy } from 'lucide-react';
import { SoundToggle } from '../shared/index.jsx';
import astronautCrew from '../../assets/landing/amari-astronaut-robot.png';

const IntroScreen = ({ onStart, playSfx, soundOn, onToggleSound, speak }) => {
  const startAdventure = () => {
    playSfx('welcome');
    onStart();
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050a2b] px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(94,76,255,0.55),transparent_28%),radial-gradient(circle_at_16%_70%,rgba(24,167,255,0.28),transparent_34%),linear-gradient(155deg,#070b31_0%,#101464_45%,#170746_100%)]" />
      <div className="absolute inset-0 opacity-90" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.95) 1px, transparent 1.5px)', backgroundSize: '72px 72px' }} />
      <div className="absolute -left-24 -top-20 h-80 w-80 rounded-full border-[38px] border-amber-300/30 bg-orange-300/20 shadow-[0_0_80px_rgba(251,191,36,.28)]" />
      <div className="absolute right-[7%] top-[10%] h-28 w-28 rounded-full bg-gradient-to-br from-sky-300 to-blue-700 shadow-[0_0_60px_rgba(56,189,248,.55)] sm:h-44 sm:w-44" />
      <div className="absolute bottom-[-18%] left-[-8%] h-[42%] w-[116%] rounded-[50%] border-t-4 border-purple-300/35 bg-gradient-to-b from-indigo-600/60 to-fuchsia-950/90 shadow-[0_-28px_100px_rgba(154,92,255,.35)]" />

      <div className="absolute right-5 top-5 z-30 sm:right-8 sm:top-8">
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-5 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="order-2 flex h-full items-end justify-center lg:order-1">
          <img
            src={astronautCrew}
            alt="Amari the astronaut waving beside a friendly learning robot"
            className="max-h-[52vh] w-auto max-w-full object-contain drop-shadow-[0_24px_38px_rgba(0,0,0,.42)] lg:max-h-[76vh]"
          />
        </div>

        <section className="order-1 text-center lg:order-2 lg:text-left">
          <div className="mb-5 flex items-center justify-center gap-3 text-4xl lg:justify-start lg:text-5xl" aria-hidden="true">
            <span>🪐</span><span>🚀</span><span>⭐</span>
          </div>
          <p className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-cyan-300 sm:text-base">Amari Discovery</p>
          <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-white drop-shadow-[0_6px_0_rgba(38,25,112,.75)] sm:text-7xl xl:text-8xl">
            Welcome <span className="bg-gradient-to-b from-violet-300 to-violet-500 bg-clip-text text-transparent">Amari!</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg font-bold leading-relaxed text-indigo-100 sm:text-2xl lg:mx-0">
            Your next learning mission is ready. Explore, discover and earn new rewards.
          </p>
          <button
            onClick={startAdventure}
            className="mt-7 inline-flex min-h-16 items-center justify-center gap-3 rounded-[1.6rem] border-2 border-cyan-200/70 bg-gradient-to-b from-cyan-400 to-blue-600 px-8 text-xl font-black text-white shadow-[0_8px_0_#1739a0,0_18px_42px_rgba(20,184,255,.35)] transition hover:-translate-y-1 hover:brightness-110 active:translate-y-1 active:shadow-none sm:px-12 sm:text-2xl"
          >
            <Sparkles fill="currentColor" /> Start Adventure
          </button>
          <div>
            <button
              onClick={() => speak('Welcome Amari! Your next learning adventure is ready.')}
              className="mt-5 rounded-full px-4 py-2 font-bold text-cyan-200 transition hover:bg-white/10 hover:text-white"
            >
              🔊 Hear the welcome
            </button>
          </div>
        </section>

        <div className="order-3 col-span-full mx-auto grid w-full max-w-4xl grid-cols-3 overflow-hidden rounded-[1.8rem] border border-white/20 bg-slate-950/35 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
          {[
            [<ShieldCheck key="safe" className="text-cyan-300" fill="rgba(103,232,249,.18)" />, 'Safe & Fun', 'Kid friendly'],
            [<Star key="learn" className="text-cyan-300" fill="rgba(103,232,249,.18)" />, 'Learn & Grow', 'Play and discover'],
            [<Trophy key="win" className="text-cyan-300" fill="rgba(103,232,249,.18)" />, 'Earn & Win', 'Quick rewards'],
          ].map(([icon, title, copy], index) => (
            <div key={title} className={`flex flex-col items-center gap-1 px-2 text-center sm:flex-row sm:justify-center sm:gap-3 ${index > 0 ? 'border-l border-white/15' : ''}`}>
              {icon}
              <div className="hidden sm:block sm:text-left"><strong className="block text-sm sm:text-base">{title}</strong><span className="text-xs text-indigo-200 sm:text-sm">{copy}</span></div>
              <strong className="text-xs sm:hidden">{title}</strong>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default IntroScreen;
