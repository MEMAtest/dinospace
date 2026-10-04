# Runner-level narration supervisor fixture QA — 4 October 2026

## Reviewed inputs and boundary

- Implementation commit: `afbbf01deb48b70b25797ec8fdbd698ed59ffa0c` (shared B3 producer lock repair), based on supervisor `0d66b35ed8c80618fe05d1ac344372af81225750`.
- Pinned inventory: `aa07d93daba2b85aab5767f630391d2fb6862d4ad91ae43ed261e05ddac70227`.
- The fixture harness byte-copies the runner, helper, voice-key module, inventory and candidate manifest. It asserts the SHA-256 of every copied input before each scenario.
- No source branches, real manifests/assets/journals or worker state were changed. The B4 PID check is shimmed only inside each child test process against a temporary terminal-predecessor record.
- `globalThis.fetch` is replaced in each child with a URL/payload-checking fixture. Node `net.connect`, `net.createConnection` and `tls.connect` are blocked. No provider or other network call was made.

## Scenarios exercised through the actual CLI

`node --test scripts/runner-fixture.test.mjs` passed. One temporary fixture was created per scenario with isolated candidate, B3 journal and lock, B4 manifest, and reconciled predecessor status.

| Fixture response | CLI outcome | Audit and filesystem result |
|---|---|---|
| Wrong provider header | Exit 1; rejected | 1 attempted / 0 accepted, journal attempt retained, no audio or manifest change, lock released |
| Wrong MIME type | Exit 1; rejected | 1 attempted / 0 accepted, journal attempt retained, no audio or manifest change, lock released |
| Under-size body | Exit 1; rejected | 1 attempted / 0 accepted, journal attempt retained, no audio or manifest change, lock released |
| HTTP 500 | Exit 1; rejected without retry | Failure recorded; journal attempt retained, no audio or manifest change, lock released |
| HTTP 204 | Exit 1; cooldown recorded | `blockedUntil` set; journal attempt retained, no audio or manifest change, lock released |
| HTTP 429 | Exit 1; cooldown recorded | `blockedUntil` set; journal attempt retained, no audio or manifest change, lock released |
| Injected transport exception | Exit 1; rejected | Audit `failure.message` records the transport error; journal attempt retained, no audio or manifest change, lock released |
| Valid fixture response | Exit 2 because the one-call finite run leaves 126 keys pending | 1 attempted / 1 accepted; fixture artifact, manifest mapping and receipt agree on path, inventory, key, voice, text hash, byte count, MIME and audio hash; lock released |

The success body starts with an `ID3` marker followed by synthetic bytes. It verifies only manifest/receipt binding; it is not a genuine provider file and was not decoded or listened to.

## Tool checks and conclusion

- Runner fixture suite: **1 scenario suite passed**, covering the eight cases above.
- Scoped ESLint `no-unused-vars` and `no-undef` checks passed. Full project ESLint was not available from this isolated worktree because its `@eslint/js` dependency is not installed there; the reviewed implementation commit's own scoped lint result remains separate evidence.
- The earlier QA finding that provider/MIME failures and request-error auditing lacked runner-level exercise is closed for the reviewed implementation. The shared-lock finding is separately closed by `afbbf01` and its B3 lock-path collision test.
- No paid execution or final B4 terminal-record acceptance was attempted. Fixture tests do not establish provider availability, real audio validity/decode, playback, pronunciation, or human listening.

## Root integration verification

Root imported this fixture at 0beb7f6 and ran the actual CLI fixture suite against the unchanged afbbf01 runner/helper bytes. The suite passed all eight scenarios on 4 October 2026. This evidence remains bound to afbbf01; the separate bf3a76d supplemental selector extension requires its own runner fixture delta before claiming current-source coverage. No paid call was made.
