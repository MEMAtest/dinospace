import { chooseComputerMove } from '../data/chessGameAi.js';

self.addEventListener('message', (event) => {
  const request = event.data;
  if (!request || typeof request.requestId !== 'string') return;
  const result = chooseComputerMove({
    history: request.history,
    difficulty: request.difficulty,
    computerColor: request.computerColor,
    seed: request.seed,
  });
  self.postMessage({ requestId: request.requestId, ...result });
});
