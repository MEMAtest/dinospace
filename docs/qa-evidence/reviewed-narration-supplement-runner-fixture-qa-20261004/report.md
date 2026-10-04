# B2/B3 supplemental runner fixture QA

**Reviewed candidate:** `bf3a76dabd2d95e17d37723215ac6a3ae1bf7c30`
**QA branch:** `codex/narration-packager-b2b3-fixture-qa-20261004`
**Scope:** isolated end-to-end execution of the actual reviewed CLI and helper with byte-pinned candidate sources, temporary copied ledgers, a fake B3 manifest/journal, and an injected transport. This is runner behavior evidence only; synthetic bytes are not decoded audio and establish no provider, playback, pronunciation, or listening quality.

## Source binding and isolation

The test pins SHA-256 for both runner files, `voiceKey.js`, the B5–B7 inventory, the supplemental B2/B3 ledger, and the candidate manifest source. Each scenario verifies these source hashes before copying the executable files into a fresh temporary fixture. The supplemental inventory hash is `0b3e4fb645aec52d445ed04246b8c49958fdef60d92f9644b43e86060af6a2dd`; the B5–B7 inventory hash remains `aa07d93daba2b85aab5767f630391d2fb6862d4ad91ae43ed261e05ddac70227`.

The fixture writes only beneath a fresh OS temporary directory. It supplies separate mock B3 journal and B4 manifest paths and a synthetic reconciled terminal record. `process.kill` is intercepted only in the spawned fixture child to report PID 18781 as stopped; it never signals or inspects the real worker. `globalThis.fetch` is replaced in that child and accepts only the expected voice endpoint, POST method, and English text payload. Direct `node:net` and `node:tls` connections throw. No real API/provider request is possible through the tested child, and no actual worker, shared journal, source manifest, or audio directory is modified.

## Results

`node --test scripts/runner-supplement-fixture.test.mjs` passed all nine scenarios:

| Selector | Injected response | Result |
|---|---|---|
| `b3-dino-facts` | Wrong provider header | Rejected; 1 attempted, 0 accepted/generated; audit/journal retained; lock released |
| `b3-dino-facts` | Wrong MIME | Rejected; 1 attempted, 0 accepted/generated; audit/journal retained; lock released |
| `b3-dino-facts` | Body below size floor | Rejected; 1 attempted, 0 accepted/generated; audit/journal retained; lock released |
| `b3-dino-facts` | HTTP 500 | Rejected without retry; journal retained; lock released |
| `b3-dino-facts` | HTTP 204 | Rejected without retry; cooldown recorded; lock released |
| `b3-dino-facts` | HTTP 429 | Rejected without retry; cooldown recorded; lock released |
| `b3-dino-facts` | Thrown transport error | Rejected; error audited, attempt retained; lock released |
| `b2-supplement` | Synthetic accepted response | One item generated, remaining items keep run pending (exit 2); receipt binds B2 source commit and supplemental inventory digest |
| `b3-dino-facts` | Synthetic accepted response | One item generated, remaining items keep run pending (exit 2); receipt binds B3 source commit and supplemental inventory digest |

For rejected responses, the test verifies no generated audio, no manifest change, no changed keys/files, one retained journal attempt, and released producer lock. The two success cases additionally verify the new digest-scoped receipt path, receipt `sourceCommit` (`94d44d031d5835d0d9fa2128064ff83ba5880a62` for B2 and `e2aee30169f6ade67f7948b0088a895a9cb119c3` for B3), exact key/path/text hash, MIME, byte count, audio hash, and manifest mapping. The injected body is merely `ID3` plus padding; acceptance here tests metadata/size handling, not MP3 decoding.

The previous `afbbf01` fixture evidence remains separate and unchanged. This supplement specifically covers selector execution and inventory-specific receipts introduced at `bf3a76d`.

## Verification

- Fixture suite: 1 test passed; all 9 scenarios passed.
- Scoped ESLint (`no-unused-vars`, `no-undef` on the fixture test): passed.
- No paid calls, provider calls, live worker interaction, audio decoding, or playback/listening were performed.
