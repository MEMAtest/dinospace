// Each child gets their own stars, streak, favourites and recent games.
// Amari keeps the original `amari_*` storage keys so existing progress is
// preserved; Askia's keys use their own prefix.
export const PLAYERS = Object.freeze([
  Object.freeze({
    id: 'amari',
    name: 'Amari',
    view: 'explorer',
    tagline: 'Big explorer missions',
    greeting: 'Hi Amari! Let’s explore!',
    color: 'from-sky-400 via-blue-500 to-indigo-600',
  }),
  Object.freeze({
    id: 'askia',
    name: 'Askia',
    view: 'little',
    tagline: 'Dinos, rockets and fire trucks',
    greeting: 'Hi Askia! Let’s play!',
    color: 'from-orange-400 via-amber-400 to-yellow-300',
  }),
]);

export const ACTIVE_PLAYER_KEY = 'amari_discovery_active_player';

export const getPlayer = (id) => PLAYERS.find((player) => player.id === id) || null;

export const playerStorageKey = (playerId, key) => `${getPlayer(playerId)?.id || 'amari'}_${key}`;

export const isLittleExplorer = (playerOrId) => {
  const player = typeof playerOrId === 'string' ? getPlayer(playerOrId) : playerOrId;
  return player?.view === 'little';
};
