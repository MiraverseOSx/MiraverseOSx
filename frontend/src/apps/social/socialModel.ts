import { sanitizeMailHtml, mailHtmlToText } from '../mail/richText';
import { getProfiles } from '../../game-content/characters/collections/PEOPLE';
import { getCharacterById } from '../../game-content/characters/registry';
import { processNpcReactivity, handleDirectGuestbookSign } from './npcReactivity';

export type Audience = 'public' | 'friends' | 'private' | 'group';
export type WidgetKind = 'badges' | 'marquee' | 'counter' | 'status' | 'quiz';
export const BADGE_IDS = ['versenet-800x600', 'miraverse-valid', 'powered-by-tea', 'notepad-coder', 'aureline-sound', 'dga-clearance'] as const;
export type CustomWidgetData = {
  widgetKind: WidgetKind;
  badges?: string[];
  marqueeText?: string;
  counterStyle?: 'odometer' | 'led' | 'retro-lcd';
  statusMood?: string;
  statusIcon?: string;
  quizTitle?: string;
  quizItems?: { question: string; answer: string }[];
};
export type ModuleKind = 'about' | 'music' | 'friends' | 'photos' | 'blogs' | 'guestbook' | 'interests' | 'decoration' | 'widget';
export type Module = { id: string; kind: ModuleKind; x: number; y: number; w: number; h: number; hidden: boolean; text?: string; widget?: CustomWidgetData };
export type Layout = { theme: string; background: string; surface: string; color: string; accent: string; font: string; texture: string; border: number; modules: Module[] };
export type Post = { id: string; author: string; kind: 'blog' | 'bulletin' | 'memory'; title: string; html: string; audience: Audience; cycle: number; draft: boolean; likes: string[]; media?: string[] };
export type Album = { id: string; author: string; name: string; audience: Audience; groupId?: string; photos: { id: string; asset: string; caption: string; tags: string[]; tagRequests?: Record<string, number> }[] };
export type SocialEvent = { id: string; host: string; title: string; description: string; location: string; cycle: number; created: number; audience: Audience; groupId?: string; canceled: boolean; invited: string[]; rsvp: Record<string, string>; attendance: string[] };
export type SocialWorld = {
  version: 1; designVersion?: number; layout: Layout; draft: Layout; history: { id: string; cycle: number; layout: Layout }[]; templates: { id: string; name: string; layout: Layout }[];
  bio: string; interests: string; mood: string; location: string; discloseLocation: boolean; avatar: string; banner: string; track: string; playlist: string[];
  top8: string[]; friends: string[]; requests: Record<string, string>; requestCycles: Record<string, number>; blocked: string[]; muted: string[]; reports: { id: string; target: string; reason: string }[];
  posts: Post[]; albums: Album[]; comments: { id: string; target: string; author: string; text: string; cycle: number; parent?: string }[];
  groups: { id: string; name: string; description: string; private: boolean; owner: string; members: string[]; pending: string[]; created?: number; requested?: number }[];
  events: SocialEvent[]; notifications: { id: string; text: string; destination: string; read: boolean }[];
  memories: string[]; npcLayouts: Record<string, Layout>; assets: { id: string; name: string; type: string; size: number }[];
  viewCount: number; pinnedCommentIds: string[];
};
export const PEOPLE = getProfiles();
export const THEMES = {
  lavender: { name: 'Classic Lavender', background: '#e6dff3', surface: '#fffaff', color: '#302343', accent: '#73549a', font: 'Georgia, serif', texture: 'stars' },
  glitter: { name: 'Glitter After Dark', background: '#201325', surface: '#361c36', color: '#fff0fa', accent: '#ff8bc7', font: 'Trebuchet MS, sans-serif', texture: 'stars' },
  blue: { name: 'Classic Blue', background: '#dce8f2', surface: '#f7fbff', color: '#21384f', accent: '#38688e', font: 'Verdana, sans-serif', texture: 'grid' },
  rose: { name: 'Daydream Rose', background: '#f5deeb', surface: '#fff8fc', color: '#55334d', accent: '#a84377', font: 'Georgia, serif', texture: 'flowers' },
  pine: { name: 'Garden Journal', background: '#dce5db', surface: '#f8faf1', color: '#293e35', accent: '#406d54', font: 'Georgia, serif', texture: 'none' },
};
export const KINDS: ModuleKind[] = ['about', 'music', 'friends', 'photos', 'blogs', 'guestbook', 'interests', 'decoration', 'widget'];
export const FONT_OPTIONS = ['Georgia, serif', 'Verdana, sans-serif', 'Trebuchet MS, sans-serif', 'Courier New, monospace'];
export const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const limit = (value: any, max = 2000) => typeof value === 'string' ? value.slice(0, max) : '';
const ids = (values: any) => Array.isArray(values) ? [...new Set<string>(values.filter(v => typeof v === 'string' && PEOPLE.some(p => p.id === v)))] : [];
export const audience = (a: any): Audience => ['public', 'friends', 'private', 'group'].includes(a) ? a : 'private';
const bound = (v: any, min: number, max: number, fallback: number) => Number.isFinite(v) ? Math.round(Math.min(max, Math.max(min, v))) : fallback;
const color = (c: any, fallback: string) => /^#[0-9a-f]{6}$/i.test(c) ? c : fallback;
export function makeLayout(theme = 'lavender'): Layout {
  if (!Object.hasOwn(THEMES, theme)) theme = 'lavender';
  const t = THEMES[theme];
  const modules = [
    ['about', 16, 16, 440, 590], ['music', 474, 16, 470, 190], ['interests', 16, 624, 440, 200],
    ['friends', 474, 224, 470, 280], ['photos', 474, 522, 470, 250], ['blogs', 16, 842, 440, 270], ['guestbook', 474, 790, 470, 322],
  ].map(([kind, x, y, w, h], index) => ({ id: `module-${index}`, kind: kind as ModuleKind, x: +x, y: +y, w: +w, h: +h, hidden: false }));
  if (theme === 'blue') { modules[0].h = 520; modules[2].y = 554; modules[2].h = 270; modules[5].w = 440; }
  if (theme === 'glitter') { modules[0].x = 504; modules[1].x = 16; modules[1].w = 470; modules[2].x = 504; modules[3].x = 16; modules[4].x = 16; modules[5].x = 504; modules[6].x = 16; }
  if (theme === 'rose') { modules[4].y = 224; modules[4].h = 280; modules[3].y = 522; modules[3].h = 250; }
  return { ...t, theme, border: 1, modules };
}
export function normalizeLayout(raw: any): Layout {
  const base = makeLayout(raw?.theme);
  return {
    theme: Object.hasOwn(THEMES, raw?.theme) ? raw.theme : 'lavender',
    background: color(raw?.background, base.background),
    surface: color(raw?.surface, base.surface),
    color: color(raw?.color, base.color),
    accent: color(raw?.accent, base.accent),
    font: FONT_OPTIONS.includes(raw?.font) ? raw.font : base.font,
    texture: ['stars', 'grid', 'flowers', 'none'].includes(raw?.texture) ? raw.texture : base.texture,
    border: bound(raw?.border, 0, 6, 1),
    modules: (Array.isArray(raw?.modules) ? raw.modules : base.modules).slice(0, 30).filter(m => m && KINDS.includes(m.kind)).map((m, i) => {
      const w = bound(m.w, 160, 936, 290);
      let widget: CustomWidgetData | undefined = undefined;
      if (m.kind === 'widget' || m.widget) {
        const wData = m.widget || {};
        const wk: WidgetKind = ['badges', 'marquee', 'counter', 'status', 'quiz'].includes(wData.widgetKind) ? wData.widgetKind : 'badges';
        widget = {
          widgetKind: wk,
          badges: Array.isArray(wData.badges) ? wData.badges.filter((b: any) => typeof b === 'string' && (BADGE_IDS as readonly string[]).includes(b)).slice(0, 8) : ['versenet-800x600', 'miraverse-valid', 'powered-by-tea'],
          marqueeText: limit(wData.marqueeText || 'Welcome to my corner of the Versenet! ✦ Leave a note in the guestbook! ♡', 300),
          counterStyle: ['odometer', 'led', 'retro-lcd'].includes(wData.counterStyle) ? wData.counterStyle : 'odometer',
          statusMood: limit(wData.statusMood || 'Dreaming & Building', 100),
          statusIcon: limit(wData.statusIcon || '✦', 10),
          quizTitle: limit(wData.quizTitle || "Who I'd Like to Meet", 100),
          quizItems: Array.isArray(wData.quizItems) ? wData.quizItems.slice(0, 5).map((item: any) => ({ question: limit(item?.question, 100), answer: limit(item?.answer, 200) })) : [
            { question: 'Favorite time to create?', answer: 'Late night when the city is quiet' },
            { question: 'Current obsession?', answer: 'Ambient synth loops and margin doodles' }
          ]
        };
      }
      return {
        id: `module-${i}`,
        kind: m.kind,
        x: bound(m.x, 0, 960 - w, 24),
        y: bound(m.y, 0, 2600, i * 150),
        w,
        h: bound(m.h, 110, 900, 210),
        hidden: m.hidden === true,
        text: limit(m.text, 300),
        ...(widget ? { widget } : {})
      };
    })
  };
}
export function templateLayout(raw: any): Layout {
  const layout = normalizeLayout(raw);
  layout.modules = layout.modules.map(m => ({ ...m, text: '' }));
  return layout;
}
function legacyBulletinAuthor(author: unknown): string | undefined {
  if (typeof author !== 'string') return undefined;
  const name = author.replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
  const matches = PEOPLE.filter(person => {
    const identity = getCharacterById(person.characterId);
    return [person.id, person.name, person.phone, ...(identity?.aliases || [])].some(alias => alias.toLowerCase() === name);
  });
  return matches.length === 1 ? matches[0].id : undefined;
}
const legacyBulletinHtml = (content: string) => sanitizeMailHtml(`<p>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`);
export function initialSocial(legacy: any = {}): SocialWorld {
  const friends = ids(legacy.acceptedFriends);
  return { version: 1, designVersion: 2, layout: makeLayout(), draft: makeLayout(), history: [], templates: [], bio: '', interests: '', mood: 'Making a little space of my own', location: '', discloseLocation: false, avatar: '', banner: '', track: 'builtin:stillwater', playlist: ['builtin:stillwater', 'builtin:starlight'], top8: [], friends, requests: { jeremie: friends.includes('jeremie') ? 'accepted' : 'incoming' }, requestCycles: {}, blocked: [], muted: [], reports: [],
    posts: [
      ...PEOPLE.slice(0, 3).map((p, i) => ({ id: `hello:${p.id}`, author: p.id, kind: 'blog' as const, title: ['A place for unfinished ideas', 'Keeping a little color', 'A page that feels like me'][i], html: `<p>${p.bio}</p>`, audience: 'public' as const, cycle: 0, draft: false, likes: [] })),
      ...(Array.isArray(legacy.bulletinPosts) ? legacy.bulletinPosts : []).filter(p => p && typeof p.content === 'string').map(p => ({ id: `legacy:${p.id}`, author: legacyBulletinAuthor(p.author) || 'you', kind: 'bulletin' as const, title: 'Earlier bulletin', html: legacyBulletinHtml(p.content), audience: 'public' as const, cycle: 0, draft: false, likes: [] })),
    ], albums: PEOPLE.slice(0, 3).map(p => ({ id: `album:${p.id}`, author: p.id, name: p.id === 'jeremie' ? 'Lines and structures' : p.id === 'aelita' ? 'Colors I keep' : 'After dark', audience: 'public', photos: [{ id: `photo:${p.id}`, asset: `builtin:${p.id}`, caption: 'An illustrated mood board for this personal page.', tags: [] }] })), comments: [],
    groups: [{ id: 'photo-club', name: 'Aureline Photo Circle', description: 'A local space for photographs and small observations. Recreational membership grants no institutional access.', private: false, owner: 'aelita', members: ['aelita', 'sissi'], pending: [] }, { id: 'quiet-pages', name: 'Quiet Pages', description: 'An invitation-only journal circle. Get acquainted with Rowan through a thoughtful conversation before requesting entry.', private: true, owner: 'rowan', members: ['rowan'], pending: [] }],
    events: [], notifications: [{ id: 'welcome', text: 'Your personal corner is ready. Make it yours in Profile Studio.', destination: 'Customize', read: false }], memories: [], npcLayouts: Object.fromEntries(PEOPLE.map(p => [p.id, makeLayout(p.theme)])), assets: [],
    viewCount: 42, pinnedCommentIds: [] };
}
export function restoreSocial(raw: any, legacy: any = {}): SocialWorld {
  const base = initialSocial(legacy);
  if (!raw || raw.version !== 1) return base;
  // Reconstruct only supported fields. No arbitrary style, HTML, or private registry data.
  const s = { ...base, ...raw, version: 1, layout: normalizeLayout(raw.layout), draft: normalizeLayout(raw.draft), friends: ids(raw.friends), blocked: ids(raw.blocked), muted: ids(raw.muted), top8: ids(raw.top8).filter(id => ids(raw.friends).includes(id) && !ids(raw.blocked).includes(id)).slice(0, 8), bio: limit(raw.bio), interests: limit(raw.interests), mood: limit(raw.mood, 120), location: limit(raw.location, 100), discloseLocation: raw.discloseLocation === true } as SocialWorld;
  for (const key of ['posts', 'albums', 'comments', 'groups', 'events', 'notifications', 'memories', 'assets', 'templates', 'history', 'reports'] as const) if (!Array.isArray(s[key])) (s as any)[key] = base[key];
  s.posts = s.posts.filter(p => p && typeof p.id === 'string' && (p.author === 'you' || PEOPLE.some(n => n.id === p.author))).map(p => ({ ...p, title: limit(p.title, 180), html: sanitizeMailHtml(p.html), audience: audience(p.audience), likes: Array.isArray(p.likes) ? p.likes : [] }));
  // Repair only unchanged imported posts whose recorded NPC author was lost
  // during the name migration. Player-authored and edited posts stay intact.
  const earlierPosts = Array.isArray(legacy.bulletinPosts) ? legacy.bulletinPosts : [];
  s.posts = s.posts.map(post => {
    if (post.author !== 'you' || post.kind !== 'bulletin' || !post.id.startsWith('legacy:')) return post;
    const original = earlierPosts.find(item => item && post.id === `legacy:${item.id}` && typeof item.content === 'string' && post.html === legacyBulletinHtml(item.content));
    const author = legacyBulletinAuthor(original?.author);
    return author ? { ...post, author } : post;
  });
  s.history = s.history.filter(h => h && typeof h.id === 'string').slice(-20).map(h => ({ id: limit(h.id, 100), cycle: +h.cycle || 0, layout: normalizeLayout(h.layout) }));
  s.templates = s.templates.filter(t => t && typeof t.id === 'string').slice(-20).map(t => ({ id: limit(t.id, 100), name: limit(t.name, 80), layout: templateLayout(t.layout) }));
  const known = (id: unknown) => id === 'you' || PEOPLE.some(p => p.id === id);
  const participants = (list: any) => Array.isArray(list) ? [...new Set<string>(list.filter(known))] : [];
  s.posts = s.posts.filter(p => ['blog', 'bulletin', 'memory'].includes(p.kind)).map(p => ({ ...p, draft: p.draft === true, cycle: bound(p.cycle, 0, 10000000, 0), likes: participants(p.likes) }));
  s.albums = s.albums.filter(a => a && typeof a.id === 'string' && known(a.author)).map(a => ({ id: a.id, author: a.author, name: limit(a.name, 100), audience: audience(a.audience), ...(typeof a.groupId === 'string' ? { groupId: a.groupId } : {}), photos: (Array.isArray(a.photos) ? a.photos : []).filter(p => p && typeof p.id === 'string' && typeof p.asset === 'string').map(p => ({ id: p.id, asset: p.asset, caption: limit(p.caption, 500), tags: ids(p.tags), tagRequests: p.tagRequests && typeof p.tagRequests === 'object' ? Object.fromEntries(Object.entries(p.tagRequests).filter(([id,v]) => PEOPLE.some(n => n.id === id) && Number.isFinite(v))) as Record<string, number> : {} })) }));
  s.comments = s.comments.filter(c => c && typeof c.id === 'string' && typeof c.target === 'string' && known(c.author)).map(c => ({ ...c, text: limit(c.text), cycle: bound(c.cycle, 0, 10000000, 0) }));
  s.groups = s.groups.filter(g => g && typeof g.id === 'string' && known(g.owner)).map(g => ({ ...g, name: limit(g.name, 100), description: limit(g.description, 1000), private: g.private === true, members: participants(g.members), pending: participants(g.pending) }));
  s.events = s.events.filter(e => e && typeof e.id === 'string' && known(e.host) && ['Home gathering', 'Photo Circle online room'].includes(e.location)).map(e => ({ ...e, title: limit(e.title, 100), description: limit(e.description), audience: audience(e.audience), created: bound(e.created, 0, 10000000, 0), cycle: bound(e.cycle, 0, 10000000, 0), canceled: e.canceled === true, invited: ids(e.invited), attendance: participants(e.attendance), rsvp: e.rsvp && typeof e.rsvp === 'object' ? Object.fromEntries(Object.entries(e.rsvp).filter(([id, v]) => known(id) && ['going', 'declined', 'maybe'].includes(v as string))) : {} }));
  s.notifications = s.notifications.filter(n => n && typeof n.id === 'string' && typeof n.destination === 'string').map(n => ({ ...n, text: limit(n.text, 500), read: n.read === true }));
  s.memories = s.memories.filter(m => typeof m === 'string');
  s.assets = s.assets.filter(a => a && typeof a.id === 'string' && /^social:[a-z0-9-]+$/i.test(a.id) && /^image\/(png|jpeg|webp|gif)$|^audio\/(mpeg|wav|ogg|mp4|webm|x-wav)$/.test(a.type) && Number.isInteger(a.size) && a.size > 0 && a.size <= 8 * 1024 * 1024).map(a => ({ ...a, name: limit(a.name, 150) }));
  s.avatar = limit(raw.avatar, 100); s.banner = limit(raw.banner, 100);
  s.track = typeof raw.track === 'string' ? raw.track : base.track;
  s.playlist = Array.isArray(raw.playlist) ? [...new Set<string>(raw.playlist.filter(id => typeof id === 'string' && (['builtin:stillwater', 'builtin:starlight'].includes(id) || s.assets.some(a => a.id === id && a.type.startsWith('audio/')))))] : base.playlist;
  s.posts = s.posts.map(p => ({ ...p, media: Array.isArray(p.media) ? p.media.filter(id => s.assets.some(a => a.id === id && a.type.startsWith('image/'))).slice(0, 8) : [] }));
  s.reports = s.reports.filter(r => r && typeof r.id === 'string').map(r => ({ id: r.id, target: limit(r.target, 100), reason: limit(r.reason, 500) }));
  s.npcLayouts = Object.fromEntries(PEOPLE.map(p => [p.id, normalizeLayout(raw.npcLayouts?.[p.id] || base.npcLayouts[p.id])]));
  s.viewCount = Math.max(0, Number.isFinite(raw.viewCount) ? raw.viewCount : 42);
  s.pinnedCommentIds = Array.isArray(raw.pinnedCommentIds) ? raw.pinnedCommentIds.filter(id => typeof id === 'string') : [];
  if (raw.designVersion !== 2) {
    // Update only the untouched early starter geometry; preserve player designs.
    const starter = (l: any) => l?.theme === 'lavender' && l?.modules?.length === 7 && JSON.stringify(l.modules.map((m: any) => [m.kind, m.x, m.y, m.w, m.h])) === JSON.stringify([['about',24,24,290,250],['music',24,292,290,210],['interests',24,520,290,170],['friends',336,24,600,250],['photos',336,292,600,260],['blogs',336,570,600,230],['guestbook',24,820,912,290]]);
    if (!s.history.length && starter(raw.layout)) s.layout = makeLayout();
    if (!s.history.length && starter(raw.draft)) s.draft = makeLayout();
    s.npcLayouts = Object.fromEntries(PEOPLE.map(p => [p.id, makeLayout(p.theme)])); s.designVersion = 2;
  }
  s.requestCycles = raw.requestCycles && typeof raw.requestCycles === 'object' ? Object.fromEntries(Object.entries(raw.requestCycles).filter(([id, value]) => PEOPLE.some(p => p.id === id) && Number.isFinite(value))) as Record<string, number> : {};
  s.requests = (raw.requests && typeof raw.requests === 'object' ? Object.fromEntries(Object.entries(raw.requests).filter(([id, v]) => PEOPLE.some(n => n.id === id) && ['incoming', 'pending', 'accepted', 'declined'].includes(v as string))) : base.requests) as Record<string, string>;
  return s;
}
export function canSee(s: SocialWorld, owner: string, visibility: Audience, viewer = 'you') {
  if (owner === viewer) return true;
  if (s.blocked.includes(owner)) return false;
  return visibility === 'public' || (visibility === 'friends' && viewer === 'you' && s.friends.includes(owner));
}
export function canSeeRecord(s: SocialWorld, record: { author?: string; host?: string; audience: Audience; groupId?: string }, viewer = 'you') {
  const owner = record.author || record.host || '';
  if (!record.groupId) return record.audience !== 'group' && canSee(s, owner, record.audience, viewer);
  const g = s.groups.find(g => g.id === record.groupId);
  if (!g || s.blocked.includes(owner)) return false;
  const member = viewer === 'you' && g.members.includes('you');
  if (g.private && !member) return false;
  return record.audience === 'group' ? member : canSee(s, owner, record.audience, viewer);
}
export function canComment(s: SocialWorld, target: string) {
  if (target.startsWith('profile:')) return target === 'profile:you' || PEOPLE.some(p => `profile:${p.id}` === target && s.friends.includes(p.id) && !s.blocked.includes(p.id));
  const post = s.posts.find(p => p.id === target);
  if (post) return !post.draft && canSee(s, post.author, post.audience);
  const album = s.albums.find(a => a.photos?.some(p => p.id === target));
  if (album) return canSeeRecord(s, album);
  const group = s.groups.find(g => g.id === target);
  return !!group?.members.includes('you');
}
export type SocialAction = { type: string; [key: string]: any };
export function changeSocial(input: SocialWorld, action: SocialAction, cycle: number, id: string): { state: SocialWorld; ok: boolean; message: string } {
  const s = clone(input);
  const fail = (message: string) => ({ state: input, ok: false, message });
  const note = (key: string, text: string, destination: string) => { if (!s.notifications.some(n => n.id === key)) s.notifications.unshift({ id: key, text, destination, read: false }); };
  const person = PEOPLE.find(p => p.id === action.person);
  switch (action.type) {
    case 'draft-layout': s.draft = normalizeLayout(action.layout); break;
    case 'publish-layout':
      if (JSON.stringify(s.layout) !== JSON.stringify(s.draft)) { s.history.push({ id, cycle, layout: clone(s.layout) }); s.history = s.history.slice(-20); s.layout = clone(s.draft); }
      break;
    case 'restore-layout': { const h = s.history.find(h => h.id === action.id); if (!h) return fail('That layout version is unavailable.'); s.draft = clone(h.layout); break; }
    case 'cancel-layout': s.draft = clone(s.layout); break;
    case 'template':
      if (s.templates.length >= 20) return fail('Remove a saved template before adding another.');
      s.templates.push({ id, name: limit(action.name, 80) || 'My layout', layout: templateLayout(action.layout || s.draft) }); break;
    case 'delete-template': s.templates = s.templates.filter(t => t.id !== action.id); break;
    case 'profile':
      for (const k of ['bio', 'interests', 'mood', 'location']) if (typeof action[k] === 'string') s[k] = limit(action[k], k === 'bio' ? 2000 : 300);
      if (typeof action.discloseLocation === 'boolean') s.discloseLocation = action.discloseLocation;
      break;
    case 'friend': {
      if (!person || s.blocked.includes(person.id)) return fail('This connection is unavailable.');
      if (s.friends.includes(person.id)) return fail('You are already connected.');
      if (action.decision === 'decline') { s.requests[person.id] = 'declined'; break; }
      if (action.decision === 'cancel') { delete s.requests[person.id]; break; }
      if (s.requests[person.id] === 'incoming') { s.friends.push(person.id); s.requests[person.id] = 'accepted'; note(`friend:${person.id}`, `${person.name} is now a friend.`, 'Friends'); }
      else if (s.requests[person.id] !== 'pending') { s.requests[person.id] = 'pending'; s.requestCycles[person.id] = cycle; note(`request:${person.id}`, `Your request to ${person.name} is pending. Continue your day and check back.`, 'Friends'); }
      break;
    }
    case 'unfriend': if (person) { s.friends = s.friends.filter(p => p !== person.id); s.top8 = s.top8.filter(p => p !== person.id); delete s.requests[person.id]; } break;
    case 'top8': { const selected = ids(action.ids); if (selected.length > 8 || selected.some(p => !s.friends.includes(p) || s.blocked.includes(p))) return fail('Choose up to eight accepted friends.'); s.top8 = selected; break; }
    case 'block': if (!person) return fail('Unknown person.'); if (!s.blocked.includes(person.id)) { s.blocked.push(person.id); s.friends = s.friends.filter(p => p !== person.id); s.top8 = s.top8.filter(p => p !== person.id); delete s.requests[person.id]; } else s.blocked = s.blocked.filter(p => p !== person.id); break;
    case 'mute': if (!person) return fail('Unknown person.'); s.muted = s.muted.includes(person.id) ? s.muted.filter(p => p !== person.id) : [...s.muted, person.id]; break;
    case 'report': if (!limit(action.reason, 500).trim()) return fail('Describe the concern.'); s.reports.push({ id, target: limit(action.target, 100), reason: limit(action.reason, 500) }); return { state: s, ok: true, message: 'Report saved on this device. No human moderation service is connected.' };
    case 'post': { if (action.audience === 'group') return fail('Choose a personal audience for this post.'); const html = sanitizeMailHtml(action.html); if (mailHtmlToText(html).length < 3) return fail('Write something before saving.'); const previous = s.posts.find(p => p.id === action.id && p.author === 'you'); const post: Post = { id: previous?.id || id, author: 'you', kind: action.kind === 'blog' ? 'blog' : 'bulletin', title: limit(action.title, 180) || 'Untitled', html, audience: audience(action.audience), cycle, draft: action.draft === true, likes: previous?.likes || [], media: Array.isArray(action.media) ? action.media.filter(id => s.assets.some(a => a.id === id && a.type.startsWith('image/'))).slice(0, 8) : [] }; s.posts = [post, ...s.posts.filter(p => p.id !== post.id)]; break; }
    case 'delete-post': s.posts = s.posts.filter(p => p.id !== action.id || p.author !== 'you'); break;
    case 'record-view': s.viewCount = (s.viewCount || 0) + 1; break;
    case 'pin-comment': {
      const cid = String(action.id);
      s.pinnedCommentIds = Array.isArray(s.pinnedCommentIds) ? s.pinnedCommentIds : [];
      if (s.pinnedCommentIds.includes(cid)) s.pinnedCommentIds = s.pinnedCommentIds.filter(x => x !== cid);
      else s.pinnedCommentIds = [cid, ...s.pinnedCommentIds.slice(0, 4)];
      break;
    }
    case 'like': { const p = s.posts.find(p => p.id === action.id && !p.draft && canSee(s, p.author, p.audience)); if (!p) return fail('This post is unavailable.'); p.likes = p.likes.includes('you') ? p.likes.filter(x => x !== 'you') : [...p.likes, 'you']; break; }
    case 'comment': {
      if (!canComment(s, action.target) || !limit(action.text).trim()) return fail('This conversation is unavailable or empty.');
      if (action.parent && !s.comments.some(c => c.id === action.parent && c.target === action.target)) return fail('Reply target is unavailable.');
      s.comments.push({ id, author: 'you', target: action.target, text: limit(action.text), cycle, parent: action.parent });
      if (action.target.startsWith('profile:') && action.target !== 'profile:you') {
        const targetNpcId = action.target.slice(8);
        if (PEOPLE.some(p => p.id === targetNpcId)) {
          handleDirectGuestbookSign(s, targetNpcId, action.text, cycle);
        }
      }
      break;
    }
    case 'delete-comment': s.comments = s.comments.filter(c => c.id !== action.id || (c.author !== 'you' && c.target !== 'profile:you')); break;
    case 'album': if (action.audience === 'group') return fail('Create group albums from the community room.'); if (!limit(action.name, 100).trim()) return fail('Name the album.'); s.albums.push({ id, author: 'you', name: limit(action.name, 100), audience: audience(action.audience), photos: [] }); break;
    case 'album-audience': { const a = s.albums.find(a => a.id === action.id && a.author === 'you'); if (!a || (a.groupId && !s.groups.some(g => g.id === a.groupId && g.members.includes('you')))) return fail('Album unavailable.'); if (action.audience === 'group' && !a.groupId) return fail('This is a personal album.'); a.audience = audience(action.audience); break; }
    case 'photo': { const a = s.albums.find(a => a.id === action.album && a.author === 'you'); if (!a || (a.groupId && !s.groups.some(g => g.id === a.groupId && g.members.includes('you'))) || !s.assets.some(m => m.id === action.asset && m.type.startsWith('image/'))) return fail('Choose an album and an uploaded image.'); a.photos.push({ id, asset: action.asset, caption: limit(action.caption, 500), tags: [] }); break; }
    case 'photo-tag': {
      const a = s.albums.find(a => a.author === 'you' && a.photos.some(p => p.id === action.id));
      const p = a?.photos.find(p => p.id === action.id);
      if (!p || !person || !s.friends.includes(person.id) || s.blocked.includes(person.id)) return fail('Choose an accepted friend for a tag request.');
      if (!p.tags.includes(person.id)) { p.tagRequests ||= {}; p.tagRequests[person.id] ??= cycle; } break;
    }
    case 'photo-untag': for (const a of s.albums.filter(a => a.author === 'you')) for (const p of a.photos.filter(p => p.id === action.id)) { p.tags = p.tags.filter(id => id !== action.person); if (p.tagRequests) delete p.tagRequests[action.person]; } break;
    case 'photo-caption': { const a = s.albums.find(a => a.author === 'you' && a.photos.some(p => p.id === action.id)); const p = a?.photos.find(p => p.id === action.id); if (p) p.caption = limit(action.caption, 500); break; }
    case 'photo-move': { const a = s.albums.find(a => a.author === 'you' && a.id === action.album); if (!a) return fail('Album unavailable.'); const i = a.photos.findIndex(p => p.id === action.id), j = i + (action.direction === 'up' ? -1 : 1); if (i >= 0 && j >= 0 && j < a.photos.length) [a.photos[i], a.photos[j]] = [a.photos[j], a.photos[i]]; break; }
    case 'delete-photo': for (const a of s.albums.filter(a => a.author === 'you')) a.photos = a.photos.filter(p => p.id !== action.id); break;
    case 'asset': if (!action.asset || typeof action.asset.id !== 'string' || !/^social:[a-z0-9-]+$/i.test(action.asset.id) || s.assets.some(a => a.id === action.asset.id) || !Number.isInteger(action.asset.size) || action.asset.size <= 0 || !/^image\/(png|jpeg|webp|gif)$|^audio\/(mpeg|wav|ogg|mp4|webm|x-wav)$/.test(action.asset.type) || action.asset.size > 8 * 1024 * 1024 || s.assets.reduce((n, a) => n + a.size, 0) + action.asset.size > 32 * 1024 * 1024) return fail('Unsupported media or the 32 MB collection limit was reached.'); s.assets.push({ id: limit(action.asset.id, 100), name: limit(action.asset.name, 150), type: action.asset.type, size: action.asset.size }); break;
    case 'playlist': {
      const valid = (ref: string) => ['builtin:stillwater', 'builtin:starlight'].includes(ref) || s.assets.some(a => a.id === ref && a.type.startsWith('audio/'));
      if (!Array.isArray(action.ids) || action.ids.some(id => typeof id !== 'string' || !valid(id))) return fail('Choose tracks from your music shelf.');
      s.playlist = [...new Set<string>(action.ids)]; break;
    }
    case 'media-choice': { const valid = (ref: string, type: string) => s.assets.some(a => a.id === ref && a.type.startsWith(type)); if (action.slot === 'track' && (valid(action.id, 'audio/') || ['builtin:stillwater', 'builtin:starlight'].includes(action.id))) { s.track = action.id; if (!s.playlist.includes(action.id)) s.playlist.push(action.id); } else if (['avatar', 'banner'].includes(action.slot) && (action.id === '' || valid(action.id, 'image/'))) s[action.slot] = action.id; else return fail('Media is unavailable.'); break; }
    case 'group-create': if (!limit(action.name, 100).trim()) return fail('Name the group.'); s.groups.push({ id, name: limit(action.name, 100), description: limit(action.description, 1000), private: action.private === true, owner: 'you', members: ['you'], pending: [], created: cycle }); break;
    case 'group-album': { const g = s.groups.find(g => g.id === action.id && g.members.includes('you')); if (!g) return fail('Join the group before creating a shared album.'); s.albums.push({ id, author: 'you', name: limit(action.name, 100) || `${g.name} shared album`, audience: 'group', groupId: g.id, photos: [] }); break; }
    case 'group-join': { const g = s.groups.find(g => g.id === action.id); if (!g) return fail('Group unavailable.'); if (!g.members.includes('you') && !g.pending.includes('you')) { (g.private ? g.pending : g.members).push('you'); g.requested = cycle; } break; }
    case 'group-leave': { const g = s.groups.find(g => g.id === action.id && g.owner !== 'you'); if (g) { g.members = g.members.filter(p => p !== 'you'); g.pending = g.pending.filter(p => p !== 'you'); } break; }
    case 'group-approve': { const g = s.groups.find(g => g.id === action.id && g.owner === 'you'); if (!g || !g.pending.includes(action.person)) return fail('No pending request.'); g.pending = g.pending.filter(p => p !== action.person); if (action.accept) g.members.push(action.person); else s.memories.push(`group-declined:${g.id}:${action.person}`); break; }
    case 'event': if (action.groupId && !s.groups.some(g => g.id === action.groupId && g.members.includes('you'))) return fail('Group membership is required.'); if (!action.groupId && action.audience === 'group') return fail('Choose a group for this audience.'); if (!limit(action.title, 100).trim() || !['Home gathering', 'Photo Circle online room'].includes(action.location) || !Number.isInteger(action.cycle) || action.cycle < cycle) return fail('Choose a title, a supported location, and a current or future cycle.'); s.events.push({ id, host: 'you', title: limit(action.title, 100), description: limit(action.description), location: action.location, cycle: action.cycle, created: cycle, audience: action.groupId ? 'group' : audience(action.audience), ...(action.groupId ? { groupId: action.groupId } : {}), canceled: false, invited: ids(action.invited).filter(p => s.friends.includes(p) && !s.blocked.includes(p) && (!action.groupId || s.groups.some(g => g.id === action.groupId && g.members.includes(p)))), rsvp: { you: 'going' }, attendance: [] }); break;
    case 'cancel-event': { const e = s.events.find(e => e.id === action.id && e.host === 'you'); if (e && !e.attendance.length) e.canceled = true; break; }
    case 'rsvp': { const e = s.events.find(e => e.id === action.id); if (!e || e.canceled || !canSeeRecord(s, e)) return fail('Event unavailable.'); e.rsvp.you = ['going', 'maybe', 'declined'].includes(action.value) ? action.value : 'maybe'; break; }
    case 'attend': { const e = s.events.find(e => e.id === action.id); if (!e || e.canceled || e.cycle > cycle || e.rsvp.you !== 'going' || !canSeeRecord(s, e)) return fail('RSVP Going and return when this event is available.'); if (e.attendance.includes('you')) return fail('This gathering is already in your memories.'); e.attendance = ['you', ...e.invited.filter(p => e.rsvp[p] === 'going' && !s.blocked.includes(p) && (!e.groupId || s.groups.some(g => g.id === e.groupId && g.members.includes(p))))]; s.memories.push(`event:${e.id}`); const memory: Post = { id: `memory:${e.id}`, author: 'you', kind: 'memory', title: e.title, html: `<p>${e.attendance.length > 1 ? 'Shared a conversation and a quiet moment with friends.' : 'Made time for a small gathering and a personal reflection.'}</p>`, audience: 'private', cycle, draft: false, likes: [] }; s.posts.push(memory); s.albums.push({ id: `event-album:${e.id}`, author: 'you', name: e.title, audience: 'private', photos: [] }); for (const p of e.attendance.filter(p => p !== 'you')) { s.npcLayouts[p] = { ...s.npcLayouts[p], texture: 'stars' }; note(`event:${e.id}:${p}`, `${PEOPLE.find(n => n.id === p)?.name} remembers your gathering. A private memory and album are ready.`, 'Events'); } break; }
    case 'conversation': if (!person || s.blocked.includes(person.id) || !s.friends.includes(person.id) || limit(action.text).trim().length < 12) return fail('Connect first and share a thoughtful reply of at least 12 characters.'); if (s.memories.includes(`conversation:${person.id}`)) return fail('You have already shared this conversation. Continue in Messages.'); s.memories.push(`conversation:${person.id}`); s.comments.push({ id, author: person.id, target: 'profile:you', text: person.response, cycle }); note(`conversation:${person.id}`, `${person.name} left a guestbook reply after your conversation.`, 'My Profile'); break;
    case 'read-notification': { const n = s.notifications.find(n => n.id === action.id); if (n) n.read = true; break; }
    case 'tick': {
      for (const g of s.groups.filter(g => g.owner === 'rowan' && g.pending.includes('you') && cycle > (g.requested ?? cycle))) {
        if (s.friends.includes('rowan') && !s.blocked.includes('rowan') && s.memories.includes('conversation:rowan')) { g.pending = g.pending.filter(p => p !== 'you'); g.members.push('you'); note(`group-approved:${g.id}`, 'Rowan welcomed you into Quiet Pages.', 'Groups'); }
        else note(`group-introduction:${g.id}`, 'Rowan would like to get acquainted first. Share a thoughtful conversation through Friends before joining Quiet Pages.', 'Groups');
      }

      for (const a of s.albums.filter(a => a.author === 'you')) for (const p of a.photos) for (const [person, requested] of Object.entries(p.tagRequests || {})) {
        if (cycle <= requested) continue;
        if (s.friends.includes(person) && !s.blocked.includes(person) && person !== 'riven' && !p.tags.includes(person)) { p.tags.push(person); note(`tag:${p.id}:${person}`, `${PEOPLE.find(n => n.id === person)?.name} approved your photo tag.`, `Photos:${a.id}`); }
        delete p.tagRequests![person];
      }

      for (const g of s.groups.filter(g => g.owner === 'you' && cycle > (g.created ?? cycle))) {
        const p = s.friends.find(p => !s.blocked.includes(p));
        if (p && !g.members.includes(p) && !g.pending.includes(p) && !s.memories.includes(`group-declined:${g.id}:${p}`)) { (g.private ? g.pending : g.members).push(p); note(`group:${g.id}:${p}`, `${PEOPLE.find(n => n.id === p)?.name} ${g.private ? 'requested to join' : 'joined'} ${g.name}.`, 'Groups'); }
      }

      for (const [key, state] of Object.entries(s.requests)) if (state === 'pending' && cycle > (s.requestCycles[key] ?? cycle) && !s.blocked.includes(key)) { s.requests[key] = 'incoming'; note(`reply-request:${key}`, `${PEOPLE.find(p => p.id === key)?.name} is open to connecting. Accept their returned request in Friends.`, 'Friends'); }
      for (const e of s.events.filter(e => !e.canceled && cycle > e.created)) for (const p of e.invited) if (!e.rsvp[p] && !s.blocked.includes(p) && (!e.groupId || s.groups.some(g => g.id === e.groupId && g.members.includes(p)))) { e.rsvp[p] = p === 'riven' ? 'declined' : 'going'; note(`rsvp:${e.id}:${p}`, `${PEOPLE.find(n => n.id === p)?.name} ${e.rsvp[p] === 'going' ? 'accepted' : 'declined'} your invitation.`, 'Events'); }
      processNpcReactivity(s, cycle);
      break;
    }
    default: return fail('Unsupported social action.');
  }
  return { state: s, ok: true, message: 'Saved.' };
}
