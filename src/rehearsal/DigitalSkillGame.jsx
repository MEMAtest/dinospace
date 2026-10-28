import CodeCadets from './CodeCadets.jsx';
import WritingDesk from './WritingDesk.jsx';
import './studio.css';
export const CodeCadetsGame=({playerId,registerDirty,...gameProps})=><div className="studio-shell"><main><CodeCadets {...gameProps} player={playerId} registerDirty={registerDirty}/></main></div>;
export const WritingDeskGame=({playerId,registerDirty,...gameProps})=><div className="studio-shell"><main><WritingDesk {...gameProps} player={playerId} registerDirty={registerDirty}/></main></div>;
