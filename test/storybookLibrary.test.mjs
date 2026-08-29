import test from 'node:test';
import assert from 'node:assert/strict';
import { decorateStoryBook, filterStoryBooks } from '../src/data/storybookLibrary.js';

const books = [
  { slug: 'a', title: 'A', ageBand: '5-6', custom: false, seriesId: 'moon', seriesName: 'Moon Explorers', tags: ['learning'], bedtime: false },
  { slug: 'b', title: 'B', ageBand: '3-4', custom: true, childId: 'child-1', seriesId: 'home', seriesName: 'My Stories', tags: ['my-stories'], bedtime: true },
];

test('storybook shelves preserve access while filtering by shelf, age and series', () => {
  assert.deepEqual(filterStoryBooks(books, { shelf: 'my-stories', childId: 'child-1' }).map((book) => book.slug), ['b']);
  assert.deepEqual(filterStoryBooks(books, { shelf: 'my-stories', childId: 'child-2' }).map((book) => book.slug), []);
  assert.deepEqual(filterStoryBooks(books, { shelf: 'learning', ageBand: '5-6', seriesId: 'moon' }).map((book) => book.slug), ['a']);
  assert.deepEqual(filterStoryBooks(books, { shelf: 'favourites', favourites: { b: { favourite: true } } }).map((book) => book.slug), ['b']);
  assert.deepEqual(filterStoryBooks(books, { shelf: 'favourites', favourites: { b: { favourite: false } } }).map((book) => book.slug), []);
  assert.equal(decorateStoryBook(books[0]).seriesName, 'Moon Explorers');
  assert.equal(filterStoryBooks(books, { shelf: 'all' }).length, 2);
});
