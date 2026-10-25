import test from 'node:test';
import assert from 'node:assert/strict';
import handler from './voice-trial-handler.js';
const response=()=>({headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(v){this.body=v;},send(v){this.body=v;},end(){}});
test('six phonemes use fixed IPA model and British voice; unsupported or cross-language input cannot reach provider',async()=>{
 const oldFetch=globalThis.fetch,oldKey=process.env.ELEVENLABS_API_KEY;process.env.ELEVENLABS_API_KEY='synthetic';let calls=0;
 globalThis.fetch=async(url,options)=>{calls++;assert.match(String(url),/onwK4e9ZLuTAKqWW03F9/);const body=JSON.parse(options.body);assert.equal(body.model_id,'eleven_flash_v2');assert.match(body.text,/^<phoneme alphabet="ipa" ph="[sæt pɪn]">[satpin]<\/phoneme>$/);assert.doesNotMatch(body.text,/INJECT/);return new Response(new Uint8Array(1500));};
 try{
  for(const phoneme of ['s','a','t','p','i','n']){const res=response();await handler({method:'POST',headers:{origin:'https://dinospace.netlify.app','x-forwarded-for':'phoneme-unit'},body:{phoneme,text:'INJECT',model_id:'bad',voice_id:'bad'}},res);assert.equal(res.code,200);assert.equal(res.headers['X-Amari-Voice-Profile'],'british-phoneme-trial');}
  for(const body of [{phoneme:'sh'},{phoneme:'__proto__'},{phoneme:'s',language:'de'},{phoneme:{}}]){const res=response();await handler({method:'POST',headers:{origin:'https://dinospace.netlify.app'},body},res);assert.equal(res.code,400);}
  assert.equal(calls,6);
 }finally{globalThis.fetch=oldFetch;if(oldKey===undefined)delete process.env.ELEVENLABS_API_KEY;else process.env.ELEVENLABS_API_KEY=oldKey;}
});
