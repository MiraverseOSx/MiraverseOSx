import React, { useEffect } from 'react';
import { canComment, canSee, canSeeRecord, makeLayout, PEOPLE, type Layout, type Module } from './socialModel';
import { useSocial, SocialImage, MusicPlayer } from './SocialContext';
import { RetroHtml, RetroWidgetModule } from './RetroWidgets';

export function Comments({ target, viewer = 'you' }: { target: string; viewer?: string }) {
  const { social, act, cycle } = useSocial();
  const [text, setText] = React.useState(''), [parent, setParent] = React.useState('');
  const allowed = canComment(social, target);
  if (!allowed) return <p className="ms-empty">Connect to join this conversation, or check its audience.</p>;
  const rawComments = social.comments.filter(c => c.target === target && !social.blocked.includes(c.author));
  const pinnedIds = social.pinnedCommentIds || [];
  const comments = [...rawComments].sort((a, b) => {
    const aPinned = pinnedIds.includes(a.id);
    const bPinned = pinnedIds.includes(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  return (
    <div className="ms-comments">
      {comments.map(c => {
        const isPinned = pinnedIds.includes(c.id);
        const parentComment = c.parent ? rawComments.find(p => p.id === c.parent) : undefined;
        return (
          <article key={c.id} className={`${c.parent ? 'ms-reply' : ''} ${isPinned ? 'ms-pinned-comment' : ''}`}>
            <header className="ms-comment-header">
              <small>
                {isPinned && <span className="ms-pin-indicator" title="Pinned note">📌 </span>}
                <strong>{c.author === 'you' ? 'You' : PEOPLE.find(p => p.id === c.author)?.name}</strong> · Cycle {c.cycle}
              </small>
              {c.parent && <small className="ms-reply-target">Replying to {parentComment?.text.slice(0, 50) || 'an earlier comment'}…</small>}
            </header>
            <RetroHtml text={c.text} className="ms-comment-body" />
            {viewer === 'you' && (
              <div className="ms-actions">
                <button type="button" onClick={() => setParent(c.id)}>Reply</button>
                {target === 'profile:you' && (
                  <button type="button" onClick={() => act({ type: 'pin-comment', id: c.id })}>
                    {isPinned ? 'Unpin' : '📌 Pin'}
                  </button>
                )}
                {(c.author === 'you' || target === 'profile:you') && (
                  <button type="button" onClick={() => act({ type: 'delete-comment', id: c.id })}>Remove</button>
                )}
              </div>
            )}
          </article>
        );
      })}
      {!comments.length && <p className="ms-empty">Be the first to leave a little note.</p>}
      {viewer === 'you' && (
        <form onSubmit={e => { e.preventDefault(); if (act({ type: 'comment', target, text, parent: parent || undefined })) { setText(''); setParent(''); } }}>
          {parent && <button type="button" onClick={() => setParent('')}>Cancel reply</button>}
          <textarea aria-label="Leave a comment" value={text} onChange={e => setText(e.target.value)} maxLength={2000} placeholder="Leave a little note… (Supports [glitter], [rainbow], [marquee], and [badge:id])" required/>
          <button>Post comment</button>
        </form>
      )}
    </div>
  );
}

export const MODULE_NAMES = {
  about: 'Profile',
  music: 'Profile Song',
  friends: 'Top 8 Friends',
  photos: 'Photo Albums',
  blogs: 'Blurbs & Blog',
  guestbook: 'Friends’ Comments',
  interests: 'Interests',
  decoration: 'A Little Decoration',
  widget: 'Retro Widgets & Stamps'
};

export function ModuleContents({ module, owner, viewer = 'you' }: { module: Module; owner: string; viewer?: string }) {
  const { social, player, visit, go } = useSocial();
  const npc = PEOPLE.find(p => p.id === owner), own = owner === 'you';
  const profileName = own ? player.maiSpaceProfile?.handle || player.name : npc?.name;
  switch (module.kind) {
    case 'about': return <><h2 className="ms-profile-name">{profileName}</h2><p className="ms-mood">“{own ? social.mood : npc?.mood}”</p><div className="ms-identity"><div className="ms-profile-symbol">{own ? (social.avatar ? <SocialImage asset={social.avatar} alt="Your profile portrait"/> : <div className="ms-portrait-placeholder">✧<small>Add your photo</small></div>) : <SocialImage asset={`builtin:${owner}`} alt={`${npc?.name}'s illustrated profile artwork`}/>}</div><div className="ms-profile-facts"><strong>{own ? 'Personal profile' : 'NPC citizen'}</strong><p>{own ? 'Here for friends' : npc?.interests.split(' · ').slice(0, 2).join(' · ')}</p>{own && social.discloseLocation && <p>{social.location}</p>}<small>{own ? 'Your personal corner' : 'Illustrated profile artwork'}</small><p className="ms-online">✦ {own ? 'Online now!' : npc?.mood}</p></div></div><p className="ms-view-links">View My: <button onClick={() => go('Photos')}>Pics</button> | <button onClick={() => go('Blog')}>Blog</button></p><div className="ms-contact-box"><h3>Contacting {profileName}</h3><div>{own ? <><button onClick={() => go('Customize')}>✎ Edit Profile</button><button onClick={() => go('Friends')}>♡ Manage Friends</button></> : <><button onClick={() => go(`Mail:${owner}`)}>✉ Send Message</button><button onClick={() => go(social.friends.includes(owner) ? 'Friends' : 'Browse')}>{social.friends.includes(owner) ? '♡ View Friendship' : '＋ Add to Friends'}</button></>}<button onClick={() => go('Photos')}>▧ View Photos</button><button onClick={() => go('Music')}>♫ Browse Music</button></div></div><div className="ms-profile-url"><strong>MAI.SPACE URL:</strong><span>mai.space/{own ? player.maiSpaceProfile?.handle || 'me' : npc?.handle}</span></div></>;
    case 'music': return <MusicPlayer track={own ? social.track : owner === 'jeremie' ? 'builtin:stillwater' : 'builtin:starlight'}/>;
    case 'friends': return own ? <div className="ms-top8">{social.top8.map(id => { const p = PEOPLE.find(p => p.id === id); return p && <button key={id} onClick={() => visit(id)}><span><SocialImage asset={`builtin:${id}`} alt={p.name}/></span>{p.name}</button>; })}{!social.top8.length && <p>Your Top 8 is yours to choose. Feature accepted friends from Friends.</p>}{viewer === 'you' && <button className="ms-top8-manage" onClick={() => go('Friends')}>Arrange my Top 8 →</button>}</div> : <p className="ms-empty">This citizen keeps their friendship list private.</p>;
    case 'interests': return <dl className="ms-interest-table"><dt>General</dt><dd><RetroHtml text={own ? social.interests || 'Add the things you love in Edit Profile.' : npc?.interests || ''} /></dd><dt>Mood</dt><dd>{own ? social.mood : npc?.mood}</dd><dt>Here for</dt><dd>Friends & conversation</dd></dl>;
    case 'photos': return <div className="ms-mini-albums">{social.albums.filter(a => a.author === owner && canSeeRecord(social, a, viewer)).map(a => <button key={a.id} onClick={() => go(`Photos:${a.id}`)}>{a.photos[0] && <SocialImage asset={a.photos[0].asset} alt={a.name}/>}<strong>{a.name}</strong><small>{a.photos.length} photographs</small></button>)}<button onClick={() => go('Photos')}>Open photo albums →</button></div>;
    case 'blogs': return <div><h3 className="ms-blurb-title">About me:</h3><RetroHtml text={own ? social.bio || 'Welcome to my page! Make this space your own in Edit Profile.' : npc?.bio || ''} /><h3 className="ms-blurb-title">My latest blog entries</h3>{social.posts.filter(p => p.author === owner && p.kind === 'blog' && !p.draft && canSee(social, owner, p.audience, viewer)).slice(0, 4).map(p => <button className="ms-journal-link" key={p.id} onClick={() => go(`Blog:${p.id}`)}><strong>{p.title}</strong><small>Cycle {p.cycle} · {p.audience}</small></button>)}{!social.posts.some(p => p.author === owner && p.kind === 'blog' && !p.draft) && <p>A fresh page, waiting for its first entry.</p>}</div>;
    case 'guestbook': return <Comments target={`profile:${owner}`} viewer={viewer}/>;
    case 'decoration': return <div className="ms-decoration"><RetroHtml text={module.text || '✦  ♡  ✧  ♫  ✿'} /></div>;
    case 'widget': return <RetroWidgetModule widget={module.widget} viewCount={social.viewCount} />;
    default: return null;
  }
}
export default function ProfileCanvas({ layout, owner = 'you', editing = false, selected = '', onSelect, onGeometry, viewer = 'you' }: { layout: Layout; owner?: string; editing?: boolean; selected?: string; onSelect?: (id: string) => void; onGeometry?: (id: string, values: Partial<Module>) => void; viewer?: string }) {
  const { act } = useSocial();
  const drag = React.useRef<any>(null);

  useEffect(() => {
    if (!editing && owner === 'you') {
      act({ type: 'record-view' });
    }
  }, [editing, owner]);

  const start = (e: React.PointerEvent, m: Module, resize: boolean) => { if (e.button !== 0) return; e.preventDefault(); e.stopPropagation(); onSelect?.(m.id); e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, module: { ...m }, resize }; };
  const move = (e: React.PointerEvent) => { const d = drag.current; if (!d) return; const x = e.clientX - d.x, y = e.clientY - d.y; onGeometry?.(d.module.id, d.resize ? { w: d.module.w + x, h: d.module.h + y } : { x: d.module.x + x, y: d.module.y + y }); };
  const style = { '--ms-page-bg': layout.background, '--ms-page-surface': layout.surface, '--ms-page-text': layout.color, '--ms-page-accent': layout.accent, '--ms-page-border': `${layout.border}px`, '--ms-bar-text': layout.theme === 'glitter' ? '#32142e' : '#fff', fontFamily: layout.font } as React.CSSProperties;
  const starter = makeLayout(layout.theme);
  const classic = !editing && layout.modules.length === starter.modules.length && layout.modules.every((m, i) => ['kind', 'x', 'y', 'w', 'h', 'hidden'].every(k => m[k] === starter.modules[i][k]));
  const height = Math.max(800, ...layout.modules.filter(m => !m.hidden).map(m => m.y + m.h + 30));
  const renderModule = (m: Module, index: number) => <section key={m.id} className={`ms-module ms-module-${m.kind} ${selected === m.id && editing ? 'is-selected' : ''}`} style={{ left: m.x, top: m.y, width: m.w, height: m.h, zIndex: selected === m.id && editing ? 50 : index + 1 }}>
      <header><strong>{MODULE_NAMES[m.kind] || 'Widget'}</strong>{editing && <button className="ms-drag" aria-label={`Move ${MODULE_NAMES[m.kind] || 'Widget'}`} onPointerDown={e => start(e, m, false)} onPointerMove={move} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onKeyDown={e => { const delta = e.shiftKey ? 20 : 5; const map = { ArrowLeft: { x: m.x - delta }, ArrowRight: { x: m.x + delta }, ArrowUp: { y: m.y - delta }, ArrowDown: { y: m.y + delta } }; if (map[e.key]) { e.preventDefault(); onGeometry?.(m.id, map[e.key]); } }}>✥ Drag</button>}</header>
      <div className="ms-module-body">{editing ? <div className="ms-editor-placeholder" onClick={() => onSelect?.(m.id)}><span>{m.kind === 'decoration' ? m.text || '✦ ♡ ✿' : m.kind === 'widget' ? `Widget: ${m.widget?.widgetKind || 'badges'}` : MODULE_NAMES[m.kind]}</span><small>Drag the handle, resize the corner, or use the controls. Your content stays separate.</small></div> : <ModuleContents module={m} owner={owner} viewer={viewer}/>}</div>
      {editing && <button className="ms-resize" aria-label={`Resize ${MODULE_NAMES[m.kind] || 'Widget'}`} onPointerDown={e => start(e, m, true)} onPointerMove={move} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onKeyDown={e => { const delta = e.shiftKey ? 20 : 5; if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) { e.preventDefault(); onGeometry?.(m.id, e.key.includes('Left') || e.key.includes('Right') ? { w: m.w + (e.key === 'ArrowRight' ? delta : -delta) } : { h: m.h + (e.key === 'ArrowDown' ? delta : -delta) }); } }}>◢</button>}
    </section>;
  const visible = layout.modules.filter(m => !m.hidden);
  return <div className={`ms-canvas-scroll ${classic ? 'ms-classic-flow' : ''} ${editing ? 'is-editing' : ''}`}><div className={`ms-profile-canvas ms-texture-${layout.texture}`} style={{ ...style, ...(classic ? {} : { height }) }}>
    {classic ? <><div className="ms-profile-left">{visible.filter(m => ['about', 'interests', 'photos', 'decoration', 'widget'].includes(m.kind)).map(renderModule)}</div><div className="ms-profile-right"><div className="ms-extended-network">{owner === 'you' ? 'Welcome to your space.' : `${PEOPLE.find(p => p.id === owner)?.name} is in your extended network.`}</div>{['music', 'blogs', 'friends', 'guestbook'].flatMap(kind => visible.filter(m => m.kind === kind)).map(renderModule)}</div></> : visible.map(renderModule)}
  </div>{(editing || !classic) && <small className="ms-canvas-hint">{editing ? '960 px design canvas · scroll sideways to reach every section · Shift + arrow moves 20 px' : 'Every page is its own little world. On narrow windows, scroll to explore the full composition.'}</small>}</div>;
}
