import DiscoveryHeader from '../components/shared/DiscoveryHeader.jsx';
import { lazy, Suspense, useCallback, useRef, useState } from 'react';
const CodeCadets=lazy(()=>import('./CodeCadets.jsx'));
const WritingDesk=lazy(()=>import('./WritingDesk.jsx'));
export default function Studio(){
 const [view,setView]=useState(()=>['code','writing'].includes(location.hash.slice(1))?location.hash.slice(1):'home');
 const [player,setPlayer]=useState('amari'),dirty=useRef(null);
 const registerDirty=useCallback(fn=>{dirty.current=fn;},[]);
 const mayLeave=()=>!dirty.current?.()||window.confirm('You have unsaved work. Leave without saving?');
 const navigate=next=>{if(mayLeave()){setView(next);history.replaceState(null,'',next==='home'?'#home':'#'+next);}};
 return <div className="studio-shell">
  <DiscoveryHeader studio playerName={player==='amari'?'Amari':'Guest'} onHome={()=>navigate('home')} onWorlds={()=>{if(mayLeave())location.href='/#/world/creative';}} onStickers={()=>{if(mayLeave())location.href='/#/stickers';}} onGrownups={()=>{if(mayLeave())location.href='/#/grownups';}}/>
  <div className="studio-activity-nav"><nav aria-label="Studio activities"><button onClick={()=>navigate('code')}>Code Cadets</button><button onClick={()=>navigate('writing')}>Writing Desk</button></nav><label>Explorer <select aria-label="Explorer" value={player} onChange={e=>{if(mayLeave())setPlayer(e.target.value);}}><option value="amari">Amari</option><option value="guest">Guest</option></select></label></div>
  <main>{view==='home'?<section className="studio-welcome"><p className="eyebrow">Your ideas make things happen</p><h1>Build a mission.<br/>Tell its story.</h1><p>Explore a planet, give a rover instructions, then write about your discovery.</p><div className="welcome-cards"><a href="/?journey=discovery#/play/solar"><img src="/models/solar-v1/saturn.png" alt="Saturn with its rings"/><h2>Explore the planets</h2><p>Turn, zoom and discover.</p><span>Visit Solar System →</span></a><button onClick={()=>navigate('code')}><img src="/art/discovery-v2/pip.webp" alt="Pip the rover"/><h2>Code Cadets</h2><p>Build, run and fix your program.</p><span>Start coding →</span></button><button onClick={()=>navigate('writing')}><span className="welcome-symbol">Aa</span><h2>My Writing Desk</h2><p>Write a postcard in your own words.</p><span>Start writing →</span></button></div></section>:<Suspense fallback={<p>Opening your activity…</p>}>{view==='code'?<CodeCadets key={player+'code'} player={player} registerDirty={registerDirty}/>:<WritingDesk key={player+'writing'} player={player} registerDirty={registerDirty}/>}</Suspense>}</main>
  <footer>Projects are saved on this device, separately for each explorer.</footer>
 </div>;
}
