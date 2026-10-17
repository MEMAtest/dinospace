import CodeCadets from './CodeCadets.jsx';
import WritingDesk from './WritingDesk.jsx';
import './studio.css';
export const CodeCadetsGame=({playerId,registerDirty})=><div className="studio-shell"><main><CodeCadets player={playerId} registerDirty={registerDirty}/></main></div>;
export const WritingDeskGame=({playerId,registerDirty})=><div className="studio-shell"><main><WritingDesk player={playerId} registerDirty={registerDirty}/></main></div>;
