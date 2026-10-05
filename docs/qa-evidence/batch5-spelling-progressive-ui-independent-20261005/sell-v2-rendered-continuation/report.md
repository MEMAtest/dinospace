# Sell v2 rendered card continuation

Date: 2026-10-05. This is a narrow continuation of the earlier progressive Spelling UI report. It tests the versioned `sell-v2` mapping in the configured local candidate only.

## Candidate and boundaries

- Source: `d06ccdb5af09ca2c63ea99f6759f851bcb682235` (`sell-v2` mapping).
- Preview: `http://127.0.0.1:5399/`, build `/tmp/batch5-spelling-illustrations-100-20261005`, 6,027 files, tree SHA-256 `268fad1f1c4547faa428e1cfeb32138c082919f2896c734667101446c6aa62bf`.
- Exact served identity is recorded in [`batch5-spelling-illustrations-100-identity-20261005.json`](../../batch5-spelling-illustrations-100-identity-20261005.json). It binds `sell-v2-DGD9rwc5.webp` (SHA-256 `4e4d16eba894b64048bf67ec64760e6249ba02a4e0644b108ed9a783e939064b`) and served index/JS/CSS bytes to this build.
- Reused the sole existing Chrome tab/session. The preinstalled `/api/voice` and `/api/story` routes were confirmed as 403 after loading this candidate. The visible sound control remained muted; no API/provider calls or storage/state injection occurred.
- The Amari QA profile already had ordinary Chapter 1/2 badges and Phase 3 sound selections from earlier visible UI work. I selected Chapter 2 from the visible Spelling Studio screen and completed one ordinary six-word run. No further run was needed after `sell` appeared on word 1.

## Sell round at both sizes

The rendered prompt was “Give something for money” with `s • ll`; choosing the visible `e` tile held “SELL has 3 sounds” until Next. The image box fit at the actual 96px card size on both 390×844 and 1280×800 screenshots. It did not clip or force horizontal page overflow (`scrollWidth` equalled the viewport width at both sizes). The 390px page is vertically scrollable; that is expected for the content height, and the target picture and clue were visible together.

The v2 picture shows a counter exchange: a red item is handed over and a small gold coin/token is visible below it. At 96px the coin is a modest detail, but the exchange scene and authored clue together distinguish selling from simply giving. This corrects the prior v1 concern that its picture could read as sharing. **For this bounded normal-size card-fit check, sell-v2 passes with a small-detail caveat.** These screenshots do not establish unaided child comprehension or listening quality.

The captured screenshots show the held correct state on the same target round: [390×844](sell-v2-held-390.png), [1280×800](sell-v2-held-1280.png). SHA-256: `5a459703d550e66a3263bb3bcd1f90fd12004c120952fd81b42cd69efd7fcaad` and `8ff9e40d443553a1f42c015d6b37ee1ca9309ffb3eb8d740128a04f130860fd4`, respectively.

## Run progression and limits

The other visible words in this six-word run were `less`, `bell`, `puff`, `sick`, and `fed`; each completed from its displayed clue and tile choices, and the visible “Finish chapter” control returned to the chapter screen. Chapter 2 then reported 31 words available from the selected sounds. This verifies one normal replay only; it does not replace the retained gameplay baseline or approve all 100 mapped images. `fuss` remains unmapped in this frozen candidate, and human listening remains pending.
