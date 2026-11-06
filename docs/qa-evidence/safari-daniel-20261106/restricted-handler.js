import { createHash, timingSafeEqual } from 'node:crypto';
const expected='64871afe1cc0f9b4a8e6dfc29c7dc2a5350acfb1d58f4db30cb9159d4bb496d4', expires=1794011495366;
const phrases={ant:'ant',sit:'sit',sip:'sip',tip:'tip',pit:'pit',pin:'pin',tin:'tin',tap:'tap',nap:'nap',pan:'pan',pat:'pat',sap:'sap',pip:'pip',snip:'snip',snap:'snap',spin:'spin',pants:'pants',insect:'insect','blend-instruction':'Say each sound, then blend the word. What word does this make?'};
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');if(req.method!=='POST'||Date.now()>expires)return res.status(404).end();
 const supplied=createHash('sha256').update(String(req.headers['x-safari-token']||'')).digest();if(!timingSafeEqual(supplied,Buffer.from(expected,'hex')))return res.status(403).end();
 const id=req.body?.id;if(typeof id!=='string'||!Object.hasOwn(phrases,id))return res.status(400).end();
 if(!process.env.ELEVENLABS_API_KEY)return res.status(503).end();
 try {const r=await fetch('https://api.elevenlabs.io/v1/text-to-speech/onwK4e9ZLuTAKqWW03F9?output_format=mp3_44100_128',{method:'POST',headers:{'Content-Type':'application/json','xi-api-key':process.env.ELEVENLABS_API_KEY},body:JSON.stringify({text:phrases[id],model_id:'eleven_flash_v2',voice_settings:{stability:0.5,similarity_boost:0.75,style:0,use_speaker_boost:true,speed:0.95}}),signal:AbortSignal.timeout(60000)});if(!r.ok){res.setHeader('X-Provider-Status',String(r.status));return res.status(502).end()}const bytes=Buffer.from(await r.arrayBuffer());res.setHeader('Content-Type','audio/mpeg');return res.status(200).send(bytes)}catch{return res.status(502).end()}
}
