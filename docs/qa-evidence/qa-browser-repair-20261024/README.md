# QA browser availability repair — 24 October 2026

## Cause and repair

The installed Playwright CLI documents a **one-hour idle shutdown for headless sessions**. The monitor runs roughly hourly, sometimes after more than one hour. It was repeatedly finding the expected session already closed. This was an availability/configuration problem, not evidence of broken production gameplay.

The user asked to resolve it. One named session, `amari-targeted-contained`, now runs **headlessly with `--idle-timeout=0`**, using the single persistent synthetic profile `tmp/amari-production-qa-profile`. No visible Chrome window was opened. Existing unrelated browsers were left alone.

`scripts/ensure-amari-qa-browser.py` reuses that session or restores that same session/profile only when absent. It refuses competing profile processes, a different profile, a headed session or extra tabs; it never kills an unrelated browser or deletes locks/data. It installs provider API403 guards and the `qa_rewards_20261024_` namespace. A recovery lock and expiring owner record prevent competing QA work. Use:

```sh
python3 scripts/ensure-amari-qa-browser.py --owner production-health-monitor
# Run the bounded production sample only if status is ready.
python3 scripts/ensure-amari-qa-browser.py --owner production-health-monitor --release
```

Release ownership in a finally step, leaving the one headless browser running. An active other owner produces busy/browserTouched=false. A blocked result requires inspecting the concrete error, not launching another profile or clearing data. `scripts/amari-qa-browser.json` caps browser disk/media cache sizes at32MiB each. Once daily inspect profile size; above256MiB flag maintenance without deleting saved QA data automatically.

The existing hourly heartbeat was updated to use this procedure. No production code, deployment or editorial score changed; the public site remains Netlify runtime8efdde9d.

## Actual checks

- CLI inventory confirms Chromium, headed=false, the exact persistent profile and one tab. Actual daemon command contains `--idle-timeout=0` (`session.json`). The flag and documented default establish the repair; this handoff does not pretend to have waited a further hour.
- Count the Stars,390px: six actual rounds, countable models, wrong-answer retry and packaged explanation playback. Two stars, completed Star Garden and its constellation page were saved before final Next; reload retained them and parent navigation worked (`counting.json`). The first fresh-profile assertion incorrectly expected a sticker after2points. Inspection confirmed no sticker is due before10points; this assertion was corrected rather than changing the app. Initial script/failure retained in the ignored output folder. CLI console inspection reported zero errors/warnings.
- Controlled close/reopen of **only this named QA browser** restored the same profile and exactly retained those actually earned records. This is synthetic QA persistence, not recovery of any real child's missing progress or personal books (`restart-desktop.json`). The previous nonpersistent QA session was already gone; no historical QA-state restoration is claimed.
- Addition Adventure,1440px:2+6 model kept eight objects before/after joining; wrong retry, correct answer, packaged narration advancement, held Next, next question0+9 and parent navigation passed. No observed console/page errors, required asset failures, overflow, broken images or provider requests.
- Repeated helper call returns restored=false and keeps one tab (`helper-reused.json`). A synthetic other-owner lease returns busy without touching the browser (`busy-owner.json`).

This repairs monitoring capability. It does not certify all26games or recover the8–9 personal storybooks; that recovery remains unresolved in its separate report.

## Retained resources

Reused the canonical checkout and dependencies; no worktrees, downloads or installations. One persistent synthetic profile is retained for monitoring, approximately60MiB at handoff. Compact accepted JSON and one representative screenshot are retained here; raw script/log evidence remains once in `output/playwright/qa-browser-repair-20261024`. No whole-project or media-corpus copies. The initial browser was closed once for the controlled persistence check and restored immediately; the final one remains running for the monitor. No real child data, original backups or unrelated browser resources were removed.
