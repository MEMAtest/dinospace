export default function RoverArt({className='',direction=1}) {
 if(className==='rover-art')return <span className={className} aria-hidden="true"><img src="/art/discovery-v2/pip.webp" alt="" style={{transform:direction===3?'scaleX(-1)':undefined}}/><span className="pip-direction">{['↑','→','↓','←'][direction]}</span></span>;
 return <img src="/art/discovery-v2/pip.webp" alt="" aria-hidden="true" className={className}/>;
}
