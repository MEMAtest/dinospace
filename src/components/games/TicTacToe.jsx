import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Home, Lightbulb, RotateCcw, Sparkles, Users } from 'lucide-react';
import { SoundToggle } from '../shared/index.jsx';

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const getResult = (board) => {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line, draw: false };
    }
  }
  return board.every(Boolean)
    ? { winner: null, line: [], draw: true }
    : { winner: null, line: [], draw: false };
};

const emptySpaces = (board) =>
  board.map((value, index) => (value ? null : index)).filter((value) => value !== null);

const findTacticalMove = (board, mark) => {
  for (const index of emptySpaces(board)) {
    const next = [...board];
    next[index] = mark;
    if (getResult(next).winner === mark) return index;
  }
  return null;
};

const pickBotMove = (board, difficulty) => {
  const spaces = emptySpaces(board);
  if (!spaces.length) return null;

  if (difficulty === 'rookie' && Math.random() < 0.72) {
    return spaces[Math.floor(Math.random() * spaces.length)];
  }

  const winningMove = findTacticalMove(board, 'O');
  if (winningMove !== null) return winningMove;

  const blockingMove = findTacticalMove(board, 'X');
  if (blockingMove !== null) return blockingMove;

  if (!board[4]) return 4;
  const corners = [0, 2, 6, 8].filter((index) => !board[index]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  return spaces[Math.floor(Math.random() * spaces.length)];
};

const MARK_DETAILS = {
  X: { icon: '🦖', name: 'Dino', color: 'text-lime-300', bg: 'from-lime-300 to-emerald-400' },
  O: { icon: '🚀', name: 'Rocket', color: 'text-cyan-300', bg: 'from-cyan-300 to-blue-400' },
};

const TicTacToe = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate, onGameEvent }) => {
  const [mode, setMode] = useState('bot');
  const [difficulty, setDifficulty] = useState('space-ace');
  const [board, setBoard] = useState(() => Array(9).fill(null));
  const [turn, setTurn] = useState('X');
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [hint, setHint] = useState(null);
  const completedBoardRef = useRef('');
  const result = useMemo(() => getResult(board), [board]);
  const roundOver = Boolean(result.winner || result.draw);
  const botThinking = mode === 'bot' && turn === 'O' && !roundOver;

  const playerName = useCallback(
    (mark) => {
      if (mark === 'X') return 'Dino';
      return mode === 'bot' ? 'Nova Bot' : 'Rocket';
    },
    [mode],
  );

  const resetRound = useCallback(() => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setHint(null);
    completedBoardRef.current = '';
    playSfx('swish');
  }, [playSfx]);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setScores({ X: 0, O: 0, draws: 0 });
    setBoard(Array(9).fill(null));
    setTurn('X');
    setHint(null);
    completedBoardRef.current = '';
    playSfx('click');
  };

  const placeMark = useCallback((index, mark = turn) => {
    if (roundOver || board[index] || botThinking) return;
    if (mode === 'bot' && turn === 'O') return;

    setBoard((current) => {
      if (current[index]) return current;
      const next = [...current];
      next[index] = mark;
      return next;
    });
    setTurn(mark === 'X' ? 'O' : 'X');
    setHint(null);
    playSfx(mark === 'X' ? 'pop' : 'launch');
  }, [board, botThinking, mode, playSfx, roundOver, turn]);

  useEffect(() => {
    if (mode !== 'bot' || turn !== 'O' || roundOver) return undefined;

    const timer = setTimeout(() => {
      setBoard((current) => {
        const move = pickBotMove(current, difficulty);
        if (move === null) return current;
        const next = [...current];
        next[move] = 'O';
        return next;
      });
      setTurn('X');
      playSfx('launch');
    }, 650);

    return () => clearTimeout(timer);
  }, [difficulty, mode, playSfx, roundOver, turn]);

  useEffect(() => {
    if (!roundOver) return;
    const boardKey = board.join('-');
    if (completedBoardRef.current === boardKey) return;
    completedBoardRef.current = boardKey;

    const timer = setTimeout(() => {
      onGameEvent?.('tictactoe', 'round_completed');
      if (result.draw) {
        setScores((current) => ({ ...current, draws: current.draws + 1 }));
        playSfx('chime');
        speak('A brilliant draw. You both played well!');
        onCelebrate('Brilliant battle!', 3, 250, 'tictactoe');
        return;
      }

      setScores((current) => ({ ...current, [result.winner]: current[result.winner] + 1 }));
      const winnerName = playerName(result.winner);
      speak(`${winnerName} wins the round!`);
      if (result.winner === 'X' || mode === 'buddy') {
        playSfx('complete');
        onCelebrate(`${winnerName} wins!`, 10, 250, 'tictactoe');
      } else {
        playSfx('oops');
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [board, mode, onCelebrate, onGameEvent, playSfx, playerName, result, roundOver, speak]);

  const showHint = () => {
    if (roundOver || botThinking || (mode === 'bot' && turn === 'O')) return;
    const winningMove = findTacticalMove(board, turn);
    const blockingMove = findTacticalMove(board, turn === 'X' ? 'O' : 'X');
    const bestMove = winningMove ?? blockingMove ?? (!board[4] ? 4 : emptySpaces(board)[0]);
    setHint(bestMove ?? null);
    playSfx('sparkle');
    speak(winningMove !== null ? 'You can win this turn!' : 'Try the glowing square.');
  };

  const statusText = result.draw
    ? 'Cosmic draw!'
    : result.winner
      ? `${playerName(result.winner)} wins!`
      : botThinking
        ? 'Nova Bot is thinking…'
        : `${playerName(turn)}’s turn`;

  return (
    <div className="min-h-screen overflow-hidden bg-[#07132f] text-white relative">
      <div className="absolute inset-0 ttt-starfield pointer-events-none" />
      <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-lime-400/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />

      <header className="relative z-20 flex items-center justify-between px-4 sm:px-7 pt-4">
        <button
          onClick={onBack}
          className="game-icon-button"
          aria-label="Back to all games"
        >
          <Home />
        </button>
        <div className="text-center">
          <div className="text-xs sm:text-sm uppercase tracking-[0.28em] text-cyan-200 font-bold">
            Dino Space Arena
          </div>
          <h1 className="text-2xl sm:text-4xl font-black">Cosmic Tic-Tac-Toe</h1>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} className="!bg-white/15 !text-white" />
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl gap-5 px-4 py-5 lg:grid-cols-[280px_minmax(320px,520px)_280px] lg:items-center">
        <section className="order-2 lg:order-1 rounded-[2rem] border border-white/15 bg-white/10 p-4 backdrop-blur-xl shadow-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200 font-bold mb-3">Choose your game</p>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            <button
              onClick={() => changeMode('bot')}
              className={`ttt-option ${mode === 'bot' ? 'ttt-option-active' : ''}`}
              aria-pressed={mode === 'bot'}
            >
              <Bot size={22} /> <span><strong>Solo mission</strong><small>Play Nova Bot</small></span>
            </button>
            <button
              onClick={() => changeMode('buddy')}
              className={`ttt-option ${mode === 'buddy' ? 'ttt-option-active' : ''}`}
              aria-pressed={mode === 'buddy'}
            >
              <Users size={22} /> <span><strong>Two players</strong><small>Share this device</small></span>
            </button>
          </div>

          {mode === 'bot' && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200 font-bold mb-2">Bot level</p>
              <div className="flex rounded-2xl bg-black/20 p-1">
                {[
                  ['rookie', 'Rookie'],
                  ['space-ace', 'Space Ace'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => { setDifficulty(value); resetRound(); }}
                    className={`flex-1 rounded-xl px-2 py-2 text-sm font-bold transition ${
                      difficulty === value ? 'bg-cyan-300 text-slate-900' : 'text-white/70 hover:text-white'
                    }`}
                    aria-pressed={difficulty === value}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 rounded-2xl bg-black/20 p-4 text-sm text-white/75">
            <p className="font-bold text-white">How to win</p>
            <p className="mt-1">Make a line of three across, down, or diagonally.</p>
          </div>
        </section>

        <section className="order-1 lg:order-2">
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{roundOver && result.draw ? '🤝' : MARK_DETAILS[turn].icon}</span>
              <span className="font-black text-lg" aria-live="polite">{statusText}</span>
            </div>
            {!roundOver && <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/70">Round score</span>}
          </div>

          <div
            className="grid grid-cols-3 gap-2 sm:gap-3 rounded-[2rem] border border-white/15 bg-white/10 p-3 sm:p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            role="grid"
            aria-label="Tic-tac-toe board"
          >
            {board.map((mark, index) => {
              const isWinner = result.line.includes(index);
              const isHint = hint === index && !mark;
              return (
                <button
                  key={index}
                  onClick={() => placeMark(index)}
                  disabled={Boolean(mark) || roundOver || botThinking || (mode === 'bot' && turn === 'O')}
                  className={`ttt-cell ${isWinner ? 'ttt-cell-win' : ''} ${isHint ? 'ttt-cell-hint' : ''}`}
                  role="gridcell"
                  aria-label={`Square ${index + 1}${mark ? `, ${playerName(mark)}` : ', empty'}`}
                >
                  {mark && (
                    <span className={`ttt-mark bg-gradient-to-br ${MARK_DETAILS[mark].bg} bg-clip-text text-transparent`}>
                      {MARK_DETAILS[mark].icon}
                    </span>
                  )}
                  {isHint && <Sparkles className="text-amber-300 animate-pulse" size={30} />}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button onClick={showHint} disabled={roundOver || botThinking} className="ttt-action">
              <Lightbulb size={20} /> Hint
            </button>
            <button onClick={resetRound} className="ttt-action">
              <RotateCcw size={20} /> {roundOver ? 'Next round' : 'Restart'}
            </button>
          </div>
        </section>

        <section className="order-3 rounded-[2rem] border border-white/15 bg-white/10 p-4 backdrop-blur-xl shadow-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200 font-bold mb-3">Mission score</p>
          <div className="space-y-3">
            {[
              ['X', 'Dino', scores.X],
              ['O', mode === 'bot' ? 'Nova Bot' : 'Rocket', scores.O],
            ].map(([mark, name, score]) => (
              <div key={mark} className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{MARK_DETAILS[mark].icon}</span>
                  <div><p className="font-black">{name}</p><p className="text-xs text-white/55">{mark} team</p></div>
                </div>
                <span className={`text-3xl font-black ${MARK_DETAILS[mark].color}`}>{score}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-2 text-white/65">
              <span className="font-bold">🤝 Draws</span>
              <span className="text-xl font-black">{scores.draws}</span>
            </div>
          </div>
          <button
            onClick={() => { setScores({ X: 0, O: 0, draws: 0 }); resetRound(); }}
            className="mt-4 w-full rounded-xl border border-white/15 py-2 text-sm font-bold text-white/65 hover:bg-white/10 hover:text-white transition"
          >
            Reset match score
          </button>
        </section>
      </main>
    </div>
  );
};

export default TicTacToe;
