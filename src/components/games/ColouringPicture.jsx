import { useId } from 'react';
import { PAPER_HEIGHT, PAPER_WIDTH } from '../../data/creativeCanvasState.js';

const darkInk = '#263044';
const textureInk = '#637083';

export default function ColouringPicture({ picture, colours = {}, tool, onRegion }) {
  const id = useId().replaceAll(':', '');
  const interactive = tool === 'fill' || tool === 'eraser';
  return <svg viewBox={`0 0 ${PAPER_WIDTH} ${PAPER_HEIGHT}`} className="pointer-events-none absolute inset-0 h-full w-full"
    aria-hidden={!interactive || undefined} role={interactive ? 'group' : undefined} aria-label={interactive ? `${picture.label} colouring areas` : undefined}>
    <defs>{picture.regions.filter((region) => colours[region.id]).map((region) => {
      const colour = colours[region.id];
      return <linearGradient key={region.id} id={`${id}-${region.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={`color-mix(in srgb, ${colour} 78%, white)`} />
        <stop offset="53%" stopColor={colour} />
        <stop offset="100%" stopColor={`color-mix(in srgb, ${colour} 86%, #273044)`} />
      </linearGradient>;
    })}</defs>
    {picture.regions.map((region) => {
      const action = `${tool === 'eraser' ? 'Reset' : 'Colour'} ${region.name.toLowerCase()}`;
      return <path key={region.id} d={region.d} data-canvas-region={region.id} role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined} aria-label={interactive ? action : undefined}
        fill={colours[region.id] ? `url(#${id}-${region.id})` : 'white'} stroke={darkInk} strokeWidth="7"
        strokeLinecap="round" strokeLinejoin="round"
        className={interactive ? 'pointer-events-auto outline-none hover:stroke-indigo-600 focus-visible:stroke-indigo-600' : undefined}
        onClick={interactive ? (event) => {
          if (event.detail === 0 || tool === 'fill') onRegion(region.id, tool);
        } : undefined}
        onKeyDown={interactive ? (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onRegion(region.id, tool);
          }
        } : undefined}/>;
    })}
    {picture.details.map((line, index) => <path key={index} d={line.d} fill={line.fill || 'none'}
      data-texture-region={line.region}
      stroke={line.fill ? 'none' : colours[line.region] ? `color-mix(in srgb, ${colours[line.region]} 42%, #303042)` : textureInk}
      strokeWidth={line.width || 3} strokeLinejoin="round" strokeLinecap="round" />)}
  </svg>;
}
