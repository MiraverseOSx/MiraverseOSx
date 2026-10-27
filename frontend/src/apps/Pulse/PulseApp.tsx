import React from 'react';
import { ArrowRight, ArrowUpRight, Bookmark, Compass, Globe, Newspaper, Radio } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { buildNewsEdition, restoreNewsReading } from '../Browser/news/newsModel';
import { NEWS_SITE, newsUrl } from '../Browser/news/newsSite';
import meridionWorld from '../../assets/images/meridion_world.jpg';
import './portal.css';

export default function PulseApp() {
  const gameplay = useOSStore(state => state.gameplay);
  const reading = restoreNewsReading(gameplay.pulseNews);
  const edition = buildNewsEdition({ cycle: gameplay.timeCycleCount, corruption: gameplay.prismCorruptionLevel });
  const savedCount = edition.filter(article => reading.saved.includes(article.id)).length;
  const open = (url: string = NEWS_SITE.url) => useOSStore.getState().openAppWorkspace('browser', url);
  return <section className="pulse-portal" aria-label="PULSE news portal">
    <aside className="pulse-portal-sidebar">
      <div className="pulse-portal-brand"><span className="pulse-portal-mark"><Radio size={22}/></span><div><h1>PULSE</h1><span>Your news, connected.</span></div></div>
      <nav aria-label="PULSE navigation"><button aria-current="page" onClick={() => document.getElementById('pulse-overview')?.scrollTo({ top: 0 })}><Compass size={18}/> Overview</button><button onClick={() => open(newsUrl({ savedOnly: true }))}><Bookmark size={18}/> Reading shelf <span>{savedCount}</span></button></nav>
      <div className="pulse-portal-network"><Globe size={17}/><div><strong>VerseNet</strong><span>Connected to Meridion</span></div><i aria-label="Connected"/></div>
    </aside>
    <div className="pulse-portal-scroll" id="pulse-overview"><div className="pulse-portal-body">
      <header className="pulse-portal-intro"><div><span className="pulse-portal-kicker">YOUR DAILY CONNECTION</span><h2>Your world, in view.</h2><p>A place to catch up. A story to take with you.</p></div><span className="pulse-portal-cycle">Meridion <span>Cycle {gameplay.timeCycleCount}</span></span></header>
      <div className="pulse-portal-feature-grid">
        <article className="pulse-publication"><div className="pulse-publication-copy"><span className="pulse-portal-kicker"><Newspaper size={14}/> FEATURED PUBLICATION</span><h2>The Meridion<br/>Dispatch<span>.</span></h2><p>Life in Aureline. Stories from the Seven Realms.</p><div className="pulse-publication-address"><Globe size={13}/>{NEWS_SITE.domain}</div><button className="pulse-portal-primary" onClick={() => open()}>Open Meridion Dispatch <ArrowUpRight size={16}/></button></div><div className="pulse-publication-cover"><img src={meridionWorld} alt="Illustration of Meridion and its floating cities"/><span>ACROSS THE SEVEN REALMS</span></div></article>
        <aside className="pulse-portal-reading"><span className="pulse-shelf-icon"><Bookmark size={21}/></span><span className="pulse-portal-kicker">PICK UP WHERE YOU LEFT OFF</span><h2>Your reading shelf</h2><p>{savedCount ? `${savedCount} ${savedCount === 1 ? 'story' : 'stories'} saved from the Dispatch.` : 'Good stories are worth keeping. Save one while you read.'}</p><button onClick={() => open(newsUrl({ savedOnly: true }))}>Open saved stories <ArrowRight size={16}/></button><span className="pulse-portal-note">Always with you on VerseNet.</span></aside>
      </div>
      <section className="pulse-portal-headlines" aria-labelledby="pulse-headlines"><div className="pulse-portal-section-heading"><div><span className="pulse-portal-kicker">THE LATEST EDITION</span><h2 id="pulse-headlines">From the Dispatch</h2></div><button onClick={() => open()}>Visit publication <ArrowUpRight size={14}/></button></div><div className="pulse-portal-headline-grid">{edition.slice(0, 4).map((article, index) => <button className="pulse-portal-headline" key={article.id} onClick={() => open(newsUrl({ articleId: article.id }))}><span className="pulse-headline-number">0{index + 1}</span><span className="pulse-headline-copy"><span>{article.section} <span>· Cycle {article.cycle}</span></span><strong>{article.headline}</strong><small>{article.source}</small></span><ArrowUpRight size={17}/></button>)}</div></section>
      <footer className="pulse-portal-footer"><span><Radio size={13}/> PULSE</span><span>Connected to the stories of Meridion.</span></footer>
    </div></div>
  </section>;
}
