import http from 'node:http';
import fs from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');process.loadEnvFile(resolve(root,'.env.b1-provider-qa.local'));fs.unlinkSync(resolve(root,'.env.b1-provider-qa.local'));if(['OPENROUTER_API_KEY','ELEVENLABS_API_KEY'].some(key=>/^\[Sensitive\]$/i.test(process.env[key]||'')))throw Error('Vercel exported a protected placeholder; use a hosted deployment, never send placeholder credentials to providers.');
const dir=resolve(root,'docs/game-delivery-20261019/batch1/approved-provider-qa');fs.mkdirSync(dir,{recursive:true});const statusPath=resolve(dir,'storybook-provider-status.json');
const job=fs.existsSync(statusPath)?JSON.parse(fs.readFileSync(statusPath,'utf8')):{job:'one-six-page-story-approved-20261019',requestCap:23,providerAttempts:[],clientRequests:[],startedAt:new Date().toISOString(),state:'ready'};
if(job.providerAttempts.length)throw Error('This approved story job already attempted generation; inspect it instead of restarting.');
const save=()=>fs.writeFileSync(statusPath,JSON.stringify(job,null,2)+'\n');const originalFetch=globalThis.fetch;
globalThis.fetch=async(input,options)=>{
 const url=new URL(input instanceof URL?input.href:typeof input==='string'?input:input.url);const provider=url.hostname==='openrouter.ai'?'openrouter':url.hostname==='api.elevenlabs.io'?'elevenlabs':null;if(!provider)throw Error('Unapproved provider host');
 if(job.providerAttempts.length>=23)throw Error('Approved provider request cap reached');
 const row={number:job.providerAttempts.length+1,provider,kind:url.pathname.includes('/images')?'image':url.pathname.includes('text-to-speech')?'narration':'outline',startedAt:new Date().toISOString(),state:'started'};job.providerAttempts.push(row);save();
 try{const response=await originalFetch(input,options);row.httpStatus=response.status;row.responseAt=new Date().toISOString();row.state='response';save();return response}catch(e){row.state='failed';row.error=e.name;row.finishedAt=new Date().toISOString();save();throw e}
};
const handlers={session:(await import('../api/story/session.js')).default,outline:(await import('../api/story/outline.js')).default,image:(await import('../api/story/image.js')).default,narration:(await import('../api/story/narration.js')).default};
const server=http.createServer(async(req,res)=>{
 const stage=new URL(req.url,'http://127.0.0.1:5181').pathname.replace('/api/story/','');res.status=code=>{res.statusCode=code;return res};res.json=value=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));return res};res.send=bytes=>{res.end(bytes);return res};
 if(!handlers[stage]){res.status(404).json({error:'Not found'});return}
 try{
  const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>12000000)throw Error('Request body limit');chunks.push(chunk)}req.body=chunks.length?JSON.parse(Buffer.concat(chunks).toString('utf8')):{};
  if(req.method!=='OPTIONS'){
   const limits={session:3,outline:1,image:7,narration:7};if(job.clientRequests.filter(x=>x.stage===stage).length>=limits[stage]){res.status(409).json({error:'Approved QA operation already attempted; no retry permitted.'});return}
   if(stage==='outline'&&(req.body.ageBand!=='3-4'||!req.body.topic?.startsWith('Synthetic QA 2026-10-19:')))throw Error('Only approved synthetic six-page QA input is allowed');
   const row={stage,startedAt:new Date().toISOString()};job.clientRequests.push(row);job.state='running';save();res.on('finish',()=>{row.finishedAt=new Date().toISOString();row.httpStatus=res.statusCode;save()});
  }
  await handlers[stage](req,res);
 }catch(error){if(!res.writableEnded)res.status(500).json({error:'QA server stopped this request'});job.error=error.message;save()}
});
server.listen(5181,'127.0.0.1',()=>{save();console.log(JSON.stringify({qaServer:'http://127.0.0.1:5181',providerCap:23,sixPagesOnly:true,temporaryEnvRemoved:true}))});
