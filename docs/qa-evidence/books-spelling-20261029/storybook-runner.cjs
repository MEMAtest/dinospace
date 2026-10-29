// Normal-control Storybook journey runner. The caller must supply the one
// already-leased page; this module does not start or navigate a browser.
// `continuation` begins at the library, checks reentry/profile/backup behavior,
// and deliberately skips the completed seven-book journey.
const createHarness = require('./storybook-native.cjs');

const BOOKS = [
  { slug: 'rex-missing-moon-map', title: 'Rex and the Missing Moon Map', pages: 10 },
  { slug: 'luna-whispering-forest', title: 'Luna and the Whispering Forest', pages: 10 },
  { slug: 'nia-great-river-journey', title: 'Nia’s Great River Journey', pages: 10 },
  { slug: 'bo-busy-bee-garden', title: 'Bo and the Busy Bee Garden', pages: 10 },
  { slug: 'sami-night-light-parade', title: 'Sami and the Night-Light Parade', pages: 10 },
  { slug: 'mina-mountain-seed', title: 'Mina’s Mountain Seed', pages: 10 },
  { slug: 'kai-lost-library-book', title: 'Kai and the Lost Library Book', pages: 10 },
];

// Test-side oracle from the authored story text and comprehension set. The
// harness still answers only through the visible page controls and first
// verifies the cited evidence phrase appeared in readable rendered pages.
const QUIZ_ORACLE = {
  'What had Rex lost?': ['His star map', 'star map'],
  'What clue did Pip spot?': ['A sparkly corner by a crater', 'sparkly corner'],
  'How did Rex and Pip get the map back?': ['They worked together', 'caught the paper corner'],
  'Where did the whisper lead the friends?': ['An old hollow tree', 'ancient hollow tree'],
  'What had trapped the wind sprite?': ['A heavy branch', 'heavy branch'],
  'What happened after the friends freed the sprite?': ['Flowers bloomed and leaves shimmered', 'flowers bloomed'],
  'What litter did Nia find by the river?': ['An old sack and empty bottles', 'old sack'],
  'Who would collect the litter?': ['The park rangers', 'park rangers'],
  'Why did Nia want to keep the river clean?': ['Many animals need its water', 'clean water keeps us all strong'],
  'What sweet drink did Bea sip?': ['Nectar', 'sipped nectar'],
  'How can pollen help some flowers?': ['It can help fruit begin to grow', 'make fruit'],
  'How did Bo stay safe while watching Bea?': ['Bo watched from the path', 'watched from the path'],
  'Why did Sami’s lantern grow dim?': ['A battery had slipped out of place', 'battery had slipped out of place'],
  'What did Tavi do above the grass?': ['Blink a small light', 'blink above the grass'],
  'What order did Sami remember?': ['Sunset, lanterns, stars, bedtime', 'sunset lanterns stars then bedtime'],
  'Where did Mina plant the seed?': ['In a little pot at the hut', 'little pot'],
  'What helps a seed begin to grow?': ['Water, air and warmth', 'water, air and warmth'],
  'How did Mina track the shoot’s growth?': ['She drew it in a notebook', 'drew its shape in a garden notebook'],
  'What was missing from Kai’s tote bag?': ['A library book', 'the book was missing'],
  'Who noticed the book by the shelter?': ['Noor', 'Noor was locking a red bicycle'],
  'What will help Kai carry the next book?': ['A zipped pocket', 'zipped pocket'],
};

const normalize = (value) => String(value || '').toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9]+/g, ' ').trim();
const digest = async (page, value) => page.evaluate(async (input) => {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}, String(value));

module.exports = async (page, options = {}) => {
  const {
    origin,
    expectedEntry,
    viewport = { width: 390, height: 740 },
    screenshotPath,
    playerId = 'amari',
    stage = 'native',
    runMode = 'preflight', // preflight | full | full-with-backup | continuation | continuation-restored | full-resume
    injectParentFault = true,
    skipReaderIdentityProbe = false,
    pipBackupJsonBase64 = '',
    pipBackupHash = '',
    skipBookSlugs = [],
    priorBooks = [],
    priorCurrentBook = null,
    priorInitialRewards = null,
    priorReportPath = '',
  } = options;
  delete page.__storybookNativePartial;
  delete page.__storybookNativeDetach;
  delete page.__storybookNativeDiagnostics;
  const harness = await createHarness(page, { origin, expectedEntry, viewport, screenshotPath });
  page.setDefaultTimeout(15000);
  const results = { origin: new URL(page.url()).origin, expectedEntry, viewport, playerId, runMode, books: runMode === 'full-resume' ? [...priorBooks] : [], probes: [], failures: [], initial: null };
  if (runMode === 'full-resume') {
    results.priorEvidence = {
      reportPath: priorReportPath,
      inheritedCompletedSlugs: priorBooks.map((book) => book.slug),
      inheritedPageCounts: priorBooks.map((book) => ({ slug: book.slug, count: book.pages?.length || 0 })),
      resumedBookSlug: priorCurrentBook?.slug || null,
      inheritedPageCount: priorCurrentBook?.pages?.length || 0,
      note: 'Prior completed book rows and partial current-book rows are carried forward from this exact source-bound report; no app state was seeded or rewritten.'
    };
  }
  const preservePartial = () => {
    page.__storybookNativePartial = results;
    page.__storybookNativeDetach = harness.detach;
    page.__storybookNativeDiagnostics = () => ({
      errors: { pageErrors: harness.pageErrors.slice(), consoleErrors: harness.consoleErrors.slice(), failedResponses: harness.failedResponses.slice(), failedRequests: harness.failedRequests.slice(), providerRequests: harness.providerRequests.slice() },
      mediaRequests: harness.mediaRequests.slice(),
    });
  };
  preservePartial();
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    harness.providerRequests.push(request.url());
    await route.fulfill({ status: 403, contentType: 'text/plain', body: 'Storybook QA provider guard' });
  });
  const primaryClick = async (locator, label, minSize = 44) => harness.click(locator, label, minSize);
  const browseClick = async (locator, label, minSize = 44) => {
    await locator.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'nearest' }));
    await harness.click(locator, label, minSize);
  };
  const fillSearch = async (_locator, value) => {
    const locator = page.getByRole('searchbox', { name: /Search included and saved stories/ });
    await locator.waitFor({ state: 'visible' });
    await locator.scrollIntoViewIfNeeded();
    await harness.assertControl(locator, 'story search');
    await locator.fill(value);
    await page.waitForTimeout(100);
  };
  const storyMain = () => page.locator('main.storybook-reader');
  const waitForReaderScreen = async (screenNumber) => {
    await page.waitForFunction((number) => {
      const main = document.querySelector('main.storybook-reader');
      if (!main) return false;
      const hasLabel = [...main.querySelectorAll('[aria-label]')].some((node) => node.getAttribute('aria-label') === `Page ${number} of 11`);
      const image = [...main.querySelectorAll('img')].find((node) => node.getBoundingClientRect().width > 0);
      return hasLabel && image?.complete && image.naturalWidth > 0;
    }, screenNumber, { timeout: 15000 });
    return harness.visibleReaderScreen();
  };
  const normalizeToCover = async (title) => {
    let screen = await harness.visibleReaderScreen();
    let number = Number(screen.pageLabel.match(/^Page (\d+) of 11$/)?.[1] || 0);
    while (number > 1) {
      await primaryClick(storyMain().getByRole('button', { name: 'Previous page', exact: true }), `return ${title} to its cover`);
      number -= 1;
      screen = await waitForReaderScreen(number);
    }
    if (number !== 1) throw new Error(`Could not navigate ${title} back to its cover; saw ${screen.pageLabel}`);
    return screen;
  };
  const activeChildId = async () => page.locator('label').filter({ hasText: 'Reading progress for' }).locator('select').first().inputValue().catch(() => 'amari');
  const progressState = async (childId, slug) => {
    const data = await page.evaluate(({ child, bookSlug }) => {
    const raw = localStorage.getItem('amari_storybook_progress_v1');
    const all = raw === null ? {} : JSON.parse(raw);
    const entry = all?.[child]?.[bookSlug] || {};
    let legacyMarker = null;
    try { legacyMarker = localStorage.getItem(`amari_storybook_complete_${bookSlug}`); } catch { /* report below */ }
    return {
      rawHash: raw === null ? null : raw,
      entry: {
        completed: entry.completed === true,
        favourite: entry.favourite === true,
        pageIndex: Number.isInteger(entry.pageIndex) ? entry.pageIndex : null,
        completionReceipt: entry.completionReceipt ? {
          id: entry.completionReceipt.id,
          points: entry.completionReceipt.points,
          rewardPlayerId: entry.completionReceipt.rewardPlayerId,
          version: entry.completionReceipt.version,
        } : null,
      },
      legacyMarker,
    };
    }, { child: childId, bookSlug: slug });
    return {
      rawHash: data.rawHash === null ? null : await digest(page, data.rawHash),
      entry: data.entry,
      legacyMarker: data.legacyMarker,
    };
  };
  const rewards = async () => {
    const record = await page.evaluate((outerPlayer) => {
    const raw = localStorage.getItem(`${outerPlayer}_rewards_v2`);
    const record = raw ? JSON.parse(raw) : {};
    return {
      rawHash: raw === null ? null : raw,
      points: Number(record.points) || 0,
      storybooksGames: Number(record.gamesPlayed?.storybooks) || 0,
      storybookClaims: Object.fromEntries(Object.entries(record.rewardClaims || {}).filter(([key]) => key.startsWith('storybooks:'))),
      nonStoryClaimsHash: Object.entries(record.rewardClaims || {}).filter(([key]) => !key.startsWith('storybooks:')).sort(([a], [b]) => a.localeCompare(b)),
    };
    }, playerId);
    return { ...record, rawHash: record.rawHash === null ? null : await digest(page, record.rawHash), nonStoryClaimsHash: await digest(page, JSON.stringify(record.nonStoryClaimsHash)) };
  };
  const progressHashSnapshot = async () => page.evaluate(async () => {
    const raw = localStorage.getItem('amari_storybook_progress_v1');
    if (raw === null) return { available: true, rows: [], rawHash: null };
    let parsed;
    try { parsed = JSON.parse(raw); } catch { return { available: false, rows: [], rawHash: null }; }
    const hash = async (text) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    const rows = [];
    for (const [child, books] of Object.entries(parsed)) for (const [slug, entry] of Object.entries(books || {})) rows.push({ childHash: await hash(child), slug, rowHash: await hash(JSON.stringify(entry)) });
    return { available: true, rows, rawHash: await hash(raw) };
  });
  const progressEntryHash = async (childId, slug) => page.evaluate(async ({ child, bookSlug }) => {
    const raw = localStorage.getItem('amari_storybook_progress_v1');
    const all = raw === null ? {} : JSON.parse(raw);
    const entry = all?.[child]?.[bookSlug];
    if (!entry) return null;
    const bytes = new TextEncoder().encode(JSON.stringify(entry));
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }, { child: childId, bookSlug: slug });
  const allCompletionReceipts = async () => page.evaluate(() => {
    const parsed = JSON.parse(localStorage.getItem('amari_storybook_progress_v1') || '{}');
    return Object.entries(parsed).flatMap(([readerChildId, books]) => Object.entries(books || []).flatMap(([slug, entry]) => entry?.completionReceipt ? [{ readerChildId, slug, receipt: entry.completionReceipt }] : []));
  });
  const addQuestionProbe = (row) => { results.probes.push(row); };

  // A prior interrupted QA click may leave the ordinary exit confirmation
  // over the library. Keep playing preserves the current reader session.
  const pendingExit = page.getByRole('dialog', { name: 'Leave the game?' });
  if (await pendingExit.count()) await primaryClick(pendingExit.getByRole('button', { name: 'Keep playing', exact: true }), 'dismiss a prior exit confirmation and keep the reader open');
  const hideParentTools = page.getByRole('button', { name: 'Hide parent tools', exact: true });
  if (await hideParentTools.count()) await browseClick(hideParentTools, 'collapse parent tools before library controls');

  const library = await harness.libraryInventory();
  const includedButton = page.getByRole('button', { name: /^Included \(7\)$/ });
  if (!await includedButton.count()) throw new Error(`Expected the separate seven-included inventory control: ${library.text}`);
  await browseClick(includedButton, 'reset library to all included and saved stories');
  const searchBox = page.getByRole('searchbox', { name: /Search included and saved stories/ });
  await fillSearch(searchBox, '');
  const resetLibrary = await harness.libraryInventory();
  if (!/7 included/.test(resetLibrary.text)) throw new Error(`Library no longer reports seven included stories separately: ${resetLibrary.text}`);
  const myStoriesControl = page.getByRole('button', { name: /^My stories \(/i });
  if (!await myStoriesControl.count()) throw new Error('The separate My stories shelf control is missing');
  const profileSelect = page.locator('label').filter({ hasText: 'Reading progress for' }).locator('select').first();
  await profileSelect.scrollIntoViewIfNeeded();
  await harness.assertControl(profileSelect, 'reading profile selector');
  const profileOptions = await profileSelect.locator('option').evaluateAll((options) => options.map((option) => ({ value: option.value, label: option.textContent.trim() })));
  const originalProfile = await profileSelect.inputValue();
  const originalProfileBytes = await page.evaluate(() => localStorage.getItem('amari_storybook_active_child_v1'));
  const alternateProfile = profileOptions.find((option) => option.value !== originalProfile);
  if (alternateProfile && originalProfileBytes !== null && originalProfileBytes !== '') {
    await profileSelect.selectOption(alternateProfile.value);
    await page.waitForFunction((value) => [...document.querySelectorAll('label')].find((label) => label.innerText.toLowerCase().includes('reading progress for'))?.querySelector('select')?.value === value, alternateProfile.value, { timeout: 5000 });
    await profileSelect.selectOption(originalProfile);
    await page.waitForFunction((value) => [...document.querySelectorAll('label')].find((label) => label.innerText.toLowerCase().includes('reading progress for'))?.querySelector('select')?.value === value, originalProfile, { timeout: 5000 });
    const switchedBack = await profileSelect.inputValue() === originalProfile;
    const profileBytesPreserved = await page.evaluate(() => localStorage.getItem('amari_storybook_active_child_v1')) === originalProfileBytes;
    if (!switchedBack || !profileBytesPreserved) throw new Error('Reader profile selector did not restore the existing active child exactly');
    results.probes.push({ kind: 'existing-reader-profile-switch', profileCount: profileOptions.length, switchedBack, profileBytesPreserved, alternateProfileHash: await digest(page, alternateProfile.value), alternateLabelHash: await digest(page, alternateProfile.label) });
  } else {
    results.probes.push({ kind: 'existing-reader-profile-switch', status: 'unavailable', profileCount: profileOptions.length, reason: profileOptions.length < 2 ? 'Only one existing reader profile is available; no profile was created.' : 'The current active-reader key was absent; skipped switching to preserve its exact prior state.' });
  }

  let readerIdentityProbe = null;
  if ((runMode === 'full' || runMode === 'full-with-backup' || runMode === 'continuation' || runMode === 'continuation-restored') && !skipReaderIdentityProbe) {
    readerIdentityProbe = { kind: 'blocked-active-reader-key', status: 'running', stage, createdQaReader: false };
    results.probes.push(readerIdentityProbe);
    preservePartial();
    const currentOptions = await profileSelect.locator('option').evaluateAll((options) => options.map((option) => ({ value: option.value, label: option.textContent.trim() })));
    let recoveryReader = currentOptions.find((option) => option.value !== 'amari' && /storybook qa reader/i.test(option.label))
      || currentOptions.find((option) => option.value !== 'amari');
    if (!recoveryReader && stage === 'native') {
      const parentTools = page.getByRole('button', { name: 'Parent tools', exact: true });
      if (await parentTools.getAttribute('aria-expanded') !== 'true') await browseClick(parentTools, 'open parent tools to create a synthetic QA reader');
      await browseClick(page.getByRole('button', { name: 'Edit children', exact: true }), 'open reader profiles');
      const dialog = page.getByRole('dialog', { name: 'Who is reading?' });
      await dialog.waitFor({ state: 'visible' });
      await primaryClick(dialog.getByRole('button', { name: 'Add child', exact: true }), 'add a named synthetic QA reader');
      const displayName = dialog.getByRole('textbox', { name: /display name$/ }).last();
      await displayName.fill('Storybook QA Reader');
      await primaryClick(dialog.getByRole('button', { name: 'Save profiles', exact: true }), 'save the synthetic QA reader profile');
      await dialog.waitFor({ state: 'hidden' });
      await profileSelect.waitFor({ state: 'visible' });
      const updatedOptions = await profileSelect.locator('option').evaluateAll((options) => options.map((option) => ({ value: option.value, label: option.textContent.trim() })));
      recoveryReader = updatedOptions.find((option) => option.value !== 'amari' && /storybook qa reader/i.test(option.label));
      if (!recoveryReader) throw new Error('The named synthetic QA reader was not saved through the profile controls');
      readerIdentityProbe.createdQaReader = true;
    }
    recoveryReader ||= currentOptions.find((option) => option.value === originalProfile) || currentOptions[0];
    if (!recoveryReader?.value) throw new Error('No visible saved reader was available for the blocked-key probe');
    readerIdentityProbe.readerIdHash = await digest(page, recoveryReader.value);
    readerIdentityProbe.readerCount = stage === 'native' && readerIdentityProbe.createdQaReader ? currentOptions.length + 1 : currentOptions.length;
    const selectedBeforeFault = await profileSelect.inputValue();
    if (selectedBeforeFault !== recoveryReader.value) {
      await harness.assertControl(profileSelect, 'choose synthetic reader for identity retry probe');
      await profileSelect.selectOption(recoveryReader.value);
      await page.waitForFunction((value) => [...document.querySelectorAll('label')].find((label) => label.innerText.toLowerCase().includes('reading progress for'))?.querySelector('select')?.value === value, recoveryReader.value, { timeout: 5000 });
    }
    const probeSlugs = BOOKS.map((book) => book.slug);
    const untouchedSlug = await page.evaluate(({ child, slugs }) => {
      let all = {};
      try { all = JSON.parse(localStorage.getItem('amari_storybook_progress_v1') || '{}'); } catch { return null; }
      return slugs.find((slug) => !Object.prototype.hasOwnProperty.call(all?.[child] || {}, slug)) || null;
    }, { child: recoveryReader.value, slugs: probeSlugs });
    const probeBook = BOOKS.find((book) => book.slug === untouchedSlug) || BOOKS[0];
    const activeBytesBefore = await page.evaluate(() => localStorage.getItem('amari_storybook_active_child_v1'));
    const progressBeforeBlocked = await progressHashSnapshot();
    await browseClick(page.getByRole('button', { name: 'Back to learning world', exact: true }), 'leave Storybook before the blocked-reader reload');
    const worldConfirmation = page.getByRole('button', { name: 'Back to world', exact: true });
    if (await worldConfirmation.count()) await primaryClick(worldConfirmation, 'confirm leaving Storybook for the learning world');
    try {
      // Back to learning world lands on home. Enter Read & Write, then open
      // Storybook Studio through its real catalogue card; matching either
      // label at once would stop at the world screen instead of the library.
      const readWriteWorld = page.locator('.discovery-world-card').filter({ hasText: 'Read & Write' }).first();
      if (await readWriteWorld.count()) await browseClick(readWriteWorld, 'reopen Read & Write world with a one-shot active-reader read fault');
      await page.getByRole('heading', { name: 'Read & Write', exact: true }).waitFor({ state: 'visible' });
      await page.evaluate(() => {
        const prototype = Storage.prototype;
        if (window.__storybookReaderKeyFaultV1) throw new Error('Reader-key fault is already installed');
        const get = prototype.getItem;
        const state = { key: 'amari_storybook_active_child_v1', active: true, calls: 0, get };
        prototype.getItem = function (name) {
          if (state.active && name === state.key) {
            state.active = false; state.calls += 1;
            throw new DOMException('Bounded Storybook reader-key QA fault', 'QuotaExceededError');
          }
          return get.call(this, name);
        };
        window.__storybookReaderKeyFaultV1 = state;
      });
      const storybookLauncher = page.locator('.catalogue-game-card').filter({ hasText: 'Storybook Studio' }).first();
      await storybookLauncher.waitFor({ state: 'visible' });
      await browseClick(storybookLauncher, 'reopen Storybook Studio with a one-shot active-reader read fault');
      await page.getByRole('status', { name: 'Story library inventory' }).waitFor({ state: 'visible' });
      const unavailableBanner = page.getByRole('status').filter({ hasText: 'saved reader selection could not be read' }).first();
      await unavailableBanner.waitFor({ state: 'visible' });
      await fillSearch(searchBox, probeBook.title);
      const probeCard = page.locator('section[aria-label="Storybook library"] article').filter({ hasText: probeBook.title }).first();
      await browseClick(probeCard.getByRole('button', { name: /Read story|Continue story/ }).first(), `open ${probeBook.title} in read-only reader mode`);
      await normalizeToCover(probeBook.title);
      const autoTurn = storyMain().getByRole('button', { name: /Auto-turn pages after narration/ });
      if (await autoTurn.getAttribute('aria-pressed') === 'true') await primaryClick(autoTurn, 'disable automatic page turning for reader-key probe');
      await primaryClick(storyMain().getByRole('button', { name: /^Start Reading$|^Start Again$/ }).first(), 'attempt reading while active-reader key is unavailable');
      await waitForReaderScreen(2);
      const blockedSaveNotice = page.getByRole('status').filter({ hasText: 'Reader identity could not be verified, so this change was not saved.' }).first();
      await blockedSaveNotice.waitFor({ state: 'visible' });
      const progressAfterBlocked = await progressHashSnapshot();
      const faultSnapshot = await page.evaluate(() => ({ calls: window.__storybookReaderKeyFaultV1?.calls || 0, active: window.__storybookReaderKeyFaultV1?.active || false, activeReaderId: localStorage.getItem('amari_storybook_active_child_v1') }));
      if (progressAfterBlocked.rawHash !== progressBeforeBlocked.rawHash || faultSnapshot.calls !== 1 || faultSnapshot.active || faultSnapshot.activeReaderId !== recoveryReader.value) {
        throw new Error('Read-only Storybook path changed the active reader or progress under a blocked identity read');
      }
      const retryReader = page.getByRole('button', { name: 'Retry reader check', exact: true }).first();
      await primaryClick(retryReader, 'retry the active-reader check');
      await primaryClick(storyMain().getByRole('button', { name: 'Back to storybooks', exact: true }), 'return after active-reader recovery');
      await page.waitForFunction((value) => [...document.querySelectorAll('label')].find((label) => label.innerText.toLowerCase().includes('reading progress for'))?.querySelector('select')?.value === value, recoveryReader.value, { timeout: 5000 });
      readerIdentityProbe.recoveredSelectedReader = await profileSelect.inputValue() === recoveryReader.value;
      if (!readerIdentityProbe.recoveredSelectedReader) throw new Error('Retry did not restore the stored reader in the visible selector');
      let writeProof = { status: untouchedSlug ? 'pending' : 'unavailable', reason: untouchedSlug ? undefined : 'All included books already have saved rows for this reader.' };
      if (untouchedSlug) {
        const freshCard = page.locator('section[aria-label="Storybook library"] article').filter({ hasText: probeBook.title }).first();
        await browseClick(freshCard.getByRole('button', { name: /Read story|Continue story/ }).first(), `reopen untouched ${probeBook.title} after reader recovery`);
        await normalizeToCover(probeBook.title);
        const freshAutoTurn = storyMain().getByRole('button', { name: /Auto-turn pages after narration/ });
        if (await freshAutoTurn.getAttribute('aria-pressed') === 'true') await primaryClick(freshAutoTurn, 'disable automatic page turning for verified reader check');
        const amariRowBefore = recoveryReader.value === 'amari' ? null : await progressEntryHash('amari', probeBook.slug);
        await primaryClick(storyMain().getByRole('button', { name: /^Start Reading$|^Start Again$/ }).first(), 'save a page under the explicitly verified reader');
        await waitForReaderScreen(2);
        await primaryClick(storyMain().getByRole('button', { name: 'Next page', exact: true }), 'save another page under the verified reader');
        await waitForReaderScreen(3);
        const savedCorrectly = await page.evaluate(({ child, slug }) => {
          const data = JSON.parse(localStorage.getItem('amari_storybook_progress_v1') || '{}');
          return { correctReaderRow: Number.isInteger(data?.[child]?.[slug]?.pageIndex), pageIndex: data?.[child]?.[slug]?.pageIndex ?? null };
        }, { child: recoveryReader.value, slug: probeBook.slug });
        const amariRowAfter = await progressEntryHash('amari', probeBook.slug);
        if (!savedCorrectly.correctReaderRow || savedCorrectly.pageIndex !== 1 || (amariRowBefore !== null && amariRowBefore !== amariRowAfter)) {
          throw new Error('Verified-reader bookmark was not isolated to the selected reader');
        }
        writeProof = { status: 'passed', pageIndex: savedCorrectly.pageIndex, amariRowPreserved: true, slug: probeBook.slug };
        await primaryClick(storyMain().getByRole('button', { name: 'Back to storybooks', exact: true }), 'leave verified-reader write probe');
      }
      if (originalProfile && originalProfile !== recoveryReader.value) {
        await harness.assertControl(profileSelect, 'restore original reader after identity probe');
        await profileSelect.selectOption(originalProfile);
        await page.waitForFunction((value) => [...document.querySelectorAll('label')].find((label) => label.innerText.toLowerCase().includes('reading progress for'))?.querySelector('select')?.value === value, originalProfile, { timeout: 5000 });
      }
      readerIdentityProbe.status = 'passed';
      readerIdentityProbe.blockedProgressUnchanged = true;
      readerIdentityProbe.readerKeyUnchangedWhileBlocked = true;
      readerIdentityProbe.writeProof = writeProof;
      readerIdentityProbe.restoredOriginalSelection = await profileSelect.inputValue() === originalProfile;
    } catch (error) {
      readerIdentityProbe.status = 'failed';
      readerIdentityProbe.error = String(error?.message || error);
      throw error;
    } finally {
      await page.evaluate(() => {
        const state = window.__storybookReaderKeyFaultV1;
        if (state) Storage.prototype.getItem = state.get;
        delete window.__storybookReaderKeyFaultV1;
      }).catch(() => {});
      preservePartial();
    }
  }
  if ((runMode === 'full' || runMode === 'full-with-backup') && skipReaderIdentityProbe) {
    results.probes.push({ kind: 'blocked-active-reader-key', status: 'deferred', reason: 'Isolated after the primary book journey to avoid repeating an inconclusive harness setup.' });
  }
  results.initial = { identity: harness.identity, inventory: resetLibrary, visibleCardCount: resetLibrary.visibleCardCount, storage: await harness.storageInventory(), originalStorage: harness.initialStorage, progress: await progressHashSnapshot(), rewards: await rewards() };
  preservePartial();

  // Preflight is deliberately small and non-rewarding: prove viewport geometry
  // and the first actual reader screen before a long 70-page journey.
  if (runMode === 'preflight') {
    const first = BOOKS[0];
    await fillSearch(searchBox, first.title);
    const card = page.locator('section[aria-label="Storybook library"] article').filter({ hasText: first.title }).first();
    const action = card.getByRole('button', { name: /Read story|Continue story/ }).first();
    await browseClick(action, `open ${first.title}`);
    const cover = await normalizeToCover(first.title);
    const autoTurn = storyMain().getByRole('button', { name: /Auto-turn pages after narration/ });
    if (await autoTurn.getAttribute('aria-pressed') === 'true') await primaryClick(autoTurn, 'disable automatic page turning');
    const start = storyMain().getByRole('button', { name: /^Start Reading$|^Start Again$/ }).first();
    await primaryClick(start, 'start first story');
    const firstPage = await waitForReaderScreen(2);
    const next = storyMain().getByRole('button', { name: 'Next page', exact: true });
    await harness.assertControl(next, 'next page');
    await harness.capture();
    const row = { kind: 'phone-or-desktop-reader-preflight', title: first.title, cover, firstPage, nextPageGeometry: true };
    results.probes.push(row);
    preservePartial();
    results.final = await harness.finish();
    await harness.assertNoErrors();
    results.passed = results.final.errors.pageErrors.length === 0
      && results.final.errors.consoleErrors.length === 0
      && results.final.errors.failedResponses.length === 0
      && results.final.errors.failedRequests.length === 0
      && results.probes.some((probe) => probe.kind === 'phone-or-desktop-reader-preflight' && probe.nextPageGeometry);
    return results;
  }

  if (!['full', 'full-with-backup', 'continuation', 'continuation-restored', 'full-resume'].includes(runMode)) throw new Error(`Unsupported runMode ${runMode}`);

  // Search through visible metadata, restore the full shelf, then fault-test a
  // visible favourite without changing its initial semantic value.
  const search = searchBox;
  await fillSearch(search, 'Rex and the Missing Moon Map');
  await page.waitForTimeout(150);
  const rexHits = await page.locator('section[aria-label="Storybook library"] article').count();
  if (rexHits !== 1) throw new Error(`Search should yield one visible Rex card; got ${rexHits}`);
  await fillSearch(search, '');
  const selectedChild = await activeChildId();
  const selectedChildHash = await digest(page, selectedChild);
  if (runMode === 'full-resume' && priorCurrentBook?.slug === 'sami-night-light-parade'
    && priorCurrentBook.stage === 'question-3' && priorCurrentBook.pages?.length === 10 && priorCurrentBook.questions?.length === 3) {
    const completedState = await progressState(selectedChild, priorCurrentBook.slug);
    const currentRewards = await rewards();
    const receipt = completedState.entry?.completionReceipt || null;
    const token = receipt ? `storybooks:${receipt.id}` : null;
    const receiptOwner = receipt ? (receipt.rewardPlayerId || selectedChild) : null;
    if (completedState.entry?.completed === true && receipt && receiptOwner === playerId
      && Object.prototype.hasOwnProperty.call(currentRewards.storybookClaims || {}, token)) {
      const beforePoints = Number(priorInitialRewards?.points);
      const beforeGames = Number(priorInitialRewards?.storybooksGames);
      const pointsDelta = Number.isFinite(beforePoints) ? currentRewards.points - beforePoints : null;
      const gamesDelta = Number.isFinite(beforeGames) ? currentRewards.storybooksGames - beforeGames : null;
      const recoveredRow = {
        title: priorCurrentBook.title,
        slug: priorCurrentBook.slug,
        cover: priorCurrentBook.cover,
        pages: priorCurrentBook.pages,
        narrationStarted: priorCurrentBook.pages.some((row) => row.played === true),
        resumeProved: true,
        resumeSourceScan: priorCurrentBook.resumeSourceScan || [],
        questions: priorCurrentBook.questions,
        initialCompleted: false,
        parentFault: false,
        receipt: { id: receipt.id, rewardPlayerId: receipt.rewardPlayerId, points: receipt.points },
        rewardTokenClaimCount: 1,
        rewardPointsDelta: pointsDelta,
        rewardGamesDelta: gamesDelta,
        recoveredAfterHarnessError: true,
      };
      if (!results.books.some((book) => book.slug === recoveredRow.slug)) results.books.push(recoveredRow);
      if (!skipBookSlugs.includes(recoveredRow.slug)) skipBookSlugs.push(recoveredRow.slug);
      results.priorEvidence.completedResumedBook = {
        slug: recoveredRow.slug,
        visibleProgressCompleted: true,
        stableReceiptClaimPresent: true,
        receiptOwner,
        pointsDeltaSinceSourcePartial: pointsDelta,
        storybooksGameDeltaSinceSourcePartial: gamesDelta,
        recoveredAfterHarnessError: true,
      };
      preservePartial();
    }
  }
  if (!options.skipLocalProgressFault) {
    const rexCard = page.locator('section[aria-label="Storybook library"] article').filter({ hasText: BOOKS[0].title }).first();
    const fav = rexCard.getByRole('button', { name: /^(Add|Remove) favourite$/ });
    const initialFavourite = await fav.getAttribute('aria-pressed') === 'true';
    const expectedFavourite = !initialFavourite;
    const localKey = 'amari_storybook_progress_v1';
    const faultBeforeRows = await progressHashSnapshot();
    const faultMode = options.localFaultMode || 'write';
    await harness.withStorageFault(localKey, faultMode, async () => browseClick(fav, 'toggle favourite with bounded local-save fault'));
    await page.getByRole('button', { name: 'Retry saved progress', exact: true }).waitFor({ state: 'visible' });
    const failedFavouritePressed = await rexCard.getByRole('button', { name: /^(Add|Remove) favourite$/ }).getAttribute('aria-pressed') === 'true';
    if (failedFavouritePressed !== initialFavourite) throw new Error('Favourite UI claimed a local write that had not yet been retried');
    const faultRow = await progressHashSnapshot();
    await primaryClick(page.getByRole('button', { name: 'Retry saved progress', exact: true }), 'retry favourite save');
    await page.waitForFunction(({ selector, wanted }) => document.querySelector(selector)?.getAttribute('aria-pressed') === String(wanted), { selector: 'section[aria-label="Storybook library"] article button[aria-label$="favourite"]', wanted: expectedFavourite }, { timeout: 5000 }).catch(() => {});
    const retriedFavourite = await rexCard.getByRole('button', { name: /^(Add|Remove) favourite$/ }).getAttribute('aria-pressed') === 'true';
    if (retriedFavourite !== expectedFavourite) throw new Error('Favourite did not recover after the visible Retry');
    await browseClick(rexCard.getByRole('button', { name: /^(Add|Remove) favourite$/ }), 'restore original favourite value');
    const faultAfterRows = await progressHashSnapshot();
    const restoredFavourite = await rexCard.getByRole('button', { name: /^(Add|Remove) favourite$/ }).getAttribute('aria-pressed') === 'true';
    if (restoredFavourite !== initialFavourite) throw new Error('Favourite probe did not restore its original semantic value');
    const unrelatedBefore = faultBeforeRows.rows.filter((row) => !(row.slug === BOOKS[0].slug && row.childHash === selectedChildHash));
    const unrelatedAfter = faultAfterRows.rows.filter((row) => !(row.slug === BOOKS[0].slug && row.childHash === selectedChildHash));
    if (JSON.stringify(unrelatedBefore) !== JSON.stringify(unrelatedAfter)) throw new Error('Favourite retry changed unrelated child/book progress rows');
    addQuestionProbe({ kind: 'local-progress-fault-retry', mode: faultMode, failedUIWasHeld: !failedFavouritePressed, retryRestoredValue: retriedFavourite, unrelatedRowsPreserved: true, fault: harness.storageFaultReport(), intermediateProgress: faultRow });
  } else {
    addQuestionProbe({ kind: 'local-progress-fault-retry', status: 'deferred', reason: 'Already exercised at the phone viewport; desktop run concentrates on the full shelf and reader journey.' });
  }
  preservePartial();

  let parentFaultUsed = false;
  const searchAgain = searchBox;
  if (runMode !== 'continuation' && runMode !== 'continuation-restored') for (const [bookIndex, book] of BOOKS.entries()) {
    if (runMode === 'full-resume' && skipBookSlugs.includes(book.slug)) continue;
    const resumeThisBook = runMode === 'full-resume' && priorCurrentBook?.slug === book.slug;
    const currentBook = resumeThisBook
      ? { ...priorCurrentBook, pages: [...(priorCurrentBook.pages || [])], questions: [...(priorCurrentBook.questions || [])], stage: 'resuming-bookmark' }
      : { title: book.title, slug: book.slug, pages: [], questions: [], stage: 'opening' };
    results.currentBook = currentBook;
    preservePartial();
    const beforeProgress = await progressState(selectedChild, book.slug);
    const beforeRewards = await rewards();
    const firstReceipt = beforeProgress.entry.completionReceipt;
    const preCompleted = beforeProgress.entry.completed === true || (selectedChild === 'amari' && beforeProgress.legacyMarker === '1');
    const canEarn = !firstReceipt && !preCompleted;
    const firstReceiptToken = firstReceipt ? `storybooks:${firstReceipt.id}` : null;
    const expectedReceiptRecovery = Boolean(firstReceipt
      && (firstReceipt.rewardPlayerId || selectedChild) === playerId
      && beforeRewards.storybookClaims[firstReceiptToken] === undefined);
    await fillSearch(search, book.title);
    const matching = page.locator('section[aria-label="Storybook library"] article').filter({ hasText: book.title });
    if (await matching.count() !== 1) throw new Error(`Visible search should resolve exactly one card for ${book.title}`);
    const card = matching.first();
    const openButton = card.getByRole('button', { name: /Read story|Continue story/ }).first();
    await browseClick(openButton, `open ${book.title}`);
    const cover = resumeThisBook ? priorCurrentBook.cover : await normalizeToCover(book.title);
    currentBook.cover = cover;
    currentBook.stage = 'cover';
    preservePartial();
    const coverPath = `/storybooks/${book.slug}/cover.webp`;
    if (!cover.image?.complete || cover.image.naturalWidth <= 0 || !new URL(cover.image.src).pathname.endsWith(coverPath)) throw new Error(`Cover image is not the expected decoded asset for ${book.title}: ${JSON.stringify(cover.image)}`);
    if (!cover.audio?.src || !new URL(cover.audio.src).pathname.endsWith(`/storybooks/${book.slug}/audio-cover.mp3`)) throw new Error(`Cover narration source mismatch for ${book.title}: ${JSON.stringify(cover.audio)}`);

    let screen;
    let screenNumber;
    let storyText = [];
    const pageRows = resumeThisBook ? [...(priorCurrentBook.pages || [])] : [];
    let pageIndexStart = 1;
    let playedOneClip = pageRows.some((row) => row.played === true);
    let resumeProved = false;
    let resumeSourceScan = [];
    if (resumeThisBook) {
      screen = await harness.visibleReaderScreen();
      screenNumber = Number(screen.pageLabel.match(/^Page (\d+) of (\d+)$/)?.[1] || 0);
      pageIndexStart = screenNumber - 1;
      if (screen.heading !== book.title || screenNumber < 3 || screenNumber > book.pages + 1
        || pageIndexStart !== pageRows.length + 1) {
        throw new Error(`The normal Continue story action did not reopen the expected saved bookmark for ${book.title}: ${JSON.stringify({ heading: screen.heading, pageLabel: screen.pageLabel, inheritedPages: pageRows.length })}`);
      }
      const scannedText = new Map();
      let scanScreen = screen;
      let scanNo = screenNumber;
      scannedText.set(scanNo, scanScreen.text);
      while (scanNo > 2) {
        const targetScreenNo = scanNo - 1;
        await primaryClick(storyMain().getByRole('button', { name: 'Previous page', exact: true }), `verify saved ${book.title} story text with Previous`);
        const targetPageIndex = targetScreenNo - 1;
        const expectedBackImage = `/storybooks/${book.slug}/page-${String(targetPageIndex).padStart(2, '0')}.webp`;
        await page.waitForFunction((expectedPath) => {
          const image = document.querySelector('main.storybook-reader img');
          return Boolean(image && image.complete && image.naturalWidth > 0
            && new URL(image.currentSrc || image.src).pathname.endsWith(expectedPath));
        }, expectedBackImage, { timeout: 20000 }).catch((error) => { throw new Error(`Previous did not decode expected ${book.title} image ${expectedBackImage}: ${error.message}`); });
        scanScreen = await harness.visibleReaderScreen();
        scanNo = Number(scanScreen.pageLabel.match(/^Page (\d+) of (\d+)$/)?.[1] || 0);
        if (scanNo < 2 || scanNo >= screenNumber) throw new Error(`Previous did not expose earlier ${book.title} page text: ${scanScreen.pageLabel}`);
        scannedText.set(scanNo, scanScreen.text);
      }
      resumeSourceScan.push({ pageLabel: scanScreen.pageLabel, method: 'visible Previous control' });
      while (scanNo < screenNumber) {
        await primaryClick(storyMain().getByRole('button', { name: 'Next page', exact: true }), `return to saved ${book.title} bookmark with Next`);
        scanScreen = await harness.visibleReaderScreen();
        const nextScanNo = Number(scanScreen.pageLabel.match(/^Page (\d+) of (\d+)$/)?.[1] || 0);
        if (nextScanNo !== scanNo + 1) throw new Error(`Next did not advance exactly one page while validating ${book.title}: ${scanScreen.pageLabel}`);
        scanNo = nextScanNo;
        const scannedPageNo = scanNo - 1;
        const expectedImage = `/storybooks/${book.slug}/page-${String(scannedPageNo).padStart(2, '0')}.webp`;
        const expectedAudio = `/storybooks/${book.slug}/audio-page-${String(scannedPageNo).padStart(2, '0')}.mp3`;
        if (scanNo < 2 || scanNo > screenNumber || !scanScreen.image?.complete || scanScreen.image.naturalWidth < 1
          || !new URL(scanScreen.image.src).pathname.endsWith(expectedImage)
          || !scanScreen.audio?.src || !new URL(scanScreen.audio.src).pathname.endsWith(expectedAudio)) {
          throw new Error(`Saved-bookmark source scan mismatch for ${book.title} ${scanScreen.pageLabel}: ${JSON.stringify(scanScreen)}`);
        }
        scannedText.set(scanNo, scanScreen.text);
        resumeSourceScan.push({ pageLabel: scanScreen.pageLabel, imagePath: expectedImage, imageDecoded: true, audioPath: expectedAudio, audioReadyState: scanScreen.audio.readyState });
      }
      storyText = Array.from({ length: book.pages }, (_, index) => scannedText.get(index + 2) || '').filter(Boolean);
      if (storyText.length !== pageIndexStart) throw new Error(`Saved-bookmark source scan did not expose all ${pageIndexStart} pages through the current ${book.title} bookmark`);
      screen = scanScreen;
      screenNumber = Number(screen.pageLabel.match(/^Page (\d+) of (\d+)$/)?.[1] || 0);
      resumeProved = true;
      currentBook.resumeSourceScan = resumeSourceScan;
    } else {
      const autoTurn = storyMain().getByRole('button', { name: /Auto-turn pages after narration/ });
      if (await autoTurn.count() && await autoTurn.getAttribute('aria-pressed') === 'true') await primaryClick(autoTurn, 'disable automatic page turning');
      const start = storyMain().getByRole('button', { name: /^Start Reading$|^Start Again$/ }).first();
      await primaryClick(start, `start ${book.title}`);
      screen = await waitForReaderScreen(2);
      screenNumber = Number(screen.pageLabel.match(/^Page (\d+) of (\d+)$/)?.[1] || 0);
      if (screenNumber !== 2) throw new Error(`Starting ${book.title} did not enter page 1: ${screen.pageLabel}`);
    }
    let longestVisibleScreen = 0;
    for (let pageIndex = pageIndexStart; pageIndex <= book.pages; pageIndex += 1) {
      const expectedBeforeRead = `/storybooks/${book.slug}/page-${String(pageIndex).padStart(2, '0')}.webp`;
      await page.waitForFunction((expectedPath) => {
        const image = document.querySelector('main.storybook-reader img');
        return Boolean(image && image.complete && image.naturalWidth > 0
          && new URL(image.currentSrc || image.src).pathname.endsWith(expectedPath));
      }, expectedBeforeRead, { timeout: 20000 }).catch((error) => { throw new Error(`Expected decoded ${book.title} image ${expectedBeforeRead} did not settle: ${error.message}`); });
      screen = await harness.visibleReaderScreen();
      const pageLabelMatch = screen.pageLabel.match(/^Page (\d+) of (\d+)$/);
      const screenNo = Number(pageLabelMatch?.[1] || 0);
      const pageNo = screenNo - 1;
      const imagePath = `/storybooks/${book.slug}/page-${String(pageNo).padStart(2, '0')}.webp`;
      const audioPath = `/storybooks/${book.slug}/audio-page-${String(pageNo).padStart(2, '0')}.mp3`;
      if (pageNo !== pageIndex || !screen.image?.complete || screen.image.naturalWidth <= 0 || !new URL(screen.image.src).pathname.endsWith(imagePath)) {
        throw new Error(`Page image/position mismatch for ${book.title} page ${pageIndex}: ${JSON.stringify(screen)}`);
      }
      if (!screen.audio?.src || !new URL(screen.audio.src).pathname.endsWith(audioPath)) throw new Error(`Page narration source mismatch for ${book.title} page ${pageIndex}: ${JSON.stringify(screen.audio)}`);
      await page.waitForFunction(() => {
        const audio = document.querySelector('main.storybook-reader audio');
        return Boolean(audio && (audio.readyState >= 1 || audio.error));
      }, null, { timeout: 5000 }).catch(() => {});
      const mediaReady = await storyMain().locator('audio').evaluate((audio) => ({ readyState: audio.readyState, error: audio.error?.code || null }));
      if (mediaReady.error || mediaReady.readyState < 1) throw new Error(`Exact page narration did not load for ${book.title} page ${pageIndex}: ${JSON.stringify(mediaReady)}`);
      storyText.push(normalize(screen.text));
      if (screen.text.length > longestVisibleScreen) {
        longestVisibleScreen = screen.text.length;
        await harness.capture();
      }
      const next = storyMain().getByRole('button', { name: 'Next page', exact: true });
      if (pageIndex < book.pages) await harness.assertControl(next, `next ${book.title} page ${pageIndex}`);
      const pageRow = { pageIndex, screenNo, imagePath, imageDecoded: screen.image.naturalWidth > 0, audioPath, audioReadyState: mediaReady.readyState, screenAudioReadyStateBeforeWait: screen.audio.readyState, audioError: mediaReady.error, imageDimensions: [screen.image.naturalWidth, screen.image.naturalHeight] };
      pageRows.push(pageRow);
      currentBook.pages = pageRows;
      currentBook.stage = `page-${pageIndex}`;
      preservePartial();

      if (!playedOneClip) {
        const audioButton = storyMain().getByRole('button', { name: /^(Hear page|Play narration)$/ }).first();
        if (!await audioButton.count()) throw new Error(`No visible packaged narration control on ${book.title} page ${pageIndex}`);
        const started = await harness.startVisibleAudio(audioButton);
        const event = started.find((item) => item.type === 'playing' || item.type === 'timeupdate');
        if (!event) throw new Error(`Narration did not actually start for ${book.title}`);
        if (bookIndex === 0) {
          const mute = page.getByRole('button', { name: 'Turn sound off', exact: true });
          await primaryClick(mute, 'mute narration');
          const muted = await storyMain().locator('audio').evaluate((audio) => audio.volume === 0);
          if (!muted) throw new Error('Sound toggle did not mute the reader audio');
          const pause = storyMain().getByRole('button', { name: 'Pause narration', exact: true });
          if (await pause.count()) await primaryClick(pause, 'pause muted narration');
          const turnSoundOn = page.getByRole('button', { name: 'Turn sound on', exact: true });
          await primaryClick(turnSoundOn, 'restore sound setting');
        } else {
          const pause = storyMain().getByRole('button', { name: 'Pause narration', exact: true });
          if (await pause.count()) await primaryClick(pause, `pause ${book.title} narration`);
        }
        playedOneClip = true;
        pageRow.played = true;
      }

      // Reopen one in-progress story through normal controls and prove its
      // saved page, then return to the same visible screen and continue.
      if (!resumeProved && !preCompleted && bookIndex === 0 && pageIndex === 3) {
        await primaryClick(page.getByRole('button', { name: 'Back to storybooks', exact: true }), 'leave mid-story');
        const resumeCard = page.locator('section[aria-label="Storybook library"] article').filter({ hasText: book.title }).first();
        await browseClick(resumeCard.getByRole('button', { name: /Continue story/ }), 'reopen saved story');
        const resumed = await harness.visibleReaderScreen();
        if (resumed.pageLabel !== 'Page 4 of 11') throw new Error(`Story did not resume at saved page 3: ${resumed.pageLabel}`);
        resumeProved = true;
        screen = resumed;
      }

      if (pageIndex < book.pages) {
        await primaryClick(next, `next ${book.title} page ${pageIndex}`);
      }
    }

    const lastButton = storyMain().getByRole('button', { name: /^(Start story questions|Finish story)$/ }).first();
    await harness.assertControl(lastButton, `${book.title} final action`);
    let parentFault = false;
    if (injectParentFault && !parentFaultUsed && canEarn) {
      const beforeFail = await rewards();
      await harness.withStorageFault(`${playerId}_rewards_v2`, 'write', async () => lastButton.click());
      parentFaultUsed = true;
      parentFault = true;
      const retryFinish = page.getByRole('button', { name: 'Retry finish', exact: true });
      await retryFinish.waitFor({ state: 'visible' });
      await harness.assertControl(retryFinish, 'retry finish after parent reward fault');
      const afterFailedClaim = await rewards();
      if (afterFailedClaim.points !== beforeFail.points || afterFailedClaim.storybooksGames !== beforeFail.storybooksGames) throw new Error('Parent reward changed despite a failed write');
      await primaryClick(retryFinish, 'retry parent reward claim');
      // Retry finish confirms the durable completion receipt. The visible
      // final-page action still advances into the comprehension questions.
      const continueToQuestions = storyMain().getByRole('button', { name: 'Start story questions', exact: true });
      if (await continueToQuestions.count()) await primaryClick(continueToQuestions, 'continue to story questions after saved finish retry');
    } else {
      await primaryClick(lastButton, `${book.title} finish and open questions`);
    }

    const questionRows = [];
    for (let questionIndex = 0; questionIndex < 3; questionIndex += 1) {
      const quiz = page.locator('main.storybook-reader');
      const prompt = (await quiz.locator('h1').innerText()).trim();
      const oracle = QUIZ_ORACLE[prompt];
      if (!oracle) throw new Error(`No authored test oracle for visible prompt: ${prompt}`);
      const [answer, evidencePhrase] = oracle;
      if (!storyText.some((text) => text.includes(normalize(evidencePhrase)))) throw new Error(`Visible story pages did not contain test-evidence phrase “${evidencePhrase}” for ${prompt}`);
      const buttonRows = await quiz.locator('button').evaluateAll((buttons) => buttons.map((button) => ({ text: button.innerText.trim(), label: button.getAttribute('aria-label') || '' })));
      const visibleChoices = buttonRows.filter((row) => row.text && !/back to stories|hear question|turn sound/i.test(row.text + row.label)).map((row) => row.text);
      if (!visibleChoices.some((choice) => normalize(choice) === normalize(answer))) throw new Error(`Correct choice is not visible for ${prompt}`);
      const wrong = visibleChoices.find((choice) => normalize(choice) !== normalize(answer));
      let wrongHeld = false;
      if (bookIndex === 0 && questionIndex === 0) {
        const wrongChoice = quiz.getByRole('button', { name: wrong, exact: true });
        await primaryClick(wrongChoice, 'wrong quiz answer');
        const clue = await quiz.getByRole('status').innerText();
        const retry = quiz.getByRole('button', { name: 'Try again', exact: true });
        await retry.waitFor({ state: 'visible' });
        if ((await quiz.locator('h1').innerText()).trim() !== prompt || !clue.trim()) throw new Error('Wrong quiz answer did not hold the same question and useful clue');
        await primaryClick(retry, 'retry held quiz question');
        wrongHeld = true;
      }
      const correct = quiz.getByRole('button', { name: answer, exact: true });
      await primaryClick(correct, 'visible story answer');
      const explanation = (await quiz.getByRole('status').innerText()).trim();
      const advanceName = questionIndex === 2 ? 'Finish' : 'Next clue';
      const advance = quiz.getByRole('button', { name: advanceName, exact: true });
      await harness.assertControl(advance, 'held quiz explanation advance');
      if (!explanation) throw new Error(`Correct answer explanation was not held for ${prompt}`);
      questionRows.push({ questionIndex, prompt, answer, evidencePhrase, wrongHeld, explanationHash: await digest(page, explanation), choices: await Promise.all(visibleChoices.map((choice) => digest(page, choice))) });
      currentBook.questions = questionRows;
      currentBook.stage = `question-${questionIndex + 1}`;
      preservePartial();
      await primaryClick(advance, `advance quiz ${questionIndex + 1}`);
    }

    const afterProgress = await progressState(selectedChild, book.slug);
    const afterRewards = await rewards();
    const receipt = afterProgress.entry.completionReceipt || null;
    const rewardToken = receipt ? `storybooks:${receipt.id}` : null;
    const pointsDelta = afterRewards.points - beforeRewards.points;
    const gamesDelta = afterRewards.storybooksGames - beforeRewards.storybooksGames;
    if ((parentFault || canEarn || expectedReceiptRecovery) && receipt
      && (receipt.rewardPlayerId || selectedChild) === playerId) {
      if (!receipt || (receipt.rewardPlayerId || selectedChild) !== playerId || afterRewards.storybookClaims[rewardToken] === undefined || gamesDelta !== 1 || pointsDelta <= 0) {
        throw new Error(`Parent reward retry did not commit the same player-bound receipt once: ${JSON.stringify({ receipt, pointsDelta, gamesDelta })}`);
      }
    } else if ((preCompleted || firstReceipt) && !expectedReceiptRecovery && (pointsDelta !== 0 || gamesDelta !== 0)) {
      throw new Error(`Replay/legacy completion farmed a Storybook reward for ${book.title}`);
    }
    const receiptOwner = receipt ? (receipt.rewardPlayerId || selectedChild) : null;
    if (receipt && receiptOwner !== playerId && (pointsDelta !== 0 || gamesDelta !== 0)) throw new Error(`Receipt crossed outer-player boundary for ${book.title}`);
    if (receipt && receiptOwner !== playerId) results.probes.push({ kind: 'cross-player-receipt', title: book.title, readerChildId: selectedChild, originalRewardPlayerId: receiptOwner, currentPlayerId: playerId, rewardPointsDelta: pointsDelta, rewardGamesDelta: gamesDelta, readingContinued: true });
    results.books.push({ title: book.title, slug: book.slug, cover, pages: pageRows, narrationStarted: playedOneClip, resumeProved, ...(resumeThisBook ? { resumeSourceScan } : {}), questions: questionRows, initialCompleted: preCompleted, parentFault, receipt: receipt ? { id: receipt.id, rewardPlayerId: receipt.rewardPlayerId, points: receipt.points } : null, rewardTokenClaimCount: rewardToken && Object.prototype.hasOwnProperty.call(afterRewards.storybookClaims || {}, rewardToken) ? 1 : 0, rewardPointsDelta: pointsDelta, rewardGamesDelta: gamesDelta });
    currentBook.stage = 'complete';
    results.currentBook = null;
    preservePartial();
  }
  if (!parentFaultUsed && runMode !== 'continuation' && runMode !== 'continuation-restored' && runMode !== 'full-resume') results.probes.push({ kind: 'parent-reward-write-failure', status: 'unavailable', reason: 'No newly eligible Storybook completion existed in the preserved profile.' });

  // Exit and re-enter at the actual world/library controls to prove cleanup
  // and quiet receipt reconciliation. Root supplies the visible launcher name
  // where application wording varies between candidate builds.
  await browseClick(page.getByRole('button', { name: 'Back to learning world', exact: true }), 'leave Storybook Studio');
  const worldConfirmation = page.getByRole('button', { name: 'Back to world', exact: true });
  if (await worldConfirmation.count()) await primaryClick(worldConfirmation, 'confirm leaving Storybook for the learning world');
  const readWriteHeading = page.getByRole('heading', { name: 'Read & Write', exact: true });
  if (!await readWriteHeading.count()) {
    const readWriteWorld = page.locator('.discovery-world-card').filter({ hasText: 'Read & Write' }).first();
    await readWriteWorld.waitFor({ state: 'visible' });
    await browseClick(readWriteWorld, 'reopen Read & Write world from the learning home');
  }
  await readWriteHeading.waitFor({ state: 'visible' });
  const launcher = page.locator('.catalogue-game-card').filter({ hasText: 'Storybook Studio' }).first();
  await launcher.waitFor({ state: 'visible' });
  await browseClick(launcher, 'reopen Storybook Studio');
  await page.getByRole('status', { name: 'Story library inventory' }).waitFor({ state: 'visible' });
  const afterReopen = await harness.libraryInventory();
  const afterStorage = await harness.storageInventory();
  const afterProgress = await progressHashSnapshot();
  const afterRewards = await rewards();
  if (!/7 included/.test(afterReopen.text) || !afterStorage.available) throw new Error('Library or storage did not recover on ordinary re-entry');
  if (runMode === 'continuation' || runMode === 'continuation-restored') {
    const beforeRewards = results.initial.rewards;
    if (afterProgress.rawHash !== results.initial.progress.rawHash
      || afterRewards.points !== beforeRewards.points
      || afterRewards.storybooksGames !== beforeRewards.storybooksGames
      || JSON.stringify(afterRewards.storybookClaims) !== JSON.stringify(beforeRewards.storybookClaims)) {
      throw new Error('Ordinary library re-entry changed Storybook progress or replay rewards.');
    }
    results.probes.push({ kind: 'preserved-progress-and-replay-zero', progressHashStable: true, pointsDelta: 0, storybooksGameDelta: 0, claimSetStable: true });
  }
  const testedSlugs = new Set(BOOKS.map((book) => book.slug));
  const protectedBefore = results.initial.progress.rows.filter((row) => row.childHash !== selectedChildHash || !testedSlugs.has(row.slug));
  const protectedAfter = afterProgress.rows.filter((row) => row.childHash !== selectedChildHash || !testedSlugs.has(row.slug));
  if (JSON.stringify(protectedBefore) !== JSON.stringify(protectedAfter)) throw new Error('A sibling or unrelated Storybook progress row changed during the UI journeys');
  results.probes.push({ kind: 'sibling-and-unrelated-progress-preservation', passed: true, protectedRowCount: protectedBefore.length });
  results.probes.push({ kind: 'completion-receipts', receipts: await allCompletionReceipts() });
  results.probes.push({ kind: 'ordinary-reopen', inventory: afterReopen, storage: afterStorage, progress: afterProgress, rewards: afterRewards, objectURLs: await harness.objectURLState() });
  preservePartial();

  if (runMode === 'full-with-backup' || runMode === 'continuation' || runMode === 'continuation-restored') {
    const compressedHash = pipBackupHash || '6460dad1981b6053a3e8bd2878d6e1403f671707f9f8a97bc6eec6575dda7cc0';
    let decompressedBytes = null;
    let restoreMessage = 'Pip backup was restored in the preceding bounded continuation.';
    let addedCount = 0;
    if (runMode !== 'continuation-restored') {
      const expected = '6460dad1981b6053a3e8bd2878d6e1403f671707f9f8a97bc6eec6575dda7cc0';
      if (compressedHash !== expected) throw new Error(`Approved Pip backup hash mismatch: ${compressedHash}`);
      if (!pipBackupJsonBase64) throw new Error('Approved Pip backup payload was not supplied in memory.');
      const decompressed = Buffer.from(pipBackupJsonBase64, 'base64');
      decompressedBytes = decompressed.length;
      const parentToolsToggle = page.getByRole('button', { name: /^(Parent tools|Hide parent tools)$/ }).first();
      if (await parentToolsToggle.getAttribute('aria-expanded') !== 'true') await browseClick(parentToolsToggle, 'open parent tools for backup restore');
      await browseClick(page.getByRole('button', { name: 'Restore a story backup', exact: true }), 'open restore for the approved Pip QA backup');
      await page.getByLabel('Choose a story backup').setInputFiles({ name: 'pip-sunflower-backup.json', mimeType: 'application/json', buffer: decompressed });
      const restoreStatus = page.getByRole('status').filter({ hasText: /Restored \d+ stor/ });
      await restoreStatus.waitFor({ state: 'visible', timeout: 30000 });
      restoreMessage = (await restoreStatus.innerText()).replace(/\s+/g, ' ').trim();
      addedCount = Number(restoreMessage.match(/Restored (\d+)/)?.[1] || 0);
    }
    await fillSearch(searchAgain, 'Pip and the Sunflower');
    const restoredPipCard = page.locator('section[aria-label="Storybook library"] article').filter({ hasText: 'Pip and the Sunflower' }).first();
    if (!await restoredPipCard.count()) throw new Error('Approved Pip QA book was not visible after UI restore');
    const urlsBeforePip = await harness.objectURLState();
    const pipCover = restoredPipCard.locator('img').first();
    await pipCover.waitFor({ state: 'visible' });
    await pipCover.evaluate((image) => image.decode());
    const initialPipCover = await pipCover.evaluate((image) => ({ src: image.currentSrc || image.src, width: image.naturalWidth, height: image.naturalHeight }));
    const coverURLBeforeRetry = initialPipCover.src;
    await pipCover.evaluate((image) => image.dispatchEvent(new Event('error')));
    const retryCover = restoredPipCard.getByRole('button', { name: 'Retry cover', exact: true });
    await retryCover.waitFor({ state: 'visible' });
    await browseClick(retryCover, 'retry stored Pip cover after bounded decode-error event');
    await page.waitForFunction((oldURL) => {
      const card = [...document.querySelectorAll('section[aria-label="Storybook library"] article')].find((item) => item.innerText.includes('Pip and the Sunflower'));
      const image = card?.querySelector('img');
      return Boolean(image?.complete && image.naturalWidth > 0 && (image.currentSrc || image.src) !== oldURL);
    }, coverURLBeforeRetry, { timeout: 10000 }).catch((error) => { throw new Error(`Stored-cover Retry did not invalidate/reload the saved URL: ${error.message}`); });
    const pipCoverInfo = await pipCover.evaluate((image) => ({ src: image.currentSrc || image.src, width: image.naturalWidth, height: image.naturalHeight }));
    if (!pipCoverInfo.src.startsWith('blob:') || pipCoverInfo.width < 1) throw new Error(`Approved Pip cover did not hydrate from saved media: ${JSON.stringify(pipCoverInfo)}`);
    const pipOpen = restoredPipCard.getByRole('button', { name: /Read story|Continue story|Read draft/ }).first();
    await browseClick(pipOpen, 'open approved Pip QA story');
    const pipReaderCover = await harness.visibleReaderScreen();
    const pipAutoTurn = storyMain().getByRole('button', { name: /Auto-turn pages after narration/ });
    if (await pipAutoTurn.count() && await pipAutoTurn.getAttribute('aria-pressed') === 'true') await primaryClick(pipAutoTurn, 'disable Pip auto-turn');
    const pipStart = storyMain().getByRole('button', { name: /^Start Reading$|^Start Again$/ }).first();
    if (await pipStart.count()) await primaryClick(pipStart, 'start approved Pip QA story');
    const pipPage1 = await harness.visibleReaderScreen();
    const liveURLs = async () => {
      const state = await harness.objectURLState();
      const revoked = new Set(state.revoked);
      return { state, live: state.created.filter((item) => !revoked.has(item.url)) };
    };
    const page1URLs = await liveURLs();
    if (page1URLs.live.length > 5) throw new Error(`Reader retained too many object URLs after entering Pip: ${page1URLs.live.length}`);
    const imageNode = storyMain().locator('img').first();
    const audioNode = storyMain().locator('audio').first();
    const oldImageURL = await imageNode.evaluate((image) => image.currentSrc || image.src);
    const oldAudioURL = await audioNode.evaluate((audio) => audio.currentSrc || audio.src);
    await imageNode.evaluate((image) => image.dispatchEvent(new Event('error')));
    await audioNode.evaluate((audio) => audio.dispatchEvent(new Event('error')));
    const retryMedia = storyMain().getByRole('button', { name: 'Retry saved media', exact: true }).first();
    await retryMedia.waitFor({ state: 'visible' });
    await primaryClick(retryMedia, 'retry stored Pip media after bounded decode-error event');
    await page.waitForFunction(({ oldImage, oldAudio }) => {
      const main = document.querySelector('main.storybook-reader');
      const image = main?.querySelector('img');
      const audio = main?.querySelector('audio');
      return Boolean(image?.complete && image.naturalWidth > 0 && (image.currentSrc || image.src) !== oldImage
        && audio && (audio.currentSrc || audio.src) !== oldAudio && !main.innerText.includes('Read-aloud is unavailable'));
    }, { oldImage: oldImageURL, oldAudio: oldAudioURL }, { timeout: 10000 }).catch((error) => { throw new Error(`Stored-media Retry did not invalidate/reload the saved URLs: ${error.message}`); });
    const pipRetriedURLs = await liveURLs();
    if (pipRetriedURLs.live.length > 5) throw new Error(`Reader exceeded current/previous screen URL bound after retry: ${pipRetriedURLs.live.length}`);
    await harness.startVisibleAudio(storyMain().getByRole('button', { name: /^(Hear page|Play narration)$/ }).first());
    const pipPause = storyMain().getByRole('button', { name: 'Pause narration', exact: true });
    if (await pipPause.count()) await primaryClick(pipPause, 'pause Pip page narration');
    await primaryClick(storyMain().getByRole('button', { name: 'Next page', exact: true }), 'advance Pip reader');
    const pipPage2 = await harness.visibleReaderScreen();
    const page2URLs = await liveURLs();
    if (page2URLs.live.length > 5) throw new Error(`Reader exceeded current/previous screen URL bound at Pip page 2: ${page2URLs.live.length}`);
    await primaryClick(page.getByRole('button', { name: 'Back to storybooks', exact: true }), 'leave Pip reader');
    const afterLeaveURLs = await liveURLs();
    if (afterLeaveURLs.live.length > 1) throw new Error(`Reader object URLs were not released on leave: ${afterLeaveURLs.live.length}`);
    await fillSearch(searchAgain, '');
    const exportToolsToggle = page.getByRole('button', { name: /^(Parent tools|Hide parent tools)$/ }).first();
    if (await exportToolsToggle.getAttribute('aria-expanded') !== 'true') await browseClick(exportToolsToggle, 'open parent tools for backup export verification');
    const exportCaptureReady = await page.evaluate(() => {
      if (window.__storybookExportCaptureV1) return false;
      const original = URL.createObjectURL;
      const state = { original, promise: null };
      URL.createObjectURL = function (blob) {
        const url = original.call(this, blob);
        if (blob?.type === 'application/json') state.promise = (async () => {
          const text = await blob.text();
          const payload = JSON.parse(text);
          const pip = (payload.books || []).find((book) => book.title === 'Pip and the Sunflower');
          const refs = pip ? [pip.coverAssetKey, pip.coverAudioAssetKey, ...(pip.pages || []).flatMap((page) => [page.imageAssetKey, page.audioAssetKey])] : [];
          const assetKeys = new Set((payload.assets || []).map((asset) => asset.key));
          const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
          const sha256 = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
          return { format: payload.format, version: payload.version, bytes: blob.size, sha256,
            bookCount: payload.books?.length || 0, bookIds: (payload.books || []).map((book) => book.id),
            pipBookId: pip?.id || null, pipPages: pip?.pages?.length || 0, pipAssetRefCount: refs.length,
            pipAssetCount: refs.filter((key) => assetKeys.has(key)).length, missingPipKeys: refs.filter((key) => !assetKeys.has(key)) };
        })();
        return url;
      };
      window.__storybookExportCaptureV1 = state;
      return true;
    });
    if (!exportCaptureReady) throw new Error('A Storybook export capture is already active.');
    let exportSummary;
    try {
      const exportButton = page.getByRole('button', { name: 'Back up saved stories', exact: true });
      if (await exportButton.isDisabled()) throw new Error('Backup export is disabled after the approved Pip restore.');
      const [download] = await Promise.all([page.waitForEvent('download'), browseClick(exportButton, 'export approved synthetic Pip story backup')]);
      await download.cancel().catch(() => {});
      await page.getByRole('status').filter({ hasText: 'Story backup downloaded. Keep it somewhere safe.' }).waitFor({ state: 'visible' });
      exportSummary = await page.evaluate(async () => window.__storybookExportCaptureV1?.promise || null);
      if (!exportSummary || exportSummary.format !== 'amari-storybooks' || exportSummary.version !== 1
        || !exportSummary.pipBookId || !exportSummary.bookIds.includes(exportSummary.pipBookId)
        || exportSummary.pipPages !== 6 || exportSummary.pipAssetRefCount !== 14
        || exportSummary.pipAssetCount !== 14 || exportSummary.missingPipKeys.length) {
        throw new Error(`Backup export did not preserve Pip's complete book and 14 referenced assets: ${JSON.stringify(exportSummary)}`);
      }
    } finally {
      await page.evaluate(() => {
        const state = window.__storybookExportCaptureV1;
        if (state) URL.createObjectURL = state.original;
        delete window.__storybookExportCaptureV1;
      });
    }
    await page.waitForTimeout(1100);
    const exportURLState = await harness.objectURLState();
    const exportURLs = exportURLState.created.filter((item) => item.type === 'application/json').map((item) => item.url);
    const revokedExportURLs = new Set(exportURLState.revoked);
    if (!exportURLs.length || exportURLs.some((url) => !revokedExportURLs.has(url))) throw new Error('The generated backup download URL was not revoked after export.');
    exportSummary.downloadURLRevoked = true;
    results.probes.push({ kind: 'approved-pip-qa-backup-ui-restore', sha256: compressedHash, decompressedBytes, addedCount, duplicateMessage: restoreMessage, title: 'Pip and the Sunflower', pageCount: 6, note: runMode === 'continuation-restored' ? 'Synthetic QA artifact restored before this continuation; no second restore attempted.' : 'Synthetic QA artifact only; no progress rows and no extracted file written.', coverRetry: { before: initialPipCover, after: pipCoverInfo }, readerCover: pipReaderCover, page1: pipPage1.pageLabel, page2: pipPage2.pageLabel, urlsBefore: urlsBeforePip, urlsAfterPage1: page1URLs, urlsAfterRetry: pipRetriedURLs, urlsAfterPage2: page2URLs, urlsAfterLeave: afterLeaveURLs, exportSummary });
    preservePartial();
  }

  results.final = await harness.finish();
  await harness.assertNoErrors();
  if (results.final.mediaRequests.some((url) => /\/api\//i.test(url))) throw new Error('Provider/media API request detected');
  if (runMode === 'full' || runMode === 'full-resume') {
    const expectedSlugs = BOOKS.map((book) => book.slug).sort();
    const actualSlugs = results.books.map((book) => book.slug).sort();
    if (results.books.length !== BOOKS.length || new Set(actualSlugs).size !== BOOKS.length
      || actualSlugs.some((slug, index) => slug !== expectedSlugs[index])) throw new Error(`Final book set is not the exact seven unique included stories: ${actualSlugs.join(', ')}`);
    for (const book of results.books) {
      if (!Array.isArray(book.pages) || book.pages.length !== 10 || !Array.isArray(book.questions) || book.questions.length !== 3) throw new Error(`Incomplete final content journey for ${book.slug}: ${book.pages?.length || 0} pages, ${book.questions?.length || 0} questions`);
    }
  }
  results.passed = true;
  harness.detach();
  return results;
};

module.exports.BOOKS = BOOKS;
module.exports.QUIZ_ORACLE = QUIZ_ORACLE;
