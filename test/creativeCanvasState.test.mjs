import assert from 'node:assert/strict';
import test from 'node:test';
import { COLOURING_GROUPS, COLOURING_PICTURES } from '../src/data/colouringPictures.js';
import { packCanvas, readCanvas } from '../src/data/creativeCanvasState.js';

const stored = (value) => ({ getItem: () => JSON.stringify(value) });

test('existing Creative Lab drafts keep their paper, ink, and original stroke widths', () => {
  const legacy = { fill: '#aabbcc', strokes: [
    { colour: '#112233', points: [[74, 98], [220, 300]] },
    { colour: '#112233', erasing: true, points: [[98, 122]] },
  ] };
  const loaded = readCanvas('draft', stored(legacy));
  assert.equal(loaded.template, 'blank');
  assert.equal(loaded.sheets.blank.fill, legacy.fill);
  assert.deepEqual(loaded.sheets.blank.strokes, [
    { colour: '#112233', erasing: false, size: 6, points: [[74, 98], [220, 300]] },
    { colour: '#112233', erasing: true, size: 22, points: [[98, 122]] },
  ]);
  loaded.template = 'tiger';
  loaded.sheets.tiger = { fill: '#ffffff', strokes: [], colours: { face: '#ed833c', muzzle: '#4386cf' }, textures: {}, stamps: [] };
  const packed = packCanvas(loaded);
  assert.equal(packed.fill, legacy.fill);
  assert.deepEqual(readCanvas('draft', stored(packed)), loaded);
});

test('every colouring picture has named regions and texture references point to real regions', () => {
  for (const { pictures, label } of COLOURING_GROUPS) {
    assert.ok(pictures.length > 1, label);
    for (const id of pictures) {
      const picture = COLOURING_PICTURES[id];
      const names = new Set(picture.regions.map(({ id }) => id));
      assert.equal(names.size, picture.regions.length);
      assert.ok(names.size >= 4);
      assert.ok(picture.details.every((line) => !line.region || names.has(line.region)));
    }
  }
});

test('saved textures, stamps and region-bounded strokes survive a round trip', () => {
  const saved = { fill: '#ffffff', strokes: [], template: 'tiger', pictures: { tiger: {
    fill: '#ffffff', colours: { coat: '#ed833c' },
    textures: { coat: 'fur', leaves: 'unknown', imaginary: 'grain' },
    stamps: [{ kind: 'star', colour: '#f2c94c', point: [380, 490], region: 'coat' },
      { kind: 'star', colour: '#f2c94c', point: [380, 490], region: 'imaginary' }],
    strokes: [{ colour: '#ffffff', size: 7, points: [[380, 490], [405, 511]], region: 'coat', artSpace: true }],
  } } };
  const art = readCanvas('draft', stored(saved));
  assert.equal(art.template, 'tiger');
  assert.deepEqual(art.sheets.tiger.textures, { coat: 'fur' });
  assert.deepEqual(art.sheets.tiger.stamps, [saved.pictures.tiger.stamps[0]]);
  assert.equal(art.sheets.tiger.strokes[0].region, 'coat');
  assert.equal(art.sheets.tiger.strokes[0].artSpace, true);
  assert.deepEqual(readCanvas('draft', stored(packCanvas(art))), art);
});
