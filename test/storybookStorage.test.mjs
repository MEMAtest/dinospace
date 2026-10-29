import test from 'node:test';
import assert from 'node:assert/strict';

const copy = (value) => typeof structuredClone === 'function' ? structuredClone(value) : value;

class FakeTransaction {
  constructor(database, names, mode) {
    this.database = database;
    this.names = Array.isArray(names) ? names : [names];
    this.mode = mode;
    this.pending = 0;
    this.done = false;
    this.draft = new Map(this.names.map((name) => [name, new Map([...database.stores.get(name)].map(([key, value]) => [key, copy(value)]))]));
  }

  objectStore(name) {
    if (!this.draft.has(name)) throw new Error(`Store ${name} is not in this transaction`);
    return new FakeObjectStore(this, name);
  }

  request(storeName, operation, value) {
    const request = { result: undefined, error: null, onsuccess: null, onerror: null };
    this.pending += 1;
    queueMicrotask(() => {
      if (this.done) return;
      try {
        request.result = operation(this.draft.get(storeName));
        request.onsuccess?.({ target: request });
        this.pending -= 1;
        const abortRule = this.database.abortNextRequest;
        if (abortRule && abortRule.store === storeName && abortRule.operation === value) {
          this.database.abortNextRequest = null;
          queueMicrotask(() => this.abort(new Error('Injected abort after request success')));
        } else if (this.pending === 0) {
          setImmediate(() => this.completeIfIdle());
        }
      } catch (error) {
        request.error = error;
        this.error = error;
        request.onerror?.({ target: request });
        queueMicrotask(() => this.abort(error));
      }
    });
    return request;
  }

  completeIfIdle() {
    if (this.done || this.pending) return;
    this.names.forEach((name) => { this.database.stores.set(name, this.draft.get(name)); });
    this.done = true;
    this.oncomplete?.({ target: this });
  }

  abort(error = new Error('Injected transaction abort')) {
    if (this.done) return;
    this.done = true;
    this.error = error;
    this.onabort?.({ target: this });
  }
}

class FakeObjectStore {
  constructor(transaction, name) { this.transaction = transaction; this.name = name; }
  getAll() { return this.transaction.request(this.name, (store) => [...store.values()].map(copy), 'getAll'); }
  get(key) { return this.transaction.request(this.name, (store) => copy(store.get(key)), 'get'); }
  put(value) {
    const record = copy(value);
    return this.transaction.request(this.name, (store) => {
      const key = this.name === 'assets' ? record.key : record.id;
      store.set(key, record);
      return key;
    }, 'put');
  }
  add(value) {
    const record = copy(value);
    return this.transaction.request(this.name, (store) => {
      const key = this.name === 'assets' ? record.key : record.id;
      if (store.has(key)) throw new Error('ConstraintError');
      store.set(key, record);
      return key;
    }, 'add');
  }
  delete(key) { return this.transaction.request(this.name, (store) => store.delete(key), 'delete'); }
}

class FakeDatabase {
  constructor({ version = 0, stores = {}, abortNextRequest = null } = {}) {
    this.version = version;
    this.stores = new Map(Object.entries(stores).map(([name, records]) => [name, new Map(records.map((record) => [name === 'assets' ? record.key : record.id, copy(record)]))]));
    this.abortNextRequest = abortNextRequest;
    this.closed = false;
    this.closeCalls = 0;
    this.objectStoreNames = { contains: (name) => this.stores.has(name) };
  }
  createObjectStore(name) { if (!this.stores.has(name)) this.stores.set(name, new Map()); return { name }; }
  transaction(names, mode) {
    if (this.closed) throw new Error('InvalidStateError');
    return new FakeTransaction(this, names, mode);
  }
  close() { this.closed = true; this.closeCalls += 1; }
  triggerVersionChange() { this.onversionchange?.({ oldVersion: this.version, newVersion: this.version + 1 }); }
}

class FakeIndexedDB {
  constructor(options = {}) {
    this.database = new FakeDatabase(options);
    this.openFailures = options.openFailures || 0;
    this.blockedOpens = options.blockedOpens || 0;
    this.openCalls = 0;
    this.transactionCalls = 0;
    const transaction = this.database.transaction.bind(this.database);
    this.database.transaction = (...args) => { this.transactionCalls += 1; return transaction(...args); };
  }
  open(_name, version) {
    this.openCalls += 1;
    const request = { result: null, error: null, onsuccess: null, onerror: null, onupgradeneeded: null, onblocked: null };
    queueMicrotask(() => {
      if (this.openFailures > 0) {
        this.openFailures -= 1;
        request.error = new Error('Injected open failure');
        request.onerror?.({ target: request });
        return;
      }
      if (this.blockedOpens > 0) {
        this.blockedOpens -= 1;
        request.onblocked?.({ target: request });
        return;
      }
      this.database.closed = false;
      request.result = this.database;
      if (this.database.version < version) {
        const oldVersion = this.database.version;
        this.database.version = version;
        request.onupgradeneeded?.({ oldVersion, newVersion: version, target: request });
      }
      request.onsuccess?.({ target: request });
    });
    return request;
  }
}

const memoryStorage = (seed = {}) => {
  const values = new Map(Object.entries(seed));
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    values,
  };
};

const loadApi = async (t, indexedDB, suffix, localStorage = memoryStorage()) => {
  const previous = globalThis.window;
  globalThis.window = { indexedDB, localStorage };
  t.after(() => { if (previous === undefined) delete globalThis.window; else globalThis.window = previous; });
  const api = await import(`../src/data/storybookStorage.js?storage-test=${suffix}`);
  return { api, localStorage };
};

const makeBook = (id = 'custom-storage-test') => ({
  id, slug: id, custom: true, title: 'The Little Comet', ageBand: '5-6', status: 'ready',
  coverAssetKey: `${id}:cover`, coverAudioAssetKey: `${id}:cover-audio`,
  pages: [{ number: 1, title: 'A new friend', text: 'The comet waved hello.', imageAssetKey: `${id}:page-1:image`, audioAssetKey: `${id}:page-1:audio` }],
});

const assetsFor = (book) => [
  { key: book.coverAssetKey, blob: new Blob(['cover'], { type: 'image/webp' }) },
  { key: book.coverAudioAssetKey, blob: new Blob(['cover voice'], { type: 'audio/mpeg' }) },
  { key: book.pages[0].imageAssetKey, blob: new Blob(['page'], { type: 'image/webp' }) },
  { key: book.pages[0].audioAssetKey, blob: new Blob(['page voice'], { type: 'audio/mpeg' }) },
];

test('writes wait for transaction completion and reject a request-success-then-abort', async (t) => {
  const indexedDB = new FakeIndexedDB({ abortNextRequest: { store: 'books', operation: 'put' } });
  const { api } = await loadApi(t, indexedDB, 'abort');
  const book = { id: 'draft-1', status: 'draft', privateNotes: { keep: true } };
  assert.equal(await api.saveStoryBook(book), false);
  assert.equal(await api.getStoryBookRecord(book.id), undefined);
  assert.equal(await api.saveStoryBook(book), true);
  assert.deepEqual(await api.getStoryBookRecord(book.id), book);
});

test('transient open failure can retry, and versionchange closes then reopens the connection', async (t) => {
  const indexedDB = new FakeIndexedDB({ openFailures: 1 });
  const { api } = await loadApi(t, indexedDB, 'reopen');
  assert.equal((await api.getStoryLibraryInventory()).available, false);
  assert.equal((await api.getStoryLibraryInventory()).available, true);
  assert.equal(indexedDB.openCalls, 2);
  indexedDB.database.triggerVersionChange();
  assert.equal(indexedDB.database.closeCalls, 1);
  assert.equal((await api.getStoryLibraryInventory()).available, true);
  assert.equal(indexedDB.openCalls, 3);
});

test('blocked opens are reported unavailable and a later open retries cleanly', async (t) => {
  const indexedDB = new FakeIndexedDB({ blockedOpens: 1 });
  const { api } = await loadApi(t, indexedDB, 'blocked-retry');
  assert.deepEqual(await api.getStoryLibraryInventory(), { available: false, books: [] });
  assert.deepEqual(await api.getStoryLibraryInventory(), { available: true, books: [] });
  assert.equal(indexedDB.openCalls, 2);
});

test('v1-to-v2 upgrade creates missing stores without replacing existing books', async (t) => {
  const book = { id: 'old-book', title: 'Keep me', untouched: { version: 1 } };
  const indexedDB = new FakeIndexedDB({ version: 1, stores: { books: [book], assets: [{ key: 'old-book:cover', blob: new Blob(['old']) }] } });
  const { api } = await loadApi(t, indexedDB, 'migration');
  const inventory = await api.getStoryLibraryInventory();
  assert.equal(inventory.available, true);
  assert.deepEqual(inventory.books, [book]);
  assert.equal(indexedDB.database.version, 2);
  assert.deepEqual(indexedDB.database.stores.get('assets').get('old-book:cover'), { key: 'old-book:cover', blob: new Blob(['old']) });
  for (const store of ['profiles', 'series']) assert.equal(indexedDB.database.stores.has(store), true);
});

test('incomplete drafts survive as drafts and independent asset writes report aborts', async (t) => {
  const indexedDB = new FakeIndexedDB({ abortNextRequest: { store: 'assets', operation: 'put' } });
  const { api } = await loadApi(t, indexedDB, 'draft-assets');
  const draft = { id: 'draft-2', status: 'draft', title: 'Still writing', customField: 'preserve' };
  assert.equal(await api.saveStoryBook(draft), true);
  assert.equal(await api.saveStoryAsset('draft-2:cover', new Blob(['cover'], { type: 'image/png' })), false);
  assert.deepEqual(await api.getStoryBookRecord(draft.id), draft);
  assert.equal(await api.getStoryAsset('draft-2:cover'), null);
});

test('asset inventory distinguishes unavailable storage from an available missing asset', async (t) => {
  const unavailable = await loadApi(t, null, 'asset-unavailable');
  assert.deepEqual(await unavailable.api.getStoryAssetInventory('book:cover'), { available: false, blob: null });

  const indexedDB = new FakeIndexedDB();
  const { api } = await loadApi(t, indexedDB, 'asset-missing');
  assert.deepEqual(await api.getStoryAssetInventory('book:cover'), { available: true, blob: null });
  const blob = new Blob(['cover'], { type: 'image/png' });
  assert.equal(await api.saveStoryAsset('book:cover', blob), true);
  const stored = await api.getStoryAssetInventory('book:cover');
  assert.equal(stored.available, true);
  assert.equal(await stored.blob.text(), 'cover');
});

test('delete results and profile mirrors change only after a committed delete', async (t) => {
  const indexedDB = new FakeIndexedDB();
  const { api } = await loadApi(t, indexedDB, 'delete-abort');
  const book = { id: 'draft-delete', status: 'draft' };
  assert.equal(await api.saveStoryBook(book), true);
  indexedDB.database.abortNextRequest = { store: 'books', operation: 'delete' };
  assert.equal(await api.deleteStoryBook(book), false);
  assert.deepEqual(await api.getStoryBookRecord(book.id), book);

  const mirror = memoryStorage({ amari_storybook_profiles_v1: JSON.stringify([{ id: 'kid-delete', displayName: 'Kai' }]) });
  const noDatabase = await loadApi(t, null, 'delete-unavailable', mirror);
  assert.equal(await noDatabase.api.deleteChildProfile({ id: 'kid-delete' }), false);
  assert.equal(mirror.getItem('amari_storybook_profiles_v1'), JSON.stringify([{ id: 'kid-delete', displayName: 'Kai' }]));
});

test('profile and series metadata survive save/read; failed profile writes do not mutate the mirror or report success', async (t) => {
  const mirror = memoryStorage({ amari_storybook_profiles_v1: JSON.stringify([{ id: 'kid-1', displayName: 'Old', ageBand: '5-6', schoolMetadata: { group: 'blue' } }]) });
  const oldMirror = mirror.getItem('amari_storybook_profiles_v1');
  const failedDb = new FakeIndexedDB({ openFailures: 1 });
  const failed = await loadApi(t, failedDb, 'profile-fail', mirror);
  assert.equal(await failed.api.saveChildProfile({ id: 'kid-1', displayName: 'New', ageBand: '5-6' }), false);
  assert.equal(mirror.getItem('amari_storybook_profiles_v1'), oldMirror);

  const abortMirror = memoryStorage({ amari_storybook_profiles_v1: oldMirror });
  const abortDb = new FakeIndexedDB({ abortNextRequest: { store: 'profiles', operation: 'put' } });
  const aborted = await loadApi(t, abortDb, 'profile-abort', abortMirror);
  const changedProfile = { id: 'kid-1', displayName: 'New', ageBand: '5-6', schoolMetadata: { group: 'green' } };
  assert.equal(await aborted.api.saveChildProfile(changedProfile), false);
  assert.equal(abortMirror.getItem('amari_storybook_profiles_v1'), oldMirror);
  assert.equal(await aborted.api.saveChildProfile(changedProfile), true);
  const mirroredProfile = JSON.parse(abortMirror.getItem('amari_storybook_profiles_v1')).find((item) => item.id === 'kid-1');
  assert.equal(mirroredProfile.displayName, 'New');
  assert.deepEqual(mirroredProfile.schoolMetadata, { group: 'green' });
  assert.equal(typeof mirroredProfile.createdAt, 'string');

  const indexedDB = new FakeIndexedDB();
  const { api } = await loadApi(t, indexedDB, 'profile-series');
  const profile = { id: 'kid-2', displayName: 'Kai', ageBand: '7-8', createdAt: '2024-01-01', learningFlags: { dyslexiaSupport: true }, avatarRef: 'avatar-1' };
  assert.equal(await api.saveChildProfile(profile), true);
  assert.deepEqual((await api.getChildProfiles()).find((item) => item.id === profile.id), profile);
  assert.deepEqual(JSON.parse(globalThis.window.localStorage.getItem('amari_storybook_profiles_v1')).find((item) => item.id === profile.id), profile);

  const series = { id: 'series-a', name: 'Moon Friends', approved: false, guideMetadata: { source: 'family', note: 'keep' }, locale: 'en-GB' };
  assert.equal(await api.saveStorySeries(series), true);
  assert.deepEqual((await api.getStorySeries()).find((item) => item.id === series.id).guideMetadata, series.guideMetadata);
  assert.equal((await api.getStorySeriesInventory()).available, true);
});

test('availability-aware profile and series inventories do not report failed reads as empty', async (t) => {
  const indexedDB = new FakeIndexedDB({ openFailures: 2 });
  const { api } = await loadApi(t, indexedDB, 'metadata-inventory');
  assert.deepEqual(await api.getChildProfilesInventory(), { available: false, profiles: [] });
  assert.deepEqual(await api.getStorySeriesInventory(), { available: false, series: [] });
  const recoveredProfiles = await api.getChildProfilesInventory();
  assert.equal(recoveredProfiles.available, true);
  assert.equal(recoveredProfiles.profiles.length, 1);
  assert.equal(recoveredProfiles.profiles[0].id, 'amari');
  assert.deepEqual(await api.getStorySeriesInventory(), { available: true, series: [] });
});

test('fresh empty profile store safely migrates a default reader only after the database is readable', async (t) => {
  const indexedDB = new FakeIndexedDB();
  const { api, localStorage } = await loadApi(t, indexedDB, 'profile-default-migration');
  const inventory = await api.getChildProfilesInventory();
  assert.equal(inventory.available, true);
  assert.equal(inventory.profiles.length, 1);
  assert.equal(inventory.profiles[0].id, 'amari');
  assert.equal(inventory.profiles[0].displayName, 'Amari');
  assert.deepEqual(indexedDB.database.stores.get('profiles').get('amari'), inventory.profiles[0]);
  assert.equal(localStorage.getItem('amari_storybook_profiles_v1'), null, 'migration does not rewrite legacy bytes');

  const inaccessibleStorage = { getItem() { throw new Error('storage denied'); }, setItem() { throw new Error('must not write'); } };
  const blockedDb = new FakeIndexedDB();
  const blocked = await loadApi(t, blockedDb, 'profile-legacy-unreadable', inaccessibleStorage);
  assert.deepEqual(await blocked.api.getChildProfilesInventory(), { available: false, profiles: [] });
  assert.equal(blockedDb.database.stores.get('profiles').size, 0);
});

test('legacy reader migration preserves all readers and unknown metadata without rewriting the mirror', async (t) => {
  const profiles = [
    { id: 'amari', displayName: 'Amari', ageBand: '5-6', customReaderFlags: { voice: 'calm' } },
    { id: 'child-kai', displayName: 'Kai', ageBand: '7-8', schoolMetadata: { classroom: 'blue' } },
  ];
  const raw = JSON.stringify(profiles);
  const mirror = memoryStorage({ amari_storybook_profiles_v1: raw });
  const indexedDB = new FakeIndexedDB();
  const { api } = await loadApi(t, indexedDB, 'profile-two-reader-migration', mirror);
  const inventory = await api.getChildProfilesInventory();
  assert.equal(inventory.available, true);
  assert.equal(inventory.profiles.length, 2);
  assert.deepEqual(inventory.profiles, profiles.map((profile, index) => ({ ...profile, createdAt: inventory.profiles[index].createdAt })));
  assert.deepEqual(inventory.profiles[0].customReaderFlags, profiles[0].customReaderFlags);
  assert.deepEqual(inventory.profiles[1].schoolMetadata, profiles[1].schoolMetadata);
  assert.equal(mirror.getItem('amari_storybook_profiles_v1'), raw);
});

test('aborted profile migration rolls back every reader and retries atomically', async (t) => {
  const profiles = [
    { id: 'amari', displayName: 'Amari', ageBand: '5-6' },
    { id: 'child-kai', displayName: 'Kai', ageBand: '7-8' },
  ];
  const raw = JSON.stringify(profiles);
  const mirror = memoryStorage({ amari_storybook_profiles_v1: raw });
  const indexedDB = new FakeIndexedDB({ abortNextRequest: { store: 'profiles', operation: 'add' } });
  const { api } = await loadApi(t, indexedDB, 'profile-migration-abort', mirror);
  assert.deepEqual(await api.getChildProfilesInventory(), { available: false, profiles: [] });
  assert.equal(indexedDB.database.stores.get('profiles').size, 0, 'the write transaction rolls back all profiles');
  assert.equal(mirror.getItem('amari_storybook_profiles_v1'), raw);

  const retried = await api.getChildProfilesInventory();
  assert.equal(retried.available, true);
  assert.equal(retried.profiles.length, 2);
  assert.deepEqual(retried.profiles.map((profile) => profile.id), ['amari', 'child-kai']);
  assert.equal(mirror.getItem('amari_storybook_profiles_v1'), raw);
});

test('invalid or unavailable legacy profile bytes are preserved and never replaced by a default', async (t) => {
  for (const [suffix, raw] of [['malformed', '{bad'], ['empty-array', '[]'], ['duplicate-id', JSON.stringify([
    { id: 'amari', displayName: 'Amari' }, { id: 'amari', displayName: 'Another reader' },
  ])]]) {
    const mirror = memoryStorage({ amari_storybook_profiles_v1: raw });
    const indexedDB = new FakeIndexedDB();
    const { api } = await loadApi(t, indexedDB, `profile-invalid-${suffix}`, mirror);
    assert.deepEqual(await api.getChildProfilesInventory(), { available: false, profiles: [] });
    assert.equal(indexedDB.database.stores.get('profiles').size, 0);
    assert.equal(mirror.getItem('amari_storybook_profiles_v1'), raw);
  }

  const raw = JSON.stringify([{ id: 'amari', displayName: 'Amari', ageBand: '5-6' }]);
  const mirror = memoryStorage({ amari_storybook_profiles_v1: raw });
  const unavailable = await loadApi(t, null, 'profile-db-unavailable', mirror);
  assert.deepEqual(await unavailable.api.getChildProfilesInventory(), { available: false, profiles: [] });
  assert.equal(mirror.getItem('amari_storybook_profiles_v1'), raw);
});

test('restore validates complete inputs before mutation and rolls back books and assets on abort', async (t) => {
  const indexedDB = new FakeIndexedDB({ abortNextRequest: { store: 'assets', operation: 'put' } });
  const { api } = await loadApi(t, indexedDB, 'restore-atomic');
  const book = makeBook();
  const assets = assetsFor(book);
  const beforeTransactions = indexedDB.transactionCalls;
  await assert.rejects(() => api.importStorybookRecords({ books: [book], assets: assets.slice(0, -1) }), /missing a picture or narration/);
  const wrongTypeAssets = assets.map((asset, index) => index === 0 ? { ...asset, blob: new Blob(['wrong media'], { type: 'audio/mpeg' }) } : asset);
  await assert.rejects(() => api.importStorybookRecords({ books: [book], assets: wrongTypeAssets }), /mismatched picture or narration/);
  assert.equal(indexedDB.transactionCalls, beforeTransactions);
  await assert.rejects(() => api.importStorybookRecords({ books: [book], assets }), /abort/i);
  assert.equal((await api.getStoryBooks()).some((item) => item.id === book.id), false);
  assert.equal(await api.getStoryAsset(book.coverAssetKey), null);

  const restored = await api.importStorybookRecords({ books: [book], assets });
  assert.deepEqual(restored, { added: 1, skipped: 0 });
  assert.equal((await api.getStoryBookRecord(book.id)).title, book.title);
  assert.equal(await (await api.getStoryAsset(book.coverAssetKey)).text(), 'cover');

  const conflictingCopy = { ...book, title: 'Do not replace the local copy' };
  assert.deepEqual(await api.importStorybookRecords({ books: [conflictingCopy], assets }), { added: 0, skipped: 1 });
  assert.equal((await api.getStoryBookRecord(book.id)).title, book.title);
});
