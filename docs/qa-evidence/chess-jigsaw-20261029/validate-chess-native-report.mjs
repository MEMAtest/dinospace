import { readFileSync } from 'node:fs';
import { replayChessHistory } from '../../../src/data/chessGameRules.js';

const report = JSON.parse(readFileSync(0, 'utf8'));
const errors = [];
for (const [index, item] of (report.completedOpeningCases || []).entries()) {
  if (!Array.isArray(item.history) || typeof (item.finalSavedFen || item.fen) !== 'string') {
    errors.push({ index, error: 'Actual opening history or saved FEN is missing.' });
    continue;
  }
  const replayed = replayChessHistory(item.history);
  if (!replayed.ok) errors.push({ index, error: replayed.error || 'Saved opening history contains an illegal move.' });
  else if (replayed.game.fen() !== (item.finalSavedFen || item.fen)) errors.push({ index, error: 'Replay of actual saved moves does not match the reported saved FEN.' });
}
if (Array.isArray(report.scholarMateHistory) && report.scholarMateFen) {
  const replayed = replayChessHistory(report.scholarMateHistory);
  if (!replayed.ok) errors.push({ game: 'scholar-mate', error: replayed.error || 'Completed history contains an illegal move.' });
  else if (replayed.game.fen() !== report.scholarMateFen || !replayed.game.isCheckmate()) errors.push({ game: 'scholar-mate', error: 'Completed move history does not match the held checkmate board.' });
}
process.stdout.write(`${JSON.stringify({ passed: errors.length === 0, openingsChecked: (report.completedOpeningCases || []).length, scholarMateChecked: Array.isArray(report.scholarMateHistory), errors })}\n`);
