import { AlignmentType, Document, HeadingLevel, ImageRun, Paragraph, TextRun } from 'docx';
export const documentText = json => (json.content||[]).map(node=>(node.content||[]).map(c=>c.text||'').join('')).join('\n');
export function buildWordDocument(title,json){
 const children=(json.content||[]).map(node=>{
  if(node.type==='image'){
   const src=node.attrs?.src||'';if(!/^data:image\/png;base64,/.test(src))throw new Error('Only a saved planet picture can be exported.');
   const data=Uint8Array.from(atob(src.split(',')[1]),c=>c.charCodeAt(0));
   return new Paragraph({children:[new ImageRun({data,type:'png',transformation:{width:160,height:160}})]});
  }
  const runs=(node.content||[]).map(part=>part.type==='hardBreak'?new TextRun({break:1}):new TextRun({text:part.text||'',bold:part.marks?.some(m=>m.type==='bold'),italics:part.marks?.some(m=>m.type==='italic')}));
  return new Paragraph({children:runs,heading:node.type==='heading'?HeadingLevel.HEADING_1:undefined,alignment:node.attrs?.textAlign==='center'?AlignmentType.CENTER:node.attrs?.textAlign==='right'?AlignmentType.RIGHT:AlignmentType.LEFT,spacing:{after:160}});
 });
 return new Document({creator:'Discovery HQ',title,styles:{default:{document:{run:{font:'Arial',size:33,color:'142E4B'},paragraph:{spacing:{after:180,line:384}}}},paragraphStyles:[{id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:'Arial',size:48,bold:true,color:'142E4B'},paragraph:{spacing:{before:120,after:240}}}]},sections:[{children:children.length?children:[new Paragraph('')]}]});
}
