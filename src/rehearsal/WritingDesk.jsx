import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import { FocusMenu } from '../components/shared/FocusMenu.jsx';
import './writingDesk.css';
import {
  WRITING_PROJECTS, checkWritingProject, countWritingBodyWords, writingHeadingText,
} from './writingProjects.js';
import {
  completeWritingProject, hasWritingRecovery, loadWritingDraft, readLegacyWritingDraft,
  readWritingProgress, saveWritingDraft,
} from './writingProgress.js';

const planets = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const blankDocument = (project) => ({ type: 'doc', content: [
  { type: 'heading', attrs: { level: 1 }, content: [] },
  { type: 'paragraph', content: [] },
  ...(project.id === 'planet-mini-report' ? [{ type: 'paragraph', content: [] }, { type: 'paragraph', content: [] }] : []),
] });
export default function WritingDesk({ player = 'amari', playerId = player, registerDirty, onCelebrate = () => {}, onGameEvent, onPhaseChange, cancelNarration = () => {}, soundOn = false, onBack }) {
  const [screen, setScreen] = useState('map');
  const [panel, setPanel] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [title, setTitle] = useState('');
  const [planet, setPlanet] = useState('Earth');
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState('idle');
  const [status, setStatus] = useState('Choose a project to begin. Saved work stays on this device for this explorer.');
  const [revision, setRevision] = useState(0);
  const [milestones, setMilestones] = useState({ saved: false, reopened: false, exported: false });
  const [progress, setProgress] = useState(() => readWritingProgress(playerId));
  const [imageLoading, setImageLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [readOnlyRecovery, setReadOnlyRecovery] = useState(false);
  const revisionRef = useRef(0);
  const activeProjectRef = useRef(activeProjectId);
  const playerIdRef = useRef(String(playerId));
  const milestonesRef = useRef(milestones);
  const operationIdRef = useRef(0);
  const operationRef = useRef(null);
  const mountedRef = useRef(true);
  playerIdRef.current = String(playerId);

  const liveRef = useRef({ dirty: false, snapshot: null });
  const lastDocumentRef = useRef(null);
  const editFrameRef = useRef(null);
  const headingRef = useRef(null);
  const selectedTextRef = useRef(null);
  const extensions = useMemo(() => [
    StarterKit.configure({ heading: { levels: [1] }, bulletList: false, orderedList: false, blockquote: false, codeBlock: false, horizontalRule: false, link: false }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Image.configure({ allowBase64: true }),
  ], []);
  const initialDocument = useMemo(() => blankDocument(WRITING_PROJECTS[0]), []);
  const editorProps = useMemo(() => ({ attributes: { role: 'textbox', 'aria-label': 'Your project document', 'aria-multiline': 'true', spellcheck: 'true' } }), []);
  const editor = useEditor({
    extensions,
    content: initialDocument,
    editorProps,
    shouldRerenderOnTransaction: false,
    onSelectionUpdate: ({ editor: current }) => {
      const { doc, selection } = current.state;
      if (!selection.empty) selectedTextRef.current = { doc, from: selection.from, to: selection.to };
      else if (current.view.hasFocus()) selectedTextRef.current = null;
    },
    onUpdate: ({ editor: currentEditor }) => {
      if (!activeProjectRef.current) return;
      if (lastDocumentRef.current?.eq(currentEditor.state.doc)) return;
      lastDocumentRef.current = currentEditor.state.doc;
      revisionRef.current += 1;
      milestonesRef.current = { saved: false, reopened: false, exported: false };
      snapshotRef.current = { ...snapshotRef.current, document: currentEditor.getJSON(), milestones: { ...milestonesRef.current, saved: false, reopened: false, exported: false } };
      liveRef.current = {
        ...liveRef.current,
        dirty: true,
        snapshot: snapshotRef.current,
      };
      // ProseMirror can dispatch several transactions for one edit. Keep the
      // live draft current synchronously, then render outside its update stack.
      if (editFrameRef.current === null) editFrameRef.current = window.requestAnimationFrame(() => {
        editFrameRef.current = null;
        if (!mountedRef.current || !activeProjectRef.current) return;
        setRevision(revisionRef.current);
        setDirty(true);
        setSaveState('pending');
        setMilestones(milestonesRef.current);
      });
    },
  });
  const activeProject = WRITING_PROJECTS.find((item) => item.id === activeProjectId) || null;
  const activePrompt = activeProject ? `${activeProject.prompt}${planet === 'Pluto' ? ' Pluto is a dwarf planet.' : ''}` : '';
  const document = editor?.getJSON() || blankDocument(WRITING_PROJECTS[0]);
  const bodyWords = countWritingBodyWords(document);
  const review = activeProject ? checkWritingProject(activeProject.id, { title, document }, milestones) : null;
  const savedProjects = Object.fromEntries(WRITING_PROJECTS.map((item) => [item.id, loadWritingDraft(playerId, item.id)]));
  const legacyDraft = readLegacyWritingDraft(playerId);

  const snapshotRef = useRef(null);
  if (!snapshotRef.current) snapshotRef.current = { playerId, projectId: activeProjectId, title, document, planet, milestones };
  const snapshot = (milestonePatch = {}) => ({
    ...snapshotRef.current,
    milestones: { ...snapshotRef.current.milestones, ...milestonePatch },
  });

  const applyRecord = useCallback((record, { recovered = false, readOnly = false, unsaved = false, statusMessage } = {}) => {
    if (!editor) return;
    cancelNarration();
    activeProjectRef.current = record.projectId;
    setActiveProjectId(record.projectId);
    editor.commands.setContent(record.document, { emitUpdate: false });
    editor.setEditable(!readOnly);
    setTitle(record.title);
    setPlanet(planets.includes(record.planet) ? record.planet : 'Earth');
    const loadedMilestones = { saved: Boolean(record.milestones?.saved), reopened: Boolean(record.milestones?.reopened), exported: Boolean(record.milestones?.exported) };
    setMilestones(loadedMilestones);
    milestonesRef.current = loadedMilestones;
    revisionRef.current += 1;
    setRevision(revisionRef.current);
    setDirty(Boolean(recovered || unsaved));
    setSaveState(unsaved ? 'failed' : recovered ? 'pending' : 'saved');
    setScreen('editor');
    setReadOnlyRecovery(Boolean(readOnly));
    setStatus(statusMessage || (readOnly ? 'Older saved copy opened read-only. Its original stays separate; you can download a Word copy.' : unsaved ? 'The legacy copy is open and editable, but its new recoverable copy did not save. The original is unchanged; retry or export.' : recovered ? 'Recovered the last saved copy. Saving this recovered work will restore it as the current draft.' : 'Saved project reopened. Your text, formatting, picture and project are here.'));
    snapshotRef.current = { ...record, milestones: loadedMilestones };
    liveRef.current = { dirty: Boolean(recovered || unsaved), snapshot: snapshotRef.current };
  }, [cancelNarration, editor]);

  const persist = (payload = snapshotRef.current, expectedRevision = revisionRef.current) => {
    if (!payload?.projectId || !payload.document) return false;
    const result = saveWritingDraft(payload);
    if (!result.ok) {
      setSaveState('failed');
      setDirty(true);
      setStatus('Save failed. Your writing is still editable. Retry save or download a Word copy.');
      liveRef.current.dirty = true;
      return false;
    }
    setSaveState('saved');
    setMilestones(result.record.milestones);
    milestonesRef.current = result.record.milestones;
    if (revisionRef.current === expectedRevision) {
      if (editFrameRef.current !== null) window.cancelAnimationFrame(editFrameRef.current);
      editFrameRef.current = null;
      setDirty(false);
      liveRef.current.dirty = false;
    }
    const kind = WRITING_PROJECTS.find((item) => item.id === payload.projectId)?.kind || 'Project';
    setStatus(`Saved on this device · ${kind} draft updated.`);
    snapshotRef.current = result.record;
    liveRef.current.snapshot = result.record;
    return true;
  };
  const persistRef = useRef(persist);
  persistRef.current = persist;

  const saveNow = (milestonePatch) => persist(snapshot(milestonePatch));

  const markMetadataEdited = (patch) => {
    milestonesRef.current = { saved: false, reopened: false, exported: false };
    setMilestones(milestonesRef.current);
    revisionRef.current += 1;
    setRevision(revisionRef.current);
    setDirty(true);
    setSaveState('pending');
    const nextSnapshot = snapshot({ saved: false, reopened: false, exported: false });
    Object.assign(nextSnapshot, patch);
    snapshotRef.current = nextSnapshot;
    liveRef.current = { dirty: true, snapshot: nextSnapshot };
  };

  useEffect(() => {
    setProgress(readWritingProgress(playerId));
  }, [playerId]);
  useEffect(() => {
    onPhaseChange?.(screen === 'map' ? 'intro' : screen === 'complete' ? 'finish' : 'play');
  }, [onPhaseChange, screen]);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const target = screen === 'editor'
        ? window.document.querySelector('[data-writing-screen="editor"] .writing-paper .tiptap')
        : screen === 'complete'
          ? window.document.querySelector('[data-writing-screen="complete"] .is-primary')
          : window.document.querySelector('[data-writing-screen="map"] .is-primary');
      target?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeProjectId, screen]);
  useEffect(() => {
    if (!soundOn) cancelNarration();
  }, [cancelNarration, soundOn]);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; if (editFrameRef.current !== null) window.cancelAnimationFrame(editFrameRef.current); editFrameRef.current = null; operationIdRef.current += 1; operationRef.current = null; cancelNarration(); }; }, [cancelNarration]);
  useEffect(() => {
    const unsubscribe = registerDirty?.(() => liveRef.current.dirty || Boolean(operationRef.current));
    return () => { if (unsubscribe) unsubscribe(); else registerDirty?.(null); };
  }, [registerDirty]);
  useEffect(() => {
    if (screen !== 'editor' || !activeProjectId || !dirty) return undefined;
    setSaveState((current) => current === 'failed' ? 'failed' : 'pending');
    const expectedRevision = revisionRef.current;
    const timer = window.setTimeout(() => {
      if (revisionRef.current !== expectedRevision) return;
      setSaveState('saving');
      persistRef.current(snapshotRef.current, expectedRevision);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [activeProjectId, dirty, revision, screen]);

  const liveHandlersRef = useRef({});
  liveHandlersRef.current.save = () => {
    if (!liveRef.current.dirty || !snapshotRef.current) return true;
    const result = saveWritingDraft(snapshotRef.current);
    if (result.ok) { liveRef.current.dirty = false; return true; }
    return false;
  };
  useEffect(() => {
    const beforeUnload = (event) => {
      if (!liveRef.current.dirty) return;
      if (liveHandlersRef.current.save()) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, []);

  const beginProject = (project) => {
    const index = WRITING_PROJECTS.findIndex((item) => item.id === project.id);
    if (index > progress.unlockedProjectIndex && !progress.completedProjectIds.includes(project.id)) return;
    const existing = loadWritingDraft(playerId, project.id);
    if (existing.ok) { openProject(project.id); return; }
    if (existing.reason === 'draft-corrupt' || existing.reason === 'storage-read-failed') {
      setStatus('A saved copy could not be safely opened. It has not been replaced. You can try a recovery copy or export another open project.');
      return;
    }
    cancelNarration();
    const nextTitle = `My ${project.planet} ${project.kind.toLowerCase()}`;
    const newDoc = blankDocument(project);
    activeProjectRef.current = project.id;
    setActiveProjectId(project.id);
    editor.commands.setContent(newDoc, { emitUpdate: false });
    setTitle(nextTitle);
    setPlanet(project.planet);
    milestonesRef.current = { saved: false, reopened: false, exported: false };
    setMilestones(milestonesRef.current);
    revisionRef.current += 1;
    setRevision(revisionRef.current);
    setDirty(true);
    setSaveState('pending');
    setScreen('editor');
    setStatus('New project started. Your draft will save automatically on this device.');
    setReadOnlyRecovery(false);
    editor.setEditable(true);
    liveRef.current = { dirty: true, snapshot: { playerId, projectId: project.id, title: nextTitle, document: newDoc, planet: project.planet, milestones: milestonesRef.current } };
    snapshotRef.current = liveRef.current.snapshot;
  };

  const openProject = (projectId, preferRecovery = false) => {
    const opened = loadWritingDraft(playerId, projectId, undefined, { preferRecovery });
    if (!opened.ok) { setStatus('No saved project copy is available yet.'); return; }
    applyRecord(opened.record, { recovered: opened.recovered, statusMessage: opened.recovered ? 'Recovered the last-good saved copy. It remains editable; save again to make it current.' : 'Saved project reopened. Your text, formatting, picture and context are here.' });
  };

  const importLegacy = () => {
    if (!legacyDraft) return;
    const current = loadWritingDraft(playerId, 'space-postcard');
    if (current.ok) { setStatus('A recoverable postcard already exists. The older manual copy stays unchanged; resume it or open the older copy read-only to export.'); return; }
    if (current.reason === 'draft-corrupt' || current.reason === 'storage-read-failed') { setStatus('The current saved copy cannot be safely read. The older manual copy remains unchanged.'); return; }
    const result = saveWritingDraft({ playerId, projectId: 'space-postcard', title: legacyDraft.title, document: legacyDraft.document, planet: legacyDraft.planet, legacyImported: true });
    if (!result.ok) {
      if (result.reason === 'draft-too-large' || legacyDraft.tooLargeToCopy) {
        applyRecord({ ...legacyDraft, playerId: String(playerId), projectId: 'space-postcard', milestones: { saved: false, reopened: false, exported: false } }, { readOnly: true });
      } else applyRecord({ ...legacyDraft, playerId: String(playerId), projectId: 'space-postcard', milestones: { saved: false, reopened: false, exported: false } }, { unsaved: true, statusMessage: 'The legacy copy is editable, but its new recoverable copy did not save. The original remains unchanged; retry save or export a Word copy.' });
      return;
    }
    applyRecord(result.record, { statusMessage: 'Legacy postcard copied into the recoverable project library. The original manually saved copy is unchanged.' });
  };

  const goToMap = () => {
    if (operationRef.current) { setStatus('Finish the current picture or Word export before switching projects.'); return; }
    if (screen === 'editor' && (dirty || liveRef.current.dirty) && !saveNow()) return;
    cancelNarration();
    setScreen('map');
    setActiveProjectId(null);
    activeProjectRef.current = null;
    setDirty(false);
    liveRef.current.dirty = false;
  };

  const updateTitle = (nextTitle) => {
    setTitle(nextTitle);
    markMetadataEdited({ title: nextTitle });
  };

  const updateHeading = (nextHeading) => {
    if (!editor || readOnlyRecovery) return;
    const current = editor.getJSON();
    const content = [...(current.content || [])];
    const headingIndex = content.findIndex((node) => node.type === 'heading');
    const priorHeading = headingIndex >= 0 ? content[headingIndex] : { type: 'heading', attrs: { level: 1 } };
    const heading = { ...priorHeading, content: nextHeading ? [{ type: 'text', text: nextHeading }] : [] };
    if (headingIndex < 0) content.unshift(heading);
    else content[headingIndex] = heading;
    const nextDocument = { ...current, content };
    editor.commands.setContent(nextDocument, { emitUpdate: false });
    markMetadataEdited({ document: nextDocument });
  };

  const focusBody = () => {
    let position = 0;
    editor.state.doc.forEach((node, offset) => {
      if (node.type.name === 'paragraph') position = offset + node.nodeSize - 1;
    });
    if (position) editor.commands.setTextSelection(position);
    editor.view.focus();
    editor.commands.scrollIntoView();
  };

  const addPlanetPicture = async () => {
    if (!editor || imageLoading) return;
    const owner = { playerId: String(playerId), projectId: activeProjectRef.current, revision: revisionRef.current };
    const operationId = ++operationIdRef.current;
    const isCurrent = () => mountedRef.current && operationIdRef.current === operationId && playerIdRef.current === owner.playerId && activeProjectRef.current === owner.projectId && revisionRef.current === owner.revision;
    operationRef.current = { id: operationId, type: 'picture', ...owner };
    const clearOperation = (message) => {
      if (operationRef.current?.id === operationId) operationRef.current = null;
      if (mountedRef.current && activeProjectRef.current === owner.projectId) {
        setImageLoading(false);
        if (message) setStatus(message);
      }
    };
    setImageLoading(true);
    try {
      const path = `/models/${planet === 'Earth' ? 'solar-v2' : 'solar-v1'}/${planet.toLowerCase()}.png`;
      const response = await fetch(path);
      if (!response.ok) throw new Error('picture-fetch-failed');
      const blob = await response.blob();
      if (blob.type !== 'image/png') throw new Error('picture-format-not-supported');
      const reader = new FileReader();
      reader.onload = () => {
        if (!isCurrent()) {
          clearOperation('The writing changed while the picture was loading. Choose the picture again.');
          return;
        }
        editor.chain().focus('end').setImage({ src: reader.result, alt: planet === 'Pluto' ? 'Pluto dwarf planet space picture' : `${planet} planet picture` }).run();
        operationRef.current = null;
        setStatus(`${planet} picture added. It will be included in the saved draft and Word export.`);
        setImageLoading(false);
      };
      reader.onerror = () => { clearOperation('The picture could not be read. Your writing is unchanged.'); };
      reader.readAsDataURL(blob);
    } catch {
      clearOperation('The planet picture could not be loaded. Your text and formatting are unchanged.');
    }
  };

  const openSavedProject = () => {
    if (!activeProject || !saveNow()) return;
    const opened = loadWritingDraft(playerId, activeProject.id);
    if (!opened.ok) { setStatus('The saved project could not be read back. Your current writing remains on the page.'); return; }
    editor.commands.setContent(opened.record.document, { emitUpdate: false });
    setTitle(opened.record.title);
    setPlanet(opened.record.planet);
    const nextMilestones = { ...opened.record.milestones, reopened: true };
    const marked = saveWritingDraft({ ...opened.record, milestones: nextMilestones });
    if (!marked.ok) {
      const failedMilestones = { ...opened.record.milestones, reopened: false };
      milestonesRef.current = failedMilestones;
      setMilestones(failedMilestones);
      setDirty(true);
      setSaveState('failed');
      setStatus('The saved copy opened, but the open-check could not be saved. Retry save before completing this project.');
      snapshotRef.current = { ...opened.record, milestones: failedMilestones };
      liveRef.current = { dirty: true, snapshot: snapshotRef.current };
      return;
    }
    milestonesRef.current = marked.record.milestones;
    snapshotRef.current = marked.record;
    liveRef.current = { dirty: false, snapshot: marked.record };
    setMilestones(marked.record.milestones);
    setDirty(false);
    setSaveState('saved');
    setStatus('Saved project reopened successfully. Text, formatting, image and project context were read back from storage.');
  };

  const exportWord = async () => {
    if (!activeProject || !editor || operationRef.current) return;
    const owner = { playerId: String(playerId), projectId: activeProject.id, revision: revisionRef.current };
    const exportSnapshot = snapshot();
    const operationId = ++operationIdRef.current;
    const isCurrent = () => mountedRef.current && operationIdRef.current === operationId && playerIdRef.current === owner.playerId && activeProjectRef.current === owner.projectId && revisionRef.current === owner.revision;
    operationRef.current = { id: operationId, type: 'export', ...owner };
    setExporting(true);
    try {
      const [{ Packer }, { buildWordDocument }] = await Promise.all([import('docx'), import('./wordExport.js')]);
      if (!isCurrent()) return;
      const blob = await Packer.toBlob(buildWordDocument(exportSnapshot.title, exportSnapshot.document));
      if (!isCurrent()) {
        if (mountedRef.current && activeProjectRef.current === owner.projectId) setStatus('The document changed while the Word file was being prepared. Start the export again.');
        return;
      }
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download = `${exportSnapshot.title.replace(/[^a-z0-9 -]/giu, '').trim() || 'My writing project'}.docx`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch {
      if (isCurrent()) setStatus('Word export did not start. Your editable project is unchanged; try again.');
      return;
    } finally {
      if (operationRef.current?.id === operationId) operationRef.current = null;
      if (mountedRef.current && operationIdRef.current === operationId) setExporting(false);
    }
    if (readOnlyRecovery) {
      setStatus('Word export started; check Downloads. This oversized legacy copy remains read-only and its original saved draft is unchanged.');
      return;
    }
    if (!isCurrent()) return;
    const marked = saveWritingDraft({ ...exportSnapshot, milestones: { ...exportSnapshot.milestones, exported: true } });
    if (!marked.ok) {
      setSaveState('failed');
      setDirty(true);
      setStatus('Word export started; check Downloads. The export step could not be saved, so retry save before completing.');
      return;
    }
    milestonesRef.current = marked.record.milestones;
    snapshotRef.current = marked.record;
    liveRef.current = { dirty: false, snapshot: marked.record };
    setMilestones(marked.record.milestones);
    setDirty(false);
    setSaveState('saved');
    setStatus('Word export started; check Downloads. The saved project draft was not changed by the export.');
  };

  const completeProject = () => {
    if (!activeProject || !review?.complete) return;
    if ((dirty || liveRef.current.dirty) && !saveNow()) return;
    const result = completeWritingProject(playerId, activeProject.id);
    if (!result.persisted) {
      setSaveState('failed');
      setStatus(result.checks?.some((check) => !check.done) ? 'Some project steps still need attention. Follow the checklist before completing.' : 'Project steps are ready, but completion could not be saved. Retry save, then try Complete project again.');
      return;
    }
    setProgress(result);
    setStatus('Project steps saved as complete.');
    if (result.newlyCompleted) {
      cancelNarration();
      onCelebrate('Writing project complete!', 4, 0, 'writingdesk', { quiet: true });
      onGameEvent?.('writingdesk', 'project_completed', {
        level: activeProject.id, item: activeProject.kind, correct: true, independent: false, diagnosticOnly: true,
        bodyWordCount: review.bodyWordCount, paragraphCount: review.paragraphCount,
        formattedBold: review.checks.find((check) => check.id === 'bold').done,
        formattedItalic: review.checks.find((check) => check.id === 'italic').done,
        imageAdded: review.checks.find((check) => check.id === 'picture').done,
      });
    }
    setScreen('complete');
  };

  if (!editor) return <p>Opening your writing desk…</p>;

  const busy = imageLoading || exporting;
  const closePanel = () => setPanel(null);
  const leaveDesk = () => {
    if (busy || !liveHandlersRef.current.save()) {
      if (!busy) { setSaveState('failed'); setStatus('Your draft could not save. Retry before leaving.'); }
      return;
    }
    cancelNarration();
    onBack?.();
  };
  const available = (project, index) => index <= progress.unlockedProjectIndex || progress.completedProjectIds.includes(project.id);
  const projectAction = project => {
    closePanel();
    if (savedProjects[project.id].ok) openProject(project.id);
    else beginProject(project);
  };

  const preferredProject = WRITING_PROJECTS[Math.min(progress.unlockedProjectIndex, WRITING_PROJECTS.length - 1)];
  const primaryProject = preferredProject || WRITING_PROJECTS[0];
  const primarySaved = savedProjects[primaryProject.id];
  const primaryBlocked = !primarySaved.ok && ['draft-corrupt', 'storage-read-failed'].includes(primarySaved.reason);
  const openLegacyReadOnly = () => {
    closePanel();
    applyRecord({ ...legacyDraft, playerId: String(playerId), projectId: 'space-postcard', milestones: { saved: false, reopened: false, exported: false } }, { readOnly: true });
  };
  const projectOptions = [
    ...WRITING_PROJECTS.map((project, index) => ({
      label: project.title, description: project.description,
      disabled: !available(project, index) || ['draft-corrupt', 'storage-read-failed'].includes(savedProjects[project.id].reason),
      button: savedProjects[project.id].ok ? 'Open saved draft' : 'Start project', action: () => projectAction(project),
    })),
    ...WRITING_PROJECTS.filter((project, index) => available(project, index) && hasWritingRecovery(playerId, project.id)).map(project => ({
      label: `Recover ${project.title}`, action: () => { closePanel(); openProject(project.id, true); },
    })),
    ...(legacyDraft ? [
      ...(!savedProjects['space-postcard'].ok ? [{ label: 'Import older postcard', action: () => { closePanel(); importLegacy(); } }] : []),
      { label: 'Open older copy read-only', action: openLegacyReadOnly },
    ] : []),
    ...(onBack ? [{ label: 'Back to Creative Lab', action: leaveDesk }] : []),
  ];
  if (screen === 'map' || screen === 'complete') {
    const complete = screen === 'complete';
    return <section className="writing-desk writing-focus focus-game" aria-labelledby="writing-map-title" data-writing-screen={screen} data-writing-stage={complete ? 'complete' : 'project-map'} data-writing-project={complete ? activeProject?.id : ''} data-writing-save-status={saveState}>
      <div className="focus-game-body is-menu">
        <header className="focus-game-heading"><h1 id="writing-map-title">{complete ? `${activeProject.title} complete!` : 'My Writing Desk'}</h1></header>
        {panel ? <FocusMenu choices={projectOptions} onBack={closePanel} /> : <>
          <div className="writing-focus-planet">
            <img src={`/models/${primaryProject.planet === 'Earth' ? 'solar-v2' : 'solar-v1'}/${primaryProject.planet.toLowerCase()}.png`} alt={primaryProject.planet} />
          </div>
          <p className="focus-game-message">{complete ? 'Your project is saved.' : primaryBlocked ? 'The saved draft could not be opened. Look in Options for a recovery copy.' : primaryProject.description}</p>
          {!complete && legacyDraft && <p>An older saved postcard is available in Options.</p>}
          {status && !complete && !status.startsWith('Choose a project') && <p className="writing-save-status" role="status">{status}</p>}
          <div className="focus-game-actions">
            {complete
              ? <button type="button" className="focus-game-button is-primary" onClick={goToMap}>Next project</button>
              : !primaryBlocked && <button type="button" className="focus-game-button is-primary" onClick={() => projectAction(primaryProject)}>{primarySaved.ok ? 'Resume' : 'Start'}: {primaryProject.title}</button>}
            <button type="button" className="focus-game-button" onClick={() => setPanel('options')}>Options</button>
            {onBack && <button type="button" className="focus-game-button" onClick={leaveDesk}>Back</button>}
          </div>
        </>}
      </div>
    </section>;
  }

  const missingCheck = review.checks.find(check => !check.done);
  const imageExists = (document.content || []).some(node => node.type === 'image');
  const closeAnd = action => {
    closePanel();
    requestAnimationFrame(() => { if (mountedRef.current) action(); });
  };
  const format = command => {
    const saved = selectedTextRef.current;
    closeAnd(() => {
      const chain = editor.chain();
      if (['toggleBold', 'toggleItalic'].includes(command) && saved?.doc === editor.state.doc) {
        chain.setTextSelection({ from: saved.from, to: saved.to });
      }
      chain[command]().run();
      editor.view.focus();
    });
  };
  const align = value => closeAnd(() => editor.chain().focus().setTextAlign(value).run());
  const editorOptions = [
    ...(!readOnlyRecovery ? [
      { label: 'Save now', disabled: busy, action: () => closeAnd(() => saveNow()) },
      { label: 'Save and reopen', disabled: busy, action: () => closeAnd(openSavedProject) },
      { label: 'Bold selected text', action: () => format('toggleBold') },
      { label: 'Italic selected text', action: () => format('toggleItalic') },
      { label: 'Centre paragraph', action: () => align('center') },
      { label: 'Align left', action: () => align('left') },
      { label: 'Normal text', action: () => format('setParagraph') },
      { label: 'Undo', action: () => format('undo') },
      { label: 'Redo', action: () => format('redo') },
      { label: 'Planet picture', disabled: imageExists || busy, action: () => setPanel('picture') },
      { label: 'Document file name', action: () => setPanel('name') },
      { label: 'Project steps', action: () => setPanel('steps') },
    ] : []),
    { label: 'Export Word file', disabled: busy, action: () => closeAnd(exportWord) },
    { label: 'All projects', disabled: busy, action: () => closeAnd(goToMap) },
    ...(onBack ? [{ label: 'Back to Creative Lab', disabled: busy, action: () => closeAnd(leaveDesk) }] : []),
  ];
  const nextActions = {
    documentName: { label: 'Name your document', action: () => setPanel('name') },
    heading: { label: 'Add a heading', action: () => headingRef.current?.focus() },
    bodyWords: { label: 'Write your message', action: focusBody },
    paragraphs: { label: 'Write your next paragraph', action: focusBody },
    bold: { label: 'Bold selected text', action: () => format('toggleBold') },
    italic: { label: 'Italic selected text', action: () => format('toggleItalic') },
    centered: { label: 'Centre paragraph', action: () => align('center') },
    picture: { label: 'Add a planet picture', action: () => setPanel('picture') },
    saved: { label: 'Save draft', action: () => saveNow() },
    reopened: { label: 'Save and reopen', action: openSavedProject },
    exported: { label: 'Export Word file', action: exportWord },
  };
  const mainAction = readOnlyRecovery ? { label: 'Export Word file', action: exportWord }
    : saveState === 'failed' ? { label: 'Retry save', action: () => saveNow() }
      : missingCheck ? nextActions[missingCheck.id] : { label: 'Complete project', action: completeProject };

  return <section className="writing-desk writing-editor writing-focus focus-game" aria-labelledby="writing-title" data-writing-screen="editor" data-writing-stage={readOnlyRecovery ? 'legacy-read-only' : missingCheck?.id || 'complete'} data-writing-project={activeProject.id} data-writing-save-status={readOnlyRecovery ? 'legacy-read-only' : saveState} data-writing-revision={revision}>
    <div className={`focus-game-body${panel ? ' is-menu' : ''}`}>
      <header className="focus-game-heading"><p>My Writing Desk</p><h1 id="writing-title">{activeProject.title}</h1></header>
      <div hidden={Boolean(panel)}>
        <p className="focus-game-message">{readOnlyRecovery ? 'Older copy opened read-only.' : activePrompt}</p>
        <label className="writing-field writing-heading-entry">Heading<input ref={headingRef} aria-label="Document heading" value={writingHeadingText(document)} maxLength={100} readOnly={readOnlyRecovery} onChange={event => updateHeading(event.target.value)} /></label>
        <div className="writing-paper"><EditorContent editor={editor} /></div>
        {!readOnlyRecovery && <p className="writing-word-count" aria-live="polite">{bodyWords} of {activeProject.minimumBodyWords} body words{activeProject.minimumParagraphs > 1 ? ` · ${activeProject.minimumParagraphs} paragraphs needed` : ''}</p>}
        <p id="writing-save-help" className={`writing-save-status is-${saveState}`} role="status">
          {dirty ? saveState === 'failed' ? 'Save failed. Your writing is still here.' : 'Saving draft…' : status}
        </p>
        {missingCheck && !readOnlyRecovery && <p className="focus-game-message">{missingCheck.id === 'bold' || missingCheck.id === 'italic' ? 'Select a word in the message, then use the button below.' : missingCheck.label}</p>}
        <div className="focus-game-actions">
          <button type="button" className="focus-game-button is-primary" disabled={busy || (!missingCheck && !readOnlyRecovery && (dirty || saveState !== 'saved') && saveState !== 'failed')} onClick={mainAction.action}>{busy ? imageLoading ? 'Adding picture…' : 'Preparing Word file…' : mainAction.label}</button>
          <button type="button" className="focus-game-button" disabled={busy} onClick={() => setPanel('options')}>Options</button>
          <button type="button" className="focus-game-button" disabled={busy} onClick={goToMap}>All projects</button>
        </div>
      </div>
      {panel === 'options' ? <FocusMenu choices={editorOptions} onBack={closePanel} /> : panel && <div className="focus-game-menu">
        {panel === 'picture' ? <>
          <label className="writing-field">Space picture
            <select aria-label="Space picture" value={planet} onChange={event => { setPlanet(event.target.value); markMetadataEdited({ planet: event.target.value }); }}>
              {planets.map(name => <option key={name} value={name}>{name === 'Pluto' ? 'Pluto (dwarf planet)' : name}</option>)}
            </select>
          </label>
          <button type="button" className="focus-game-button is-primary" onClick={() => closeAnd(addPlanetPicture)}>Add {planet} picture</button>
        </> : panel === 'name' ? <label className="writing-field">Name for your saved and Word files<input value={title} maxLength={100} onChange={event => updateTitle(event.target.value)} /></label>
          : <>
            <h2>Project steps</h2>
            <div className="writing-checklist">{review.checks.map(check => <div className={check.done ? 'is-done' : ''} key={check.id}><span aria-hidden="true">{check.done ? '✓' : '○'}</span>{check.label}</div>)}</div>
            <p>These steps track how you use the writing desk.</p>
          </>}
        <button type="button" className="focus-game-button" onClick={closePanel}>Back to writing</button>
      </div>}
    </div>
  </section>;
}
