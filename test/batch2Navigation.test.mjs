import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';

test('Puzzle Pop and Spot advance one chapter at a time even when later chapters are unlocked', async () => {
  const vite = await createServer({
    configFile: new URL('../vite.config.js', import.meta.url).pathname,
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  });
  try {
    const [{ nextPuzzleChapterIndex }, { nextSpotChapterIndex }] = await Promise.all([
      vite.ssrLoadModule('/src/components/games/PuzzlePlay.jsx'),
      vite.ssrLoadModule('/src/components/games/SpotDifference.jsx'),
    ]);
    for (const nextChapter of [nextPuzzleChapterIndex, nextSpotChapterIndex]) {
      assert.equal(nextChapter(0, 3), 1, 'replaying Starter must offer Growing next');
      assert.equal(nextChapter(1, 3), 2, 'Growing must offer Challenge next');
      assert.equal(nextChapter(2, 3), 2, 'Challenge must not advance beyond the final chapter');
    }
  } finally {
    await vite.close();
  }
});
