# Sound Safari three-sound provider pilot preparation

Prepared 2026-10-04 as a source-only experiment plan. No provider call was made and no sound file was generated.

## Why this exact model

ElevenLabs' current official [TTS best-practices page](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices) says SSML phoneme tags are compatible only with `eleven_flash_v2`, supports IPA and CMU, and notes that pronunciations vary by voice and phrase. Its [phoneme API help page](https://elevenlabs.io/docs/help-center/technical/do-pauses-and-ssml-phoneme-tags-work-with-the-api) says Flash v2 and Turbo v2 accept phoneme tags, and limits them to English. The [model ID page](https://elevenlabs.io/docs/help-center/technical/how-do-i-find-the-model-id) identifies `eleven_flash_v2` as the English-only Flash v2 model. Because the official pages differ on the broader set of compatible models, this pilot uses only the model in their overlap: `eleven_flash_v2`.

The docs establish that the markup can be sent to this model. They do **not** establish that a one-grapheme request produces a clean, pure teaching sound. This pilot tests that narrow question; it does not certify phonics suitability.

## Fixed requests

The pinned ledger SHA-256 is `921d4adc622bbdbe4eecf458126089ba8ea49c6b421c68f26c96875c02559b71`. It contains only these requests, in order:

| Teaching target | Grapheme under IPA tag | Exact request text |
|---|---|---|
| Sustained consonant /s/ | `s` | `<phoneme alphabet="ipa" ph="s">s</phoneme>` |
| Short vowel /æ/ | `a` | `<phoneme alphabet="ipa" ph="æ">a</phoneme>` |
| Stop consonant /t/ | `t` | `<phoneme alphabet="ipa" ph="t">t</phoneme>` |

The voice is pinned to Matilda (`XrExE9yKIg1WjnnlVkGX`) using the existing English default documented at `api/voice.js:6`, source commit `85eee97bbc2910e83b38ec5deea2f45cdb773e83`, SHA-256 `92a1c5d0b565e1b8842bcefa41e5b5b31b6f83b4a374b821e7d904533e8740e9`. The API route and offline narration model configuration are unchanged.

## Safety controls in the runner

- Default mode only prints the fixed plan. It makes no network request, reads no API key, writes no file, and does not inspect or edit the runtime phoneme paths or manifest.
- Paid mode accepts no model, voice, endpoint, output directory, text, retry, or unbounded run overrides. It requires the exact ledger hash, `--max-calls=3`, and `--max-runs=1`.
- Before any paid request, it requires the shared B3 request journal, checks the terminal and reconciled B4 worker record, verifies that PID 18781 is no longer live, validates Matilda's source hash, and acquires the same exclusive `tmp/offline-voice-generator.lock` used by the B3 writer. It rechecks the worker and shared journal before each request.
- The B3 journal must have room for all three requests and no active cooldown; otherwise it stops without making a partial run. Calls are sequential, one per fixed item, with one 90-second timeout and no retries. A failure stops the experiment.
- The only provider destination is `api.elevenlabs.io/v1/text-to-speech/XrExE9yKIg1WjnnlVkGX?output_format=mp3_44100_128`, with redirects rejected.
- MP3 candidates and their audit are written only under `tmp/phoneme-qa-pilot/<ledger-sha>/`. The response must be `audio/mpeg`, between 1,001 bytes and 2 MiB; the audit records the exact request, voice/model/source, HTTP/MIME, byte count, SHA-256, and fixed decode/duration/waveform/listening fields. A candidate is never marked accepted for runtime.
- There is no path from this tool to `public/audio/phonemes/en/`, `offlineVoiceManifest.js`, the production voice API, or story/image generation.

## Current state and future use

The existing B4 worker PID 18781 is live. Paid mode therefore fails closed now. The later three-request invocation must only be considered after the worker has a terminal, reconciled status and the shared journal/lock are available. No one should execute that command from this preparation task.

Read-only dry-run:

```sh
node scripts/run-phoneme-qa-pilot.mjs --inventory-sha256=921d4adc622bbdbe4eecf458126089ba8ea49c6b421c68f26c96875c02559b71
```

After a separately authorized run, inspect all three exact MP3 candidates. Decode them fully, record durations and waveform/peak evidence, and have a qualified reviewer listen for the intended phoneme only: no letter name, extra vowel, word, markup reading, clipping, noise, or music. Human listening is a mandatory feasibility decision before any runtime use. Keep an unsuccessful pilot isolated and the existing 37 runtime phoneme paths missing.
