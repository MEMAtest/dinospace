export const WRITING_PROJECTS = Object.freeze([
  {
    id: 'space-postcard', title: 'Space postcard', kind: 'Postcard', planet: 'Earth',
    description: 'Write a friendly note from a planet in your own words.',
    prompt: 'Tell someone what you notice from your chosen planet. Your ideas and wording are yours to choose.',
    minimumBodyWords: 4, minimumParagraphs: 1, requireBold: true, requireItalic: false, requireCentered: false,
  },
  {
    id: 'planet-field-notes', title: 'Planet field notes', kind: 'Field notes', planet: 'Mars',
    description: 'Record observations and a question in separate notes.',
    prompt: 'Look at your planet picture. Write one note about something you notice and a second note with a question you wonder about.',
    minimumBodyWords: 10, minimumParagraphs: 2, requireBold: true, requireItalic: true, requireCentered: false,
  },
  {
    id: 'planet-mini-report', title: 'Planet mini-report', kind: 'Mini-report', planet: 'Saturn',
    description: 'Organize a longer report with a beginning, details and a closing thought.',
    prompt: 'Write a short report in at least three paragraphs: introduce your planet, add details you choose, then finish with a closing thought.',
    minimumBodyWords: 18, minimumParagraphs: 3, requireBold: true, requireItalic: true, requireCentered: true,
  },
]);

const textIn = (node) => (node?.content || []).map((child) => child.type === 'hardBreak' ? ' ' : child.type === 'text' ? child.text || '' : textIn(child)).join('');
export const writingHeadingText = (document) => (document?.content || []).filter((node) => node.type === 'heading').map(textIn).join(' ').trim();
export const writingBodyText = (document) => (document?.content || []).filter((node) => node.type === 'paragraph').map(textIn).join(' ').trim();
export const countWritingBodyWords = (document) => writingBodyText(document).match(/\S+/gu)?.length || 0;
const bodyNodes = (document) => (document?.content || []).filter((node) => node.type === 'paragraph');
const bodyHasMark = (document, markType) => bodyNodes(document).some((node) => JSON.stringify(node).includes(`"type":"${markType}"`));

export function checkWritingProject(projectId, draft = {}, milestones = {}) {
  const project = WRITING_PROJECTS.find((item) => item.id === projectId);
  if (!project) return { validProject: false, complete: false, checks: [] };
  const document = draft.document || {};
  const paragraphs = bodyNodes(document).filter((node) => textIn(node).trim().length > 0);
  const image = (document.content || []).find((node) => node.type === 'image');
  const checks = [
    { id: 'documentName', label: 'Give your document a name', done: String(draft.title || '').trim().length >= 3 },
    { id: 'heading', label: 'Add a document heading', done: writingHeadingText(document).length >= 3 },
    { id: 'bodyWords', label: `Write at least ${project.minimumBodyWords} body words (heading is not counted)`, done: countWritingBodyWords(document) >= project.minimumBodyWords },
    { id: 'paragraphs', label: `Use ${project.minimumParagraphs === 1 ? 'at least 1 paragraph' : `at least ${project.minimumParagraphs} separate paragraphs`}`, done: paragraphs.length >= project.minimumParagraphs },
    { id: 'bold', label: 'Make an important body word bold', done: !project.requireBold || bodyHasMark(document, 'bold') },
    { id: 'italic', label: 'Use italics in the body', done: !project.requireItalic || bodyHasMark(document, 'italic') },
    { id: 'centered', label: 'Centre one body paragraph', done: !project.requireCentered || paragraphs.some((node) => node.attrs?.textAlign === 'center') },
    { id: 'picture', label: 'Add a planet picture', done: Boolean(image && /^data:image\/png;base64,/u.test(image.attrs?.src || '') && image.attrs?.alt?.trim()) },
    { id: 'saved', label: 'Save this project on this device', done: Boolean(milestones.saved) },
    { id: 'reopened', label: 'Open the saved project to check it', done: Boolean(milestones.reopened) },
    { id: 'exported', label: 'Start a Word export', done: Boolean(milestones.exported) },
  ];
  return { validProject: true, project, bodyWordCount: countWritingBodyWords(document), paragraphCount: paragraphs.length, complete: checks.every((check) => check.done), checks };
}
