import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error; return next(`${specifier}.ts`, context); } } });
const { initialSocial, changeSocial, restoreSocial, normalizeLayout, templateLayout, canSee, canSeeRecord, canComment, makeLayout } = await import('../src/apps/social/socialModel.ts');
let sequence = 0;
const change = (s, a, cycle = 28) => changeSocial(s, a, cycle, `test-${++sequence}`);

test('renamed NPC aliases retain authorship and repair only unchanged imported posts', () => {
  const legacy = { bulletinPosts: [
    { id: 1, author: 'Elisabeth Delmas (Sissi)', content: 'Earlier gathering plans.' },
    { id: 2, author: 'Aelita Schaeffer', content: 'A memory of music.' },
  ] };
  const social = initialSocial(legacy);
  assert.equal(social.posts.find(post => post.id === 'legacy:1').author, 'sissi');
  assert.equal(social.posts.find(post => post.id === 'legacy:2').author, 'aelita');
  social.posts.find(post => post.id === 'legacy:1').author = 'you';
  const edited = social.posts.find(post => post.id === 'legacy:2'); edited.author = 'you'; edited.html = '<p>My own revised text.</p>';
  social.posts.push({ id: 'player-post', author: 'you', kind: 'bulletin', title: 'My words', html: '<p>Earlier gathering plans.</p>', audience: 'public', cycle: 28, draft: false, likes: [] });
  const restored = restoreSocial(social, legacy);
  assert.equal(restored.posts.find(post => post.id === 'legacy:1').author, 'sissi');
  assert.equal(restored.posts.find(post => post.id === 'legacy:2').author, 'you');
  assert.equal(restored.posts.find(post => post.id === 'player-post').author, 'you');
});
function accept(s, person = 'jeremie') { if (person !== 'jeremie') { s = change(s, { type: 'friend', person }).state; s = change(s, { type: 'tick' }, 29).state; } return change(s, { type: 'friend', person }).state; }

test('legacy profiles migrate without inventing featured friends, losing posts, or importing world logs', () => {
  const legacy = { handle: 'Me', acceptedFriends: ['jeremie', 'unknown'], bulletinPosts: [{ id: 8, content: 'Earlier writing', author: 'Me' }], worldEventLog: [{ title: 'PRIVATE CASE SECRET' }] };
  const before = structuredClone(legacy), s = initialSocial(legacy);
  assert.deepEqual(s.friends, ['jeremie']); assert.deepEqual(s.top8, []);
  assert.ok(s.posts.some(p => p.id === 'legacy:8' && p.html.includes('Earlier writing')));
  assert.ok(!JSON.stringify(s).includes('PRIVATE CASE SECRET'));
  assert.deepEqual(legacy, before);
});

test('layout normalization clamps freeform geometry and excludes executable styles and template content', () => {
  const l = normalizeLayout({ theme: 'glitter', background: 'url(javascript:alert(1))', font: 'evil', modules: [{ kind: 'about', x: -20, y: Infinity, w: 2000, h: 1 }, { kind: 'decoration', x: 100, y: 100, w: 200, h: 130, text: 'my private address' }] });
  assert.equal(l.modules[0].x, 0); assert.equal(l.modules[0].w, 936); assert.equal(l.modules[0].h, 110);
  assert.equal(l.background, '#201325'); assert.equal(l.modules[0].id, 'module-0');
  assert.equal(templateLayout(l).modules[1].text, '');
  assert.notDeepEqual(makeLayout('blue'), makeLayout('rose'));
});

test('publishing and restoring layout versions never rolls back profile content or privacy', () => {
  let s = initialSocial(); s = change(s, { type: 'draft-layout', layout: makeLayout('glitter') }).state;
  s = change(s, { type: 'publish-layout' }).state; assert.equal(s.history.length, 1);
  s = change(s, { type: 'profile', bio: 'New personal writing', discloseLocation: false }).state;
  s = change(s, { type: 'restore-layout', id: s.history[0].id }).state;
  assert.equal(s.draft.theme, 'lavender'); assert.equal(s.layout.theme, 'glitter'); assert.equal(s.bio, 'New personal writing'); assert.equal(s.discloseLocation, false);
  s = change(s, { type: 'publish-layout' }).state;
  const again = change(s, { type: 'publish-layout' }).state; assert.equal(again.history.length, s.history.length);
});

test('friend requests require a later world cycle and Top 8 accepts only connected citizens', () => {
  let s = initialSocial();
  assert.equal(change(s, { type: 'top8', ids: ['aelita'] }).ok, false);
  s = change(s, { type: 'friend', person: 'aelita' }).state;
  assert.equal(change(s, { type: 'tick' }).state.requests.aelita, 'pending');
  s = change(s, { type: 'tick' }, 29).state; assert.equal(s.requests.aelita, 'incoming');
  s = change(s, { type: 'friend', person: 'aelita' }, 29).state;
  s = change(s, { type: 'top8', ids: ['aelita'] }).state; assert.deepEqual(s.top8, ['aelita']);
  s = change(s, { type: 'top8', ids: [] }).state; assert.ok(s.friends.includes('aelita'));
  assert.equal(change(s, { type: 'friend', person: 'forged-citizen' }).ok, false);
});

test('blocking removes featured connections and rejects stale comments and private access', () => {
  let s = accept(initialSocial()); s = change(s, { type: 'top8', ids: ['jeremie'] }).state;
  assert.equal(canSee(s, 'jeremie', 'friends'), true);
  s = change(s, { type: 'block', person: 'jeremie' }).state;
  assert.equal(canSee(s, 'jeremie', 'public'), false); assert.equal(canComment(s, 'profile:jeremie'), false);
  assert.equal(change(s, { type: 'comment', target: 'profile:jeremie', text: 'stale form' }).ok, false);
  assert.deepEqual(s.top8, []); assert.ok(!s.friends.includes('jeremie'));
  assert.equal(canSee(s, 'you', 'private', 'visitor'), false);
});

test('rich posts sanitize content, preserve drafts, and cannot comment on another target reply', () => {
  let s = initialSocial(); s = change(s, { type: 'post', kind: 'blog', title: 'Notes', html: '<script>evil()</script><p><strong>Hello</strong> journal</p>', audience: 'private', draft: true }).state;
  const p = s.posts[0]; assert.ok(!p.html.includes('script')); assert.ok(p.html.includes('<strong>'));
  assert.equal(canComment(s, p.id), false);
  s = change(s, { type: 'post', id: p.id, kind: 'blog', title: p.title, html: p.html, audience: 'private' }).state;
  s = change(s, { type: 'comment', target: p.id, text: 'My note' }).state;
  assert.equal(change(s, { type: 'comment', target: 'hello:jeremie', text: 'Cross reply', parent: s.comments[0].id }).ok, false);
  assert.equal(s.posts.filter(x => x.id === p.id).length, 1);
});

test('albums preserve captions and order while audience changes revoke direct source access', () => {
  let s = initialSocial(); s = change(s, { type: 'album', name: 'Small memories', audience: 'private' }).state;
  const album = s.albums.at(-1);
  s = change(s, { type: 'asset', asset: { id: 'social:test', name: 'a.png', type: 'image/png', size: 100 } }).state;
  s = change(s, { type: 'photo', album: album.id, asset: 'social:test', caption: 'First' }).state;
  s = change(s, { type: 'photo', album: album.id, asset: 'social:test', caption: 'Second' }).state;
  const photo = s.albums.at(-1).photos[1];
  s = change(s, { type: 'photo-move', album: album.id, id: photo.id, direction: 'up' }).state;
  assert.equal(s.albums.at(-1).photos[0].caption, 'Second');
  assert.equal(change(s, { type: 'photo', album: album.id, asset: 'forged', caption: 'No' }).ok, false);
  assert.equal(change(s, { type: 'asset', asset: { id: 'social:evil', name: 'e.svg', type: 'image/svg+xml', size: 5 } }).ok, false);
  assert.equal(change(s, { type: 'asset', asset: { id: 'social:no', name: 'bad', type: 'image/png', size: -1 } }).ok, false);
});

test('groups enforce membership for discussions and require approval for private circles', () => {
  let s = initialSocial(); assert.equal(canComment(s, 'quiet-pages'), false);
  s = change(s, { type: 'group-join', id: 'quiet-pages' }).state;
  assert.ok(s.groups.find(g => g.id === 'quiet-pages').pending.includes('you'));
  assert.equal(canComment(s, 'quiet-pages'), false);
  s = change(s, { type: 'group-join', id: 'photo-club' }).state;
  assert.equal(canComment(s, 'photo-club'), true);
  s = change(s, { type: 'group-leave', id: 'photo-club' }).state;
  assert.equal(change(s, { type: 'comment', target: 'photo-club', text: 'stale form' }).ok, false);
});

test('events separate invitations RSVP and actual attendance with once-only private memories', () => {
  let s = accept(initialSocial());
  s = change(s, { type: 'event', title: 'A little evening', location: 'Home gathering', cycle: 29, audience: 'friends', invited: ['jeremie', 'forged'] }).state;
  const e = s.events[0]; assert.deepEqual(e.invited, ['jeremie']);
  assert.equal(change(s, { type: 'attend', id: e.id }, 28).ok, false);
  assert.deepEqual(s.events[0].attendance, []);
  s = change(s, { type: 'tick' }, 29).state; assert.equal(s.events[0].rsvp.jeremie, 'going');
  s = change(s, { type: 'attend', id: e.id }, 29).state;
  assert.deepEqual(s.events[0].attendance, ['you', 'jeremie']);
  assert.equal(s.albums.at(-1).photos.length, 0); assert.equal(s.albums.at(-1).audience, 'private');
  assert.equal(change(s, { type: 'attend', id: e.id }, 30).ok, false);
  assert.deepEqual(restoreSocial(JSON.parse(JSON.stringify(s))).memories, s.memories);
});

test('meaningful conversation is scoped once and does not generate arbitrary repeated reactions', () => {
  let s = accept(initialSocial());
  const action = { type: 'conversation', person: 'jeremie', text: 'I enjoyed organizing my journal today.' };
  s = change(s, action).state; assert.equal(s.comments.at(-1).author, 'jeremie');
  assert.equal(change(s, action).ok, false);
  assert.equal(change(s, { ...action, person: 'aelita' }).ok, false);
});

test('malformed saved collections and unknown layouts restore to usable records', () => {
  const raw = { ...initialSocial(), layout: { modules: [null, { kind: 'script' }] }, albums: [null, { id: 'a', author: 'you', photos: null }], groups: [null], events: [null], history: [null], templates: [null], comments: [null], assets: [null], notifications: [null], friends: ['aelita', '__proto__'], top8: ['jeremie'], requestCycles: null };
  const s = restoreSocial(raw);
  assert.deepEqual(s.friends, ['aelita']); assert.deepEqual(s.top8, []); assert.deepEqual(s.history, []); assert.deepEqual(s.albums[0].photos, []);
});

test('playlist order and consented tags persist without creating attendance or relationship points', () => {
  let s = accept(initialSocial());
  s = change(s, { type: 'playlist', ids: ['builtin:starlight', 'builtin:stillwater'] }).state;
  assert.equal(s.playlist[0], 'builtin:starlight');
  assert.equal(change(s, { type: 'playlist', ids: ['javascript:evil'] }).ok, false);
  s = change(s, { type: 'album', name: 'My album', audience: 'private' }).state;
  const a = s.albums.at(-1);
  s = change(s, { type: 'asset', asset: { id: 'social:tag-test', name: 'Image', type: 'image/png', size: 80 } }).state;
  s = change(s, { type: 'photo', album: a.id, asset: 'social:tag-test', caption: 'A picture' }).state;
  const id = s.albums.at(-1).photos[0].id;
  s = change(s, { type: 'photo-tag', id, person: 'jeremie' }).state;
  assert.deepEqual(s.albums.at(-1).photos[0].tags, []);
  s = change(s, { type: 'tick' }, 29).state;
  assert.deepEqual(s.albums.at(-1).photos[0].tags, ['jeremie']);
  assert.equal(s.events.length, 0);
  assert.deepEqual(restoreSocial(s).albums.at(-1).photos[0].tags, ['jeremie']);
});

test('original profile music is a real PCM WAV asset', async () => {
  const { originalTrack } = await import('../src/apps/social/socialMedia.ts');
  const blob = originalTrack(); const bytes = await blob.arrayBuffer(); const view = new DataView(bytes);
  assert.equal(blob.type, 'audio/wav'); assert.equal(new TextDecoder().decode(bytes.slice(0, 4)), 'RIFF');
  assert.equal(view.getUint32(24, true), 16000); assert.equal(view.getUint32(40, true), 16000 * 8 * 2);
});

test('MAI.SPACE and phone share drafts read state and block enforcement', async () => {
  const values = new Map(); Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,v), removeItem: k => values.delete(k) } });
  globalThis.window = { localStorage: globalThis.localStorage };
  const { registerCommunicationsAuthority } = await import('../src/integration/communicationsAccess.ts');
  const player = { maiSpaceWorld: { blocked: [] } };
  registerCommunicationsAuthority(() => ({ player, identity: {}, isLoggedIn: true }));
  const { useCommsStore: comms } = await import('../src/store/useCommsStore.ts?social-shared=first');
  assert.equal(comms.getState().ensurePersonalThread('Mara'), true);
  comms.getState().setPhoneDraft('Mara', 'A shared draft');
  assert.equal(comms.getState().phoneDrafts.Mara, 'A shared draft');
  assert.equal(comms.getState().sendPhoneMessage('Mara', 'Hello from my page', 'You', 'mai.space'), true);
  comms.getState().sendPhoneMessage('Mara', 'A supported reply', 'Mara', 'mai.space');
  assert.equal(comms.getState().phoneThreads.Mara[0].source, 'mai.space');
  comms.getState().markPhoneThreadRead('Mara'); assert.equal(comms.getState().phoneReadCounts.Mara, 2);
  player.maiSpaceWorld.blocked.push('mara');
  assert.equal(comms.getState().sendPhoneMessage('Mara', 'stale open composer'), false);
  const { useCommsStore: restored } = await import('../src/store/useCommsStore.ts?social-shared=reload');
  assert.equal(restored.getState().phoneThreads.Mara.length, 2); assert.equal(restored.getState().phoneReadCounts.Mara, 2);
  assert.equal(restored.getState().phoneDrafts.Mara, 'A shared draft');
});

test('social progress survives OS hydration and welcome money cannot repeat after unfriend', async () => {
  const values = new Map(); Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: k => values.delete(k) } });
  const { useOSStore: store } = await import('../src/store/useOSStore.ts?social-test=first');
  const before = store.getState().gameplay.player;
  assert.equal(store.getState().acceptMaiSpaceFriend('jeremie').ok, true);
  const earned = store.getState().gameplay.player;
  assert.equal(earned.credits, before.credits + 100);
  store.getState().socialAction({ type: 'unfriend', person: 'jeremie' });
  store.getState().socialAction({ type: 'friend', person: 'jeremie' });
  store.setState(s => ({ gameplay: { ...s.gameplay, timeCycleCount: (s.gameplay.timeCycleCount || 0) + 1 } })); store.getState().socialAction({ type: 'tick' });
  store.getState().acceptMaiSpaceFriend('jeremie');
  for (let i = 0; i < 4; i++) store.getState().postMaiSpaceBulletin(`An ordinary day ${i}`);
  assert.equal(store.getState().gameplay.player.credits, earned.credits);
  assert.equal(store.getState().gameplay.player.xp, earned.xp);
  const { useOSStore: reloaded } = await import('../src/store/useOSStore.ts?social-test=reload');
  assert.equal(reloaded.getState().gameplay.player.maiSpaceWorld.posts.filter(p => p.author === 'you' && p.kind === 'bulletin').length, 4);
  assert.ok(reloaded.getState().gameplay.player.maiSpaceProfile.acceptedFriends.includes('jeremie'));
});


test('shared albums and calendars recheck membership and exclude nonmember invitations', () => {
  let s = initialSocial({ acceptedFriends: ['jeremie', 'aelita'] });
  assert.equal(change(s, { type: 'group-album', id: 'photo-club' }).ok, false);
  s = change(s, { type: 'group-join', id: 'photo-club' }).state;
  s = change(s, { type: 'group-album', id: 'photo-club' }).state;
  const album = s.albums.at(-1);
  assert.equal(canSeeRecord(s, album), true);
  assert.equal(canSeeRecord(s, album, 'public'), false);
  s = change(s, { type: 'event', title: 'Circle meeting', location: 'Photo Circle online room', cycle: 29, groupId: 'photo-club', invited: ['jeremie', 'aelita'] }).state;
  const event = s.events.at(-1);
  assert.deepEqual(event.invited, ['aelita']);
  const restored = restoreSocial(JSON.parse(JSON.stringify(s)));
  assert.equal(canSeeRecord(restored, restored.albums.at(-1)), true);
  s = change(restored, { type: 'group-leave', id: 'photo-club' }).state;
  assert.equal(canSeeRecord(s, album), false);
  assert.equal(change(s, { type: 'album-audience', id: album.id, audience: 'public' }).ok, false);
  assert.equal(change(s, { type: 'rsvp', id: event.id, value: 'going' }).ok, false);
  assert.equal(change(s, { type: 'attend', id: event.id }, 30).ok, false);
});

test('blog attachments preserve only known image references across save hydration', () => {
  let s = initialSocial();
  s = change(s, { type: 'asset', asset: { id: 'social:photo-1', name: 'picture.png', type: 'image/png', size: 100 } }).state;
  s = change(s, { type: 'post', kind: 'blog', html: '<p>My illustrated journal.</p>', audience: 'friends', media: ['social:photo-1', 'social:unknown', 'builtin:stillwater'] }).state;
  assert.deepEqual(s.posts[0].media, ['social:photo-1']);
  const restored = restoreSocial(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(restored.posts[0].media, ['social:photo-1']);
  assert.equal(canSee(restored, 'you', restored.posts[0].audience, 'public'), false);
});
