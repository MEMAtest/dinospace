import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import { loadProject, saveProject } from './storage.js';
import { documentText } from './wordExport.js';

const planets=['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const blank={type:'doc',content:[{type:'paragraph'}]};
export default function WritingDesk({ player, registerDirty }){
 const [title,setTitle]=useState('My space postcard'),[dirty,setDirty]=useState(false),[status,setStatus]=useState('Write your own words, then Save.'),[revision,setRevision]=useState(0),[saved,setSaved]=useState(false),[reopened,setReopened]=useState(false),[exported,setExported]=useState(false);
 const [picturePlanet,setPicturePlanet]=useState('Earth');
 const editor=useEditor({extensions:[StarterKit.configure({heading:{levels:[1]},bulletList:false,orderedList:false,blockquote:false,codeBlock:false,horizontalRule:false,link:false}),TextAlign.configure({types:['heading','paragraph']}),Image.configure({allowBase64:true})],content:blank,editorProps:{attributes:{role:'textbox','aria-label':'Your document','aria-multiline':'true',spellcheck:'true'}},onUpdate:()=>{setDirty(true);setRevision(v=>v+1);}});
 const formats=useEditorState({editor,selector:({editor:e})=>e?{bold:e.isActive('bold'),italic:e.isActive('italic'),heading:e.isActive('heading'),center:e.isActive({textAlign:'center'})}:{}});
 const live=useRef({dirty});live.current={dirty};
 useEffect(()=>{registerDirty(()=>live.current.dirty);return()=>registerDirty(null);},[registerDirty]);
 useEffect(()=>{const f=e=>{if(live.current.dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',f);return()=>window.removeEventListener('beforeunload',f);},[]);
 const save=()=>{
  const ok=saveProject(player,'writing',{title,document:editor.getJSON()});
  if(ok){setDirty(false);setSaved(true);setStatus('Document saved on this device.');}else setStatus('Could not save. Keep this page open and download your Word document.');
 };
 const open=()=>{
  const data=loadProject(player,'writing');if(!data?.document){setStatus('No saved document for this explorer.');return;}
  if(dirty&&!window.confirm('Open the saved document and replace these unsaved changes?'))return;
  try{editor.commands.setContent(data.document,{emitUpdate:false});setTitle(data.title);setDirty(false);setReopened(true);setSaved(true);setRevision(v=>v+1);setStatus('Saved document reopened. Your words and formatting are here.');}catch{setStatus('That document could not be opened.');}
 };
 const addPicture=async()=>{
  try{const response=await fetch(`/models/solar-v1/${picturePlanet.toLowerCase()}.png`);if(!response.ok)throw Error();const blob=await response.blob();const reader=new FileReader();reader.onload=()=>editor.chain().focus().setImage({src:reader.result,alt:picturePlanet==='Earth'?'Earth with blue oceans and continents':`${picturePlanet} from the Solar System`}).run();reader.readAsDataURL(blob);}catch{setStatus('The picture could not be loaded. Your writing is unchanged.');}
 };
 const exportWord=async()=>{
  try{const [{Packer},{buildWordDocument}]=await Promise.all([import('docx'),import('./wordExport.js')]);const blob=await Packer.toBlob(buildWordDocument(title,editor.getJSON()));const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=(title.replace(/[^a-z0-9 -]/gi,'').trim()||'My document')+'.docx';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),30000);setExported(true);setStatus('Word document downloaded. Your saved draft stays here.');}catch{setStatus('Export did not finish. Your writing is still here; try again.');}
 };
 if(!editor)return <p>Opening your writing desk…</p>;
 const json=editor.getJSON(),text=documentText(json),nodes=json.content||[];
 const checks=[nodes.some(n=>n.type==='heading'&&(n.content||[]).some(c=>c.text?.length>2)),text.trim().split(/\s+/).length>=6,nodes.some(n=>(n.content||[]).some(c=>c.marks?.some(m=>m.type==='bold'))),nodes.some(n=>n.type==='image'),saved&&reopened,exported];
 const steps=['Type a heading','Write your message','Select a word and make it bold','Add a planet picture','Save, then reopen your work','Download a Word document'];
 return <section aria-labelledby="writing-title" data-revision={revision}>
  <div className="section-heading"><div><p className="eyebrow">Type · Edit · Save · Share</p><h1 id="writing-title">My Writing Desk</h1></div><span className="skill-pill">Space postcard</span></div>
  <p className="mission-prompt">Write a postcard about a planet you explored. What would you tell someone at home?</p>
  <div className="writing-layout"><aside className="panel lesson-card"><h2>Your postcard mission</h2><ol className="writing-checklist">{steps.map((label,i)=><li key={label} className={checks[i]?'checked':''}><span aria-label={checks[i]?'Done':'To do'}>{checks[i]?'✓':i+1}</span>{label}</li>)}</ol><p className="tip">Space makes a gap. Shift makes a capital. Enter starts a new paragraph. Backspace removes the letter before the cursor.</p><p>Select text before choosing Bold. Undo lets you try again.</p><p>A keyboard helps you practise. Touch controls work too.</p></aside>
  <div className="panel document-panel"><label className="field-label">Document name<input value={title} maxLength={60} onChange={e=>{setTitle(e.target.value);setDirty(true);}}/></label>
   <div className="toolbar editor-toolbar" role="toolbar" aria-label="Writing tools">
    <button aria-pressed={formats.heading||false} onClick={()=>editor.chain().focus().toggleHeading({level:1}).run()}>Heading</button>
    <button onClick={()=>editor.chain().focus().setParagraph().run()}>Normal text</button>
    <button aria-label="Bold" aria-pressed={formats.bold||false} onClick={()=>editor.chain().focus().toggleBold().run()}><b>B</b></button>
    <button aria-label="Italic" aria-pressed={formats.italic||false} onClick={()=>editor.chain().focus().toggleItalic().run()}><i>I</i></button>
    <button onClick={()=>editor.chain().focus().setTextAlign('left').run()}>Align left</button>
    <button aria-pressed={formats.center||false} onClick={()=>editor.chain().focus().setTextAlign('center').run()}>Centre</button>
    <button onClick={()=>editor.chain().focus().undo().run()}>Undo</button><button onClick={()=>editor.chain().focus().redo().run()}>Redo</button>
    <label className="picture-picker">Picture planet<select aria-label="Picture planet" value={picturePlanet} onChange={e=>setPicturePlanet(e.target.value)}>{planets.map(name=><option key={name}>{name}</option>)}</select></label><button disabled={nodes.some(n=>n.type==='image')} onClick={addPicture}>Add {picturePlanet} picture</button>
   </div>
   <EditorContent editor={editor}/>
   <div className="toolbar document-actions"><button className="primary" onClick={save}>Save document</button><button onClick={open}>Open saved document</button><button onClick={exportWord}>Download Word document</button><button onClick={()=>window.print()}>Print</button></div>
   <p className="save-status" role="status">{status}{dirty?' · Unsaved changes':''}</p>
  </div></div>
 </section>;
}
