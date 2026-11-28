# Storybook narration and illustrations · 28 November 2026

Story Detective now has a visible control that reads the question and answer choices in their displayed order, plus replay for the explanation. The reader can move past the cover even if its audio fails. Muting stops narration and prevents silent automatic page turns.

On the public site, Chromium touch emulation at 390 × 740 exercised all seven included books, 70 story pages and 21 questions. The 1440 × 900 desktop run exercised two complete books, 20 pages and six questions. All displayed covers and pages decoded and the matching narration started. The quiz checks played the exact packaged question, options and correct explanation clips, and the incorrect clue in one retry per book. Both sizes recovered from a deliberately rejected cover recording and retained sound-off behaviour. No horizontal overflow or page errors were observed.

All 301 live Storybook illustration, narration and learning-voice URLs returned their expected media type. All 77 included narration files decoded with a non-silent peak. The 77 cover and page illustrations had distinct hashes and a shortest edge of at least 1200 pixels. The covers and selected scenes from every book were visually reviewed.

A six-page synthetic creation followed the normal form, saved seven illustration and seven narration responses, and reopened at its saved page with decoded art and local narration after reload. It used mocked responses and exercised the app's assembly and storage flow. Live generation quality and human listening were outside this test.

Sound Safari, Letter Launch, German Garage, Spelling Studio and Fact Finder received live voice and picture samples at both sizes. Sound Safari's 18-cell illustration sheet was visually reviewed against its word mapping. The sampled Letter Launch and Spelling Studio clues included matching emoji fallbacks as well as custom illustrations. These were media samples.

All 771 repository tests passed. Eight application assets matched the build on the immutable backend, Netlify draft and live site. Public runtime `32bfeb29dc3a9965320348724a851e72b5d84322`, worker `amari-discovery-v112`, Netlify gateway `6b0ad12eb18522b939ed7944`.

[Structured results](production-summary.json)
