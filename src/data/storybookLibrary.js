export const STORYBOOK_SHELVES = Object.freeze([
  { id: 'all', label: 'All stories' },
  { id: 'my-stories', label: 'My Stories' },
  { id: 'learning', label: 'Learning' },
  { id: 'bedtime', label: 'Bedtime' },
  { id: 'favourites', label: 'Favourites' },
]);

const BUILT_IN_META = {
  'rex-missing-moon-map': { seriesId: 'moon-explorers', seriesName: 'Moon Explorers', tags: ['learning'], bedtime: false },
  'luna-whispering-forest': { seriesId: 'forest-friends', seriesName: 'Forest Friends', tags: ['learning', 'bedtime'], bedtime: true },
  'nia-great-river-journey': { seriesId: 'river-keepers', seriesName: 'River Keepers', tags: ['learning', 'bedtime'], bedtime: true },
};

export const decorateStoryBook = (book) => ({
  ...book,
  seriesId: book.seriesId || BUILT_IN_META[book.slug]?.seriesId || null,
  seriesName: book.seriesName || BUILT_IN_META[book.slug]?.seriesName || (book.custom ? 'My Stories' : 'Amari Adventures'),
  tags: Array.isArray(book.tags) ? book.tags : BUILT_IN_META[book.slug]?.tags || (book.custom ? ['my-stories'] : ['learning']),
  bedtime: typeof book.bedtime === 'boolean' ? book.bedtime : Boolean(BUILT_IN_META[book.slug]?.bedtime),
});

export const filterStoryBooks = (books, { shelf = 'all', ageBand = 'all', seriesId = 'all', favourites = {} } = {}) => books.filter((book) => {
  const decorated = decorateStoryBook(book);
  const shelfMatch = shelf === 'all'
    // Generated books belong to the device library, not to one child. Keep
    // reading progress and favourites per child, but let every child see the
    // same shared shelf.
    || (shelf === 'my-stories' && decorated.custom)
    || (shelf === 'learning' && decorated.tags.includes('learning'))
    || (shelf === 'bedtime' && decorated.bedtime)
    || (shelf === 'favourites' && favourites[decorated.slug]?.favourite === true);
  return shelfMatch && (ageBand === 'all' || decorated.ageBand === ageBand) && (seriesId === 'all' || decorated.seriesId === seriesId);
});
