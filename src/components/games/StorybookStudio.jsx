import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check, Headphones, Home, Pause, Play, RotateCcw,
  Volume2, VolumeX,
} from 'lucide-react';
import { loadStoryBookManifest, STORYBOOK_CATALOG } from '../../data/storybooks.js';

const completionKey = (slug) => `amari_storybook_complete_${slug}`;

const readCompletion = (slug) => {
  try {
    return window.localStorage.getItem(completionKey(slug)) === '1';
  } catch {
    return false;
  }
};

const saveCompletion = (slug) => {
  try {
    window.localStorage.setItem(completionKey(slug), '1');
  } catch {
    // Private browsing should not make the reader unusable.
  }
};

const assetLabel = (book) => `${book.title}, ${book.style}, ages ${book.ageBand}`;

const StorybookStudio = ({ onBack, playSfx, soundOn, onToggleSound, onCelebrate }) => {
  const [library, setLibrary] = useState(STORYBOOK_CATALOG);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [pageIndex, setPageIndex] = useState(-1);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [autoRead, setAutoRead] = useState(true);
  const [audioError, setAudioError] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const audioRef = useRef(null);
  const advanceTimerRef = useRef(null);

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
    let cancelled = false;
    Promise.all(STORYBOOK_CATALOG.map((book) => loadStoryBookManifest(book)))
      .then((books) => {
        if (!cancelled) setLibrary(books.filter(Boolean));
      });
    return () => { cancelled = true; };
  }, []);

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
    if (!selectedBook || readCompletion(selectedBook.slug)) return;
    saveCompletion(selectedBook.slug);
    onCelebrate?.('Story complete!', 5, 0, 'storybooks');
  }, [onCelebrate, selectedBook]);

  const goToScreen = useCallback((nextIndex, { shouldPlay = autoRead } = {}) => {
    if (!selectedBook) return;
    const clamped = Math.max(-1, Math.min(pages.length - 1, nextIndex));
    setPageIndex(clamped);
    setAudioError(false);
    setPlaying(Boolean(shouldPlay && started));
  }, [autoRead, pages.length, selectedBook, started]);

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
  };

  const closeBook = () => {
    playSfx?.('click');
    stopAudio();
    setSelectedSlug(null);
    setStarted(false);
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
          </section>
          <section className="mt-6 grid gap-5 md:grid-cols-3" aria-label="Storybook library">
            {library.map((book) => (
              <article key={book.slug} className="group overflow-hidden rounded-[2rem] border border-white/25 bg-white/95 text-slate-900 shadow-[0_18px_45px_rgba(0,0,0,.22)] transition hover:-translate-y-1">
                <button type="button" onClick={() => openBook(book)} className="block w-full text-left" aria-label={`Open ${assetLabel(book)}`}>
                  <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br ${book.accent}`}>
                    {!imageErrors[`${book.slug}-cover`] && <img src={book.cover} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" onError={() => onImageError(`${book.slug}-cover`)} />}
                    {imageErrors[`${book.slug}-cover`] && <span className="text-7xl" aria-hidden="true">{book.emoji}</span>}
                    <span className="absolute left-3 top-3 rounded-full bg-slate-950/65 px-3 py-1 text-xs font-black text-white backdrop-blur">Ages {book.ageBand}</span>
                  </div>
                  <div className="p-5"><h3 className="text-xl font-black leading-tight">{book.title}</h3><p className="mt-2 text-sm font-bold text-slate-500">{book.subtitle}</p><span className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-black text-white shadow-md">Read story <ArrowRight size={17} /></span></div>
                </button>
              </article>
            ))}
          </section>
          <p className="mt-7 flex items-center justify-center gap-2 text-center text-sm font-bold text-cyan-100"><Headphones size={17} /> Narration uses bundled ElevenLabs audio. No device voice fallback.</p>
        </div>
      </main>
    );
  }

  const progress = totalScreens > 0 ? ((pageIndex + 1) / totalScreens) * 100 : 0;
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
          <div className="relative flex min-h-[45vh] items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white/35 bg-white/10 p-2 shadow-2xl backdrop-blur-sm sm:p-4">
            {!imageErrors[`${selectedBook.slug}-${isCover ? 'cover' : pageIndex}`] && <img src={currentImage} alt={isCover ? `${selectedBook.title} cover` : `${selectedBook.title}, ${currentPage?.title || ''}`} className="h-full max-h-[64vh] w-full rounded-[1.5rem] object-cover" onError={() => onImageError(`${selectedBook.slug}-${isCover ? 'cover' : pageIndex}`)} />}
            {imageErrors[`${selectedBook.slug}-${isCover ? 'cover' : pageIndex}`] && <div className="grid h-full min-h-[40vh] w-full place-items-center rounded-[1.5rem] bg-slate-950/20 text-8xl" aria-label="Illustration unavailable">{selectedBook.emoji}</div>}
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/60 px-4 py-2 text-xs font-black text-white backdrop-blur">{isCover ? 'Tap Start Reading' : `Illustration ${pageIndex + 1} of ${pages.length}`}</span>
          </div>
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
