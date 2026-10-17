import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('Earth uses latitude UVs for the Blue Marble map, without the retired atlas mapping',async()=>{
 const bytes=await readFile(new URL('../public/models/solar-v2/earth.glb',import.meta.url));
 const length=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.subarray(20,20+length).toString()),start=28+length;
 const attributes=gltf.meshes[0].primitives[0].attributes;
 const accessor=(name,size)=>{const a=gltf.accessors[attributes[name]],v=gltf.bufferViews[a.bufferView];assert.equal(a.componentType,5126);return Array.from({length:a.count},(_,i)=>Array.from({length:size},(_,k)=>bytes.readFloatLE(start+(v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||size*4)+k*4)));};
 const positions=accessor('POSITION',3),uv=accessor('TEXCOORD_0',2);assert.equal(positions.length,uv.length);assert.ok(positions.length>2000);
 for(let i=0;i<positions.length;i++){const [x,y,z]=positions[i];assert.ok(Math.abs(Math.hypot(x,y,z)-1)<1e-5);const latitudeV=.5-Math.asin(Math.max(-1,Math.min(1,y)))/Math.PI;assert.ok(Math.abs(uv[i][1]-latitudeV)<2e-5,'Every latitude must map to its equirectangular row');}
 assert.ok(bytes.length<600000,'Earth stays within the mobile model budget');
});
