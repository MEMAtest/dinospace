import { useEffect, useMemo, useRef, useState } from 'react';
import LittleGameShell from '../LittleGameShell.jsx';
import DragItem from '../DragItem.jsx';
import { DinoScene } from '../DinoArt.jsx';
import { pointInRect, shuffled, shuffledOutOfOrder } from '../littleKit.js';
import { JIGSAW_GRIDS, JIGSAW_SCENES, LITTLE_LINES } from '../../../data/littleGames.js';

const W = 400;
const H = 300;

const JigsawRound = ({ scene, grid: [cols, rows], complete, speak, playSfx, firstRound }) => {
  const pieces = useMemo(() => Array.from({ length: cols * rows }, (_, index) => ({
    id: index,
    viewBox: `${(index % cols) * (W / cols)} ${Math.floor(index / cols) * (H / rows)} ${W / cols} ${H / rows}`,
  })), [cols, rows]);
  const [tray, setTray] = useState(() => shuffledOutOfOrder(pieces.map((piece) => piece.id)));
  const [placed, setPlaced] = useState([]);
  const [selected, setSelected] = useState(null);
  const [hintSlot, setHintSlot] = useState(null);
  const [wrongSlot, setWrongSlot] = useState(null);
  const slotRefs = useRef([]);
  const solved = placed.length === pieces.length;

  useEffect(() => {
    speak?.(firstRound ? LITTLE_LINES.jigsawIntro : scene.prompt);
  }, [firstRound, scene.prompt, speak]);

  useEffect(() => {
    if (!solved) return undefined;
    const timer = setTimeout(() => complete(), 500);
    return () => clearTimeout(timer);
  }, [complete, solved]);

  const tryPlace = (pieceId, slotIndex) => {
    if (slotIndex == null || placed.includes(slotIndex)) return false;
    if (slotIndex !== pieceId) {
      playSfx?.('oops');
      setWrongSlot(slotIndex);
      setHintSlot(pieceId);
      speak?.(LITTLE_LINES.jigsawWrong);
      setTimeout(() => setWrongSlot(null), 450);
      return false;
    }
    playSfx?.('pop');
    setPlaced((current) => [...current, pieceId]);
    setTray((current) => current.filter((id) => id !== pieceId));
    setSelected(null);
    setHintSlot(null);
    return true;
  };

  const slotAt = (point) => slotRefs.current.findIndex((el) => el && pointInRect(point, el.getBoundingClientRect(), 6));

  const trayCols = pieces.length <= 2 ? 2 : pieces.length <= 6 ? 3 : 4;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-4 px-3 pb-6 lg:max-w-5xl lg:flex-row lg:items-start">
      <div className={`relative w-full max-w-lg overflow-hidden rounded-[1.6rem] border-[6px] border-white bg-white/60 shadow-2xl lg:flex-1 ${solved ? 'animate-piece-bounce' : ''}`} style={{ aspectRatio: '4 / 3' }}>
        <DinoScene scene={scene.id} className="absolute inset-0 h-full w-full opacity-25 grayscale" />
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
          {pieces.map((piece) => {
            const isPlaced = placed.includes(piece.id);
            return (
              <button
                key={piece.id}
                type="button"
                ref={(el) => { slotRefs.current[piece.id] = el; }}
                data-slot={piece.id}
                onClick={() => selected != null && tryPlace(selected, piece.id)}
                aria-label={isPlaced ? 'Piece placed' : 'Empty picture space'}
                className={`relative border border-dashed border-white/80 ${wrongSlot === piece.id ? 'animate-shake bg-rose-300/40' : ''} ${hintSlot === piece.id && !isPlaced ? 'animate-cell-pulse bg-amber-200/70' : ''}`}
              >
                {isPlaced && (
                  <DinoScene scene={scene.id} viewBox={piece.viewBox} preserveAspectRatio="none" className="absolute inset-0 h-full w-full animate-pop-in" />
                )}
              </button>
            );
          })}
        </div>
        {solved && <div className="pointer-events-none absolute inset-0 grid place-items-center text-7xl animate-float-up">🎉</div>}
      </div>

      <div className="grid w-full max-w-lg gap-3 rounded-[1.6rem] bg-white/50 p-3 shadow-inner lg:w-80" style={{ gridTemplateColumns: `repeat(${trayCols}, 1fr)` }}>
        {tray.map((pieceId) => {
          const piece = pieces[pieceId];
          return (
            <DragItem
              key={pieceId}
              label="Picture piece"
              data={{ piece: pieceId }}
              selected={selected === pieceId}
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
    </div>
  );
};

const DinoJigsaw = (props) => {
  const { bigKid, speak, playSfx } = props;
  const grids = JIGSAW_GRIDS[bigKid ? 'big' : 'little'];
  const [order, setOrder] = useState(() => shuffled(JIGSAW_SCENES));

  return (
    <LittleGameShell
      {...props}
      gameId="dinojigsaw"
      title="Dino Jigsaw"
      intro={LITTLE_LINES.jigsawIntro}
      rounds={grids.length}
      background="from-amber-300 via-orange-200 to-lime-200"
      startArt={<DinoScene scene={order[0].id} className="w-full rounded-[1.6rem] border-[6px] border-white shadow-2xl" />}
    >
      {({ round, complete, playId }) => {
        const scene = order[round % order.length];
        return (
          <JigsawRound
            key={`${playId}-${round}`}
            scene={scene}
            grid={grids[round]}
            complete={(options) => { if (round + 1 >= grids.length) setOrder(shuffled(JIGSAW_SCENES)); complete(options); }}
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
