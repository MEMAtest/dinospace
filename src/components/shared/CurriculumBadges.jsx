import { Compass, Clock3, Sprout, Check } from 'lucide-react';
import { CURRICULUM_BADGES, loadCurriculumBadges } from '../../data/curriculumBadges.js';
import './CurriculumBadges.css';

export const CurriculumBadge = ({ badge, earned }) => {
  const Icon = badge.module === 'continents' ? Compass : badge.module === 'time-detectives' ? Clock3 : Sprout;
  return <div className={`curriculum-badge curriculum-badge-${badge.tone} ${earned ? 'is-earned' : 'is-locked'}`} aria-label={`${badge.label}: ${earned ? 'collected' : 'finish this path to collect'}`}>
    <div className="curriculum-medallion"><Icon size={36} strokeWidth={2.5} /><span className="curriculum-badge-tier">{badge.tier}</span>{earned && <Check className="curriculum-badge-check" size={18} />}</div>
    <strong>{badge.label}</strong><small>{earned ? 'Collected' : 'Complete this path'}</small>
  </div>;
};

export const CurriculumBadgeCollection = ({ playerId, module, earned = loadCurriculumBadges(playerId) }) => {
  const badges = CURRICULUM_BADGES.filter((badge) => !module || badge.module === module);
  return <section className="curriculum-badge-collection" aria-label="Curriculum explorer badges">
    <div className="curriculum-collection-heading"><h3>Explorer badges</h3><span>{badges.filter((badge) => earned.includes(badge.id)).length} / {badges.length} collected</span></div>
    <div className="curriculum-badge-grid">{badges.map((badge) => <CurriculumBadge key={badge.id} badge={badge} earned={earned.includes(badge.id)} />)}</div>
  </section>;
};
