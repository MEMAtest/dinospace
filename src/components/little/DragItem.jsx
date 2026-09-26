import { useRef, useState } from 'react';

// A piece a small child can drag with a finger. A short press without
// movement counts as a tap, so tap-then-tap also works for children who find
// dragging hard. `onDrop` receives the release point and returns true when
// the piece was accepted; otherwise it springs back.
const DragItem = ({
  onDrop, onTap, onPickUp, disabled = false, className = '', style, children, label, selected = false, data = {},
}) => {
  const [offset, setOffset] = useState(null);
  const startRef = useRef(null);

  const handlePointerDown = (event) => {
    if (disabled) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    startRef.current = { x: event.clientX, y: event.clientY, moved: false };
    setOffset({ x: 0, y: 0 });
    onPickUp?.();
  };

  const handlePointerMove = (event) => {
    const start = startRef.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.moved && Math.hypot(dx, dy) > 10) start.moved = true;
    if (start.moved) setOffset({ x: dx, y: dy });
  };

  const finish = (event, cancelled = false) => {
    const start = startRef.current;
    startRef.current = null;
    setOffset(null);
    if (!start || cancelled) return;
    if (!start.moved) {
      onTap?.();
      return;
    }
    onDrop?.({ x: event.clientX, y: event.clientY });
  };

  const dragging = offset && (offset.x !== 0 || offset.y !== 0);

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      {...Object.fromEntries(Object.entries(data).map(([key, value]) => [`data-${key}`, value]))}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => finish(event)}
      onPointerCancel={(event) => finish(event, true)}
      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onTap?.(); } }}
      className={`touch-none ${dragging ? 'z-50 scale-110 cursor-grabbing drop-shadow-2xl' : 'cursor-grab transition-transform duration-200'} ${className}`}
      style={{ ...style, transform: dragging ? `translate(${offset.x}px, ${offset.y}px) scale(1.1)` : style?.transform }}
    >
      {children}
    </button>
  );
};

export default DragItem;
