import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, Check, Download, Headphones, Pause, Play, RotateCcw, Upload,
  Volume2, VolumeX,
} from 'lucide-react';
import { loadStoryBookManifest, STORYBOOK_CATALOG } from '../../data/storybooks.js';
import StorybookCreator from './StorybookCreator.jsx';
import StorybookProfiles from './StorybookProfiles.jsx';
import StorybookSeriesLibrary from './StorybookSeriesLibrary.jsx';
import { createStoryImage, createStoryNarration, createStoryOutline, createStorySession } from '../../data/storybookApi.js';
import { isUsableStoryBlob, storyAssetInventory, validateStoryMediaAssets, validateStoryMediaBlob } from '../../data/storybookAssets.js';
import { getStoryAsset, getStoryAssetInventory, getStoryBookRecord, getStoryLibraryInventory, getChildProfilesInventory, saveChildProfile, deleteChildProfile, getStorySeriesInventory, saveStorySeries, saveStoryAsset, saveStoryBook, importStorybookRecords } from '../../data/storybookStorage.js';
import { pagesForAgeBand } from '../../data/storybookValidation.js';
import { commitStoryCompletion, commitStoryProgress, getBookProgress, readActiveChildId, readStoryProgress, readStoryProgressState, saveActiveChildId } from '../../data/storybookProfiles.js';
import { decorateStoryBook, filterStoryBooks, STORYBOOK_SHELVES } from '../../data/storybookLibrary.js';
import { createStorybookBackup, readStorybookBackup } from '../../data/storybookBackup.js';
import { createComprehensionRandom, createComprehensionSeed, shuffledComprehension, STORYBOOK_WORD_HELP } from '../../data/storybookLearning.js';
import { createStorybookHydrator } from '../../data/storybookHydration.js';
import { storyCompletionReceiptBelongsToPlayer } from '../../data/storybookRewardScope.js';

const completionKey = (slug) => `amari_storybook_complete_${slug}`;

const readCompletion = (slug, childId = 'amari') => {
  try {
    const progress = getBookProgress(readStoryProgress(), childId, slug);
    return progress.completed === true || (childId === 'amari' && window.localStorage.getItem(completionKey(slug)) === '1');
  } catch {
    return false;
  }
};

const assetLabel = (book) => `${book.title}, ${book.style}, ages ${book.ageBand}`;

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
  const [library, setLibrary] = useState(STORYBOOK_CATALOG);
  const [libraryStorageState, setLibraryStorageState] = useState('loading');
  const [profileStorageState, setProfileStorageState] = useState('loading');
  const [seriesStorageState, setSeriesStorageState] = useState('loading');
  const [bundledBooks, setBundledBooks] = useState(STORYBOOK_CATALOG);
  const [customRecords, setCustomRecords] = useState([]);
  const customRecordsRef = useRef(customRecords);
  customRecordsRef.current = customRecords;
  const [showCreator, setShowCreator] = useState(false);
  const [parentToolsOpen, setParentToolsOpen] = useState(false);
  const [creatorBusy, setCreatorBusy] = useState(false);
  const [creatorError, setCreatorError] = useState('');
  const [creatorProgress, setCreatorProgress] = useState(null);
  const [activeGenerationId, setActiveGenerationId] = useState(null);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [activeChildId, setActiveChildId] = useState(() => readActiveChildId());
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

  const activeChild = profiles.find((profile) => profile.id === activeChildId) || profiles[0] || { id: 'amari', displayName: 'Amari', ageBand: '5-6' };
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
    favourites: progressByChild[activeChild.id] || {},
  }).filter((book) => !storySearch.trim() || `${book.title} ${book.subtitle} ${book.summary} ${book.seriesName || ''}`.toLocaleLowerCase().includes(storySearch.trim().toLocaleLowerCase())), [activeChild.id, ageFilter, decoratedLibrary, progressByChild, seriesFilter, shelf, storySearch]);
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
    loadIndependently(getChildProfilesInventory, (inventory) => {
      setProfileStorageState(inventory.available ? 'available' : 'unavailable');
      if (!inventory.available) return;
      setProfiles(inventory.profiles);
      const loadedActive = inventory.profiles.find((profile) => profile.id === activeChildIdRef.current) || inventory.profiles[0];
      if (loadedActive && loadedActive.id !== activeChildIdRef.current) {
        activeChildIdRef.current = loadedActive.id; setActiveChildId(loadedActive.id); saveActiveChildId(loadedActive.id);
      }
    }, () => setProfileStorageState('unavailable'));
    loadIndependently(getStorySeriesInventory, (inventory) => {
      setSeriesStorageState(inventory.available ? 'available' : 'unavailable');
      if (inventory.available) setSeries(inventory.series);
    }, () => setSeriesStorageState('unavailable'));
    return () => { cancelled = true; generationAbortRef.current?.abort(); };
  }, []);

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
    const saved = getBookProgress(progressByChild, activeChild.id, book.slug);
    const resumeIndex = readCompletion(book.slug, activeChild.id) ? -1
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
    if (isCover && selectedBook && readCompletion(selectedBook.slug, activeChild.id)) {
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
    if (isCover && !autoRead) {
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
      const selectedSeries = availableSeries.find((item) => item.id === input.seriesId) || null;
      setCreatorProgress({ stage: 'planning', completed: 0, total: 2 + plannedPageCount * 2, pageCount: plannedPageCount, currentPage: 0, startedAt });
      const outline = await createStoryOutline({ ...input, seriesContext: selectedSeries || undefined }, session, controller.signal);
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
    if (creatorBusy || generationAbortRef.current) return;
    const record = await getStoryBookRecord(book.id);
    if (!record) return;
    setCreatorBusy(true);
    const controller = new AbortController();
    generationAbortRef.current = controller;
    generationBookIdRef.current = record.id;
    setActiveGenerationId(record.id);
    try {
      const session = await createStorySession(controller.signal);
      storySessionRef.current = session;
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
    const session = await createStorySession();
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
    if (!await saveChildProfile(profile)) throw new Error('This device could not save the reader profile. Keep this form open and try again.');
    setProfiles((items) => [...items.filter((item) => item.id !== profile.id), profile]);
  }, []);

  const removeProfile = useCallback(async (profile) => {
    if (profiles.length <= 1) return;
    if (!await deleteChildProfile(profile)) throw new Error('This device could not remove the reader profile. It is still saved. Please try again.');
    setProfiles((items) => items.filter((item) => item.id !== profile.id));
    if (activeChildId === profile.id) {
      const next = profiles.find((item) => item.id !== profile.id);
      if (next) { setActiveChildId(next.id); saveActiveChildId(next.id); }
    }
  }, [activeChildId, profiles]);

  const selectChild = useCallback((id) => { activeChildIdRef.current = id; setActiveChildId(id); saveActiveChildId(id); setAgeFilter('all'); setShowProfiles(false); }, []);

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
    const current = getBookProgress(progressByChild, activeChild.id, book.slug);
    persistProgress(activeChild.id, book.slug, { favourite: !current.favourite });
  }, [activeChild.id, persistProgress, progressByChild]);

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
    const book = pending && library.find((item) => item.slug === pending.slug);
    if (book) openBook(book);
  };
  const readingActionLabel = (book) => getBookProgress(progressByChild, activeChild.id, book.slug).pageIndex >= 0 && !readCompletion(book.slug, activeChild.id) ? 'Continue story' : 'Read story';

  if (selectedBook && comprehensionActive) {
    const question = comprehension[comprehensionStep];
    const answerIsCorrect = comprehensionChoice === question?.answer;
    return (
      <main className={`storybook-reader storybook-quiz min-h-screen w-full bg-gradient-to-br ${selectedBook.accent} px-4 py-6 text-white`}>
        <div className="mx-auto flex min-h-[80vh] max-w-3xl flex-col justify-center rounded-[2rem] border border-white/25 bg-slate-950/25 p-6 shadow-2xl sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">Story Detective · {comprehensionStep + 1} of {comprehension.length}</p>
          <div className="mt-3 flex items-center gap-3"><h1 className="text-3xl font-black sm:text-4xl">{question?.prompt}</h1><button type="button" onClick={() => hearComprehensionAudio(question.prompt, 'question')} className="storybook-icon-button shrink-0" aria-label="Hear question again"><Volume2 /></button></div>
          <div className="mt-6 grid gap-3">{question?.choices.map((choice) => <button key={choice} type="button" onClick={() => chooseComprehensionAnswer(choice)} disabled={answerIsCorrect} aria-pressed={comprehensionChoice === choice} className={`min-h-14 rounded-2xl border-2 px-5 py-4 text-left text-lg font-black disabled:cursor-default ${comprehensionChoice === choice ? (answerIsCorrect ? 'border-emerald-300 bg-emerald-300 text-slate-950' : 'border-amber-300 bg-amber-300 text-slate-950') : 'border-white/40 bg-white/10 hover:bg-white/20'}`}>{choice}</button>)}</div>
          {comprehensionChoice && <div role="status" className="mt-5 flex items-start gap-3 rounded-2xl bg-white/10 p-4 text-base font-bold"><p className="flex-1">{answerIsCorrect ? question.why : question.clue}</p><button type="button" onClick={() => hearComprehensionAudio(answerIsCorrect ? question.why : question.clue, answerIsCorrect ? 'explanation' : 'clue')} className="storybook-icon-button shrink-0" aria-label={answerIsCorrect ? 'Hear why the answer is right' : 'Hear the clue again'}><Volume2 /></button></div>}
          <div className="mt-6 flex justify-between gap-3"><button type="button" onClick={() => { setComprehensionActive(false); closeBook(); }} className="storybook-nav-button">Back to stories</button>{comprehensionChoice && <button type="button" onClick={() => { if (!answerIsCorrect) { setComprehensionChoice(''); return; } if (comprehensionStep + 1 >= comprehension.length) { if (completedRunSeedRef.current !== comprehensionSeed) { completedRunSeedRef.current = comprehensionSeed; onGameEvent?.('storybooks', 'level_complete', { round: comprehension.length, seed: comprehensionSeed, pageIndex }); } onGameEvent?.('storybooks', 'comprehension_complete', { round: comprehension.length, seed: comprehensionSeed }); setComprehensionActive(false); closeBook(); return; } const nextStep = comprehensionStep + 1; setComprehensionStep(nextStep); setComprehensionChoice(''); setComprehensionHadMistake(false); onGameEvent?.('storybooks', 'question', { round: nextStep + 1, seed: comprehensionSeed, pageIndex }); }} className="storybook-nav-button">{answerIsCorrect ? (comprehensionStep + 1 >= comprehension.length ? 'Finish' : 'Next clue') : 'Try again'} <ArrowRight /></button>}</div>
        </div>
      </main>
    );
  }

  if (!selectedBook) {
    return (
      <main className="storybook-shell min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#10154d] via-[#223a91] to-[#0d7491] px-3 py-3 text-white sm:px-7 sm:py-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex items-center justify-between gap-2 sm:gap-4">
            <button type="button" onClick={leaveToWorld} className="storybook-icon-button" aria-label="Back to learning world"><ArrowLeft /></button>
            <div className="flex min-w-0 items-center justify-center gap-1.5 text-center sm:gap-2"><img src="/art/storybook-v4/reading-crew.webp" alt="" aria-hidden="true" className="h-8 w-10 shrink-0 object-contain sm:h-12 sm:w-[4.5rem]" /><div className="min-w-0"><p className="hidden text-xs font-black uppercase tracking-[0.22em] text-cyan-200 sm:block">Read &amp; Write</p><h1 className="text-2xl font-black leading-tight sm:text-5xl">Storybook Studio</h1></div></div>
            <button type="button" onClick={onToggleSound} className="storybook-icon-button" aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}>{soundOn ? <Volume2 /> : <VolumeX />}</button>
          </header>
          <div role="status" aria-label="Story library inventory" className="mt-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-cyan-50">
            <strong>{libraryStorageState === 'available' ? `${bundledBooks.length + customRecords.length} stories in this library` : `${bundledBooks.length} included stories currently available`}</strong>
            <span className="block text-cyan-100">{bundledBooks.length} included · {libraryStorageState === 'loading' ? 'checking My stories…' : libraryStorageState === 'unavailable' ? 'My stories could not be read here; this does not mean they were deleted.' : `My stories (${customRecords.length}) saved in this browser`}</span>
            {libraryStorageState === 'unavailable' && <span className="block text-amber-100">Keep this browser’s site data intact. Included stories remain available.</span>}
            <div className="mt-2 flex flex-wrap gap-2"><button type="button" disabled={libraryStorageState !== 'available'} onClick={() => { setShelf('my-stories'); setAgeFilter('all'); setSeriesFilter('all'); setStorySearch(''); }} className="min-h-12 rounded-xl bg-amber-300 px-4 font-black text-indigo-950 disabled:opacity-50">My stories ({libraryStorageState === 'available' ? customRecords.length : '—'})</button><button type="button" onClick={() => { setShelf('all'); setAgeFilter('all'); setSeriesFilter('all'); setStorySearch(''); }} className="min-h-12 rounded-xl bg-white/20 px-4 font-black text-white">Included ({bundledBooks.length})</button></div>
            <span className="block text-xs text-cyan-100">Showing {filteredBooks.length ? libraryPage * LIBRARY_PAGE_SIZE + 1 : 0}–{Math.min(filteredBooks.length, (libraryPage + 1) * LIBRARY_PAGE_SIZE)} of {filteredBooks.length} matching stories</span>
          </div>
          {progressSaveError && <div role="status" className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-amber-100 p-3 text-sm font-bold text-amber-950">{progressSaveError}<button type="button" onClick={retryProgressSave} className="min-h-11 rounded-lg bg-white px-3 font-black">Retry saved progress</button></div>}
          {!progressStorageReadable && !progressSaveError && <div role="status" className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-amber-100 p-3 text-sm font-bold text-amber-950">Reading places and favourites could not be safely read or saved. Stories remain readable; stored data was left untouched.<button type="button" onClick={() => reconcileStoryRewards()} className="min-h-11 rounded-lg bg-white px-3 font-black">Retry progress check</button></div>}
          {completionSaveError && <div role="status" className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-amber-100 p-3 text-sm font-bold text-amber-950">{completionSaveError}<button type="button" onClick={retryLibraryCompletion} className="min-h-11 rounded-lg bg-white px-3 font-black">{pendingCompletionReceiptRef.current ? 'Retry saved reward' : 'Return to story'}</button></div>}
          <div className="mt-2 flex justify-end sm:mt-4"><button type="button" onClick={() => setParentToolsOpen((open) => !open)} aria-expanded={parentToolsOpen} className="min-h-11 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-black text-white">{parentToolsOpen ? 'Hide parent tools' : 'Parent tools'}</button></div>
          {parentToolsOpen && <section className="mt-3 rounded-[2rem] border border-white/20 bg-white/10 p-5 text-center shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 to-orange-500 text-5xl shadow-lg">📚</div>
            <h2 className="mt-4 text-2xl font-black sm:text-4xl">Choose a story to explore</h2>
            <p className="mx-auto mt-2 max-w-2xl font-semibold text-blue-100">Every story has pictures, short pages and a voice to read along with. Saved stories are ready to enjoy offline.</p>
            <button type="button" onClick={() => { if (creatorBusy) return; setDailyLimitReached(countDailyCreations() >= DAILY_LIMIT); setCreatorError(''); setCreatorProgress(null); setShowCreator(true); }} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50" disabled={creatorBusy || customRecords.length >= LIBRARY_LIMIT || libraryStorageState !== 'available'}>
              ✨ Create a new story
            </button>
            {customRecords.length >= LIBRARY_LIMIT && <p className="mt-2 text-xs font-bold text-amber-100">You can keep up to twenty saved storybooks on this device.</p>}
            {libraryStorageState === 'unavailable' && <p className="mt-2 text-sm font-bold text-amber-100">Story creation is paused until saved-story storage can be read, so a new draft can be kept safely.</p>}
          </section>}
          <section className="mt-3 rounded-2xl border border-white/20 bg-white/10 p-3 sm:mt-4 sm:p-4" aria-label="Storybook filters">
            <div className="flex flex-wrap items-center gap-2"><label className="flex min-h-12 flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wide text-cyan-100"><span>Reading progress for</span><select value={activeChild.id} onChange={(event) => selectChild(event.target.value)} className="min-h-11 border-0 rounded-xl bg-white px-3 py-2 text-sm font-black text-slate-800">{profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.displayName} · {profile.ageBand}</option>)}</select></label>{profileStorageState !== 'available' && <span role="status" className="text-xs font-bold text-amber-100">{profileStorageState === 'loading' ? 'Checking reader profiles…' : 'Reader profiles could not be read; this does not mean they were deleted.'}</span>}</div>
            {parentToolsOpen && <><div className="mt-3 flex flex-wrap items-center gap-2"><button type="button" onClick={() => setShowProfiles(true)} className="min-h-12 rounded-xl bg-white/15 px-3 py-2 text-xs font-black text-white">Edit children</button><button type="button" onClick={() => setShowSeries(true)} className="min-h-12 rounded-xl bg-white/15 px-3 py-2 text-xs font-black text-white">Characters &amp; series</button><button type="button" disabled={backupBusy || !customRecords.length || libraryStorageState !== 'available' || !progressStorageReadable} onClick={exportStories} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-indigo-900 disabled:opacity-50"><Download size={16} /> Back up saved stories</button><button type="button" disabled={backupBusy} onClick={() => backupInputRef.current?.click()} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs font-black text-white disabled:opacity-50"><Upload size={16} /> Restore a story backup</button><input ref={backupInputRef} type="file" accept="application/json,.json" onChange={importStories} className="hidden" aria-label="Choose a story backup file" />{backupMessage && <p role="status" className="self-center text-xs font-bold text-amber-100">{backupMessage}</p>}</div><p className="mt-2 text-xs font-bold text-cyan-100/80">Stories on this device are shared. Each reader has their own place and favourites.</p>{profileStorageState === 'unavailable' && <p role="status" className="text-xs font-bold text-amber-100">Reader profiles could not be read. This does not mean they were deleted.</p>}{seriesStorageState === 'unavailable' && <p role="status" className="text-xs font-bold text-amber-100">Saved characters and series could not be read. This does not mean they were deleted.</p>}{!progressStorageReadable && <p role="status" className="text-xs font-bold text-amber-100">Reading progress could not be verified; backup is paused so saved positions and favourites are not omitted.</p>}</>}
            <details className="group mt-1">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-2 text-sm font-black text-white outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 [&::-webkit-details-marker]:hidden"><span>Find a story</span>{(shelf !== 'all' || ageFilter !== 'all' || seriesFilter !== 'all') && <span className="min-w-0 flex-1 truncate text-right text-xs font-bold text-cyan-100">Showing {shelf !== 'all' ? STORYBOOK_SHELVES.find((item) => item.id === shelf)?.label : 'all stories'}{ageFilter !== 'all' ? ` · Ages ${ageFilter.replace('-', '–')}` : ''}{seriesFilter !== 'all' ? ` · ${availableSeries.find((item) => item.id === seriesFilter)?.name || 'selected series'}` : ''}</span>}<span aria-hidden="true" className="text-lg transition-transform group-open:rotate-180">⌄</span></summary>
              <div className="mt-2 flex flex-wrap gap-2">{STORYBOOK_SHELVES.map((item) => <button key={item.id} type="button" onClick={() => setShelf(item.id)} className={`min-h-12 rounded-full px-3 py-2 text-xs font-black ${shelf === item.id ? 'bg-amber-300 text-slate-900' : 'bg-white/15 text-white'}`} aria-pressed={shelf === item.id}>{item.label}</button>)}<select value={ageFilter} onChange={(event) => setAgeFilter(event.target.value)} className="min-h-12 rounded-full border-0 bg-white px-3 py-2 text-xs font-black text-slate-800" aria-label="Filter by age band"><option value="all">All ages</option><option value="3-4">Ages 3–4</option><option value="5-6">Ages 5–6</option><option value="7-8">Ages 7–8</option></select>{availableSeries.length > 0 && <select value={seriesFilter} onChange={(event) => setSeriesFilter(event.target.value)} className="min-h-12 rounded-full border-0 bg-white px-3 py-2 text-xs font-black text-slate-800" aria-label="Filter by series"><option value="all">All series</option>{availableSeries.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}</div>
            </details>
            <label className="mt-3 block text-sm font-black text-cyan-50">Search included and saved stories<input value={storySearch} onChange={(event) => setStorySearch(event.target.value)} type="search" className="mt-1 min-h-12 w-full rounded-xl border-0 bg-white px-4 py-2 font-semibold text-slate-900 placeholder:text-slate-500" placeholder="Search titles, story details or series" /></label>
          </section>
          {!showCreator && creatorError && <p className="mt-4 rounded-xl bg-rose-100 px-4 py-3 text-sm font-bold text-rose-900" role="alert">{creatorError}</p>}
          <section className="mt-3 grid gap-4 md:mt-6 md:grid-cols-3 md:gap-5" aria-label="Storybook library">
            {visibleBooks.map((book) => (
              <article key={book.slug} className="group overflow-hidden rounded-[2rem] border border-white/25 bg-white/95 text-slate-900 shadow-[0_18px_45px_rgba(0,0,0,.22)] transition hover:-translate-y-1">
                {book.custom && book.status !== 'ready' ? (
                  <div>
                    <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br ${book.accent}`}><span className="text-7xl" aria-hidden="true">✨</span><div className="absolute left-3 top-3 flex flex-wrap gap-1"><span className="rounded-full bg-slate-950/65 px-3 py-1 text-xs font-black text-white backdrop-blur">Ages {book.ageBand}</span><span className="rounded-full bg-indigo-700/80 px-3 py-1 text-xs font-black text-white backdrop-blur">Shared on this device</span></div></div>
                    <div className="p-5"><h3 className="text-xl font-black leading-tight">{book.title}</h3><p className="mt-2 text-sm font-bold text-slate-600">{book.status === 'error' ? 'Story needs a retry' : book.status === 'paused' ? 'Paused · saved text is ready to read' : 'Story text is ready; pictures and recordings may still be arriving'}</p><p className="mt-2 text-xs font-bold text-slate-500">{book.generation?.imagesReady || 0} of {(book.pages?.length || 0) + 1} pictures · {book.generation?.audioReady || 0} of {(book.pages?.length || 0) + 1} recordings saved</p><div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${Math.round(((book.generation?.completed || 0) / (book.generation?.total || 22)) * 100)}%` }} /></div>{book.status === 'error' && <p className="mt-2 text-xs font-bold text-rose-700">{book.generation?.error}</p>}<div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => openBook(book)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-indigo-200 px-3 py-2 text-sm font-black text-indigo-800"><BookOpen size={16} /> Read draft</button>{activeGenerationId === book.id ? <button type="button" onClick={pauseGeneration} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-300 px-3 py-2 text-sm font-black text-slate-900">Pause and save</button> : parentToolsOpen && <button type="button" onClick={() => resumeCustomStory(book)} disabled={creatorBusy} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-black text-white shadow-md disabled:opacity-50"><RotateCcw size={16} /> {book.status === 'error' ? 'Retry missing assets' : 'Resume making'}</button>}</div></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-[112px_minmax(0,1fr)] items-stretch sm:block">
                    <button type="button" onClick={() => openBook(book)} className={`relative flex aspect-square w-full items-center justify-center overflow-hidden bg-gradient-to-br ${book.accent} sm:aspect-[4/3]`} aria-label={`Open ${assetLabel(book)}`}>
                      {!imageErrors[`${book.slug}-cover`] && (book.custom ? coverMedia[book.id]?.image : book.cover) && <img src={book.custom ? coverMedia[book.id].image : book.cover} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" onError={() => onImageError(`${book.slug}-cover`)} />}
                      {(imageErrors[`${book.slug}-cover`] || !(book.custom ? coverMedia[book.id]?.image : book.cover)) && <span className="text-7xl" aria-hidden="true">{book.emoji}</span>}
                      <div className="absolute left-1 top-1 hidden flex-col items-start gap-1 sm:left-3 sm:top-3 sm:flex sm:flex-row"><span className="rounded-full bg-slate-950/65 px-2 py-1 text-[10px] font-black text-white backdrop-blur sm:px-3 sm:text-xs">Ages {book.ageBand}</span><span className="rounded-full bg-indigo-700/80 px-2 py-1 text-[10px] font-black text-white backdrop-blur sm:px-3 sm:text-xs">{book.custom ? 'Shared on this device' : `Reading as ${activeChild.displayName}`}</span></div>
                      <span aria-hidden="true" className="storybook-cover-read-label absolute bottom-3 right-3 hidden min-h-12 items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-black text-white shadow-lg sm:inline-flex">{readingActionLabel(book)} <ArrowRight size={17} /></span>
                    </button>
                    <div className="min-w-0 p-3 sm:p-5"><div className="flex items-start justify-between gap-1.5"><div className="min-w-0"><h3 className="text-base font-black leading-tight sm:text-xl"><button type="button" onClick={() => openBook(book)} className="text-left">{book.title}</button></h3><p className="mt-1 line-clamp-1 text-xs font-bold text-slate-500 sm:mt-2 sm:text-sm">{book.subtitle}</p></div><button type="button" onClick={() => toggleBookFavourite(book)} className="min-h-11 min-w-11 shrink-0 rounded-xl px-1 text-2xl text-amber-500" aria-label={`${getBookProgress(progressByChild, activeChild.id, book.slug).favourite ? 'Remove' : 'Add'} favourite`} aria-pressed={Boolean(getBookProgress(progressByChild, activeChild.id, book.slug).favourite)}>{getBookProgress(progressByChild, activeChild.id, book.slug).favourite ? '★' : '☆'}</button></div>{book.custom && (!coverMedia[book.id] || coverMedia[book.id].status !== 'ready') && <div className="mt-2 rounded-lg bg-amber-50 p-2 text-xs font-bold text-amber-900" role="status">{!coverMedia[book.id] || coverMedia[book.id].status === 'loading' ? 'Loading saved cover…' : coverMedia[book.id].status === 'unavailable' ? 'Cover storage is unavailable; your story remains saved.' : 'Cover picture is missing; your story remains saved.'}{coverMedia[book.id]?.status !== 'loading' && <button type="button" className="ml-2 min-h-11 rounded-lg bg-white px-3 font-black" onClick={() => retryCover(book)}>Retry cover</button>}</div>}<div className="mt-1.5 flex flex-wrap gap-2 sm:mt-3"><span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-black text-indigo-700 sm:text-xs">{book.seriesName}</span>{readCompletion(book.slug, activeChild.id) && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700 sm:text-xs">Completed</span>}</div><div className="mt-2 flex flex-wrap gap-2 sm:mt-4">{(() => { const actionLabel = readingActionLabel(book); return <button type="button" onClick={() => openBook(book)} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-indigo-600 px-3 py-2 text-sm font-black text-white shadow-md sm:px-4" aria-label={`${actionLabel}: ${book.title}`}>{actionLabel} <ArrowRight size={17} /></button>; })()}{parentToolsOpen && book.seriesId && <button type="button" onClick={() => startSeriesStory(book)} className="rounded-2xl border-2 border-indigo-200 px-3 py-2 text-xs font-black text-indigo-700">New story with {book.seriesName}</button>}</div></div>
                  </div>
                )}
              </article>
            ))}
            {!visibleBooks.length && <p className="rounded-2xl bg-white/10 p-6 text-center font-bold text-cyan-100 md:col-span-3">No stories match this shelf yet. Try another filter—every story stays available.</p>}
          </section>
          {filteredBooks.length > LIBRARY_PAGE_SIZE && <nav className="mt-5 flex justify-between gap-3" aria-label="Story pages"><button type="button" disabled={libraryPage === 0} onClick={() => setLibraryPage((page) => Math.max(0, page - 1))} className="min-h-12 rounded-xl bg-white px-4 font-black text-indigo-950 disabled:opacity-50">Previous 8 stories</button><button type="button" disabled={(libraryPage + 1) * LIBRARY_PAGE_SIZE >= filteredBooks.length} onClick={() => setLibraryPage((page) => page + 1)} className="min-h-12 rounded-xl bg-white px-4 font-black text-indigo-950 disabled:opacity-50">Show next {Math.min(LIBRARY_PAGE_SIZE, Math.max(0, filteredBooks.length - (libraryPage + 1) * LIBRARY_PAGE_SIZE))} stories</button></nav>}
          <p className="mt-7 flex items-center justify-center gap-2 text-center text-sm font-bold text-cyan-100"><Headphones size={17} /> Saved stories can be read aloud offline.</p>
        </div>
        {showCreator && <StorybookCreator onClose={() => { if (!creatorBusy) { setShowCreator(false); setInitialSeriesId(''); setCreatorProgress(null); } }} onCreate={createCustomStory} onPause={pauseGeneration} onShelf={() => { if (activeGenerationId) setShowCreator(false); }} seriesOptions={availableSeries} selectedChild={activeChild} initialSeriesId={initialSeriesId} busy={creatorBusy} progress={creatorProgress} error={creatorError} dailyLimitReached={dailyLimitReached || customRecords.length >= LIBRARY_LIMIT} />}
        {showProfiles && <StorybookProfiles profiles={profiles} storageState={profileStorageState} activeId={activeChild.id} onSelect={selectChild} onSave={saveProfile} onDelete={removeProfile} onClose={() => setShowProfiles(false)} />}
        {showSeries && <StorybookSeriesLibrary series={series} storageState={seriesStorageState} onSave={saveSeries} onGenerateReference={generateSeriesReference} onUse={(item) => { setInitialSeriesId(item.id); setShowSeries(false); setShowCreator(true); }} onClose={() => setShowSeries(false)} />}
      </main>
    );
  }

  const progress = totalScreens > 0 ? ((pageIndex + 1) / totalScreens) * 100 : 0;
  const IllustrationFrame = isCover ? 'button' : 'div';
  return (
    <main className={`storybook-reader min-h-screen w-full overflow-hidden bg-gradient-to-br ${selectedBook.accent} px-3 py-4 text-white sm:px-6 sm:py-6`}>
      <div className="storybook-reader-frame mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col">
        {activeGenerationId === selectedBook.id && <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/25 bg-slate-950/30 px-4 py-3 text-sm font-bold"><span role="status">Making this draft · {creatorProgress?.imagesReady || 0} pictures and {creatorProgress?.audioReady || 0} recordings saved</span><button type="button" onClick={pauseGeneration} className="min-h-11 rounded-xl bg-amber-300 px-4 py-2 font-black text-slate-950">Pause and save</button></div>}
        <header className="flex items-center justify-between gap-3">
          <button type="button" onClick={closeBook} className="storybook-icon-button" aria-label="Back to storybooks"><ArrowLeft /></button>
          <div className="min-w-0 text-center"><p className="truncate text-xs font-black uppercase tracking-[0.18em] text-white/70">{selectedBook.emoji} {selectedBook.style}</p><h1 className="truncate text-xl font-black sm:text-3xl">{selectedBook.title}</h1></div>
          <div className="flex items-center gap-2"><button type="button" onClick={onToggleSound} className="storybook-icon-button" aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}>{soundOn ? <Volume2 /> : <VolumeX />}</button><button type="button" onClick={leaveToWorld} className="storybook-icon-button" aria-label="Back to learning world"><ArrowLeft /></button></div>
        </header>
        <div className="mt-4 flex items-center gap-3" aria-label={`Page ${Math.max(1, screenNumber)} of ${totalScreens}`}>
          <span className="text-sm font-black text-white/85">{isCover ? 'Cover' : `Page ${pageIndex + 1}`}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-amber-300 transition-all duration-500" style={{ width: `${Math.max(8, progress)}%` }} /></div>
          <span className="text-sm font-black text-white/85">{screenNumber}/{totalScreens}</span>
        </div>
        {progressSaveError && <div role="status" className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-amber-100 p-3 text-sm font-bold text-amber-950">{progressSaveError}<button type="button" onClick={retryProgressSave} className="min-h-11 rounded-lg bg-white px-3 font-black">Retry saved progress</button></div>}
        {!progressStorageReadable && !progressSaveError && <div role="status" className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-amber-100 p-3 text-sm font-bold text-amber-950">Reading position could not be safely read or saved. You can keep reading; progress is not confirmed.<button type="button" onClick={() => reconcileStoryRewards()} className="min-h-11 rounded-lg bg-white px-3 font-black">Retry progress check</button></div>}
        {completionSaveError && completionErrorSlugRef.current === selectedBook.slug && <div role="status" className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-amber-100 p-3 text-sm font-bold text-amber-950">{completionSaveError}{pageIndex >= pages.length - 1 && <button type="button" onClick={() => finishBook()} className="min-h-11 rounded-lg bg-white px-3 font-black">Retry finish</button>}</div>}
        <section className="storybook-reading-layout mt-4 grid flex-1 gap-4 lg:grid-cols-[1.35fr_.65fr] lg:items-center">
          <IllustrationFrame type={isCover ? 'button' : undefined} onClick={isCover ? startReading : undefined} aria-label={isCover ? `Start reading ${selectedBook.title}` : undefined} className={`relative flex min-h-[45vh] items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white/35 bg-white/10 p-2 shadow-2xl backdrop-blur-sm sm:p-4 ${isCover ? 'w-full cursor-pointer text-left transition active:scale-[.99]' : ''}`}>
            {currentImage && !imageErrors[`${selectedBook.slug}-${isCover ? 'cover' : pageIndex}`] && <img src={currentImage} alt={isCover ? `${selectedBook.title} cover` : `${selectedBook.title}, ${currentPage?.title || ''}`} className="h-full max-h-[64vh] w-full rounded-[1.5rem] object-cover" onError={() => onImageError(`${selectedBook.slug}-${isCover ? 'cover' : pageIndex}`)} />}
            {(!currentImage || imageErrors[`${selectedBook.slug}-${isCover ? 'cover' : pageIndex}`]) && <div className="grid h-full min-h-[40vh] w-full place-items-center rounded-[1.5rem] bg-slate-950/20 text-8xl" aria-label={selectedBook.custom && selectedBook.status !== 'ready' ? 'Picture still being made; read the story text below' : 'Illustration unavailable'}>{selectedBook.emoji}</div>}
            <span className="absolute bottom-5 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-slate-950/70 px-4 py-2 text-xs font-black text-white backdrop-blur">{isCover && <Play size={14} fill="currentColor" />}{isCover ? (readCompletion(selectedBook.slug, activeChild.id) ? 'Tap to Start Again' : 'Tap to Start Reading') : `Illustration ${pageIndex + 1} of ${pages.length}`}</span>
          </IllustrationFrame>
          <div role="region" aria-label="Story words and reading tools" tabIndex={0} className="storybook-reading-panel flex flex-col rounded-[2rem] border-2 border-white/25 bg-slate-950/25 p-5 shadow-2xl backdrop-blur-md sm:p-7">
            {selectedBook.custom && readerScreenMedia.status !== 'ready' && <div className="mb-3 rounded-xl bg-slate-950/45 p-3 text-sm font-bold" role="status">{readerScreenMedia.status === 'loading' || readerScreenMedia.status === 'idle' ? 'Loading this saved page’s picture and recording…' : readerScreenMedia.status === 'unavailable' ? 'Saved media storage is unavailable right now. Your story text is still here.' : 'A saved picture or recording is missing. Your story text is still here.'}{readerScreenMedia.status !== 'loading' && <button type="button" onClick={retryReaderMedia} className="ml-2 min-h-11 rounded-lg bg-white px-3 font-black text-indigo-950">Retry saved media</button>}</div>}
            {isCover ? (
              <>
                <div className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">A {pages.length}-page adventure</div>
                <h2 className="storybook-cover-title mt-2 text-3xl font-black leading-tight sm:text-5xl">{selectedBook.title}</h2>
                <p className="mt-3 text-base font-bold leading-relaxed text-white/85 sm:text-lg">{selectedBook.summary}</p>
                {selectedBook.custom && selectedBook.status !== 'ready' && <p className="mt-4 rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white/90">This is a readable draft. Pictures and recordings still being made will be labelled on each page.</p>}
                <button type="button" onClick={startReading} className="storybook-start-reading mt-7 inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-amber-300 px-6 py-4 text-lg font-black text-slate-950 shadow-[0_6px_0_rgba(120,53,15,.4)] transition hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"><Play fill="currentColor" /> {readCompletion(selectedBook.slug, activeChild.id) ? 'Start Again' : 'Start Reading'}</button>
                {started && currentAudio && <button type="button" onClick={togglePlayback} className="mt-3 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-4 py-3 font-black text-white hover:bg-white/10" aria-label={playing ? 'Pause narration' : 'Play narration'}>{playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}{playing ? 'Pause introduction' : 'Resume introduction'}</button>}
                <button type="button" onClick={() => setAutoRead((value) => !value)} className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-3 text-sm font-black text-white/90 hover:bg-white/10" aria-pressed={autoRead}>{autoRead ? <Check size={17} /> : <span className="h-4 w-4 rounded border border-white/70" />} Auto-turn pages after narration</button>
              </>
            ) : (
              <>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">{currentPage.title}</p>
                <p className="mt-5 text-xl font-black leading-relaxed text-white sm:text-3xl">{currentPage.text}</p>
                {currentAudio ? <div className="mt-6 flex flex-wrap gap-2"><button type="button" onClick={togglePlayback} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-black text-slate-900 shadow-lg" aria-label={playing ? 'Pause narration' : 'Play narration'}>{playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />} {playing ? 'Pause' : 'Hear page'}</button><button type="button" onClick={replayNarration} className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-3 font-black hover:bg-white/10"><RotateCcw size={17} /> Replay</button></div> : selectedBook.custom && selectedBook.status !== 'ready' ? <p className="mt-6 rounded-xl bg-white/10 p-3 text-sm font-bold">The recording is still being made. You can read this page now.</p> : <p className="mt-6 rounded-xl bg-white/10 p-3 text-sm font-bold">Read-aloud is unavailable for this page.</p>}
                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-white/75"><Headphones size={17} /> {audioError ? 'Read-aloud is unavailable for this page.' : !currentAudio && selectedBook.custom && readerScreenMedia.status === 'loading' ? 'Loading the saved recording. Read the words above meanwhile.' : !currentAudio && selectedBook.custom && readerScreenMedia.status === 'unavailable' ? 'Saved recording storage is unavailable. Read the words above.' : !currentAudio && selectedBook.custom && readerScreenMedia.status === 'missing' ? 'This page’s saved recording is missing or unreadable. Read the words above.' : !currentAudio && selectedBook.custom && selectedBook.status !== 'ready' ? 'The recording is still being made. Read the words above.' : 'Read-aloud story'}{audioError && selectedBook.custom && <button type="button" onClick={retryReaderMedia} className="ml-2 min-h-11 rounded-lg bg-white px-3 font-black text-indigo-950">Retry saved media</button>}</div>
                {STORYBOOK_WORD_HELP[selectedBook.slug]?.length > 0 && <details className="mt-5 rounded-xl border border-white/25 bg-white/10 p-3"><summary className="cursor-pointer font-black">Word help</summary><dl className="mt-3 space-y-2">{STORYBOOK_WORD_HELP[selectedBook.slug].map(([word, meaning]) => <div key={word} className="flex items-start gap-2"><div className="flex-1"><dt className="font-black text-amber-200">{word}</dt><dd className="text-sm font-semibold text-white/90">{meaning}</dd></div><button type="button" onClick={() => { onGameEvent?.('storybooks', 'hint', { seed: comprehensionSeed, round: Math.max(0, pageIndex + 1), pageIndex, hintType: 'word_help' }); speak(meaning); }} className="storybook-icon-button shrink-0" aria-label={`Hear meaning of ${word}`}><Volume2 /></button></div>)}</dl></details>}
              </>
            )}
          </div>
        </section>
        <footer className="mt-4 flex items-center justify-between gap-3">
          <button type="button" onClick={() => goToScreen(pageIndex - 1, { shouldPlay: false })} disabled={isCover} className="storybook-nav-button" aria-label="Previous page"><ArrowLeft /> <span className="hidden sm:inline">Previous</span></button>
          <div className="flex gap-1.5" aria-hidden="true">{[...Array(totalScreens)].map((_, index) => <span key={index} className={`h-2.5 w-2.5 rounded-full ${index === pageIndex + 1 ? 'bg-amber-300' : index < pageIndex + 1 ? 'bg-white/80' : 'bg-white/25'}`} />)}</div>
          <button type="button" onClick={async () => { if (pageIndex >= pages.length - 1) { if (!await finishBook()) return; if (comprehension.length) { stopAudio(); onGameEvent?.('storybooks', 'comprehension_started', { round: 1, seed: comprehensionSeed }); onGameEvent?.('storybooks', 'question', { round: 1, seed: comprehensionSeed, pageIndex }); setComprehensionActive(true); } else closeBook(); } else goToScreen(pageIndex + 1, { shouldPlay: started && autoRead }); }} className="storybook-nav-button" aria-label={pageIndex >= pages.length - 1 ? (comprehension.length ? 'Start story questions' : 'Finish story') : 'Next page'}><span className="hidden sm:inline">{pageIndex >= pages.length - 1 ? (comprehension.length ? 'Story Detective' : 'Finish story') : 'Next'}</span> <ArrowRight /></button>
        </footer>
        <audio ref={audioRef} src={currentAudio || undefined} preload="auto" onEnded={onEnded} onError={() => { setAudioError(true); setPlaying(false); }} aria-label="Story narration" />
      </div>
    </main>
  );
};

export default StorybookStudio;
