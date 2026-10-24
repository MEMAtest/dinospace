# Personal story recovery: user clarification and log investigation

## Correct recovery target

The user confirmed **8–9 stories they created**, in addition to the seven included titles. Expected combined library:15–16. **Personal stories recovered so far:0.** The earlier extra1–2 interpretation was incorrect and is superseded by this clarification.

## Actual log evidence

Read-only project-level log queries returned28 request records. The query requested the previous30days; that requested range is not proof of30days retained coverage. A first prefix-like query `requestPath:/api/story` returned nothing because this filter is exact; an unfiltered project query plus exact `/api/story/outline` search found the creation activity. Zero results from that initial query must not be cited as absence of creation.

On **23October2026,20:20:35–20:23:42 Europe/London (BST)**, the available records show:

| Story endpoint | POST responses200 |
| --- | ---: |
| Session |1|
| Outline |1|
| Image |7|
| Narration |7|

Adjacent preflight logs identify Origin `https://dinospace.netlify.app`. These identify a web origin, not a particular person/device. The response sequence is consistent with a six-page book plus its cover. It does not establish a title, page contents, final browser-save acknowledgement, or eight/nine distinct books.

One primary image request logged a provider400 moderation rejection, but its final endpoint response was200 after the configured fallback. There are no non200 story POST responses in this returned set. Success here proves API responses; it does not prove the browser stored all assets and the book record.

`log-investigation.json` retains timestamps, request IDs, deployment IDs, paths, methods, statuses and relevant log messages. No story title/text or saved book identifier is present in those returned creation logs. No extra provider requests were made to generate or reconstruct books.

## Older log access and storage

Historical window queries for25September–23October and16–23October were rejected with `Response Error400`. These are inaccessible queries, not successful empty inventories. The team plan is Pro. Vercel documents default Pro runtime retention of1day and extended retention with Observability Plus; this investigation did not confirm the add-on state, so it does not claim a verified account retention setting. Both legacy integration and current drain inventories were checked; see the JSON result for their counts. No archive destination was found.

Source history retains IndexedDB name `amari-storybooks` from the original custom-story implementation through the old September Netlify release and current source. Version1→2 adds profiles/series stores without deleting books/assets. No database rename or explicit migration deletion was identified. Generated story data is saved in the originating browser's IndexedDB; the API does not maintain a server-side personal-story catalogue.

Available backup files contain only three identified synthetic QA books: Pip and the Sunflower and the two QA Garden Walk books. Their canonical paths/hashes are retained in `backup-references.json`; no copies or imports made. A filename search for actual exported `amari-storybooks-*.json` and story backup files in Downloads/Desktop found no family backup. This is a bounded search, not proof that no backup exists elsewhere.

## Unresolved recovery

Logs confirm creation activity. They cannot reconstruct the8–9 personal books from titles/text/assets that were not retained in them. Recovering those books still requires their original browser/device storage or a genuine exported backup. No deleted-data conclusion is justified. No real browser records were altered or cleared, and no QA books are counted as recovery.

This investigation changes the evidence and expected count, not the production runtime or game scores. The Netlify-only public site remains unchanged.

## Resources

Reused the canonical checkout. No new worktrees, installations, browser windows/sessions or corpus downloads. Compact evidence under20KiB is retained here; task-owned raw query outputs remain in ignored tmp for traceability. The temporary team-settings response containing unrelated account metadata was removed after retaining only the relevant plan fact. Original backup files retained once at their existing paths.

## Primary documentation

[Runtime logs and retention limits](https://vercel.com/docs/logs/runtime), [runtime log CLI filters](https://vercel.com/docs/cli/logs), and [drains for persistent archival](https://vercel.com/docs/drains).
