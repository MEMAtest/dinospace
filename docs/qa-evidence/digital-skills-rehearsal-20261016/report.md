# Digital skills hands-on rehearsal — 16 October 2026

## Scope and result

A working rehearsal slice, outside the 26-game catalog: Blender/NASA planet exploration → three Code Cadets missions → a real editable Writing Desk postcard. Production was not promoted. All actions used the same existing contained Chromium session/tab, synthetic QA data and provider voice/story guards. No paid generation or real child records were used.

## Actual browser rehearsal

- Solar preview runtime 8ebe5f113bd86e561ee90f30875a7a5dcf168701: clicked all 54 discoveries across nine worlds and completed all nine Starter challenges. Wrong answers, retry feedback and correct answers exercised; repeat fact clicks did not increase totals; reload preserved 54 discoveries and nine challenges. Parent Back reached Explore and Languages. This does not test every higher difficulty band or physical device. Raw script/screenshots remain in output/playwright/amari-rehearsal/solar-*; earlier visual/model evidence is in ../solar-blender-20261016.
- Code Cadets: built the three-forward route, ran and saved it, left/reopened; ran the supplied incorrect turn sequence, inserted/reordered the missing move and succeeded; used Repeat/turn/Repeat/Collect to recover the sample. Stop, Step, save/open, reload and Guest/Amari storage separation exercised. Desktop 1440px and mobile 390px; visible targets measured at least 48px in the final mobile check. code-walkthrough.cjs and amari-code-final-matrix.log are the completed final run.
- Writing Desk: typed a heading and two paragraphs, selected a word and applied Bold, Undo/Redo, centred the heading, added a planet image, named/saved, left and reopened the document. Guest cannot open Amari's synthetic draft. Actual UI downloaded a DOCX. Final export replaced Earth with Mars through the picture picker. LibreOffice opened and rendered that DOCX with editable paragraphs, heading, bold word and embedded Mars PNG. The resulting DOCX, PDF and rendered PNG are attached. Browser printing also produced a PDF in output/playwright/amari-rehearsal/browser-writing-print.pdf.
- Unsaved navigation guard: typed an additional change, attempted Code Cadets, received confirmation, dismissed it and verified Writing Desk remained open; then saved. The confirmation was handled as separate CLI actions.
- Journey: Studio planet link → choose Amari → Solar → Next: Code Cadets → Writing Desk. Verified at 1440px and 390px with no horizontal document overflow. Desktop solar panel scroll remains available.

## Issues caught and fixed

1. Save button hover had insufficient contrast; now white text on dark teal.
2. Mobile program editing placed Run too far from the blocks; added Run program next to the sequence, scrolling the stage into view.
3. DOCX inherited mismatched default type; explicit Arial/navy heading and body styles now verified in LibreOffice.
4. Planet postcard initially offered only Earth; now all nine curated local planet pictures are selectable.
5. Choosing Amari discarded the rehearsal's Solar entry; the explicit discovery journey now resumes Solar after choosing Amari. Added onward links and adjusted its desktop layout.

## Technical checks

Eight bounded interpreter/storage/DOCX/solar model/passport tests passed; scoped ESLint passed; production build passed (existing large-chunk warning remains). No runtime page errors observed in the completed local walkthrough. Earlier interrupted scripts are not counted as passes; final-clean.cjs replaced the failed final-controls attempt.

## Remaining acceptance

This is three coding missions and one writing task, not the proposed full coding/writing courses or a new 4.5/5 editorial sign-off. Saves are manual, device-local, one program and one document per explorer. No cloud backup, project library, imported documents, new narration or public sharing. Browser/LibreOffice checks are not a child usability trial, physical keyboard/device test or Microsoft Word GUI test. Production remains unchanged. Preview identity and hosted smoke evidence will be recorded separately after deployment.
