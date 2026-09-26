import { useEffect, useMemo, useRef, useState } from 'react';
import LittleGameShell from '../LittleGameShell.jsx';
import DragItem from '../DragItem.jsx';
import HandHint from '../HandHint.jsx';
import { Dino, DinoScene } from '../DinoArt.jsx';
import { useRoundHint } from '../useRoundHint.js';
import { pointInRect, shuffled, shuffledOutOfOrder } from '../littleKit.js';
import { DINO_NAMES, JIGSAW_SCENES, LITTLE_LINES } from '../../../data/littleGames.js';

const W = 400;
const H = 300;

const JigsawRound = ({ scene, grid: [cols, rows], complete, mistake, speak, playSfx, firstRound }) => {
  const pieces = useMemo(() => Array.from({ length: cols * rows }, (_, index) => ({
    id: index,
    viewBox: `${(index % cols) * (W / cols)} ${Math.floor(index / cols) * (H / rows)} ${W / cols} ${H / rows}`,
  })), [cols, rows]);
  const [tray, setTray] = useState(() => shuffledOutOfOrder(pieces.map((piece) => piece.id)));
  const [placed, setPlaced] = useState([]);
  const [selected, setSelected] = useState(null);
  const [wrongSlot, setWrongSlot] = useState(null);
  const slotRefs = useRef([]);
  const trayRef = useRef(null);
  const hint = useRoundHint({ demo: firstRound });
  const solved = placed.length === pieces.length;
  const nextPiece = tray[0];

  useEffect(() => {
    speak?.(firstRound ? LITTLE_LINES.jigsawIntro : scene.prompt);
  }, [firstRound, scene.prompt, speak]);

  const latest = useRef({ complete, speak, playSfx });
  useEffect(() => { latest.current = { complete, speak, playSfx }; });

  // The finished picture comes alive: the dinosaur hops out and roars.
  useEffect(() => {
    if (!solved) return undefined;
    const timer = setTimeout(() => {
      latest.current.playSfx?.('roar');
      latest.current.speak?.(DINO_NAMES[scene.dino]);
      latest.current.complete({ praise: false, delay: 2100, art: <DinoScene scene={scene.id} className="w-full rounded-[1.6rem] border-[6px] border-white shadow-2xl" /> });
    }, 350);
    return () => clearTimeout(timer);
  }, [scene.dino, scene.id, solved]);

  const tryPlace = (pieceId, slotIndex) => {
    if (slotIndex == null || slotIndex < 0 || placed.includes(slotIndex)) return false;
    if (slotIndex !== pieceId) {
      playSfx?.('oops');
      setWrongSlot(slotIndex);
      speak?.(LITTLE_LINES.jigsawWrong);
      hint.mistake();
      mistake();
      setTimeout(() => setWrongSlot(null), 450);
      return false;
    }
    playSfx?.('pop');
    hint.touch();
    setPlaced((current) => [...current, pieceId]);
    setTray((current) => current.filter((id) => id !== pieceId));
    setSelected(null);
    return true;
  };

  const slotAt = (point) => slotRefs.current.findIndex((el) => el && pointInRect(point, el.getBoundingClientRect(), 6));
  const trayCols = pieces.length <= 2 ? 2 : pieces.length <= 6 ? 3 : 4;
  const glowSlot = hint.strongHint ? (selected ?? nextPiece) : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-4 px-3 pb-6 lg:max-w-5xl lg:flex-row lg:items-start">
      <div className="relative w-full max-w-lg overflow-visible lg:flex-1">
        <div className={`relative overflow-hidden rounded-[1.6rem] border-[6px] border-white bg-white/60 shadow-2xl ${solved ? 'ring-8 ring-amber-300' : ''}`} style={{ aspectRatio: '4 / 3' }}>
          <DinoScene scene={scene.id} className="absolute inset-0 h-full w-full opacity-30 grayscale" />
          <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
            {pieces.map((piece) => {
              const isPlaced = placed.includes(piece.id);
              return (
                <button
                  key={piece.id}
                  type="button"
                  ref={(el) => { slotRefs.current[piece.id] = el; }}
                  data-slot={piece.id}
                  onClick={() => { if (selected != null) tryPlace(selected, piece.id); }}
                  aria-label={isPlaced ? 'Piece placed' : 'Empty picture space'}
                  className={`relative ${solved ? '' : 'border border-dashed border-white/80'} ${wrongSlot === piece.id ? 'animate-shake bg-rose-300/50' : ''} ${glowSlot === piece.id && !isPlaced ? 'animate-cell-pulse bg-amber-200/80' : ''}`}
                >
                  {isPlaced && <DinoScene scene={scene.id} viewBox={piece.viewBox} preserveAspectRatio="none" className="absolute inset-0 h-full w-full animate-pop-in" />}
                </button>
              );
            })}
          </div>
        </div>
        {solved && (
          <div className="pointer-events-none absolute inset-x-0 -bottom-6 flex justify-center">
            <Dino kind={scene.dino} className="w-2/3 animate-dino-hop drop-shadow-2xl" />
          </div>
        )}
      </div>

      {!solved && (
        <div ref={trayRef} className="grid w-full max-w-lg gap-3 rounded-[1.6rem] bg-white/50 p-3 shadow-inner lg:w-80" style={{ gridTemplateColumns: `repeat(${trayCols}, 1fr)` }}>
          {tray.map((pieceId) => {
            const piece = pieces[pieceId];
            return (
              <DragItem
                key={pieceId}
                label="Picture piece"
                data={{ piece: pieceId }}
                selected={selected === pieceId}
                onPickUp={hint.touch}
                onTap={() => { playSfx?.('tap'); setSelected(pieceId); }}
                onDrop={(point) => tryPlace(pieceId, slotAt(point))}
                className={`relative overflow-hidden rounded-xl border-4 bg-white shadow-lg ${selected === pieceId ? 'border-amber-400 ring-4 ring-amber-300' : 'border-white'}`}
                style={{ aspectRatio: `${rows * 4} / ${cols * 3}` }}
              >
                <DinoScene scene={scene.id} viewBox={piece.viewBox} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" />
              </DragItem>
            );
          })}
        </div>
      )}
      <HandHint
        show={hint.showHint && !solved && nextPiece != null}
        from={() => trayRef.current?.querySelector(`[data-piece="${nextPiece}"]`)}
        to={() => slotRefs.current[nextPiece]}
        mode="drag"
      />
    </div>
  );
};

const DinoJigsaw = (props) => {
  const { speak, playSfx } = props;
  const [order] = useState(() => shuffled(JIGSAW_SCENES));

  return (
    <LittleGameShell
      {...props}
      gameId="dinojigsaw"
      title="Dino Jigsaw"
      intro={LITTLE_LINES.jigsawIntro}
      background="from-amber-300 via-orange-200 to-lime-200"
      startArt={<DinoScene scene={order[0].id} className="w-full rounded-[1.6rem] border-[6px] border-white shadow-2xl" />}
      renderUnlock={(config) => (config.unlock === 'picture'
        ? <DinoScene scene={JIGSAW_SCENES[config.scenes - 1].id} className="h-full w-full rounded-xl border-4 border-white" />
        : null)}
    >
      {({ round, complete, mistake, playId, config }) => {
        // Only pictures unlocked at this level; the newest one comes first.
        const unlocked = JIGSAW_SCENES.slice(0, config.scenes);
        const newest = unlocked[unlocked.length - 1];
        const pool = [newest, ...order.filter((scene) => unlocked.includes(scene) && scene !== newest)];
        const scene = pool[(round + playId - 1) % pool.length];
        return (
          <JigsawRound
            key={`${playId}-${round}`}
            scene={scene}
            grid={config.grids[round]}
            complete={complete}
            mistake={mistake}
            speak={speak}
            playSfx={playSfx}
            firstRound={round === 0}
          />
        );
      }}
    </LittleGameShell>
  );
};

export default DinoJigsaw;
