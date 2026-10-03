import AmariSoundSafari from './components/games/AmariSoundSafari.jsx';
import AmariSpellingStudio from './components/games/AmariSpellingStudio.jsx';
import AmariColorMixingLab from './components/games/AmariColorMixingLab.jsx';
import AmariOddOneOut from './components/games/AmariOddOneOut.jsx';

export default function AmariBatch5Route({ gameId, ...props }) {
  if (gameId === 'phonics') return <AmariSoundSafari {...props} />;
  if (gameId === 'words') return <AmariSpellingStudio {...props} />;
  if (gameId === 'colormix') return <AmariColorMixingLab {...props} />;
  if (gameId === 'oddoneout') return <AmariOddOneOut {...props} />;
  return null;
}
