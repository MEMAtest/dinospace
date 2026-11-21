import { useEffect, useRef, useState } from 'react';

export function FocusMenu({ label = 'What would you like to do?', choices, onBack }) {
  const id = useRef(null);
  const [index, setIndex] = useState(() => choices.findIndex(choice => !choice.disabled));
  const choice = choices[index];

  useEffect(() => { id.current?.focus(); }, []);

  return <div className="focus-game-menu">
    <h2 ref={id} tabIndex={-1}>Options</h2>
    <label htmlFor="focus-game-choice">{label}</label>
    <select id="focus-game-choice" value={choice ? index : ''} onChange={event => setIndex(Number(event.target.value))}>
      {!choice && <option value="" disabled>Choose an option</option>}
      {choices.map((item, position) => <option key={item.label} value={position} disabled={item.disabled}>{item.label}</option>)}
    </select>
    {choice?.description && <p>{choice.description}</p>}
    <div className="focus-game-actions">
      <button type="button" className="focus-game-button is-primary" disabled={!choice || choice.disabled} onClick={choice?.action}>{choice?.button || choice?.label || 'Continue'}</button>
      <button type="button" className="focus-game-button" onClick={onBack}>Back</button>
    </div>
  </div>;
}
