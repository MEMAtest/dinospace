import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import './writingDesk.css';
import { loadProject, saveProject } from './storage.js';
import { documentText } from './wordExport.js';

const planets=['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const blank={type:'doc',content:[{type:'paragraph'}]};
const withHeadingText=(document,value)=>{
 const content=[...(document.content||[])];
 const index=content.findIndex(node=>node.type==='heading');
 const heading={type:'heading',attrs:{level:1},content:value?[{type:'text',text:value}]:[]};
 if(index<0)content.unshift(heading);
 else content[index]={...content[index],content:heading.content};
 return {...document,content};
};
export default function WritingDesk({ player, registerDirty }){
 const [started,setStarted]=useState(false),[lesson,setLesson]=useState(1),[furthestStep,setFurthestStep]=useState(1);
 const [title,setTitle]=useState('My space postcard'),[dirty,setDirty]=useState(false),[status,setStatus]=useState('Write your own words, then Save.'),[revision,setRevision]=useState(0),[saved,setSaved]=useState(false),[reopened,setReopened]=useState(false),[exported,setExported]=useState(false);
 const [picturePlanet,setPicturePlanet]=useState('Earth');
 const headingInputRef=useRef(null);
 const editor=useEditor({extensions:[StarterKit.configure({heading:{levels:[1]},bulletList:false,orderedList:false,blockquote:false,codeBlock:false,horizontalRule:false,link:false}),TextAlign.configure({types:['heading','paragraph']}),Image.configure({allowBase64:true})],content:blank,editorProps:{attributes:{role:'textbox','aria-label':'Your document','aria-multiline':'true',spellcheck:'true'}},onUpdate:()=>{setDirty(true);setRevision(v=>v+1);}});
 const formats=useEditorState({editor,selector:({editor:e})=>e?{bold:e.isActive('bold'),italic:e.isActive('italic'),heading:e.isActive('heading'),center:e.isActive({textAlign:'center'})}:{}});
 const live=useRef({dirty});live.current={dirty};
 useEffect(()=>{registerDirty(()=>live.current.dirty);return()=>registerDirty(null);},[registerDirty]);
 useEffect(()=>{const f=e=>{if(live.current.dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',f);return()=>window.removeEventListener('beforeunload',f);},[]);
 useEffect(()=>{if(started&&lesson===1)headingInputRef.current?.focus({preventScroll:true});},[started,lesson]);
 const save=()=>{
  const ok=saveProject(player,'writing',{title,document:editor.getJSON()});
  if(ok){setDirty(false);setSaved(true);setStatus('Document saved on this device.');}else setStatus('Could not save. Keep this page open and download your Word document.');
 };
 const open=()=>{
  const data=loadProject(player,'writing');if(!data?.document){setStatus('No saved document for this explorer.');return;}
  if(dirty&&!window.confirm('Open the saved document and replace these unsaved changes?'))return;
  try{editor.commands.setContent(data.document,{emitUpdate:false});setTitle(data.title);const picture=(data.document.content||[]).find(n=>n.type==='image');const planet=planets.find(name=>picture?.attrs?.alt?.includes(name));if(planet)setPicturePlanet(planet);setDirty(false);setStarted(true);setLesson(4);setFurthestStep(4);setReopened(true);setSaved(true);setRevision(v=>v+1);setStatus('Saved document reopened. Your words and formatting are here.');}catch{setStatus('That document could not be opened.');}
 };
 const addPicture=async()=>{
  try{const response=await fetch(`/models/${picturePlanet==='Earth'?'solar-v2':'solar-v1'}/${picturePlanet.toLowerCase()}.png`);if(!response.ok)throw Error();const blob=await response.blob();const reader=new FileReader();reader.onload=()=>editor.chain().focus('end').setImage({src:reader.result,alt:picturePlanet==='Earth'?'Earth with blue oceans and continents':`${picturePlanet} from the Solar System`}).run();reader.readAsDataURL(blob);}catch{setStatus('The picture could not be loaded. Your writing is unchanged.');}
 };
 const exportWord=async()=>{
  try{const [{Packer},{buildWordDocument}]=await Promise.all([import('docx'),import('./wordExport.js')]);const blob=await Packer.toBlob(buildWordDocument(title,editor.getJSON()));const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=(title.replace(/[^a-z0-9 -]/gi,'').trim()||'My document')+'.docx';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),30000);setExported(true);setStatus('Word document downloaded. Your saved draft stays here.');}catch{setStatus('Export did not finish. Your writing is still here; try again.');}
 };
 if(!editor)return <p>Opening your writing desk…</p>;
 const json=editor.getJSON(),text=documentText(json),nodes=json.content||[];
 const checks=[nodes.some(n=>n.type==='heading'&&(n.content||[]).some(c=>c.text?.length>2)),text.trim().split(/\s+/).length>=6,nodes.some(n=>(n.content||[]).some(c=>c.marks?.some(m=>m.type==='bold'))),nodes.some(n=>n.type==='image'),saved&&reopened,exported];
 const steps=['Type a heading','Write your message','Select a word and make it bold','Add a planet picture','Save, then reopen your work','Download a Word document'];
 const headingText=nodes.filter(n=>n.type==='heading').map(n=>documentText({content:[n]})).join('');
 const messageText=nodes.filter(n=>n.type==='paragraph').map(n=>documentText({content:[n]})).join(' ');
 const hasPicture=nodes.some(n=>n.type==='image');
 const begin=()=>{setStarted(true);setTitle(`My ${picturePlanet} postcard`);setLesson(1);setFurthestStep(1);editor.commands.setContent({type:'doc',content:[{type:'heading',attrs:{level:1}}]},{emitUpdate:false});};
 const nextMessage=()=>{setLesson(2);setFurthestStep(v=>Math.max(v,2));const end=editor.state.doc.content.size;const last=editor.state.doc.lastChild;if(last?.type.name==='paragraph'&&!last.content.size)editor.commands.setTextSelection(end-1);else editor.chain().insertContentAt(end,{type:'paragraph'}).setTextSelection(end+1).run();editor.view.focus();};
 const changeHeading=value=>{editor.commands.setContent(withHeadingText(editor.getJSON(),value),{emitUpdate:false});setDirty(true);setRevision(v=>v+1);};
 if(!started)return <section className="activity-welcome writing-welcome"><div className="postcard-preview"><span className="postage">✦ SPACE POST</span><img src={`/models/${picturePlanet==='Earth'?'solar-v2':'solar-v1'}/${picturePlanet.toLowerCase()}.png`} alt={picturePlanet}/><p>Hello from {picturePlanet}!</p></div><p className="eyebrow">A postcard from space</p><h1>Where shall we write from?</h1><p>Pick a planet. Then write your own postcard, add a picture and send it home as a Word document.</p><div className="planet-choices">{['Earth','Mars','Saturn'].map(name=><button key={name} aria-pressed={picturePlanet===name} onClick={()=>setPicturePlanet(name)}><img src={`/models/${name==='Earth'?'solar-v2':'solar-v1'}/${name.toLowerCase()}.png`} alt=""/>{name}</button>)}</div><button className="primary start-button" onClick={begin}>Make my {picturePlanet} postcard →</button>{loadProject(player,'writing')&&<button onClick={open}>Open saved document</button>}<p className="quiet">You’ll write the words. We’ll show you where to start.</p><p role="status">{status}</p></section>;
 return <section aria-labelledby="writing-title" data-revision={revision} data-writing-lesson={lesson}>
  <div className="section-heading"><div><p className="eyebrow">Type · Edit · Save · Share</p><h1 id="writing-title">My Writing Desk</h1></div><span className="skill-pill">Space postcard</span></div>
  <nav className="lesson-steps writing-step-nav" aria-label="Postcard steps">{['Heading','Message','Decorate','Save & share'].map((name,i)=><button type="button" className={lesson===i+1?'current':furthestStep>i+1?'done':''} aria-current={lesson===i+1?'step':undefined} disabled={i+1>furthestStep} onClick={()=>setLesson(i+1)} key={name}>{i+1}. {name}</button>)}</nav>
  <div className="writing-layout"><aside className="panel lesson-card"><h2>Your postcard mission</h2><ol className="writing-checklist">{steps.map((label,i)=><li key={label} className={checks[i]?'checked':''}><span aria-label={checks[i]?'Done':'To do'}>{checks[i]?'✓':i+1}</span>{label}</li>)}</ol><p className="tip">Space makes a gap. Shift makes a capital. Enter starts a new paragraph. Backspace removes the letter before the cursor.</p><p>To try bold, select a word in your message, open “More writing tools”, then choose Bold. Undo lets you try again.</p><p>A keyboard helps you practise. Touch controls work too.</p></aside>
  <div className="panel document-panel"><div className="writing-coach" aria-live="polite"><span className="coach-icon">{lesson===1?'✏':lesson===2?'✉':lesson===3?'✦':'★'}</span><div className="writing-coach-copy"><p className="eyebrow">{lesson<4?`Your next step · ${lesson} of 4`:'Your postcard is ready to keep'}</p><h2>{lesson===1?'Type a heading for your postcard.':lesson===2?'Now tell someone about your planet.':lesson===3?'Give your postcard a planet picture.':'Save your postcard, then open it again.'}</h2><p>{lesson===1?`Type in the labelled heading box, or edit the heading on the page. Try “Hello from ${picturePlanet}!”`:lesson===2?`Write one or two sentences. What can you see on ${picturePlanet}? Start with “I can see…” if you like. To try bold, select a word, open “More writing tools”, then choose Bold.`:lesson===3?'Choose a picture below. Your own words stay exactly as you wrote them.':'Save your postcard here. Open it again to check, then download a Word copy to share.'}</p>
  {lesson===1&&<><label className="field-label writing-heading-field">Postcard heading<input ref={headingInputRef} aria-describedby="heading-next-help" value={headingText} maxLength={100} onChange={e=>changeHeading(e.target.value)} placeholder={`Hello from ${picturePlanet}!`}/></label><button className="primary" disabled={headingText.trim().length<3} onClick={nextMessage}>Next: write my message →</button><p id="heading-next-help" className="writing-step-help">{headingText.trim().length<3?'Type at least 3 characters in the heading box to continue.':'Heading ready. You can edit it here or directly on the postcard.'}</p></>}
  {lesson===2&&<><button className="primary" disabled={messageText.trim().split(/\s+/).filter(Boolean).length<4} onClick={()=>{setLesson(3);setFurthestStep(v=>Math.max(v,3));}}>Next: decorate my postcard →</button>{messageText.trim().split(/\s+/).filter(Boolean).length<4&&<p className="writing-step-help">Write at least 4 words in your message to continue.</p>}</>}
  {lesson===3&&<div className="toolbar"><button disabled={hasPicture} onClick={addPicture}>Add {picturePlanet} picture</button><button className="primary" disabled={!hasPicture} onClick={()=>{setLesson(4);setFurthestStep(v=>Math.max(v,4));}}>Next: save & share →</button></div>}
  {lesson===4&&<div className="toolbar writing-save-actions"><button className="primary" onClick={save}>Save document</button><button onClick={open}>Open saved document</button><button onClick={exportWord}>Download Word document</button></div>}
  {lesson>1&&<button className="text-button" onClick={()=>setLesson(v=>v-1)}>← Previous step</button>}</div></div>
  <div className="postcard-paper"><span className="postage">✦ SPACE POST</span><EditorContent editor={editor}/></div><details className="name-drawer"><summary>Postcard name: {title}</summary><label className="field-label">Document name<input value={title} maxLength={60} onChange={e=>{setTitle(e.target.value);setDirty(true);}}/></label>
   </details><details className="format-drawer"><summary>More writing tools · bold and layout</summary><div className="toolbar editor-toolbar" role="toolbar" aria-label="Writing tools">
    <button aria-pressed={formats.heading||false} onClick={()=>editor.chain().focus().toggleHeading({level:1}).run()}>Heading</button>
    <button onClick={()=>editor.chain().focus().setParagraph().run()}>Normal text</button>
    <button aria-label="Bold" aria-pressed={formats.bold||false} onClick={()=>editor.chain().focus().toggleBold().run()}><b>B</b></button>
    <button aria-label="Italic" aria-pressed={formats.italic||false} onClick={()=>editor.chain().focus().toggleItalic().run()}><i>I</i></button>
    <button onClick={()=>editor.chain().focus().setTextAlign('left').run()}>Align left</button>
    <button aria-pressed={formats.center||false} onClick={()=>editor.chain().focus().setTextAlign('center').run()}>Centre</button>
    <button onClick={()=>editor.chain().focus().undo().run()}>Undo</button><button onClick={()=>editor.chain().focus().redo().run()}>Redo</button>
    <label className="picture-picker">Picture planet<select aria-label="Picture planet" value={picturePlanet} onChange={e=>setPicturePlanet(e.target.value)}>{planets.map(name=><option key={name}>{name}</option>)}</select></label><button disabled={nodes.some(n=>n.type==='image')} onClick={addPicture}>Add {picturePlanet} picture</button>
   </div>
   </details>
   {lesson<4&&<div className="toolbar document-actions"><button className="primary" onClick={save}>Save document</button><button onClick={open}>Open saved document</button><button onClick={exportWord}>Download Word document</button><button onClick={()=>window.print()}>Print</button></div>}
   <p className="save-status" role="status">{status}{dirty?' · Unsaved changes':''}</p>
  </div></div>
 </section>;
}
