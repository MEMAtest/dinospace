import { BookOpen, Brain, Palette, Rocket, Sparkles, Sun } from 'lucide-react';
import KidPopIcon from './KidPopIcon.jsx';

const WORLD_ICON_CONFIG = {
  'read-write': [BookOpen, 'text-fuchsia-600'],
  maths: [Rocket, 'text-orange-600'],
  explore: [Sun, 'text-indigo-600'],
  creative: [Palette, 'text-violet-600'],
  thinking: [Brain, 'text-emerald-600'],
};

const WorldIcon = ({ world, compact = false }) => {
  const [IconComponent] = WORLD_ICON_CONFIG[world.id] || [Sparkles, 'text-indigo-600'];
  return <KidPopIcon Icon={IconComponent} label={`${world.title} icon`} kind={`world-${world.id}`} compact={compact} world />;
};

export default WorldIcon;
