import { useState } from 'react';
import { PaintBucket } from 'lucide-react';
import { COLOUR_PAINTS } from '../../data/colourLabAdventure.js';

export default function PaintMixer({ scoops, mixed, onAdd, onUse, onFill, onBack }) {
  const [paint, setPaint] = useState(Object.keys(COLOUR_PAINTS)[0]);
  const [apply, setApply] = useState('paint');
  const counts = new Map();
  for (const name of scoops) counts.set(name, (counts.get(name) || 0) + 1);

  return <section className="focus-game-menu" aria-label="Paint mixer">
    <label htmlFor="bucket-paint">Paint to add</label>
    <select id="bucket-paint" value={paint} onChange={event => setPaint(event.target.value)}>
      {Object.keys(COLOUR_PAINTS).map(name => <option key={name}>{name}</option>)}
    </select>
    <div role="img" aria-label={mixed ? 'Your mixed paint' : 'Empty paint bucket'} data-mix-swatch
      className="creative-paint-bucket" style={{ backgroundColor: mixed || '#fff' }}>
      <PaintBucket size={34} aria-hidden="true" />
    </div>
    <p role="status">{scoops.length ? [...counts].map(([name, count]) => `${count} ${name.toLowerCase()}`).join(' + ') : 'Add a scoop to start mixing.'}</p>
    {mixed && <>
      <label htmlFor="use-mixed-paint">Use my mix to</label>
      <select id="use-mixed-paint" value={apply} onChange={event => setApply(event.target.value)}>
        <option value="paint">Paint on the paper</option>
        <option value="fill">Fill the background</option>
      </select>
    </>}
    <div className="focus-game-actions">
      <button type="button" className={`focus-game-button${mixed ? '' : ' is-primary'}`} onClick={() => onAdd(paint)} disabled={scoops.length >= 24}>Add {paint.toLowerCase()}</button>
      {mixed && <button type="button" className="focus-game-button is-primary" onClick={apply === 'fill' ? onFill : onUse}>{apply === 'fill' ? 'Fill background' : 'Use this mix'}</button>}
      <button type="button" className="focus-game-button" onClick={onBack}>Back to paper</button>
    </div>
  </section>;
}
