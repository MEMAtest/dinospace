export const LEARNING_WORLDS = Object.freeze([
  { id: 'read-write', title: 'Read & Write', desc: 'Sounds, spelling, stories and handwriting', icon: '📚', color: 'from-fuchsia-500 via-pink-500 to-rose-500', gameIds: ['letters', 'phonics', 'words', 'trace', 'hangman', 'storybooks'] },
  { id: 'maths', title: 'Maths Missions', desc: 'Numbers, jumps and clever problems', icon: '🚀', color: 'from-orange-400 via-amber-500 to-yellow-500', gameIds: ['counting', 'addition', 'subtraction', 'math', 'numberline', 'timeteller'] },
  { id: 'explore', title: 'Explore & Languages', desc: 'Space, dinosaurs and German words', icon: '🪐', color: 'from-indigo-600 via-blue-600 to-cyan-500', gameIds: ['solar', 'astronaut', 'dino', 'german'] },
  { id: 'creative', title: 'Creative Lab', desc: 'Draw, mix and build pictures', icon: '🎨', color: 'from-violet-500 via-purple-500 to-indigo-500', gameIds: ['jet', 'colormix', 'puzzle'] },
  { id: 'thinking', title: 'Thinking & Play', desc: 'Patterns, memory and strategy', icon: '🧠', color: 'from-emerald-500 via-teal-500 to-cyan-600', gameIds: ['memory', 'pattern', 'oddoneout', 'chess', 'spot', 'tictactoe'] },
]);

export const PRACTICE_GAME_IDS = Object.freeze(['words', 'phonics', 'trace', 'counting', 'addition', 'numberline', 'memory', 'pattern']);
export const BONUS_GAME_IDS = Object.freeze(['hangman', 'spot', 'tictactoe']);
