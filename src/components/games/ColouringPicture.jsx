import { useId } from 'react';
import { PAPER_HEIGHT, PAPER_WIDTH } from '../../data/creativeCanvasState.js';
import { TEXTURES } from '../../data/colouringEffects.js';

const darkInk = '#263044';
const textureInk = '#637083';

export default function ColouringPicture({ picture, colours = {}, textures = {}, tool, onRegion }) {
  const id = useId().replaceAll(':', '');
  const interactive = ['fill', 'texture', 'eraser'].includes(tool);
  const hittable = interactive || tool === 'brush' || tool === 'stamp';
  const verb = tool === 'eraser' ? 'Reset' : tool === 'texture' ? 'Texture' : 'Colour';

  return <svg viewBox={`0 0 ${PAPER_WIDTH} ${PAPER_HEIGHT}`} className="pointer-events-none absolute inset-0 h-full w-full"
    data-colouring-source aria-hidden={!interactive || undefined} role={interactive ? 'group' : undefined} aria-label={interactive ? `${picture.label} colouring areas` : undefined}>
    <defs>
      {picture.regions.filter((region) => colours[region.id]).map((region) => {
        const colour = colours[region.id];
        return <linearGradient key={region.id} id={`${id}-${region.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={`color-mix(in srgb, ${colour} 78%, white)`} />
          <stop offset="53%" stopColor={colour} />
          <stop offset="100%" stopColor={`color-mix(in srgb, ${colour} 86%, #273044)`} />
        </linearGradient>;
      })}
      {TEXTURES.filter((texture) => texture.width && Object.values(textures).includes(texture.id)).map(({ id: textureId, width, height, dark, light }) => (
        <pattern key={textureId} id={`${id}-texture-${textureId}`} width={width} height={height} patternUnits="userSpaceOnUse">
          <path d={dark} fill="none" stroke="#17233c" strokeOpacity=".25" strokeWidth="2.3" strokeLinecap="round"/>
          <path d={light} fill="none" stroke="#fff9eb" strokeOpacity=".52" strokeWidth="1.9" strokeLinecap="round"/>
        </pattern>
      ))}
    </defs>
    {picture.regions.map((region) => <g key={region.id}>
      <path d={region.d} data-canvas-region={region.id} role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined} aria-label={interactive ? `${verb} ${region.name.toLowerCase()}` : undefined}
        fill={colours[region.id] ? `url(#${id}-${region.id})` : 'white'} stroke={darkInk} strokeWidth="7"
        strokeLinecap="round" strokeLinejoin="round"
        className={hittable ? 'pointer-events-auto outline-none focus-visible:stroke-indigo-600' : undefined}
        onClick={interactive ? (event) => {
          if (event.detail === 0 || tool !== 'eraser') onRegion(region.id, tool);
        } : undefined}
        onKeyDown={interactive ? (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onRegion(region.id, tool);
          }
        } : undefined}/>
      {textures[region.id] && <path d={region.d} data-material={textures[region.id]} fill={`url(#${id}-texture-${textures[region.id]})`} />}
    </g>)}
    {picture.details.map((line, index) => <path key={index} d={line.d} fill={line.fill || 'none'}
      data-texture-region={line.region}
      stroke={line.fill ? 'none' : colours[line.region] ? `color-mix(in srgb, ${colours[line.region]} 42%, #303042)` : textureInk}
      strokeWidth={line.width || 3} strokeLinejoin="round" strokeLinecap="round" />)}
  </svg>;
}
