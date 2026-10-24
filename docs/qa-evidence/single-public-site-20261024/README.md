# Single public Amari site — 24 October 2026

## Public address

**https://dinospace.netlify.app is the only public app address.** The old Vercel root and index entry URLs return307 to Netlify. Games use hash routes beneath the root. Existing legacy API and static-file endpoints remain available for installed clients; this does not present a second playable entry site.

Runtime source `8efdde9d7b1f130f2c720e64584127303b04032e`, backend deployment `dpl_GCHUV1udjSrKdViZzY1nQjYgL9CQ`, worker v31. Netlify production gateway deployment `6adc58c0e6b2d6bc9c733299`; site `c9dcd11b-4029-44c0-910d-d40a13339eb8`.

Netlify now proxies the verified **immutable** runtime `https://dinospace-nnujrb2r7-memas-projects-23a0001d.vercel.app`. It must not proxy the old public alias, which redirects back to Netlify. This avoids a redirect loop and keeps the child's Netlify browser origin unchanged. The runtime continues to use existing Vercel functions internally; no backend credentials, cloud story database or provider billing setup were migrated.

Storybook's default hosted endpoint and future Android API build configuration use Netlify. Android APKs already installed were not rebuilt or updated. Legacy API routes stay operational for those clients.

## Checks

- Candidate: current runtime HTML, JS/preload/stylesheets and worker served on the Netlify preview, origin retained, compiled Storybook default points to Netlify. Voice204/Storybook200 successful CORS preflights retain Netlify allow-origin. An initial assertion incorrectly required200 for both; corrected to accept the existing valid voice204. No provider generation performed.
- Production: root, index and query-string old links return307; following terminates at Netlify, without looping. Netlify remains its own origin and serves byte-identical candidate HTML/worker v31. All entry modules/stylesheets return200. Voice and Storybook preflights pass (`production-http.json`).
- Existing real in-app tab: reload of the old Vercel Storybook URL lands on Netlify welcome with Amari/Askia choices (`browser-check.json`, `netlify-landing.png`). No new browser session/window/context/tab and no gameplay in real child data.
- Storybook API tests2passed; emitted-worker tests8passed/0skipped; local Vite build and diff checks passed. No broad game quality score or full-catalogue acceptance assigned.

## Data boundary

No site data was cleared. Keeping Netlify's origin preserves access to its existing localStorage/IndexedDB. Vercel-only browser progress is not automatically merged across origins: the observed prior desktop tab had3stars and7included/0saved books. Original Vercel storage was not deleted. The phone's separate Netlify records were not inspected from this Mac. The expected extra personal storybooks remain unlocated; see the separate storybook-inventory-20261024 report. No QA backup books imported and no claim of historical recovery.

## Required release procedure

1. Build and verify a new immutable backend candidate with `vercel deploy --prod --skip-domain`, recording its source SHA. Do not promote it as a second public app.
2. Update `netlify-gateway/_redirects` to that verified immutable URL. Never use `dinospace-eight.vercel.app` there.
3. Draft-deploy the tiny gateway to the existing Netlify site; verify origin retention, HTML/worker identity, stylesheet availability, API preflights and bounded synthetic gameplay when the existing QA tab is available.
4. Publish that gateway to Netlify production and verify the actual public site. Then promote the backend deployment so the old entry redirect and legacy backend routes stay current.
5. Update `docs/game-quality-status.json` with public URL, source/runtime identity, pinned backend URL, Netlify deploy and evidence. Update the existing heartbeat baseline. Monitor Netlify as the playable site, checking the old entry only as a redirect.

Legacy Netlify Git builds remain stopped to prevent old main-branch source from overwriting this release. Do not re-enable them without reconciling the release branch/configuration. Source branch pushes alone do not publish Netlify.

Rollback requires a coordinated gateway/runtime choice: restore the prior gateway only with a compatible nonredirecting upstream, or pin its previous immutable runtime. **Do not restore a gateway targeting the redirecting public Vercel alias.** No data clearing is part of rollback.

## Footprint

Reused the canonical checkout and dependencies. No worktrees, installs, new browser resources, corpus copies or local servers. Two tiny gateway files uploaded; compact JSON evidence and one representative screenshot retained here, under0.25MiB. Existing local build reused/rebuilt in place; unrelated evidence retained. No user originals or unrelated temporary data removed.

## Platform references

[Vercel host-conditioned redirects](https://vercel.com/docs/project-configuration/vercel-json) and [Netlify server rewrites preserving the visitor URL](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/).
