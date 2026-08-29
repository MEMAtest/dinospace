import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check, Headphones, Home, Pause, Play, RotateCcw,
  Volume2, VolumeX,
} from 'lucide-react';
import { loadStoryBookManifest, STORYBOOK_CATALOG } from '../../data/storybooks.js';
import StorybookCreator from './StorybookCreator.jsx';
import StorybookProfiles from './StorybookProfiles.jsx';
import StorybookSeriesLibrary from './StorybookSeriesLibrary.jsx';
import { createStoryImage, createStoryNarration, createStoryOutline, createStorySession } from '../../data/storybookApi.js';
import { getStoryAsset, getStoryBookRecord, getStoryBooks, getChildProfiles, saveChildProfile, deleteChildProfile, getStorySeries, saveStorySeries, saveStoryAsset, saveStoryBook } from '../../data/storybookStorage.js';
import { getBookProgress, readActiveChildId, readStoryProgress, saveActiveChildId, updateStoryProgress } from '../../data/storybookProfiles.js';
import { decorateStoryBook, filterStoryBooks, STORYBOOK_SHELVES } from '../../data/storybookLibrary.js';

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
const dailyKey = () => `amari_storybook_daily_${new Date().toISOString().slice(0, 10)}`;
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
const styleAccent = { '3d': 'from-indigo-700 via-violet-700 to-fuchsia-700', 'painted-2d': 'from-emerald-700 via-teal-700 to-cyan-700', realistic: 'from-amber-700 via-orange-600 to-rose-600' };

const newStoryId = () => `custom-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;

const makeCustomBook = (outline, input, selectedSeries = null) => {
  const id = newStoryId();
  const pageCount = 10;
  return {
    id,
    slug: id,
    custom: true,
    title: outline.title,
    subtitle: `A ${input.style === '3d' ? 'colourful' : input.style === 'painted-2d' ? 'hand-painted' : 'warm'} ten-page adventure`,
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
    generation: { stage: 'cover', completed: 0, total: 2 + pageCount * 2, currentPage: 0, error: null },
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

const continuityPrompt = (book) => book.characters.map((character) => `${character.name}: ${character.visualDescription}`).join('; ');

const StorybookStudio = ({ onBack, playSfx, soundOn, onToggleSound, onCelebrate }) => {
  const [library, setLibrary] = useState(STORYBOOK_CATALOG);
  const [bundledBooks, setBundledBooks] = useState(STORYBOOK_CATALOG);
  const [customRecords, setCustomRecords] = useState([]);
  const [showCreator, setShowCreator] = useState(false);
  const [creatorBusy, setCreatorBusy] = useState(false);
  const [creatorError, setCreatorError] = useState('');
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [activeChildId, setActiveChildId] = useState(() => readActiveChildId());
  const [progressByChild, setProgressByChild] = useState(() => readStoryProgress());
  const [series, setSeries] = useState([]);
  const [showProfiles, setShowProfiles] = useState(false);
  const [showSeries, setShowSeries] = useState(false);
  const [initialSeriesId, setInitialSeriesId] = useState('');
  const [shelf, setShelf] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [seriesFilter, setSeriesFilter] = useState('all');
  const storySessionRef = useRef(null);
  const activeChildIdRef = useRef(activeChildId);
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
  const objectUrlsRef = useRef([]);

  const activeChild = profiles.find((profile) => profile.id === activeChildId) || profiles[0] || { id: 'amari', displayName: 'Amari', ageBand: '5-6' };
  const decoratedLibrary = useMemo(() => library.map(decorateStoryBook), [library]);
  const availableSeries = useMemo(() => [...new Map(decoratedLibrary.filter((book) => book.seriesId).map((book) => [book.seriesId, { id: book.seriesId, name: book.seriesName }])).values(), ...series].reduce((items, item) => items.some((current) => current.id === item.id) ? items : [...items, item], []), [decoratedLibrary, series]);
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

  useEffect(() => {
    try { storySessionRef.current = window.sessionStorage.getItem('amari_storybook_parent_session'); } catch { /* storage is optional */ }
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
            setAgeFilter(loadedActive.ageBand);
            if (loadedActive.id !== activeChildIdRef.current) { activeChildIdRef.current = loadedActive.id; setActiveChildId(loadedActive.id); saveActiveChildId(loadedActive.id); }
          }
          if (!records?.length) setLibrary(loadedBooks);
        }
      });
    return () => { cancelled = true; generationAbortRef.current?.abort(); objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url)); objectUrlsRef.current = []; };
  }, []);

  useEffect(() => {
    if (!customRecords.length) return;
    let cancelled = false;
    const runUrls = [];
    const rememberUrl = (blob) => {
      if (!blob) return null;
      const url = URL.createObjectURL(blob);
      runUrls.push(url);
      return url;
    };
    Promise.all(customRecords.map(async (record) => {
      const coverBlob = await getStoryAsset(record.coverAssetKey);
      const cover = rememberUrl(coverBlob);
      const coverAudio = await getStoryAsset(record.coverAudioAssetKey);
      const coverAudioUrl = rememberUrl(coverAudio);
      const pages = await Promise.all((record.pages || []).map(async (page) => {
        const imageBlob = await getStoryAsset(page.imageAssetKey);
        const audioBlob = await getStoryAsset(page.audioAssetKey);
        const image = rememberUrl(imageBlob);
        const audio = rememberUrl(audioBlob);
        return { ...page, image, audio };
      }));
      return { ...record, accent: styleAccent[record.style] || styleAccent['3d'], emoji: '✨', cover, coverAudio: coverAudioUrl, pages };
    })).then((books) => {
      if (cancelled) {
        runUrls.forEach((url) => URL.revokeObjectURL(url));
        return;
      }
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current = runUrls;
      setLibrary([...bundledBooks, ...books]);
    });
    return () => {
      cancelled = true;
      if (runUrls.length) runUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [bundledBooks, customRecords]);

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
    if (!selectedBook || readCompletion(selectedBook.slug, activeChild.id)) return;
    saveCompletion(selectedBook.slug, activeChild.id);
    onCelebrate?.('Story complete!', 5, 0, 'storybooks');
  }, [activeChild.id, onCelebrate, selectedBook]);

  const goToScreen = useCallback((nextIndex, { shouldPlay = autoRead } = {}) => {
    if (!selectedBook) return;
    const clamped = Math.max(-1, Math.min(pages.length - 1, nextIndex));
    setPageIndex(clamped);
    const nextProgress = updateStoryProgress(activeChild.id, selectedBook.slug, { pageIndex: clamped });
    setProgressByChild((all) => ({ ...all, [activeChild.id]: { ...(all[activeChild.id] || {}), [selectedBook.slug]: nextProgress } }));
    setAudioError(false);
    setPlaying(Boolean(shouldPlay && started));
  }, [activeChild.id, autoRead, pages.length, selectedBook, started]);

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
    if (!started || !autoRead || !currentAudio) return undefined;
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
    setPageIndex(-1);
    setStarted(false);
    setAudioError(false);
    const nextProgress = updateStoryProgress(activeChild.id, book.slug, { lastReadAt: new Date().toISOString(), pageIndex: -1 });
    setProgressByChild((all) => ({ ...all, [activeChild.id]: { ...(all[activeChild.id] || {}), [book.slug]: nextProgress } }));
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  };

  const closeBook = () => {
    playSfx?.('click');
    stopAudio();
    setSelectedSlug(null);
    setStarted(false);
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  };

  const startReading = async () => {
    setStarted(true);
    setAudioError(false);
    // Start in the same click handler so mobile WebViews preserve activation.
    await playCurrentAudio();
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
    await saveStoryBook(record);
    setCustomRecords((records) => records.some((item) => item.id === record.id)
      ? records.map((item) => (item.id === record.id ? record : item))
      : [record, ...records]);
  }, []);

  const runCustomGeneration = useCallback(async (sourceRecord, session = storySessionRef.current) => {
    if (!session) return;
    if (generationAbortRef.current) return;
    const controller = new AbortController();
    generationAbortRef.current = controller;
    let record = {
      ...sourceRecord,
      status: 'generating',
      generation: { ...(sourceRecord.generation || {}), stage: 'cover', error: null, total: 22 },
      pages: (sourceRecord.pages || []).map((page) => ({ ...page })),
    };
    let completed = Number(record.generation.completed || 0);
    const update = async (patch) => {
      record = { ...record, ...patch, generation: { ...record.generation, completed, ...patch.generation } };
      await persistCustom(record);
    };
    try {
      let coverBlob = await getStoryAsset(record.coverAssetKey);
      if (!coverBlob) {
        const coverPrompt = `${record.coverPrompt}. Style: ${record.style}. ${record.seriesBible ? `Approved series bible: ${record.seriesBible.name}; appearance: ${record.seriesBible.appearance}; personality: ${record.seriesBible.personality}; friends/world: ${record.seriesBible.friendsWorld}.` : ''} Character continuity guide: ${continuityPrompt(record)}. Make a polished children’s picture-book cover with the complete main character visible, clear margins, strong focal composition, no cropping, no words, no letters, no logos, no watermark.`;
        coverBlob = await createStoryImage({ prompt: coverPrompt, referenceImage: record.referenceImage || undefined }, session, controller.signal);
        await saveStoryAsset(record.coverAssetKey, coverBlob);
        completed += 1;
        await update({ generation: { stage: 'cover', currentPage: 0 } });
      }
      const coverReference = await blobToDataUrl(coverBlob);

      let coverAudio = await getStoryAsset(record.coverAudioAssetKey);
      if (!coverAudio) {
        coverAudio = await createStoryNarration({ text: `${record.title}. ${record.summary}`.slice(0, 420) }, session, controller.signal);
        await saveStoryAsset(record.coverAudioAssetKey, coverAudio);
        completed += 1;
        await update({ generation: { stage: 'narration', currentPage: 0 } });
      }

      for (let index = 0; index < record.pages.length; index += 1) {
        const page = record.pages[index];
        let imageBlob = await getStoryAsset(page.imageAssetKey);
        if (!imageBlob) {
          const prompt = `${page.imagePrompt}. Style: ${record.style}. Character continuity guide: ${continuityPrompt(record)}. This is page ${page.number} of 10. Show a clear child-friendly action with the full characters visible, varied camera angle, no cropping, no words, no letters, no logos, no watermark.`;
          imageBlob = await createStoryImage({ prompt, referenceImage: record.referenceImage || coverReference }, session, controller.signal);
          await saveStoryAsset(page.imageAssetKey, imageBlob);
          completed += 1;
          await update({ generation: { stage: 'image', currentPage: page.number } });
        }
        if (!await getStoryAsset(page.audioAssetKey)) {
          const narration = await createStoryNarration({
            text: page.text,
            previousText: record.pages[index - 1]?.text,
            nextText: record.pages[index + 1]?.text,
          }, session, controller.signal);
          await saveStoryAsset(page.audioAssetKey, narration);
          completed += 1;
          await update({ generation: { stage: 'narration', currentPage: page.number } });
        }
      }
      await update({ status: 'ready', generation: { stage: 'complete', currentPage: 10, error: null } });
    } catch (error) {
      if (error?.name === 'AbortError') return;
      await update({ status: 'error', generation: { stage: 'error', error: error?.message || 'Generation failed' } });
    } finally {
      generationAbortRef.current = null;
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
    try {
      if (!storySessionRef.current) throw new Error('Please open the parent area first.');
      const selectedSeries = series.find((item) => item.id === input.seriesId) || null;
      const outline = await createStoryOutline({ ...input, seriesContext: selectedSeries || undefined }, storySessionRef.current);
      incrementDailyCreations();
      setDailyLimitReached(countDailyCreations() >= DAILY_LIMIT);
      const record = makeCustomBook(outline, input, selectedSeries);
      await saveStoryBook(record);
      setCustomRecords((records) => [record, ...records]);
      setShowCreator(false);
      await runCustomGeneration(record);
    } catch (error) {
      setCreatorError(error?.message || 'Story outline could not be created. Please try again.');
    } finally {
      setCreatorBusy(false);
    }
  }, [creatorBusy, customRecords.length, runCustomGeneration, series]);

  const unlockParentArea = useCallback(async (parentPin) => {
    storySessionRef.current = await createStorySession(parentPin);
    try { window.sessionStorage.setItem('amari_storybook_parent_session', storySessionRef.current); } catch { /* storage is optional */ }
  }, []);

  const resumeCustomStory = useCallback(async (book) => {
    if (creatorBusy || generationAbortRef.current) return;
    if (!storySessionRef.current) {
      setCreatorError('A parent session is needed to resume this story. Open the creator to unlock it.');
      setShowCreator(true);
      return;
    }
    const record = await getStoryBookRecord(book.id);
    if (!record) return;
    setCreatorBusy(true);
    await runCustomGeneration(record);
    setCreatorBusy(false);
  }, [creatorBusy, runCustomGeneration]);

  const generateSeriesReference = useCallback(async (draft) => {
    if (!storySessionRef.current) throw new Error('Unlock the parent story maker first to generate a reference.');
    const prompt = `Create one polished child-friendly character reference portrait for a storybook series. Appearance: ${draft.appearance}. Personality: ${draft.personality || 'friendly and curious'}. Friends/world: ${draft.friendsWorld || 'a bright welcoming world'}. Style: ${draft.visualStyle}. Show the complete character on a clean simple background, consistent silhouette, no words, no logos, no watermark.`;
    const blob = await createStoryImage({ prompt }, storySessionRef.current);
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

  const selectChild = useCallback((id, selectedAgeBand) => { activeChildIdRef.current = id; setActiveChildId(id); saveActiveChildId(id); setAgeFilter(selectedAgeBand || profiles.find((profile) => profile.id === id)?.ageBand || 'all'); setShowProfiles(false); }, [profiles]);

  const toggleBookFavourite = useCallback((book) => {
    const current = getBookProgress(progressByChild, activeChild.id, book.slug);
    const next = updateStoryProgress(activeChild.id, book.slug, { favourite: !current.favourite });
    setProgressByChild((all) => ({ ...all, [activeChild.id]: { ...(all[activeChild.id] || {}), [book.slug]: next } }));
  }, [activeChild.id, progressByChild]);

  const onImageError = (key) => setImageErrors((errors) => ({ ...errors, [key]: true }));

  if (!selectedBook) {
    return (
      <main className="storybook-shell min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#10154d] via-[#223a91] to-[#0d7491] px-4 py-5 text-white sm:px-7 sm:py-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex items-center justify-between gap-4">
            <button type="button" onClick={onBack} className="storybook-icon-button" aria-label="Back to learning worlds"><ArrowLeft /></button>
            <div className="text-center"><p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Read &amp; Write</p><h1 className="text-3xl font-black sm:text-5xl">Storybook Studio</h1></div>
            <button type="button" onClick={onToggleSound} className="storybook-icon-button" aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}>{soundOn ? <Volume2 /> : <VolumeX />}</button>
          </header>
          <section className="mt-7 rounded-[2rem] border border-white/20 bg-white/10 p-5 text-center shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 to-orange-500 text-5xl shadow-lg">📚</div>
            <h2 className="mt-4 text-2xl font-black sm:text-4xl">Choose a story to explore</h2>
            <p className="mx-auto mt-2 max-w-2xl font-semibold text-blue-100">Every story has a picture, a short page to read and a real ElevenLabs narration. Downloaded story assets keep reading ready when you are offline.</p>
            <button type="button" onClick={() => { setDailyLimitReached(countDailyCreations() >= DAILY_LIMIT); setCreatorError(''); setShowCreator(true); }} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50" disabled={customRecords.length >= LIBRARY_LIMIT}>
              ✨ Create a new story
            </button>
            {customRecords.length >= LIBRARY_LIMIT && <p className="mt-2 text-xs font-bold text-amber-100">You can keep up to twenty saved storybooks on this device.</p>}
          </section>
          <section className="mt-4 rounded-2xl border border-white/20 bg-white/10 p-4" aria-label="Storybook filters">
            <div className="flex flex-wrap items-center gap-2"><label className="text-xs font-black uppercase tracking-wide text-cyan-100">Who is reading?<select value={activeChild.id} onChange={(event) => selectChild(event.target.value)} className="ml-2 rounded-xl border-0 bg-white px-3 py-2 text-sm font-black text-slate-800">{profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.displayName} · {profile.ageBand}</option>)}</select></label><button type="button" onClick={() => setShowProfiles(true)} className="rounded-xl bg-white/15 px-3 py-2 text-xs font-black text-white">Edit children</button><button type="button" onClick={() => setShowSeries(true)} className="rounded-xl bg-white/15 px-3 py-2 text-xs font-black text-white">Characters &amp; series</button></div>
            <div className="mt-3 flex flex-wrap gap-2">{STORYBOOK_SHELVES.map((item) => <button key={item.id} type="button" onClick={() => setShelf(item.id)} className={`rounded-full px-3 py-2 text-xs font-black ${shelf === item.id ? 'bg-amber-300 text-slate-900' : 'bg-white/15 text-white'}`} aria-pressed={shelf === item.id}>{item.label}</button>)}<select value={ageFilter} onChange={(event) => setAgeFilter(event.target.value)} className="rounded-full border-0 bg-white px-3 py-2 text-xs font-black text-slate-800" aria-label="Filter by age band"><option value="all">All ages</option><option value="3-4">Ages 3–4</option><option value="5-6">Ages 5–6</option><option value="7-8">Ages 7–8</option></select>{availableSeries.length > 0 && <select value={seriesFilter} onChange={(event) => setSeriesFilter(event.target.value)} className="rounded-full border-0 bg-white px-3 py-2 text-xs font-black text-slate-800" aria-label="Filter by series"><option value="all">All series</option>{availableSeries.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}</div>
          </section>
          <section className="mt-6 grid gap-5 md:grid-cols-3" aria-label="Storybook library">
            {visibleBooks.map((book) => (
              <article key={book.slug} className="group overflow-hidden rounded-[2rem] border border-white/25 bg-white/95 text-slate-900 shadow-[0_18px_45px_rgba(0,0,0,.22)] transition hover:-translate-y-1">
                {book.custom && book.status !== 'ready' ? (
                  <div>
                    <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br ${book.accent}`}><span className="text-7xl" aria-hidden="true">✨</span><div className="absolute left-3 top-3 flex flex-wrap gap-1"><span className="rounded-full bg-slate-950/65 px-3 py-1 text-xs font-black text-white backdrop-blur">Ages {book.ageBand}</span><span className="rounded-full bg-indigo-700/80 px-3 py-1 text-xs font-black text-white backdrop-blur">For {profiles.find((profile) => profile.id === book.childId)?.displayName || activeChild.displayName}</span></div></div>
                    <div className="p-5"><h3 className="text-xl font-black leading-tight">{book.title}</h3><p className="mt-2 text-sm font-bold text-slate-500">{book.status === 'error' ? 'Needs a retry' : 'Creating your story…'}</p><div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${Math.round(((book.generation?.completed || 0) / (book.generation?.total || 22)) * 100)}%` }} /></div><p className="mt-2 text-xs font-bold text-slate-500">{book.status === 'error' ? book.generation?.error : `${book.generation?.completed || 0} of ${book.generation?.total || 22} assets ready`}</p><button type="button" onClick={() => resumeCustomStory(book)} disabled={creatorBusy} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-black text-white shadow-md disabled:opacity-50">{book.status === 'error' ? <><RotateCcw size={16} /> Retry</> : <><RotateCcw size={16} /> Resume</>}</button></div>
                  </div>
                ) : (
                  <div role="button" tabIndex={0} onClick={() => openBook(book)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') openBook(book); }} className="block w-full text-left" aria-label={`Open ${assetLabel(book)}`}>
                    <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br ${book.accent}`}>
                      {!imageErrors[`${book.slug}-cover`] && book.cover && <img src={book.cover} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" onError={() => onImageError(`${book.slug}-cover`)} />}
                      {(imageErrors[`${book.slug}-cover`] || !book.cover) && <span className="text-7xl" aria-hidden="true">{book.emoji}</span>}
                      <div className="absolute left-3 top-3 flex flex-wrap gap-1"><span className="rounded-full bg-slate-950/65 px-3 py-1 text-xs font-black text-white backdrop-blur">Ages {book.ageBand}</span><span className="rounded-full bg-indigo-700/80 px-3 py-1 text-xs font-black text-white backdrop-blur">{book.custom ? 'For' : 'Reading as'} {book.custom ? profiles.find((profile) => profile.id === book.childId)?.displayName || activeChild.displayName : activeChild.displayName}</span></div>
                    </div>
                    <div className="p-5"><div className="flex items-start justify-between gap-2"><div><h3 className="text-xl font-black leading-tight">{book.title}</h3><p className="mt-2 text-sm font-bold text-slate-500">{book.subtitle}</p></div><button type="button" onClick={(event) => { event.stopPropagation(); toggleBookFavourite(book); }} className="rounded-xl px-2 text-2xl text-amber-500" aria-label={`${getBookProgress(progressByChild, activeChild.id, book.slug).favourite ? 'Remove' : 'Add'} favourite`} aria-pressed={Boolean(getBookProgress(progressByChild, activeChild.id, book.slug).favourite)}>{getBookProgress(progressByChild, activeChild.id, book.slug).favourite ? '★' : '☆'}</button></div><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-black text-indigo-700">{book.seriesName}</span>{readCompletion(book.slug, activeChild.id) && <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">Completed</span>}</div><span className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-black text-white shadow-md">Read story <ArrowRight size={17} /></span></div>
                  </div>
                )}
              </article>
            ))}
            {!visibleBooks.length && <p className="rounded-2xl bg-white/10 p-6 text-center font-bold text-cyan-100 md:col-span-3">No stories match this shelf yet. Try another filter—every story stays available.</p>}
          </section>
          <p className="mt-7 flex items-center justify-center gap-2 text-center text-sm font-bold text-cyan-100"><Headphones size={17} /> Narration uses bundled ElevenLabs audio. No device voice fallback.</p>
        </div>
        {showCreator && <StorybookCreator onClose={() => { if (!creatorBusy) { setShowCreator(false); setInitialSeriesId(''); } }} onUnlock={unlockParentArea} parentUnlocked={Boolean(storySessionRef.current)} onCreate={createCustomStory} seriesOptions={series} selectedChild={activeChild} initialSeriesId={initialSeriesId} busy={creatorBusy} error={creatorError} dailyLimitReached={dailyLimitReached || customRecords.length >= LIBRARY_LIMIT} />}
        {showProfiles && <StorybookProfiles profiles={profiles} activeId={activeChild.id} onSelect={selectChild} onSave={saveProfile} onDelete={removeProfile} onClose={() => setShowProfiles(false)} />}
        {showSeries && <StorybookSeriesLibrary series={series} onSave={saveSeries} onUnlock={unlockParentArea} parentUnlocked={Boolean(storySessionRef.current)} onGenerateReference={generateSeriesReference} onUse={(item) => { setInitialSeriesId(item.id); setShowSeries(false); setShowCreator(true); }} onClose={() => setShowSeries(false)} />}
      </main>
    );
  }

  const progress = totalScreens > 0 ? ((pageIndex + 1) / totalScreens) * 100 : 0;
  const IllustrationFrame = isCover ? 'button' : 'div';
  return (
    <main className={`storybook-reader min-h-screen w-full overflow-hidden bg-gradient-to-br ${selectedBook.accent} px-3 py-4 text-white sm:px-6 sm:py-6`}>
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col">
        <header className="flex items-center justify-between gap-3">
          <button type="button" onClick={closeBook} className="storybook-icon-button" aria-label="Back to storybooks"><ArrowLeft /></button>
          <div className="min-w-0 text-center"><p className="truncate text-xs font-black uppercase tracking-[0.18em] text-white/70">{selectedBook.emoji} {selectedBook.style}</p><h1 className="truncate text-xl font-black sm:text-3xl">{selectedBook.title}</h1></div>
          <div className="flex items-center gap-2"><button type="button" onClick={onToggleSound} className="storybook-icon-button" aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}>{soundOn ? <Volume2 /> : <VolumeX />}</button><button type="button" onClick={onBack} className="storybook-icon-button hidden sm:grid" aria-label="Return to learning worlds"><Home /></button></div>
        </header>
        <div className="mt-4 flex items-center gap-3" aria-label={`Page ${Math.max(1, screenNumber)} of ${totalScreens}`}>
          <span className="text-sm font-black text-white/85">{isCover ? 'Cover' : `Page ${pageIndex + 1}`}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-amber-300 transition-all duration-500" style={{ width: `${Math.max(8, progress)}%` }} /></div>
          <span className="text-sm font-black text-white/85">{screenNumber}/{totalScreens}</span>
        </div>
        <section className="mt-4 grid flex-1 gap-4 lg:grid-cols-[1.35fr_.65fr] lg:items-center">
          <IllustrationFrame type={isCover ? 'button' : undefined} onClick={isCover ? startReading : undefined} aria-label={isCover ? `Start reading ${selectedBook.title}` : undefined} className={`relative flex min-h-[45vh] items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white/35 bg-white/10 p-2 shadow-2xl backdrop-blur-sm sm:p-4 ${isCover ? 'w-full cursor-pointer text-left transition active:scale-[.99]' : ''}`}>
            {currentImage && !imageErrors[`${selectedBook.slug}-${isCover ? 'cover' : pageIndex}`] && <img src={currentImage} alt={isCover ? `${selectedBook.title} cover` : `${selectedBook.title}, ${currentPage?.title || ''}`} className="h-full max-h-[64vh] w-full rounded-[1.5rem] object-cover" onError={() => onImageError(`${selectedBook.slug}-${isCover ? 'cover' : pageIndex}`)} />}
            {(!currentImage || imageErrors[`${selectedBook.slug}-${isCover ? 'cover' : pageIndex}`]) && <div className="grid h-full min-h-[40vh] w-full place-items-center rounded-[1.5rem] bg-slate-950/20 text-8xl" aria-label="Illustration unavailable">{selectedBook.emoji}</div>}
            <span className="absolute bottom-5 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-slate-950/70 px-4 py-2 text-xs font-black text-white backdrop-blur">{isCover && <Play size={14} fill="currentColor" />}{isCover ? 'Tap to Start Reading' : `Illustration ${pageIndex + 1} of ${pages.length}`}</span>
          </IllustrationFrame>
          <div className="flex flex-col rounded-[2rem] border-2 border-white/25 bg-slate-950/25 p-5 shadow-2xl backdrop-blur-md sm:p-7">
            {isCover ? (
              <>
                <div className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">A ten-page adventure</div>
                <h2 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">{selectedBook.title}</h2>
                <p className="mt-3 text-base font-bold leading-relaxed text-white/85 sm:text-lg">{selectedBook.summary}</p>
                <button type="button" onClick={startReading} className="mt-7 inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-amber-300 px-6 py-4 text-lg font-black text-slate-950 shadow-[0_6px_0_rgba(120,53,15,.4)] transition hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"><Play fill="currentColor" /> Start Reading</button>
                <button type="button" onClick={() => setAutoRead((value) => !value)} className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-3 text-sm font-black text-white/90 hover:bg-white/10" aria-pressed={autoRead}>{autoRead ? <Check size={17} /> : <span className="h-4 w-4 rounded border border-white/70" />} Auto-turn pages after narration</button>
              </>
            ) : (
              <>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">{currentPage.title}</p>
                <p className="mt-5 text-xl font-black leading-relaxed text-white sm:text-3xl">{currentPage.text}</p>
                <div className="mt-6 flex flex-wrap gap-2"><button type="button" onClick={togglePlayback} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-black text-slate-900 shadow-lg" aria-label={playing ? 'Pause narration' : 'Play narration'}>{playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />} {playing ? 'Pause' : 'Hear page'}</button><button type="button" onClick={() => { audioRef.current?.load(); playCurrentAudio(); }} className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-3 font-black hover:bg-white/10"><RotateCcw size={17} /> Replay</button></div>
                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-white/75"><Headphones size={17} /> {audioError ? 'Narration unavailable offline for this page.' : 'ElevenLabs narration'}</div>
              </>
            )}
          </div>
        </section>
        <footer className="mt-4 flex items-center justify-between gap-3">
          <button type="button" onClick={() => goToScreen(pageIndex - 1, { shouldPlay: false })} disabled={isCover} className="storybook-nav-button" aria-label="Previous page"><ArrowLeft /> <span className="hidden sm:inline">Previous</span></button>
          <div className="flex gap-1.5" aria-hidden="true">{[...Array(totalScreens)].map((_, index) => <span key={index} className={`h-2.5 w-2.5 rounded-full ${index === pageIndex + 1 ? 'bg-amber-300' : index < pageIndex + 1 ? 'bg-white/80' : 'bg-white/25'}`} />)}</div>
          <button type="button" onClick={() => { if (pageIndex >= pages.length - 1) { finishBook(); closeBook(); } else goToScreen(pageIndex + 1, { shouldPlay: started && autoRead }); }} className="storybook-nav-button" aria-label={pageIndex >= pages.length - 1 ? 'Finish story' : 'Next page'}><span className="hidden sm:inline">{pageIndex >= pages.length - 1 ? 'Finish' : 'Next'}</span> <ArrowRight /></button>
        </footer>
        <audio ref={audioRef} src={currentAudio || undefined} preload="auto" onEnded={onEnded} onError={() => { setAudioError(true); setPlaying(false); }} aria-label="Story narration" />
      </div>
    </main>
  );
};

export default StorybookStudio;
