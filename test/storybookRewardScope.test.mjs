import test from 'node:test';
import assert from 'node:assert/strict';
import { storyCompletionReceiptBelongsToPlayer } from '../src/data/storybookRewardScope.js';

test('completion receipts remain bound to their original outer App player', () => {
  const receipt = { id: 'storybook-amari-moon-map-1', rewardPlayerId: 'askia' };
  assert.equal(storyCompletionReceiptBelongsToPlayer(receipt, 'amari', 'askia'), true);
  assert.equal(storyCompletionReceiptBelongsToPlayer(receipt, 'amari', 'amari'), false);
  assert.equal(storyCompletionReceiptBelongsToPlayer(receipt, 'amari', 'sammy'), false);
});

test('older receipts without a receiver fall back to the historical reader child', () => {
  const legacyReceipt = { id: 'storybook-amari-river-1', points: 1 };
  assert.equal(storyCompletionReceiptBelongsToPlayer(legacyReceipt, 'amari', 'amari'), true);
  assert.equal(storyCompletionReceiptBelongsToPlayer(legacyReceipt, 'amari', 'askia'), false);
  assert.equal(storyCompletionReceiptBelongsToPlayer({ points: 1 }, 'amari', 'amari'), false);
});
