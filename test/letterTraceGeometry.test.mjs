import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceTraceSegment, interpolateGuidePoint, isTraceDotStroke } from '../src/data/letterTraceLearning.js';

const points = (coordinates) => coordinates.map(([x, y]) => ({ x, y }));

test('sparse pointer samples fairly advance a straight ordered guide', () => {
  const guide = points([[0, 0], [10, 0], [20, 0], [30, 0], [40, 0], [50, 0], [60, 0], [70, 0], [80, 0], [90, 0], [100, 0]]);
  const result = advanceTraceSegment(guide, { x: 0, y: 1 }, { x: 100, y: 1 }, 0, 8);
  assert.equal(result.accepted, true);
  assert.equal(result.cursor, guide.length - 1);
  assert.ok(result.samples > 10);
});

test('a sparse pointer reaches both ends of a 200px two-vertex lowercase l guide', () => {
  const guide = points([[40, 20], [40, 220]]);
  const result = advanceTraceSegment(guide, guide[0], guide[1], 0, 26);
  assert.equal(result.accepted, true);
  assert.equal(result.cursor, 1);
});

test('a mouse endpoint rounded to a tenth of a CSS pixel snaps only at the final guide point', () => {
  const guide = points([[128.35, 190.2026875], [261.65, 190.2026875]]);
  const roundedPointerEnd = { x: 261.6, y: 190.2 };
  const result = advanceTraceSegment(guide, guide[0], roundedPointerEnd, 0, 26);
  assert.equal(result.accepted, true);
  assert.equal(result.cursor, guide.length - 1);
  assert.ok(result.distance < 1);
});

test('a fractional cursor resumes at an interpolated guide location for pointer and keyboard input', () => {
  const guide = points([[0, 0], [100, 0], [100, 100]]);
  const resume = interpolateGuidePoint(guide, 0.5);
  assert.deepEqual(resume, { x: 50, y: 0 });
  assert.equal(interpolateGuidePoint(guide, 99).x, 100);
  assert.equal(interpolateGuidePoint([], 0), null);
  const step = advanceTraceSegment(guide, resume, { x: 80, y: 0 }, 0.5, 8);
  assert.equal(step.accepted, true);
  assert.ok(step.cursor > 0.5);
});

test('a straight chord cannot shortcut the middle of a curved guide', () => {
  const guide = points([[0, 0], [0, 20], [0, 40], [0, 60], [20, 80], [40, 90], [60, 80], [80, 60], [80, 40], [80, 20], [80, 0]]);
  const result = advanceTraceSegment(guide, guide[0], guide.at(-1), 0, 10);
  assert.equal(result.accepted, false);
  assert.ok(result.cursor < guide.length - 1);
});

test('a scribble outside the guide tolerance is rejected without advancing the cursor', () => {
  const guide = points([[0, 0], [10, 0], [20, 0], [30, 0], [40, 0]]);
  const result = advanceTraceSegment(guide, guide[0], { x: 40, y: 70 }, 0, 8);
  assert.equal(result.accepted, false);
  assert.ok(result.cursor < guide.length - 1);
});

test('curves advance in order and reversing from the current point is rejected', () => {
  const guide = points([[0, 0], [0, 10], [0, 20], [10, 30], [20, 40], [30, 30], [30, 20], [30, 10], [30, 0]]);
  let cursor = 0;
  for (let index = 0; index < guide.length - 1; index += 1) {
    const step = advanceTraceSegment(guide, guide[index], guide[index + 1], cursor, 8);
    assert.equal(step.accepted, true, `segment ${index} should remain traceable`);
    cursor = step.cursor;
  }
  assert.equal(cursor, guide.length - 1);
  const reverse = advanceTraceSegment(guide, guide[5], guide[2], 5, 8);
  assert.equal(reverse.accepted, false);
  assert.equal(reverse.cursor, 5);
});

test('closed uppercase O guide can be traced through its final vertex without snapping back to its first point', () => {
  // These normalized vertices match the uppercase O path in LetterTrace.jsx.
  const guide = points([[50, 12], [30, 16], [20, 34], [20, 66], [30, 84], [50, 88], [70, 84], [80, 66], [80, 34], [70, 16], [50, 12]]);
  let cursor = 0;
  for (let index = 0; index < guide.length - 1; index += 2) {
    const endpoint = guide[Math.min(index + 2, guide.length - 1)];
    const step = advanceTraceSegment(guide, guide[index], endpoint, cursor, 26);
    assert.equal(step.accepted, true, `O segment ${index} should remain traceable`);
    cursor = step.cursor;
  }
  assert.equal(cursor, guide.length - 1);
});

test('the i and j dot stroke is tappable even when encoded as a repeated point', () => {
  for (const letter of ['i', 'j']) {
    const dotStroke = points([[24, 18], [24, 18]]);
    assert.equal(isTraceDotStroke(dotStroke), true, `${letter} dot should be recognized as a tap stroke`);
  }
  assert.equal(isTraceDotStroke(points([[10, 10], [10, 30]])), false);
});
