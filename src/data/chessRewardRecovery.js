/** Drain pending Chess receipts against the latest durable progress snapshot. */
export async function drainChessRewardReceipts({ getPendingReceipts, claimReceipt, isCurrent = () => true }) {
  if (typeof getPendingReceipts !== 'function' || typeof claimReceipt !== 'function' || typeof isCurrent !== 'function') {
    return { ok: false, claimedIds: [], error: 'Chess reward recovery is unavailable.' };
  }

  const claimedIds = [];
  const attemptedIds = new Set();
  while (isCurrent()) {
    const pending = getPendingReceipts();
    if (!Array.isArray(pending)) return { ok: false, claimedIds, error: 'Chess reward recovery could not read pending receipts.' };
    if (!pending.length) return { ok: true, claimedIds };

    const receipt = pending.find(({ id }) => !attemptedIds.has(id));
    if (!receipt) return { ok: false, claimedIds, receipt: pending[0], error: 'A Chess receipt remained pending after its claim completed.' };
    attemptedIds.add(receipt.id);

    let result;
    try { result = await claimReceipt(receipt); }
    catch { result = null; }
    if (!isCurrent()) return { ok: false, cancelled: true, claimedIds };
    if (!result || result.ok !== true) return { ok: false, claimedIds, receipt, error: result?.error || 'Chess reward claim could not be confirmed.' };
    claimedIds.push(receipt.id);
  }

  return { ok: false, cancelled: true, claimedIds };
}
