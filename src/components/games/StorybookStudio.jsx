import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FocusMenu } from '../shared/FocusMenu.jsx';
import { loadStoryBookManifest, STORYBOOK_CATALOG } from '../../data/storybooks.js';
import StorybookCreator from './StorybookCreator.jsx';
import StorybookProfiles from './StorybookProfiles.jsx';
import StorybookSeriesLibrary from './StorybookSeriesLibrary.jsx';
import { createStoryImage, createStoryNarration, createStoryOutline, createStorySession } from '../../data/storybookApi.js';
import { isUsableStoryBlob, storyAssetInventory, validateStoryMediaAssets, validateStoryMediaBlob } from '../../data/storybookAssets.js';
import { getStoryAsset, getStoryAssetInventory, getStoryBookRecord, getStoryLibraryInventory, getChildProfilesInventory, getAskiaStoryReaderInventory, saveChildProfile, deleteChildProfile, getStorySeriesInventory, saveStorySeries, saveStoryAsset, saveStoryBook, importStorybookRecords } from '../../data/storybookStorage.js';
import { pagesForAgeBand } from '../../data/storybookValidation.js';
import { commitStoryCompletion, commitStoryProgress, getBookProgress, readStoryProgress, readStoryProgressState, saveActiveChildId } from '../../data/storybookProfiles.js';
import { decorateStoryBook, filterStoryBooks, STORYBOOK_SHELVES } from '../../data/storybookLibrary.js';
import { createStorybookBackup, readStorybookBackup } from '../../data/storybookBackup.js';
import { createComprehensionRandom, createComprehensionSeed, shuffledComprehension, STORYBOOK_WORD_HELP } from '../../data/storybookLearning.js';
import { createStorybookHydrator } from '../../data/storybookHydration.js';
import { storyCompletionReceiptBelongsToPlayer } from '../../data/storybookRewardScope.js';
import { canWriteStoryForReader, getStoryReaderAccess, readActiveStoryReader, resolveVerifiedStoryReader } from '../../data/storybookReaderAccess.js';

const completionKey = (slug) => `amari_storybook_complete_${slug}`;

const readCompletion = (slug, childId = 'amari') => {
  try {
    const progress = getBookProgress(readStoryProgress(), childId, slug);
    return progress.completed === true || (childId === 'amari' && window.localStorage.getItem(completionKey(slug)) === '1');
  } catch {
    return false;
  }
};


const DAILY_LIMIT = 3;
const LIBRARY_LIMIT = 20;
const LIBRARY_PAGE_SIZE = 8;
// v2 deliberately starts a clean quota: failed early creator attempts in the
// first release must never use up a family's three completed-story allowance.
const dailyKey = () => `amari_storybook_daily_v2_${new Date().toISOString().slice(0, 10)}`;
const countDailyCreations = () => {
  try { return Number(window.localStorage.getItem(dailyKey()) || 0); } catch { return 0; }
};
const incrementDailyCreations = () => {
  try { window.localStorage.setItem(dailyKey(), String(countDailyCreations() + 1)); } catch { /* optional control */ }
};
const blobToDataUrl = async (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});
// A generated cover can be several megabytes.  Sending that untouched as the
// reference for every page is unreliable on mobile browsers and can exceed an
// edge-function request limit.  The small copy below still carries the
// character's appearance, but keeps each page request comfortably sized.
const compactReferenceImage = async (blob) => new Promise((resolve) => {
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.onload = () => {
    try {
      const longestSide = 512;
      const scale = Math.min(1, longestSide / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.78));
    } catch {
      resolve(undefined);
    } finally {
      URL.revokeObjectURL(url);
    }
  };
  image.onerror = () => { URL.revokeObjectURL(url); resolve(undefined); };
  image.src = url;
});
const styleAccent = { '3d': 'from-indigo-700 via-violet-700 to-fuchsia-700', 'painted-2d': 'from-emerald-700 via-teal-700 to-cyan-700', realistic: 'from-amber-700 via-orange-600 to-rose-600' };

const newStoryId = () => `custom-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;

const makeCustomBook = (outline, input, selectedSeries = null) => {
  const id = newStoryId();
  const pageCount = pagesForAgeBand(input.ageBand);
  const pageLabel = pageCount === 6 ? 'six-page' : 'ten-page';
  return {
    id,
    slug: id,
    custom: true,
    title: outline.title,
    subtitle: `A ${input.style === '3d' ? 'colourful' : input.style === 'painted-2d' ? 'hand-painted' : 'warm'} ${pageLabel} adventure`,
    summary: outline.summary,
    ageBand: input.ageBand,
    style: input.style,
    childId: input.childId || 'amari',
    seriesId: selectedSeries?.id || null,
    seriesName: selectedSeries?.name || null,
    seriesBible: selectedSeries || null,
    referenceImage: selectedSeries?.approved ? selectedSeries.referenceImage : null,
    accent: styleAccent[input.style] || styleAccent['3d'],
    emoji: '✨',
    status: 'generating',
    generation: { stage: 'cover', completed: 0, total: 2 + pageCount * 2, pageCount, currentPage: 0, error: null, startedAt: Date.now() },
    characters: outline.characters,
    coverPrompt: outline.coverPrompt,
    coverAssetKey: `${id}:cover`,
    coverAudioAssetKey: `${id}:cover-audio`,
    cover: null,
    coverAudio: null,
    pages: outline.pages.map((page, index) => ({
      id: `${id}:page-${index + 1}`,
      number: index + 1,
      title: `Page ${index + 1}`,
      text: page.text,
      imagePrompt: page.imagePrompt,
      imageAssetKey: `${id}:page-${index + 1}:image`,
      audioAssetKey: `${id}:page-${index + 1}:audio`,
      image: null,
      audio: null,
    })),
  };
};

const validateCompleteStoryAssets = async (book, controller) => {
  const inventory = storyAssetInventory(book);
  const expected = 2 + (book.pages?.length || 0) * 2;
  if (inventory.length !== expected || inventory.some(({ key }) => !key) || new Set(inventory.map(({ key }) => key)).size !== expected) {
    throw new Error('The story asset list is incomplete. Resume making the missing pages before marking this book ready.');
  }
  let nextIndex = 0;
  const validateWorker = async () => {
    while (nextIndex < inventory.length) {
      const item = inventory[nextIndex];
      nextIndex += 1;
      const blob = await getStoryAsset(item.key);
      if (!isUsableStoryBlob(blob, item.kind)) {
        const error = new Error(`The ${item.label} is missing or has an invalid file type. Resume to repair it.`);
        error.assetKey = item.key;
        throw error;
      }
      try { await validateStoryMediaBlob(blob, item.kind, controller.signal); }
      catch (error) { error.assetKey = item.key; throw error; }
    }
  };
  const workers = Array.from({ length: Math.min(4, inventory.length) }, () => validateWorker());
  try {
    await Promise.all(workers);
  } catch (error) {
    if (!controller.signal.aborted) controller.abort(error);
    await Promise.allSettled(workers);
    throw error;
  }
};

const continuityPrompt = (book) => book.characters.map((character) => `${character.name}: ${character.visualDescription}`).join('; ');

const StorybookStudio = ({ playerId = 'amari', onBack, playSfx, speak = () => {}, soundOn, onToggleSound, onCelebrate, onGameEvent }) => {
  const askia = playerId === 'askia';
  const loadReaders = askia ? getAskiaStoryReaderInventory : getChildProfilesInventory;
  const [library, setLibrary] = useState(STORYBOOK_CATALOG);
  const [libraryStorageState, setLibraryStorageState] = useState('loading');
  const [profileStorageState, setProfileStorageState] = useState('loading');
  const [seriesStorageState, setSeriesStorageState] = useState('loading');
  const [bundledBooks, setBundledBooks] = useState(STORYBOOK_CATALOG);
  const [customRecords, setCustomRecords] = useState([]);
  const customRecordsRef = useRef(customRecords);
  customRecordsRef.current = customRecords;
  const [showCreator, setShowCreator] = useState(false);
  const [focusPanel, setFocusPanel] = useState('');
  const [creatorBusy, setCreatorBusy] = useState(false);
  const [creatorError, setCreatorError] = useState('');
  const [creatorProgress, setCreatorProgress] = useState(null);
  const [activeGenerationId, setActiveGenerationId] = useState(null);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [activeReaderPreference] = useState(() => askia ? { ok: true, status: 'player', id: 'askia' } : readActiveStoryReader());
  const [activeChildId, setActiveChildId] = useState(() => activeReaderPreference.id || 'amari');
  const [activePreferenceState, setActivePreferenceState] = useState(activeReaderPreference);
  const [readerCheckBusy, setReaderCheckBusy] = useState(false);
  const [readerCheckError, setReaderCheckError] = useState('');
  const readerCheckBusyRef = useRef(readerCheckBusy);
  readerCheckBusyRef.current = readerCheckBusy;
  const [initialProgressState] = useState(() => readStoryProgressState());
  const [progressByChild, setProgressByChild] = useState(() => initialProgressState.progress);
  const [progressStorageState, setProgressStorageState] = useState(() => initialProgressState.status);
  const pendingProgressRef = useRef(null);
  const reconciledReceiptIdsRef = useRef(new Set());
  const receiptClaimsRef = useRef(new Map());
  const pendingCompletionReceiptRef = useRef(null);
  const pendingCompletionActionRef = useRef(null);
  const completionErrorSlugRef = useRef(null);
  const [progressSaveError, setProgressSaveError] = useState('');
  const [completionSaveError, setCompletionSaveError] = useState('');
  const [series, setSeries] = useState([]);
  const [showProfiles, setShowProfiles] = useState(false);
  const [showSeries, setShowSeries] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');
  const [backupBusy, setBackupBusy] = useState(false);
  const backupInputRef = useRef(null);
  const [comprehension, setComprehension] = useState([]);
  const [comprehensionSeed, setComprehensionSeed] = useState(0);
  const [comprehensionStep, setComprehensionStep] = useState(0);
  const [comprehensionChoice, setComprehensionChoice] = useState('');
  const [comprehensionHadMistake, setComprehensionHadMistake] = useState(false);
  const [comprehensionActive, setComprehensionActive] = useState(false);
  const [initialSeriesId, setInitialSeriesId] = useState('');
  const [shelf, setShelf] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [seriesFilter, setSeriesFilter] = useState('all');
  const [storySearch, setStorySearch] = useState('');
  const [libraryPage, setLibraryPage] = useState(0);
  const [coverMedia, setCoverMedia] = useState({});
  const [readerMedia, setReaderMedia] = useState({ status: 'idle', image: null, audio: null, missingKeys: [] });
  const [assetVersion, setAssetVersion] = useState(0);
  const [readerRetry, setReaderRetry] = useState(0);
  const hydratorRef = useRef(null);
  const readerLoadRef = useRef(0);
  const storySessionRef = useRef(null);
  const activeChildIdRef = useRef(activeChildId);
  const activePreferenceRef = useRef(activePreferenceState);
  activePreferenceRef.current = activePreferenceState;
  const readerIdentityRef = useRef({ status: profileStorageState, profiles, activeChildId, preferenceOk: activePreferenceState.ok });
  readerIdentityRef.current = { status: profileStorageState, profiles, activeChildId, preferenceOk: activePreferenceState.ok };
  const readerAccess = getStoryReaderAccess(profileStorageState, profiles, activeChildId, activePreferenceState.ok);
  const readerAccessMessage = readerAccess.reason === 'checking'
    ? 'Checking saved reader identity. Included stories are available in read-only mode.'
    : readerAccess.reason === 'active-reader-unreadable'
      ? 'The saved reader selection could not be read. Stories are available to read, but reader-specific changes are paused until you retry or choose a verified saved reader.'
      : readerAccess.reason === 'missing'
        ? 'The saved reader was not found in the verified profile list. Choose a saved reader or retry the check; no reader-specific changes were saved.'
        : 'Reader profiles could not be verified. Stories are available to read, but reader-specific changes are paused.';
  const verifiedActiveReader = (childId) => {
    const latest = readerIdentityRef.current;
    return !readerCheckBusyRef.current && canWriteStoryForReader(latest.status, latest.profiles, childId, activeChildIdRef.current, latest.preferenceOk);
  };
  const completedRunSeedRef = useRef(null);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [pageIndex, setPageIndex] = useState(-1);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [autoRead, setAutoRead] = useState(true);
  const [audioError, setAudioError] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const audioRef = useRef(null);
  const advanceTimerRef = useRef(null);
  const generationAbortRef = useRef(null);
  const generationBookIdRef = useRef(null);
  const persistChainRef = useRef(Promise.resolve());

  const activeChild = profiles.find((profile) => profile.id === activeChildId) || profiles[0] || (askia ? { id: 'askia', displayName: 'Askia', ageBand: '3-4' } : { id: 'amari', displayName: 'Amari', ageBand: '5-6' });
  const activeReaderProgress = useMemo(() => (readerAccess.verified ? progressByChild[activeChild.id] || {} : {}), [activeChild.id, progressByChild, readerAccess.verified]);
  const activeBookProgress = (slug) => readerAccess.verified ? getBookProgress(progressByChild, activeChild.id, slug) : {};
  const activeReaderCompleted = (slug) => readerAccess.verified && readCompletion(slug, activeChild.id);
  const decoratedLibrary = useMemo(() => library.map(decorateStoryBook), [library]);
  const availableSeries = useMemo(() => {
    // Bundled books also act as reusable starting points.  They provide a
    // description-only bible; a saved series with an approved reference image
    // takes precedence when the family has created one.
    const bundled = [...new Map(decoratedLibrary.filter((book) => book.seriesId).map((book) => [book.seriesId, {
      id: book.seriesId,
      name: book.seriesName,
      appearance: book.characters?.map((character) => `${character.name}: ${character.visualDescription}`).join('; ') || `The main character from ${book.title}`,
      personality: 'Curious, kind and brave',
      friendsWorld: book.summary,
      visualStyle: book.style === 'hand-painted 2D storybook' ? 'painted-2d' : book.style === 'realistic but warm wildlife imagery' ? 'realistic' : '3d',
      approved: false,
    }])).values()];
    return [...series, ...bundled].reduce((items, item) => items.some((current) => current.id === item.id) ? items : [...items, item], []);
  }, [decoratedLibrary, series]);
  const filteredBooks = useMemo(() => filterStoryBooks(decoratedLibrary, {
    shelf, ageBand: ageFilter, seriesId: seriesFilter,
    childId: activeChild.id,
    favourites: activeReaderProgress,
  }).filter((book) => !storySearch.trim() || `${book.title} ${book.subtitle} ${book.summary} ${book.seriesName || ''}`.toLocaleLowerCase().includes(storySearch.trim().toLocaleLowerCase())), [activeChild.id, activeReaderProgress, ageFilter, decoratedLibrary, seriesFilter, shelf, storySearch]);
  const visibleBooks = useMemo(() => filteredBooks.slice(libraryPage * LIBRARY_PAGE_SIZE, (libraryPage + 1) * LIBRARY_PAGE_SIZE), [filteredBooks, libraryPage]);

  const selectedBook = useMemo(
    () => library.find((book) => book.slug === selectedSlug) || null,
    [library, selectedSlug],
  );
  const pages = selectedBook?.pages || [];
  const isCover = pageIndex < 0;
  const currentPage = isCover ? null : pages[pageIndex];
  const readerScreenMedia = readerMedia.bookId === selectedBook?.id && readerMedia.index === pageIndex ? readerMedia : { status: selectedBook?.custom ? 'loading' : 'idle', image: null, audio: null, missingKeys: [] };
  const currentAudio = selectedBook?.custom ? readerScreenMedia.audio : (isCover ? selectedBook?.coverAudio : currentPage?.audio);
  const currentImage = selectedBook?.custom ? readerScreenMedia.image : (isCover ? selectedBook?.cover : currentPage?.image);
  const totalScreens = pages.length + 1;
  const screenNumber = pageIndex + 2;

  useEffect(() => {
    const hydrator = createStorybookHydrator({ readAsset: getStoryAssetInventory });
    hydratorRef.current = hydrator;
    return () => {
      readerLoadRef.current += 1;
      hydrator.dispose();
      if (hydratorRef.current === hydrator) hydratorRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadIndependently = async (task, onSuccess, onFailure) => {
      try { const value = await task(); if (!cancelled) onSuccess(value); }
      catch { if (!cancelled) onFailure(); }
    };
    loadIndependently(() => Promise.all(STORYBOOK_CATALOG.map(async (book) => { try { return await loadStoryBookManifest(book); } catch { return null; } })), (books) => {
      const loadedBooks = books.filter(Boolean); setBundledBooks(loadedBooks);
    }, () => setBundledBooks([]));
    loadIndependently(getStoryLibraryInventory, (inventory) => {
      setLibraryStorageState(inventory.available ? 'available' : 'unavailable');
      if (inventory.available) setCustomRecords(inventory.books);
    }, () => setLibraryStorageState('unavailable'));
    loadIndependently(loadReaders, (inventory) => {
      setProfileStorageState(inventory.available ? 'available' : 'unavailable');
      if (!inventory.available) return;
      setProfiles(inventory.profiles);
      const preference = activePreferenceRef.current;
      if (!preference.ok) return;
      const resolution = resolveVerifiedStoryReader(preference, inventory.profiles);
      const loadedActive = resolution.profile;
      if (resolution.ok && loadedActive && loadedActive.id !== activeChildIdRef.current) {
        activeChildIdRef.current = loadedActive.id; setActiveChildId(loadedActive.id);
        if (resolution.shouldPersist) saveActiveChildId(loadedActive.id);
        const nextPreference = { ok: true, status: resolution.shouldPersist ? 'saved' : preference.status, id: loadedActive.id };
        activePreferenceRef.current = nextPreference; setActivePreferenceState(nextPreference);
      }
    }, () => setProfileStorageState('unavailable'));
    loadIndependently(getStorySeriesInventory, (inventory) => {
      setSeriesStorageState(inventory.available ? 'available' : 'unavailable');
      if (inventory.available) setSeries(inventory.series);
    }, () => setSeriesStorageState('unavailable'));
    return () => { cancelled = true; generationAbortRef.current?.abort(); };
  }, [loadReaders]);

  useEffect(() => setLibrary([...bundledBooks, ...customRecords.map((record) => ({ ...record, accent: styleAccent[record.style] || styleAccent['3d'], emoji: '✨', cover: null, coverAudio: null, pages: (record.pages || []).map((page) => ({ ...page, image: null, audio: null })) }))]), [bundledBooks, customRecords]);

  useEffect(() => {
    const hydrator = hydratorRef.current;
    if (!hydrator) return undefined;
    const keys = visibleBooks.slice(0, LIBRARY_PAGE_SIZE).filter((book) => book.custom && book.coverAssetKey).map((book) => book.coverAssetKey);
    hydrator.retainCovers(keys);
    const visibleIds = new Set(visibleBooks.slice(0, LIBRARY_PAGE_SIZE).map((book) => book.id));
    setCoverMedia((current) => Object.fromEntries(Object.entries(current).filter(([id]) => visibleIds.has(id))));
    let cancelled = false;
    Promise.all(visibleBooks.filter((book) => book.custom).map(async (book) => {
      const result = await hydrator.loadCover(book);
      return [book.id, { ...result, status: result.stale ? 'loading' : !result.available ? 'unavailable' : result.missingKeys.length ? 'missing' : 'ready' }];
    })).then((results) => {
      if (cancelled) return;
      setCoverMedia((current) => ({ ...current, ...Object.fromEntries(results) }));
    });
    return () => { cancelled = true; };
  }, [assetVersion, visibleBooks]);

  useEffect(() => {
    const hydrator = hydratorRef.current;
    if (!selectedBook?.custom || !hydrator) { setReaderMedia({ status: 'idle', image: null, audio: null, missingKeys: [] }); return undefined; }
    const token = ++readerLoadRef.current;
    setReaderMedia({ bookId: selectedBook.id, index: pageIndex, status: 'loading', image: null, audio: null, missingKeys: [] });
    Promise.resolve(hydrator.loadScreen(selectedBook, pageIndex)).then((result) => {
      if (token !== readerLoadRef.current || selectedSlug !== selectedBook.slug) return;
      setReaderMedia({ bookId: selectedBook.id, index: pageIndex, status: result.stale ? 'loading' : !result.available ? 'unavailable' : result.missingKeys.length ? 'missing' : 'ready', image: result.image, audio: result.audio, missingKeys: result.missingKeys });
    });
    const audioElement = audioRef.current;
    return () => { readerLoadRef.current += 1; audioElement?.pause(); };
  }, [pageIndex, readerRetry, selectedBook, selectedSlug]);

  useEffect(() => setLibraryPage(0), [ageFilter, seriesFilter, shelf, storySearch]);

  const stopAudio = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPlaying(false);
  }, []);

  useEffect(() => () => stopAudio(), [stopAudio]);

  const persistProgress = useCallback((childId, slug, patch) => {
    if (!verifiedActiveReader(childId)) {
      setReaderCheckError('Reader identity could not be verified, so this change was not saved. Retry the reader check before saving progress.');
      return false;
    }
    const result = commitStoryProgress(childId, slug, patch);
    if (!result.ok) {
      const action = { childId, slug, patch };
      pendingProgressRef.current = action;
      setProgressStorageState(result.status);
      setProgressSaveError(result.error || 'Story progress could not be saved. Please retry.');
      return false;
    }
    setProgressStorageState('ready');
    setProgressByChild(result.progress);
    const pending = pendingProgressRef.current;
    if (pending && pending.childId === childId && pending.slug === slug && JSON.stringify(pending.patch) === JSON.stringify(patch)) {
      pendingProgressRef.current = null;
      setProgressSaveError('');
    }
    return true;
  }, []);

  const retryReaderCheck = useCallback(async () => {
    readerCheckBusyRef.current = true;
    setReaderCheckBusy(true);
    setReaderCheckError('');
    try {
      const preference = askia ? { ok: true, status: 'player', id: 'askia' } : readActiveStoryReader();
      activePreferenceRef.current = preference;
      setActivePreferenceState(preference);
      readerIdentityRef.current = { ...readerIdentityRef.current, preferenceOk: preference.ok };
      const inventory = await loadReaders();
      if (!inventory.available) {
        readerIdentityRef.current = { ...readerIdentityRef.current, status: 'unavailable' };
        setProfileStorageState('unavailable');
        setReaderCheckError('Reader profiles are still unavailable. No fallback reader was selected or saved.');
        return false;
      }
      setProfiles(inventory.profiles);
      setProfileStorageState('available');
      readerIdentityRef.current = { ...readerIdentityRef.current, status: 'available', profiles: inventory.profiles };
      const resolution = resolveVerifiedStoryReader(preference, inventory.profiles);
      if (!resolution.ok) {
        setReaderCheckError('The saved reader selection could not be read. Choose one of the verified saved readers to continue.');
        return false;
      }
      const verified = resolution.profile;
      if (!verified) return false;
      if (verified.id !== activeChildIdRef.current) {
        activeChildIdRef.current = verified.id;
        setActiveChildId(verified.id);
      }
      if (resolution.shouldPersist) saveActiveChildId(verified.id);
      const nextPreference = { ok: true, status: resolution.shouldPersist ? 'saved' : preference.status, id: verified.id };
      activePreferenceRef.current = nextPreference; setActivePreferenceState(nextPreference);
      readerIdentityRef.current = { status: 'available', profiles: inventory.profiles, activeChildId: verified.id, preferenceOk: true };
      setReaderCheckError('');
      return true;
    } catch {
      readerIdentityRef.current = { ...readerIdentityRef.current, status: 'unavailable' };
      setProfileStorageState('unavailable');
      setReaderCheckError('Reader profiles could not be checked. No fallback reader was selected or saved.');
      return false;
    } finally {
      readerCheckBusyRef.current = false;
      setReaderCheckBusy(false);
    }
  }, [askia, loadReaders]);

  const claimCompletionReceipt = useCallback((receipt, slug, readerChildId) => {
    if (!receipt || reconciledReceiptIdsRef.current.has(receipt.id)) return Promise.resolve(true);
    if (!storyCompletionReceiptBelongsToPlayer(receipt, readerChildId, playerId)) return Promise.resolve(true);
    const pendingClaim = receiptClaimsRef.current.get(receipt.id);
    if (pendingClaim) return pendingClaim;
    pendingCompletionReceiptRef.current = { receipt, slug, readerChildId };
    if (slug) completionErrorSlugRef.current = slug;
    const claim = (async () => {
      try {
        const result = await onCelebrate?.('Story finished!', 4, 0, 'storybooks', { quiet: true, rewardToken: `storybooks:${receipt.id}` });
        if (result?.persisted !== true) {
          setCompletionSaveError('The story is saved, but its reward could not be confirmed yet. Retry to finish safely.');
          return false;
        }
        reconciledReceiptIdsRef.current.add(receipt.id);
        if (pendingCompletionReceiptRef.current?.receipt?.id === receipt.id) pendingCompletionReceiptRef.current = null;
        if (completionErrorSlugRef.current === slug) { completionErrorSlugRef.current = null; setCompletionSaveError(''); }
        return true;
      } catch {
        setCompletionSaveError('The story is saved, but its reward could not be confirmed yet. Retry to finish safely.');
        return false;
      }
    })();
    receiptClaimsRef.current.set(receipt.id, claim);
    return claim.finally(() => { if (receiptClaimsRef.current.get(receipt.id) === claim) receiptClaimsRef.current.delete(receipt.id); });
  }, [onCelebrate, playerId]);

  const reconcileStoryRewards = useCallback(async () => {
    const state = readStoryProgressState();
    if (!state.ok) {
      setProgressStorageState(state.status);
      return;
    }
    setProgressStorageState(state.status);
    setProgressByChild(state.progress);
    const receipts = Object.entries(state.progress).flatMap(([readerChildId, books]) => Object.entries(books)
      .map(([slug, entry]) => ({ readerChildId, slug, receipt: entry.completionReceipt })))
      .filter(({ receipt }) => receipt?.id && !reconciledReceiptIdsRef.current.has(receipt.id));
    for (const { receipt, slug, readerChildId } of receipts) await claimCompletionReceipt(receipt, slug, readerChildId);
  }, [claimCompletionReceipt]);

  useEffect(() => { reconcileStoryRewards(); }, [reconcileStoryRewards, selectedSlug]);

  const finishBook = useCallback(async () => {
    if (!selectedBook) return false;
    if (!verifiedActiveReader(activeChild.id)) {
      setReaderCheckError('Reader identity could not be verified, so this story was not marked finished. Retry the reader check to continue.');
      return false;
    }
    completionErrorSlugRef.current = selectedBook.slug;
    const result = commitStoryCompletion(activeChild.id, selectedBook.slug, undefined, { rewardPlayerId: playerId });
    if (!result.ok) {
      setProgressStorageState(result.status);
      pendingCompletionActionRef.current = { childId: activeChild.id, slug: selectedBook.slug };
      setCompletionSaveError(result.error || 'The finished story could not be saved. Retry before moving on.');
      return false;
    }
    pendingCompletionActionRef.current = null;
    setProgressStorageState('ready');
    setProgressByChild(result.progress);
    if (result.receipt && !await claimCompletionReceipt(result.receipt, selectedBook.slug, activeChild.id)) return false;
    if (completionErrorSlugRef.current === selectedBook.slug) { completionErrorSlugRef.current = null; setCompletionSaveError(''); }
    if (!comprehension.length && completedRunSeedRef.current !== comprehensionSeed) {
      completedRunSeedRef.current = comprehensionSeed;
      onGameEvent?.('storybooks', 'level_complete', { seed: comprehensionSeed, round: pages.length, pageIndex });
    }
    return true;
  }, [activeChild.id, claimCompletionReceipt, comprehension.length, comprehensionSeed, onGameEvent, pageIndex, pages.length, playerId, selectedBook]);

  const goToScreen = useCallback((nextIndex, { shouldPlay = autoRead } = {}) => {
    if (!selectedBook) return;
    const clamped = Math.max(-1, Math.min(pages.length - 1, nextIndex));
    setPageIndex(clamped);
    onGameEvent?.('storybooks', 'scene', {
      seed: comprehensionSeed,
      round: Math.max(0, clamped + 1),
      pageIndex: clamped,
    });
    persistProgress(activeChild.id, selectedBook.slug, { pageIndex: clamped });
    setAudioError(false);
    setPlaying(Boolean(shouldPlay && started));
  }, [activeChild.id, autoRead, comprehensionSeed, onGameEvent, pages.length, persistProgress, selectedBook, started]);

  const playCurrentAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentAudio) {
      setAudioError(true);
      setPlaying(false);
      return false;
    }
    try {
      await audio.play();
      setAudioError(false);
      setPlaying(true);
      return true;
    } catch {
      // The local MP3 is retained; a blocked or missing file must not fall back
      // to an Android/device voice, which is often the wrong narrator.
      setAudioError(true);
      setPlaying(false);
      return false;
    }
  }, [currentAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    audio.pause();
    audio.currentTime = 0;
    if (!started || !autoRead || !currentAudio) { setPlaying(false); return undefined; }
    const timer = window.setTimeout(() => { playCurrentAudio(); }, 80);
    return () => window.clearTimeout(timer);
  }, [autoRead, currentAudio, pageIndex, playCurrentAudio, started]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = soundOn ? 1 : 0;
  }, [soundOn, currentAudio]);

  const openBook = (book) => {
    setFocusPanel('');
    playSfx?.('click');
    stopAudio();
    hydratorRef.current?.releaseReader();
    setSelectedSlug(book.slug);
    const quizSeed = createComprehensionSeed();
    setComprehensionSeed(quizSeed);
    setComprehension(shuffledComprehension(book.slug, createComprehensionRandom(quizSeed)));
    setComprehensionStep(0);
    setComprehensionChoice('');
    setComprehensionHadMistake(false);
    setComprehensionActive(false);
    const saved = activeBookProgress(book.slug);
    const resumeIndex = activeReaderCompleted(book.slug) ? -1
      : Number.isInteger(saved.pageIndex) ? Math.max(-1, Math.min(book.pages.length - 1, saved.pageIndex)) : -1;
    completedRunSeedRef.current = null;
    onGameEvent?.('storybooks', 'start', { seed: quizSeed, round: Math.max(0, resumeIndex + 1), pageIndex: resumeIndex });
    onGameEvent?.('storybooks', 'scene', { seed: quizSeed, round: Math.max(0, resumeIndex + 1), pageIndex: resumeIndex });
    setPageIndex(resumeIndex);
    setStarted(false);
    setAudioError(false);
    persistProgress(activeChild.id, book.slug, { lastReadAt: new Date().toISOString(), pageIndex: resumeIndex });
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  };

  const closeBook = () => {
    setFocusPanel('');
    playSfx?.('click');
    if (selectedBook) onGameEvent?.('storybooks', 'leave', {
      seed: comprehensionSeed,
      round: comprehensionActive ? comprehensionStep + 1 : Math.max(0, pageIndex + 1),
      pageIndex,
    });
    stopAudio();
    hydratorRef.current?.releaseReader();
    setSelectedSlug(null);
    setStarted(false);
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  };

  const startReading = async () => {
    if (isCover && selectedBook && activeReaderCompleted(selectedBook.slug)) {
      onGameEvent?.('storybooks', 'replay', { seed: comprehensionSeed, round: 0, pageIndex });
    }
    setStarted(true);
    setAudioError(false);
    if (!currentAudio && selectedBook?.custom && selectedBook.status === 'ready' && readerScreenMedia.status === 'loading') {
      setStarted(true);
      return;
    }
    if (!currentAudio || (selectedBook?.custom && selectedBook.status !== 'ready')) {
      stopAudio();
      goToScreen(0, { shouldPlay: false });
      return;
    }
    if (isCover && (!autoRead || !soundOn)) {
      // Manual readers should enter the story without waiting for narration
      // to turn a page. Replay remains available on the first story page.
      stopAudio();
      goToScreen(0, { shouldPlay: false });
      return;
    }
    // Start in the same click handler so mobile WebViews preserve activation.
    await playCurrentAudio();
  };

  const chooseComprehensionAnswer = (choice) => {
    if (!choice || comprehensionChoice === (comprehension[comprehensionStep]?.answer)) return;
    const question = comprehension[comprehensionStep];
    setComprehensionChoice(choice);
    if (choice === question.answer) {
      onGameEvent?.('storybooks', 'answer_correct', { round: comprehensionStep + 1, firstAttempt: !comprehensionHadMistake, seed: comprehensionSeed, pageIndex });
      onGameEvent?.('storybooks', 'comprehension_question_complete', { round: comprehensionStep + 1, firstAttempt: !comprehensionHadMistake, seed: comprehensionSeed });
      speak(question.why);
    } else {
      setComprehensionHadMistake(true);
      onGameEvent?.('storybooks', 'answer_attempt', { round: comprehensionStep + 1, firstAttempt: !comprehensionHadMistake, seed: comprehensionSeed, pageIndex });
      onGameEvent?.('storybooks', 'comprehension_answer_wrong', { round: comprehensionStep + 1, seed: comprehensionSeed });
      speak(question.clue);
    }
  };

  const leaveToWorld = () => {
    if (selectedBook) onGameEvent?.('storybooks', 'leave', {
      seed: comprehensionSeed,
      round: comprehensionActive ? comprehensionStep + 1 : Math.max(0, pageIndex + 1),
      pageIndex,
    });
    stopAudio();
    hydratorRef.current?.releaseReader();
    generationAbortRef.current?.abort();
    onBack();
  };

  const hearComprehensionAudio = (text, hintType) => {
    onGameEvent?.('storybooks', 'hint', { seed: comprehensionSeed, round: comprehensionStep + 1, pageIndex, hintType });
    speak(text);
  };

  const replayNarration = () => {
    onGameEvent?.('storybooks', 'replay', { seed: comprehensionSeed, round: Math.max(0, pageIndex + 1), pageIndex });
    audioRef.current?.load();
    playCurrentAudio();
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      setStarted(true);
      await playCurrentAudio();
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const onEnded = () => {
    setPlaying(false);
    if (pageIndex >= pages.length - 1) {
      finishBook();
      return;
    }
    if (!autoRead) return;
    advanceTimerRef.current = window.setTimeout(() => {
      goToScreen(pageIndex + 1, { shouldPlay: true });
    }, 420);
  };

  const persistCustom = useCallback(async (record) => {
    const saved = await saveStoryBook(record);
    if (!saved) throw new Error('This device could not save the story yet. Please check available storage, then try again.');
    setCustomRecords((records) => records.some((item) => item.id === record.id)
      ? records.map((item) => (item.id === record.id ? record : item))
      : [record, ...records]);
    setLibrary((books) => books.map((book) => book.id !== record.id ? book : ({
      ...book,
      ...record,
      cover: book.cover,
      coverAudio: book.coverAudio,
      pages: record.pages.map((page, index) => ({ ...page, image: book.pages?.[index]?.image || null, audio: book.pages?.[index]?.audio || null })),
    })));
  }, []);

  const publishSavedAsset = (_record, key) => {
    hydratorRef.current?.invalidateAsset(key);
    setAssetVersion((version) => version + 1);
  };

  const runCustomGeneration = useCallback(async (sourceRecord, session = storySessionRef.current, controller = generationAbortRef.current) => {
    if (!session) return { ok: false, error: 'The story connection expired. Please try again.' };
    if (generationAbortRef.current && generationAbortRef.current !== controller) return { ok: false, error: 'Another story is already being made.' };
    if (!controller || controller.signal.aborted) return { ok: false, error: 'Story creation was paused.' };
    generationAbortRef.current = controller;
    generationBookIdRef.current = sourceRecord.id;
    setActiveGenerationId(sourceRecord.id);
    let record = {
      ...sourceRecord,
      status: 'generating',
      generation: { ...(sourceRecord.generation || {}), stage: 'cover', error: null, total: 2 + (sourceRecord.pages || []).length * 2, pageCount: (sourceRecord.pages || []).length, startedAt: sourceRecord.generation?.startedAt || Date.now() },
      pages: (sourceRecord.pages || []).map((page) => ({ ...page })),
    };
    let completed = 0;
    let imagesReady = 0;
    let audioReady = 0;
    const invalidAssetKeys = new Set(record.generation.invalidAssetKeys || []);
    const usableStoredAsset = async (key, kind) => !invalidAssetKeys.has(key) && isUsableStoryBlob(await getStoryAsset(key), kind);
    for (const assetKey of [record.coverAssetKey, ...record.pages.map((page) => page.imageAssetKey)]) if (assetKey && await usableStoredAsset(assetKey, 'image')) imagesReady += 1;
    for (const assetKey of [record.coverAudioAssetKey, ...record.pages.map((page) => page.audioAssetKey)]) if (assetKey && await usableStoredAsset(assetKey, 'audio')) audioReady += 1;
    completed = imagesReady + audioReady;
    const update = async (patch) => {
      record = { ...record, ...patch, generation: { ...record.generation, completed, imagesReady, audioReady, ...patch.generation } };
      const snapshot = record;
      const persist = persistChainRef.current.then(() => persistCustom(snapshot));
      persistChainRef.current = persist.catch(() => {});
      await persist;
      setCreatorProgress({ ...record.generation, title: record.title });
    };
    const saveAsset = async (key, blob) => {
      if (!await saveStoryAsset(key, blob)) {
        throw new Error('This device could not save a story page. Please check available storage, then try again.');
      }
      publishSavedAsset(record, key);
      invalidAssetKeys.delete(key);
      record = { ...record, generation: { ...record.generation, invalidAssetKeys: [...invalidAssetKeys] } };
      if (key.endsWith(':cover') || key.endsWith(':image')) imagesReady += 1;
      else audioReady += 1;
    };
    try {
      let coverBlob = await getStoryAsset(record.coverAssetKey);
      if (!await usableStoredAsset(record.coverAssetKey, 'image')) {
        const coverPrompt = `${record.coverPrompt}. Style: ${record.style}. ${record.seriesBible ? `Approved series bible: ${record.seriesBible.name}; appearance: ${record.seriesBible.appearance}; personality: ${record.seriesBible.personality}; friends/world: ${record.seriesBible.friendsWorld}.` : ''} Character continuity guide: ${continuityPrompt(record)}. Make a polished children’s picture-book cover with the complete main character visible, clear margins, strong focal composition, no cropping, no words, no letters, no logos, no watermark.`;
        coverBlob = await createStoryImage({ prompt: coverPrompt, referenceImage: record.referenceImage || undefined }, session, controller.signal);
        await saveAsset(record.coverAssetKey, coverBlob);
        completed += 1;
        await update({ generation: { stage: 'cover', currentPage: 0 } });
      }
      const coverReference = await compactReferenceImage(coverBlob);

      let coverAudio = await getStoryAsset(record.coverAudioAssetKey);
      if (!await usableStoredAsset(record.coverAudioAssetKey, 'audio')) {
        coverAudio = await createStoryNarration({ text: `${record.title}. ${record.summary}`.slice(0, 420) }, session, controller.signal);
        await saveAsset(record.coverAudioAssetKey, coverAudio);
        completed += 1;
        await update({ generation: { stage: 'narration', currentPage: 0 } });
      }

      // Three workers keep the mobile flow quick while retaining a strict
      // cap on in-flight provider calls. Each worker completes an image then
      // its matching narration, so checkpoints remain resumable.
      const workerCount = Math.min(3, record.pages.length);
      let nextIndex = 0;
      const workPage = async () => {
        while (nextIndex < record.pages.length) {
          const index = nextIndex;
          nextIndex += 1;
          const page = record.pages[index];
          let imageBlob = await getStoryAsset(page.imageAssetKey);
          if (!await usableStoredAsset(page.imageAssetKey, 'image')) {
            const prompt = `${page.imagePrompt}. Style: ${record.style}. Character continuity guide: ${continuityPrompt(record)}. This is page ${page.number} of ${record.pages.length}. Show a clear child-friendly action with the full characters visible, varied camera angle, no cropping, no words, no letters, no logos, no watermark.`;
            imageBlob = await createStoryImage({ prompt, referenceImage: record.referenceImage || coverReference }, session, controller.signal);
            await saveAsset(page.imageAssetKey, imageBlob);
            completed += 1;
            await update({ generation: { stage: 'image', currentPage: page.number } });
          }
          if (!await usableStoredAsset(page.audioAssetKey, 'audio')) {
            const narration = await createStoryNarration({ text: page.text, previousText: record.pages[index - 1]?.text, nextText: record.pages[index + 1]?.text }, session, controller.signal);
            await saveAsset(page.audioAssetKey, narration);
            completed += 1;
            await update({ generation: { stage: 'narration', currentPage: page.number } });
          }
        }
      };
      const workers = Array.from({ length: workerCount }, () => workPage());
      try {
        await Promise.all(workers);
      } catch (error) {
        controller.abort(error);
        await Promise.allSettled(workers);
        throw error;
      }
      await validateCompleteStoryAssets(record, controller);
      invalidAssetKeys.clear();
      await update({ status: 'ready', generation: { stage: 'complete', currentPage: record.pages.length, error: null, invalidAssetKeys: [] } });
      return { ok: true };
    } catch (error) {
      if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
        const message = error.name === 'TimeoutError' ? error.message : 'Story creation was paused. Your saved pages are ready to resume.';
        try { await update({ status: 'paused', generation: { stage: 'paused', error: message } }); }
        catch { setCreatorProgress({ ...record.generation, stage: 'paused', error: message, title: record.title }); }
        return { ok: false, error: message };
      }
      const message = error?.message || 'Story generation failed';
      console.error('Storybook generation stopped', { stage: record.generation?.stage, message });
      try {
        if (error.assetKey) invalidAssetKeys.add(error.assetKey);
        await update({ status: 'error', generation: { stage: 'error', error: message, invalidAssetKeys: [...invalidAssetKeys] } });
      } catch (saveError) {
        console.error('Storybook error could not be saved', saveError);
        setCreatorProgress({ ...record.generation, stage: 'error', error: message, title: record.title });
      }
      return { ok: false, error: message };
    } finally {
      if (generationAbortRef.current === controller) generationAbortRef.current = null;
      if (generationBookIdRef.current === record.id) generationBookIdRef.current = null;
      setActiveGenerationId(null);
    }
  }, [persistCustom]);

  const createCustomStory = useCallback(async (input) => {
    if (!verifiedActiveReader(activeChildIdRef.current) || !input?.childId || input.childId !== activeChildIdRef.current) {
      setCreatorError('Check the saved reader profile before creating a story. The selected child must match a verified saved profile.');
      return;
    }
    if (libraryStorageState !== 'available') {
      setCreatorError('Saved story storage is unavailable. Try again when the library can be read so your new draft can be preserved.');
      return;
    }
    if (creatorBusy || countDailyCreations() >= DAILY_LIMIT || customRecords.length >= LIBRARY_LIMIT) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setCreatorError('Connect to the internet to create a story, then you can read it offline.');
      return;
    }
    setCreatorBusy(true);
    setCreatorError('');
    const controller = new AbortController();
    generationAbortRef.current = controller;
    const startedAt = Date.now();
    const plannedPageCount = pagesForAgeBand(input.ageBand);
    setCreatorProgress({ stage: 'connecting', completed: 0, total: 2 + plannedPageCount * 2, pageCount: plannedPageCount, currentPage: 0, startedAt });
    try {
      const session = await createStorySession(controller.signal);
      storySessionRef.current = session;
      if (!verifiedActiveReader(input.childId) || input.childId !== activeChildIdRef.current) {
        throw new Error('The saved reader changed before story planning began. Check the reader profile and try again.');
      }
      const selectedSeries = availableSeries.find((item) => item.id === input.seriesId) || null;
      setCreatorProgress({ stage: 'planning', completed: 0, total: 2 + plannedPageCount * 2, pageCount: plannedPageCount, currentPage: 0, startedAt });
      const outline = await createStoryOutline({ ...input, seriesContext: selectedSeries || undefined }, session, controller.signal);
      if (!verifiedActiveReader(input.childId) || input.childId !== activeChildIdRef.current) {
        throw new Error('The saved reader changed while the story was being planned. Check the reader profile and try again; no story was saved.');
      }
      const record = makeCustomBook(outline, input, selectedSeries);
      const saved = await saveStoryBook(record);
      if (!saved) throw new Error('This device could not save the new story. Please check available storage, then try again.');
      setCustomRecords((records) => [record, ...records]);
      generationBookIdRef.current = record.id;
      setActiveGenerationId(record.id);
      setCreatorProgress({ ...record.generation, title: record.title });
      const outcome = await runCustomGeneration(record, session, controller);
      if (outcome.ok) {
        incrementDailyCreations();
        setDailyLimitReached(countDailyCreations() >= DAILY_LIMIT);
        window.setTimeout(() => {
          setShowCreator(false);
          setCreatorProgress(null);
        }, 900);
      } else setCreatorError(`${outcome.error} Your story text and finished assets are saved; use Resume on the book card to continue.`);
    } catch (error) {
      const message = error?.message || 'Story outline could not be created. Please try again.';
      setCreatorError(error?.name === 'AbortError' ? 'Paused before the story text was ready. Start again to create the outline.' : message);
    } finally {
      if (generationAbortRef.current === controller) generationAbortRef.current = null;
      if (generationBookIdRef.current && !customRecordsRef.current.some((record) => record.id === generationBookIdRef.current)) generationBookIdRef.current = null;
      setActiveGenerationId(generationBookIdRef.current);
      setCreatorBusy(false);
    }
  }, [availableSeries, creatorBusy, customRecords.length, libraryStorageState, runCustomGeneration]);

  const resumeCustomStory = useCallback(async (book) => {
    if (!verifiedActiveReader(activeChildIdRef.current) || (book.childId && book.childId !== activeChildIdRef.current)) {
      setCreatorError('Check the saved reader profile for this story before resuming its generation.');
      return;
    }
    if (creatorBusy || generationAbortRef.current) return;
    const record = await getStoryBookRecord(book.id);
    if (!record) return;
    const requestedReaderId = activeChildIdRef.current;
    if (!verifiedActiveReader(requestedReaderId) || (record.childId && record.childId !== requestedReaderId)) {
      setCreatorError('The saved reader changed before generation resumed. Check the reader profile and try again.');
      return;
    }
    setCreatorBusy(true);
    const controller = new AbortController();
    generationAbortRef.current = controller;
    generationBookIdRef.current = record.id;
    setActiveGenerationId(record.id);
    try {
      const session = await createStorySession(controller.signal);
      storySessionRef.current = session;
      if (!verifiedActiveReader(requestedReaderId) || requestedReaderId !== activeChildIdRef.current) {
        throw new Error('The saved reader changed before generation resumed. Check the reader profile and try again.');
      }
      await runCustomGeneration(record, session, controller);
    } catch (error) {
      setCreatorError(error?.message || 'Story generation could not resume. Please try again.');
      if (generationAbortRef.current === controller) generationAbortRef.current = null;
      generationBookIdRef.current = null;
      setActiveGenerationId(null);
    } finally {
      setCreatorBusy(false);
    }
  }, [creatorBusy, runCustomGeneration]);

  const pauseGeneration = () => generationAbortRef.current?.abort();

  const generateSeriesReference = useCallback(async (draft) => {
    const requestedReaderId = activeChildIdRef.current;
    if (!verifiedActiveReader(requestedReaderId)) {
      throw new Error('Check the saved reader profile before generating a character reference.');
    }
    const session = await createStorySession();
    if (!verifiedActiveReader(requestedReaderId) || requestedReaderId !== activeChildIdRef.current) {
      throw new Error('The saved reader changed before the character reference was generated. Check the reader profile and try again.');
    }
    storySessionRef.current = session;
    const prompt = `Create one polished child-friendly character reference portrait for a storybook series. Appearance: ${draft.appearance}. Personality: ${draft.personality || 'friendly and curious'}. Friends/world: ${draft.friendsWorld || 'a bright welcoming world'}. Style: ${draft.visualStyle}. Show the complete character on a clean simple background, consistent silhouette, no words, no logos, no watermark.`;
    const blob = await createStoryImage({ prompt }, session);
    return blobToDataUrl(blob);
  }, []);

  const saveSeries = useCallback(async (item) => {
    if (!await saveStorySeries(item)) throw new Error('This device could not save the series. Keep this form open and try again.');
    setSeries((items) => [...items.filter((seriesItem) => seriesItem.id !== item.id), item]);
  }, []);

  const saveProfile = useCallback(async (profile) => {
    if (profileStorageState !== 'available') throw new Error('Reader profile storage must be checked before editing saved profiles.');
    if (!await saveChildProfile(profile)) throw new Error('This device could not save the reader profile. Keep this form open and try again.');
    setProfiles((items) => [...items.filter((item) => item.id !== profile.id), profile]);
  }, [profileStorageState]);

  const removeProfile = useCallback(async (profile) => {
    if (profileStorageState !== 'available') throw new Error('Reader profile storage must be checked before editing saved profiles.');
    if (profile.id === activeChildId && !verifiedActiveReader(profile.id)) throw new Error('Verify or explicitly choose the active reader before removing that profile.');
    if (profiles.length <= 1) return;
    if (!await deleteChildProfile(profile)) throw new Error('This device could not remove the reader profile. It is still saved. Please try again.');
    setProfiles((items) => items.filter((item) => item.id !== profile.id));
    if (activeChildId === profile.id) {
      const next = profiles.find((item) => item.id !== profile.id);
      if (next) {
        activeChildIdRef.current = next.id;
        const preference = { ok: true, status: 'saved', id: next.id };
        activePreferenceRef.current = preference;
        setActivePreferenceState(preference);
        readerIdentityRef.current = { ...readerIdentityRef.current, activeChildId: next.id, preferenceOk: true };
        setActiveChildId(next.id); saveActiveChildId(next.id);
      }
    }
  }, [activeChildId, profileStorageState, profiles]);

  const selectChild = useCallback((id) => {
    if (profileStorageState !== 'available' || readerCheckBusyRef.current || !profiles.some((profile) => profile.id === id)) return;
    activeChildIdRef.current = id;
    const preference = { ok: true, status: 'selected', id };
    activePreferenceRef.current = preference;
    setActivePreferenceState(preference);
    readerIdentityRef.current = { ...readerIdentityRef.current, activeChildId: id, preferenceOk: true };
    setActiveChildId(id); saveActiveChildId(id); setAgeFilter('all'); setShowProfiles(false); setReaderCheckError('');
  }, [profileStorageState, profiles]);

  const exportStories = useCallback(async () => {
    setBackupBusy(true); setBackupMessage('');
    try {
      const readyBooks = customRecords.filter((book) => book.status === 'ready');
      const keys = [...new Set(readyBooks.flatMap((book) => [book.coverAssetKey, book.coverAudioAssetKey, ...(book.pages || []).flatMap((page) => [page.imageAssetKey, page.audioAssetKey])]).filter(Boolean))];
      const assets = await Promise.all(keys.map(async (key) => ({ key, blob: await getStoryAsset(key) })));
      const serialized = await createStorybookBackup({ books: readyBooks, assets, progress: progressByChild });
      const url = URL.createObjectURL(new Blob([serialized], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = `amari-storybooks-${new Date().toISOString().slice(0, 10)}.json`; link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setBackupMessage('Story backup downloaded. Keep it somewhere safe.');
    } catch (error) { setBackupMessage(error.message || 'Could not create the story backup.'); }
    finally { setBackupBusy(false); }
  }, [customRecords, progressByChild]);

  const importStories = useCallback(async (event) => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    setBackupBusy(true); setBackupMessage('');
    try {
      if (file.size > 120 * 1024 * 1024) throw new Error('This story backup is too large or is not a valid backup file.');
      const backup = readStorybookBackup(await file.text());
      const backupAssets = new Map(backup.assets.map((asset) => [asset.key, asset.blob]));
      const mediaInventory = backup.books.flatMap((book) => storyAssetInventory(book).map((item) => ({ ...item, blob: backupAssets.get(item.key) })));
      setBackupMessage('Checking every picture and narration file before restoring…');
      await validateStoryMediaAssets(mediaInventory, { concurrency: 3 });
      const result = await importStorybookRecords(backup);
      const profileIds = new Set(profiles.map((profile) => profile.id));
      let progressImportMessage = '';
      if (progressStorageState === 'ready' || progressStorageState === 'fresh') {
        let merged = progressByChild;
        for (const [childId, entries] of Object.entries(backup.progress)) {
          if (!profileIds.has(childId)) continue;
          for (const [slug, value] of Object.entries(entries)) {
            if (Object.hasOwn(merged[childId] || {}, slug)) continue;
            const saved = commitStoryProgress(childId, slug, value);
            if (!saved.ok) { progressImportMessage = ' Reading progress import was incomplete; retry from this backup to finish it.'; break; }
            merged = saved.progress;
          }
          if (progressImportMessage) break;
        }
        const refreshedProgress = readStoryProgressState();
        if (refreshedProgress.ok) { setProgressByChild(refreshedProgress.progress); setProgressStorageState(refreshedProgress.status); }
        else { progressImportMessage = ' Reading progress could not be verified; retry from this backup to finish the import.'; setProgressStorageState(refreshedProgress.status); }
      } else {
        progressImportMessage = ' Saved reading progress could not be safely read, so it was not imported.';
      }
      const refreshedInventory = await getStoryLibraryInventory();
      if (refreshedInventory.available) setCustomRecords(refreshedInventory.books);
      else setLibraryStorageState('unavailable');
      setBackupMessage(`Restored ${result.added} ${result.added === 1 ? 'story' : 'stories'}${result.skipped ? `; kept ${result.skipped} existing ${result.skipped === 1 ? 'story' : 'stories'}` : ''}${refreshedInventory.available ? '.' : '; the saved library could not be refreshed, so keep this browser’s site data intact.'}${progressImportMessage}`);
    } catch (error) { setBackupMessage(error.message || 'Could not restore this story backup.'); }
    finally { setBackupBusy(false); }
  }, [profiles, progressByChild, progressStorageState]);

  const toggleBookFavourite = useCallback((book) => {
    const current = readerAccess.verified ? getBookProgress(progressByChild, activeChild.id, book.slug) : {};
    persistProgress(activeChild.id, book.slug, { favourite: !current.favourite });
  }, [activeChild.id, persistProgress, progressByChild, readerAccess.verified]);

  const startSeriesStory = useCallback((book) => {
    if (!book?.seriesId) return;
    setInitialSeriesId(book.seriesId);
    setCreatorError('');
    setCreatorProgress(null);
    setDailyLimitReached(countDailyCreations() >= DAILY_LIMIT);
    setShowCreator(true);
  }, []);

  const onImageError = (key) => {
    setImageErrors((errors) => ({ ...errors, [key]: true }));
    if (selectedBook?.custom && key === `${selectedBook.slug}-${isCover ? 'cover' : pageIndex}`) {
      setReaderMedia((media) => ({ ...media, bookId: selectedBook.id, index: pageIndex, status: 'missing' }));
    }
    const coverBook = library.find((book) => `${book.slug}-cover` === key);
    if (coverBook?.custom) setCoverMedia((media) => ({ ...media, [coverBook.id]: { ...(media[coverBook.id] || {}), status: 'missing' } }));
  };
  const retryReaderMedia = () => {
    stopAudio();
    const imageKey = isCover ? selectedBook?.coverAssetKey : currentPage?.imageAssetKey;
    const audioKey = isCover ? selectedBook?.coverAudioAssetKey : currentPage?.audioAssetKey;
    for (const key of [imageKey, audioKey].filter(Boolean)) hydratorRef.current?.invalidateAsset(key);
    const errorKey = `${selectedBook?.slug}-${isCover ? 'cover' : pageIndex}`;
    setImageErrors((errors) => Object.fromEntries(Object.entries(errors).filter(([key]) => key !== errorKey)));
    setAudioError(false);
    setReaderMedia({ bookId: selectedBook?.id, index: pageIndex, status: 'loading', image: null, audio: null, missingKeys: [] });
    setAssetVersion((value) => value + 1);
    setReaderRetry((value) => value + 1);
  };
  const retryCover = async (book) => {
    hydratorRef.current?.invalidateAsset(book.coverAssetKey);
    const errorKey = `${book.slug}-cover`;
    setImageErrors((errors) => Object.fromEntries(Object.entries(errors).filter(([key]) => key !== errorKey)));
    setCoverMedia((current) => ({ ...current, [book.id]: { status: 'loading' } }));
    const result = await hydratorRef.current?.loadCover(book);
    setCoverMedia((current) => ({ ...current, [book.id]: { ...result, status: !result?.available ? 'unavailable' : result.missingKeys.length ? 'missing' : 'ready' } }));
  };
  const retryProgressSave = () => { const action = pendingProgressRef.current; if (action) persistProgress(action.childId, action.slug, action.patch); };
  const progressStorageReadable = ['ready', 'fresh', 'saved', 'completed', 'recovered', 'legacy-complete'].includes(progressStorageState);
  const retryLibraryCompletion = () => {
    const pendingReceipt = pendingCompletionReceiptRef.current;
    if (pendingReceipt?.receipt) { claimCompletionReceipt(pendingReceipt.receipt, pendingReceipt.slug, pendingReceipt.readerChildId); return; }
    const pending = pendingCompletionActionRef.current;
    if (pending && !verifiedActiveReader(pending.childId)) {
      setReaderCheckError('Select the same verified reader who finished this story before retrying its save.');
      return;
    }
    const book = pending && library.find((item) => item.slug === pending.slug);
    if (book) openBook(book);
  };
  const readingActionLabel = (book) => activeBookProgress(book.slug).pageIndex >= 0 && !activeReaderCompleted(book.slug) ? 'Continue story' : 'Read story';

  const closeOptions = () => setFocusPanel('');
  const showShelf = next => {
    setShelf(next); setAgeFilter('all'); setSeriesFilter('all'); setStorySearch(''); setLibraryPage(0);
  };
  const beginCreation = () => {
    if (creatorBusy || !verifiedActiveReader(activeChildIdRef.current)) return;
    closeOptions();
    setDailyLimitReached(countDailyCreations() >= DAILY_LIMIT);
    setCreatorError(''); setCreatorProgress(null); setShowCreator(true);
  };
  const soundChoice = { label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { onToggleSound?.(); closeOptions(); } };
  const recoveryChoices = [
    ...(!readerAccess.verified ? [{ label: 'Retry reader check', action: retryReaderCheck, disabled: readerCheckBusy }] : []),
    ...(progressSaveError ? [{ label: 'Retry saved progress', action: retryProgressSave }] : []),
    ...(!progressStorageReadable && !progressSaveError ? [{ label: 'Retry progress check', action: () => void reconcileStoryRewards() }] : []),
  ];

  if (selectedBook && comprehensionActive) {
    const question = comprehension[comprehensionStep];
    const answerIsCorrect = comprehensionChoice === question?.answer;
    const advance = () => { if (!answerIsCorrect) { setComprehensionChoice(''); return; } if (comprehensionStep + 1 >= comprehension.length) { if (completedRunSeedRef.current !== comprehensionSeed) { completedRunSeedRef.current = comprehensionSeed; onGameEvent?.('storybooks', 'level_complete', { round: comprehension.length, seed: comprehensionSeed, pageIndex }); } onGameEvent?.('storybooks', 'comprehension_complete', { round: comprehension.length, seed: comprehensionSeed }); setComprehensionActive(false); closeBook(); return; } const nextStep = comprehensionStep + 1; setComprehensionStep(nextStep); setComprehensionChoice(''); setComprehensionHadMistake(false); onGameEvent?.('storybooks', 'question', { round: nextStep + 1, seed: comprehensionSeed, pageIndex }); };
    return <div className="focus-game stories-focus" data-board-focus="">
      <main className="focus-game-body is-menu">
        <header className="focus-game-heading"><p>Story Detective · {comprehensionStep + 1} of {comprehension.length}</p><h1>{focusPanel ? selectedBook.title : question?.prompt}</h1></header>
        {focusPanel ? <FocusMenu choices={[
          { label: 'Hear the question', action: () => { closeOptions(); hearComprehensionAudio(question.prompt, 'question'); } },
          ...(comprehensionChoice ? [{ label: 'Hear the response', action: () => { closeOptions(); hearComprehensionAudio(answerIsCorrect ? question.why : question.clue, 'feedback'); } }] : []),
          ...recoveryChoices, soundChoice, { label: 'Back to stories', action: closeBook },
        ]} onBack={closeOptions} /> : <>
          {!readerAccess.verified && <p role="status" className="focus-game-message">{readerCheckError || readerAccessMessage}</p>}
          {!answerIsCorrect && <div className="stories-quiz-answers" aria-label="Choose your answer">
            {question?.choices.map(choice => <button key={choice} type="button" className="focus-game-button" aria-pressed={choice === comprehensionChoice} onClick={() => chooseComprehensionAnswer(choice)}>{choice}</button>)}
          </div>}
          {comprehensionChoice && <p className="pattern-focus-explanation" role="status">{answerIsCorrect ? question.why : question.clue}</p>}
          <div className="focus-game-actions mt-3">
            {comprehensionChoice && <button type="button" className="focus-game-button is-primary" onClick={advance}>{answerIsCorrect ? comprehensionStep + 1 === comprehension.length ? 'Finish' : 'Next question' : 'Try again'}</button>}
            <button type="button" className="focus-game-button" onClick={() => setFocusPanel('quiz')}>Options</button>
          </div>
        </>}
      </main>
    </div>;
  }

  if (!selectedBook) {
    const inMyStories = shelf === 'my-stories';
    const totalPages = Math.max(1, Math.ceil(filteredBooks.length / LIBRARY_PAGE_SIZE));
    const libraryChoices = [
      { label: 'Find a story', action: () => setFocusPanel('filters') },
      ...(!askia ? [{ label: 'Edit children', action: () => setShowProfiles(true) }] : []),
      { label: 'Characters and series', action: () => setShowSeries(true) },
      { label: 'Back up saved stories', disabled: backupBusy || !customRecords.length || libraryStorageState !== 'available' || !progressStorageReadable, action: exportStories },
      { label: 'Restore a story backup', disabled: backupBusy, action: () => backupInputRef.current?.click() },
      ...recoveryChoices,
      ...(completionSaveError ? [{ label: pendingCompletionReceiptRef.current ? 'Retry saved reward' : 'Return to story', action: retryLibraryCompletion }] : []),
      soundChoice, { label: askia ? 'Go home' : 'Back to Read & Write', action: leaveToWorld },
    ];
    return <div className="focus-game stories-focus" data-board-focus="">
      <main className={`focus-game-body${focusPanel ? ' is-menu' : ''}`}>
        <header className="focus-game-heading"><h1>{focusPanel === 'filters' ? 'Find a story' : inMyStories && !focusPanel ? 'My stories' : 'Storybook Studio'}</h1></header>
        {focusPanel === 'library' ? <FocusMenu choices={libraryChoices} onBack={closeOptions} />
          : focusPanel === 'filters' ? <div className="focus-game-menu">
            <label>Search stories <input type="search" value={storySearch} onChange={event => setStorySearch(event.target.value)} placeholder="Title or series" /></label>
            <label>Shelf <select value={shelf} onChange={event => setShelf(event.target.value)}>{STORYBOOK_SHELVES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
            <label>Age <select value={ageFilter} onChange={event => setAgeFilter(event.target.value)}><option value="all">All ages</option><option value="3-4">Ages 3–4</option><option value="5-6">Ages 5–6</option><option value="7-8">Ages 7–8</option></select></label>
            {availableSeries.length > 0 && <label>Series <select value={seriesFilter} onChange={event => setSeriesFilter(event.target.value)}><option value="all">All series</option>{availableSeries.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
            {!askia && <label>Reading as <select value={readerAccess.verified ? activeChild.id : ''} disabled={profileStorageState !== 'available' || readerCheckBusy} onChange={event => selectChild(event.target.value)}>
              {!readerAccess.verified && <option value="" disabled>Choose a saved reader</option>}{profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.displayName} · {profile.ageBand}</option>)}
            </select></label>}
            <button type="button" className="focus-game-button is-primary" onClick={closeOptions}>Show stories</button>
          </div> : <>
            <p role="status" aria-label="Story library inventory" className="focus-game-message">
              {bundledBooks.length} included · {libraryStorageState === 'available' ? `${customRecords.length} saved on this browser` : libraryStorageState === 'loading' ? 'checking saved stories' : 'saved stories could not be read'}
            </p>
            {libraryStorageState === 'unavailable' && <p role="status">Keep this browser’s site data intact. You can still read included stories.</p>}
            <div className="focus-game-actions">
              <button type="button" className="focus-game-button" onClick={() => showShelf(inMyStories ? 'all' : 'my-stories')} disabled={!inMyStories && libraryStorageState !== 'available'}>{inMyStories ? 'All stories' : 'My stories'}</button>
              <button type="button" className="focus-game-button" onClick={beginCreation} disabled={creatorBusy || customRecords.length >= LIBRARY_LIMIT || libraryStorageState !== 'available' || !readerAccess.verified}>Create a story</button>
              <button type="button" className="focus-game-button" onClick={() => setFocusPanel('library')}>Options</button>
            </div>
            <section className="stories-focus-library" aria-label="Storybook library">
              {visibleBooks.map(book => {
                const cover = book.custom ? coverMedia[book.id]?.image : book.cover;
                const hasPlace = readingActionLabel(book) === 'Continue story';
                return <button type="button" key={book.slug} onClick={() => openBook(book)} aria-label={`${hasPlace ? 'Continue' : 'Open'} ${book.title}`}>
                  <span className="stories-focus-cover">
                    {cover && !imageErrors[`${book.slug}-cover`] ? <img src={cover} alt="" onError={() => onImageError(`${book.slug}-cover`)} /> : <span aria-hidden="true">{book.emoji}</span>}
                  </span>
                  <span><strong>{book.title}</strong><small>{book.custom && book.status !== 'ready' ? 'Saved draft' : hasPlace ? 'Continue reading' : activeReaderCompleted(book.slug) ? 'Read again' : book.seriesName}</small></span>
                </button>;
              })}
            </section>
            {!visibleBooks.length && <p className="focus-game-message">{inMyStories ? 'No saved stories are visible on this shelf.' : 'No stories match these filters.'}</p>}
            {totalPages > 1 && <label className="focus-game-menu mt-3">Library page
              <select value={libraryPage} onChange={event => setLibraryPage(Number(event.target.value))}>{Array.from({ length: totalPages }, (_, page) => <option key={page} value={page}>{page + 1} of {totalPages}</option>)}</select>
            </label>}
          </>}
        {(progressSaveError || completionSaveError || !readerAccess.verified || backupMessage || (!showCreator && creatorError)) && <p role="status" className="focus-game-message">{progressSaveError || completionSaveError || (!readerAccess.verified && (readerCheckError || readerAccessMessage)) || backupMessage || creatorError}</p>}
        <input ref={backupInputRef} type="file" accept="application/json,.json" onChange={importStories} className="hidden" aria-label="Choose a story backup file" />
      </main>
      {showCreator && <StorybookCreator onClose={() => { if (!creatorBusy) { setShowCreator(false); setInitialSeriesId(''); setCreatorProgress(null); } }} onCreate={createCustomStory} onPause={pauseGeneration} onShelf={() => { if (activeGenerationId) setShowCreator(false); }} seriesOptions={availableSeries} selectedChild={activeChild} initialSeriesId={initialSeriesId} busy={creatorBusy} progress={creatorProgress} error={creatorError} dailyLimitReached={dailyLimitReached || customRecords.length >= LIBRARY_LIMIT} />}
        {!askia && showProfiles && <StorybookProfiles profiles={profiles} storageState={profileStorageState} activeId={activeChild.id} onSelect={selectChild} onSave={saveProfile} onDelete={removeProfile} onClose={() => setShowProfiles(false)} />}
        {showSeries && <StorybookSeriesLibrary series={series} storageState={seriesStorageState} onSave={saveSeries} onGenerateReference={generateSeriesReference} onUse={(item) => { setInitialSeriesId(item.id); setShowSeries(false); setShowCreator(true); }} onClose={() => setShowSeries(false)} />}
    </div>;
  }

  const pendingCompletion = completionSaveError && completionErrorSlugRef.current === selectedBook.slug;
  const nextPage = async () => {
    if (pageIndex < pages.length - 1) { goToScreen(pageIndex + 1, { shouldPlay: started && autoRead }); return; }
    if (!await finishBook()) return;
    if (comprehension.length) {
      stopAudio();
      onGameEvent?.('storybooks', 'comprehension_started', { round: 1, seed: comprehensionSeed });
      onGameEvent?.('storybooks', 'question', { round: 1, seed: comprehensionSeed, pageIndex });
      setComprehensionActive(true);
    } else closeBook();
  };
  const readerChoices = [
    ...(!isCover ? [{ label: 'Previous page', action: () => { closeOptions(); goToScreen(pageIndex - 1, { shouldPlay: false }); } }] : []),
    ...(currentAudio ? [{ label: 'Replay narration', action: () => { closeOptions(); replayNarration(); } }] : []),
    { label: autoRead ? 'Turn auto-read off' : 'Turn auto-read on', action: () => { setAutoRead(value => !value); closeOptions(); } },
    { label: activeBookProgress(selectedBook.slug).favourite ? 'Remove favourite' : 'Add favourite', action: () => { toggleBookFavourite(selectedBook); closeOptions(); } },
    ...(selectedBook.seriesId ? [{ label: `New story with ${selectedBook.seriesName}`, disabled: creatorBusy || !readerAccess.verified, action: () => { const book = selectedBook; closeBook(); startSeriesStory(book); } }] : []),
    ...(selectedBook.custom && selectedBook.status !== 'ready'
      ? activeGenerationId === selectedBook.id ? [{ label: 'Pause and save', action: () => { closeOptions(); pauseGeneration(); } }]
        : [{ label: 'Resume making this draft', disabled: creatorBusy, action: () => { const book = selectedBook; closeBook(); resumeCustomStory(book); } }]
      : []),
    ...(selectedBook.custom && coverMedia[selectedBook.id]?.status !== 'ready' ? [{ label: 'Retry saved cover', action: () => { closeOptions(); void retryCover(selectedBook); } }] : []),
    ...(selectedBook.custom && (audioError || readerScreenMedia.status === 'unavailable' || readerScreenMedia.status === 'missing') ? [{ label: 'Retry saved media', action: () => { closeOptions(); retryReaderMedia(); } }] : []),
    ...(!isCover ? (STORYBOOK_WORD_HELP[selectedBook.slug] || []).map(([word, meaning]) => ({
      label: `Word help: ${word}`, description: meaning, button: 'Hear meaning', action: () => {
        onGameEvent?.('storybooks', 'hint', { seed: comprehensionSeed, round: pageIndex + 1, pageIndex, hintType: 'word_help' });
        speak(meaning);
      },
    })) : []),
    ...recoveryChoices, soundChoice, { label: 'Back to stories', action: closeBook },
  ];

  return <div className="focus-game stories-focus" data-board-focus="">
    <main className={`focus-game-body${focusPanel ? ' is-menu' : ' stories-focus-reader'}`}>
      <header className="focus-game-heading">
        <p aria-label={`Page ${Math.max(1, screenNumber)} of ${totalScreens}`}>{isCover ? 'Cover' : `Page ${pageIndex + 1} of ${pages.length}`}</p>
        <h1>{selectedBook.title}</h1>
      </header>
      {focusPanel ? <FocusMenu choices={readerChoices} onBack={closeOptions} /> : <>
        {(!readerAccess.verified || progressSaveError || pendingCompletion) && <p className="focus-game-message" role="status">{pendingCompletion ? completionSaveError : progressSaveError || readerCheckError || readerAccessMessage}</p>}
        <section className="stories-focus-reading" aria-label="Story page">
          <div className="stories-focus-illustration">
            {currentImage && !imageErrors[`${selectedBook.slug}-${isCover ? 'cover' : pageIndex}`]
              ? <img src={currentImage} alt={isCover ? `${selectedBook.title} cover` : `${selectedBook.title}, ${currentPage.title}`} onError={() => onImageError(`${selectedBook.slug}-${isCover ? 'cover' : pageIndex}`)} />
              : <span aria-hidden="true">{selectedBook.emoji}</span>}
          </div>
          <div className="stories-focus-page" role="region" aria-label="Story words">
            {!isCover && <h2>{currentPage.title}</h2>}
            <p>{isCover ? selectedBook.summary : currentPage.text}</p>
            {selectedBook.custom && selectedBook.status !== 'ready' && <p className="text-sm">Saved draft. You can read the text now.</p>}
            {audioError && <p role="status" className="text-sm">Read-aloud is unavailable for this page.</p>}
          </div>
        </section>
        <div className="focus-game-actions mt-3">
          {isCover
            ? <button type="button" className="focus-game-button is-primary" onClick={startReading}>Start reading</button>
            : <button type="button" className="focus-game-button is-primary" onClick={nextPage}>{pendingCompletion ? 'Retry saving story' : pageIndex >= pages.length - 1 ? comprehension.length ? 'Start story questions' : 'Finish story' : 'Next page'}</button>}
          {currentAudio && soundOn && (started || !isCover) && <button type="button" className="focus-game-button" onClick={togglePlayback}>{playing ? 'Pause' : 'Hear page'}</button>}
          <button type="button" className="focus-game-button" onClick={() => setFocusPanel('reader')}>Options</button>
        </div>
      </>}
      <audio ref={audioRef} src={currentAudio || undefined} preload="auto" onEnded={onEnded} onError={() => { setAudioError(true); setPlaying(false); }} aria-label="Story narration" />
    </main>
  </div>;
};

export default StorybookStudio;
