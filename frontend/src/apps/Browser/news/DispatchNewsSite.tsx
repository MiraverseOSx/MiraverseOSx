import React, { useRef, useEffect, useState } from 'react';
import { useOSStore } from '../../../store/useOSStore';
import { Radio, ArrowUpRight, ArrowLeft, Bookmark, Search, Check, Activity, Landmark, HeartPulse, Globe, GraduationCap } from 'lucide-react';
import { buildNewsEdition, filterNews, NEWS_SECTIONS, restoreNewsReading, type NewsArticle, type NewsSection } from './newsModel';
import meridionWorld from '../../../assets/images/meridion_world.jpg';
import './dispatch.css';
import { NEWS_SITE, newsUrl, parseNewsLocation } from './newsSite';

const ARTWORK: Record<string, { src: string; caption: string }> = {
  'prism-watch': { src: '/images/worknet/transit-junction.png', caption: 'Illustration · Aureline transit infrastructure' },
  'civic-network': { src: meridionWorld, caption: 'Illustration · The world of Meridion' },
  'employment-guide': { src: '/images/worknet/depository.png', caption: 'Illustration · Institutional life in Aureline' },
  'seven-realms': { src: meridionWorld, caption: 'Illustration · Across the Seven Realms' },
};
const SECTION_ICONS = { Civic: Landmark, Security: Activity, Health: HeartPulse, Economy: Landmark, Culture: GraduationCap };

function NewsArtwork({ article, compact = false }: { article: NewsArticle; compact?: boolean }) {
  const art = ARTWORK[article.id];
  const Icon = SECTION_ICONS[article.section] || Globe;
  return art ? <figure className={`pulse-art ${compact ? 'pulse-art-compact' : ''}`}>
    <img src={art.src} alt={art.caption} loading={compact ? 'lazy' : 'eager'} />
    {!compact && <figcaption>{art.caption}</figcaption>}
  </figure> : <div className={`pulse-topic-art pulse-topic-${article.section.toLowerCase()}`} aria-hidden="true">
    <Icon size={compact ? 28 : 58} strokeWidth={1}/><span>{article.section.toUpperCase()} / DISPATCH EXPLAINER</span>
  </div>;
}

export default function DispatchNewsSite({ url, navigateTab }: { url: string; navigateTab: (url: string, title?: string) => void }) {
  const gameplay = useOSStore(s => s.gameplay);
  const location = parseNewsLocation(url);
  const { section, query, savedOnly, articleId: selected } = location;
  const [searchText, setSearchText] = useState(query);
  const setQuery = (value: string) => navigateTab(newsUrl({ section, savedOnly, query: value }));
  const heading = useRef<HTMLHeadingElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const reading = restoreNewsReading(gameplay.pulseNews);
  const edition = buildNewsEdition({ cycle: gameplay.timeCycleCount, corruption: gameplay.prismCorruptionLevel });
  const articles = filterNews(edition, section, query, savedOnly, reading.saved);
  const article = edition.find(item => item.id === selected);
  const isFrontPage = section === 'All news' && !query.trim() && !savedOnly;
  const lead = articles[0];

  const updateReading = (id: string, save = false) => useOSStore.setState(state => {
    const current = restoreNewsReading(state.gameplay.pulseNews);
    const next = save
      ? { ...current, saved: current.saved.includes(id) ? current.saved.filter(value => value !== id) : [...current.saved, id] }
      : { ...current, read: [...new Set([...current.read, id])] };
    return { gameplay: { ...state.gameplay, pulseNews: restoreNewsReading(next) } };
  });
  const focusHeading = () => requestAnimationFrame(() => {
    heading.current?.focus({ preventScroll: true });
    content.current?.scrollIntoView({ block: 'start' });
  });
  const openArticle = (item: NewsArticle) => { navigateTab(newsUrl({ section, query, savedOnly, articleId: item.id }), `${item.headline} · ${NEWS_SITE.name}`); focusHeading(); };
  const chooseSection = (value: NewsSection) => { navigateTab(newsUrl({ section: value })); focusHeading(); };
  useEffect(() => { if (article && !reading.read.includes(article.id)) updateReading(article.id); }, [article?.id]);
  const reset = () => chooseSection('All news');
  const saveButton = (item: NewsArticle) => <button
    className="pulse-bookmark"
    aria-label={`${reading.saved.includes(item.id) ? 'Unsave' : 'Save'} ${item.headline}`}
    aria-pressed={reading.saved.includes(item.id)} onClick={() => updateReading(item.id, true)}><Bookmark size={15}/></button>;
  const storyMeta = (item: NewsArticle) => <div className="pulse-story-bottom"><span>{item.source} · Cycle {item.cycle}</span><span>{reading.read.includes(item.id) && <small><Check size={12}/> Read</small>}{saveButton(item)}</span></div>;
  const card = (item: NewsArticle) => <article key={item.id} className="pulse-story">
    <button className="pulse-image-link" aria-label={`Read ${item.headline}`} onClick={() => openArticle(item)}><NewsArtwork article={item} compact/></button>
    <div className="pulse-story-meta">{item.section} / {item.kind}</div>
    <h2><button onClick={() => openArticle(item)}>{item.headline}</button></h2>
    <p>{item.summary}</p>{storyMeta(item)}
  </article>;

  if (!location.valid || (selected && !article)) return <section className="pulse-news pulse-empty" aria-label="The Meridion Dispatch"><h1>Story unavailable</h1><p>This address does not have a published page.</p><button className="pulse-related" onClick={reset}>Return to the front page</button></section>;
  return <section className="pulse-news" aria-label="The Meridion Dispatch">
    <header className="pulse-network-header">
      <button className="pulse-home" aria-label="The Meridion Dispatch home" onClick={reset}><Radio size={25}/><span>MERIDION<span>DISPATCH</span></span></button>
      <span className="pulse-network-tagline">NEWS FROM ACROSS THE SEVEN REALMS</span>
      <span className="pulse-network-edition">YEAR 1000 <span>/</span> CYCLE {gameplay.timeCycleCount}</span>
    </header>
    <nav className="pulse-nav" aria-label="News sections">
      {NEWS_SECTIONS.map(value => <button key={value} aria-pressed={section === value && !savedOnly} onClick={() => chooseSection(value)}>{value}</button>)}
      <button className="pulse-saved-filter" aria-pressed={savedOnly} onClick={() => navigateTab(newsUrl({ savedOnly: !savedOnly }))}><Bookmark size={13}/> Saved stories</button>
    </nav>
    <div className="pulse-following" aria-label="Following now"><strong>IN FOCUS</strong>
      <button onClick={() => openArticle(edition[0])}>PRISM grid watch</button><button onClick={() => chooseSection('Economy')}>Working in Aureline</button><button onClick={() => chooseSection('Health')}>Aura & recovery</button><button onClick={() => chooseSection('Culture')}>The Seven Realms</button>
    </div>
    <div className="pulse-content" ref={content}>{article ? <article className="pulse-reader" aria-label={article.headline}>
      <button className="pulse-text-button" onClick={() => { navigateTab(newsUrl({ section, query, savedOnly })); focusHeading(); }}><ArrowLeft size={14}/> Back to edition</button>
      <div className="pulse-story-meta">{article.section} / {article.kind} / Cycle {article.cycle}</div>
      <h1 tabIndex={-1} ref={heading}>{article.headline}</h1><p className="pulse-reader-deck">{article.summary}</p>
      <div className="pulse-byline"><span>{article.source}<small>{article.kind === 'World advisory' ? `Current coverage · Cycle ${article.cycle}` : `Published cycle ${article.cycle}`}</small></span><button className="pulse-text-button" aria-pressed={reading.saved.includes(article.id)} onClick={() => updateReading(article.id, true)}><Bookmark size={14}/>{reading.saved.includes(article.id) ? 'Remove saved story' : 'Save story'}</button></div>
      <NewsArtwork article={article}/><div className="pulse-reader-body">{article.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
      {article.link && <button className="pulse-related" onClick={() => useOSStore.getState().openAppWorkspace(article.link!.app)}>{article.link.label}<ArrowUpRight size={15}/></button>}
    </article> : <>
      <div className="pulse-toolbar"><div><span className="pulse-eyebrow">AURELINE & THE SEVEN REALMS</span><h1 tabIndex={-1} ref={heading}>{savedOnly ? 'Your reading shelf' : section === 'All news' ? 'The front page' : section}</h1></div><form className="pulse-search" onSubmit={event => { event.preventDefault(); setQuery(searchText); }}><Search size={15}/><input type="search" aria-label="Search news" placeholder="Search the Dispatch" value={searchText} onChange={event => setSearchText(event.target.value)}/><button type="submit">Search</button></form></div>
      <p className="pulse-result-count" role="status">{articles.length} {articles.length === 1 ? 'story' : 'stories'}{savedOnly ? ' saved in this edition' : ' in this edition'}</p>
      {lead ? <>
        {isFrontPage ? <>
          <div className="pulse-top-grid">
            <article className="pulse-lead"><button className="pulse-image-link" aria-label={`Read ${lead.headline}`} onClick={() => openArticle(lead)}><NewsArtwork article={lead}/></button><div className="pulse-story-meta"><span className="pulse-coverage-label">WORLD WATCH</span> {lead.section}</div><h2><button onClick={() => openArticle(lead)}>{lead.headline}</button></h2><p>{lead.summary}</p>{storyMeta(lead)}
              <button className="pulse-related-headline" onClick={() => openArticle(edition.find(item => item.id === 'faith-recovery') || lead)}>What the world reading means for your personal aura <ArrowUpRight size={13}/></button>
            </article>
            <aside className="pulse-headline-rail" aria-label="Latest news"><h2 className="pulse-section-heading">Latest news</h2>{articles.slice(1, 5).map(item => <article key={item.id}><span className="pulse-story-meta">{item.section} · Cycle {item.cycle}</span><h3><button onClick={() => openArticle(item)}>{item.headline}</button></h3><span className="pulse-rail-source">{item.source}</span></article>)}</aside>
            <aside className="pulse-sidebar" aria-label="World briefing"><div className="pulse-briefing"><Radio size={26}/><span>DISPATCH / WORLD DESK</span><h2>The world<br/>right now.</h2><p>PRISM exposure</p><strong>{Number.isFinite(gameplay.prismCorruptionLevel) ? gameplay.prismCorruptionLevel.toFixed(1) : '0.0'}<small>%</small></strong><p>Current world reading · Cycle {gameplay.timeCycleCount}</p><button onClick={() => openArticle(lead)}>Read the briefing <ArrowUpRight size={14}/></button></div><div className="pulse-editors"><h2 className="pulse-section-heading">Editor’s picks</h2>{articles.filter(item => ['seven-realms', 'campus-practice'].includes(item.id)).map(item => <button key={item.id} onClick={() => openArticle(item)}><span>{item.section}</span>{item.headline}<ArrowUpRight size={13}/></button>)}</div></aside>
          </div>
          <section className="pulse-more" aria-label="More top stories"><div className="pulse-section-header"><h2 className="pulse-section-heading">More top stories</h2><span>REPORTING FROM ACROSS MERIDION</span></div><div className="pulse-card-grid">{articles.slice(1, 4).map(card)}</div></section>
          <section className="pulse-more" aria-label="Culture and the Seven Realms"><div className="pulse-section-header"><h2 className="pulse-section-heading">Culture & the Seven Realms</h2><button className="pulse-text-button" onClick={() => chooseSection('Culture')}>More culture <ArrowUpRight size={14}/></button></div><div className="pulse-card-grid">{articles.filter(item => item.section === 'Culture').map(card)}</div></section>
        </> : <div className="pulse-card-grid pulse-results-grid">{articles.map(card)}</div>}
      </> : <div className="pulse-empty"><Search size={30}/><h2>{savedOnly ? 'Your shelf is quiet.' : 'No stories found.'}</h2><p>{savedOnly ? 'Use a story’s bookmark button to keep it here.' : 'Try another search or news section.'}</p><button className="pulse-text-button" onClick={reset}>Show all news <ArrowUpRight size={14}/></button></div>}
    </>}
    <footer className="pulse-footer"><strong>THE MERIDION DISPATCH</strong><span>Meridion’s public news network<br/>Public reporting · Available offline</span><div>{NEWS_SECTIONS.slice(1).map(value => <button key={value} aria-label={`Browse ${value} news`} onClick={() => chooseSection(value)}>{value}</button>)}</div></footer></div>
  </section>;
}
