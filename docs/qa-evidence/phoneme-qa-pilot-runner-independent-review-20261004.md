# Independent review: bounded phoneme pilot runner

Date: 4 October 2026  
Reviewed source: `db9566f1285d62275be605862fe50f3475d33a5f`  
Prior frozen source: `6b052cc65f1eee05eea6a825d32b9949d9d1bb39`

## Findings

The original runner had a material repeat-run gap: it called the provider before `writeFile(..., {flag: 'wx'})` rejected an already-existing candidate clip. Its `finally` path could also replace an earlier `audit.json` after a failed run. The reviewed follow-up closes that path with `assertUnusedCandidateRoot()` before shared journal/lock access and again after lock acquisition. Any existing hash-bound candidate directory blocks the run, including an existing candidate output or prior audit. The CLI still has no output-directory override.

The follow-up's adversarial test uses an injected **temporary** candidate directory. It pre-creates both an audit and one pinned output, invokes the paid-run function with a fake-only key and fake fetch, and confirms: refusal at the existing-directory gate; zero fetch calls; byte-identical prior output and audit hashes; and an unchanged shared B3 journal hash. Its bogus predecessor path also demonstrates the collision check happens before reading predecessor status. The fixture cleans up only its own temporary directory. No fixture writes under the shared candidate or journal roots.

I ran the exact-candidate test suite and dry-run without any provider call:

- `node --test scripts/phoneme-qa-pilot.test.mjs`: 11/11 passed.
- `npx eslint scripts/run-phoneme-qa-pilot.mjs scripts/phoneme-qa-pilot.test.mjs`: passed.
- Pinned dry-run: `readOnly: true`, exactly `/s/`, `/æ/`, `/t/`, maximum three requests, zero retries.
- The actual shared B3 journal SHA-256 remained `1ff67082542aadbb8510e20d743618a912f324343054230ffa908527abeec7d9` before and after the suite; the shared producer lock remained absent and the real pilot candidate directory remained absent.

The suite's other fixtures cover the exact inventory hash and Matilda/model provenance; fixed SSML payload; unsupported argument and budget rejection; shared B3 lock/journal path; a simulated live B4 PID stopping before manifest access/request; non-success status, wrong MIME, undersized/oversized response, stalled headers and stalled body; and no-retry behavior. The live-PID test uses a mock PID probe. I did not call a provider, alter a worker, write a real candidate, or make an auditory-quality claim.

## Limits and remaining gates

This is a runner safety review only. No `/s/`, `/æ/` or `/t/` audio was generated, decoded, played or heard. The three target requests, Matilda voice, Flash v2 model, fixed payload, size bound and candidate-only destination remain pinned. Human listening is still required to decide whether isolated outputs are pure phoneme sounds suitable for teaching. No runtime asset or manifest is updated by this code path.

The tests exercise mocked provider responses and a mocked PID state, not the actual B4 worker process or a paid request. They establish the pre-existing-output no-request guarantee for the tested collision fixture and the intended lock/budget gates in code/tests; they do not authorize or certify a future execution.
