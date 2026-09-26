import { SoundToggle } from '../shared/index.jsx';
import astronautCrew from '../../assets/landing/amari-astronaut-robot.png';
import { AskiaBuddy } from '../little/VehicleArt.jsx';
import { PLAYERS } from '../../data/players.js';
import { LITTLE_LINES } from '../../data/littleGames.js';

const PlayerArt = ({ player }) => (player.id === 'askia'
  ? <AskiaBuddy className="h-40 w-40 drop-shadow-[0_14px_20px_rgba(0,0,0,.35)] sm:h-52 sm:w-52" />
  : <img src={astronautCrew} alt="Amari the astronaut with a learning robot" className="h-40 w-auto object-contain drop-shadow-[0_14px_20px_rgba(0,0,0,.35)] sm:h-52" />);

// "Who is playing?" — the first screen every time the app opens.
const IntroScreen = ({
  onChoosePlayer, playSfx, soundOn, onToggleSound, speak, premiumStatus, lastPlayerId,
}) => (
  <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#050a2b] px-4 py-6 text-white sm:px-8">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(94,76,255,0.55),transparent_28%),radial-gradient(circle_at_16%_70%,rgba(24,167,255,0.28),transparent_34%),linear-gradient(155deg,#070b31_0%,#101464_45%,#170746_100%)]" />
    <div className="absolute inset-0 opacity-90" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.95) 1px, transparent 1.5px)', backgroundSize: '72px 72px' }} />
    <div className="absolute -left-24 -top-20 h-80 w-80 rounded-full border-[38px] border-amber-300/30 bg-orange-300/20" />
    <div className="absolute bottom-[-18%] left-[-8%] h-[38%] w-[116%] rounded-[50%] border-t-4 border-purple-300/35 bg-gradient-to-b from-indigo-600/60 to-fuchsia-950/90" />

    <div className="absolute right-4 top-4 z-30 sm:right-8 sm:top-8">
      <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
    </div>

    <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-3rem)] max-w-5xl flex-col items-center justify-center gap-6 text-center">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300 sm:text-base">Amari Discovery</p>
        <h1 className="mt-2 text-4xl font-black leading-tight tracking-tight drop-shadow-[0_6px_0_rgba(38,25,112,.75)] sm:text-6xl">
          Welcome <span className="bg-gradient-to-b from-sky-200 to-sky-400 bg-clip-text text-transparent">Amari</span> or{' '}
          <span className="bg-gradient-to-b from-amber-200 to-orange-400 bg-clip-text text-transparent">Askia!</span>
        </h1>
        <button
          type="button"
          onClick={() => speak(LITTLE_LINES.welcome)}
          className="mt-3 rounded-full px-4 py-2 text-lg font-bold text-indigo-100 transition hover:bg-white/10"
          aria-describedby="welcome-voice-status"
        >
          🔊 Who is playing today?
        </button>
        <p id="welcome-voice-status" className="min-h-5 text-xs font-bold text-amber-200" role="status" aria-live="polite">
          {premiumStatus === 'unavailable' ? 'This narration clip is not available yet.' : ''}
        </p>
      </div>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
        {PLAYERS.map((player) => (
          <button
            key={player.id}
            type="button"
            onClick={() => { playSfx('welcome'); speak(player.greeting); onChoosePlayer(player.id); }}
            className={`group relative flex flex-col items-center overflow-hidden rounded-[2.2rem] border-4 bg-gradient-to-br ${player.color} px-5 pb-6 pt-5 shadow-[0_10px_0_rgba(0,0,0,.25),0_24px_50px_rgba(0,0,0,.35)] transition hover:-translate-y-1 active:translate-y-2 active:shadow-none ${lastPlayerId === player.id ? 'border-white' : 'border-white/40'}`}
          >
            <span className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/20" />
            <span className="relative transition group-hover:scale-105"><PlayerArt player={player} /></span>
            <strong className="relative mt-2 text-4xl font-black text-white drop-shadow-[0_3px_0_rgba(0,0,0,.3)] sm:text-5xl">{player.name}</strong>
            <span className="relative mt-1 text-base font-bold text-white/90">{player.tagline}</span>
          </button>
        ))}
      </div>
    </main>
  </div>
);

export default IntroScreen;
