export const LEARNING_WORLDS = Object.freeze([
  { id: 'read-write', title: 'Read & Write', desc: 'Sounds, spelling, stories and handwriting', icon: '📚', color: 'from-fuchsia-500 via-pink-500 to-rose-500', gameIds: ['letters', 'phonics', 'words', 'trace', 'hangman', 'storybooks'] },
  { id: 'maths', title: 'Maths Missions', desc: 'Numbers, jumps and clever problems', icon: '🚀', color: 'from-orange-400 via-amber-500 to-yellow-500', gameIds: ['counting', 'fuelup', 'firerescue', 'addition', 'subtraction', 'math', 'numberline', 'timeteller'] },
  { id: 'explore', title: 'Explore & Languages', desc: 'Space, dinosaurs, languages and the wider world', icon: '🪐', color: 'from-indigo-600 via-blue-600 to-cyan-500', gameIds: ['solar', 'astronaut', 'dino', 'german', 'worldmap'] },
  { id: 'creative', title: 'Creative Lab', desc: 'Draw, mix and build pictures', icon: '🎨', color: 'from-violet-500 via-purple-500 to-indigo-500', gameIds: ['rocketbuilder', 'dinojigsaw', 'jet', 'colormix', 'puzzle'] },
  { id: 'thinking', title: 'Thinking & Play', desc: 'Patterns, memory and strategy', icon: '🧠', color: 'from-emerald-500 via-teal-500 to-cyan-600', gameIds: ['memory', 'shadowmatch', 'ladder', 'pattern', 'oddoneout', 'chess', 'spot', 'tictactoe'] },
]);

export const PRACTICE_GAME_IDS = Object.freeze(['words', 'phonics', 'trace', 'counting', 'addition', 'numberline', 'memory', 'pattern']);
export const BONUS_GAME_IDS = Object.freeze(['hangman', 'spot', 'tictactoe']);

// Askia's home screen: picture-led games that need no reading. New
// little-explorer games come first, then the gentlest existing games (which
// run on their starter level for this profile).
export const LITTLE_EXPLORER_GAME_IDS = Object.freeze([
  'dinojigsaw', 'shadowmatch', 'rocketbuilder', 'fuelup', 'firerescue', 'ladder',
  'dino', 'memory', 'counting', 'pattern',
]);
