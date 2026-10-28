import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WRITING_PROJECTS, checkWritingProject, countWritingBodyWords,
} from '../src/rehearsal/writingProjects.js';
import {
  LEGACY_WRITING_KEY, MAX_WRITING_RECORD_CHARS, WRITING_DRAFT_PREFIX, completeWritingProject,
  loadWritingDraft, readLegacyWritingDraft, readWritingProgress, saveWritingDraft,
} from '../src/rehearsal/writingProgress.js';

const image = { type: 'image', attrs: { src: 'data:image/png;base64,aGVsbG8=', alt: 'Earth planet picture' } };
const text = (value, marks = []) => ({ type: 'text', text: value, ...(marks.length ? { marks } : {}) });
const paragraph = (value, marks = [], attrs) => ({ type: 'paragraph', ...(attrs ? { attrs } : {}), content: [text(value, marks)] });
const projectDocument = (projectId) => ({
  type: 'doc', content: [
    { type: 'heading', attrs: { level: 1 }, content: [text('My Planet Notes')] },
    paragraph('Here is a bold idea for my planet.', [{ type: 'bold' }], projectId === 'planet-mini-report' ? { textAlign: 'center' } : undefined),
    ...(projectId === 'planet-field-notes' ? [paragraph('I have another question to remember.', [{ type: 'italic' }])] : []),
    ...(projectId === 'planet-mini-report' ? [paragraph('These are more details about the place.'), paragraph('I finish with one thought to share.', [{ type: 'italic' }])] : []),
    image,
  ],
});

const makeStorage = () => {
  const items = new Map();
  return { items, getItem: (key) => items.get(key) ?? null, setItem: (key, value) => items.set(key, String(value)), removeItem: (key) => items.delete(key) };
};

test('three progressive projects use truthful structure checks and body-only word counts', () => {
  assert.deepEqual(WRITING_PROJECTS.map(({ kind }) => kind), ['Postcard', 'Field notes', 'Mini-report']);
  assert.deepEqual(WRITING_PROJECTS.map(({ minimumBodyWords }) => minimumBodyWords), [4, 10, 18]);
  const postcard = projectDocument('space-postcard');
  assert.equal(countWritingBodyWords(postcard), 8);
  assert.equal(checkWritingProject('space-postcard', { title: 'My postcard', document: postcard }, { saved: true, reopened: true, exported: true }).complete, true);
  assert.equal(checkWritingProject('planet-field-notes', { title: 'My field notes', document: projectDocument('planet-field-notes') }, { saved: true, reopened: true, exported: true }).complete, true);
  assert.equal(checkWritingProject('planet-mini-report', { title: 'My mini-report', document: projectDocument('planet-mini-report') }, { saved: true, reopened: true, exported: true }).complete, true);
  const noItalic = { ...projectDocument('planet-field-notes'), content: projectDocument('planet-field-notes').content.map((node) => node.type === 'paragraph' ? paragraph('Here are enough observations in this note.', [{ type: 'bold' }]) : node) };
  assert.equal(checkWritingProject('planet-field-notes', { title: 'My field notes', document: noItalic }, { saved: true, reopened: true, exported: true }).checks.find((item) => item.id === 'italic').done, false);
  const onlyHeading = { type: 'doc', content: [{ type: 'heading', attrs: { level: 1 }, content: [text('one two three four five six')] }] };
  assert.equal(countWritingBodyWords(onlyHeading), 0);
  assert.equal(checkWritingProject('space-postcard', { title: 'My postcard', document: onlyHeading }, { saved: true, reopened: true, exported: true }).complete, false);
});

test('drafts are child and project scoped, bounded, and preserve one last-good version', () => {
  const storage = makeStorage();
  const postcard = projectDocument('space-postcard');
  const first = saveWritingDraft({ playerId: 'amari', projectId: 'space-postcard', title: 'Postcard one', document: postcard, planet: 'Earth' }, storage);
  assert.equal(first.ok, true);
  assert.ok([...storage.items.keys()].some((key) => key.startsWith(`${WRITING_DRAFT_PREFIX}:amari:space-postcard`)));
  assert.equal(loadWritingDraft('guest', 'space-postcard', storage).ok, false);
  assert.equal(loadWritingDraft('amari', 'planet-field-notes', storage).ok, false);
  const secondDoc = { ...postcard, content: [...postcard.content, paragraph('One final sentence here.')] };
  assert.equal(saveWritingDraft({ playerId: 'amari', projectId: 'space-postcard', title: 'Postcard two', document: secondDoc, planet: 'Earth' }, storage).ok, true);
  const thirdDoc = { ...secondDoc, content: [...secondDoc.content, paragraph('This is a later authored revision of my project.')] };
  assert.equal(saveWritingDraft({ playerId: 'amari', projectId: 'space-postcard', title: 'Postcard three', document: thirdDoc, planet: 'Earth' }, storage).ok, true);
  const lastGood = loadWritingDraft('amari', 'space-postcard', storage, { preferRecovery: true });
  assert.equal(lastGood.record.title, 'Postcard two', 'recovery keeps the previous authored revision, rather than an initial blank draft');
  assert.equal(lastGood.record.document.content.length, secondDoc.content.length);
  saveWritingDraft({ playerId: 'amari', projectId: 'space-postcard', title: 'Postcard three', document: thirdDoc, planet: 'Earth', milestones: { reopened: true, exported: true } }, storage);
  assert.equal(loadWritingDraft('amari', 'space-postcard', storage, { preferRecovery: true }).record.title, 'Postcard two', 'metadata-only save/open/export preserves the prior authored revision');
  const currentKey = `${WRITING_DRAFT_PREFIX}:amari:space-postcard`;
  storage.setItem(currentKey, '{ damaged current record');
  const recovered = loadWritingDraft('amari', 'space-postcard', storage);
  assert.equal(recovered.recovered, true);
  assert.equal(recovered.record.title, 'Postcard two');
  assert.equal(recovered.record.document.content.some((node) => node.type === 'image'), true);
  const largeDoc = { type: 'doc', content: Array.from({ length: 5 }, () => paragraph('w'.repeat(59_000))) };
  assert.equal(saveWritingDraft({ playerId: 'amari', projectId: 'space-postcard', title: 'Too large', document: largeDoc }, storage).reason, 'draft-too-large');
  assert.ok(MAX_WRITING_RECORD_CHARS < 400_000);
  storage.setItem(currentKey, '{ damaged current record');
  storage.removeItem(`${currentKey}:last-good`);
  assert.equal(loadWritingDraft('amari', 'space-postcard', storage).reason, 'draft-corrupt');
  assert.equal(saveWritingDraft({ playerId: 'amari', projectId: 'space-postcard', title: 'Replacement', document: postcard }, storage).reason, 'draft-corrupt');
  assert.equal(storage.getItem(currentKey), '{ damaged current record');
});

test('legacy draft remains byte-for-byte intact when copied and oversized legacy copy can be read for export recovery', () => {
  const storage = makeStorage();
  const key = LEGACY_WRITING_KEY('amari');
  const oldRaw = JSON.stringify({ version: 1, title: 'Old postcard', document: projectDocument('space-postcard') });
  storage.setItem(key, oldRaw);
  const legacy = readLegacyWritingDraft('amari', storage);
  assert.equal(legacy.title, 'Old postcard');
  assert.equal(legacy.planet, 'Earth');
  assert.equal(saveWritingDraft({ playerId: 'amari', projectId: 'space-postcard', ...legacy }, storage).ok, true);
  assert.equal(storage.getItem(key), oldRaw);
  const largeDocument = { type: 'doc', content: Array.from({ length: 5 }, () => paragraph('x'.repeat(59_000))) };
  const largeRaw = JSON.stringify({ version: 1, title: 'Large legacy', document: largeDocument });
  storage.setItem(key, largeRaw);
  const largeLegacy = readLegacyWritingDraft('amari', storage);
  assert.equal(largeLegacy.tooLargeToCopy, true);
  assert.equal(saveWritingDraft({ playerId: 'amari', projectId: 'space-postcard', ...largeLegacy }, storage).reason, 'draft-too-large');
  assert.equal(storage.getItem(key), largeRaw);
});

test('completion requires a saved complete project, is ordered, idempotent and failure aware', () => {
  const storage = makeStorage();
  assert.equal(readWritingProgress('amari', storage).unlockedProjectIndex, 0);
  assert.equal(completeWritingProject('amari', 'planet-field-notes', storage).persisted, false);
  const postcardDoc = projectDocument('space-postcard');
  saveWritingDraft({ playerId: 'amari', projectId: 'space-postcard', title: 'My card', document: postcardDoc, planet: 'Earth', milestones: { reopened: true, exported: true } }, storage);
  const completed = completeWritingProject('amari', 'space-postcard', storage);
  assert.equal(completed.persisted, true);
  assert.equal(completed.newlyCompleted, true);
  assert.equal(completeWritingProject('amari', 'space-postcard', storage).newlyCompleted, false);
  assert.equal(readWritingProgress('amari', storage).unlockedProjectIndex, 1);
  const fieldDoc = projectDocument('planet-field-notes');
  saveWritingDraft({ playerId: 'amari', projectId: 'planet-field-notes', title: 'Field notes', document: fieldDoc, planet: 'Mars', milestones: { reopened: true, exported: true } }, storage);
  const blockedStorage = { getItem: storage.getItem, setItem: (key, value) => { if (key.includes('progress')) throw new Error('quota'); storage.setItem(key, value); } };
  const failed = completeWritingProject('amari', 'planet-field-notes', blockedStorage);
  assert.equal(failed.persisted, false);
  assert.equal(failed.newlyCompleted, false);
  assert.equal(readWritingProgress('amari', storage).completedProjectIds.includes('planet-field-notes'), false);
});

test('editing after a saved reopen or export invalidates those current-revision milestones', () => {
  const storage = makeStorage();
  const doc = projectDocument('space-postcard');
  const completeSteps = { reopened: true, exported: true };
  saveWritingDraft({ playerId: 'amari', projectId: 'space-postcard', title: 'My postcard', document: doc, planet: 'Earth', milestones: completeSteps }, storage);
  assert.equal(checkWritingProject('space-postcard', loadWritingDraft('amari', 'space-postcard', storage).record, loadWritingDraft('amari', 'space-postcard', storage).record.milestones).complete, true);
  const edited = { ...doc, content: [...doc.content, paragraph('A new paragraph needs another review.')] };
  saveWritingDraft({ playerId: 'amari', projectId: 'space-postcard', title: 'My postcard', document: edited, planet: 'Earth', milestones: { reopened: false, exported: false } }, storage);
  const current = loadWritingDraft('amari', 'space-postcard', storage).record;
  assert.equal(current.milestones.saved, true);
  assert.equal(current.milestones.reopened, false);
  assert.equal(current.milestones.exported, false);
  assert.equal(checkWritingProject('space-postcard', current, current.milestones).complete, false);
});

test('unsupported document nodes and malformed images are not treated as valid saved content', () => {
  const storage = makeStorage();
  assert.equal(saveWritingDraft({ playerId: 'amari', projectId: 'space-postcard', title: 'Bad node', document: { type: 'doc', content: [{ type: 'table' }] } }, storage).ok, false);
  assert.equal(saveWritingDraft({ playerId: 'amari', projectId: 'space-postcard', title: 'Bad image', document: { type: 'doc', content: [{ type: 'image', attrs: { src: 'https://example.com/a.png', alt: 'Planet' } }] } }, storage).ok, false);
});

test('unreadable storage blocks replacement instead of assuming no prior draft exists', () => {
  const storage = { getItem: () => { throw new Error('blocked'); }, setItem: () => assert.fail('must not overwrite unreadable existing data') };
  assert.equal(loadWritingDraft('amari', 'space-postcard', storage).reason, 'storage-read-failed');
  assert.equal(saveWritingDraft({ playerId: 'amari', projectId: 'space-postcard', title: 'Postcard', document: projectDocument('space-postcard') }, storage).reason, 'storage-read-failed');
  assert.equal(readWritingProgress('amari', storage).persisted, false);
});

test('soft line breaks separate visible body words and heading text never counts', () => {
 const document = { type: 'doc', content: [{type:'heading',attrs:{level:1},content:[text('A long heading has many words')]}, {type:'paragraph', content:[{type:'text',text:'Blue'}, {type:'hardBreak'}, {type:'text',text:'oceans'}]}] };
 assert.equal(countWritingBodyWords(document), 2);
});

test('draft step metadata contains only boolean flags, never a second document or title', () => {
 const storage=makeStorage(),document=projectDocument('space-postcard');
 const saved=saveWritingDraft({playerId:'amari',projectId:'space-postcard',title:'Single copy',document,milestones:{saved:false,reopened:true,exported:false,document,title:'unintended duplicate'}},storage);
 assert.equal(saved.ok,true);
 const raw=JSON.parse(storage.getItem(`${WRITING_DRAFT_PREFIX}:amari:space-postcard`));
 assert.deepEqual(raw.milestones,{saved:true,reopened:true,exported:false});
 raw.milestones.document=document;raw.milestones.title='old candidate metadata';
 storage.setItem(`${WRITING_DRAFT_PREFIX}:amari:space-postcard`,JSON.stringify(raw));
 assert.deepEqual(loadWritingDraft('amari','space-postcard',storage).record.milestones,{saved:true,reopened:true,exported:false});
});
