import CodeCadets from './CodeCadets.jsx';
import WritingDesk from './WritingDesk.jsx';
import './studio.css';
export const CodeCadetsGame=({playerId,registerDirty,...gameProps})=><div className="studio-shell code-cadets-shell" data-board-focus=""><main><CodeCadets {...gameProps} player={playerId} registerDirty={registerDirty}/></main></div>;
export const WritingDeskGame=({playerId,registerDirty,...gameProps})=><div className="studio-shell writing-focus-shell" data-board-focus=""><main><WritingDesk {...gameProps} player={playerId} registerDirty={registerDirty}/></main></div>;
