import fs from 'node:fs';import assert from 'node:assert/strict';import{createHash}from'node:crypto';
const [origin,out]=process.argv.slice(2),hash=b=>createHash('sha256').update(b).digest('hex'),rows=[];
const shadow=JSON.parse(fs.readFileSync('docs/qa-evidence/shadow-progression-20261023/art-provenance.json'));
for(const item of shadow){const path=item.runtime.replace(/^public/,'');const r=await fetch(origin+path,{signal:AbortSignal.timeout(30000)});assert.equal(r.status,200,path);const bytes=Buffer.from(await r.arrayBuffer());assert.equal(hash(bytes),item.runtimeSha256,path);rows.push({path,status:r.status,sha256:hash(bytes),bytes:bytes.length});}
const critical=new Set(['game-solar.webp','game-memory.webp','game-shadowmatch.webp','world-thinking.webp']);
const catalogue=JSON.parse(fs.readFileSync('docs/qa-evidence/catalog-icons-20261024/served-art.json')).art;
for(const item of catalogue){const path='/art/catalog-v3/'+item.file,method=critical.has(item.file)?'GET':'HEAD';const r=await fetch(origin+path,{method,signal:AbortSignal.timeout(30000)});assert.equal(r.status,200,path);assert.match(r.headers.get('content-type'),/image\/webp/,path);let sha256=null;if(method==='GET'){const bytes=Buffer.from(await r.arrayBuffer());sha256=hash(bytes);assert.equal(sha256,hash(fs.readFileSync('public'+path)),path);}rows.push({path,status:r.status,method,sha256});}
const models=[];
for(const name of ['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'])for(const ext of ['glb','png']){
 const path=`/models/${name==='Earth'?'solar-v2':'solar-v1'}/${name.toLowerCase()}.${ext}`;
 const r=await fetch(origin+path,{method:'HEAD',signal:AbortSignal.timeout(30000)});assert.equal(r.status,200,path);
 const local=fs.statSync('public'+path);const length=Number(r.headers.get('content-length'));if(length)assert.equal(length,local.size,path+' length');
 models.push({path,status:r.status,bytes:local.size,method:'HEAD'});
}
fs.writeFileSync(out,JSON.stringify({at:new Date().toISOString(),origin,passed:true,shadowHashes:shadow.length,catalogueAvailable:catalogue.length,models,rows},null,2)+'\n');console.log(JSON.stringify({passed:true,shadow:shadow.length,catalogue:catalogue.length}));
