import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = new URL('../public/models/solar-v1/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('manifest.json',root)));
const names = ['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
test('all nine local Blender assets are source-bound, embedded and within mobile budgets', () => {
 assert.deepEqual(manifest.models.map(m=>m.name),names);
 let total=0;
 for(const model of manifest.models){
  const bytes=readFileSync(new URL(`${model.name.toLowerCase()}.glb`,root));
  assert.equal(bytes.toString('ascii',0,4),'glTF');
  assert.equal(bytes.readUInt32LE(4),2);
  assert.equal(bytes.readUInt32LE(8),bytes.length);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),model.outputSha256);
  assert.ok(bytes.length<600_000,`${model.name} should stay under 600kB`);
  const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
  assert.ok(json.meshes.length>0);
  assert.ok(json.images.length>0);
  assert.ok(json.images.every(image=>!image.uri && Number.isInteger(image.bufferView)),'textures must be embedded');
  assert.ok(json.buffers.every(buffer=>!buffer.uri),'no remote binary dependencies');
  const indices=json.meshes.flatMap(mesh=>mesh.primitives).reduce((n,p)=>n+(p.indices===undefined?json.accessors[p.attributes.POSITION].count:json.accessors[p.indices].count),0);
  assert.ok(indices/3<=20_000,`${model.name} triangle budget`);
  const png=readFileSync(new URL(`${model.name.toLowerCase()}.png`,root));
  assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16),320);
  assert.equal(png.readUInt32BE(20),320);
  total+=bytes.length;
 }
 assert.ok(total<3_500_000);
 assert.ok(manifest.notToScale);
});
