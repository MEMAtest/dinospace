import { useEffect, useRef, useState } from 'react';
import { BookOpen, ExternalLink, Headphones, Search } from 'lucide-react';
import { Dino } from '../little/DinoArt.jsx';
import { FocusMenu } from '../shared/FocusMenu.jsx';
import {
  FACT_FINDER_CATEGORIES, filterFactFinderEntries, getFactFinderAudio, getFactFinderEntry,
} from '../../data/factFinder.js';
import './factFinder.css';

function stopAudio(audioRef, generationRef, setPlayingKey) {
  generationRef.current += 1;
  const active = audioRef.current;
  audioRef.current = null;
  if (active) {
    active.onended = null;
    active.onerror = null;
    active.pause();
    try { active.currentTime = 0; } catch { /* metadata may not be ready */ }
  }
  setPlayingKey(null);
}

function EntryArtwork({ record }) {
  if (record.artKind) return <div className="fact-finder-dino-art"><Dino kind={record.artKind} title={record.name} className="fact-finder-dino-svg" /></div>;
  return <img className="fact-finder-art-image" src={record.image.src} alt={record.image.alt} />;
}

export default function FactFinder({ onBack, onLaunchGame, soundOn = true, onToggleSound, onPhaseChange }) {
  const [query, setQuery] = useState('');
  const [factIndex, setFactIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [panel, setPanel] = useState(null);
  const [category, setCategory] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [playingKey, setPlayingKey] = useState(null);
  const articleTitleRef = useRef(null);
  const searchRef = useRef(null);
  const topicButtonsRef = useRef(new Map());
  const audioRef = useRef(null);
  const audioGenerationRef = useRef(0);
  const returnFocusIdRef = useRef(null);
  const entries = filterFactFinderEntries({ query, category });
  const selected = selectedId ? getFactFinderEntry(selectedId) : null;
  const visibleSelection = selected && entries.some(({ id }) => id === selected.id) ? selected : null;
  const visibleSelectionId = visibleSelection?.id;
  const fact = visibleSelection?.facts[factIndex];
  const factAudio = fact && getFactFinderAudio(visibleSelection, fact.text);
  const nameClip = visibleSelection ? getFactFinderAudio(visibleSelection, visibleSelection.name) : null;

  useEffect(() => { onPhaseChange?.('intro'); }, [onPhaseChange]);
  useEffect(() => {
    if (visibleSelectionId) articleTitleRef.current?.focus({ preventScroll: true });
  }, [visibleSelectionId]);
  useEffect(() => {
    if (soundOn) return;
    stopAudio(audioRef, audioGenerationRef, setPlayingKey);
  }, [soundOn]);
  useEffect(() => () => {
    audioGenerationRef.current += 1;
    const active = audioRef.current;
    audioRef.current = null;
    if (active) {
      active.onended = null;
      active.onerror = null;
      active.pause();
      try { active.currentTime = 0; } catch { /* metadata may not be ready */ }
    }
  }, []);

  const playClip = (clip, key) => {
    if (!soundOn || !clip) return;
    stopAudio(audioRef, audioGenerationRef, setPlayingKey);
    const generation = audioGenerationRef.current;
    const player = new Audio(clip.src);
    audioRef.current = player;
    setPlayingKey(key);
    const finish = () => {
      if (audioGenerationRef.current === generation && audioRef.current === player) {
        audioRef.current = null;
        setPlayingKey(null);
      }
    };
    player.onended = finish;
    player.onerror = finish;
    player.play().then(() => {
      if (audioGenerationRef.current !== generation || audioRef.current !== player) player.pause();
    }).catch(finish);
  };

  const openTopic = (id) => {
    stopAudio(audioRef, audioGenerationRef, setPlayingKey);
    returnFocusIdRef.current = id;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setFactIndex(0);
    setSelectedId(id);
  };
  const backToTopics = () => {
    stopAudio(audioRef, audioGenerationRef, setPlayingKey);
    setPanel(null);
    setSelectedId(null);
    requestAnimationFrame(() => {
      const button = topicButtonsRef.current.get(returnFocusIdRef.current);
      if (button?.isConnected) button.focus();
      else searchRef.current?.focus();
    });
  };

  const closePanel = () => setPanel(null);
  const silence = () => stopAudio(audioRef, audioGenerationRef, setPlayingKey);
  const leave = () => { silence(); onBack?.(); };
  const chooseFact = index => { silence(); closePanel(); setFactIndex(index); };
  const lastFact = visibleSelection && factIndex + 1 === visibleSelection.facts.length;
  const launch = () => {
    silence();
    const options = visibleSelection.exploreModule ? { module: visibleSelection.exploreModule } : undefined;
    onLaunchGame(visibleSelection.exploreGameId, options);
  };
  const options = [
    ...(visibleSelection ? [
      ...visibleSelection.facts.map((_, index) => ({
        label: `Fact ${index + 1}`, disabled: index === factIndex, action: () => chooseFact(index),
      })),
      ...(nameClip && soundOn ? [{ label: 'Hear name', action: () => { closePanel(); playClip(nameClip, 'name'); } }] : []),
      { label: 'Fact source', action: () => setPanel('source') },
      { label: 'Back to topics', action: backToTopics },
    ] : []),
    ...(onToggleSound ? [{ label: soundOn ? 'Turn sound off' : 'Turn sound on', action: () => { onToggleSound(); closePanel(); } }] : []),
    ...(onBack ? [{ label: 'Back to Explore & Languages', action: leave }] : []),
  ];
  const pageSize = 8;
  const pages = Math.ceil(entries.length / pageSize);

  return <div className="focus-game fact-finder fact-finder-focus" data-board-focus="">
    <main className={`focus-game-body${panel ? ' is-menu' : ''}`}>
      <header className="focus-game-heading">
        {visibleSelection && <p>Fact Finder{visibleSelection.facts.length > 1 ? ` · Fact ${factIndex + 1} of ${visibleSelection.facts.length}` : ''}</p>}
        <h1 ref={articleTitleRef} tabIndex={-1}>{panel === 'source' ? 'Fact source' : visibleSelection?.name || 'Fact Finder'}</h1>
      </header>
      {panel === 'options' ? <FocusMenu choices={options} onBack={closePanel} />
        : panel === 'source' && visibleSelection ? <>
          <p className="focus-game-message">Checked against {visibleSelection.source.publisher}.</p>
          <a className="inline-flex items-center gap-1 underline" href={visibleSelection.source.url} target="_blank" rel="noreferrer noopener">
            Read {visibleSelection.source.title} <ExternalLink aria-hidden="true" size={15} />
          </a>
          <div className="focus-game-actions mt-3"><button type="button" className="focus-game-button" onClick={closePanel}>Back to fact</button></div>
        </> : visibleSelection ? <article className="fact-focus-article" aria-label={visibleSelection.name}>
          <div className="fact-finder-art"><EntryArtwork record={visibleSelection} /></div>
          <p className="fact-focus-text" aria-live="polite">{fact?.text}</p>
          <div className="focus-game-actions">
            <button type="button" className="focus-game-button is-primary" onClick={!lastFact ? () => chooseFact(factIndex + 1) : onLaunchGame ? launch : backToTopics}>
              {!lastFact ? 'Next fact' : onLaunchGame ? `Explore in ${visibleSelection.exploreLabel}` : 'Choose another topic'}
            </button>
            {soundOn && factAudio && <button type="button" className="focus-game-button" onClick={() => playClip(factAudio, 'fact')} aria-label="Hear fact">
              <Headphones className="mr-1 inline" aria-hidden="true" size={18} /> {playingKey === 'fact' ? 'Playing' : 'Hear fact'}
            </button>}
            <button type="button" className="focus-game-button" onClick={() => setPanel('options')}>Options</button>
          </div>
        </article> : <>
          <div className="fact-focus-search">
            <label className="fact-finder-search"><Search aria-hidden="true" size={20} /><span className="sr-only">Search topics</span>
              <input ref={searchRef} type="search" value={query} onChange={event => { setQuery(event.target.value); setPage(0); }} placeholder="Search animals, plants or planets" />
            </label>
            <label className="focus-game-menu">Topic
              <select value={category} onChange={event => { setCategory(event.target.value); setPage(0); }}>
                {FACT_FINDER_CATEGORIES.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
              </select>
            </label>
          </div>
          <p className="focus-game-message">Choose a topic to see its picture and facts.</p>
          {entries.length ? <ul className="fact-finder-results" aria-label="Topics">
            {entries.slice(page * pageSize, (page + 1) * pageSize).map(record => <li key={record.id}><button type="button" ref={node => {
              if (node) topicButtonsRef.current.set(record.id, node);
              else topicButtonsRef.current.delete(record.id);
            }} onClick={() => openTopic(record.id)}>
              {record.artKind ? <span className="fact-finder-mini-dino" aria-hidden="true"><Dino kind={record.artKind} /></span> : <img src={record.image.src} alt="" aria-hidden="true" />}
              <span>{record.name}</span><BookOpen aria-hidden="true" size={16} />
            </button></li>)}
          </ul> : <p className="fact-finder-empty" role="status">No topics found. Try another word or choose Everything.</p>}
          {pages > 1 && <label className="focus-game-menu mt-3">More topics
            <select value={page} onChange={event => setPage(Number(event.target.value))}>
              {Array.from({ length: pages }, (_, index) => <option key={index} value={index}>Topics {index * pageSize + 1}–{Math.min(entries.length, (index + 1) * pageSize)}</option>)}
            </select>
          </label>}
          <div className="focus-game-actions mt-3">
            <button type="button" className="focus-game-button" onClick={() => setPanel('options')}>Options</button>
            {onBack && <button type="button" className="focus-game-button" onClick={leave}>Back</button>}
          </div>
        </>}
    </main>
  </div>;
}
