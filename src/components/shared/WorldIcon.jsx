import '../home/discoveryVisuals.css';

const WorldIcon = ({ world, compact = false }) => (
  <span className={`discovery-world-icon ${compact ? 'discovery-world-icon--compact' : ''}`}>
    <img src={`/art/catalog-v3/world-${world.id}.webp`} alt={`${world.title} illustrated world`} width="768" height="512" decoding="async" draggable={false} />
  </span>
);

export default WorldIcon;
