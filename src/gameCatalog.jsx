import letterRocketArt from './assets/little/fuel-rocket.webp';
import { lazy } from 'react';
import {
  AudioLines, BookOpen, Brain, CarFront, Clock3, Crown, Gamepad2, Globe2, Grid3X3, Hash, Minus,
  Palette, PenLine, Plus, Puzzle, Rocket, ScanSearch, Search, Shapes, Sparkles, Sun, Truck, Type,
} from 'lucide-react';
import DinoDetective from './components/games/DinoDetective.jsx';
import JetSkyShapes from './components/games/JetSkyShapes.jsx';
import GermanGarage from './components/games/GermanGarage.jsx';
import MonsterMath from './components/games/MonsterMath.jsx';
import LetterLaunch from './components/games/LetterLaunch.jsx';
import MemoryMatch from './components/games/MemoryMatch.jsx';
import PatternParade from './components/games/PatternParade.jsx';
import LetterTrace from './components/games/LetterTrace.jsx';
import SoundSafari from './components/games/SoundSafari.jsx';
import SpotDifference from './components/games/SpotDifference.jsx';
import PuzzlePlay from './components/games/PuzzlePlay.jsx';
import AdditionAdventure from './components/games/AdditionAdventure.jsx';
import SubtractionStation from './components/games/SubtractionStation.jsx';
import AstronautAcademy from './components/games/AstronautAcademy.jsx';
import CountTheStars from './components/games/CountTheStars.jsx';
import WordBuilder from './components/games/WordBuilder.jsx';
import ColorMixingLab from './components/games/ColorMixingLab.jsx';
import OddOneOut from './components/games/OddOneOut.jsx';
import TimeTeller from './components/games/TimeTeller.jsx';
import NumberLineJump from './components/games/NumberLineJump.jsx';
import ChessExplorers from './components/games/ChessExplorers.jsx';
import TicTacToe from './components/games/TicTacToe.jsx';
import CurriculumQuest from './components/games/CurriculumQuest.jsx';
import DinoHangman from './components/games/Hangman.jsx';
import StorybookStudio from './components/games/StorybookStudio.jsx';
import AmariColorMixingLab from './components/games/AmariColorMixingLab.jsx';
import AmariOddOneOut from './components/games/AmariOddOneOut.jsx';
import AmariSoundSafari from './components/games/AmariSoundSafari.jsx';
import AmariSpellingStudio from './components/games/AmariSpellingStudio.jsx';
import DinoJigsaw from './components/little/games/DinoJigsaw.jsx';
import ShadowMatch from './components/little/games/ShadowMatch.jsx';
import RocketBuilder from './components/little/games/RocketBuilder.jsx';
import FuelUp from './components/little/games/FuelUp.jsx';
import FireRescue from './components/little/games/FireRescue.jsx';
import LadderRescue from './components/little/games/LadderRescue.jsx';
import { Dino } from './components/little/DinoArt.jsx';
import { FireTruck, Flame, FuelUpIcon, RocketBlueprint } from './components/little/VehicleArt.jsx';
import titleTrex from './assets/dinos/title-trex.png';
import titleTrike from './assets/dinos/title-trike.png';
import { ArtIcon, GameIcon } from './components/shared/GameIcons.jsx';

const SolarSystem = lazy(() => import('./components/games/SolarSystem.jsx'));

const icon = (Icon, tone, label, kind = 'default') => <GameIcon Icon={Icon} tone={tone} label={label} kind={kind} image={kind === 'letters' ? letterRocketArt : undefined} />;

export const GAME_MENU_ITEMS = [
  { id: 'tictactoe', icon: icon(Grid3X3, 'text-cyan-600', 'Cosmic noughts and crosses', 'tictactoe'), title: 'Cosmic Tic-Tac-Toe', desc: 'Dinos vs rockets!', color: 'bg-gradient-to-br from-slate-800 via-indigo-800 to-cyan-700', category: 'Quick Think', badge: 'NEW' , component: TicTacToe },
  { id: 'hangman', icon: <GameIcon image={titleTrex} alt="Rex the complete T-Rex" label="Rex the dinosaur" kind="hangman" />, title: 'Dino Hangman', desc: 'Rescue dinosaur words!', color: 'bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-700', category: 'Words', badge: 'NEW' , component: DinoHangman },
  { id: 'dino', icon: <GameIcon image={titleTrike} alt="Trix the complete Triceratops" label="Trix the triceratops" kind="dino" />, title: 'Dino Detective', desc: 'Find hidden dinosaurs!', color: 'bg-gradient-to-br from-green-400 to-emerald-500', category: 'Discover' , component: DinoDetective },
  { id: 'jet', icon: icon(Rocket, 'text-sky-600', 'Rocket drawing shapes', 'jet'), title: 'Sky Shapes', desc: 'Draw with a jet!', color: 'bg-gradient-to-br from-sky-400 to-blue-500', category: 'Create' , component: JetSkyShapes },
  { id: 'solar', icon: icon(Sun, 'text-amber-500', 'The solar system', 'solar'), title: 'Solar System', desc: 'Visit the planets', color: 'bg-gradient-to-br from-indigo-500 to-violet-600', category: 'Discover' , component: SolarSystem },
  { id: 'german', icon: icon(CarFront, 'text-red-600', 'German garage car', 'german'), title: 'German Garage', desc: 'Explore colours, vehicles, parts and directions in German', color: 'bg-gradient-to-br from-red-400 to-rose-500', category: 'Words' , component: GermanGarage },
  { id: 'math', icon: icon(Truck, 'text-orange-600', 'Monster math truck', 'math'), title: 'Monster Math', desc: 'Count, add and solve stories', color: 'bg-gradient-to-br from-orange-400 to-red-500', category: 'Maths' , component: MonsterMath },
  { id: 'letters', icon: icon(Rocket, 'text-teal-600', 'Letter launch rocket', 'letters'), title: 'Letter Launch', desc: 'Letters and sounds', color: 'bg-gradient-to-br from-teal-400 to-cyan-500', category: 'Words' , component: LetterLaunch },
  { id: 'memory', icon: icon(Brain, 'text-rose-600', 'Memory match brain', 'memory'), title: 'Memory Match', desc: 'Find the pairs', color: 'bg-gradient-to-br from-rose-400 to-pink-500', category: 'Quick Think' , component: MemoryMatch },
  { id: 'pattern', icon: icon(Shapes, 'text-amber-600', 'Pattern shapes', 'pattern'), title: 'Pattern Parade', desc: 'Finish the pattern', color: 'bg-gradient-to-br from-amber-400 to-orange-500', category: 'Quick Think' , component: PatternParade },
  { id: 'spot', icon: icon(ScanSearch, 'text-indigo-700', 'Find the difference', 'spot'), title: 'Spot the Difference', desc: 'Find what changed', color: 'bg-gradient-to-br from-indigo-400 to-blue-600', category: 'Quick Think' , component: SpotDifference },
  { id: 'puzzle', icon: icon(Puzzle, 'text-amber-600', 'Picture puzzle', 'puzzle'), title: 'Puzzle Pop', desc: 'Build the picture!', color: 'bg-gradient-to-br from-yellow-400 to-amber-500', category: 'Quick Think' , component: PuzzlePlay },
  { id: 'trace', icon: icon(PenLine, 'text-blue-700', 'Letter tracing pencil', 'trace'), title: 'Letter Trace', desc: 'Trace big and small letters', color: 'bg-gradient-to-br from-blue-400 to-indigo-500', category: 'Words' , component: LetterTrace },
  { id: 'phonics', icon: icon(AudioLines, 'text-emerald-700', 'Hear the sounds', 'phonics'), title: 'Sound Safari', desc: 'Match the sounds', color: 'bg-gradient-to-br from-emerald-400 to-green-600', category: 'Words' , component: SoundSafari, amariComponent: AmariSoundSafari },
  { id: 'addition', icon: icon(Plus, 'text-teal-700', 'Addition plus', 'addition'), title: 'Addition Adventure', desc: 'Add it up!', color: 'bg-gradient-to-br from-teal-500 to-emerald-600', category: 'Maths' , component: AdditionAdventure },
  { id: 'subtraction', icon: icon(Minus, 'text-violet-700', 'Subtraction minus', 'subtraction'), title: 'Subtraction Station', desc: 'Take it away!', color: 'bg-gradient-to-br from-violet-500 to-purple-700', category: 'Maths' , component: SubtractionStation },
  { id: 'astronaut', icon: icon(Gamepad2, 'text-purple-700', 'Astronaut mission', 'astronaut'), title: 'Astronaut Academy', desc: 'Explore space heroes', color: 'bg-gradient-to-br from-purple-600 to-indigo-800', category: 'Discover' , component: AstronautAcademy },
  { id: 'worldmap', icon: icon(Globe2, 'text-sky-700', 'Curriculum Quest world map', 'worldmap'), title: 'Curriculum Quest', desc: 'Geography, history and science', color: 'bg-gradient-to-br from-sky-500 to-indigo-600', category: 'Discover', badge: 'NEW' , component: CurriculumQuest },
  { id: 'counting', icon: icon(Hash, 'text-indigo-700', 'Count the stars', 'counting'), title: 'Count the Stars', desc: 'Tap and count!', color: 'bg-gradient-to-br from-indigo-600 to-blue-800', category: 'Maths' , component: CountTheStars },
  { id: 'words', icon: icon(Type, 'text-pink-700', 'Spelling letters', 'words'), title: 'Spelling Studio', desc: 'Learn sounds and spell!', color: 'bg-gradient-to-br from-pink-500 to-rose-600', category: 'Words' , component: WordBuilder, amariComponent: AmariSpellingStudio },
  { id: 'storybooks', icon: icon(BookOpen, 'text-indigo-700', 'Storybook library', 'storybooks'), title: 'Storybook Studio', desc: 'Read, listen and explore!', color: 'bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600', category: 'Words', badge: 'NEW' , component: StorybookStudio },
  { id: 'colormix', icon: icon(Palette, 'text-fuchsia-700', 'Colour mixing palette', 'colormix'), title: 'Colour Mixing Lab', desc: 'Mix colours together!', color: 'bg-gradient-to-br from-fuchsia-500 to-purple-600', category: 'Create' , component: ColorMixingLab, amariComponent: AmariColorMixingLab },
  { id: 'oddoneout', icon: icon(Search, 'text-cyan-700', 'Find the odd one out', 'oddoneout'), title: 'Odd One Out', desc: 'Which one does not belong?', color: 'bg-gradient-to-br from-cyan-500 to-blue-600', category: 'Quick Think' , component: OddOneOut, amariComponent: AmariOddOneOut },
  { id: 'timeteller', icon: icon(Clock3, 'text-lime-700', 'Learning clock', 'timeteller'), title: 'Time Teller', desc: 'Read the clock!', color: 'bg-gradient-to-br from-lime-500 to-green-600', category: 'Maths' , component: TimeTeller },
  { id: 'numberline', icon: icon(Truck, 'text-emerald-700', 'Number line jumper', 'numberline'), title: 'Number Line Jump', desc: 'Hop to the answer!', color: 'bg-gradient-to-br from-emerald-600 to-teal-700', category: 'Maths' , component: NumberLineJump },
  { id: 'chess', icon: icon(Crown, 'text-amber-700', 'Chess crown', 'chess'), title: 'Chess Explorers', desc: 'Learn chess pieces!', color: 'bg-gradient-to-br from-amber-600 to-yellow-800', category: 'Quick Think' , component: ChessExplorers },
];


// Games built for little explorers (ages 3–5). They are also open to older
// players, who get more pieces, bigger numbers and more floors.
export const LITTLE_GAME_ITEMS = [
  { id: 'dinojigsaw', icon: <ArtIcon gameId="dinojigsaw" label="Dino jigsaw"><Dino kind="trex" /></ArtIcon>, title: 'Dino Jigsaw', desc: 'Drag the pieces!', color: 'bg-gradient-to-br from-lime-400 to-green-600', category: 'Dino puzzles', component: DinoJigsaw, little: true },
  { id: 'shadowmatch', icon: <ArtIcon gameId="shadowmatch" label="Dino shadow"><Dino kind="stego" silhouette /></ArtIcon>, title: 'Shadow Match', desc: 'Whose shadow is it?', color: 'bg-gradient-to-br from-violet-500 to-indigo-600', category: 'Dino puzzles', component: ShadowMatch, little: true },
  { id: 'rocketbuilder', icon: <ArtIcon gameId="rocketbuilder" label="Half-built rocket"><RocketBlueprint colour="#ef4444" /></ArtIcon>, title: 'Rocket Builder', desc: 'Build it, then blast off!', color: 'bg-gradient-to-br from-indigo-600 to-sky-500', category: 'Rockets', component: RocketBuilder, little: true },
  { id: 'fuelup', icon: <ArtIcon gameId="fuelup" label="Rocket and fuel"><FuelUpIcon /></ArtIcon>, title: 'Fuel Up', desc: 'Count the fuel cans', color: 'bg-gradient-to-br from-sky-500 to-violet-600', category: 'Rockets', component: FuelUp, little: true },
  { id: 'firerescue', icon: <ArtIcon gameId="firerescue" label="Fire"><Flame /></ArtIcon>, title: 'Fire Truck Rescue', desc: 'Spray out the fires!', color: 'bg-gradient-to-br from-red-500 to-orange-500', category: 'Fire trucks', component: FireRescue, little: true },
  { id: 'ladder', icon: <ArtIcon gameId="ladder" label="Fire truck"><FireTruck /></ArtIcon>, title: 'Ladder Rescue', desc: 'Save the animals!', color: 'bg-gradient-to-br from-rose-500 to-red-600', category: 'Fire trucks', component: LadderRescue, little: true },
];

export const ALL_GAMES = [...LITTLE_GAME_ITEMS, ...GAME_MENU_ITEMS];

export const getGame = (id) => ALL_GAMES.find((game) => game.id === id) || null;
