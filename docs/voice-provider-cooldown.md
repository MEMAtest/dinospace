# Dynamic narration provider cooldown

## Behavior

`useVoice` keeps an in-memory cooldown shared by hook instances in the loaded app session. After a 429 it waits 300 seconds by default, matching the voice route's 45-request/300-second rate window; after a network failure, 204, 408, 425, or 5xx it waits 15 seconds. A valid `Retry-After` seconds value or HTTP date overrides those defaults, with a one-second floor and five-minute cap. A longer existing cooldown is never shortened. Other HTTP client errors do not start a cooldown.

The source selection order is packaged clip, dynamic voice availability, in-memory audio cache, session cooldown, then provider request. This keeps packaged and cached narration usable during cooldown. Requests still abort when superseded or when voice is disabled; aborts do not count as provider failures. Voice mode, packaged audio, and browser speech behavior are unchanged.

## Verification

`test/voiceProviderCooldown.test.mjs` covers Retry-After seconds and date parsing, duration cap, temporary and permanent statuses, injected-clock expiry, cooldown monotonicity, source precedence, and an SSR-loaded `useVoice` integration where a mocked 429 blocks the next missing-clip request while a packaged welcome clip still plays. The test uses no real provider request.

Integrator browser verification used frozen commit `bd84564` on `http://127.0.0.1:5286`, built with dynamic voice enabled (JS `index-WkU-ccJi.js`). In a fresh 390×844 Playwright browser, a locally intercepted voice endpoint returned a deliberate 429 with Retry-After 300. Actual Puzzle Pop Start produced exactly one intercepted request; subsequent Hear again and Hint produced none. Returning to the player picker and clicking Who is playing today loaded bundled clip `/audio/en/7d2b81c5-matilda.mp3` successfully during that cooldown. Only the deliberate mock 429 appeared in the console. No provider call occurred. Screenshot: `output/playwright/batch2-cooldown-5286.png`. This proves throttling and packaged-clip availability locally; it does not prove that missing Batch 2 narration has been packaged or repaired in production.
