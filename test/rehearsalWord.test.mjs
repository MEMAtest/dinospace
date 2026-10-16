import test from 'node:test';import assert from 'node:assert/strict';import { Packer } from 'docx';import { buildWordDocument } from '../src/rehearsal/wordExport.js';
import { readFileSync,mkdirSync,writeFileSync } from 'node:fs';
test('Word export produces a real OOXML archive from editable headings, marked runs and a local picture',async()=>{
 const image=readFileSync(new URL('../public/models/solar-v1/earth.png',import.meta.url)).toString('base64');
 const doc={type:'doc',content:[{type:'heading',attrs:{level:1,textAlign:'center'},content:[{type:'text',text:'My Mars Mission'}]},{type:'paragraph',content:[{type:'text',text:'Mars is red. ',marks:[{type:'bold'}]},{type:'text',text:'I coded a rover.'}]},{type:'image',attrs:{src:'data:image/png;base64,'+image}}]};
 const buffer=await Packer.toBuffer(buildWordDocument('My Mars Mission',doc));assert.equal(buffer.toString('hex',0,4),'504b0304');
 mkdirSync(new URL('../tmp/rehearsal-word/',import.meta.url),{recursive:true});writeFileSync(new URL('../tmp/rehearsal-word/unit-export.docx',import.meta.url),buffer);
 assert.throws(()=>buildWordDocument('Invalid',{content:[{type:'image',attrs:{src:'https://example.com/picture.png'}}]}));
});
