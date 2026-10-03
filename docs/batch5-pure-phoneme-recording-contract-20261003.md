# Batch 5 speech-sound recording acceptance

Sound Safari and Spelling Studio require 37 named files in `public/audio/phonemes/en/`. None are packaged in the current candidate. The existing readiness script reports this honestly; a narration MP3 or a spoken letter name cannot satisfy this gate.

## Deliverable and ownership

Supply clean, isolated speech sounds recorded by a fluent phonics reader, with permission to package, distribute and play them in this app. Retain the rights statement and attribution alongside the files. A free download alone does not establish redistribution permission. Do not contact suppliers or submit email forms without the user's authorization.

Use a consistent pronunciation system. The reference below uses standard British school phonics; the reviewer must explicitly confirm the selected accent before acceptance. Clip filenames are the existing runtime keys, not IPA characters. These references guide recording and listening; they do not claim that recordings have been created.

| File key | Sound reference | Example word |
|---|---|---|
| s, ss | /s/ | sat, hiss |
| a | /æ/ | cat |
| t | /t/ | tin |
| p | /p/ | pin |
| i | /ɪ/ | sit |
| n | /n/ | nap |
| m | /m/ | map |
| d | /d/ | dog |
| o | /ɒ/ | pot |
| g | /ɡ/ | gap |
| l, ll | /l/ | log, bell |
| c, k, ck | /k/ | cat, kid, duck |
| h | /h/ | hen |
| e | /ɛ/ | hen |
| r | /ɹ/ | red |
| u | /ʌ/ | duck |
| b | /b/ | back |
| f, ff | /f/ | fish, puff |
| sh | /ʃ/ | ship |
| th-unvoiced | /θ/ | thin |
| th-voiced | /ð/ | this |
| ch | /tʃ/ | chin |
| ng | /ŋ/ | sing |
| ai | /eɪ/ | rain |
| w | /w/ | wait |
| ee | /iː/ | seed |
| oa | /əʊ/ | boat |
| oo-long | /uː/ | moon |
| oo-short | /ʊ/ | book |
| ar | /ɑː/ | farm |
| or | /ɔː/ | fork |
| ur | /ɜː/ | turn |

Equivalent graphemes may use byte-identical copies of one accepted recording (s/ss, l/ll, c/k/ck, f/ff), while retaining every runtime path. Distinct th and oo sounds must remain distinct. The inventory has 37 file keys and 32 distinct sounds.

## Audio and browser checks

1. Listen to every distinct sound. Reject letter names, example words, appended schwa, vowel padding around consonants, clipping, music or background noise. Stops are short releases; continuants can be sustained naturally. Keep natural minimal articulation rather than forcing long stop sounds.
2. Decode every MP3 fully and inspect duration, silence and peak levels. Presence and successful decoding do not establish correct pronunciation.
3. Play all 37 runtime paths from actual child-facing controls. Test ordered blends such as s-a-t, d-u-ck, th-unvoiced-i-n, th-voiced-i-s, m-oo-long-n and b-oo-short-k. Verify order, no overlap, natural separation, correct word/picture agreement and no answer announcement before selection.
4. At desktop and 390px, test replay, rapid repeated Hear, mute, Next, Keep playing and confirmed Back. Old playback must stop on replacement or route exit; no stale audio error may attach to a new question.
5. Complete all Sound Safari chapters using heard sounds, not hidden answers or guessed missing audio. Preserve exact build identity and production controls evidence before acceptance.

## Supplier research boundary

- [Phonicademy's phonics audio pack](https://phonicademy.com/printables/phonics-audio-pack) advertises phonics recordings. Its [general terms](https://phonicademy.com/term) did not establish permission to redistribute the pack in this app. It has not been downloaded or included.
- [Wikimedia's voiced alveolar plosive sample](https://commons.wikimedia.org/wiki/File:Voiced_alveolar_plosive.ogg) has an explicit CC BY-SA license but demonstrates a consonant between vowels. It is not an accepted isolated /d/ phonics clip.
- The [RP phonetics guide repository](https://github.com/thavasix-gr8/rp-phonetics-guide) describes phoneme teaching but uses word audio. It does not supply an accepted pure-sound corpus for this release.

The user's owned or appropriately licensed recordings are requested. Other batch implementation and QA continue while this deliverable is missing. No provider calls or new voice worker were launched for this research.

## Possible authored synthetic pilot

[ElevenLabs' pronunciation guidance](https://elevenlabs.io/docs/help-center/technical/do-pauses-and-ssml-phoneme-tags-work-with-the-api) documents model-specific IPA/phoneme support. This provides a possible authored alternative to a third-party pack; it does not prove isolated phonics sounds will be correct. The current multilingual narration model must not be assumed to honor phoneme markup.

After the existing finite Batch4 worker terminates, root may prepare one finite pronunciation pilot using a documented compatible model, the same request journal and 32 distinct sound targets. Keep pilot outputs outside accepted runtime paths until their isolated-sound pronunciation is listened to and accepted. Reuse equivalent accepted sounds for the five alias paths. Do not run a second paid job while Batch4 is active, conceal retries or equate SSML support with pure-sound correctness. A user-owned pack may resolve this requirement sooner.
