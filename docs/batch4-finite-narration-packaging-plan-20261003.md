# Batch 4 finite narration packaging

## Frozen scope

The source phrase inventory contains **5,246 unique clips / 112,234 characters**, of which the read-only check currently finds65 mapped physical files and5,181 missing. Inventory SHA256 over the canonical sorted item records is `2cbebd10e2ee6999aa80c521f70b87fff647bf7d025474004b353a14cacb0bb4`. Every spoken phrase is at least two words; segments rejoin the authored prompt, clue or explanation exactly. Full inventory enumeration runs offline, never in the game bundle.

## Prepared execution

Root has prepared `--batch4-only` in the existing generator and a finite `run-batch4-voice-generation.mjs` supervisor. No Batch4 generation has started. The supervisor requires an explicitly shared request-state journal, refuses to start before Batch3 has completed and its process exited, passes the expected inventory fingerprint to every child run, and stops if the corpus changes. It reuses existing assets, checkpoints the manifest after each verified audio response, enforces30requests/10minutes through the shared journal, limits each child to20new clips, and caps the worker at520runs with3recorded cooldown retries. At a minimum of10calls per non-final run,520 covers the currently missing5,181 clips without relying on favourable window timing. This is a packaging run, not background provider use by game players.

After Batch3 completes and its PID has exited, the prepared command from this checkout is:

```sh
node scripts/run-batch4-voice-generation.mjs --max-runs=520 --request-state=../dinospace-batch3-quality/tmp/offline-voice-request-state.json
```

Do not run another provider packaging worker concurrently. Monitoring must only read the status/log and confirm the live process; it must never restart this worker or generate clips.

## Safety evidence

Two focused tests pass: offline dry-run selects only the5,246-clip corpus; conflicting selectors and changed corpus fingerprint are rejected; supervisor refuses absent shared-journal input. Focused ESLint passes. Dry runs made no provider calls. Existing provider/MIME/minimum-byte verification and atomic manifest/audio writes are retained.

## Acceptance after packaging

All5,246 corpus paths must be mapped and decoded with positive duration, with hashes recorded. Rebuild an immutable candidate containing the exact corpus. Independently exercise actual native playback and cancellation while playing for all four games at desktop/390px, plus offline/device and human listening gates required by the roadmap. The narrow5235 check found incomplete segment sequences and therefore could not prove active-playback cancellation. Full local mechanics reportaab31f0 does not replace these gates. Release and canonical production Playwright are still pending; no new4.5score is assigned here.
