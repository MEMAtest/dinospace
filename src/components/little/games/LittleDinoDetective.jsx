import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import LittleGameShell from '../LittleGameShell.jsx';
import { Dino } from '../DinoArt.jsx';
import { artUrl } from '../littleArt.js';
import { LITTLE_LINES, shadowFound } from '../../../data/littleGames.js';

const SCENE = artUrl('bg-dino');
const ASKIA = artUrl('askia-detective');
const SPOTS = Object.freeze([
  { id: 'left', x: 21, y: 60 },
  { id: 'middle', x: 51, y: 64 },
  { id: 'right', x: 82, y: 60 },
]);
const DINOS = Object.freeze(['trike', 'bronto', 'stego', 'trex', 'ankylo']);

// A three-toed print is also used as the trail clue. It is an SVG rather than
// text or an emoji, so every device shows the same recognizable shape.
const Footprint = ({ className = '' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden="true">
    <path d="M42 60 31 25c-2-6-8-9-13-6-5 3-6 8-3 14l15 32-12-12c-4-4-10-4-13 1-3 4-2 9 2 13l23 22c7 7 15 10 24 10s17-3 24-10l23-22c4-4 5-9 2-13-3-5-9-5-13-1L70 65l15-32c3-6 2-11-3-14-5-3-11 0-13 6L58 60l-2-42c0-7-4-11-10-11s-10 4-10 11l6 42Z" transform="translate(4 -4) scale(.88)" />
  </svg>
);

const Trail = ({ spot, strength }) => (
  <div className="pointer-events-none absolute inset-0" aria-hidden="true">
    {[0, 1, 2].map((step) => {
      const t = (step + 1) / 4;
      return (
        <Footprint
          key={step}
          className={`absolute w-[8%] -translate-x-1/2 -translate-y-1/2 rotate-[-12deg] text-amber-300 drop-shadow-[0_2px_2px_rgba(83,48,0,.9)] ${strength === 'bright' ? 'animate-pulse' : ''}`}
          style={{ left: `${50 + (spot.x - 50) * t}%`, top: `${92 + (spot.y - 92) * t}%`, opacity: strength === 'faint' ? 0.65 : 1 }}
        />
      );
    })}
  </div>
);

const DetectiveRound = ({ round, playId, config, complete, mistake, speak, playSfx }) => {
  const visibleSpots = config.spots === 2 ? [SPOTS[0], SPOTS[2]] : SPOTS;
  const target = visibleSpots[(round + playId) % visibleSpots.length];
  const species = DINOS[(round + playId - 1) % DINOS.length];
  const [clueShown, setClueShown] = useState(false);
  const [found, setFound] = useState(false);
  const [wrongSpot, setWrongSpot] = useState(null);
  const wrongCount = useRef(0);

  useEffect(() => { speak?.(LITTLE_LINES.dinoPrompt); }, [speak]);

  const showClue = () => {
    if (clueShown || found) return;
    setClueShown(true);
    playSfx?.('pop');
    speak?.(LITTLE_LINES.dinoTrail);
  };

  const inspect = (spot) => {
    if (found) return;
    if (!clueShown) { showClue(); return; }
    if (spot.id !== target.id) {
      wrongCount.current += 1;
      mistake();
      setWrongSpot(spot.id);
      playSfx?.('oops');
      speak?.(LITTLE_LINES.dinoWrong);
      return;
    }
    setFound(true);
    setWrongSpot(null);
    playSfx?.('roar');
    speak?.(shadowFound(species));
    complete({
      praise: false,
      delay: 2100,
      art: <Dino kind={species} className="mx-auto w-full drop-shadow-2xl" />,
      firstAttempt: wrongCount.current === 0,
      independent: wrongCount.current === 0,
      hints: wrongCount.current,
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-3 px-3 pb-4 sm:gap-4">
      <button
        type="button"
        onClick={() => speak?.(clueShown ? LITTLE_LINES.dinoTrail : LITTLE_LINES.dinoPrompt)}
        className="rounded-full border-4 border-white bg-white/95 px-5 py-2 text-center text-lg font-black text-blue-950 shadow-xl sm:text-2xl"
      >
        {found ? 'You found the dinosaur!' : clueShown ? 'Follow the footprints!' : 'Tap the footprint!'} 🔊
      </button>
      <div className="relative w-full overflow-hidden rounded-[1.5rem] border-[5px] border-white shadow-[0_12px_35px_rgba(8,47,73,.35)]" style={{ aspectRatio: '4 / 3' }}>
        <img src={SCENE} alt="Tropical jungle with three leafy hiding places" className="absolute inset-0 h-full w-full object-cover" />
        {clueShown && <Trail spot={target} strength={config.trail} />}
        {visibleSpots.map((spot) => (
          <button
            key={spot.id}
            type="button"
            onClick={() => inspect(spot)}
            aria-label={`Look behind the ${spot.id} leaves`}
            disabled={found}
            className={`absolute grid h-[22%] w-[24%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[50%] border-[3px] transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300 ${wrongSpot === spot.id ? 'animate-shake border-rose-400 bg-rose-300/30' : clueShown ? 'border-white/70 bg-emerald-100/10 hover:bg-white/20' : 'border-white/40 bg-emerald-950/10'} ${clueShown && spot.id === target.id && config.trail === 'bright' ? 'shadow-[0_0_20px_6px_rgba(252,211,77,.7)]' : ''}`}
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
          >
            {found && spot.id === target.id
              ? <Dino kind={species} className="w-full animate-pop-in drop-shadow-2xl" />
              : <Search className="h-9 w-9 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,.8)] sm:h-12 sm:w-12" strokeWidth={3} />}
          </button>
        ))}
        {!clueShown && (
          <button
            type="button"
            onClick={showClue}
            aria-label="Inspect the dinosaur footprint"
            className="absolute bottom-[3%] left-1/2 grid h-[18%] w-[16%] min-w-14 -translate-x-1/2 place-items-center rounded-full border-4 border-amber-200 bg-amber-300 text-amber-900 shadow-[0_0_22px_8px_rgba(252,211,77,.75)] animate-pulse"
          >
            <Footprint className="h-3/4 w-3/4" />
          </button>
        )}
        {found && (
          <div className="pointer-events-none absolute left-1/2 top-[18%] -translate-x-1/2 rounded-full border-4 border-amber-300 bg-white/95 px-5 py-2 text-center text-xl font-black text-emerald-700 shadow-xl animate-pop-in sm:text-3xl">
            ⭐ Found it! ⭐
          </div>
        )}
      </div>
      <div className="flex w-full items-end justify-between gap-2">
        <img src={ASKIA} alt="Askia holding a magnifying glass" className="h-20 w-20 object-contain drop-shadow-xl sm:h-32 sm:w-32" />
        <div className="rounded-2xl border-4 border-white bg-white/85 px-4 py-2 text-center text-sm font-black text-emerald-900 shadow-lg sm:text-lg">
          {found ? 'Great detective!' : wrongSpot ? 'Not here. Try the trail!' : clueShown ? 'Look where the trail ends.' : 'A clue is on the path!'}
        </div>
      </div>
    </div>
  );
};

const LittleDinoDetective = (props) => (
  <LittleGameShell
    {...props}
    gameId="dino"
    title="Dino Detective"
    intro={LITTLE_LINES.dinoIntro}
    finishLine={LITTLE_LINES.dinoFound}
    background="from-sky-400 via-emerald-300 to-lime-300"
    startArt={<img src={ASKIA} alt="Askia ready to look for dinosaurs" className="mx-auto max-h-[36vh] w-full object-contain drop-shadow-2xl" />}
    renderUnlock={() => <Dino kind="trike" className="h-full w-full" />}
  >
    {({ round, playId, config, complete, mistake }) => (
      <DetectiveRound
        key={`${playId}-${round}`}
        round={round}
        playId={playId}
        config={config}
        complete={complete}
        mistake={mistake}
        speak={props.speak}
        playSfx={props.playSfx}
      />
    )}
  </LittleGameShell>
);

export default LittleDinoDetective;
