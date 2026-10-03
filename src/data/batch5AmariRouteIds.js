const AMARI_BATCH5_ROUTE_IDS = new Set(['phonics', 'words', 'colormix', 'oddoneout']);

export const hasAmariBatch5Route = (playerId, gameId) => playerId === 'amari' && AMARI_BATCH5_ROUTE_IDS.has(gameId);
