# Independent static review: first Spelling Studio art batch

Date: 2026-10-05  
Word source: `src/data/batch5Literacy.js`, SHA-256 `8440dd01d079549d4f03152f1f6ba7231562811979959c9d3731811e9310e057`  
Asset capture checkout: `e84b5780fd33aeccf2fd9c7d30a006f72d71b649` (the existing Spelling review branch was at `9090124bdd4a8ccec2af098ad0960ba6c14fcc41` before this asset-capture work). The reviewed word-data file hash below is unchanged at both commits.  
Immutable asset provenance: [`provenance-as-reviewed-89b.json`](provenance-as-reviewed-89b.json), SHA-256 `0215cbdd704463f82768d543a4bf0f0e22eee05e87620bd78571db8cb301b66b`. The later mutable builder provenance has SHA-256 `2fa58004ce74d65fda35c0b782df73b9f22ad5083dd2832e881785c2604397c6`; its only normalized changes are status and the `sat-v2` review disposition. [`provenance-followup-comparison.json`](provenance-followup-comparison.json) records this comparison and confirms prompts and declared asset hashes are unchanged; asset bytes still match those hashes.

## Result

At the actual 96px image size, `map`, `tin`, `kid`, `red`, `tan`, `nap`, `dip`, `pat`, `sat-v2`, and `sit-v1` all pass against their unchanged Spelling clues. All are clear at the card size and follow a consistent, friendly 3D picture-card style. The exact original PNG and runtime WebP hashes are in [`final-independent-review.json`](final-independent-review.json); the image-generation prompt and provenance for each candidate are retained in the linked provenance file.

The first `sat-v1` was rejected and retained. It showed a child already settled on a chair and was visually indistinguishable in meaning from `sit-v1`. The replacement `sat-v2` shows the child leaning/lowering toward the chair, with bent knees and hands near the seat. At 96px, that forward action reads differently from the upright resting pose in `sit-v1`, so the pair now has a useful visual distinction without changing either word, clue, or phonics entry.

`tin-v1` is a patterned, lidded tea/biscuit tin, visually distinct from the existing cylindrical food-can candidate. It is a suitable image for this clue, while the close lexical relationship between the authored `tin` and `can` definitions remains a copy/editorial issue outside this art review. `map-v1` shows a folded map with a visible route and destination markers, correcting the former flat world-map styling issue. `dip-v1` shows a carrot entering a bowl of sauce; `pat-v1` visibly shows hand-to-dog contact; `nap-v1` shows a peacefully sleeping child; the remaining child/color illustrations are likewise direct and uncluttered.

## Evidence

- [Final 10-card 96px contact sheet](final-contact-sheet-10-96px.png), SHA-256 `84e68906bd196715727952e33a8456f755202b03b256953f830957250af2a1f9`. It uses the runtime WebPs, scaled with contain to 96×96; labels are reviewer-only.
- [Per-word review JSON](final-independent-review.json), bound to the immutable archived provenance and per-file original/WebP hashes. It binds decisions to the exact original and WebP bytes and prompt provenance.
- The earlier `contact-sheet-10-96px.png` is retained as the pre-revision record showing why `sat-v1` was rejected.

## Commit scope note

The review evidence was committed in `89b755e1db5e3a6cc7181bc9627d959fd80d60cc`. That combined commit also contains the first-batch generated PNG originals, their WebP derivatives, the builder's provenance JSON, and the builder contact sheet; those paths were already staged in the shared checkout when the review commit was created. It contains no Spelling component, data, or asset-registry integration change. Treat the commit as an asset/provenance plus independent-review freeze, not as runtime integration or gameplay acceptance.

No browser or provider was used. The review does not claim that the art was integrated into runtime. Original PNGs, prompts, and existing runtime data remain unchanged by this review. This is an asset-only verdict: it does not verify runtime wiring, in-game crop/contrast, the other 91 word assets, phoneme playback, or overall product acceptance.
