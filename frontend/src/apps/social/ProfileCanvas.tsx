import React from 'react';
import { canComment, canSee, canSeeRecord, PEOPLE, type Layout, type Module } from './socialModel';
import { useSocial, SocialImage, MusicPlayer } from './SocialContext';

export function Comments({ target, viewer = 'you' }: { target: string; viewer?: string }) {
  const { social, act, cycle } = useSocial();
  const [text, setText] = React.useState(''), [parent, setParent] = React.useState('');
  const allowed = canComment(social, target);
  if (!allowed) return <p className="ms-empty">Connect to join this conversation, or check its audience.</p>;
  const comments = social.comments.filter(c => c.target === target && !social.blocked.includes(c.author));
  return <div className="ms-comments">{comments.map(c => <article key={c.id} className={c.parent ? 'ms-reply' : ''}><small>{c.author === 'you' ? 'You' : PEOPLE.find(p => p.id === c.author)?.name} · Cycle {c.cycle}</small>{c.parent && <small>Replying to {comments.find(p => p.id === c.parent)?.text.slice(0, 70) || 'an earlier comment'}</small>}<p>{c.text}</p>{viewer === 'you' && <div className="ms-actions"><button onClick={() => setParent(c.id)}>Reply</button>{(c.author === 'you' || target === 'profile:you') && <button onClick={() => act({ type: 'delete-comment', id: c.id })}>Remove</button>}</div>}</article>)}{!comments.length && <p className="ms-empty">Be the first to leave a little note.</p>}{viewer === 'you' && <form onSubmit={e => { e.preventDefault(); if (act({ type: 'comment', target, text, parent: parent || undefined })) { setText(''); setParent(''); } }}>
    {parent && <button type="button" onClick={() => setParent('')}>Cancel reply</button>}<textarea aria-label="Leave a comment" value={text} onChange={e => setText(e.target.value)} maxLength={2000} placeholder="Leave a little note…" required/><button>Post comment</button>
  </form>}</div>;
}
export const MODULE_NAMES = { about: 'About Me', music: 'Profile Music', friends: 'Top Friends', photos: 'Photo Albums', blogs: 'From the Journal', guestbook: 'Guestbook', interests: 'Things I Love', decoration: 'A Little Decoration' };
export function ModuleContents({ module, owner, viewer = 'you' }: { module: Module; owner: string; viewer?: string }) {
  const { social, player, visit, go } = useSocial();
  const npc = PEOPLE.find(p => p.id === owner), own = owner === 'you';
  const profileName = own ? player.maiSpaceProfile?.handle || player.name : npc?.name;
  switch (module.kind) {
    case 'about': return <><h2 className="ms-profile-name">{profileName} <span>✧</span></h2><p className="ms-mood">“{own ? social.mood : npc?.mood}” ♡</p><div className="ms-profile-symbol">{own ? (social.avatar ? <SocialImage asset={social.avatar} alt="Your profile portrait"/> : <div className="ms-portrait-placeholder">✧<small>Your picture goes here</small></div>) : <SocialImage asset={`builtin:${owner}`} alt={`${npc?.name}'s illustrated profile artwork`}/>}</div><div className="ms-profile-blurb"><strong>about me</strong><p className="ms-prewrap">{own ? social.bio || 'This is your little corner of the internet. Tell people a little about yourself in Profile Studio.' : npc?.bio}</p>{own && social.discloseLocation && <small>{social.location}</small>}{!own && <small>NPC citizen · Profile artwork</small>}</div></>;
    case 'music': return <MusicPlayer track={own ? social.track : owner === 'jeremie' ? 'builtin:stillwater' : 'builtin:starlight'}/>;
    case 'friends': return own ? <div className="ms-top8">{social.top8.map(id => { const p = PEOPLE.find(p => p.id === id); return p && <button key={id} onClick={() => visit(id)}><span>{p.icon}</span>{p.name}</button>; })}{!social.top8.length && <p>Your Top 8 is yours to choose. Feature accepted friends from Friends.</p>}{viewer === 'you' && <button onClick={() => go('Friends')}>Arrange my Top 8 →</button>}</div> : <p className="ms-empty">This citizen keeps their friendship list private.</p>;
    case 'interests': return <p className="ms-prewrap">{own ? social.interests || 'Music, hobbies, small obsessions… add yours in Profile Studio.' : npc?.interests}</p>;
    case 'photos': return <div className="ms-mini-albums">{social.albums.filter(a => a.author === owner && canSeeRecord(social, a, viewer)).map(a => <button key={a.id} onClick={() => go(`Photos:${a.id}`)}>{a.photos[0] && <SocialImage asset={a.photos[0].asset} alt={a.name}/>}<strong>{a.name}</strong><small>{a.photos.length} photographs</small></button>)}<button onClick={() => go('Photos')}>Open photo albums →</button></div>;
    case 'blogs': return <div>{social.posts.filter(p => p.author === owner && p.kind === 'blog' && !p.draft && canSee(social, owner, p.audience, viewer)).slice(0, 4).map(p => <button className="ms-journal-link" key={p.id} onClick={() => go(`Blog:${p.id}`)}><strong>{p.title}</strong><small>Cycle {p.cycle} · {p.audience}</small></button>)}{!social.posts.some(p => p.author === owner && p.kind === 'blog' && !p.draft) && <p>A fresh page, waiting for its first entry.</p>}</div>;
    case 'guestbook': return <Comments target={`profile:${owner}`} viewer={viewer}/>;
    case 'decoration': return <div className="ms-decoration">{module.text || '✦  ♡  ✧  ♫  ✿'}</div>;
    default: return null;
  }
}
export default function ProfileCanvas({ layout, owner = 'you', editing = false, selected = '', onSelect, onGeometry, viewer = 'you' }: { layout: Layout; owner?: string; editing?: boolean; selected?: string; onSelect?: (id: string) => void; onGeometry?: (id: string, values: Partial<Module>) => void; viewer?: string }) {
  const drag = React.useRef<any>(null);
  const start = (e: React.PointerEvent, m: Module, resize: boolean) => { if (e.button !== 0) return; e.preventDefault(); e.stopPropagation(); onSelect?.(m.id); e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, module: { ...m }, resize }; };
  const move = (e: React.PointerEvent) => { const d = drag.current; if (!d) return; const x = e.clientX - d.x, y = e.clientY - d.y; onGeometry?.(d.module.id, d.resize ? { w: d.module.w + x, h: d.module.h + y } : { x: d.module.x + x, y: d.module.y + y }); };
  const style = { '--ms-page-bg': layout.background, '--ms-page-surface': layout.surface, '--ms-page-text': layout.color, '--ms-page-accent': layout.accent, '--ms-page-border': `${layout.border}px`, '--ms-bar-text': layout.theme === 'glitter' ? '#32142e' : '#fff', fontFamily: layout.font } as React.CSSProperties;
  const height = Math.max(800, ...layout.modules.filter(m => !m.hidden).map(m => m.y + m.h + 30));
  return <div className={`ms-canvas-scroll ${editing ? 'is-editing' : ''}`}><div className={`ms-profile-canvas ms-texture-${layout.texture}`} style={{ ...style, height }}>
    {layout.modules.filter(m => !m.hidden).map((m, index) => <section key={m.id} className={`ms-module ${selected === m.id && editing ? 'is-selected' : ''}`} style={{ left: m.x, top: m.y, width: m.w, height: m.h, zIndex: selected === m.id && editing ? 50 : index + 1 }}>
      <header><strong>{MODULE_NAMES[m.kind]}</strong>{editing && <button className="ms-drag" aria-label={`Move ${MODULE_NAMES[m.kind]}`} onPointerDown={e => start(e, m, false)} onPointerMove={move} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onKeyDown={e => { const delta = e.shiftKey ? 20 : 5; const map = { ArrowLeft: { x: m.x - delta }, ArrowRight: { x: m.x + delta }, ArrowUp: { y: m.y - delta }, ArrowDown: { y: m.y + delta } }; if (map[e.key]) { e.preventDefault(); onGeometry?.(m.id, map[e.key]); } }}>✥ Drag</button>}</header>
      <div className="ms-module-body">{editing ? <div className="ms-editor-placeholder" onClick={() => onSelect?.(m.id)}><span>{m.kind === 'decoration' ? m.text || '✦ ♡ ✿' : MODULE_NAMES[m.kind]}</span><small>Drag the handle, resize the corner, or use the controls. Your content stays separate.</small></div> : <ModuleContents module={m} owner={owner} viewer={viewer}/>}</div>
      {editing && <button className="ms-resize" aria-label={`Resize ${MODULE_NAMES[m.kind]}`} onPointerDown={e => start(e, m, true)} onPointerMove={move} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onKeyDown={e => { const delta = e.shiftKey ? 20 : 5; if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) { e.preventDefault(); onGeometry?.(m.id, e.key.includes('Left') || e.key.includes('Right') ? { w: m.w + (e.key === 'ArrowRight' ? delta : -delta) } : { h: m.h + (e.key === 'ArrowDown' ? delta : -delta) }); } }}>◢</button>}
    </section>)}
  </div><small className="ms-canvas-hint">{editing ? '960 px design canvas · scroll sideways to reach every section · Shift + arrow moves 20 px' : 'Every page is its own little world. On narrow windows, scroll to explore the full composition.'}</small></div>;
}
