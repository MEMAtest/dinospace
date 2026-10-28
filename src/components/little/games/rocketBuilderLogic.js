export const ROCKET_DROP_TOLERANCE = 8;

// Narrow, disjoint targets within the existing 200 × 300 rocket viewBox.
// Fins have two acceptable side targets because the authored piece has two sides.
export const ROCKET_DROP_ZONES = Object.freeze({
  nose: Object.freeze([[78, 20, 44, 60]]),
  window: Object.freeze([[85, 118, 30, 30]]),
  body: Object.freeze([[84, 165, 32, 47]]),
  fins: Object.freeze([[18, 188, 48, 48], [134, 188, 48, 48]]),
  flame: Object.freeze([[82, 256, 36, 32]]),
});

// The cutout sprites have authored bounds that differ from these narrow snap
// zones. Let children align the larger body and composite fins by their visible
// centers, including the fins' transparent middle gap.
export const ROCKET_AUTHORED_CENTER_ZONES = Object.freeze({
  body: Object.freeze([88, 140, 24, 24]),
  nose: Object.freeze([88, 42, 24, 24]),
  window: Object.freeze([88, 124, 24, 24]),
  fins: Object.freeze([88, 190, 24, 24]),
  flame: Object.freeze([88, 244, 24, 24]),
});

export const rocketPartCenter = (box, rect, viewBox = { width: 200, height: 300 }) => {
  if (!box || !rect || rect.width <= 0 || rect.height <= 0) return null;
  const [x, y, width, height] = box;
  return {
    x: rect.left + ((x + width / 2) / viewBox.width) * rect.width,
    y: rect.top + ((y + height / 2) / viewBox.height) * rect.height,
  };
};

export const rocketPointInDropZone = (point, zone, rect, tolerance = ROCKET_DROP_TOLERANCE, viewBox = { width: 200, height: 300 }) => {
  if (!point || !zone || !rect || rect.width <= 0 || rect.height <= 0 || !Number.isFinite(tolerance) || tolerance < 0) return false;
  const [x, y, width, height] = zone;
  const pointX = ((point.x - rect.left) / rect.width) * viewBox.width;
  const pointY = ((point.y - rect.top) / rect.height) * viewBox.height;
  return pointX >= x - tolerance && pointX <= x + width + tolerance
    && pointY >= y - tolerance && pointY <= y + height + tolerance;
};

export const rocketPartAcceptsPoint = (partId, point, rect) => {
  const centerZone = ROCKET_AUTHORED_CENTER_ZONES[partId];
  const centerTolerance = partId === 'window' ? 3 : ROCKET_DROP_TOLERANCE;
  const snapTolerance = partId === 'window' ? 3 : ROCKET_DROP_TOLERANCE;
  return (ROCKET_DROP_ZONES[partId] || []).some((zone) => rocketPointInDropZone(point, zone, rect, snapTolerance))
    || Boolean(centerZone && rocketPointInDropZone(point, centerZone, rect, centerTolerance));
};

export const rocketTargetMatchesPart = (partId, targetId) => Boolean(partId) && partId === targetId;

export const expandedRocketDropZone = (zone, tolerance = ROCKET_DROP_TOLERANCE) => {
  const [x, y, width, height] = zone;
  return [x - tolerance, y - tolerance, width + tolerance * 2, height + tolerance * 2];
};

export const rocketZonesOverlap = (first, second) => {
  const [firstX, firstY, firstWidth, firstHeight] = first;
  const [secondX, secondY, secondWidth, secondHeight] = second;
  return firstX < secondX + secondWidth && firstX + firstWidth > secondX
    && firstY < secondY + secondHeight && firstY + firstHeight > secondY;
};

export const rocketPartPlacementFeedback = (partId, partLabel) => {
  const guidance = {
    body: 'The rocket body belongs in the middle.',
    nose: 'The nose cone belongs at the top.',
    window: 'The window belongs in the middle of the rocket body.',
    fins: 'The fins belong on the lower sides of the rocket.',
    flame: 'The engine flame belongs underneath the rocket.',
  };
  return `${partLabel} is not in its outline. ${guidance[partId] || 'Move it to the matching outline.'}`;
};

export const speakPackagedOnly = (speak, text, hasExactClip) => {
  if (typeof speak !== 'function' || typeof text !== 'string' || !text.trim() || !hasExactClip(text)) return false;
  speak(text, { premium: false, segments: [text] });
  return true;
};
