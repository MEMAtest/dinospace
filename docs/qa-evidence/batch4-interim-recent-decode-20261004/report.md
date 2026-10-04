# Batch 4 interim recent-clip decode check

Checked: 2026-10-04T16:41:21.400Z

Source: `ac3b3ccaf03107749d865f8d79557e872a06c881`. The finite worker was still live; this is a changing corpus, not a frozen release.

Root selected the64 most recently modified mapped files belonging to the exact reviewed B4 corpus. All64 fully decoded with ffmpeg, had finite positive ffprobe duration, exceeded1000 bytes, and retained identical bytes before/after the check. No invalid clip was found in this bounded subset. Durations range from 0.975 to 3.437 seconds.

[Exact results and hashes](report.json) preserve every selected voice key, phrase, path, byte count, mtime, duration and process exit. The worker snapshot and manifest hash are timestamped interim observations; no full corpus readiness or production identity is inferred.

No provider request, manifest write, worker restart or audio generation occurred. This does not verify pronunciation, pacing, native playback/cancellation, human listening or overall4.5 acceptance. After the worker terminates, reconcile these exact byte hashes against its final corpus and decode remaining changed clips; do not treat this64-clip sample as the full corpus.
