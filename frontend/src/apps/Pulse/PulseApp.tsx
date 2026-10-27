import React from 'react';
import { ArrowUpRight, Bookmark, Globe, Newspaper, Radio } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { buildNewsEdition, restoreNewsReading } from '../Browser/news/newsModel';
import { NEWS_SITE, newsUrl } from '../Browser/news/newsSite';
import './portal.css';

export default function PulseApp() {
  const gameplay = useOSStore(state => state.gameplay);
  const reading = restoreNewsReading(gameplay.pulseNews);
  const edition = buildNewsEdition({ cycle: gameplay.timeCycleCount, corruption: gameplay.prismCorruptionLevel });
  const savedCount = edition.filter(article => reading.saved.includes(article.id)).length;
  const open = (url: string = NEWS_SITE.url) => useOSStore.getState().openAppWorkspace('browser', url);
  return <section className="pulse-portal" aria-label="PULSE news portal">
    <header className="pulse-portal-header"><span className="pulse-portal-mark"><Radio size={24}/></span><div><span className="pulse-portal-kicker">YOUR NEWS PORTAL</span><h1>PULSE</h1></div><span className="pulse-portal-cycle">CYCLE {gameplay.timeCycleCount}</span></header>
    <div className="pulse-portal-body"><div className="pulse-portal-intro"><span className="pulse-portal-kicker">CONNECTED TO MERIDION</span><h2>A window onto the world.</h2><p>Your publications, current headlines, and saved reading in one place.</p></div>
      <article className="pulse-publication"><div className="pulse-publication-heading"><Newspaper size={28}/><span>NEWS & PUBLIC AFFAIRS</span></div><h2>{NEWS_SITE.name}</h2><p>Reporting from Aureline and the Seven Realms. Civic affairs, health, economy, culture, and the world grid.</p><div className="pulse-publication-address"><Globe size={13}/>{NEWS_SITE.domain}</div><button className="pulse-portal-primary" onClick={() => open()}>Open Meridion Dispatch <ArrowUpRight size={15}/></button></article>
      <div className="pulse-portal-grid"><section aria-labelledby="pulse-headlines"><div className="pulse-portal-section-heading"><h2 id="pulse-headlines">From the Dispatch</h2><span>CYCLE {gameplay.timeCycleCount}</span></div>{edition.slice(0, 4).map(article => <button className="pulse-portal-headline" key={article.id} onClick={() => open(newsUrl({ articleId: article.id }))}><span>{article.section} · {article.source}</span><strong>{article.headline}</strong><ArrowUpRight size={14}/></button>)}</section>
      <aside className="pulse-portal-reading"><Bookmark size={22}/><h2>Your reading shelf</h2><p>{savedCount ? `${savedCount} ${savedCount === 1 ? 'story' : 'stories'} saved from the Dispatch.` : 'Keep stories close by saving them while you read.'}</p><button onClick={() => open(newsUrl({ savedOnly: true }))}>Open saved stories <ArrowUpRight size={14}/></button><span className="pulse-portal-note">Reading status stays with you across PULSE and VerseNet.</span></aside></div>
      <footer className="pulse-portal-footer"><Radio size={12}/> PULSE · NEWS ACCESS FOR AURELINE</footer>
    </div>
  </section>;
}
