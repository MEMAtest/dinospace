import { useEffect, useMemo, useRef, useState } from 'react';
import LittleGameShell from '../LittleGameShell.jsx';
import DragItem from '../DragItem.jsx';
import HandHint from '../HandHint.jsx';
import { Dino } from '../DinoArt.jsx';
import { useRoundHint } from '../useRoundHint.js';
import { pointInRect, shuffled, shuffledOutOfOrder } from '../littleKit.js';
import { DINO_NAMES, JIGSAW_SCENES, LITTLE_LINES } from '../../../data/littleGames.js';
import { jigsawAllowsAutomaticHint, jigsawCompletionCredit, jigsawGuideMode, jigsawPlacementIsCorrect, jigsawReviewLine, jigsawTaskLine } from '../../../data/dinoJigsawProgression.js';
import jungleArt from '../../../assets/little/bg-dino.webp';
import trexArt from '../../../assets/little/detective-trex.webp';
import brontoArt from '../../../assets/little/detective-bronto.webp';
import trikeArt from '../../../assets/little/detective-trike.webp';
import stegoArt from '../../../assets/little/detective-stego.webp';
import ankyloArt from '../../../assets/little/detective-ankylo.webp';
import './dinoJigsaw.css';

const DINO_PICTURES = { trex: trexArt, bronto: brontoArt, trike: trikeArt, stego: stegoArt, ankylo: ankyloArt };

const PuzzlePicture = ({ scene, cols = 1, rows = 1, index = 0, className = '' }) => {
  const column = index % cols;
  const row = Math.floor(index / cols);
  return <div className={`dino-jigsaw-picture ${className}`} style={{ width: `${cols * 100}%`, height: `${rows * 100}%`, left: `${-column * 100}%`, top: `${-row * 100}%` }}>
    <img src={jungleArt} alt="" className="dino-jigsaw-picture__scene" />
    {DINO_PICTURES[scene.dino]
      ? <img src={DINO_PICTURES[scene.dino]} alt="" className="dino-jigsaw-picture__character" />
      : <Dino kind={scene.dino} className="dino-jigsaw-picture__character" />}
  </div>;
};

const JigsawRound = ({ scene, grid: [cols, rows], complete, mistake, speak, playSfx, firstRound, bigKid, level, round, rounds }) => {
  const pieces = useMemo(() => Array.from({ length: cols * rows }, (_, id) => ({ id })), [cols, rows]);
  const [tray, setTray] = useState(() => shuffledOutOfOrder(pieces.map((piece) => piece.id)));
  const [placed, setPlaced] = useState([]);
  const [selected, setSelected] = useState(null);
  const [wrongSlot, setWrongSlot] = useState(null);
  const [showPictureClue, setShowPictureClue] = useState(level === 0);
  const [feedback, setFeedback] = useState('');
  const wrongAttempts = useRef(0);
  const usedPictureClue = useRef(false);
  const usedAutoHint = useRef(false);
  const slotRefs = useRef([]);
  const trayRef = useRef(null);
  const hint = useRoundHint({ demo: firstRound });
  const solved = placed.length === pieces.length;
  const nextPiece = tray[0];
  const guideMode = jigsawGuideMode(level);
  const hintPiece = selected ?? nextPiece;
  const automaticHintAllowed = jigsawAllowsAutomaticHint(level);
  const autoHintVisible = automaticHintAllowed && !solved && hint.showHint && hintPiece != null;

  useEffect(() => {
    speak?.(firstRound ? LITTLE_LINES.jigsawIntro : scene.prompt);
  }, [firstRound, scene.prompt, speak]);
  useEffect(() => {
    if (autoHintVisible) usedAutoHint.current = true;
  }, [autoHintVisible]);

  const latest = useRef({ complete, speak, playSfx });
  useEffect(() => { latest.current = { complete, speak, playSfx }; });

  // The finished picture comes alive: the dinosaur hops out and roars.
  useEffect(() => {
    if (!solved) return undefined;
    const timer = setTimeout(() => {
      latest.current.playSfx?.('roar');
      latest.current.speak?.(DINO_NAMES[scene.dino]);
      latest.current.complete({
        praise: false,
        delay: 0,
        art: <div className="dino-jigsaw-preview"><PuzzlePicture scene={scene} /></div>,
        review: <p className="dino-jigsaw-review-line">{jigsawReviewLine(scene)}</p>,
        ...jigsawCompletionCredit({
          wrongAttempts: wrongAttempts.current,
          usedPictureClue: usedPictureClue.current,
          usedAutoHint: usedAutoHint.current,
          starterGuideShown: guideMode === 'full',
        }),
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [guideMode, scene, solved]);

  const tryPlace = (pieceId, slotIndex) => {
    if (slotIndex == null || slotIndex < 0 || placed.includes(slotIndex)) return false;
    if (!jigsawPlacementIsCorrect(pieceId, slotIndex, placed)) {
      wrongAttempts.current += 1;
      playSfx?.('oops');
      setWrongSlot(slotIndex);
      setSelected(pieceId);
      setFeedback('Not that space. Your piece is ready to try again.');
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
    setFeedback('Piece in place. Choose another piece.');
    return true;
  };

  const slotAt = (point) => slotRefs.current.findIndex((el) => el && pointInRect(point, el.getBoundingClientRect(), 6));
  const trayCols = pieces.length <= 2 ? 2 : pieces.length <= 6 ? 3 : 4;
  const glowSlot = automaticHintAllowed && hint.strongHint && !solved ? hintPiece : null;

  return (
    <div className={`dino-jigsaw-stage mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-4 px-3 pb-6 lg:max-w-5xl lg:flex-row lg:items-start ${bigKid ? 'text-lg' : ''}`}>
      <div className={`dino-jigsaw-board-column relative w-full ${bigKid ? 'max-w-xl' : 'max-w-lg'} overflow-visible lg:flex-1`}>
        <div className="dino-jigsaw-task" aria-live="polite"><strong>{jigsawTaskLine(scene)}</strong><span className="dino-jigsaw-round-meta">Round {round + 1}/{rounds} · {cols * rows} pieces</span><span className="dino-jigsaw-instruction">Choose a piece, then its matching space.</span></div>
        <div className="dino-jigsaw-board-controls"><p className="dino-jigsaw-progress" aria-live="polite">{placed.length} of {cols * rows} in place</p>
        {guideMode === 'on-demand' && <button type="button" className="dino-jigsaw-clue-toggle" aria-expanded={showPictureClue} onClick={() => { const next = !showPictureClue; setShowPictureClue(next); if (next) usedPictureClue.current = true; }}>{showPictureClue ? 'Hide picture clue' : 'Show picture clue'}</button>}</div>
        <div className={`dino-jigsaw-board relative overflow-hidden rounded-[1.6rem] border-[9px] border-amber-700 bg-white/60 shadow-2xl ${solved ? 'ring-8 ring-amber-300' : ''}`} style={{ aspectRatio: '4 / 3' }}>
          {guideMode === 'full' && <PuzzlePicture scene={scene} className="opacity-35 grayscale" />}
          <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
            {pieces.map((piece) => {
              const isPlaced = placed.includes(piece.id);
              const row = Math.floor(piece.id / cols) + 1;
              const column = (piece.id % cols) + 1;
              return (
                <button
                  key={piece.id}
                  type="button"
                  ref={(el) => { slotRefs.current[piece.id] = el; }}
                  data-slot={piece.id}
                  onClick={() => { if (selected != null) tryPlace(selected, piece.id); }}
                  aria-label={isPlaced ? `Picture piece placed in row ${row}, column ${column}` : `Empty picture space, row ${row}, column ${column}`}
                  disabled={isPlaced}
                  className={`relative ${solved ? '' : 'border border-dashed border-white/80'} ${wrongSlot === piece.id ? 'animate-shake bg-rose-300/50' : ''} ${glowSlot === piece.id && !isPlaced ? 'animate-cell-pulse bg-amber-200/80' : ''}`}
                >
                  {isPlaced && <PuzzlePicture scene={scene} cols={cols} rows={rows} index={piece.id} className="animate-pop-in" />}
                </button>
              );
            })}
          </div>
        </div>
        {solved && (
          <div className="pointer-events-none absolute inset-x-0 -bottom-6 flex justify-center">
            {DINO_PICTURES[scene.dino] ? <img src={DINO_PICTURES[scene.dino]} alt="" className="w-1/2 animate-dino-hop drop-shadow-2xl" /> : <Dino kind={scene.dino} className="w-2/3 animate-dino-hop drop-shadow-2xl" />}
          </div>
        )}
        {showPictureClue && guideMode === 'on-demand' && !solved && <div className="dino-jigsaw-picture-clue" role="img" aria-label={`${DINO_NAMES[scene.dino]} picture clue`}><span>Picture clue</span><div className="dino-jigsaw-preview"><PuzzlePicture scene={scene} /></div></div>}
      </div>

      {!solved && (
        <div ref={trayRef} className={`dino-jigsaw-tray grid w-full ${bigKid ? 'max-w-xl lg:w-96' : 'max-w-lg lg:w-80'} gap-3 rounded-[1.6rem] p-3 shadow-inner`} style={{ gridTemplateColumns: `repeat(${trayCols}, 1fr)` }} aria-label={`${pieces.length} picture pieces; ${tray.length} left`}>
          {tray.map((pieceId, trayIndex) => {
            return (
              <DragItem
                key={pieceId}
                label={`Loose picture piece ${trayIndex + 1} of ${tray.length} in tray`}
                data={{ piece: pieceId }}
                selected={selected === pieceId}
                onPickUp={hint.touch}
                onTap={() => { playSfx?.('tap'); setSelected(pieceId); setFeedback('Piece selected. Now choose its matching picture space.'); }}
                onDrop={(point) => tryPlace(pieceId, slotAt(point))}
                className={`relative overflow-hidden rounded-xl border-4 bg-white shadow-lg ${selected === pieceId ? 'border-amber-400 ring-4 ring-amber-300' : 'border-white'}`}
                style={{ aspectRatio: `${rows * 4} / ${cols * 3}` }}
              >
                <PuzzlePicture scene={scene} cols={cols} rows={rows} index={pieceId} className="pointer-events-none" />
              </DragItem>
            );
          })}
        </div>
      )}
      <p className="dino-jigsaw-feedback" role="status" aria-live="polite">{feedback || (selected != null ? 'Piece selected. Now choose a picture space.' : 'Choose a picture piece to begin.')}</p>
      <HandHint
        show={autoHintVisible}
        from={() => trayRef.current?.querySelector(`[data-piece="${hintPiece}"]`)}
        to={() => slotRefs.current[hintPiece]}
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
      pairSafeProgress
      manualNext
      compactStart
      compactDone
      manualNextPrompt="Picture complete! Ready to build the next one?"
      manualNextReviewLabel="Dinosaur picture explanation"
      background="from-amber-300 via-orange-200 to-lime-200"
      startArt={<div className="dino-jigsaw-preview"><PuzzlePicture scene={order[0]} /></div>}
      renderUnlock={(config) => (config.unlock === 'picture'
        ? <div className="dino-jigsaw-preview"><PuzzlePicture scene={JIGSAW_SCENES[config.scenes - 1]} /></div>
        : null)}
    >
      {({ round, rounds, complete, mistake, playId, config, level }) => {
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
            bigKid={props.bigKid}
            level={level}
            round={round}
            rounds={rounds}
          />
        );
      }}
    </LittleGameShell>
  );
};

export default DinoJigsaw;
