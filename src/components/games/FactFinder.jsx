import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, ExternalLink, Headphones, Search, Sparkles } from 'lucide-react';
import { Dino } from '../little/DinoArt.jsx';
import { SoundToggle } from '../shared/index.jsx';
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
  const articleFactAudio = visibleSelection?.facts.map(({ text }) => getFactFinderAudio(visibleSelection, text)) || [];
  const nameClip = visibleSelection ? getFactFinderAudio(visibleSelection, visibleSelection.name) : null;

  useEffect(() => { onPhaseChange?.('intro'); }, [onPhaseChange]);
  useEffect(() => {
    if (visibleSelectionId) articleTitleRef.current?.focus();
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
    setSelectedId(id);
  };
  const backToTopics = () => {
    stopAudio(audioRef, audioGenerationRef, setPlayingKey);
    setSelectedId(null);
    requestAnimationFrame(() => {
      const button = topicButtonsRef.current.get(returnFocusIdRef.current);
      if (button?.isConnected) button.focus();
      else searchRef.current?.focus();
    });
  };

  return <main className={`fact-finder${visibleSelection ? ' is-reading' : ''}`}>
    <header className="fact-finder-header">
      {selectedId
        ? <button type="button" className="fact-finder-back" onClick={backToTopics} aria-label="Back to topics"><ArrowLeft aria-hidden="true" /> <span>Topics</span></button>
        : onBack && <button type="button" className="fact-finder-back" onClick={onBack} aria-label="Back to Explore"><ArrowLeft aria-hidden="true" /> <span>Back</span></button>}
      <div><p className="fact-finder-kicker"><Sparkles aria-hidden="true" size={16} /> LOOK, READ, DISCOVER</p><h1>Fact Finder</h1><p className="fact-finder-intro">Pick a topic to meet an animal, plant, dinosaur or space world.</p></div>
      {onToggleSound && <SoundToggle soundOn={soundOn} onToggle={onToggleSound} className="fact-finder-sound-toggle" />}
    </header>

    {visibleSelection ? <article className="fact-finder-detail" aria-labelledby="fact-finder-title">
      <div className="fact-finder-art"><EntryArtwork record={visibleSelection} /><p>{visibleSelection.image.caption}</p></div>
      <div className="fact-finder-story">
        <p className="fact-finder-category-label">{FACT_FINDER_CATEGORIES.find(({ id }) => id === visibleSelection.category)?.label}</p>
        <h2 id="fact-finder-title" ref={articleTitleRef} tabIndex={-1}>{visibleSelection.name}</h2>
        <ul className="fact-finder-facts">{visibleSelection.facts.map(({ text }, index) => {
          const clip = articleFactAudio[index]?.text === text ? articleFactAudio[index] : null;
          return <li key={`${visibleSelection.id}-${index}`}><p>{text}</p>{clip && <button className="fact-finder-audio" type="button" disabled={!soundOn} onClick={() => playClip(clip, `fact-${index}`)} aria-label={`Hear fact: ${text}`}><Headphones aria-hidden="true" size={18} /><span>{playingKey === `fact-${index}` ? 'Playing' : 'Hear fact'}</span></button>}</li>;
        })}</ul>
        {nameClip && <button className="fact-finder-audio fact-finder-name-audio" type="button" disabled={!soundOn} onClick={() => playClip(nameClip, 'name')} aria-label={`Hear name: ${visibleSelection.name}`}><Headphones aria-hidden="true" size={18} /><span>{playingKey === 'name' ? 'Playing name' : `Hear name`}</span></button>}
        <details className="fact-finder-source"><summary>Where this fact comes from</summary><p>Checked against {visibleSelection.source.publisher}.</p><a href={visibleSelection.source.url} target="_blank" rel="noreferrer noopener">Read {visibleSelection.source.title} <ExternalLink aria-hidden="true" size={15} /></a></details>
        {onLaunchGame && <button className="fact-finder-explore" type="button" onClick={() => {
          stopAudio(audioRef, audioGenerationRef, setPlayingKey);
          const options = visibleSelection.exploreModule ? { module: visibleSelection.exploreModule } : undefined;
          onLaunchGame(visibleSelection.exploreGameId, options);
        }}>Explore in {visibleSelection.exploreLabel} <span aria-hidden="true">→</span></button>}
      </div>
    </article> : <>
      <section className="fact-finder-browser" aria-label="Find a topic">
        <label className="fact-finder-search"><Search aria-hidden="true" size={20} /><span className="sr-only">Search topics</span><input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search animals, plants, or planets" /></label>
        <div className="fact-finder-categories" role="group" aria-label="Filter topics by category">
          {FACT_FINDER_CATEGORIES.map(({ id, label }) => <button type="button" key={id} aria-pressed={category === id} onClick={() => setCategory(id)}>{label}</button>)}
        </div>
        <p className="fact-finder-count" aria-live="polite">{entries.length} {entries.length === 1 ? 'topic' : 'topics'}</p>
        {entries.length ? <ul className="fact-finder-results" aria-label="Topics">
          {entries.map((record) => <li key={record.id}><button type="button" aria-pressed={false} ref={(node) => {
            if (node) topicButtonsRef.current.set(record.id, node);
            else topicButtonsRef.current.delete(record.id);
          }} onClick={() => openTopic(record.id)}>
            {record.artKind ? <span className="fact-finder-mini-dino" aria-hidden="true"><Dino kind={record.artKind} /></span> : <img src={record.image.src} alt="" aria-hidden="true" />}
            <span>{record.name}</span><BookOpen aria-hidden="true" size={16} />
          </button></li>)}
        </ul> : <p className="fact-finder-empty" role="status">No topics match that search. Try another word or choose Everything.</p>}
      </section>
      <div className="fact-finder-prompt" role="status"><span aria-hidden="true">🔎</span><p>Choose a topic to open its picture and fact.</p></div>
    </>}
  </main>;
}
