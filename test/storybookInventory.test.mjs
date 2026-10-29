import test from 'node:test';
import assert from 'node:assert/strict';

const readInventory = async (t, indexedDB, suffix) => {
  const previous = globalThis.window;
  globalThis.window = { indexedDB };
  t.after(() => { if (previous === undefined) delete globalThis.window; else globalThis.window = previous; });
  const { getStoryLibraryInventory } = await import(`../src/data/storybookStorage.js?inventory-test=${suffix}`);
  return getStoryLibraryInventory();
};
const database = (books, failRead = false) => ({
  open() {
    const request = { result: {
      transaction(name, mode) {
        assert.equal(name, 'books');
        assert.equal(mode, 'readonly');
        const tx = {
          error: null,
          abort() { this.onabort?.(); },
          objectStore() { return { getAll() {
            const read = { result: books, error: failRead ? new Error('Read denied') : null };
            queueMicrotask(() => {
              if (failRead) { read.onerror(); return; }
              read.onsuccess();
              setImmediate(() => tx.oncomplete?.());
            });
            return read;
          } }; },
        };
        return tx;
      },
    } };
    queueMicrotask(() => request.onsuccess());
    return request;
  },
});

test('an empty readable library is distinguished from blocked browser storage', async (t) => {
  assert.deepEqual(await readInventory(t, database([]), 'empty'), { available: true, books: [] });
});
test('a failed library read is unavailable, never a confirmed zero saved stories', async (t) => {
  assert.deepEqual(await readInventory(t, database([], true), 'denied'), { available: false, books: [] });
});
test('saved books from different children and unfinished records all count in the inventory', async (t) => {
  const books = [{ id: 'one', childId: 'amari', status: 'ready' }, { id: 'two', childId: 'askia', status: 'paused' }];
  assert.deepEqual(await readInventory(t, database(books), 'shared'), { available: true, books });
});
