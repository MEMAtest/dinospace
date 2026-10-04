# Isolated phoneme provider feasibility — 4 October 2026

This is read-only research, not a generated or accepted corpus. No provider call was made. The existing finite Batch4 narration worker remains the only generation process.

## Current implementation

Root `api/voice.js` and `scripts/generate-offline-voices.mjs` default to `eleven_multilingual_v2` unless configured otherwise. Neither source establishes that the configured model supports pronunciation phoneme tags. Do not change the production narration model or restart the worker to test isolated sounds.

## Primary-source findings

- [ElevenLabs TTS best practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices) documents SSML phoneme tags for Flash v2 and warns that pronunciation results vary by voice/phrase. It states that tags apply to individual words. This is not proof that a single consonant or vowel is emitted cleanly in isolation.
- [Pronunciation dictionary API guide](https://elevenlabs.io/docs/eleven-api/guides/how-to/text-to-speech/pronunciation-dictionaries) lists Flash v2 among phoneme-capable models and says other models skip phoneme tags. The current pages disagree about the wider supported model set, so only the shared Flash v2 support is treated as established here.
- [API phoneme help](https://elevenlabs.io/docs/help-center/technical/do-pauses-and-ssml-phoneme-tags-work-with-the-api) confirms phoneme tags can be used through the API for supported English models. It does not promise phonics-quality pure recordings.

## Bounded next action after the existing worker is terminal

A separate finite three-sound experiment could test a sustained consonant, a short vowel, and a stop consonant using a supported model and the existing authorized narrator. It must be isolated from the production model configuration and write only QA candidate files. Keep the model, IPA/CMU target, exact request, voice provenance, duration, decode and waveform evidence. Do not publish or populate the37 runtime paths until pronunciation review confirms that the outputs are the required pure sounds, without letter names, spoken markup, leading/trailing words, or an added vowel.

If that experiment is unsuitable, retain the missing-asset status and use rights-cleared qualified recordings. An ordinary letter-name or whole-word TTS clip is not a substitute. Existing offline narration readiness and human listening remain separate gates.
