import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, Volume2 } from 'lucide-react';
import { SHADOW_DINO_ART } from '../../../data/shadowMatchArt.js';
import LittleGameShell from '../LittleGameShell.jsx';
import { Dino } from '../DinoArt.jsx';
import { artUrl } from '../littleArt.js';
import { chooseLittleDinoRound, DINO_NAMES, LITTLE_LINES, shadowFound } from '../../../data/littleGames.js';
import { DETECTIVE_HABITATS, DETECTIVE_ROSTER, detectiveFieldActivities, littleDinoAttribution, littleDinoCanAskForClearerTrail, littleDinoTrailStrength } from '../../../data/littleDinoDetective.js';

const ASKIA = artUrl('askia-detective');
const PORTRAIT_SCENE = artUrl('bg-dino-portrait');
const SPOTS = Object.freeze([
  { id: 'left', x: 21, y: 57 },
  { id: 'middle', x: 50, y: 59 },
  { id: 'right', x: 79, y: 57 },
]);
const creatureName = kind => DINO_NAMES[kind] ?? DETECTIVE_ROSTER.find(creature => creature.id === kind)?.name;

const DetectiveDino = ({ kind, className = '', style }) => {
  const art = artUrl(`detective-${kind}`) ?? SHADOW_DINO_ART[kind];
  return art
    ? <img src={art} alt={creatureName(kind)} style={style} className={`object-contain ${className}`} draggable={false} />
    : <div style={style} className={className}><Dino kind={kind} title={creatureName(kind)} className="h-full w-full" /></div>;
};

const Footprint = ({ className = '', style }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} fill="currentColor" aria-hidden="true">
    <path d="M23 66 Q21 55 33 51 Q50 43 67 51 Q79 55 77 66 Q77 85 50 88 Q23 85 23 66Z M27 55 Q16 43 16 23 Q16 16 22 16 Q28 16 30 22 L40 51Z M44 48 L44 14 Q44 6 50 6 Q56 6 56 14 L56 48Z M60 51 L70 22 Q72 16 78 16 Q84 16 84 23 Q84 43 73 55Z" />
  </svg>
);

const Trail = ({ spot, strength }) => (
  <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true" data-detective-trail={strength}>
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

const TrackRow = ({ count }) => (
  <span className="flex flex-wrap justify-center gap-1 text-amber-800" aria-hidden="true">
    {Array.from({ length: count }, (_, index) => <Footprint key={index} className="h-7 w-7" />)}
  </span>
);

const DetectiveFieldNotes = ({ species, field, helped, sayFound, sayDevice, playSfx }) => {
  const [activity, setActivity] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const cluePrompt = `Which creature has ${field.clue.feature}?`;
  const name = creatureName(species);
  const start = kind => {
    if (kind !== activity) {
      setActivity(kind);
      setFeedback(null);
    }
    sayDevice(kind === 'tracks' ? 'How many tracks can you count?' : cluePrompt);
  };
  const choose = correct => {
    if (feedback === 'correct') return;
    setFeedback(correct ? 'correct' : 'retry');
    playSfx?.(correct ? 'success' : 'pop');
    sayDevice(correct ? 'You worked it out!' : 'Have another look.');
  };
  return <div className="space-y-2 rounded-2xl bg-emerald-50 p-2 text-emerald-950 sm:p-4">
    <p className="text-lg font-black">You found {name}!</p>
    {helped && <p className="text-sm font-bold">You used a clearer trail.</p>}
    <button type="button" onClick={sayFound} className="mx-auto flex min-h-12 items-center gap-2 rounded-xl bg-white px-3 font-black">
      <Volume2 size={19} aria-hidden="true" /> Hear the name
    </button>
    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Detective activities">
      <button type="button" aria-pressed={activity === 'tracks'} onClick={() => start('tracks')} className="flex min-h-12 items-center justify-center gap-1 rounded-xl bg-amber-100 px-2 font-black text-amber-950 aria-pressed:ring-2 aria-pressed:ring-amber-700">
        <Footprint className="h-6 w-6 shrink-0" /> Count tracks
      </button>
      <button type="button" aria-pressed={activity === 'feature'} onClick={() => start('feature')} className="flex min-h-12 items-center justify-center gap-1 rounded-xl bg-sky-100 px-2 font-black text-sky-950 aria-pressed:ring-2 aria-pressed:ring-sky-700">
        <Search size={19} className="shrink-0" aria-hidden="true" /> Spot the feature
      </button>
    </div>
    {activity && <section className="space-y-2 rounded-xl bg-white p-2" aria-label={activity === 'tracks' ? 'Count tracks activity' : 'Spot the feature activity'}>
      <h3 className="font-black">{activity === 'tracks' ? 'How many tracks?' : cluePrompt}</h3>
      {activity === 'tracks' && <div data-detective-count><TrackRow count={field.tracks} /></div>}
      <div className="grid grid-cols-2 gap-2">
        {activity === 'tracks' ? field.counts.map(count => (
          <button key={count} type="button" aria-label={`${count} tracks`} onClick={() => choose(count === field.tracks)} disabled={feedback === 'correct'} className="min-h-12 rounded-xl border-2 border-amber-200 bg-amber-50 px-2 font-black text-amber-950">
            <span className="text-xl">{count}</span><TrackRow count={count} />
          </button>
        )) : field.pictures.map(kind => (
          <button key={kind} type="button" aria-label={creatureName(kind)} onClick={() => choose(kind === field.clue.answer)} disabled={feedback === 'correct'} className="grid min-h-12 place-items-center rounded-xl border-2 border-sky-200 bg-sky-50 px-1 font-black text-sky-950">
            <DetectiveDino kind={kind} className="h-20 w-full" />
          </button>
        ))}
      </div>
      {feedback && <p role="status" className="font-black">{feedback === 'correct' ? 'You worked it out!' : 'Have another look.'}</p>}
    </section>}
  </div>;
};

const DetectiveRound = ({ round, playId, runSeed, config, complete, mistake, speak, sayDevice, playSfx }) => {
  const visibleSpots = config.spots === 2 ? [SPOTS[0], SPOTS[2]] : SPOTS;
  const choice = chooseLittleDinoRound(round, playId, visibleSpots.length, DETECTIVE_ROSTER.length, runSeed);
  const target = visibleSpots[choice?.targetIndex || 0];
  const { id: species, habitat } = DETECTIVE_ROSTER[choice?.speciesIndex || 0];
  const setting = DETECTIVE_HABITATS[habitat];
  const field = detectiveFieldActivities(choice?.speciesIndex || 0, round, visibleSpots.length);
  const sayFound = () => {
    if (DINO_NAMES[species]) speak?.(shadowFound(species));
    else sayDevice(`You found ${creatureName(species)}!`);
  };
  const [clueShown, setClueShown] = useState(false);
  const [found, setFound] = useState(false);
  const [wrongSpot, setWrongSpot] = useState(null);
  const [strongClue, setStrongClue] = useState(false);
  const wrongCount = useRef(0);
  const hintCount = useRef(0);

  useEffect(() => { speak?.(LITTLE_LINES.dinoPrompt); }, [speak]);

  const showClue = () => {
    if (clueShown || found) return;
    setClueShown(true);
    playSfx?.('pop');
    if (habitat === 'forest') speak?.(LITTLE_LINES.dinoTrail);
    else sayDevice('Follow the footprints. Where is the dinosaur hiding?');
  };

  const showStrongerClue = () => {
    if (!clueShown || found || strongClue || config.trail === 'bright') return;
    hintCount.current += 1;
    setStrongClue(true);
    playSfx?.('pop');
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
    sayFound();
    const attribution = littleDinoAttribution({ wrongAttempts: wrongCount.current, optionalClues: hintCount.current });
    complete({
      praise: false,
      delay: 2100,
      art: <DetectiveDino kind={species} className="pointer-events-none mx-auto h-32 w-32 object-contain drop-shadow-2xl" />,
      review: <DetectiveFieldNotes species={species} field={field} helped={hintCount.current > 0} sayFound={sayFound} sayDevice={sayDevice} playSfx={playSfx} />,
      ...attribution,
    });
  };

  const prompt = found ? `You found ${creatureName(species)}!` : clueShown ? 'Follow the footprints!' : 'Find the hidden dinosaur!';

  return (
    <div className="absolute inset-0 overflow-hidden text-center" data-detective-habitat={habitat}>
      {setting.art && <img src={artUrl(setting.art)} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />}
      <p className="absolute left-1/2 top-[max(4.5rem,9%)] z-20 w-max max-w-[90%] -translate-x-1/2 rounded-full bg-slate-950/85 px-3 py-1 text-sm font-black text-white">{setting.mark} {setting.name}</p>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950/30" />
      <p className="absolute left-1/2 top-[max(11rem,25%)] z-20 -translate-x-1/2 rounded-full border-2 border-white/90 bg-emerald-950/85 px-4 py-1 text-sm font-black text-white shadow-lg" aria-live="polite">Dinosaur {round + 1} of {config.rounds}</p>
      <button type="button" onClick={() => {
        if (clueShown && habitat !== 'forest') sayDevice('Follow the footprints. Where is the dinosaur hiding?');
        else speak?.(clueShown ? LITTLE_LINES.dinoTrail : LITTLE_LINES.dinoPrompt);
      }} aria-label={`Hear again: ${prompt}`} className="absolute left-1/2 top-[max(6.5rem,14%)] z-20 flex w-max max-w-[90%] -translate-x-1/2 items-center gap-2 rounded-[1.5rem] border-4 border-white bg-white/95 px-4 py-2 text-base font-black leading-tight text-blue-950 shadow-xl sm:px-6 sm:text-2xl">
        <span>{prompt}</span><Volume2 className="h-6 w-6 shrink-0 text-blue-600" />
      </button>

      {clueShown && !found && <Trail spot={target} strength={littleDinoTrailStrength(config, strongClue)} />}

      {visibleSpots.map((spot) => (
        <button key={spot.id} type="button" onClick={() => inspect(spot)} aria-label={`Look behind the ${spot.id} ${setting.cover}`} disabled={found} className={`absolute z-10 grid h-[17%] min-h-24 w-[24%] min-w-20 max-w-48 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[50%] border-[3px] transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300 ${wrongSpot === spot.id ? 'animate-shake border-rose-300 bg-rose-300/25' : clueShown ? 'border-white/80 bg-emerald-950/15 hover:bg-white/20' : 'border-white/35 bg-emerald-950/10'} ${clueShown && spot.id === target.id && (strongClue || config.trail === 'bright') ? 'shadow-[0_0_20px_6px_rgba(252,211,77,.75)]' : ''}`} style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
          {!found && <span aria-hidden="true" className="text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,.8)] sm:text-5xl">{setting.mark}</span>}
        </button>
      ))}

      {found && <DetectiveDino kind={species} className="pointer-events-none absolute z-20 w-[44%] max-w-72 -translate-x-1/2 -translate-y-1/2 animate-pop-in drop-shadow-[0_10px_15px_rgba(0,0,0,.5)]" style={{ left: `${target.x}%`, top: `${target.y}%` }} />}

      <img src={ASKIA} alt="Askia holding a magnifying glass" className="pointer-events-none absolute bottom-[1%] left-[-5%] z-10 h-[38%] max-h-80 w-[50%] max-w-80 object-contain drop-shadow-xl" />

      {!clueShown ? (
        <button type="button" onClick={showClue} aria-label="Inspect the dinosaur footprint" className="absolute bottom-[8%] left-1/2 z-20 grid h-20 w-20 -translate-x-1/2 place-items-center rounded-full border-4 border-amber-100 bg-amber-300 text-amber-900 shadow-[0_0_22px_8px_rgba(252,211,77,.75)] animate-pulse sm:h-28 sm:w-28">
          <Footprint className="h-3/4 w-3/4" />
        </button>
      ) : (
        <div className="absolute bottom-[5%] right-[3%] z-20 max-w-[52%] rounded-2xl border-4 border-white bg-white/95 px-3 py-2 text-sm font-black text-emerald-900 shadow-xl sm:px-5 sm:text-xl">
          <p aria-live="polite">{found ? 'Great detective!' : wrongSpot ? 'Try another hiding place!' : strongClue ? 'Follow the highlighted trail.' : 'Look where the trail ends.'}</p>
          {!found && littleDinoCanAskForClearerTrail(config, strongClue) && <button type="button" onClick={showStrongerClue} className="mt-2 min-h-12 w-full rounded-xl border-2 border-amber-800 bg-amber-300 px-2 text-xs font-black text-amber-950 shadow sm:text-base">Show a clearer trail</button>}
        </div>
      )}
    </div>
  );
};

const LittleDinoDetective = (props) => {
  const [visitSeed] = useState(() => Math.floor(Math.random() * 0xffffffff) || 1);
  const { speak, cancelNarration, soundOn } = props;
  const soundEnabled = useRef(soundOn);
  const speakOffline = useCallback(text => {
    window.speechSynthesis?.cancel();
    speak?.(text, { premium: false });
  }, [speak]);
  useEffect(() => {
    soundEnabled.current = soundOn;
    if (!soundOn) window.speechSynthesis?.cancel();
  }, [soundOn]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  // New field prompts use the browser voice without requesting a paid clip.
  // Read the current preference even when the shell holds an already-rendered review.
  const sayDevice = text => {
    if (!soundEnabled.current || !window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') return;
    cancelNarration?.();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  };
  return (
    <LittleGameShell {...props} gameId="dino" title="Dino Detective" intro={LITTLE_LINES.dinoIntro} finishLine={LITTLE_LINES.dinoFound} background="from-sky-400 via-emerald-300 to-lime-300" backgroundArtPortrait={PORTRAIT_SCENE} playFullBleed pairSafeProgress manualNext compactStart compactDone manualNextPrompt="Ready to search for the next dinosaur?" manualNextReviewLabel="Dinosaur find" startArt={<img src={ASKIA} alt="Askia ready to look for dinosaurs" className="pointer-events-none mx-auto h-full max-h-full w-full object-contain drop-shadow-2xl" />} renderUnlock={() => <DetectiveDino kind="trike" className="h-full w-full" />}>
      {({ round, playId, config, complete, mistake }) => (
        <DetectiveRound key={`${playId}-${round}`} round={round} playId={playId} runSeed={visitSeed} config={config} complete={complete} mistake={mistake} speak={speakOffline} sayDevice={sayDevice} playSfx={props.playSfx} />
      )}
    </LittleGameShell>
  );
};

export default LittleDinoDetective;
