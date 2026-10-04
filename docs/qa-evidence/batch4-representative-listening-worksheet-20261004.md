# Batch 4 representative listening and native-playback worksheet

Date: 4 October 2026  
Scope: Addition Adventure, Subtraction Station, Time Teller, Number Line Jump.

## Candidate and evidence boundary

This worksheet is bound to frozen source `ac3b3ccaf03107749d865f8d79557e872a06c881` in the Batch 4 quality worktree. The sample text and segment order below are derived from [arithmetic question data](../../src/data/arithmeticAdventure.js), [Time Teller/Number Line question data](../../src/data/timeLineAdventure.js), [the runtime segment helper](../../src/data/batch4Narration.js), and [the English clip-key function](../../src/data/voiceKey.js) at that exact commit. The exact SHA-256 digests are: arithmetic `8af2a63db93503b50453e9b4c0598c5c861de2bbb3d3c9cb3e8d2719bcd38840`, time/numberline `8462b67afdacac54f1a68404b636d8120fd9833daf53e355e0f01104c15b0ee0`, segment helper `9b12d51368d7abc8c31e0e1eddabfc6dda20eb434939828203c7ad8193010f04`, key helper `d013e09382520cc4a97e8134171631ade5eb31d39a54d92cc089159dcd95628f`, and [offline manifest](../../src/data/offlineVoiceManifest.js) `d07d41b7fab4705ac11ef985f0bb953ba039604f9f066f31c800a7f7f437e317`. The [exhaustive inventory generator](../../scripts/batch4NarrationInventory.mjs) describes the source traversal, not asset readiness. For each entry, the listed ID is the canonical arithmetic/time question ID or the deterministic Number Line question ID; Number Line sample fixture seeds are identified only to reproduce those pure source examples and are not UI seed injection.

The retained [full local mechanics report](batch4-final-repair-local-20261003/report.md) records the ordinary three-chapter/two-viewport gameplay baseline and notes narration unavailable. The earlier [narration/cancellation delta](batch4-narration-delta-local-20261003/report.md) pressed actual Hear controls while segments were unavailable; it did not establish native Batch 4 mission playback or active-audio cancellation. The [source gate](../batch4-packaged-narration-source-gate-20261003.md) documents phrase assembly and cancellation wiring. The shared [speak hook](../../src/hooks.js) prefers a mapped full-line clip; otherwise it requires every exact segment clip and constructs one browser `Audio` element per segment, advancing on `ended`. Mute, Next and unmount cancellation must be demonstrated in the actual app despite those source guards.

Every path below is the expected deterministic Matilda asset path generated from exact text and the English key convention. The shared hook first checks for an exact whole-utterance clip; if one is mapped it prefers that single clip. Otherwise it plays the listed segments in order only if every segment is mapped. The sample lists therefore give the whole-line preferred lookup and every possible segment lookup. A key/path in source is not an availability, decode, playback, or listening result. This worksheet marks **no clip ready or heard**. No provider call or browser run was made for this worksheet.

## Finite representative utterance set

Listen to the ordered segments as a complete spoken line, then compare the heard words with the exact concatenated runtime utterance. A segment boundary is shown by `→`.


### L01 — Addition Adventure / `groups:apple:0:1`

**Coverage:** Addition: zero plus a singular noun. **Field:** `prompt`. **Full utterance:** “Put 0 apples and 1 apple together. How many altogether?”



**Whole-line lookup (runtime uses it if mapped):** key `83b6acb1`; expected path `/audio/en/83b6acb1-matilda.mp3`.

**Segments in playback order:**

  1. “Put 0 apples” — key `8b8c964e`; expected path `/audio/en/8b8c964e-matilda.mp3`
  2. “and 1 apple together.” — key `6579382a`; expected path `/audio/en/6579382a-matilda.mp3`
  3. “How many altogether?” — key `158f1ea5`; expected path `/audio/en/158f1ea5-matilda.mp3`

### L02 — Addition Adventure / `groups:shell:2:3`

**Coverage:** Addition: plural nouns. **Field:** `prompt`. **Full utterance:** “Put 2 shells and 3 shells together. How many altogether?”



**Whole-line lookup (runtime uses it if mapped):** key `5880ce7e`; expected path `/audio/en/5880ce7e-matilda.mp3`.

**Segments in playback order:**

  1. “Put 2 shells” — key `74505452`; expected path `/audio/en/74505452-matilda.mp3`
  2. “and 3 shells together.” — key `c21e07df`; expected path `/audio/en/c21e07df-matilda.mp3`
  3. “How many altogether?” — key `158f1ea5`; expected path `/audio/en/158f1ea5-matilda.mp3`

### L03 — Addition Adventure / `bond:5:2`

**Coverage:** Addition: missing part / number bond. **Field:** `explanation`. **Full utterance:** “2 and 3 are the two parts. Together they make 5.”



**Whole-line lookup (runtime uses it if mapped):** key `bfda6bb6`; expected path `/audio/en/bfda6bb6-matilda.mp3`.

**Segments in playback order:**

  1. “2 and 3 are the two parts.” — key `78a3c90b`; expected path `/audio/en/78a3c90b-matilda.mp3`
  2. “Together they make 5.” — key `341f8f19`; expected path `/audio/en/341f8f19-matilda.mp3`

### L04 — Addition Adventure / `story:0:0:1:2`

**Coverage:** Addition: story, singular then plural. **Field:** `prompt`. **Full utterance:** “Mia has 1 apple and gets 2 more. How many now?”



**Whole-line lookup (runtime uses it if mapped):** key `cdc7c11d`; expected path `/audio/en/cdc7c11d-matilda.mp3`.

**Segments in playback order:**

  1. “Mia has 1 apple” — key `7a03d3ce`; expected path `/audio/en/7a03d3ce-matilda.mp3`
  2. “and gets 2 more.” — key `613dd669`; expected path `/audio/en/613dd669-matilda.mp3`
  3. “How many now?” — key `d0ffd812`; expected path `/audio/en/d0ffd812-matilda.mp3`

### L05 — Subtraction Station / `take:apple:1:0`

**Coverage:** Subtraction: zero removed; singular starting noun. **Field:** `prompt`. **Full utterance:** “There are 1 apple. Take away 0. How many are left?”



**Whole-line lookup (runtime uses it if mapped):** key `711df42b`; expected path `/audio/en/711df42b-matilda.mp3`.

**Segments in playback order:**

  1. “There are 1 apple.” — key `a381b377`; expected path `/audio/en/a381b377-matilda.mp3`
  2. “Take away 0.” — key `64837c93`; expected path `/audio/en/64837c93-matilda.mp3`
  3. “How many are left?” — key `04f5694d`; expected path `/audio/en/04f5694d-matilda.mp3`

### L06 — Subtraction Station / `take:shell:2:1`

**Coverage:** Subtraction: plural start, singular remainder. **Field:** `explanation`. **Full utterance:** “Start with 2. Take 1 away. 1 remain.”



**Whole-line lookup (runtime uses it if mapped):** key `1a9d4e35`; expected path `/audio/en/1a9d4e35-matilda.mp3`.

**Segments in playback order:**

  1. “Start with 2.” — key `1a7f3b94`; expected path `/audio/en/1a7f3b94-matilda.mp3`
  2. “Take 1 away.” — key `5625aee4`; expected path `/audio/en/5625aee4-matilda.mp3`
  3. “1 remain.” — key `26cdd055`; expected path `/audio/en/26cdd055-matilda.mp3`

### L07 — Subtraction Station / `compare:2:1`

**Coverage:** Subtraction: comparison prompt. **Field:** `prompt`. **Full utterance:** “Group A has 2; Group B has 1. How many more are in the larger group?”



**Whole-line lookup (runtime uses it if mapped):** key `d8fdc63e`; expected path `/audio/en/d8fdc63e-matilda.mp3`.

**Segments in playback order:**

  1. “Group A has 2;” — key `5cefefd7`; expected path `/audio/en/5cefefd7-matilda.mp3`
  2. “Group B has 1.” — key `0d0a9ef0`; expected path `/audio/en/0d0a9ef0-matilda.mp3`
  3. “How many more are in the larger group?” — key `f491e34d`; expected path `/audio/en/f491e34d-matilda.mp3`

### L08 — Subtraction Station / `compare:2:1`

**Coverage:** Subtraction: singular unpaired counter. **Field:** `explanation`. **Full utterance:** “Pair 1 from each group. 1 counter is left unpaired.”



**Whole-line lookup (runtime uses it if mapped):** key `6617413b`; expected path `/audio/en/6617413b-matilda.mp3`.

**Segments in playback order:**

  1. “Pair 1 from each group.” — key `33316f41`; expected path `/audio/en/33316f41-matilda.mp3`
  2. “1 counter is left unpaired.” — key `440945ae`; expected path `/audio/en/440945ae-matilda.mp3`

### L09 — Subtraction Station / `compare:5:2`

**Coverage:** Subtraction: plural unpaired counters. **Field:** `explanation`. **Full utterance:** “Pair 2 from each group. 3 counters are left unpaired.”



**Whole-line lookup (runtime uses it if mapped):** key `800160f3`; expected path `/audio/en/800160f3-matilda.mp3`.

**Segments in playback order:**

  1. “Pair 2 from each group.” — key `bcda506a`; expected path `/audio/en/bcda506a-matilda.mp3`
  2. “3 counters are left unpaired.” — key `33afec7d`; expected path `/audio/en/33afec7d-matilda.mp3`

### L10 — Subtraction Station / `story:1:0:2:1`

**Coverage:** Subtraction: story, plural then singular. **Field:** `prompt`. **Full utterance:** “Mia has 2 shells and gives 1 shell away. How many are left?”



**Whole-line lookup (runtime uses it if mapped):** key `497476f9`; expected path `/audio/en/497476f9-matilda.mp3`.

**Segments in playback order:**

  1. “Mia has 2 shells” — key `9157982a`; expected path `/audio/en/9157982a-matilda.mp3`
  2. “and gives 1 shell away.” — key `a8b74d16`; expected path `/audio/en/a8b74d16-matilda.mp3`
  3. “How many are left?” — key `04f5694d`; expected path `/audio/en/04f5694d-matilda.mp3`

### L11 — Time Teller / `0:3:0:read`

**Coverage:** o’clock. **Field:** `explanation`. **Full utterance:** “3 o’clock means the minute hand points to 12, and the hour hand is on the hour number.”



**Whole-line lookup (runtime uses it if mapped):** key `f10c0a70`; expected path `/audio/en/f10c0a70-matilda.mp3`.

**Segments in playback order:**

  1. “3 o’clock means the minute hand points to 12,” — key `3260e7d2`; expected path `/audio/en/3260e7d2-matilda.mp3`
  2. “and the hour hand is on the hour number.” — key `dbf6625e`; expected path `/audio/en/dbf6625e-matilda.mp3`

### L12 — Time Teller / `0:4:30:read`

**Coverage:** half past. **Field:** `explanation`. **Full utterance:** “half past 4 means the minute hand points to 6, and the hour hand is moving between numbers.”



**Whole-line lookup (runtime uses it if mapped):** key `1451d778`; expected path `/audio/en/1451d778-matilda.mp3`.

**Segments in playback order:**

  1. “half past 4 means the minute hand points to 6,” — key `d5728057`; expected path `/audio/en/d5728057-matilda.mp3`
  2. “and the hour hand is moving between numbers.” — key `42fd9945`; expected path `/audio/en/42fd9945-matilda.mp3`

### L13 — Time Teller / `1:2:15:read`

**Coverage:** quarter past. **Field:** `explanation`. **Full utterance:** “quarter past 2 means the minute hand points to 3, and the hour hand is moving between numbers.”



**Whole-line lookup (runtime uses it if mapped):** key `78228f7e`; expected path `/audio/en/78228f7e-matilda.mp3`.

**Segments in playback order:**

  1. “quarter past 2 means the minute hand points to 3,” — key `a0ca2bbd`; expected path `/audio/en/a0ca2bbd-matilda.mp3`
  2. “and the hour hand is moving between numbers.” — key `42fd9945`; expected path `/audio/en/42fd9945-matilda.mp3`

### L14 — Time Teller / `2:12:45:set`

**Coverage:** quarter to 1 at 12:45. **Field:** `prompt`. **Full utterance:** “Set the clock to quarter to 1, lunch time in the middle of the day.”



**Whole-line lookup (runtime uses it if mapped):** key `7d8b897e`; expected path `/audio/en/7d8b897e-matilda.mp3`.

**Segments in playback order:**

  1. “Set the clock to quarter to 1,” — key `2c9de36c`; expected path `/audio/en/2c9de36c-matilda.mp3`
  2. “lunch time in the middle of the day.” — key `6315924a`; expected path `/audio/en/6315924a-matilda.mp3`

### L15 — Time Teller / `2:12:45:set`

**Coverage:** 12:45 hand-position explanation. **Field:** `explanation`. **Full utterance:** “quarter to 1 means the minute hand points to 9, and the hour hand is moving between numbers. This routine is in the middle of the day.”



**Whole-line lookup (runtime uses it if mapped):** key `5cacf883`; expected path `/audio/en/5cacf883-matilda.mp3`.

**Segments in playback order:**

  1. “quarter to 1 means the minute hand points to 9,” — key `74c166b3`; expected path `/audio/en/74c166b3-matilda.mp3`
  2. “and the hour hand is moving between numbers. This routine is in the middle of the day.” — key `e3eabb26`; expected path `/audio/en/e3eabb26-matilda.mp3`

### L16 — Time Teller / `2:1:0:read`

**Coverage:** 1:00 boundary-side hand explanation. **Field:** `explanation`. **Full utterance:** “1 o’clock means the minute hand points to 12, and the hour hand is on the hour number. This routine is in the afternoon.”



**Whole-line lookup (runtime uses it if mapped):** key `5657189c`; expected path `/audio/en/5657189c-matilda.mp3`.

**Segments in playback order:**

  1. “1 o’clock means the minute hand points to 12,” — key `7bb6ee8c`; expected path `/audio/en/7bb6ee8c-matilda.mp3`
  2. “and the hour hand is on the hour number. This routine is in the afternoon.” — key `db0d5d28`; expected path `/audio/en/db0d5d28-matilda.mp3`

### L17 — Number Line Jump / `hop:4:1:5` (fixture seed 190)

**Coverage:** forward hops. **Field:** `prompt`. **Full utterance:** “Start at 4. Hop 5 forward. Where do you land?”



**Whole-line lookup (runtime uses it if mapped):** key `1eb2bb17`; expected path `/audio/en/1eb2bb17-matilda.mp3`.

**Segments in playback order:**

  1. “Start at 4.” — key `0f795721`; expected path `/audio/en/0f795721-matilda.mp3`
  2. “Hop 5 forward.” — key `7fff2701`; expected path `/audio/en/7fff2701-matilda.mp3`
  3. “Where do you land?” — key `ec1ceb3d`; expected path `/audio/en/ec1ceb3d-matilda.mp3`

### L18 — Number Line Jump / `hop:4:1:5` (fixture seed 190)

**Coverage:** forward landing explanation. **Field:** `explanation`. **Full utterance:** “4 + 5 = 9. The frog moved 5 hops and landed on 9.”



**Whole-line lookup (runtime uses it if mapped):** key `ae4d4050`; expected path `/audio/en/ae4d4050-matilda.mp3`.

**Segments in playback order:**

  1. “4 + 5 = 9.” — key `c0a050cc`; expected path `/audio/en/c0a050cc-matilda.mp3`
  2. “The frog moved 5 hops and landed on 9.” — key `b4286e9c`; expected path `/audio/en/b4286e9c-matilda.mp3`

### L19 — Number Line Jump / `hop:4:-1:4` (fixture seed 190)

**Coverage:** backward hops. **Field:** `prompt`. **Full utterance:** “Start at 4. Hop 4 back. Where do you land?”



**Whole-line lookup (runtime uses it if mapped):** key `d5a91f8e`; expected path `/audio/en/d5a91f8e-matilda.mp3`.

**Segments in playback order:**

  1. “Start at 4.” — key `0f795721`; expected path `/audio/en/0f795721-matilda.mp3`
  2. “Hop 4 back.” — key `9c3e4cb0`; expected path `/audio/en/9c3e4cb0-matilda.mp3`
  3. “Where do you land?” — key `ec1ceb3d`; expected path `/audio/en/ec1ceb3d-matilda.mp3`

### L20 — Number Line Jump / `hop:4:-1:4` (fixture seed 190)

**Coverage:** backward landing explanation. **Field:** `explanation`. **Full utterance:** “4 − 4 = 0. The frog moved 4 hops and landed on 0.”



**Whole-line lookup (runtime uses it if mapped):** key `f81943cd`; expected path `/audio/en/f81943cd-matilda.mp3`.

**Segments in playback order:**

  1. “4 − 4 = 0.” — key `8f94a2d1`; expected path `/audio/en/8f94a2d1-matilda.mp3`
  2. “The frog moved 4 hops and landed on 0.” — key `869e7086`; expected path `/audio/en/869e7086-matilda.mp3`

### L21 — Number Line Jump / `missing:12:3:2` (fixture seed 191)

**Coverage:** missing landing. **Field:** `prompt`. **Full utterance:** “12 + 3 = ?. Where do you land?”



**Whole-line lookup (runtime uses it if mapped):** key `c796c072`; expected path `/audio/en/c796c072-matilda.mp3`.

**Segments in playback order:**

  1. “12 + 3 = ?.” — key `642f30cd`; expected path `/audio/en/642f30cd-matilda.mp3`
  2. “Where do you land?” — key `ec1ceb3d`; expected path `/audio/en/ec1ceb3d-matilda.mp3`

### L22 — Number Line Jump / `missing:12:3:2` (fixture seed 191)

**Coverage:** missing landing explanation. **Field:** `explanation`. **Full utterance:** “12 + 3 = 15; the missing number is 15.”



**Whole-line lookup (runtime uses it if mapped):** key `5398bbfb`; expected path `/audio/en/5398bbfb-matilda.mp3`.

**Segments in playback order:**

  1. “12 + 3 = 15;” — key `9e8a88df`; expected path `/audio/en/9e8a88df-matilda.mp3`
  2. “the missing number is 15.” — key `660f0c88`; expected path `/audio/en/660f0c88-matilda.mp3`

### L23 — Number Line Jump / `compare:farther:2:10:10:10` (fixture seed 193)

**Coverage:** distance question with equal distance / unequal endpoints. **Field:** `prompt`. **Full utterance:** “Compare the journeys. Frog A starts at 2 and lands on 12. Frog B starts at 10 and lands on 20. Which frog travelled farther?”



**Whole-line lookup (runtime uses it if mapped):** key `2c5bba95`; expected path `/audio/en/2c5bba95-matilda.mp3`.

**Segments in playback order:**

  1. “Compare the journeys.” — key `05b6b6c5`; expected path `/audio/en/05b6b6c5-matilda.mp3`
  2. “Frog A starts at 2 and lands on 12.” — key `df30887c`; expected path `/audio/en/df30887c-matilda.mp3`
  3. “Frog B starts at 10 and lands on 20.” — key `6f7c3965`; expected path `/audio/en/6f7c3965-matilda.mp3`
  4. “Which frog travelled farther?” — key `660f9827`; expected path `/audio/en/660f9827-matilda.mp3`

### L24 — Number Line Jump / `compare:farther:2:10:10:10` (fixture seed 193)

**Coverage:** equal-distance result. **Field:** `explanation`. **Full utterance:** “A moved 10 spaces and landed on 12. B moved 10 spaces and landed on 20. They are the same.”



**Whole-line lookup (runtime uses it if mapped):** key `212a2d69`; expected path `/audio/en/212a2d69-matilda.mp3`.

**Segments in playback order:**

  1. “A moved 10 spaces and landed on 12.” — key `4213239f`; expected path `/audio/en/4213239f-matilda.mp3`
  2. “B moved 10 spaces and landed on 20.” — key `9ec05325`; expected path `/audio/en/9ec05325-matilda.mp3`
  3. “They are the same.” — key `8de9770f`; expected path `/audio/en/8de9770f-matilda.mp3`

### L25 — Number Line Jump / `compare:larger:16:4:4:9` (fixture seed 193)

**Coverage:** larger endpoint despite fewer hops. **Field:** `prompt`. **Full utterance:** “Compare the journeys. Frog A starts at 16 and lands on 20. Frog B starts at 4 and lands on 13. Which frog landed on the larger number?”



**Whole-line lookup (runtime uses it if mapped):** key `33040445`; expected path `/audio/en/33040445-matilda.mp3`.

**Segments in playback order:**

  1. “Compare the journeys.” — key `05b6b6c5`; expected path `/audio/en/05b6b6c5-matilda.mp3`
  2. “Frog A starts at 16 and lands on 20.” — key `2120faea`; expected path `/audio/en/2120faea-matilda.mp3`
  3. “Frog B starts at 4 and lands on 13.” — key `1f70fcc0`; expected path `/audio/en/1f70fcc0-matilda.mp3`
  4. “Which frog landed on the larger number?” — key `17e3e26c`; expected path `/audio/en/17e3e26c-matilda.mp3`

### L26 — Number Line Jump / `compare:larger:16:4:4:9` (fixture seed 193)

**Coverage:** landing-versus-distance contrast. **Field:** `explanation`. **Full utterance:** “A moved 4 spaces and landed on 20. B moved 9 spaces and landed on 13. A is larger.”



**Whole-line lookup (runtime uses it if mapped):** key `cb0ccb10`; expected path `/audio/en/cb0ccb10-matilda.mp3`.

**Segments in playback order:**

  1. “A moved 4 spaces and landed on 20.” — key `bb481f43`; expected path `/audio/en/bb481f43-matilda.mp3`
  2. “B moved 9 spaces and landed on 13.” — key `a93dca3f`; expected path `/audio/en/a93dca3f-matilda.mp3`
  3. “A is larger.” — key `b55429a6`; expected path `/audio/en/b55429a6-matilda.mp3`

### L27 — Number Line Jump / `compare:farther:11:9:19:1` (fixture seed 193)

**Coverage:** singular hop-count comparison. **Field:** `explanation`. **Full utterance:** “A moved 9 spaces and landed on 20. B moved 1 spaces and landed on 20. A is farther.”



**Whole-line lookup (runtime uses it if mapped):** key `37c66438`; expected path `/audio/en/37c66438-matilda.mp3`.

**Segments in playback order:**

  1. “A moved 9 spaces and landed on 20.” — key `2e6d758e`; expected path `/audio/en/2e6d758e-matilda.mp3`
  2. “B moved 1 spaces and landed on 20.” — key `5c515759`; expected path `/audio/en/5c515759-matilda.mp3`
  3. “A is farther.” — key `f8c8f63f`; expected path `/audio/en/f8c8f63f-matilda.mp3`

The exact `voiceClipKey` for each path is computed as the English key (`en-US` normalizes to `en`) over the exact segment text, lowercased and whitespace-normalized, using the frozen `voiceClipKey` implementation. The `Matilda` filename suffix follows the existing offline asset convention; it is not evidence that the corresponding file is currently present.

## One-use clue utterances for actual control tests

Each of these is an exact source clue passed by wrong-answer and/or one-use-hint controls. In the current helper each is a single exact segment, so the whole-line and segment lookup are the same key/path. Verify that the UI action speaks only this clue, and not the held correct explanation.

| Game / source question ID | Clue text | Key | Expected Matilda path |
|---|---|---|---|
| Addition Adventure / `groups:shell:2:3` | “Count the first group, then count on through the second group.” | `5f54f7e3` | `/audio/en/5f54f7e3-matilda.mp3` |
| Subtraction Station / `take:apple:1:0` | “Nothing is taken away. The starting group stays the same.” | `6b429877` | `/audio/en/6b429877-matilda.mp3` |
| Time Teller / `1:2:15:read` | “The long blue hand shows minutes. The short red hand shows the hour.” | `1c270115` | `/audio/en/1c270115-matilda.mp3` |
| Number Line Jump / `hop:4:1:5` (fixture seed 190) | “Move one number for each hop.” | `13952341` | `/audio/en/13952341-matilda.mp3` |

## Listener pass/fail criteria

Mark each sample `pending`, `pass`, or `fail`; retain the played file hash, listener/date/device/headphone or speaker context, and written note. Do not use a waveform, manifest, fetch status, native event, or this expected-path list as a substitute for listening.

- **Completeness and ordering:** all expected segments play once, in listed order, with no missing, repeated, overlapped, truncated, or inserted words. The joins sound like one natural instruction or explanation, with deliberate but not awkward pauses. A missing segment leaves the full sample pending; do not accept a shortened line.
- **Exact child-facing language:** spoken text matches the visible source wording and is intelligible at ordinary device volume. Number words are distinct; operation/direction/time words are not swallowed. Voice is calm, warm, encouraging, and age-appropriate without sounding overly slow or robotic. Record any pronunciation, prosody, volume, clipping, noise, or abrupt-start/stop defect with the exact segment key.
- **Zero, quantity, and agreement:** clearly distinguish zero from “oh”; keep each number attached to its noun/action; speak singular nouns and verbs with correct agreement and plural nouns with correct agreement. Source defects are not waivable by a pleasant recording: L05 currently reads `There are 1 apple.` and L06 currently ends `1 remain.`. Both are explicit content failures until source wording is corrected and the corresponding clips are regenerated/reviewed.
- **Addition and subtraction meaning:** addition lines sound like joining amounts; subtraction zero really means remove none; comparison means count the unpaired difference; equal groups must say equal/same rather than implying a leftover. Preserve names and object nouns without confusing the two amounts.
- **Clock terms:** “o’clock,” “half past,” “quarter past,” and “quarter to” are pronounced distinctly; for quarter-to-1, do not read it as quarter past 1. Explanations correctly pair minute-hand positions (12/6/3/9) with the short hour hand being on an hour or moving between numbers. No narrated sentence in these source rows says “12:45 plus 15 minutes becomes 1:00”; do not evaluate or invent one. The visible +15/−15 rollover is a separate interaction/correctness check already represented in the retained mechanics report.
- **Number-line meaning:** “forward” and “back” are distinct; landing number is not conflated with hop count or distance. L25/L26 contrast the larger endpoint (A lands at 20 after four hops) with farther travel (B moves nine spaces), L23/L24 require the equal-distance result to say the journeys are the same even though endpoints differ, and L27 exposes the singular “1 spaces” source defect. A listener should be able to retell which number or distance the question asks about.
- **No answer leak in prompt:** before success, the prompt narration must not announce the answer; the worked explanation is heard only from its intended correct-answer/held-feedback control. Clue text must remain a clue, not disclose the full answer early.

## Native playback, interaction, and cancellation checks

Run these checks only on an exact candidate where every path for the selected utterance is supplied, mapped, and decode-checked. Use fresh isolated profiles at 1280×800 and 390×844; install and verify `/api/voice` and `/api/story` guards on `about:blank` before the first app navigation, and keep the visible sound control muted except while explicitly testing local packaged playback. Use ordinary visible chapter unlocks and questions; do not inject progress, seeds, answer state, or storage. Record exact source/deployment identity and the actual local `/audio/en/*-matilda.mp3` requests. No provider or story generation calls.

1. **Replay / complete line:** on the visible question, press its actual Hear control. First record whether the exact whole-utterance lookup is selected; if it is, verify that one clip matches the displayed full text. Otherwise, verify every listed segment path loads and each clip decodes and reaches a real HTMLAudioElement `play`/`ended` sequence in order (record current path, event timing, and duration). Listen to the whole line; press Hear again and confirm it replays from the first segment in order. Repeat on at least one multi-segment prompt and its held explanation in each game. A returned HTTP 200 or an event alone is not audio-quality acceptance.
2. **Mute during a segment:** begin a multi-segment line, then switch the visible sound toggle off while the first or a later segment is still active. Verify the active media stops and no later queued segment begins; mute stays off for a subsequent Hear action. This tests cancellation of in-flight and queued segments, not only a future call.
3. **Wrong answer and retry:** choose a visible wrong answer. Verify the same question remains, retry text is audible only if that runtime path intentionally narrates it, and an optional hint is one-use. Ensure no correct-result explanation or later-question audio leaks before a correct response.
4. **Correct answer and held explanation:** answer correctly. Verify the feedback/explanation and its own segment sequence are available and heard once while the result remains held. There must be no automatic advancement. Press Hear explanation again to replay; then activate the visible Next action during narration and verify remaining segments stop and the next question starts silent.
5. **Back/Keep playing/confirmed exit:** start a local line, open Back after the leave guard is active, choose Keep playing, and verify the same question/held status remains. The source path does not cancel on opening the dialog, so playback should continue while the mounted game remains; verify rather than infer. Start a new line, confirm Back to world, and verify active audio is canceled on accepted route exit with no queued segment after unmount.
6. **Reload:** while a local line is active, reload normally. Verify browser teardown stops playback; after re-entry, no stale later segment resumes automatically. The ordinary game route/progress behavior must match the candidate’s non-audio contract.

Apply the user-visible runtime checks to Addition Adventure `Hear question`, `Use one hint`, correct held feedback and `Next question`; Subtraction Station equivalents; Time Teller `Hear mission` / `Hear hand lesson`, clue, held answer and `Next mission`; Number Line Jump `Hear mission`, clue, accepted hops/answer explanation and `Next mission`. The retained source says these paths pass `premium:false` and call shared cancellation on Next/restart/map return/unmount, but code inspection does not prove media stops in a real device/browser.

## Scope limits and source notes

- The excerpt has 27 prompt/explanation utterances plus four one-use clue utterances. It is intentionally finite and representative, not exhaustive of the 5,246 unique phrase segments produced by the frozen full source inventory. It covers all four games and the requested linguistic/semantic edge classes; it cannot establish pronunciation of every randomized question, clue, explanation, or prompt in the corpus.
- Existing [narration delta screenshots/report](batch4-narration-delta-local-20261003/report.md) show that a Hear control was pressed when the mission had missing segments and no Batch 4 playback occurred. Do not convert those control actions into a successful audio test. Existing [full mechanics evidence](batch4-final-repair-local-20261003/report.md) supplies ordinary gameplay paths and the 12:45/1:00 visible-clock boundary; no fresh gameplay matrix is requested here.
- The checked-in [finite inventory snapshot](batch4-narration-inventory-20261003.json) is a 235-item word-fragment request list (for example separate entries `Put`, `0`, `apples`) with a stated quality hold; that segmentation does not match the runtime helper’s phrase chunks such as `Put 0 apples`. Do not use that list to reconstruct the phrase order or claim current asset readiness. The exact utterance/key rows above come from the frozen runtime segment helper and the exhaustive generator in `scripts/batch4NarrationInventory.mjs`. Reconcile or regenerate the older 235-item artifact before using it for any readiness or packaging decision.
- No selected clip is called ready, decoded, played, or listened to in this worksheet. Audio corpus completeness, all-segment readiness, current deployment binding, playback event capture, cancellation, and human listening remain separate release gates. The retained gameplay matrix supports controls only; it does not close this worksheet.

## Pointers for a later completed review

- Before listening, bind the exact candidate source and served audio hashes; confirm all selected keys resolve to the expected Matilda paths, non-empty files decode, and the runtime helper’s ordered segments join exactly to the rendered source utterance.
- Attach the listener’s per-sample verdicts and distinguish auditory quality from file/hash checks and native playback/control checks. If a source sentence changes, regenerate/rebind that key and update the sample table from the new source SHA.
- For voice/content failures, retain the failing segment key, exact line, timestamp, and proposed correction. Do not regenerate or edit the manifest as part of this worksheet.


## Finite source-language agreement audit

The sample set exposed recurring authored-template problems that a listener must not normalize into a pass. A finite scan of the frozen arithmetic question pools and the exhaustively enumerated Number Line compare templates found three singular-agreement defects. These are **source copy defects in `ac3b3cc`**, not evidence of bad Matilda pronunciation. The proposed new keys below are computed from suggested replacement strings only; they are not currently authored, mapped, generated, present, or heard. The source correction must happen first, then its changed lines must be regenerated and independently listened to.

| Template defect and concrete fix | Frozen-source impact | Old key → proposed new key | Files needing coordinated source update |
|---|---|---|---|
| Subtraction start: `There are 1 {noun}.` → `There is 1 {noun}.` for apple, shell, star, flower, gem, cookie. | 12 generated Take Away question IDs: six nouns × removed 0 or 1 (`take:{noun}:1:0/1`); six unique affected spoken-segment texts. | apple `a381b377 → 3352ee11`; shell `be290349 → 84bd0c17`; star `89c03231 → d067b8a7`; flower `1e9710cc → b04f8552`; gem `917e0a82 → 47902350`; cookie `81617cd7 → 11d1317d`. | `src/data/arithmeticAdventure.js` prompt template and segment builder `arithmeticNarrationSegments()` must agree exactly. |
| Subtraction remainder: `1 remain.` → `1 remains.` (or a reviewed child-friendly alternative such as `1 is left.`). | 60 canonical Take Away questions end with answer 1 (six nouns × ten valid start/removal pairs). The same result segment is shared across them. | `26cdd055 → 0e404090` for the proposed `1 remains.` phrase. | `src/data/arithmeticAdventure.js` explanation field and `arithmeticNarrationSegments()` must emit the same exact sentence. |
| Number Line comparison: `X moved 1 spaces and landed on E.` → `X moved 1 space and landed on E.`. Apply conditional singular/plural agreement in both rendered explanation and narration segment. | 16,000 of the 88,940 enumerated Number Line rows are compare questions with one or both journeys exactly one hop. Across A/B labels and landing values 1–20, this changes 40 unique spoken segments. | Exact old/new key pairs (key order follows endpoint 1…20; asset path uses the standard `/audio/en/{key}-matilda.mp3` template):<br>A: `1bf7eb29→62b6bfac`, `f9f0f9de→04b3ed1b`, `1bf36dfb→e2b178fe`, `99ebe590→04af6fed`, `9bee274d→82ac64b0`, `19e69ee2→64a9f6df`, `7be977bf→82a7e782`, `19e221b4→64a579b1`, `fbe43111→02a2a0d4`, `2e3823db→67e65d20`, `0c35afbe→69e89edd`, `ae3d6a89→e7e11672`, `8c3af66c→09e38a8f`, `8e2e2d9f→07f0535c`, `ac2c1e42→e9f262b9`, `2e33a6ad→87eb0cae`, `ac309b70→e9ede58b`, `2e249c23→07d23e48`, `0c222806→69d51725`, `e6724336→fc11e1f1`.<br>B: `87b25c84→cbd5b3bb`, `09af5793→a9d7bccc`, `27ad4836→cbda30e9`, `09aada65→c9c8e4a2`, `a7a80188→2bcbbd7f`, `89a593b7→49ce2b50`, `a7a3845a→4bd06d0d`, `89c825f9→29beee66`, `a7c6169c→4bc16283`, `e7d65308→d63d2b11`, `49d92be5→f43b1bb4`, `e7d1d5da→763816c3`, `c9d3e537→5435a2a6`, `c7e0ae04→76339995`, `e9e32221→54312578`, `67db99b6→f62e52e7`, `49dda913→d42bdeca`, `47ea71e0→f650e529`, `49ecb39d→d44e710c`, `5c515759→40d471c0`. | `src/data/timeLineAdventure.js` question explanation plus `src/data/batch4Narration.js` explanation segment helper must use the same `space/spaces` selection. Rerun exact rejoin and exhaustive inventory checks after repair. |

The same audit checked dynamic Time Teller labels and the 120 canonical Time Teller question rows. It found no singular/plural hour/minute agreement template of this form: time labels use `o’clock`, `half past`, `quarter past` and `quarter to`; the explanatory subjects and verbs are singular (“minute hand points”, “hour hand is”). The selected 12:45 and 1:00 rows remain two distinct authored utterances. The visible 12:45→1:00 +15-minute control transition has separate retained functional evidence; no bridge sentence is added to the audio set.

