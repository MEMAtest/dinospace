import { useEffect, useRef, useState } from 'react';
import { Search, Volume2 } from 'lucide-react';
import LittleGameShell from '../LittleGameShell.jsx';
import { artUrl } from '../littleArt.js';
import { DINO_NAMES, LITTLE_LINES, shadowFound } from '../../../data/littleGames.js';

const ASKIA = artUrl('askia-detective');
const PORTRAIT_SCENE = artUrl('bg-dino-portrait');
const SPOTS = Object.freeze([
  { id: 'left', x: 21, y: 57 },
  { id: 'middle', x: 50, y: 59 },
  { id: 'right', x: 79, y: 57 },
]);
const DINOS = Object.freeze(['trike', 'bronto', 'stego', 'trex', 'ankylo']);

const DetectiveDino = ({ kind, className = '', style }) => (
  <img src={artUrl(`detective-${kind}`)} alt={DINO_NAMES[kind]} style={style} className={`object-contain ${className}`} draggable={false} />
);

const Footprint = ({ className = '', style }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} fill="currentColor" aria-hidden="true">
    <path d="M23 66 Q21 55 33 51 Q50 43 67 51 Q79 55 77 66 Q77 85 50 88 Q23 85 23 66Z M27 55 Q16 43 16 23 Q16 16 22 16 Q28 16 30 22 L40 51Z M44 48 L44 14 Q44 6 50 6 Q56 6 56 14 L56 48Z M60 51 L70 22 Q72 16 78 16 Q84 16 84 23 Q84 43 73 55Z" />
  </svg>
);

const Trail = ({ spot, strength }) => (
  <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
    {(strength.includes('short') ? [1, 2] : [0, 1, 2]).map((step) => {
      const t = (step + 1) / 4;
      return (
        <Footprint
          key={step}
          className={`absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 -rotate-12 text-amber-300 drop-shadow-[0_2px_3px_rgba(83,48,0,.9)] sm:h-14 sm:w-14 ${strength === 'bright' ? 'animate-pulse' : ''}`}
          style={{ left: `${50 + (spot.x - 50) * t}%`, top: `${84 + (spot.y - 84) * t}%`, opacity: strength.startsWith('faint') ? 0.72 : 1 }}
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
      art: <DetectiveDino kind={species} className="mx-auto w-full drop-shadow-2xl" />,
      firstAttempt: wrongCount.current === 0,
      independent: wrongCount.current === 0,
      hints: wrongCount.current,
    });
  };

  const prompt = found ? `You found ${DINO_NAMES[species]}!` : clueShown ? 'Follow the footprints!' : 'Find the hidden dinosaur!';

  return (
    <div className="absolute inset-0 overflow-hidden text-center">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950/30" />
      <button type="button" onClick={() => speak?.(clueShown ? LITTLE_LINES.dinoTrail : LITTLE_LINES.dinoPrompt)} aria-label={`Hear again: ${prompt}`} className="absolute left-1/2 top-[11%] z-20 flex w-max max-w-[90%] -translate-x-1/2 items-center gap-2 rounded-[1.5rem] border-4 border-white bg-white/95 px-4 py-2 text-base font-black leading-tight text-blue-950 shadow-xl sm:top-[13%] sm:px-6 sm:text-2xl">
        <span>{prompt}</span><Volume2 className="h-6 w-6 shrink-0 text-blue-600" />
      </button>

      {clueShown && !found && <Trail spot={target} strength={config.trail} />}

      {visibleSpots.map((spot) => (
        <button key={spot.id} type="button" onClick={() => inspect(spot)} aria-label={`Look behind the ${spot.id} leaves`} disabled={found} className={`absolute z-10 grid h-[17%] min-h-24 w-[24%] min-w-20 max-w-48 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[50%] border-[3px] transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300 ${wrongSpot === spot.id ? 'animate-shake border-rose-300 bg-rose-300/25' : clueShown ? 'border-white/80 bg-emerald-950/15 hover:bg-white/20' : 'border-white/35 bg-emerald-950/10'} ${clueShown && spot.id === target.id && config.trail === 'bright' ? 'shadow-[0_0_20px_6px_rgba(252,211,77,.75)]' : ''}`} style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
          {!found && <Search className="h-9 w-9 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,.8)] sm:h-12 sm:w-12" strokeWidth={3} />}
        </button>
      ))}

      {found && <DetectiveDino kind={species} className="pointer-events-none absolute z-20 w-[44%] max-w-72 -translate-x-1/2 -translate-y-1/2 animate-pop-in drop-shadow-[0_10px_15px_rgba(0,0,0,.5)]" style={{ left: `${target.x}%`, top: `${target.y}%` }} />}

      <img src={ASKIA} alt="Askia holding a magnifying glass" className="pointer-events-none absolute bottom-[1%] left-[-5%] z-10 h-[38%] max-h-80 w-[50%] max-w-80 object-contain drop-shadow-xl" />

      {!clueShown ? (
        <button type="button" onClick={showClue} aria-label="Inspect the dinosaur footprint" className="absolute bottom-[8%] left-1/2 z-20 grid h-20 w-20 -translate-x-1/2 place-items-center rounded-full border-4 border-amber-100 bg-amber-300 text-amber-900 shadow-[0_0_22px_8px_rgba(252,211,77,.75)] animate-pulse sm:h-28 sm:w-28">
          <Footprint className="h-3/4 w-3/4" />
        </button>
      ) : (
        <div className="pointer-events-none absolute bottom-[5%] right-[3%] z-20 max-w-[53%] rounded-2xl border-4 border-white bg-white/90 px-3 py-2 text-sm font-black text-emerald-900 shadow-xl sm:px-5 sm:text-xl">
          {found ? 'Great detective!' : wrongSpot ? 'Try another hiding place!' : 'Look where the trail ends.'}
        </div>
      )}
    </div>
  );
};

const LittleDinoDetective = (props) => (
  <LittleGameShell {...props} gameId="dino" title="Dino Detective" intro={LITTLE_LINES.dinoIntro} finishLine={LITTLE_LINES.dinoFound} background="from-sky-400 via-emerald-300 to-lime-300" backgroundArtPortrait={PORTRAIT_SCENE} playFullBleed startArt={<img src={ASKIA} alt="Askia ready to look for dinosaurs" className="mx-auto max-h-[36vh] w-full object-contain drop-shadow-2xl" />} renderUnlock={() => <DetectiveDino kind="trike" className="h-full w-full" />}>
    {({ round, playId, config, complete, mistake }) => (
      <DetectiveRound key={`${playId}-${round}`} round={round} playId={playId} config={config} complete={complete} mistake={mistake} speak={props.speak} playSfx={props.playSfx} />
    )}
  </LittleGameShell>
);

export default LittleDinoDetective;
