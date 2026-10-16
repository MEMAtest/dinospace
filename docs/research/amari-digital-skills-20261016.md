# Amari: coding and digital writing — research and proposed integration

16 October 2026. Design proposal, not released features. Target: Amari's existing age-6+ experience. The current catalog has sequencing/pattern and literacy activities, but no programming workspace or child-operated word processor. Storybook Studio generates/reads stories; that does not teach editing a document.

## Evidence and design decision

- England's [KS1 computing programme](https://www.gov.uk/government/publications/national-curriculum-in-england-computing-programmes-of-study/national-curriculum-in-england-computing-programmes-of-study) calls for precise instructions, creating/debugging simple programs, predicting behaviour, and creating/storing/retrieving digital content. Treat this as the minimum learning outcome, not a claim that an app alone covers the curriculum.
- [Scratch Foundation tools](https://www.scratchfoundation.org/tools) places ScratchJr at ages 5–7. Its visual approach supports an early-reader interface. [NCCE Programming animations](https://teachcomputing.org/curriculum/key-stage-1/programming-b-introduction-to-animation) introduces on-screen programming through ScratchJr. [Code.org Course A](https://studio.code.org/courses/coursea-2025/units/1?viewAs=Instructor) progresses from sequencing into loops. Use original Discovery HQ activities, not copied third-party lessons or branding.
- [NCCE Year 1 Digital writing](https://teachcomputing.org/curriculum/key-stage-1/creating-media-digital-writing) covers keyboard exploration, adding/removing text, the toolbar, editing and explaining formatting choices. A real text-editing workspace is therefore the appropriate companion activity.

## 1. Code Cadets — proposed dedicated game

Location: Thinking & Play, with a cross-link from Solar System. A friendly rover carries out the program Amari builds. Use a fictional training grid so the navigation activity is not presented as a geographically accurate Mars surface.

| Chapter | Four guided missions | Skill that changes |
|---|---|---|
| Give instructions | Reach a flag using 2–4 commands; predict before Run | Order, forward, left/right turns |
| Plan a route | Reach supplies, collect a sample, return to base | Longer sequences and orientation |
| Bug detectives | Find the first wrong block; repair and rerun | Trace, diagnose, edit, test |
| Repeat it | Draw a square; traverse repeated paths | Repeat 2–4; compare with expanded steps |
| Make it respond | Start on tap; send a signal; trigger a celebration | Events and simple message sequencing |
| Invent a mission | Choose a scene and character; program a short story | Transfer into an original project |

24 initial authored missions, plus saved free-build projects. New missions change the concept/mechanic; they do not simply add more squares. Conditionals are a later extension, not mixed into the first instructions.

Interaction: labelled picture blocks; tap-to-add as well as optional drag; move earlier/later/remove/undo controls; Run/Stop/Step/Reset; the active block highlights in sync with the rover; slow/normal playback; spoken instructions with replay. State says exactly what happened: "At block 3 the rover turned left. Try changing that turn." A failed run retains the program for editing. Avoid speed scores and repeated guessing.

Acceptance: every authored puzzle is solvable, execution has a bounded step limit, Stop cancels animation, reset retains the child's editable program unless explicitly cleared, and repeat executes the same semantics as its expanded sequence. Save projects and mission completion separately per child. Verify keyboard and touch editing, wrong routes, undo, saved/reopened projects and parent navigation at desktop/390px. Rewards reflect demonstrated skills rather than just pressing Run.

Implementation: native React block editor plus a small deterministic interpreter and SVG/Canvas stage. This avoids account/login dependence. Evaluate Blockly only if later nested blocks and complex editing justify its added interface weight. Do not embed an unrelated full coding website inside the child's game. Save JSON projects with a schema version and local backup/export. No executable JavaScript from children; only the defined block vocabulary runs.

## 2. My Writing Desk — proposed dedicated workspace

Location: Read & Write. A quiet page with a clearly labelled toolbar, paired guided challenges and an open writing mode. Keep the child's actual writing; automated help gives prompts rather than replacing it.

| Lesson | Real artifact | Transferable skill |
|---|---|---|
| My first message | A greeting to family | Letters, Space, Shift, Backspace, Enter |
| Space postcard | A postcard about a planet | Cursor placement, insert/delete, sentence punctuation |
| Fix the message | Edit a supplied short paragraph | Selection, replace, undo/redo |
| Make a planet poster | Heading plus two sentences | Bold, font size, alignment, explain choices |
| My discovery report | A title, paragraph, picture and caption | Structure, insert a curated image, text around it |
| Save and share | Name, close and reopen a document | Filenames, save/retrieve, print/PDF and Word export |

Start with a small stable tool set. Introduce selection before formatting. Teach Ctrl/Cmd shortcuts when a hardware keyboard is present; keep equivalent touch buttons. Do not require perfect spelling for success or use typing speed as the main achievement. Provide age-appropriate starter prompts and optional word support, while still requiring the child to type and edit.

Implementation: use a maintained structured rich-text editor (evaluate Tiptap/ProseMirror or Lexical during implementation), with a constrained document model. Autosave to child-scoped IndexedDB, retain previous versions, show saved/failed state, and support local backup. Export .docx containing actual paragraphs and styles, plus print/PDF; do not rename HTML as .docx. Imported images should initially come from a small curated local library. No public publishing or new third-party account is required.

Acceptance: selection formatting acts on the selection, undo restores both text and formatting, save/reload preserves the document, closing a failed save warns, different children cannot see each other's drafts, DOCX opens in Word/LibreOffice with editable text and formatting, and printable output matches the document. Mobile is supported, but a physical keyboard is preferable for keyboard lessons. Ordinary browser/mobile QA does not prove physical keyboard or external Word import acceptance.

## Connecting the experiences

Example: explore Mars → program the training rover → write a two-sentence mission report with one selected planet picture → save it in My Creations. Use explicit "Send to Writing Desk" with a draft preview. Do not overwrite an existing document or a generated Storybook record. A future Storybook integration can turn the child's own writing into a book only after a separate deliberate action.

## Delivery sequence

1. Finish and review the planet visual upgrade separately.
2. Build Code Cadets chapters 1–2 and free program editing; test real sequence building and debugging, then add the remaining chapters.
3. Build Writing Desk typing/editing/save/reopen and a postcard; then formatting, images, real DOCX and print output.
4. Add the rover-to-report link after both standalone experiences pass QA.

This proposal adds two new activities; they are outside the existing 26-game acceptance count until explicitly added to the catalog and assessed. There are no claims that these new activities are implemented or live.

## Technical references for the implementation decision

- [Blockly overview](https://docs.blockly.com/guides/get-started/what-is-blockly/): a customisable block editor that can be embedded into an app; a learning game still needs its own content and execution model.
- [Tiptap editor overview](https://tiptap.dev/docs/editor/getting-started/overview): a modular editor built on ProseMirror, suitable for exposing a constrained tool set.
- [Lexical introduction](https://lexical.dev/docs/intro): another editor framework to evaluate against selection, undo, document persistence and export requirements.

These are framework candidates, not a claim that the app currently includes them or that Word export is supplied without further implementation.
