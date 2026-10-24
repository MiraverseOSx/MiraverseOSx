import React, { useEffect, useMemo, useState } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { SocialContext, SocialImage } from './SocialContext';
import { canSee, PEOPLE, restoreSocial } from './socialModel';
import ProfileCanvas from './ProfileCanvas';
import ProfileStudio from './ProfileStudio';
import { Communities, Events, HomeFeed, Music, PeopleDirectory, Photos, SocialMail, Writing } from './SocialSections';
import './mai-space.css';

const NAV = ['Home', 'Browse', 'Search', 'Friends', 'Mail', 'Blog', 'Music'];
export function MaiSpacePortal() {
  const player = useOSStore(s => s.gameplay.player), cycle = useOSStore(s => s.gameplay.timeCycleCount || 0), socialAction = useOSStore(s => s.socialAction);
  const social = useMemo(() => restoreSocial(player.maiSpaceWorld, player.maiSpaceProfile), [player.maiSpaceWorld, player.maiSpaceProfile]);
  const [route, navigate] = useState('Home'), [owner, setOwner] = useState('you'), [status, setStatus] = useState('');
  const section = route.split(':')[0], suffix = route.includes(':') ? route.slice(route.indexOf(':') + 1) : '';
  const act = (action: any) => { const result = socialAction(action); if (!['draft-layout', 'tick', 'profile'].includes(action.type)) setStatus(result.ok && result.message === 'Saved.' ? 'Saved to your social world.' : result.message); return result.ok; };
  const visit = (id: string) => { setOwner(id); navigate('My Profile'); };
  useEffect(() => { socialAction({ type: 'tick' }); }, [cycle, socialAction]);
  const notifications = social.notifications.filter(n => !n.read).length;
  const profile = PEOPLE.find(p => p.id === owner);
  return <SocialContext.Provider value={{ social, player, cycle, act, visit, go: navigate }}><div className="mai-space-root">
    <header className="ms-network-header"><button className="ms-wordmark" onClick={() => navigate('Home')} aria-label="MAI.SPACE Home"><span>✳</span><div>mai.space<small>your corner of the internet</small></div></button><div className="ms-account-nav"><button onClick={() => visit('you')}>My Profile</button><button onClick={() => navigate('Notifications')}>♡ Notifications {notifications > 0 && <span className="ms-unread-pill">{notifications}</span>}</button><button className="ms-studio-link" onClick={() => navigate('Customize')}>✧ Customize</button></div></header>
    <nav className="ms-primary-nav" aria-label="MAI.SPACE main navigation">{NAV.map(item => <button key={item} aria-current={section === item ? 'page' : undefined} onClick={() => navigate(item)}>{item}</button>)}<span className="ms-nav-separator"/><small>Cycle {cycle} · NPC neighborhood</small></nav>
    <nav className="ms-secondary-nav" aria-label="MAI.SPACE sections">{['Photos', 'Bulletins', 'Groups', 'Events'].map(item => <button key={item} aria-current={section === item ? 'page' : undefined} onClick={() => navigate(item)}>{item}</button>)}<span>personal pages • shared memories</span></nav>
    <div className="ms-live-status" role="status">{status}</div>
    <main className={`ms-main ${section === 'My Profile' ? 'ms-profile-page' : ''}`} key={section === 'My Profile' ? `profile:${owner}` : route}>
      {section === 'Home' && <HomeFeed/>}
      {section === 'Browse' && <PeopleDirectory/>}
      {section === 'Friends' && <PeopleDirectory friendsOnly/>}
      {section === 'Photos' && <Photos initialAlbum={suffix}/>}
      {section === 'Music' && <Music/>}
      {section === 'Blog' && <Writing kind="blog" selected={suffix}/>}
      {section === 'Bulletins' && <Writing kind="bulletin"/>}
      {section === 'Groups' && <Communities/>}
      {section === 'Events' && <Events initialGroup={suffix}/>}
      {section === 'Mail' && <SocialMail initialPerson={suffix}/>}
      {section === 'Customize' && <ProfileStudio/>}
      {section === 'Search' && <SocialSearch/>}
      {section === 'Notifications' && <div className="ms-content-width"><h1>Little things you missed</h1>{social.notifications.map(n => <article className="ms-card" key={n.id}><small>{n.read ? 'Read' : 'New'}</small><p>{n.text}</p><button onClick={() => { act({ type: 'read-notification', id: n.id }); navigate(n.destination); if (n.destination === 'My Profile') setOwner('you'); }}>Open & mark read</button></article>)}<p className="ms-help">Notifications contain only social activity. Private institutional records never enter this list.</p></div>}
      {section === 'My Profile' && (owner !== 'you' && (!profile || social.blocked.includes(owner)) ? <div className="ms-card">This profile is unavailable. Manage blocked contacts in Friends.</div> : <><div className="ms-profile-heading"><div><small>MAI.SPACE / PROFILE</small><span className="ms-profile-address">{owner === 'you' ? player.maiSpaceProfile?.handle || player.name : profile?.handle}</span></div><div className="ms-actions">{owner === 'you' ? <button onClick={() => navigate('Customize')}>Edit my page</button> : <><button onClick={() => navigate(`Mail:${owner}`)}>Message</button><button onClick={() => navigate('Friends')}>Friendship & boundaries</button></>}</div></div>{owner === 'you' && social.banner && <SocialImage className="ms-profile-banner" asset={social.banner} alt="Your profile banner"/>}<ProfileCanvas owner={owner} layout={owner === 'you' ? social.layout : social.npcLayouts[owner]}/></>)}
    </main><footer className="ms-network-footer">MAI.SPACE · made for little corners and lasting connections <button onClick={() => navigate('Friends')}>Privacy & boundaries</button></footer>
  </div></SocialContext.Provider>;
}
function SocialSearch() {
  const { social, visit, go } = React.useContext(SocialContext);
  const [query, search] = useState('');
  const match = (text: string) => query.trim() && text.toLowerCase().includes(query.toLowerCase());
  return <div className="ms-content-width"><h1>Find something familiar. Or something new.</h1><label>Search the social neighborhood<input type="search" value={query} onChange={e => search(e.target.value)} placeholder="People, interests, journal titles, groups…"/></label><p className="ms-help">Searches public and accessible social information, not private civic or case records.</p><div className="ms-people-grid">{PEOPLE.filter(p => !social.blocked.includes(p.id) && match(`${p.name} ${p.handle} ${p.interests}`)).map(p => <button className="ms-card" key={p.id} onClick={() => visit(p.id)}>{p.icon} {p.name}<small>{p.interests}</small></button>)}{social.posts.filter(p => !p.draft && canSee(social, p.author, p.audience) && match(p.title)).map(p => <button className="ms-card" key={p.id} onClick={() => go(p.kind === 'blog' ? `Blog:${p.id}` : 'Home')}>{p.title}<small>{p.kind} · {p.audience}</small></button>)}{social.groups.filter(g => !g.private && match(`${g.name} ${g.description}`)).map(g => <button className="ms-card" key={g.id} onClick={() => go('Groups')}>{g.name}<small>Community</small></button>)}</div></div>;
}
export default MaiSpacePortal;
