# Code Cadets and simpler navigation · 21 November 2026

Amari’s home and world menus use a short list of actions and labelled pickers. The primary button names the world or game it opens. Code Cadets presents one main action at a time. Add the next command, run Pip, then open the named next mission. The rover map and command sequence share the play screen. Editing, mission selection, clues, sound and original saves are available through **Options**.

| Screen | Visible buttons |
| --- | ---: |
| Amari home | 3 |
| World picker | 2 |
| World game picker | 3 |
| Code Cadets intro | 3 |
| Guided command | 2 |
| Run ready | 3 |
| Running or retrying a failed save | 1 |
| Mission saved | 2 |
| Editing and original saves | 2–3 |

On live 390×740 Chromium touch and 1440×900 desktop, the first mission accepted three Forward commands, stopped, reran, handled a forced rejected save, and unlocked the named next mission only after saving. The walkthrough reloaded a partial draft, checked the next locked mission, added and reordered a command, reopened an original saved program, and preserved a favourite when returning to the world. Desktop also used keyboard to start coding. All five world menus were checked live. The core walkthrough passed at 320×740 on the candidate. Each sampled screen had at most three visible buttons, 44 px or taller touch targets, and no horizontal overflow.

All 770 repository tests passed. The immutable backend, Netlify draft and published site matched 8 built resource hashes. The actual **Refresh games** control preserved 118 synthetic storage records and the IndexedDB Storybook fixture. No unexpected browser, HTTP or provider errors were observed.

Source `1936164bdac10444d644b56bee9a24391cd182ef`, entry `/assets/arcade-BbCKYil9.js`, worker `amari-discovery-v91`, backend deployment `dpl_DCKSWC65aaqkpSyQtAD5bSL3z6kf` and published Netlify gateway `6b01f4c1730941a04b566eb7`.

[Code Cadets](https://dinospace.netlify.app/#/play/codecadets) · [Live phone screenshot](code-cadets-phone.jpg) · [Structured results](production-summary.json)
