import { createHash } from 'node:crypto';
import { mkdir, open, readFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { voiceClipKey, normalizeVoiceText } from '../src/data/voiceKey.js';

export const PINNED_INVENTORY_SHA256 = 'aa07d93daba2b85aab5767f630391d2fb6862d4ad91ae43ed261e05ddac70227';
export const SUPPLEMENTAL_INVENTORY_SHA256 = '0b3e4fb645aec52d445ed04246b8c49958fdef60d92f9644b43e86060af6a2dd';
export const B4_GRAMMAR_INVENTORY_SHA256 = '9d0850e9fe357cf99b8edf2255b427c66a15c79a4163a47ea9191706624e3001';
export const SUPPLEMENTAL_SOURCE_COMMITS = Object.freeze({
  2: '94d44d031d5835d0d9fa2128064ff83ba5880a62',
  3: 'e2aee30169f6ade67f7948b0088a895a9cb119c3',
});
export const SUPPLEMENTAL_SOURCE_HASHES = Object.freeze({
  'src/data/batch2Narration.js': '979c76771ee751a5a44bb480d910257b05d7148c84eb4f108879efd3df04cc14',
  'src/data/puzzlePopBatch2.js': '74b63dd135836f58a9322f835e1a05411cbff6be49fea007e466dad9ffb59e56',
  'src/data/spotDifferenceBatch2.js': '5f8a2916eb1fad79a7913deae73404eb9155826683279f14b348f4441696b98c',
  'src/data/batch3Narration.js': '8944c5fb6315e7751c15521826d603e4c9d1245503dde17e7c235edbf31a0d33',
  'src/data/dinoDetectiveBatch3.js': '1bf0d3074ad7e3cba4df6ae701eeec22b9b71745017be9112592aa5b9d500749',
  'src/data/voiceKey.js': 'd013e09382520cc4a97e8134171631ade5eb31d39a54d92cc089159dcd95628f',
});
export const B4_GRAMMAR_SOURCE_COMMIT = 'fe5aeff64dca2d1c9aad6dcecee9cede5bdcc128';
export const B4_GRAMMAR_BASE_COMMIT = 'ac3b3ccaf03107749d865f8d79557e872a06c881';
export const B4_GRAMMAR_DELTA_SHA256 = '8049920284e5b9273552f4381043bfb0182acda3e2d699c0df1509d06d6c76f8';
export const B7_SOLAR_TEACHING_INVENTORY_SHA256 = 'da8d0fa36700cb7703678243640a82740ea05c5f17170b76c073f76ca51998d5';
export const B7_SOLAR_TEACHING_SOURCE_COMMIT = '21ee7b240b271c5d775e4ebca3b5f29e0ad63ade';
export const B7_SOLAR_TEACHING_BASE_COMMIT = 'c4db1d4b3e469bf71409ec7d859a05a2c7fa9301';
export const B5_SOUND_SAFARI_INVENTORY_SHA256 = '5d6630518ec00b2d4c92fd869ce79db38e611c604f24172092626b443ce206c0';
export const B5_SOUND_SAFARI_SOURCE_INVENTORY_SHA256 = '365588284c853a7bfdfaf79f2e1153b1065a7f54c51c562f91cbd66b286b7e83';
export const B5_SOUND_SAFARI_SOURCE_COMMIT = 'c636516afa9ffa1b77dcc3bd5b7353ee80bce567';
export const B5_SOUND_SAFARI_PREDECESSOR_LEDGER_SHA256 = '3a8b85354a1163b11405a8b3ad51a3faf536839c188539d58dc81e0399910773';
export const B5_SOUND_SAFARI_TUPLE_SHA256 = 'b47e545240b2d53b7e8cd8895cb0929f02797227381b315ce99027971bd34f01';
export const B5_SOUND_SAFARI_REQUEST_LIMIT = 851;
export const B5_SOUND_SAFARI_MAX_CALLS_PER_RUN = 20;
export const B5_SOUND_SAFARI_MAX_RUNS = 43;
export const B7_SOLAR_TEACHING_REQUEST_LIMIT = 52;
export const B7_SOLAR_TEACHING_MAX_CALLS_PER_RUN = 10;
export const B7_SOLAR_TEACHING_MAX_RUNS = 6;
export const B7_SOLAR_TEACHING_SOURCE_HASHES = Object.freeze({
  'src/data/index.js': 'f7dfc08370d14127394f31301c9404aee5498d2389cf75e664bdbaa58c4d0a2e',
  'src/data/offlineVoiceManifest.js': '674ecdbbc4bc75d7aaba599a02f0b3246be2c80a638e2b4d811762c49f9637b7',
  'src/data/voiceKey.js': 'd013e09382520cc4a97e8134171631ade5eb31d39a54d92cc089159dcd95628f',
});
export const B5_SOUND_SAFARI_SOURCE_HASHES = Object.freeze({
  'src/data/batch5Literacy.js': '8440dd01d079549d4f03152f1f6ba7231562811979959c9d3731811e9310e057',
  'src/data/batch5LiteracyPools.js': '36ec814732029449b3a918dfcd95230f55a5c4ee9e57d992fab7b063f9a84e26',
  'src/data/batch5LiteracyProgress.js': 'ec122159161c25b5391cd6fe2848e1ac6dc64490461d309d65eebbc1fef07860',
  'src/data/batch5SoundSafariPictureWords.js': '12a9cecd868c93faac4352813417d506ed4da7a095b82a804b7adf88dc71b543',
  'src/data/batch5SoundSafariPictureArt.js': 'a3c0fa3b3ad177a097da0aef9a7aadfce059925dd43d0fe34050d3c44f798904',
  'src/data/batch5SoundSafariLabels.js': '2cb6373a12b1cdf429033b36ac23168e233f75353b34de4eb717c609e52a4d12',
  'src/data/batch5SoundSafariNarration.js': '283a15cfd4303867b6570b4d5124296c99986f8f8b660542e8302ff27c28c5a0',
  'src/data/voiceKey.js': 'd013e09382520cc4a97e8134171631ade5eb31d39a54d92cc089159dcd95628f',
  'src/data/offlineVoiceManifest.js': '674ecdbbc4bc75d7aaba599a02f0b3246be2c80a638e2b4d811762c49f9637b7',
  'src/components/games/AmariSoundSafari.jsx': '35e86fd1dd03d46c5548df362caa41efd739ecaaac60876f72a2646fec233c23',
  'src/components/games/useAmariPhonemeAudio.js': 'f82cfbe80ca83be413e2979d6fa0baef5650a11a7f811f3453006c6c0ed3e6b4',
  'scripts/batch5LiteracyNarrationInventory.mjs': '163961f0c2a6fabc99149ab69a158d46997c14a29e4b04f95ab32aef39812f47',
  'scripts/check-batch5-literacy-readiness.mjs': '79ab6c335df87a78f6b2d21f61bbf39685e078bdce79e2be9fad6bed3204c87e',
});
export const B4_GRAMMAR_SOURCE_HASHES = Object.freeze({
  'scripts/batch4NarrationInventory.mjs': 'e404d0f2304e1c3aafc8e0dbcda3e798251436db53897428b6a66e40e32e968b',
  'src/data/arithmeticAdventure.js': '5e3dfd0f4d2de27262b89daf967f7942926601ab3354da7d6430d35d6aba93f7',
  'src/data/batch4Narration.js': '88743fa76c2006ef369b3bbe7ec236e7b661f62996411f37d9c7ce6417bd790d',
  'src/data/timeLineAdventure.js': 'c1297de04359a2c337ba13c9480387fcae71f23dbe04041354aefcc1dca6f941',
  'src/data/voiceKey.js': 'd013e09382520cc4a97e8134171631ade5eb31d39a54d92cc089159dcd95628f',
});
export const B4_SOURCE_COMMIT = 'ac3b3ccaf03107749d865f8d79557e872a06c881';
export const B4_WORKER_PID = 18781;
export const RATE_WINDOW_MS = 10 * 60 * 1000;
export const REQUEST_LIMIT = 30;
export const MAX_CALLS_PER_RUN = 20;
export const MAX_RUNS = 100;
export const MAX_REQUEST_TIMEOUT_MS = 90_000;
export const VOICE_ORIGIN = 'https://dinospace-eight.vercel.app';
export const VOICE_ENDPOINT = `${VOICE_ORIGIN}/api/voice`;

export const JOBS = Object.freeze({
  'b5-reasoning': Object.freeze({ owner: 'B5_reasoning', label: 'B5 reasoning narration' }),
  'b5-literacy': Object.freeze({ owner: 'B5_literacy', label: 'B5 literacy narration' }),
  'b5-sound-safari-literacy': Object.freeze({ ledger: 'b5-sound-safari-literacy', batch: 5, label: 'B5 Sound Safari and literacy narration' }),
  b6: Object.freeze({ owner: 'B6', label: 'B6 Amari narration' }),
  'b7-solar': Object.freeze({ owner: 'B7_solar', label: 'B7 Solar narration' }),
  'b7-solar-teaching': Object.freeze({ ledger: 'b7-solar-teaching', batch: 7, label: 'B7 Solar teaching-copy narration' }),
  'b7-memory': Object.freeze({ owner: 'B7_memory', label: 'B7 Memory narration' }),
  'b2-supplement': Object.freeze({ ledger: 'supplemental', batch: 2, label: 'B2 released narration supplement' }),
  'b3-dino-facts': Object.freeze({ ledger: 'supplemental', batch: 3, game: 'dino', label: 'B3 revised Dino fact narration' }),
  'b4-grammar': Object.freeze({ ledger: 'b4-grammar', batch: 4, label: 'B4 singular-agreement grammar narration' }),
});

export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

export function validateBudgets({ maxCalls, maxRuns, paid }) {
  if (!Number.isInteger(maxCalls) || maxCalls < 1 || maxCalls > MAX_CALLS_PER_RUN) {
    throw new Error(`max-calls must be an integer from 1 to ${MAX_CALLS_PER_RUN}.`);
  }
  if (!Number.isInteger(maxRuns) || maxRuns < 1 || maxRuns > MAX_RUNS) {
    throw new Error(`max-runs must be an integer from 1 to ${MAX_RUNS}.`);
  }
  if (paid && (maxCalls === undefined || maxRuns === undefined)) {
    throw new Error('Paid execution requires explicit --max-calls and --max-runs values.');
  }
  return { maxCalls, maxRuns };
}

export function validateB7SolarTeachingExecutionCaps({ maxCalls, maxRuns, maxTotalCalls, paid }) {
  if (!paid) return true;
  if (!Number.isInteger(maxCalls) || maxCalls < 1 || maxCalls > B7_SOLAR_TEACHING_MAX_CALLS_PER_RUN) {
    throw new Error(`B7 Solar teaching max-calls must be from 1 to ${B7_SOLAR_TEACHING_MAX_CALLS_PER_RUN}.`);
  }
  if (!Number.isInteger(maxRuns) || maxRuns < 1 || maxRuns > B7_SOLAR_TEACHING_MAX_RUNS) {
    throw new Error(`B7 Solar teaching max-runs must be from 1 to ${B7_SOLAR_TEACHING_MAX_RUNS}.`);
  }
  if (!Number.isInteger(maxTotalCalls) || maxTotalCalls < 1 || maxTotalCalls > B7_SOLAR_TEACHING_REQUEST_LIMIT) {
    throw new Error(`B7 Solar teaching max-total-calls must be from 1 to ${B7_SOLAR_TEACHING_REQUEST_LIMIT}.`);
  }
  return true;
}

export function validateB7SolarTeachingBudgetState(state, inventorySha256 = B7_SOLAR_TEACHING_INVENTORY_SHA256, allowedKeys = null) {
  if (!state || state.inventorySha256 !== inventorySha256 || !Number.isInteger(state.runs) || state.runs < 0 || state.runs > B7_SOLAR_TEACHING_MAX_RUNS || !Array.isArray(state.attemptedKeys)
      || state.attemptedKeys.length > B7_SOLAR_TEACHING_REQUEST_LIMIT
      || state.attemptedKeys.some((key) => !/^[a-f0-9]{8}$/.test(key))
      || new Set(state.attemptedKeys).size !== state.attemptedKeys.length
      || (allowedKeys && state.attemptedKeys.some((key) => !allowedKeys.has(key)))) {
    throw new Error('B7 Solar teaching attempt ledger is invalid or does not match the pinned inventory.');
  }
  return true;
}

export function claimB7SolarTeachingRun(state) {
  validateB7SolarTeachingBudgetState(state);
  if (state.runs >= B7_SOLAR_TEACHING_MAX_RUNS) throw new Error('B7 Solar teaching six-run cap is exhausted; stopping without retry.');
  return { ...state, runs: state.runs + 1 };
}

export function claimB7SolarTeachingAttempt(state, key) {
  validateB7SolarTeachingBudgetState(state);
  if (state.attemptedKeys.includes(key)) throw new Error(`B7 Solar teaching request ${key} was already attempted; automatic retries are disabled.`);
  if (state.attemptedKeys.length >= B7_SOLAR_TEACHING_REQUEST_LIMIT) throw new Error('B7 Solar teaching 52-request inventory cap is exhausted; stopping without retry.');
  if (!/^[a-f0-9]{8}$/.test(key)) throw new Error('B7 Solar teaching request key is invalid.');
  return { ...state, attemptedKeys: [...state.attemptedKeys, key].sort() };
}

export function validateB5SoundSafariExecutionCaps({ maxCalls, maxRuns, maxTotalCalls, paid }) {
  if (!paid) return true;
  if (!Number.isInteger(maxCalls) || maxCalls < 1 || maxCalls > B5_SOUND_SAFARI_MAX_CALLS_PER_RUN) {
    throw new Error(`B5 Sound Safari max-calls must be from 1 to ${B5_SOUND_SAFARI_MAX_CALLS_PER_RUN}.`);
  }
  if (!Number.isInteger(maxRuns) || maxRuns < 1 || maxRuns > B5_SOUND_SAFARI_MAX_RUNS) {
    throw new Error(`B5 Sound Safari max-runs must be from 1 to ${B5_SOUND_SAFARI_MAX_RUNS}.`);
  }
  if (!Number.isInteger(maxTotalCalls) || maxTotalCalls < 1 || maxTotalCalls > B5_SOUND_SAFARI_REQUEST_LIMIT) {
    throw new Error(`B5 Sound Safari max-total-calls must be from 1 to ${B5_SOUND_SAFARI_REQUEST_LIMIT}.`);
  }
  return true;
}

export function validateB5SoundSafariBudgetState(state, inventorySha256 = B5_SOUND_SAFARI_INVENTORY_SHA256, allowedKeys = null) {
  if (!state || state.inventorySha256 !== inventorySha256
      || !Number.isInteger(state.runs) || state.runs < 0 || state.runs > B5_SOUND_SAFARI_MAX_RUNS
      || !Array.isArray(state.attemptedKeys) || state.attemptedKeys.length > B5_SOUND_SAFARI_REQUEST_LIMIT
      || state.attemptedKeys.some((key) => !/^[a-f0-9]{8}$/.test(key))
      || new Set(state.attemptedKeys).size !== state.attemptedKeys.length
      || (allowedKeys && state.attemptedKeys.some((key) => !allowedKeys.has(key)))) {
    throw new Error('B5 Sound Safari attempt ledger is invalid or does not match the pinned pending-key set.');
  }
  return true;
}

export function claimB5SoundSafariRunWhenPending(state, pendingCount, allowedKeys = null) {
  validateB5SoundSafariBudgetState(state, state.inventorySha256, allowedKeys);
  if (!Number.isInteger(pendingCount) || pendingCount < 0) throw new Error('B5 Sound Safari pending count is invalid.');
  if (pendingCount === 0) return state;
  if (state.runs >= B5_SOUND_SAFARI_MAX_RUNS) throw new Error('B5 Sound Safari 43-run cap is exhausted; stopping without retry.');
  return { ...state, runs: state.runs + 1 };
}

export function b5SoundSafariAllowedPendingKeys(items) {
  if (!Array.isArray(items)) throw new Error('B5 Sound Safari selected items must be an array.');
  if (items.some((item) => typeof item.candidateAtSnapshotPending !== 'boolean'
      || item.candidateAtSnapshotPending !== !item.expectedCandidateSha256)) {
    throw new Error('B5 Sound Safari selected items lost or changed the pinned snapshot pending marker.');
  }
  return new Set(items.filter((item) => item.candidateAtSnapshotPending === true).map((item) => item.key));
}

export function claimB5SoundSafariAttempt(state, key, allowedKeys = null) {
  validateB5SoundSafariBudgetState(state, state.inventorySha256, allowedKeys);
  if (!/^[a-f0-9]{8}$/.test(key) || (allowedKeys && !allowedKeys.has(key))) {
    throw new Error(`B5 Sound Safari request key is outside the pinned pending-key set: ${key}.`);
  }
  if (state.attemptedKeys.includes(key)) throw new Error(`B5 Sound Safari request ${key} was already attempted; automatic retries are disabled.`);
  if (state.attemptedKeys.length >= B5_SOUND_SAFARI_REQUEST_LIMIT) throw new Error('B5 Sound Safari 851-request cap is exhausted; stopping without retry.');
  return { ...state, attemptedKeys: [...state.attemptedKeys, key].sort() };
}

export async function loadPinnedInventory({ inventoryPath, suppliedSha256, expectedSha256 = PINNED_INVENTORY_SHA256 }) {
  if (suppliedSha256 !== expectedSha256) {
    throw new Error(`Inventory SHA argument must equal reviewed SHA ${expectedSha256}.`);
  }
  const bytes = await readFile(inventoryPath);
  const actualSha256 = sha256(bytes);
  if (actualSha256 !== expectedSha256) {
    throw new Error(`Inventory content SHA mismatch: expected ${expectedSha256}, got ${actualSha256}.`);
  }
  const inventory = JSON.parse(bytes.toString('utf8'));
  const expectedCount = expectedSha256 === SUPPLEMENTAL_INVENTORY_SHA256 ? 7
    : expectedSha256 === B4_GRAMMAR_INVENTORY_SHA256 ? 47
      : expectedSha256 === B7_SOLAR_TEACHING_INVENTORY_SHA256 ? 127
        : expectedSha256 === B5_SOUND_SAFARI_INVENTORY_SHA256 ? 862
      : inventory.items?.length;
  const countIsValid = expectedSha256 === SUPPLEMENTAL_INVENTORY_SHA256 || expectedSha256 === B4_GRAMMAR_INVENTORY_SHA256
    || expectedSha256 === B7_SOLAR_TEACHING_INVENTORY_SHA256
    ? inventory.requested === expectedCount
    : expectedSha256 === B5_SOUND_SAFARI_INVENTORY_SHA256
      ? inventory.sourceInventory?.uniqueTexts === expectedCount && inventory.items?.length === expectedCount
      : inventory.uniqueVoiceKeys === inventory.items?.length;
  if (!Array.isArray(inventory.items) || !countIsValid || inventory.items.length !== expectedCount) {
    throw new Error('Reviewed inventory structure is not the pinned key ledger format.');
  }
  if (expectedSha256 === SUPPLEMENTAL_INVENTORY_SHA256) validateSupplementalProvenance(inventory);
  if (expectedSha256 === B4_GRAMMAR_INVENTORY_SHA256) validateB4GrammarProvenance(inventory);
  if (expectedSha256 === B7_SOLAR_TEACHING_INVENTORY_SHA256) validateB7SolarTeachingProvenance(inventory);
  if (expectedSha256 === B5_SOUND_SAFARI_INVENTORY_SHA256) validateB5SoundSafariProvenance(inventory);
  return { inventory, actualSha256 };
}

export function validateB7SolarTeachingProvenance(inventory) {
  if (inventory.source !== B7_SOLAR_TEACHING_SOURCE_COMMIT || inventory.base !== B7_SOLAR_TEACHING_BASE_COMMIT
      || inventory.uniqueVoiceKeys !== 127 || inventory.readyAtCandidateSnapshot !== 75
      || inventory.pendingAtCandidateSnapshot !== 52 || inventory.factsEdited !== 22
      || inventory.changedFactVoiceKeysAdded !== 44 || inventory.changedFactVoiceKeysRemoved !== 44
      || inventory.pendingBreakdown?.newCopyKeys !== 44 || inventory.pendingBreakdown?.unchangedPriorMissingKeys !== 8
      || inventory.budget?.maximumRequests !== 52 || inventory.budget?.maximumRequestsPerRun !== 10
      || inventory.budget?.maximumRuns !== 6 || inventory.budget?.plannedSingleRunCaps?.join(',') !== '10,10,10,10,10,2'
      || inventory.budget?.rollingWindowLimit !== REQUEST_LIMIT || inventory.budget?.rollingWindowMinutes !== 10) {
    throw new Error('B7 Solar teaching ledger source or exact corpus/readiness totals changed.');
  }
  const provenance = inventory.sourceHashes || {};
  const expectedPaths = Object.keys(B7_SOLAR_TEACHING_SOURCE_HASHES).sort();
  if (Object.keys(provenance).sort().join('\n') !== expectedPaths.join('\n')) throw new Error('B7 Solar teaching ledger source provenance paths changed.');
  for (const path of expectedPaths) {
    if (provenance[path] !== B7_SOLAR_TEACHING_SOURCE_HASHES[path]) throw new Error(`B7 Solar teaching source provenance mismatch for ${path}.`);
  }
  if (inventory.items?.length !== 127) throw new Error('B7 Solar teaching ledger must contain exactly 127 runtime phrases.');
  const seen = new Set();
  const pending = new Set();
  let ready = 0;
  for (const entry of inventory.items) {
    if (entry.owners?.length !== 1 || entry.owners[0] !== 'B7_solar' || entry.path !== `/audio/en/${entry.key}-matilda.mp3`) {
      throw new Error(`B7 Solar ownership or output path mismatch for ${entry.key}.`);
    }
    if (entry.key !== voiceClipKey(entry.text, 'en-US')) throw new Error(`B7 Solar key does not match exact reviewed phrase: ${entry.key}.`);
    if (entry.textVariants?.length !== 1 || entry.textVariants[0] !== entry.text) throw new Error(`B7 Solar text variants are not exact for ${entry.key}.`);
    if (seen.has(entry.key)) throw new Error(`Duplicate B7 Solar key ${entry.key}.`);
    seen.add(entry.key);
    const status = entry.candidateStatus?.B7_solar;
    if (!status || typeof status.manifestMatches !== 'boolean' || typeof status.fileExists !== 'boolean') throw new Error(`B7 Solar candidate status is incomplete for ${entry.key}.`);
    if (status.fileExists && status.manifestMatches && /^[a-f0-9]{64}$/.test(status.sha256 || '')) ready += 1;
    else if (!status.fileExists && !status.manifestMatches && status.sha256 === null) pending.add(entry.key);
    else throw new Error(`B7 Solar candidate bytes have ambiguous provenance for ${entry.key}.`);
  }
  if (ready !== 75 || pending.size !== 52) throw new Error('B7 Solar current candidate statuses do not match 75 ready / 52 pending.');
  const newKeys = [...inventory.newCopyKeys].sort();
  const retainedMissing = [...inventory.unchangedPriorMissingKeys].sort();
  if (newKeys.length !== 44 || new Set(newKeys).size !== 44 || retainedMissing.length !== 8 || new Set(retainedMissing).size !== 8) {
    throw new Error('B7 Solar new-copy or retained-missing key sets have invalid sizes.');
  }
  for (const key of [...newKeys, ...retainedMissing]) if (!pending.has(key)) throw new Error(`B7 Solar expected pending key is not pending: ${key}.`);
  if (newKeys.some((key) => retainedMissing.includes(key)) || pending.size !== new Set([...newKeys, ...retainedMissing]).size) {
    throw new Error('B7 Solar pending keys do not equal the exact 44 new-copy plus 8 retained set.');
  }
  return true;
}

export function validateB5SoundSafariProvenance(inventory) {
  if (inventory.schemaVersion !== 1 || inventory.ledgerName !== 'B5 Sound Safari and literacy narration'
      || inventory.selectorProposal !== 'b5-sound-safari-literacy'
      || inventory.successor?.sourceCommit !== B5_SOUND_SAFARI_SOURCE_COMMIT
      || inventory.successor?.supersedesLedgerSha256 !== B5_SOUND_SAFARI_PREDECESSOR_LEDGER_SHA256
      || inventory.successor?.exactTupleSha256 !== B5_SOUND_SAFARI_TUPLE_SHA256
      || inventory.successor?.tupleComparison !== '862/862 exact key, text, and path tuples equal the a652 historical ledger.'
      || inventory.successor?.changedSourcePaths?.join(',') !== 'src/data/batch5SoundSafariPictureArt.js'
      || inventory.source?.commit !== B5_SOUND_SAFARI_SOURCE_COMMIT
      || inventory.sourceInventory?.sha256 !== B5_SOUND_SAFARI_SOURCE_INVENTORY_SHA256
      || inventory.sourceInventory?.uniqueTexts !== 862 || inventory.sourceInventory?.exactSequences !== 603
      || inventory.candidateSnapshot?.ready !== 11 || inventory.candidateSnapshot?.pending !== B5_SOUND_SAFARI_REQUEST_LIMIT
      || inventory.items?.length !== 862) {
    throw new Error('B5 Sound Safari successor ledger source or exact corpus/readiness totals changed.');
  }
  const sourceHashes = inventory.source.sha256ByPath || {};
  const expectedPaths = Object.keys(B5_SOUND_SAFARI_SOURCE_HASHES).sort();
  if (Object.keys(sourceHashes).sort().join('\n') !== expectedPaths.join('\n')) {
    throw new Error('B5 Sound Safari successor source provenance paths changed.');
  }
  for (const path of expectedPaths) {
    if (sourceHashes[path] !== B5_SOUND_SAFARI_SOURCE_HASHES[path]) throw new Error(`B5 Sound Safari source provenance mismatch for ${path}.`);
  }
  const plan = inventory.finiteExecutionPlan || {};
  const expectedRunCaps = [...Array(42).fill(20), 11];
  if (plan.enabled !== false || plan.maximumRequestsPerRun !== B5_SOUND_SAFARI_MAX_CALLS_PER_RUN
      || plan.maximumUniqueRequests !== B5_SOUND_SAFARI_REQUEST_LIMIT || plan.maximumRuns !== B5_SOUND_SAFARI_MAX_RUNS
      || plan.rollingSharedLimit?.requests !== REQUEST_LIMIT || plan.rollingSharedLimit?.minutes !== 10
      || plan.retryPolicy?.startsWith('No automatic retries.') !== true
      || plan.producerSafety?.predecessorPid !== B4_WORKER_PID
      || plan.producerSafety?.lock !== 'tmp/offline-voice-generator.lock adjacent to the shared request journal'
      || !plan.producerSafety?.gate?.includes('stopped') || !plan.producerSafety?.gate?.includes('terminal')
      || !plan.reusePolicy?.includes('successful receipt bound to this exact successor ledger SHA')
      || plan.plannedRunCaps?.join(',') !== expectedRunCaps.join(',')) {
    throw new Error('B5 Sound Safari finite caps or producer safety gates changed.');
  }
  const seen = new Set();
  let ready = 0;
  let pending = 0;
  for (const item of inventory.items) {
    if (!item || typeof item.text !== 'string' || !item.text.trim() || item.key !== voiceClipKey(item.text, 'en-US')
        || item.path !== `/audio/en/${item.key}-matilda.mp3` || !/^[a-f0-9]{64}$/.test(item.textSha256 || '')
        || item.textSha256 !== sha256(Buffer.from(item.text, 'utf8')) || seen.has(item.key)) {
      throw new Error(`B5 Sound Safari text/key/path mismatch or duplicate key: ${item?.key}.`);
    }
    seen.add(item.key);
    const status = item.candidateAtSnapshot;
    if (!status || typeof status.manifestMatches !== 'boolean' || typeof status.fileExists !== 'boolean') {
      throw new Error(`B5 Sound Safari candidate status missing for ${item.key}.`);
    }
    if (status.manifestMatches && status.fileExists && Number.isInteger(status.fileBytes) && status.fileBytes > 0
        && /^[a-f0-9]{64}$/.test(status.audioSha256 || '')) {
      ready += 1;
    } else if (!status.manifestMatches && !status.fileExists && status.fileBytes === null && status.audioSha256 === null) {
      pending += 1;
    } else {
      throw new Error(`B5 Sound Safari candidate bytes have ambiguous provenance for ${item.key}.`);
    }
  }
  if (seen.size !== 862 || ready !== 11 || pending !== B5_SOUND_SAFARI_REQUEST_LIMIT) {
    throw new Error('B5 Sound Safari candidate snapshot must remain exactly 11 ready / 851 pending.');
  }
  return true;
}

export function validateB4GrammarProvenance(inventory) {
  if (inventory.source !== B4_GRAMMAR_SOURCE_COMMIT || inventory.base !== B4_GRAMMAR_BASE_COMMIT
      || inventory.deltaSha256 !== B4_GRAMMAR_DELTA_SHA256
      || inventory.removed !== 47 || inventory.unchanged !== 5199 || inventory.requested !== 47) {
    throw new Error('B4 grammar ledger source or exact corpus-delta totals changed.');
  }
  const provenance = inventory.sourceHashes || {};
  const expectedPaths = Object.keys(B4_GRAMMAR_SOURCE_HASHES).sort();
  if (Object.keys(provenance).sort().join('\n') !== expectedPaths.join('\n')) throw new Error('B4 grammar ledger source provenance paths changed.');
  for (const path of expectedPaths) {
    if (provenance[path] !== B4_GRAMMAR_SOURCE_HASHES[path]) throw new Error(`B4 grammar source provenance mismatch for ${path}.`);
  }
  if (inventory.items?.length !== 47) throw new Error('B4 grammar ledger must contain exactly 47 additions.');
  const seen = new Set();
  for (const entry of inventory.items) {
    if (entry.batch !== 4 || entry.source !== B4_GRAMMAR_SOURCE_COMMIT || entry.language !== 'en' || entry.voice !== 'matilda') {
      throw new Error(`B4 grammar metadata mismatch for ${entry.key}.`);
    }
    if (entry.key !== voiceClipKey(entry.text, 'en-US')) throw new Error(`B4 grammar key does not match exact reviewed phrase: ${entry.key}.`);
    if (entry.path !== `/audio/en/${entry.key}-matilda.mp3`) throw new Error(`B4 grammar output path mismatch for ${entry.key}.`);
    if (entry.mapped !== null || entry.fileBytes !== null) throw new Error(`B4 grammar phrase ${entry.key} was not missing at review time; reconcile its exact bytes before scheduling.`);
    if (seen.has(entry.key)) throw new Error(`Duplicate B4 grammar key ${entry.key}.`);
    seen.add(entry.key);
  }
  return true;
}

export function validateSupplementalProvenance(inventory) {
  const provenance = inventory.provenance || {};
  const expectedPaths = Object.keys(SUPPLEMENTAL_SOURCE_HASHES).sort();
  if (Object.keys(provenance).sort().join('\n') !== expectedPaths.join('\n')) throw new Error('Supplemental ledger source provenance paths changed.');
  for (const path of expectedPaths) {
    const batch = path.includes('batch2') || path.includes('puzzlePopBatch2') || path.includes('spotDifferenceBatch2') || path.includes('voiceKey') ? 2 : 3;
    const expected = provenance[path];
    if (expected.source !== SUPPLEMENTAL_SOURCE_COMMITS[batch] || expected.sha256 !== SUPPLEMENTAL_SOURCE_HASHES[path]) {
      throw new Error(`Supplemental source provenance mismatch for ${path}.`);
    }
  }
  return true;
}

export function selectJobItems(inventory, jobName) {
  const job = JOBS[jobName];
  if (!job) throw new Error(`Unknown job selector. Choose one of: ${Object.keys(JOBS).join(', ')}.`);
  const selected = new Map();
  if (job.ledger === 'b5-sound-safari-literacy') {
    validateB5SoundSafariProvenance(inventory);
    for (const entry of inventory.items) {
      const status = entry.candidateAtSnapshot;
      selected.set(entry.key, Object.freeze({
        key: entry.key,
        text: entry.text,
        path: entry.path,
        owners: Object.freeze(['B5_sound_safari_literacy']),
        expectedCandidateSha256: status.audioSha256,
        candidateAtSnapshotPending: !status.audioSha256,
        sourceCommit: B5_SOUND_SAFARI_SOURCE_COMMIT,
      }));
    }
    return [...selected.values()].sort((a, b) => a.key.localeCompare(b.key));
  }
  if (job.ledger === 'b7-solar-teaching') {
    validateB7SolarTeachingProvenance(inventory);
    for (const entry of inventory.items) {
      const candidate = entry.candidateStatus.B7_solar;
      selected.set(entry.key, Object.freeze({
        key: entry.key,
        text: entry.text,
        path: entry.path,
        owners: Object.freeze(['B7_solar']),
        expectedCandidateSha256: candidate.fileExists && candidate.manifestMatches ? candidate.sha256 : null,
        sourceCommit: B7_SOLAR_TEACHING_SOURCE_COMMIT,
      }));
    }
    return [...selected.values()].sort((a, b) => a.key.localeCompare(b.key));
  }
  if (job.ledger === 'b4-grammar') {
    validateB4GrammarProvenance(inventory);
    for (const entry of inventory.items) {
      selected.set(entry.key, Object.freeze({
        key: entry.key,
        text: entry.text,
        path: entry.path,
        owners: Object.freeze(['B4_grammar']),
        expectedCandidateSha256: null,
        sourceCommit: entry.source,
      }));
    }
    return [...selected.values()].sort((a, b) => a.key.localeCompare(b.key));
  }
  if (job.ledger === 'supplemental') {
    const records = inventory.items?.filter((entry) => entry.batch === job.batch && (!job.game || entry.game === job.game)) || [];
    const expectedCount = jobName === 'b2-supplement' ? 5 : 2;
    if (records.length !== expectedCount) throw new Error(`${jobName} ledger must contain exactly ${expectedCount} reviewed phrases.`);
    for (const entry of records) {
      if (entry.source !== SUPPLEMENTAL_SOURCE_COMMITS[entry.batch]) throw new Error(`Supplemental source commit mismatch for ${entry.key}.`);
      if (entry.language !== 'en' || entry.voice !== 'matilda') throw new Error(`Supplemental language or voice mismatch for ${entry.key}.`);
      if (entry.key !== voiceClipKey(entry.text, 'en-US')) throw new Error(`Supplemental key does not match its exact reviewed phrase: ${entry.key}.`);
      if (entry.path !== `/audio/en/${entry.key}-matilda.mp3`) throw new Error(`Supplemental output path mismatch for ${entry.key}.`);
      if (entry.mapped !== null || entry.fileBytes !== null) throw new Error(`Supplemental phrase ${entry.key} was not missing at review time; reconcile its exact bytes before scheduling.`);
      if (selected.has(entry.key)) throw new Error(`Duplicate supplemental key ${entry.key}.`);
      selected.set(entry.key, Object.freeze({
        key: entry.key,
        text: entry.text,
        path: entry.path,
        owners: Object.freeze([`B${entry.batch}_${entry.game}`]),
        expectedCandidateSha256: null,
        sourceCommit: entry.source,
      }));
    }
    return [...selected.values()].sort((a, b) => a.key.localeCompare(b.key));
  }
  for (const entry of inventory.items) {
    if (!entry.owners?.includes(job.owner)) continue;
    const candidates = [entry.text, ...(entry.textVariants || [])];
    for (const text of candidates) {
      if (voiceClipKey(text, 'en-US') !== entry.key) {
        throw new Error(`Voice key does not match reviewed text for ${entry.key}.`);
      }
      if (normalizeVoiceText(text).toLowerCase() !== normalizeVoiceText(entry.text).toLowerCase()) {
        throw new Error(`Text variants do not share the same normalized voice text for ${entry.key}.`);
      }
    }
    if (!selected.has(entry.key)) {
      selected.set(entry.key, Object.freeze({
        key: entry.key,
        text: entry.text,
        path: `/audio/en/${entry.key}-matilda.mp3`,
        owners: Object.freeze([...entry.owners]),
        expectedCandidateSha256: entry.candidateStatus?.[job.owner]?.fileExists
          ? entry.candidateStatus[job.owner].sha256
          : null,
      }));
    }
  }
  if (selected.size === 0) throw new Error(`Reviewed inventory contains no keys for ${jobName}.`);
  return [...selected.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export function assertJournalPath(providedPath, expectedPath) {
  if (!providedPath) throw new Error('Paid execution requires explicit --request-journal pointing to the shared journal.');
  if (resolve(providedPath) !== resolve(expectedPath)) {
    throw new Error(`Request journal must be the shared journal at ${resolve(expectedPath)}.`);
  }
  return resolve(providedPath);
}

export function producerLockPathForJournal(journalPath) {
  return resolve(dirname(journalPath), 'offline-voice-generator.lock');
}

export async function acquireProducerLock(journalPath, metadata) {
  const lockPath = producerLockPathForJournal(journalPath);
  await mkdir(dirname(lockPath), { recursive: true });
  const lock = await open(lockPath, 'wx').catch((error) => {
    if (error.code === 'EEXIST') throw new Error(`A voice producer lock exists at ${lockPath}; the shared journal is in use.`);
    throw error;
  });
  await lock.writeFile(`${JSON.stringify(metadata)}\n`);
  return { lock, path: lockPath };
}

export async function readRequestJournal(journalPath) {
  const journalInfo = await stat(journalPath).catch((error) => {
    throw new Error(`Cannot read the explicit shared request journal: ${error.message}`);
  });
  if (!journalInfo.isFile()) throw new Error('Shared request journal must be a regular file.');
  const bytes = await readFile(journalPath);
  const parsed = JSON.parse(bytes.toString('utf8'));
  const now = Date.now();
  if (!parsed || !Array.isArray(parsed.requests) || !Number.isSafeInteger(parsed.blockedUntil)
      || parsed.blockedUntil < 0 || parsed.blockedUntil > now + 60 * 60 * 1000) {
    throw new Error('Shared request journal has an invalid schema; refusing to treat it as empty.');
  }
  for (const request of parsed.requests) {
    if (!Number.isSafeInteger(request?.at) || request.at < 0 || request.at > now + 60_000) {
      throw new Error('Shared request journal has an invalid or future request timestamp.');
    }
  }
  return {
    requests: parsed.requests.filter((request) => now - request.at < RATE_WINDOW_MS),
    blockedUntil: parsed.blockedUntil,
    sourceSha256: sha256(bytes),
  };
}

export async function assertJournalSnapshot(journalPath, expectedSha256) {
  const currentSha256 = sha256(await readFile(journalPath));
  if (currentSha256 !== expectedSha256) {
    throw new Error('Shared request journal changed outside this run; stopping before the next request.');
  }
  return currentSha256;
}

export function availableCalls(journal, now = Date.now()) {
  if (journal.blockedUntil > now) return 0;
  return Math.max(0, REQUEST_LIMIT - journal.requests.filter((item) => now - item.at < RATE_WINDOW_MS).length);
}

export function assertTerminalPredecessorRecord(record, { expectedB4ManifestSha256, now = Date.now() }) {
  if (!record || record.workerPid !== B4_WORKER_PID) throw new Error(`Predecessor status must identify B4 worker PID ${B4_WORKER_PID}.`);
  if (record.sourceCommit !== B4_SOURCE_COMMIT) throw new Error('Predecessor status must identify the reviewed B4 source commit.');
  if (!['completed', 'failed', 'stopped_error'].includes(record.status) || record.terminal !== true || record.reconciled !== true) {
    throw new Error('B4 predecessor status must be terminal and reconciled after its final inventory pass.');
  }
  if (!Number.isInteger(record.exitCode) || !Number.isFinite(Date.parse(record.finishedAt)) || Date.parse(record.finishedAt) > now) {
    throw new Error('B4 predecessor status needs a completed timestamp and integer exit code.');
  }
  if (!/^[a-f0-9]{64}$/i.test(record.finalManifestSha256 || '') || record.finalManifestSha256 !== expectedB4ManifestSha256) {
    throw new Error('B4 predecessor status manifest SHA does not match the current reconciled B4 manifest.');
  }
  return true;
}

export async function assertPredecessorFinished(statusPath, expectedManifestPath, pidProbe = process.kill.bind(process)) {
  if (!statusPath) throw new Error('Paid execution requires explicit --predecessor-status from the terminal B4 run.');
  const record = JSON.parse(await readFile(statusPath, 'utf8'));
  const manifestPath = resolve(expectedManifestPath);
  if (resolve(record.finalManifestPath || '') !== manifestPath) {
    throw new Error(`Predecessor status must name the current B4 manifest path ${manifestPath}.`);
  }
  let isAlive = false;
  try { pidProbe(record.workerPid, 0); isAlive = true; }
  catch (error) { if (error.code !== 'ESRCH') throw new Error(`Cannot verify predecessor PID state: ${error.message}`); }
  if (isAlive) throw new Error(`B4 predecessor PID ${record.workerPid} is still live; refusing paid execution.`);
  const manifestBytes = await readFile(manifestPath);
  assertTerminalPredecessorRecord(record, { expectedB4ManifestSha256: sha256(manifestBytes) });
  return record;
}

export async function getCandidateReusablePath(root, manifest, item) {
  const packagedPath = manifest instanceof Map ? manifest.get(item.key) : manifest[item.key];
  for (const candidate of new Set([packagedPath, item.path].filter(Boolean))) {
    if (candidate !== item.path || !candidate.startsWith('/audio/en/') || candidate.includes('..')) continue;
    try {
      const filePath = resolve(root, 'public', candidate.slice(1));
      const info = await stat(filePath);
      if (!info.isFile() || info.size <= 1000 || !item.expectedCandidateSha256) continue;
      if (sha256(await readFile(filePath)) === item.expectedCandidateSha256) return candidate;
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return null;
}

export async function isCandidateReusable(root, manifest, item, receipt = null, expectedInventorySha256 = PINNED_INVENTORY_SHA256) {
  const receiptMatches = receipt
    && receipt.inventorySha256 === expectedInventorySha256
    && receipt.producer === 'reviewedNarrationSupervisorV1'
    && receipt.key === item.key
    && receipt.path === item.path
    && receipt.sourceCommit === (item.sourceCommit || null)
    && receipt.voice === 'matilda'
    && receipt.contentType === 'audio/mpeg'
    && Number.isSafeInteger(receipt.bytes) && receipt.bytes > 1000
    && receipt.textSha256 === sha256(Buffer.from(item.text, 'utf8'))
    && /^[a-f0-9]{64}$/.test(receipt.audioSha256 || '');
  if (receiptMatches) {
    try {
      const filePath = resolve(root, 'public', item.path.slice(1));
      const info = await stat(filePath);
      if (info.isFile() && info.size > 1000 && sha256(await readFile(filePath)) === receipt.audioSha256) return item.path;
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return getCandidateReusablePath(root, manifest, item);
}

export async function classifyB5SoundSafariGenerationWork(root, items, manifest, receipts, inventorySha256, attemptedKeys = []) {
  const allowedKeys = b5SoundSafariAllowedPendingKeys(items);
  const attempted = attemptedKeys instanceof Set ? attemptedKeys : new Set(attemptedKeys);
  for (const key of attempted) {
    if (!allowedKeys.has(key)) throw new Error(`B5 Sound Safari attempt key is outside the pinned pending-key set: ${key}.`);
  }
  const reusablePaths = new Map();
  const generationPending = [];
  const previouslyAttemptedMissing = [];
  for (const item of items) {
    const reusablePath = await isCandidateReusable(root, manifest, item, receipts.get(item.key), inventorySha256);
    if (reusablePath) reusablePaths.set(item.key, reusablePath);
    else if (attempted.has(item.key)) previouslyAttemptedMissing.push(item);
    else if (item.candidateAtSnapshotPending) generationPending.push(item);
    else throw new Error(`Pinned snapshot-ready B5 Sound Safari bytes are unavailable for ${item.key}; refusing unbudgeted generation.`);
  }
  return { reusablePaths, generationPending, previouslyAttemptedMissing };
}

export async function isPackagedCandidate(root, manifest, item, receipt = null, expectedInventorySha256 = PINNED_INVENTORY_SHA256) {
  const packagedPath = manifest instanceof Map ? manifest.get(item.key) : manifest[item.key];
  return Boolean(packagedPath && (await isCandidateReusable(root, manifest, item, receipt, expectedInventorySha256)) === packagedPath);
}

export async function requestNarration(item, fetchImpl = fetch, timeoutMs = MAX_REQUEST_TIMEOUT_MS) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > MAX_REQUEST_TIMEOUT_MS) {
    throw new Error(`Request timeout must be from 1 to ${MAX_REQUEST_TIMEOUT_MS} milliseconds.`);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error('Narration request timed out.')), timeoutMs);
  try {
    const response = await fetchImpl(VOICE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: VOICE_ORIGIN },
      body: JSON.stringify({ text: item.text, language: 'en' }),
      signal: controller.signal,
    });
    const bytes = Buffer.from(await response.arrayBuffer());
    return { response, bytes };
  } finally {
    clearTimeout(timeout);
  }
}
