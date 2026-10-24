import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context);
    } catch (error) {
      if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error;
      return next(`${specifier}.ts`, context);
    }
  }
});

const {
  makeLayout,
  normalizeLayout,
  initialSocial,
  restoreSocial,
  changeSocial,
  BADGE_IDS,
  KINDS
} = await import('../src/apps/social/socialModel.ts');

const {
  NPC_PERSONAS,
  getCommentForPost,
  processNpcReactivity,
  handleDirectGuestbookSign
} = await import('../src/apps/social/npcReactivity.ts');

test('MAI-SPACE-001: Custom widgets schema & layout normalization', () => {
  assert.ok(KINDS.includes('widget'), 'KINDS must include "widget"');
  assert.equal(BADGE_IDS.length, 6, 'Must define 6 authentic 88x31 badge stamps');

  // Test normalizing a layout containing a widget module
  const raw = {
    theme: 'lavender',
    modules: [
      {
        id: 'module-0',
        kind: 'widget',
        x: 24,
        y: 24,
        w: 420,
        h: 220,
        widget: {
          widgetKind: 'badges',
          badges: ['versenet-800x600', 'miraverse-valid', 'invalid-badge-id']
        }
      },
      {
        id: 'module-1',
        kind: 'widget',
        x: 460,
        y: 24,
        w: 420,
        h: 150,
        widget: {
          widgetKind: 'marquee',
          marqueeText: 'Welcome to my cyber corner! ✦'
        }
      },
      {
        id: 'module-2',
        kind: 'widget',
        x: 24,
        y: 260,
        w: 300,
        h: 120,
        widget: {
          widgetKind: 'counter',
          counterStyle: 'led'
        }
      }
    ]
  };

  const normalized = normalizeLayout(raw);
  assert.equal(normalized.modules.length, 3);

  // Badges widget normalization
  const w0 = normalized.modules[0].widget;
  assert.equal(w0.widgetKind, 'badges');
  assert.deepEqual(w0.badges, ['versenet-800x600', 'miraverse-valid']);

  // Marquee widget normalization
  const w1 = normalized.modules[1].widget;
  assert.equal(w1.widgetKind, 'marquee');
  assert.equal(w1.marqueeText, 'Welcome to my cyber corner! ✦');

  // Hit counter widget normalization
  const w2 = normalized.modules[2].widget;
  assert.equal(w2.widgetKind, 'counter');
  assert.equal(w2.counterStyle, 'led');
});

test('MAI-SPACE-002: View count increment and comment pinning', () => {
  const base = initialSocial();
  assert.equal(base.viewCount, 42);
  assert.deepEqual(base.pinnedCommentIds, []);

  // Increment view count
  const res1 = changeSocial(base, { type: 'record-view' }, 0, 'act-1');
  assert.equal(res1.ok, true);
  assert.equal(res1.state.viewCount, 43);

  // Pin a comment
  const commentId = 'test-comment-123';
  const res2 = changeSocial(res1.state, { type: 'pin-comment', id: commentId }, 0, 'act-2');
  assert.equal(res2.ok, true);
  assert.deepEqual(res2.state.pinnedCommentIds, [commentId]);

  // Unpin the same comment
  const res3 = changeSocial(res2.state, { type: 'pin-comment', id: commentId }, 0, 'act-3');
  assert.equal(res3.ok, true);
  assert.deepEqual(res3.state.pinnedCommentIds, []);

  // Verification of persistence across restoreSocial
  const restored = restoreSocial({
    ...base,
    viewCount: 158,
    pinnedCommentIds: ['pinned-1', 'pinned-2']
  });
  assert.equal(restored.viewCount, 158);
  assert.deepEqual(restored.pinnedCommentIds, ['pinned-1', 'pinned-2']);
});

test('MAI-SPACE-003: NPC Reactivity topic matching & dialogue generation', () => {
  const jeremie = NPC_PERSONAS.jeremie;
  assert.ok(jeremie);

  // Tech-focused post matches Jeremie
  const techPost = {
    id: 'post-tech-1',
    author: 'you',
    kind: 'blog',
    title: 'Building a new circuit board and terminal logic',
    html: '<p>Spent the evening assembling a new bus architecture for the system.</p>',
    audience: 'public',
    cycle: 1,
    draft: false,
    likes: []
  };

  const jeremieReaction = getCommentForPost(jeremie, techPost);
  assert.equal(jeremieReaction.matched, true);
  assert.match(jeremieReaction.comment, /\^_\^|logic|architecture|signal|notebook|problem|breakdown/i);

  // Music/Art focused post matches Aelita
  const aelita = NPC_PERSONAS.aelita;
  assert.ok(aelita);
  const musicPost = {
    id: 'post-music-1',
    author: 'you',
    kind: 'blog',
    title: 'Soft colors and piano loops',
    html: '<p>A quiet melody playing while looking at the stars.</p>',
    audience: 'public',
    cycle: 1,
    draft: false,
    likes: []
  };

  const aelitaReaction = getCommentForPost(aelita, musicPost);
  assert.equal(aelitaReaction.matched, true);
  assert.match(aelitaReaction.comment, /✿|♡|colors|melody|gentle|memory|peaceful/i);
});

test('MAI-SPACE-004: Cycle tick reactivity dispatches NPC comments & notifications', () => {
  const world = initialSocial();
  world.friends = ['jeremie', 'aelita'];
  world.top8 = ['jeremie'];

  // Add a fresh public tech blog post by player
  const post = {
    id: 'player-blog-tech',
    author: 'you',
    kind: 'blog',
    title: 'My custom terminal and circuit diagram',
    html: '<p>Writing low-level code today.</p>',
    audience: 'public',
    cycle: 2,
    draft: false,
    likes: []
  };
  world.posts.push(post);

  // Advance time cycle to cycle 2
  const { modified, newNotificationCount } = processNpcReactivity(world, 2);
  assert.equal(modified, true);
  assert.ok(newNotificationCount > 0);

  // Check that Jeremie commented on the post
  const comment = world.comments.find(c => c.target === 'player-blog-tech' && c.author === 'jeremie');
  assert.ok(comment, 'Jeremie should have commented on player tech post');
  assert.equal(comment.cycle, 2);

  // Check that Jeremie liked the post
  assert.ok(post.likes.includes('jeremie'), 'Post likes should include Jeremie');

  // Check notification was queued for player
  const note = world.notifications.find(n => n.destination === 'Blog:player-blog-tech');
  assert.ok(note, 'Notification should be created for blog comment');
  assert.match(note.text, /Jeremie Belpois commented/);
});

test('MAI-SPACE-005: Direct guestbook signing generates immediate NPC response', () => {
  const world = initialSocial();
  world.friends = ['aelita'];

  handleDirectGuestbookSign(world, 'aelita', 'Hi Aelita, your profile looks so magical!', 3);

  const reply = world.comments.find(c => c.target === 'profile:aelita' && c.author === 'aelita');
  assert.ok(reply, 'Aelita should leave an authentic response in guestbook');
  assert.match(reply.text, /✿|♡|kind note|guestbook/);

  const note = world.notifications.find(n => n.destination === 'profile:aelita');
  assert.ok(note, 'Notification should alert player of the reply');
});
