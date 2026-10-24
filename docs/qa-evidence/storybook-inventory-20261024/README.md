# Storybook inventory and recovery investigation — 24 October 2026

## Released change

Runtime `aea35a36dd7e2abaeb80d6fdc64e45da8fc77911`, Vercel deployment `dpl_8mTLHU5kiZm32WSEFqepCGvPoq4S`, service-worker v30. Netlify's existing gateway follows this canonical release in place. Both HTML and worker hashes match; entry/preload stylesheets and JavaScript are available. See `production-identity.json`.

The library now displays its total, included books and books saved in this browser. An unreadable IndexedDB produces a warning, rather than falsely saying there are no saved books. When filters hide records, Show all stories resets them. Drafts and stories from other child readers remain counted and accessible.

## Confirmed inventory

Seven included books: Rex and the Missing Moon Map; Luna and the Whispering Forest; Nia’s Great River Journey; Bo and the Busy Bee Garden; Sami and the Night-Light Parade; Mina’s Mountain Seed; Kai and the Lost Library Book.

All 154 shipped story picture/audio paths returned HTTP200 on live Netlify (`shipped-netlify.json`). This is availability evidence, not a listening review of every recording.

The existing real desktop Vercel tab displays seven included and zero browser-saved books (`desktop-inventory.json`, `desktop-library-current.png`). The existing older Chrome localhost5173 tab was reopened on its original origin using a temporary dev server; its rendered inventory also confirmed seven included and zero saved. No real profile/story records were cleared or modified. This does not inspect the phone's separate browser storage.

## Rehearsals

- Local, immutable candidate and live Netlify: seven included → two specifically identified synthetic paused drafts → nine total; My Stories shows the two drafts, including a different child reader; Show all restores nine; reload preserves inventory; remove only the two task-owned fixtures → seven. `local-ui.json`, `candidate-ui.json`, `production-ui.json`. These nine books are QA fixtures, **not recovered family books**.
- Blocked database locally: seven included remain visible; explicit unreadable-storage warning; no false zero-saved claim (`blocked-ui.json`).
- Netlify390px: Rex first-page packaged audio actually advanced, Next changed page position, library return and reload succeeded; no horizontal overflow, page errors or provider requests (`production-reader.json`, `netlify-library-current.jpg`).
- Full suite: 360passed, one existing skip, zero failed; scoped ESLint and Vite build passed. Emitted PWA suite8passed, zero skipped. Logs retained under `tmp/storybook-inventory-*20261024.log` in the canonical checkout.

## Recovery remains open

The user expects about8–9 stories. Only the seven included books are confirmed. Custom stories are stored in IndexedDB `amari-storybooks`, separately for each device/browser/origin; there is no cloud story catalogue or cross-device synchronisation. Keeping Netlify on its original origin preserves access to any existing phone records, but does not recover deleted records or move Vercel/localhost records automatically.

Historical workspace backups contain synthetic QA books (two QA Garden Walk books and a separately approved provider QA story, Pip and the Sunflower). They are not evidence of the user's missing personal books and were not imported into the family library. No new paid voice/story calls were made.

Next required evidence is the inventory displayed in the original phone's Netlify browser after normal online refresh, and any remembered missing title or genuine exported backup. Keep its site data intact. Do not claim the extra1–2 stories were recovered, deleted, or never existed without that evidence. Existing backup/restore controls remain under Parent tools.

## Footprint and rollback

Reused the canonical checkout, dependencies and single existing contained Chromium tab. No new worktrees, installations, browser windows or sessions. Compact report plus two representative screenshots retained; the temporary localhost server is stopped after inspection. Existing unrelated files/backups retained.

Previous runtime `4a5313ceef1538e0df98df308b35d1931e1dbd75` / `dpl_CmasMHH5Q3PqUeEirVEG73HXCvyZ` is available for deployment rollback. Rollback is not a story-data restoration and must never clear localStorage/IndexedDB.
