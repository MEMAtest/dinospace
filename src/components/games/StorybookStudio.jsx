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
import { getStoryAsset, getStoryBookRecord, getStoryBooks, getChildProfiles, saveChildProfile, deleteChildProfile, getStorySeries, saveStorySeries, saveStoryAsset, saveStoryBook, importStorybookRecords } from '../../data/storybookStorage.js';
import { pagesForAgeBand } from '../../data/storybookValidation.js';
import { getBookProgress, readActiveChildId, readStoryProgress, saveActiveChildId, updateStoryProgress } from '../../data/storybookProfiles.js';
import { decorateStoryBook, filterStoryBooks, STORYBOOK_SHELVES } from '../../data/storybookLibrary.js';
import { createStorybookBackup, readStorybookBackup } from '../../data/storybookBackup.js';
import { createComprehensionRandom, createComprehensionSeed, shuffledComprehension, STORYBOOK_WORD_HELP } from '../../data/storybookLearning.js';

const completionKey = (slug) => `amari_storybook_complete_${slug}`;

const readCompletion = (slug, childId = 'amari') => {
  try {
    const progress = getBookProgress(readStoryProgress(), childId, slug);
    return progress.completed === true || (childId === 'amari' && window.localStorage.getItem(completionKey(slug)) === '1');
  } catch {
    return false;
  }
};

const saveCompletion = (slug, childId = 'amari') => {
  try {
    if (childId === 'amari') window.localStorage.setItem(completionKey(slug), '1');
    updateStoryProgress(childId, slug, { completed: true, completedAt: new Date().toISOString() });
  } catch {
    // Private browsing should not make the reader unusable.
  }
};

const assetLabel = (book) => `${book.title}, ${book.style}, ages ${book.ageBand}`;

const DAILY_LIMIT = 3;
const LIBRARY_LIMIT = 20;
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

const StorybookStudio = ({ onBack, playSfx, speak = () => {}, soundOn, onToggleSound, onCelebrate, onGameEvent }) => {
  const [library, setLibrary] = useState(STORYBOOK_CATALOG);
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
  const [progressByChild, setProgressByChild] = useState(() => readStoryProgress());
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
  const objectUrlsRef = useRef([]);
  const liveAssetUrlsRef = useRef(new Map());
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
  const visibleBooks = useMemo(() => filterStoryBooks(decoratedLibrary, {
    shelf, ageBand: ageFilter, seriesId: seriesFilter,
    childId: activeChild.id,
    favourites: progressByChild[activeChild.id] || {},
  }), [activeChild.id, ageFilter, decoratedLibrary, progressByChild, seriesFilter, shelf]);

  const selectedBook = useMemo(
    () => library.find((book) => book.slug === selectedSlug) || null,
    [library, selectedSlug],
  );
  const pages = selectedBook?.pages || [];
  const isCover = pageIndex < 0;
  const currentPage = isCover ? null : pages[pageIndex];
  const currentAudio = isCover ? selectedBook?.coverAudio : currentPage?.audio;
  const currentImage = isCover ? selectedBook?.cover : currentPage?.image;
  const totalScreens = pages.length + 1;
  const screenNumber = pageIndex + 2;

  const customRecordIds = customRecords.map((record) => record.id).join('|');
  useEffect(() => {
    let cancelled = false;
    Promise.all([Promise.all(STORYBOOK_CATALOG.map((book) => loadStoryBookManifest(book))), getStoryBooks(), getChildProfiles(), getStorySeries()])
      .then(([books, records, loadedProfiles, loadedSeries]) => {
        if (!cancelled) {
          const loadedBooks = books.filter(Boolean);
          setBundledBooks(loadedBooks);
          setCustomRecords(records || []);
          setProfiles(loadedProfiles || []);
          setSeries(loadedSeries || []);
          const loadedActive = loadedProfiles?.find((profile) => profile.id === activeChildIdRef.current) || loadedProfiles?.[0];
          if (loadedActive) {
            // Keep the catalogue inclusive by default; the age selector is an
            // explicit parent filter rather than an automatic restriction.
            setAgeFilter('all');
            if (loadedActive.id !== activeChildIdRef.current) { activeChildIdRef.current = loadedActive.id; setActiveChildId(loadedActive.id); saveActiveChildId(loadedActive.id); }
          }
          if (!records?.length) setLibrary(loadedBooks);
        }
      });
    return () => { cancelled = true; generationAbortRef.current?.abort(); objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url)); objectUrlsRef.current = []; liveAssetUrlsRef.current.clear(); };
  }, []);

  useEffect(() => {
    if (!customRecordIds) return;
    let cancelled = false;
    const runUrls = [];
    const rememberUrl = (blob, key) => {
      if (!isUsableStoryBlob(blob, key?.includes('audio') || key?.endsWith(':audio') ? 'audio' : 'image')) return null;
      const url = URL.createObjectURL(blob);
      runUrls.push(url);
      liveAssetUrlsRef.current.set(key, url);
      return url;
    };
    Promise.all(customRecordsRef.current.map(async (record) => {
      const coverBlob = await getStoryAsset(record.coverAssetKey);
      const cover = rememberUrl(coverBlob, record.coverAssetKey);
      const coverAudio = await getStoryAsset(record.coverAudioAssetKey);
      const coverAudioUrl = rememberUrl(coverAudio, record.coverAudioAssetKey);
      const pages = await Promise.all((record.pages || []).map(async (page) => {
        const imageBlob = await getStoryAsset(page.imageAssetKey);
        const audioBlob = await getStoryAsset(page.audioAssetKey);
        const image = rememberUrl(imageBlob, page.imageAssetKey);
        const audio = rememberUrl(audioBlob, page.audioAssetKey);
        return { ...page, image, audio };
      }));
      const missingAssetCount = [
        isUsableStoryBlob(coverBlob, 'image'), isUsableStoryBlob(coverAudio, 'audio'),
        ...pages.flatMap((page) => [Boolean(page.image), Boolean(page.audio)]),
      ].filter((usable) => !usable).length;
      const hydratedStatus = record.status === 'ready' && missingAssetCount > 0 ? 'error' : record.status;
      return {
        ...record,
        status: hydratedStatus,
        generation: { ...record.generation, ...(missingAssetCount ? { error: `${missingAssetCount} offline asset${missingAssetCount === 1 ? '' : 's'} missing; retry to restore this book.` } : {}) },
        accent: styleAccent[record.style] || styleAccent['3d'], emoji: '✨', cover, coverAudio: coverAudioUrl, pages,
      };
    })).then((books) => {
      if (cancelled) {
        runUrls.forEach((url) => URL.revokeObjectURL(url));
        return;
      }
      const currentUrls = liveAssetUrlsRef.current;
      const hydratedBooks = books.map((book) => ({
        ...book,
        cover: currentUrls.get(book.coverAssetKey) || book.cover,
        coverAudio: currentUrls.get(book.coverAudioAssetKey) || book.coverAudio,
        pages: book.pages.map((page) => ({
          ...page,
          image: currentUrls.get(page.imageAssetKey) || page.image,
          audio: currentUrls.get(page.audioAssetKey) || page.audio,
        })),
      }));
      const currentKeys = new Set(hydratedBooks.flatMap((book) => [
        book.coverAssetKey, book.coverAudioAssetKey,
        ...book.pages.flatMap((page) => [page.imageAssetKey, page.audioAssetKey]),
      ]));
      const nextUrlMap = new Map();
      hydratedBooks.forEach((book) => {
        [[book.coverAssetKey, book.cover], [book.coverAudioAssetKey, book.coverAudio]].forEach(([key, url]) => { if (url) nextUrlMap.set(key, url); });
        book.pages.forEach((page) => {
          if (page.image) nextUrlMap.set(page.imageAssetKey, page.image);
          if (page.audio) nextUrlMap.set(page.audioAssetKey, page.audio);
        });
      });
      const retainedUrls = new Set(nextUrlMap.values());
      objectUrlsRef.current.forEach((url) => { if (!retainedUrls.has(url)) URL.revokeObjectURL(url); });
      runUrls.forEach((url) => { if (!retainedUrls.has(url)) URL.revokeObjectURL(url); });
      liveAssetUrlsRef.current = new Map([...nextUrlMap].filter(([key]) => currentKeys.has(key)));
      objectUrlsRef.current = [...retainedUrls];
      setLibrary([...bundledBooks, ...hydratedBooks]);
    });
    return () => { cancelled = true; };
  }, [bundledBooks, customRecordIds]);

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

  const finishBook = useCallback(() => {
    if (!selectedBook) return;
    if (!comprehension.length && completedRunSeedRef.current !== comprehensionSeed) {
      completedRunSeedRef.current = comprehensionSeed;
      onGameEvent?.('storybooks', 'level_complete', { seed: comprehensionSeed, round: pages.length, pageIndex });
    }
    if (readCompletion(selectedBook.slug, activeChild.id)) return;
    saveCompletion(selectedBook.slug, activeChild.id);
    onCelebrate?.('Story complete!', 5, 0, 'storybooks');
  }, [activeChild.id, comprehension.length, comprehensionSeed, onCelebrate, onGameEvent, pageIndex, pages.length, selectedBook]);

  const goToScreen = useCallback((nextIndex, { shouldPlay = autoRead } = {}) => {
    if (!selectedBook) return;
    const clamped = Math.max(-1, Math.min(pages.length - 1, nextIndex));
    setPageIndex(clamped);
    onGameEvent?.('storybooks', 'scene', {
      seed: comprehensionSeed,
      round: Math.max(0, clamped + 1),
      pageIndex: clamped,
    });
    const nextProgress = updateStoryProgress(activeChild.id, selectedBook.slug, { pageIndex: clamped });
    setProgressByChild((all) => ({ ...all, [activeChild.id]: { ...(all[activeChild.id] || {}), [selectedBook.slug]: nextProgress } }));
    setAudioError(false);
    setPlaying(Boolean(shouldPlay && started));
  }, [activeChild.id, autoRead, comprehensionSeed, onGameEvent, pages.length, selectedBook, started]);

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
    const nextProgress = updateStoryProgress(activeChild.id, book.slug, { lastReadAt: new Date().toISOString(), pageIndex: resumeIndex });
    setProgressByChild((all) => ({ ...all, [activeChild.id]: { ...(all[activeChild.id] || {}), [book.slug]: nextProgress } }));
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

  const publishSavedAsset = (record, key, blob) => {
    const previousUrl = liveAssetUrlsRef.current.get(key);
    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
      objectUrlsRef.current = objectUrlsRef.current.filter((url) => url !== previousUrl);
    }
    const url = URL.createObjectURL(blob);
    liveAssetUrlsRef.current.set(key, url);
    objectUrlsRef.current.push(url);
    setLibrary((books) => books.map((book) => {
      if (book.id !== record.id) return book;
      if (key === record.coverAssetKey) return { ...book, cover: url };
      if (key === record.coverAudioAssetKey) return { ...book, coverAudio: url };
      return {
        ...book,
        pages: book.pages.map((page) => key === page.imageAssetKey
          ? { ...page, image: url }
          : key === page.audioAssetKey ? { ...page, audio: url } : page),
      };
    }));
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
      publishSavedAsset(record, key, blob);
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
  }, [availableSeries, creatorBusy, customRecords.length, runCustomGeneration]);

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
    await saveStorySeries(item);
    setSeries((items) => [...items.filter((seriesItem) => seriesItem.id !== item.id), item]);
  }, []);

  const saveProfile = useCallback(async (profile) => {
    await saveChildProfile(profile);
    setProfiles((items) => [...items.filter((item) => item.id !== profile.id), profile]);
  }, []);

  const removeProfile = useCallback(async (profile) => {
    if (profiles.length <= 1) return;
    await deleteChildProfile(profile);
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
      const merged = { ...progressByChild };
      for (const [childId, entries] of Object.entries(backup.progress)) {
        if (!profileIds.has(childId)) continue;
        merged[childId] = { ...(merged[childId] || {}) };
        for (const [slug, value] of Object.entries(entries)) {
          if (!Object.hasOwn(merged[childId], slug)) merged[childId][slug] = value;
        }
      }
      try { window.localStorage.setItem('amari_storybook_progress_v1', JSON.stringify(merged)); } catch { /* restore remains useful without progress storage */ }
      setProgressByChild(merged);
      const records = await getStoryBooks(); setCustomRecords(records);
      setBackupMessage(`Restored ${result.added} ${result.added === 1 ? 'story' : 'stories'}${result.skipped ? `; kept ${result.skipped} existing ${result.skipped === 1 ? 'story' : 'stories'}` : ''}.`);
    } catch (error) { setBackupMessage(error.message || 'Could not restore this story backup.'); }
    finally { setBackupBusy(false); }
  }, [profiles, progressByChild]);

  const toggleBookFavourite = useCallback((book) => {
    const current = getBookProgress(progressByChild, activeChild.id, book.slug);
    const next = updateStoryProgress(activeChild.id, book.slug, { favourite: !current.favourite });
    setProgressByChild((all) => ({ ...all, [activeChild.id]: { ...(all[activeChild.id] || {}), [book.slug]: next } }));
  }, [activeChild.id, progressByChild]);

  const startSeriesStory = useCallback((book) => {
    if (!book?.seriesId) return;
    setInitialSeriesId(book.seriesId);
    setCreatorError('');
    setCreatorProgress(null);
    setDailyLimitReached(countDailyCreations() >= DAILY_LIMIT);
    setShowCreator(true);
  }, []);

  const onImageError = (key) => setImageErrors((errors) => ({ ...errors, [key]: true }));

  if (selectedBook && comprehensionActive) {
    const question = comprehension[comprehensionStep];
    const answerIsCorrect = comprehensionChoice === question?.answer;
    return (
      <main className={`storybook-reader min-h-screen w-full bg-gradient-to-br ${selectedBook.accent} px-4 py-6 text-white`}>
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
      <main className="storybook-shell min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#10154d] via-[#223a91] to-[#0d7491] px-4 py-5 text-white sm:px-7 sm:py-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex items-center justify-between gap-4">
            <button type="button" onClick={leaveToWorld} className="storybook-icon-button" aria-label="Back to learning world"><ArrowLeft /></button>
            <div className="flex min-w-0 items-center justify-center gap-2 text-center"><img src="/art/storybook-v4/reading-crew.webp" alt="" aria-hidden="true" className="h-9 w-14 shrink-0 object-contain sm:h-12 sm:w-[4.5rem]" /><div className="min-w-0"><p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Read &amp; Write</p><h1 className="text-3xl font-black sm:text-5xl">Storybook Studio</h1></div></div>
            <button type="button" onClick={onToggleSound} className="storybook-icon-button" aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}>{soundOn ? <Volume2 /> : <VolumeX />}</button>
          </header>
          <div className="mt-4 flex justify-end"><button type="button" onClick={() => setParentToolsOpen((open) => !open)} aria-expanded={parentToolsOpen} className="min-h-11 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-black text-white">{parentToolsOpen ? 'Hide parent tools' : 'Parent tools'}</button></div>
          {parentToolsOpen && <section className="mt-3 rounded-[2rem] border border-white/20 bg-white/10 p-5 text-center shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 to-orange-500 text-5xl shadow-lg">📚</div>
            <h2 className="mt-4 text-2xl font-black sm:text-4xl">Choose a story to explore</h2>
            <p className="mx-auto mt-2 max-w-2xl font-semibold text-blue-100">Every story has pictures, short pages and a voice to read along with. Saved stories are ready to enjoy offline.</p>
            <button type="button" onClick={() => { if (creatorBusy) return; setDailyLimitReached(countDailyCreations() >= DAILY_LIMIT); setCreatorError(''); setCreatorProgress(null); setShowCreator(true); }} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50" disabled={creatorBusy || customRecords.length >= LIBRARY_LIMIT}>
              ✨ Create a new story
            </button>
            {customRecords.length >= LIBRARY_LIMIT && <p className="mt-2 text-xs font-bold text-amber-100">You can keep up to twenty saved storybooks on this device.</p>}
          </section>}
          <section className="mt-4 rounded-2xl border border-white/20 bg-white/10 p-4" aria-label="Storybook filters">
            <div className="flex flex-wrap items-center gap-2"><label className="text-xs font-black uppercase tracking-wide text-cyan-100">Reading progress for<select value={activeChild.id} onChange={(event) => selectChild(event.target.value)} className="ml-2 rounded-xl border-0 bg-white px-3 py-2 text-sm font-black text-slate-800">{profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.displayName} · {profile.ageBand}</option>)}</select></label></div>
            {parentToolsOpen && <><div className="mt-3 flex flex-wrap items-center gap-2"><button type="button" onClick={() => setShowProfiles(true)} className="rounded-xl bg-white/15 px-3 py-2 text-xs font-black text-white">Edit children</button><button type="button" onClick={() => setShowSeries(true)} className="rounded-xl bg-white/15 px-3 py-2 text-xs font-black text-white">Characters &amp; series</button><button type="button" disabled={backupBusy || !customRecords.length} onClick={exportStories} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-indigo-900 disabled:opacity-50"><Download size={16} /> Back up saved stories</button><button type="button" disabled={backupBusy} onClick={() => backupInputRef.current?.click()} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs font-black text-white disabled:opacity-50"><Upload size={16} /> Restore a story backup</button><input ref={backupInputRef} type="file" accept="application/json,.json" onChange={importStories} className="hidden" aria-label="Choose a story backup file" />{backupMessage && <p role="status" className="self-center text-xs font-bold text-amber-100">{backupMessage}</p>}</div><p className="mt-2 text-xs font-bold text-cyan-100/80">Stories on this device are shared. Each reader has their own place and favourites.</p></>}
            <div className="mt-3 flex flex-wrap gap-2">{STORYBOOK_SHELVES.map((item) => <button key={item.id} type="button" onClick={() => setShelf(item.id)} className={`rounded-full px-3 py-2 text-xs font-black ${shelf === item.id ? 'bg-amber-300 text-slate-900' : 'bg-white/15 text-white'}`} aria-pressed={shelf === item.id}>{item.label}</button>)}<select value={ageFilter} onChange={(event) => setAgeFilter(event.target.value)} className="rounded-full border-0 bg-white px-3 py-2 text-xs font-black text-slate-800" aria-label="Filter by age band"><option value="all">All ages</option><option value="3-4">Ages 3–4</option><option value="5-6">Ages 5–6</option><option value="7-8">Ages 7–8</option></select>{availableSeries.length > 0 && <select value={seriesFilter} onChange={(event) => setSeriesFilter(event.target.value)} className="rounded-full border-0 bg-white px-3 py-2 text-xs font-black text-slate-800" aria-label="Filter by series"><option value="all">All series</option>{availableSeries.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}</div>
          </section>
          {!showCreator && creatorError && <p className="mt-4 rounded-xl bg-rose-100 px-4 py-3 text-sm font-bold text-rose-900" role="alert">{creatorError}</p>}
          <section className="mt-6 grid gap-5 md:grid-cols-3" aria-label="Storybook library">
            {visibleBooks.map((book) => (
              <article key={book.slug} className="group overflow-hidden rounded-[2rem] border border-white/25 bg-white/95 text-slate-900 shadow-[0_18px_45px_rgba(0,0,0,.22)] transition hover:-translate-y-1">
                {book.custom && book.status !== 'ready' ? (
                  <div>
                    <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br ${book.accent}`}><span className="text-7xl" aria-hidden="true">✨</span><div className="absolute left-3 top-3 flex flex-wrap gap-1"><span className="rounded-full bg-slate-950/65 px-3 py-1 text-xs font-black text-white backdrop-blur">Ages {book.ageBand}</span><span className="rounded-full bg-indigo-700/80 px-3 py-1 text-xs font-black text-white backdrop-blur">Shared on this device</span></div></div>
                    <div className="p-5"><h3 className="text-xl font-black leading-tight">{book.title}</h3><p className="mt-2 text-sm font-bold text-slate-600">{book.status === 'error' ? 'Story needs a retry' : book.status === 'paused' ? 'Paused · saved text is ready to read' : 'Story text is ready; pictures and recordings may still be arriving'}</p><p className="mt-2 text-xs font-bold text-slate-500">{book.generation?.imagesReady || 0} of {(book.pages?.length || 0) + 1} pictures · {book.generation?.audioReady || 0} of {(book.pages?.length || 0) + 1} recordings saved</p><div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${Math.round(((book.generation?.completed || 0) / (book.generation?.total || 22)) * 100)}%` }} /></div>{book.status === 'error' && <p className="mt-2 text-xs font-bold text-rose-700">{book.generation?.error}</p>}<div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => openBook(book)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-indigo-200 px-3 py-2 text-sm font-black text-indigo-800"><BookOpen size={16} /> Read draft</button>{activeGenerationId === book.id ? <button type="button" onClick={pauseGeneration} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-300 px-3 py-2 text-sm font-black text-slate-900">Pause and save</button> : parentToolsOpen && <button type="button" onClick={() => resumeCustomStory(book)} disabled={creatorBusy} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-black text-white shadow-md disabled:opacity-50"><RotateCcw size={16} /> {book.status === 'error' ? 'Retry missing assets' : 'Resume making'}</button>}</div></div>
                  </div>
                ) : (
                  <div role="button" tabIndex={0} onClick={() => openBook(book)} onKeyDown={(event) => { if (event.target !== event.currentTarget) return; if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openBook(book); } }} className="block w-full text-left" aria-label={`Open ${assetLabel(book)}`}>
                    <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br ${book.accent}`}>
                      {!imageErrors[`${book.slug}-cover`] && book.cover && <img src={book.cover} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" onError={() => onImageError(`${book.slug}-cover`)} />}
                      {(imageErrors[`${book.slug}-cover`] || !book.cover) && <span className="text-7xl" aria-hidden="true">{book.emoji}</span>}
                      <div className="absolute left-3 top-3 flex flex-wrap gap-1"><span className="rounded-full bg-slate-950/65 px-3 py-1 text-xs font-black text-white backdrop-blur">Ages {book.ageBand}</span><span className="rounded-full bg-indigo-700/80 px-3 py-1 text-xs font-black text-white backdrop-blur">{book.custom ? 'Shared on this device' : `Reading as ${activeChild.displayName}`}</span></div>
                    </div>
                    <div className="p-5"><div className="flex items-start justify-between gap-2"><div><h3 className="text-xl font-black leading-tight">{book.title}</h3><p className="mt-2 text-sm font-bold text-slate-500">{book.subtitle}</p></div><button type="button" onClick={(event) => { event.stopPropagation(); toggleBookFavourite(book); }} className="rounded-xl px-2 text-2xl text-amber-500" aria-label={`${getBookProgress(progressByChild, activeChild.id, book.slug).favourite ? 'Remove' : 'Add'} favourite`} aria-pressed={Boolean(getBookProgress(progressByChild, activeChild.id, book.slug).favourite)}>{getBookProgress(progressByChild, activeChild.id, book.slug).favourite ? '★' : '☆'}</button></div><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-black text-indigo-700">{book.seriesName}</span>{readCompletion(book.slug, activeChild.id) && <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">Completed</span>}</div><div className="mt-4 flex flex-wrap gap-2"><span className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-black text-white shadow-md">Read story <ArrowRight size={17} /></span>{parentToolsOpen && book.seriesId && <button type="button" onClick={(event) => { event.stopPropagation(); startSeriesStory(book); }} className="rounded-2xl border-2 border-indigo-200 px-3 py-2 text-xs font-black text-indigo-700">New story with {book.seriesName}</button>}</div></div>
                  </div>
                )}
              </article>
            ))}
            {!visibleBooks.length && <p className="rounded-2xl bg-white/10 p-6 text-center font-bold text-cyan-100 md:col-span-3">No stories match this shelf yet. Try another filter—every story stays available.</p>}
          </section>
          <p className="mt-7 flex items-center justify-center gap-2 text-center text-sm font-bold text-cyan-100"><Headphones size={17} /> Saved stories can be read aloud offline.</p>
        </div>
        {showCreator && <StorybookCreator onClose={() => { if (!creatorBusy) { setShowCreator(false); setInitialSeriesId(''); setCreatorProgress(null); } }} onCreate={createCustomStory} onPause={pauseGeneration} onShelf={() => { if (activeGenerationId) setShowCreator(false); }} seriesOptions={availableSeries} selectedChild={activeChild} initialSeriesId={initialSeriesId} busy={creatorBusy} progress={creatorProgress} error={creatorError} dailyLimitReached={dailyLimitReached || customRecords.length >= LIBRARY_LIMIT} />}
        {showProfiles && <StorybookProfiles profiles={profiles} activeId={activeChild.id} onSelect={selectChild} onSave={saveProfile} onDelete={removeProfile} onClose={() => setShowProfiles(false)} />}
        {showSeries && <StorybookSeriesLibrary series={series} onSave={saveSeries} onGenerateReference={generateSeriesReference} onUse={(item) => { setInitialSeriesId(item.id); setShowSeries(false); setShowCreator(true); }} onClose={() => setShowSeries(false)} />}
      </main>
    );
  }

  const progress = totalScreens > 0 ? ((pageIndex + 1) / totalScreens) * 100 : 0;
  const IllustrationFrame = isCover ? 'button' : 'div';
  return (
    <main className={`storybook-reader min-h-screen w-full overflow-hidden bg-gradient-to-br ${selectedBook.accent} px-3 py-4 text-white sm:px-6 sm:py-6`}>
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col">
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
        <section className="mt-4 grid flex-1 gap-4 lg:grid-cols-[1.35fr_.65fr] lg:items-center">
          <IllustrationFrame type={isCover ? 'button' : undefined} onClick={isCover ? startReading : undefined} aria-label={isCover ? `Start reading ${selectedBook.title}` : undefined} className={`relative flex min-h-[45vh] items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white/35 bg-white/10 p-2 shadow-2xl backdrop-blur-sm sm:p-4 ${isCover ? 'w-full cursor-pointer text-left transition active:scale-[.99]' : ''}`}>
            {currentImage && !imageErrors[`${selectedBook.slug}-${isCover ? 'cover' : pageIndex}`] && <img src={currentImage} alt={isCover ? `${selectedBook.title} cover` : `${selectedBook.title}, ${currentPage?.title || ''}`} className="h-full max-h-[64vh] w-full rounded-[1.5rem] object-cover" onError={() => onImageError(`${selectedBook.slug}-${isCover ? 'cover' : pageIndex}`)} />}
            {(!currentImage || imageErrors[`${selectedBook.slug}-${isCover ? 'cover' : pageIndex}`]) && <div className="grid h-full min-h-[40vh] w-full place-items-center rounded-[1.5rem] bg-slate-950/20 text-8xl" aria-label={selectedBook.custom && selectedBook.status !== 'ready' ? 'Picture still being made; read the story text below' : 'Illustration unavailable'}>{selectedBook.emoji}</div>}
            <span className="absolute bottom-5 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-slate-950/70 px-4 py-2 text-xs font-black text-white backdrop-blur">{isCover && <Play size={14} fill="currentColor" />}{isCover ? (readCompletion(selectedBook.slug, activeChild.id) ? 'Tap to Start Again' : 'Tap to Start Reading') : `Illustration ${pageIndex + 1} of ${pages.length}`}</span>
          </IllustrationFrame>
          <div className="flex flex-col rounded-[2rem] border-2 border-white/25 bg-slate-950/25 p-5 shadow-2xl backdrop-blur-md sm:p-7">
            {isCover ? (
              <>
                <div className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">A {pages.length}-page adventure</div>
                <h2 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">{selectedBook.title}</h2>
                <p className="mt-3 text-base font-bold leading-relaxed text-white/85 sm:text-lg">{selectedBook.summary}</p>
                {selectedBook.custom && selectedBook.status !== 'ready' && <p className="mt-4 rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white/90">This is a readable draft. Pictures and recordings still being made will be labelled on each page.</p>}
                <button type="button" onClick={startReading} className="mt-7 inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-amber-300 px-6 py-4 text-lg font-black text-slate-950 shadow-[0_6px_0_rgba(120,53,15,.4)] transition hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"><Play fill="currentColor" /> {readCompletion(selectedBook.slug, activeChild.id) ? 'Start Again' : 'Start Reading'}</button>
                {started && currentAudio && <button type="button" onClick={togglePlayback} className="mt-3 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-4 py-3 font-black text-white hover:bg-white/10" aria-label={playing ? 'Pause narration' : 'Play narration'}>{playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}{playing ? 'Pause introduction' : 'Resume introduction'}</button>}
                <button type="button" onClick={() => setAutoRead((value) => !value)} className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-3 text-sm font-black text-white/90 hover:bg-white/10" aria-pressed={autoRead}>{autoRead ? <Check size={17} /> : <span className="h-4 w-4 rounded border border-white/70" />} Auto-turn pages after narration</button>
              </>
            ) : (
              <>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">{currentPage.title}</p>
                <p className="mt-5 text-xl font-black leading-relaxed text-white sm:text-3xl">{currentPage.text}</p>
                {currentAudio ? <div className="mt-6 flex flex-wrap gap-2"><button type="button" onClick={togglePlayback} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-black text-slate-900 shadow-lg" aria-label={playing ? 'Pause narration' : 'Play narration'}>{playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />} {playing ? 'Pause' : 'Hear page'}</button><button type="button" onClick={replayNarration} className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-3 font-black hover:bg-white/10"><RotateCcw size={17} /> Replay</button></div> : selectedBook.custom && selectedBook.status !== 'ready' ? <p className="mt-6 rounded-xl bg-white/10 p-3 text-sm font-bold">The recording is still being made. You can read this page now.</p> : <p className="mt-6 rounded-xl bg-white/10 p-3 text-sm font-bold">Read-aloud is unavailable for this page.</p>}
                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-white/75"><Headphones size={17} /> {audioError ? 'Read-aloud is unavailable for this page.' : !currentAudio && selectedBook.custom && selectedBook.status !== 'ready' ? 'This recording is still being made. Read the words above.' : 'Read-aloud story'}</div>
                {STORYBOOK_WORD_HELP[selectedBook.slug]?.length > 0 && <details className="mt-5 rounded-xl border border-white/25 bg-white/10 p-3"><summary className="cursor-pointer font-black">Word help</summary><dl className="mt-3 space-y-2">{STORYBOOK_WORD_HELP[selectedBook.slug].map(([word, meaning]) => <div key={word} className="flex items-start gap-2"><div className="flex-1"><dt className="font-black text-amber-200">{word}</dt><dd className="text-sm font-semibold text-white/90">{meaning}</dd></div><button type="button" onClick={() => { onGameEvent?.('storybooks', 'hint', { seed: comprehensionSeed, round: Math.max(0, pageIndex + 1), pageIndex, hintType: 'word_help' }); speak(meaning); }} className="storybook-icon-button shrink-0" aria-label={`Hear meaning of ${word}`}><Volume2 /></button></div>)}</dl></details>}
              </>
            )}
          </div>
        </section>
        <footer className="mt-4 flex items-center justify-between gap-3">
          <button type="button" onClick={() => goToScreen(pageIndex - 1, { shouldPlay: false })} disabled={isCover} className="storybook-nav-button" aria-label="Previous page"><ArrowLeft /> <span className="hidden sm:inline">Previous</span></button>
          <div className="flex gap-1.5" aria-hidden="true">{[...Array(totalScreens)].map((_, index) => <span key={index} className={`h-2.5 w-2.5 rounded-full ${index === pageIndex + 1 ? 'bg-amber-300' : index < pageIndex + 1 ? 'bg-white/80' : 'bg-white/25'}`} />)}</div>
          <button type="button" onClick={() => { if (pageIndex >= pages.length - 1) { finishBook(); if (comprehension.length) { stopAudio(); onGameEvent?.('storybooks', 'comprehension_started', { round: 1, seed: comprehensionSeed }); onGameEvent?.('storybooks', 'question', { round: 1, seed: comprehensionSeed, pageIndex }); setComprehensionActive(true); } else closeBook(); } else goToScreen(pageIndex + 1, { shouldPlay: started && autoRead }); }} className="storybook-nav-button" aria-label={pageIndex >= pages.length - 1 ? (comprehension.length ? 'Start story questions' : 'Finish story') : 'Next page'}><span className="hidden sm:inline">{pageIndex >= pages.length - 1 ? (comprehension.length ? 'Story Detective' : 'Finish story') : 'Next'}</span> <ArrowRight /></button>
        </footer>
        <audio ref={audioRef} src={currentAudio || undefined} preload="auto" onEnded={onEnded} onError={() => { setAudioError(true); setPlaying(false); }} aria-label="Story narration" />
      </div>
    </main>
  );
};

export default StorybookStudio;
