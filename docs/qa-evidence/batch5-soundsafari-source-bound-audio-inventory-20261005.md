# Sound Safari source-bound narration inventory

Date: 2026-10-05  
Source: `a652ad6cf33b72e3ef3ff523b70cc773bfcbbb18`  
Checkout: `work/dinospace-batch5-soundsafari-picture-art`  
Machine-readable source hash, exact phrase/key/path list, local file-presence results, and phoneme sequences: [inventory JSON](batch5-soundsafari-source-bound-audio-inventory-20261005.json).

## Scope and method

This is a read-only inventory of the exact current Batch 5 text and phoneme files. The collector now uses the same shared phrase builders as the Sound Safari component, and enumerates both the default taught-sound pools and the full Phase 3 Growing pool. It records manifest plus non-empty local-file presence only. It does not decode audio, confirm pronunciation, assess voice or rights, test native playback, or claim that a person listened. No generation/provider call or audio-manifest write was made.

The JSON binds 13 source files by SHA-256. It includes the source commit, full exact text strings and generated local keys/paths, the 37 required pure-phoneme paths, and all 26 full-Phase-3 Growing phoneme sequences.

## Current source requirements

| Area | Exact authored pool represented |
|---|---|
| Starter first-sound match | 26 default Phase 2 questions |
| Starter whole-word minimal pairs | Six contrasts, two directions each; 12 question directions and 10 distinct spoken word clips |
| Growing blending | 23 default Phase 2 questions; 26 questions with the full Phase 3 taught set, including the additional `plant`, `raft`, and `plank` feedback/phoneme sequences |
| Challenge sound positions | 81 questions: 29 first, 23 unambiguous odd-length middle, 29 last |
| Pure phoneme files | 37 unique required paths overall; the Sound Safari first-sound/blending subset uses 23 keys |

The six whole-word contrasts are **cat/bat**, **cat/rat**, **cat/cap**, **hen/pen**, **duck/dock**, and **sock/rock**. Each distinct word has one exact standalone recording entry. The runtime mapping remains empty for these ten recordings, so Starter remains gated. Two exact standalone text clips (`cat`, `rock`) have non-empty local files and manifest entries, but are not wired into the game and have not been auditioned.

After-answer speech now uses the same sound/position fact already shown after a correct answer. Pair explanations retain their authored phoneme-location comparison; full Phase 3 Growing explanations include the previously omitted `plant`, `raft`, and `plank` phrases. Challenge prompts and word replay hints are derived from the actual full-taught question pool. All text segments and joined utterances are in the JSON.

## Package snapshot

- The former Batch 5 inventory held 659 unique text entries and 332 sequences. The source-complete inventory has **862 unique text entries and 603 sequences** after adding Sound Safari's actual pair words, dynamic prompts, retries, feedback facts, joined segments, and full-taught Growing content.
- **11/862** text clips currently have both a matching local manifest entry and a non-empty file; **851 remain pending**. This is the entire Batch 5 literacy text corpus, not a claim that the 11 are decoded or suitable for the new Sound Safari use.
- **0/37** pure phoneme files are present in this checkout.
- The 25 Challenge word-art assets are still being integrated; this inventory does not make the chapter playable or audio-ready.

The source-integrity and dynamic-corpus checks pass in the targeted suite. ESLint and the production-config Vite build pass. The build reports the existing stale Browserslist database and large-chunk warnings. The B4 voice worker was reported live during this work; no parallel paid job was started.
