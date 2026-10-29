/** A receipt can be claimed only by the App player that originally earned it. */
export const storyCompletionReceiptBelongsToPlayer = (receipt, readerChildId, playerId = 'amari') => {
  if (!receipt || typeof receipt.id !== 'string' || !receipt.id) return false;
  const originalPlayer = typeof receipt.rewardPlayerId === 'string' && receipt.rewardPlayerId
    ? receipt.rewardPlayerId
    : readerChildId;
  return typeof originalPlayer === 'string' && originalPlayer === playerId;
};
